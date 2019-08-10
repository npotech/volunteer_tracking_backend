const { ApolloServer, gql } = require('apollo-server-express')
const { Map } = require('immutable')
const GraphQLDateTime = require('graphql-type-datetime')
const GraphQLJSON = require('graphql-type-json')
// const {inspect} = require('util')


const typeDefs = gql`
  union ID = String
  scalar DateTime
  scalar JSON

  type VolunteerSession {
    event: ID!
    email: String!
    name: String
    attributes: JSON
    timestampsIn: [DateTime]!
    timestampsOut: [DateTime]!
  }

  input CheckinInput {
    event: ID!
    name: String!
    email: String!
    attributes: JSON
    timestamp: DateTime!
  }

  input CheckoutInput {
    event: ID!
    email: String!
    attributes: JSON
    timestamp: DateTime!
  }
  
  type Event {
    id: ID!
    name: String
    date: DateTime
    volunteerSessions: [VolunteerSession!]!
  }

  input EventInput {
    id: ID!
    name: String!
    date: DateTime!
  }

  type Query {
    checkinsByEvent(event: String!): [VolunteerSession!]!
    events(onlyKnown: Boolean = true): [Event!]
    isUserKnown(email: String!): Boolean!
  }

  type Mutation {
    createEvent(event: EventInput!): Boolean
    createCheckin(checkin: CheckinInput!): Boolean
    createCheckout(checkout: CheckoutInput!): Boolean
  }
`

async function checkinsByEvent(logger, store, eventId) {
  logger.info(`getting checkins for event: ${eventId}`)
  let checkins = (await store.range(`event-check-in/${eventId}/check-in/`))
    .toJS()
    .reduce((checkins, checkin) => {
      const email = checkin.email
      let existingCheckin

      if (checkins.has(email)) {
        existingCheckin = checkins.get(email)
      } else {
        existingCheckin = {
          event: checkin.event,
          name: checkin.name,
          email: checkin.email,
          attributes: checkin.attributes,
          timestampsIn: [],
          timestampsOut: [],
        }
      }

      if (checkin.checkinType == 'in') {
        existingCheckin.timestampsIn.push(checkin.timestamp)
      } else if (checkin.checkinType == 'out') {
        existingCheckin.timestampsOut.push(checkin.timestamp)
      }

      return checkins.set(email, existingCheckin)
    }, Map())
    .valueSeq()
    .toJS()
  return checkins || []
}

const resolvers = (logger, store) => ({
  Query: {
    checkinsByEvent: async (_, {event}) => {
      logger.info('Event:', event)
      return await checkinsByEvent(logger, store, event)
    },
    events: async (_, {onlyKnown}) => {
      let events = (await store.range('event/'))
        .toJS()
        .filter(event => !onlyKnown || (!!event.name && !!event.date))
        .map(async (event) => ({
          ...event,
          volunteerSessions: (await checkinsByEvent(logger, store, event.id))
        }))
      return events
    },
    isUserKnown: async (_, {email}) => {
      return null !== await store.get(`user/${email}`)
    }
  },
  Mutation: {
    createEvent: (_, {event: eventArg}) => {
      const id = eventArg.id
      const event = Map(eventArg)
      store.set(`event/${id}`, event)
      return true
    },
    createCheckin: (_, {checkin: checkinArg}) => {
      const {
        event: eventId,
        email,
        timestamp,
      } = checkinArg
      checkinArg.checkinType = 'in'
      const checkin = Map(checkinArg)

      store.setIfNotExists(`user/${email}`, Map())
      store.set(`event-check-in/${eventId}/check-in/${email}/in/${timestamp}`, checkin)
      store.setIfNotExists(`event/${eventId}`, Map({id: eventId}))
      return true
    },
    createCheckout: (_, {checkout: checkoutArg}) => {
      const {
        event: eventId,
        email,
        timestamp
      } = checkoutArg
      checkoutArg.checkinType = 'out'
      const checkout = Map(checkoutArg)

      store.setIfNotExists(`user/${email}`, Map())
      store.set(`event-check-in/${eventId}/check-in/${email}/out/${timestamp}`, checkout)
      return true
    }
  },
  // custom types
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON,
})

const GraphQL = (app, logger, store) => {
  let server = new ApolloServer({
    typeDefs,
    resolvers: resolvers(logger, store)
  })
  server.applyMiddleware({ app })
}

exports.GraphQL = GraphQL

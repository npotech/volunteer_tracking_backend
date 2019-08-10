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
    timestamp_in: DateTime
    timestamp_out: DateTime
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
    name: String!
    date: DateTime!
    volunteer_sessions: [VolunteerSession!]!
  }

  input EventInput {
    id: ID!
    name: String!
    date: DateTime!
  }

  type Query {
    checkinsByEvent(event: String!): [VolunteerSession!]!
    events: [Event!]
  }

  type Mutation {
    createEvent(event: EventInput!): Boolean
    createCheckin(checkin: CheckinInput!): Boolean
    createCheckout(checkout: CheckoutInput!): Boolean
  }
`

const resolvers = (logger, store) => ({
  Query: {
    checkinsByEvent: (event) => {
      logger.info(`getting checkins for event: ${event}`)
      return [{
        id: 'TODO',
        name: 'Test Checkin'
      }]
    },
    events: async () => {
      let x = (await store.range('ev/')).toJS().map(event => ({
        ...event,
        // TODO implement getting volunteer sessions
        volunteer_sessions: []
      }))
      return x
    }
  },
  Mutation: {
    createEvent: (_, {event: event_arg}) => {
      const id = event_arg.id
      const event = Map(event_arg)
      store.set(`ev/${id}`, event)
      return true
    },
    createCheckin: (_, {checkin: checkin_arg}) => {
      const {
        event: event_id,
        email,
        timestamp
      } = checkin_arg
      const checkin = Map(checkin_arg)

      store.set(`ec/${event_id}/c/${email}/in/${timestamp}`, checkin)
      return true
    },
    createCheckout: (_, {checkout: checkout_arg}) => {
      const {
        event: event_id,
        email,
        timestamp
      } = checkout_arg
      const checkout = Map(checkout_arg)

      store.set(`ec/${event_id}/c/${email}/out/${timestamp}`, checkout)
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

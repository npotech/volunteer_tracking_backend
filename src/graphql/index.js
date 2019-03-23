const { ApolloServer, gql } = require('apollo-server-express')


const typeDefs = gql`
  union ID = String
  scalar DateTime
  scalar JSON

  type VolunteerSession {
    id: ID!
    event: ID!
    name: String
    email: String!
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
    voulnteer_sessions: [VolunteerSession!]!
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

const resolvers = logger => ({
  Query: {
    checkinsByEvent: (event) => {
      logger.info(`getting checkins for event: ${event}`)
      return [{
        id: 'TODO',
        name: 'Test Checkin'
      }]
    },
    events: () => {
      return [{
        id: 'TODO',
        name: 'Test Event'
      }]
    }
  },
  Mutation: {
    createEvent: () => {
      // TODO
    },
    createCheckin: () => {
      // TODO
    }
  }
})

const GraphQL = (app, logger, redis) => {
  let server = new ApolloServer({
    typeDefs,
    resolvers: resolvers(logger, redis)
  })
  server.applyMiddleware({ app })
}

exports.GraphQL = GraphQL

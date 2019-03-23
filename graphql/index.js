const { ApolloServer, gql } = require('apollo-server-express')


const typeDefs = gql`
type Checkin {
  id: String!
  name: String
}

input CheckinInput {
  id: String!
  name: String
}

type Event {
  id: String!
  name: String
}

input EventInput {
  id: String!
  name: String
}

type Query {
  checkinsByEvent(event: String!): [Checkin]
  events: [Event]
}

type Mutation {
  createEvent(event: EventInput!): Boolean
  createCheckin(checkin: CheckinInput!): Boolean
}
`

const resolvers = (logger, redis) => ({
  Query: {
    checkinsByEvent: event => {
      logger.info(`getting checkins for event: ${event}`)
      return [{
        id: "TODO",
        name: "Test Checkin"
      }]
    },
    events: () => {
      return [{
        id: "TODO",
        name: "Test Event"
      }]
    }
  },
  Mutation: {
    createEvent: event => {
      // TODO
    },
    createCheckin: checkin => {
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

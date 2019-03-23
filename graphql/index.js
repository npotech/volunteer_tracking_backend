const { ApolloServer, gql } = require('apollo-server-express')


const typeDefs = gql`
type Query {
  hello: String
}
`

const resolvers = (logger, redis) => ({
  Query: {
    hello: () => {
      logger.info('Hello world!')
      return 'Hello world!'
    },
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

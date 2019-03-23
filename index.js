const redis = require('redis')
const winston = require('winston')
const expressWinston = require('express-winston')
const express = require('express')
const program = require('commander')
const { GraphQL } = require('./src/graphql')
const { Redis } = require('./src/datastore/redis')
const { Fake } = require('./src/datastore/fake')
const { ListCheckinsByEvent } = require('./src/handlers/listCheckinsByEvent')


// Parse CLI flags
program
  .version('0.1.0')
  .option('-p, --port [port]', 'Port to listen on', '8080')
  .option('-s, --store [store]', 'Datastore to use [redis,fake]', 'redis')
  .parse(process.argv)

// Set up a logger
const loggerOpts = {
  level: 'info',
  format: winston.format.simple(),
  defaultMeta: { service: 'volunteer-tracking-backend' },
  transports: [
    new winston.transports.Console(),
  ]
}
const logger = winston.createLogger(loggerOpts)

// Construct a datastore
let store
switch (program.store) {
  case undefined:
  case 'redis':
    logger.info('using redis datastore')
    let client = redis.createClient()
    client.on("error", err => logger.error(err))
    store = new Redis(client)
    break
  case 'fake':
    logger.info('using fake datastore')
    store = new Fake()
    break
  default:
    throw Error(`datastore '${program.store}' is not supported`)
}
let port = parseInt(program.port)

// Set up request router
const app = express()
app.use(expressWinston.logger(loggerOpts))
app.use(expressWinston.errorLogger(loggerOpts))
app.get('/events/:eventUID/checkins', ListCheckinsByEvent(store))

app.get('/healthz', (req, res) => {
  res.send('ok')
})

GraphQL(app, logger, store)

// Listen forever
app.listen(port, () => {
  logger.info(`listing on port ${port}`)
})

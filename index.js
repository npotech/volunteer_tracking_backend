const redis = require('redis')
const winston = require('winston')
const expressWinston = require('express-winston')
const express = require('express')
const { GraphQL } = require('./graphql')


const loggerOpts = {
  level: 'info',
  format: winston.format.simple(),
  defaultMeta: { service: 'volunteer-tracking-backend' },
  transports: [
    new winston.transports.Console(),
  ]
}
const logger = winston.createLogger(loggerOpts)

const redisClient = redis.createClient()
redisClient.on("error", err => logger.error(err))

const app = express()
app.use(expressWinston.logger(loggerOpts))
app.use(expressWinston.errorLogger(loggerOpts))

app.get('/healthz', (req, res) => {
  res.send('ok')
})

GraphQL(app, logger, redisClient)

app.listen(8080, () => {
  logger.info("Listing on port 8080")
})

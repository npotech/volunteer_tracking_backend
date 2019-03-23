const { ListCheckinsByEvent } = require('../../src/handlers/listCheckinsByEvent')
const { Fake } = require('../../src/datastore/fake')
const express = require('express')
const request = require('supertest')
const { fromJS } = require('immutable')

describe('the listCheckinsByEvent request handler', () => {
  let eventUID = 'foo'
  let server, store
  beforeEach(done => {
    let app = express()
    store = new Fake()
    app.get('/events/:eventUID/checkins', ListCheckinsByEvent(store))
    server = app.listen(0, done)
  })

  afterEach(() => {
    server.close()
  })

  context('given two checkins', () => {
    beforeEach(async () => {
      await store.set(`e/${eventUID}/foo`, fromJS({ foo: 'bar' }))
      await store.set(`e/${eventUID}/bar`, fromJS({ baz: 'another' }))
    })

    it('should return the checkins as csv', () => {   
      return request(server)
        .get(`/events/${eventUID}/checkins`)
        .expect('Content-Type', 'text/csv; charset=utf-8')
        .expect(200, 'bar\n\n')
    })
  })

  context('given no checkins', () => {
    it('should return an empty string', () => {
      return request(server)
        .get(`/events/${eventUID}/checkins`)
        .expect('Content-Type', 'text/csv; charset=utf-8')
        .expect(200, '')
    })
  })
})

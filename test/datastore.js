const { Map, List } = require('immutable')
const { expect } = require('chai')
const { Fake } = require('../src/datastore/fake')
const { Redis } = require('../src/datastore/redis')
const redis = require('redis')

const testDatastore = (name, constructor) =>
  describe(`${name} datastore`, () => {
    it('should support getting, setting, and deleting keys', () => {
      let store = constructor()
      let key = 'foo'
      let val = new Map({ bar: 'baz' })

      return store.get(key)
        .then(val => {
          // Prove an unset key returns undefined
          expect(val).to.be.null
        })
        .then(() => store.set(key, val))
        .then(val => {
          // Prove keys can be set and retrieved
          expect(val).to.deep.equal(val)
        })
        .then(() => store.delete(key))
        .then(() => store.get(key))
        .then(val => {
          // Prove deleting a key actually deletes it
          expect(val).to.be.null
        })
    })

    it('should support key prefix range queries', () => {
      let store = constructor()
      let fooValue = new Map({ 'fooValue': true })
      let fooBarValue = new Map({ 'foobarValue': true })
      let bazBarValue = new Map({ 'bazbarValue': true })

      return store.set('foo', fooValue)
        .then(() => store.set('foobar', fooBarValue))
        .then(() => store.set('bazbar', bazBarValue))
        .then(() => store.range('foo'))
        .then(vals => {
          // It doesn't return the value of bazbar because
          // it doesn't share the "foo" prefix
          expect(vals).to.deep.equal(
            new List([fooValue, fooBarValue])
          )
        })
    })
  })

// testDatastore('fake', () => new Fake())

if (process.env.REDIS_INTEGRATION) {
  let client = redis.createClient()
  let test = testDatastore('redis', () => new Redis(client))
  test.afterAll = () => client.quit()
}

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
          expect(val).to.be.undefined
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
          expect(val).to.be.undefined
        })
    })

    it('should support key prefix range queries', () => {
      let store = constructor()
      let val = new Map({ 'value': true })

      return store.set('foo', val)
        .then(() => store.set('foobar', val))
        .then(() => store.set('bazbar', val))
        .then(() => store.range('foo'))
        .then(vals => {
          // It doesn't return the value of bazbar because
          // it doesn't share the "foo" prefix
          expect(vals).to.contain('foo')
          expect(vals).to.contain('foobar')
          expect(vals).to.have.length(2)
        })
        .then(() => store.delete('foo'))
        .then(() => store.delete('foobar'))
        .then(() => store.delete('bazbar'))
    })
  })

testDatastore('fake', () => new Fake())

if (process.env.REDIS_INTEGRATION) {
  let client = redis.createClient()
  let test = testDatastore('redis', () => new Redis(client))
  test.afterAll = () => client.quit()
}

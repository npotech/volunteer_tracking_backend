const { Map, fromJS } = require('immutable')
const { expect } = require('chai')
const { Fake } = require('../src/datastore/fake')
const { Redis } = require('../src/datastore/redis')
const redis = require('redis')

const testDatastore = (name, constructor) =>
  describe(`${name} datastore`, () => {
    it('should support getting, setting, and deleting keys', async () => {
      let store = constructor()
      let key = 'foo'
      let val = new Map({ bar: 'baz' })

      // Prove an unset key returns null
      let actual = await store.get(key)
      expect(actual).to.be.null

      // Prove keys can be set and retrieved
      await store.set(key, val)
      actual = await store.get(key)
      expect(actual).to.deep.equal(val)

      await store.delete(key)
      actual = await store.get(key)
      expect(actual).to.be.null
    })

    context('given three keys', () => {
      let store
      let fooVal = new Map({ 'fooval': true })
      let foobarVal = new Map({ 'foobarval': true })
      let bazbarVal = new Map({ 'bazbarval': true })

      beforeEach(async () => {
        store = constructor()
        await store.set('foo', fooVal)
        await store.set('foobar', foobarVal)
        await store.set('bazbar', bazbarVal)
      })

      afterEach(async () => {
        await store.delete('foo')
        await store.delete('foobar')
        await store.delete('bazbar')
      })

      it('should support key prefix range queries', async () => {
        let results = await store.range('foo')
        expect(results.toJS()).to.deep.equal([ fooVal.toJS(), foobarVal.toJS() ])
      })
  })
})

testDatastore('fake', () => new Fake())

if (process.env.REDIS_INTEGRATION) {
  let client = redis.createClient()
  let test = testDatastore('redis', () => new Redis(client))
  test.afterAll(() => client.quit())
}

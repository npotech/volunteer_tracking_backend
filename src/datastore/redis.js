const { fromJS } = require('immutable')
const { promisify } = require('util')

exports.Redis = class Redis {
  constructor(client) {
    this._client = client
    this._get = promisify(client.get).bind(client)
    this._set = promisify(client.set).bind(client)
    this._setnx = promisify(client.setnx).bind(client)
    this._del = promisify(client.del).bind(client)
    this._scan = promisify(client.scan).bind(client)
  }

  async get(key) { 
    return this._get(key)
      .then(raw => fromJS(JSON.parse(raw)))
  }

  async set(key, value) {
    return this._set(key, JSON.stringify(value.toJS()))
  }

  async setIfNotExists(key, value) {
    return this._setnx(key, JSON.stringify(value.toJS()))
  }
  
  async delete(key) {
    return this._del(key)
  }

  async range(prefix) {
    // TODO this won't get everything; just the first iteration
    const results = []
    let cursor = '0'
    // let result = null

    do {
      let [newCursor, result] = await this._scan(cursor, 'match', `${prefix}*`)
      results.push(...result)
      cursor = newCursor
    } while (cursor !== '0')

    return Promise.all(results.map(key => this.get(key))).then(array => fromJS(array))
  }
}

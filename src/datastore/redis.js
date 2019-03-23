const { fromJS } = require('immutable')
const { promisify } = require('util')

exports.Redis = class Redis {
  constructor(client) {
    this._client = client
    this._get = promisify(client.get).bind(client)
    this._set = promisify(client.set).bind(client)
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
  
  async delete(key) {
    return this._del(key)
  }

  async range(prefix) {
    return this._scan('0', 'match', `${prefix}*`)
      .then(result => Promise.all(
        result[1].map(key => this.get(key))
      ))
      .then(array => fromJS(array))
  }
}

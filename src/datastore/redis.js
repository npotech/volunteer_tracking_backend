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

  get(key) {
    return this._get(key).then(raw => fromJS(JSON.parse(raw)))
  }

  set(key, value) {
    return this._set(key, JSON.stringify(value.toJS()))
  }
  
  delete(key) {
    return this._del(key)
  }

  range(prefix) {
    return this._scan("0", "match", `${prefix}*`).then(val => val[1])
  }
}

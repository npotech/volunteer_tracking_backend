const { Map } = require('immutable')

exports.Fake = class Fake {
  constructor() {
    this._map = new Map()
  }

  get(key) { return this._map.get(key) }
  set(key, value) { this._map = this._map.set(key, value) }
  delete(key) { this._map = this._map.delete(key) }
  range(prefix) { return this._map.filter((_,k) => k.startsWith(prefix)).toList() }
}

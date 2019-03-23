const { Map } = require('immutable')

exports.Fake = class Fake {
  constructor() {
    this._map = new Map()
  }

  async get(key) { return this._map.get(key) }
  async set(key, value) { this._map = this._map.set(key, value) }
  async delete(key) { this._map = this._map.delete(key) }
  async range(prefix) { return this._map.filter((_, k) => k.startsWith(prefix)).map((_, k) => k).toList().toArray() }
}

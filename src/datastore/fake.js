const { Map } = require('immutable')

exports.Fake = class Fake {
  constructor() {
    this._map = new Map()
  }

  async get(key) {
    const value = this._map.get(key)
    // Return null if undefined, else return value
    return value === undefined ? null : value
  }
  async set(key, value) { this._map = this._map.set(key, value) }
  async setIfNotExists(key, value) {
    if (!this._map.has(key)) {
      this._map = this._map.set(key, value)
    }
  }
  async delete(key) { this._map = this._map.delete(key) }
  async range(prefix) { return this._map.filter((_, k) => k.startsWith(prefix)).toList() }
}

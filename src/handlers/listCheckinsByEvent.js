const { stringify } = require('csv')
const { promisify } = require('util')

const stringifyPromise = promisify(stringify)

const ListCheckinsByEvent = store => async (req, res) => {
  let event = req.params.eventUID
  let checkins = await store.range(`e/${event}`)

  // TODO(jordan): Authorization logic

  let raw = await stringifyPromise(checkins.toList().toJS())
  res.set('Content-Type', 'text/csv')
  res.end(raw)
}
exports.ListCheckinsByEvent = ListCheckinsByEvent

import events from './events'

const NS = '__STORE.'
const stored = {}

const store = {
  watch (k, cb) {
    events.on(NS + k, cb)
  },
  watchOnce (k, cb) {
    events.once(NS + k, cb)
  },
  unwatch (k, cb) {
    events.off(NS + k, cb)
  },
  get (k) {
    return stored[k]
  },
  set (k, val) {
    stored[k] = val
    events.emit(NS + k, val)
  }
}

export default store

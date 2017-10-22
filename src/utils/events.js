const observers = {}
const events = {
  on,
  once,
  off,
  emit
}

function on (name, cb) {
  (observers[name] || (observers[name] = [])).push(cb)
  return this
}

function once (name, fn) {
  function listener (...args) {
    off(name, listener)
    fn(...args)
  }
  listener._ = fn
  return on(name, listener)
}

function off (name, cb) {
  const listeners = observers[name]
  const aliveListeners = []

  if (listeners && cb) {
    for (let i = 0; i < listeners.length; i++) {
      if (listeners[i] !== cb && listeners[i]._ !== cb) {
        aliveListeners.push(listeners[i])
      }
    }
  }

  aliveListeners.length
    ? (observers[name] = aliveListeners)
    : delete observers[name]
}

function emit (name, ...data) {
  const cb = data.length > 1 ? data.pop() : null
  const listeners = (observers[name] || []).slice()
  if (cb) {
    const promises = []
    for (let i = 0; i < listeners.length; i++) {
      promises.push(listeners[i](...data))
    }
    Promise.all(promises).then(cb)
  } else {
    for (let i = 0; i < listeners.length; i++) {
      listeners[i](...data)
    }
  }
}

export default events

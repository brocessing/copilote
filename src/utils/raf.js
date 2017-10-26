import config from 'config'
import Stats from 'stats.js'

let stats
if (config.fpsCounter) {
  stats = new Stats()
  stats.showPanel(0)
  document.body.appendChild(stats.dom)
}

const observers = []
let raf = null
let now = Date.now()
let lastDate = now

function fpsLimiter (fps, fn) {
  let lastDate = now
  let interval = 1000 / fps
  let delta = -1
  return function () {
    delta = (delta === -1) ? interval : now - lastDate
    if (delta >= interval) {
      fn(delta)
      lastDate = now - (delta % interval)
    }
  }
}

function run () {
  if (config.fpsCounter) stats.begin()
  now = Date.now()
  const dt = now - lastDate
  for (var i = 0; i < observers.length; i++) observers[i](dt)
  lastDate = now
  if (config.fpsCounter) stats.end()
  raf = window.requestAnimationFrame(run)
}

function start () {
  if (raf) return
  lastDate = Date.now()
  run()
}

function stop () {
  if (!raf) return
  window.cancelAnimationFrame(raf)
  raf = null
}

function add (fn) {
  if (!~observers.indexOf(fn)) {
    observers.push(fn)
    start()
  }
}

function remove (fn) {
  var index = observers.indexOf(fn)
  if (~index) {
    observers.splice(index, 1)
    if (observers.length === 0) stop()
  }
}

export default {
  start: start,
  stop: stop,
  add: add,
  remove: remove,
  fpsLimiter: fpsLimiter
}

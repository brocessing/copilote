/**
 * Speech API wrapper
 */

import mitt from 'mitt'

const emitter = mitt()

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const languages = {
  'fr': 'fr-FR',
  'en': 'en-EN'
}

const DEBUG = true
const REBOOTDELAY = 10000
// const DEFAULT_LANGUAGE = 'fr'

let recognizing = false
let pending = false
let keepTimer = null

// Directly Instanciate the speech API for convenience.
let recognition = isAvailable() ? new SpeechRecognition() : null

if (recognition) {
  recognition.continuous = true
  recognition.interimResults = true
  recognition.maxAlternatives = 10

  recognition.onstart = function (e) { emitter.emit('start', e) }
  recognition.onerror = function (e) { emitter.emit('error', e) }
  recognition.onresult = function (e) { emitter.emit('result', e) }
  recognition.onend = function (e) { emitter.emit('end', e) }
  emitter.on('result', onResult)
  emitter.on('error', (e) => {
    debug('ERROR', e)
  })
  emitter.on('end', (e) => {
    window.clearTimeout(keepTimer)
    if (recognizing && !pending) {
      debug('reboot from end')
      recognizing = false
      start()
    }
    debug('END', e)
  })
}

// debugger
function debug (...content) {
  DEBUG && console.log('[Speech]', ...content)
}

// Test the Speech API availability
function isAvailable () {
  return (
    'webkitSpeechRecognition' in window ||
    'SpeechRecognition' in window
  )
}

function onResult (event) {
  if (event.results.length > 8) restart()
}

function restart () {
  debug('reboot')
  return new Promise((resolve) => { stop().then(start).then(resolve) })
}

function keepAlive () {
  if (recognizing) {
    restart()
  }
  keepTimer = null
}

// Start the recognition.
// You can add a parameter to quickly set a lang
// Return a promise for convenience but you can also use an emitter
function start (lang) {
  debug('start')
  return new Promise((resolve, reject) => {
    if (!recognition) return reject(new Error('Web Speech API unavailable.'))
    if (recognizing || pending === 'start') return reject(new Error('Speech already started.'))

    if (lang) setLang(lang)


    function onStart () {
      emitter.off('error', onError)
      emitter.off('start', onStart)
      recognizing = true
      pending = false
      window.clearTimeout(keepTimer)
      keepTimer = window.setTimeout(keepAlive, REBOOTDELAY)
      return resolve()
    }

    function onError (event) {
      emitter.off('error', onError)
      emitter.off('start', onStart)
      recognizing = false
      pending = false
      return reject(event)
    }

    pending = 'start'
    emitter.on('start', onStart)
    emitter.on('error', onError)
    recognition.start()
  })
}

// Start the recognition.
// Return a promise for convenience but you can also use an emitter
function stop () {
  debug('stop')
  return new Promise((resolve, reject) => {
    if (!recognition) return reject(new Error('Web Speech API unavailable.'))
    if (!recognizing || pending === 'stop') return reject(new Error('Speech already stopped.'))
    function onEnd () {
      emitter.off('end', onEnd)
      recognizing = false
      pending = null
      window.clearTimeout(keepTimer)
      keepTimer = null
      return resolve()
    }
    pending = 'stop'
    emitter.on('end', onEnd)
    recognition.stop()
  })
}

// Change the language used. (from the languages list)
function setLang (lang) {
  if (!lang || !languages[lang] || !recognition) return
  recognition.lang = languages[lang]
}

// Getters for safety
function isRecognizing () { return !!recognizing }
function getInstance () { return recognition }

export default {
  isAvailable,
  isRecognizing,
  start,
  stop,
  setLang,
  getInstance,
  on: emitter.on,
  off: emitter.off
}

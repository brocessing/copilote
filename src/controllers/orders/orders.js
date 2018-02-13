import speech from 'controllers/speech/speech'
import french from './lang.fr'
import english from './lang.en'
import mitt from 'mitt'

import config from 'config'

const languages = {
  'fr': french,
  'en': english
}

const emitter = mitt()
const DEBUG = config.speechDebug
let dom, logevent
let listening = false

if (DEBUG) {
  dom = document.createElement('div')
  dom.style.zIndex = '1000'
  dom.style.position = 'absolute'
  dom.style.top = '45px'
  dom.style.left = '0'
  dom.style.fontSize = '10px'
  dom.style.lineHeight = '100%'
  dom.style.margin = '0'
  dom.style.padding = '10px'
  dom.style.color = 'white'
  dom.style.background = 'rgba(0, 0, 0, 0.8)'
  dom.style.pointerEvents = 'none'
  logevent = document.createElement('pre')
  dom.appendChild(logevent)
  document.body.appendChild(dom)
}

let currentLanguage = languages['fr']
let cachedMatches = []
let buffer = []

function setLang (lang = 'fr') {
  currentLanguage = languages[lang]
}

function listen () {
  if (listening) return
  speech.on('result', onResult)
  speech.on('end', flushBuffer)
  listening = true
}

function unlisten () {
  if (!listening) return
  speech.off('result', onResult)
  speech.off('end', flushBuffer)
  listening = false
}

function flushBuffer () {
  buffer.forEach(item => {
    if (item.dom) item.dom.parentNode.removeChild(item.dom)
  })
  buffer = []
}

function onResult (event) {
  if (!listening) return
  for (let i = event.resultIndex; i < event.results.length; i++) {
    processResult(i, event.results[i], (i + 1) >= event.results.length)
  }
}

function processResult (index, result, last) {
  if (!buffer[index]) {
    buffer[index] = { value: '', matches: [], dom: null, final: false }
    if (DEBUG) {
      buffer[index].dom = document.createElement('pre')
      buffer[index].dom.style.color = 'rgba(255, 255, 255, 0.8)'
      dom.appendChild(buffer[index].dom)
    }
  }
  const buf = buffer[index]
  if (result.isFinal) {
    buf.value = result[0].transcript
    buf.final = true
    analyze(buf.value, true)
    cachedMatches = []
  } else {
    buf.value = result[0].transcript
    if (last) {
      const prev = buffer[index - 1] && !buffer[index - 1].final
        ? buffer[index - 1].value
        : ''
      analyze(prev + buf.value)
    }
  }
  if (DEBUG) {
    buf.dom.innerHTML = (
      'index: ' + index + '\n' +
      'value: ' + buf.value + '\n' +
      'final:' + buf.final
    )
  }
}

function analyze (newStr, finale = false) {
  newStr = newStr.toLowerCase()

  currentLanguage.replacers.forEach(obj => {
    newStr = newStr.replace(obj.reg, obj.to)
  })

  cachedMatches.forEach(match => {
    newStr = newStr.replace(match, ' ')
  })

  for (let i = 0; i < currentLanguage.max; i++) {
    for (let k in currentLanguage.orders) {
      if (i >= currentLanguage.maxs[k]) continue
      const regex = currentLanguage.orders[k][i].regex
      const opts = currentLanguage.orders[k][i].opts
      if (!opts.continuous && !finale) continue
      if (opts.capture) {
        let match = regex.exec(newStr)
        while (match) {
          newStr = newStr.replace(match[1], ' ')
          cachedMatches.push(match[1])
          match.shift()
          const out = {
            type: k,
            transcript: match[0].trim(),
            capture: match,
            finale: !!finale
          }
          emitter.emit(':all', out)
          emitter.emit(k, out)
          if (DEBUG) logevent.innerHTML += k + '\n'
          match = regex.exec(newStr)
        }
      } else {
        const res = newStr.match(regex)
        if (!res) continue
        res.forEach(match => {
          newStr = newStr.replace(match, ' ')
          cachedMatches.push(match)
          const out = {
            type: k,
            transcript: match.trim(),
            capture: [match],
            finale: !!finale
          }
          if (DEBUG) logevent.innerHTML += k + '\n'
          emitter.emit(':all', out)
          emitter.emit(k, out)
        })
      }
    }
  }
}

export default { listen, unlisten, on: emitter.on, off: emitter.off, setLang }

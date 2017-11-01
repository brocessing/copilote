import speech from 'controllers/speech/speech'
import french from './lang.fr'
import mitt from 'mitt'

import config from 'config'

const emitter = mitt()
const DEBUG = config.speechDebug
let dom, logevent

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
  dom.style.background = 'rgba(0, 0, 0, 0.5)'
  dom.style.pointerEvents = 'none'
  logevent = document.createElement('pre')
  dom.appendChild(logevent)
  document.body.appendChild(dom)
  console.log(french)
}

let cachedMatches = []
let buffer = []

function listen () {
  speech.on('result', onResult)
  speech.on('end', flushBuffer)
}

function flushBuffer () {
  buffer.forEach(item => {
    if (item.dom) item.dom.parentNode.removeChild(item.dom)
  })
  buffer = []
}

function onResult (event) {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    processResult(i, event.results[i], (i + 1) >= event.results.length)
  }
}

function processResult (index, result, last) {
  if (!buffer[index]) {
    buffer[index] = { value: '', matches: [], dom: null, final: false }
    if (DEBUG) {
      buffer[index].dom = document.createElement('pre')
      buffer[index].dom.style.color = 'rgba(255, 255, 255, 0.4)'
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

  french.replacers.forEach(obj => {
    newStr = newStr.replace(obj.reg, obj.to)
  })

  cachedMatches.forEach(match => {
    newStr = newStr.replace(match, ' ')
  })

  for (let i = 0; i < french.max; i++) {
    for (let k in french.orders) {
      if (i >= french.maxs[k]) continue
      const regex = french.orders[k][i].regex
      const opts = french.orders[k][i].opts
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

export default { listen, on: emitter.on, off: emitter.off }

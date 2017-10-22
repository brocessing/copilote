import speech from 'controllers/speech'
import french from './lang.fr'
import mitt from 'mitt'

const emitter = mitt()
const DEBUG = true
const dom = DEBUG ? document.createElement('dom') : null
if (dom) document.body.appendChild(dom)

if (DEBUG) console.log(french)

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
      buffer[index].dom.style.color = '#ccc'
      document.body.appendChild(buffer[index].dom)
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
      'matches: ' + buf.matches.join(' / ') + '\n' +
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
          const out = { order: k, match }
          emitter.emit(':all', out)
          emitter.emit(k, out)
          match = regex.exec(newStr)
        }
      } else {
        const res = newStr.match(regex)
        if (!res) continue
        res.forEach(match => {
          newStr = newStr.replace(match, ' ')
          cachedMatches.push(match)
          const out = { order: k, match }
          emitter.emit(':all', out)
          emitter.emit(k, out)
        })
      }
    }
  }
}

export default { listen, on: emitter.on, off: emitter.off }

import throttle from 'lodash/throttle'
import store from 'utils/store'

import preloader from 'controllers/preloader'
import speech from 'controllers/speech'
import orders from 'controllers/orders'
import three from 'controllers/three'
import canvas from 'controllers/canvas'

import Homescreen from 'components/dom/Homescreen'
import Main from 'components/three/Main'

const home = new Homescreen(document.querySelector('.homescreen'))
home.onstart = startExperience

// Listen the resize
const throttledResize = throttle(() => {
  store.set('size', { w: window.innerWidth, h: window.innerHeight })
}, 50)
window.addEventListener('resize', throttledResize)
store.set('size', { w: window.innerWidth, h: window.innerHeight })

Promise.resolve()
  .then(() => preloader.bindDom(document.querySelector('.preloader')))
  .then(preloader.loadJS)
  .then(threeSetup)
  .then(() => canvas.setup())
  .then(speech.start)
  .then(home.show)
  .then(preloader.hide)

function threeSetup () {
  three.setup(document.querySelector('.game-three'))
  three.addComponent(new Main())
}

function startExperience (lang = 'fr') {
  // TODO: Order setlang method?
  Promise.resolve()
    .then(() => speech.setLang(lang))
    .then(orders.listen)
    .then(three.start)
    .then(home.hide)
}

// import speech from 'controllers/speech'
// import orders from 'controllers/orders'

// speech
//   .start('fr')
//   .then(orders.listen)

// const log = document.createElement('pre')
// document.body.appendChild(log)

// orders.on(':all', ({order}) => {
//   if (order === 'radioOn') return
//   log.innerHTML = log.innerHTML + order + '\n'
// })

// orders.on('radioOn', ({order, match}) => {
//   console.log(match)
//   log.innerHTML = log.innerHTML + '🎶🎶 ' + match[1].toUpperCase() + ' 🎶🎶' + '\n'
// })
// let transcript = ''

// speech.on('result', event => {
//   console.log(event)
//   let interim = ''
//   for (var i = event.resultIndex; i < event.results.length; ++i) {
//     if (event.results[i].isFinal) transcript += event.results[i][0].transcript
//     else {
//       interim += event.results[i][0].transcript
//       let a = ''
//       for (let j = 0; j > event.results[i].length; j++) {
//         a += event.results[i][j].transcript + '  /  '
//       }
//       console.log(a)
//     }
//   }
//   div.innerHTML = transcript + interim
// })

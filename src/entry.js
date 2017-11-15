import * as Cookies from 'js-cookie'
import throttle from 'lodash/throttle'

import config from 'config'

import store from 'utils/store'
import prng from 'utils/prng'
import getDefaultLoc from 'utils/getDefaultLoc'

import loader from 'controllers/preloader/preloader'
import speech from 'controllers/speech/speech'
import volume from 'controllers/volume/volume'
import orders from 'controllers/orders/orders'
import three from 'controllers/three/three'
import sfx from 'controllers/sfx/sfx'
import transition from 'controllers/transitionOverlay/transitionOverlay'
import introduction from 'controllers/introduction/introduction'

import Preloader from 'components/dom/Preloader/Preloader'
import Homescreen from 'components/dom/Homescreen/Homescreen'
import GameGUI from 'components/dom/GameGUI/GameGUI'
import ErrorScreen from 'components/dom/ErrorScreen/ErrorScreen'
import Main from 'components/three/Main/Main'

const indexLang = {
  'fr': 0,
  'en': 1
}

// Set the default language
if (Cookies.get('lang') && indexLang[Cookies.get('lang')]) store.set('lang', Cookies.get('lang'))
else store.set('lang', getDefaultLoc())
store.set('langIndex', indexLang[store.get('lang')])

// Set the default quality
store.set('quality', Cookies.get('quality') || 2)

// remove <noscript> tags
let noscripts = document.getElementsByTagName('noscript')
for (let i = 0; i < noscripts.length; i++) {
  noscripts[0].parentNode.removeChild(noscripts[0])
}
noscripts = undefined

// Choose a seed for the prng
prng.setSeed(0)

// Initialize main components
const gameGui = new GameGUI()
const home = new Homescreen()
const preloader = new Preloader()

home.onstart = startExperience

// Listen the resize
const throttledResize = throttle(() => {
  store.set('size', { w: window.innerWidth, h: window.innerHeight })
}, 50)
window.addEventListener('resize', throttledResize)
store.set('size', { w: window.innerWidth, h: window.innerHeight })

// Loading flow
Promise.resolve()
  .then(transition.setup)
  .then(() => preloader.hydrate(document.querySelector('.preloader')))

  // Preloading
  .then(loader.loadJS)
  .then(() => Promise.all([
    loader.loadImages(),
    loader.loadBlobs(),
    loader.loadTextures()
  ]))
  .then(loader.loadObjects)
  .then(loader.loadChunks)

  .then(threeSetup)
  .then(sfx.setup)

  .then(() => preloader.beginPerm())

  .then(() => config.enableSpeech && speech.start())
  .then(() => config.enableSpeech && volume.start())

  .then(() => preloader.stopPerm())

  .then(() => config.quickstart ? quickStart() : standardHome())

  .catch(displayError)

function quickStart () {
  preloader.destroy()
  startExperience()
}

function standardHome () {
  return new Promise((resolve, reject) => {
    Promise.resolve()
      .then(transition.show)
      .then(() => preloader.destroy())
      .then(() => home.hydrate(document.querySelector('.homescreen')))
      .then(() => { home.onstart = startExperience })
      .then(() => home.show())
      .then(transition.hide)
      .then(resolve)
      .catch(reject)
  })
}

function displayError (err) {
  const error = new ErrorScreen({ error: err })
  Promise.resolve()
    .then(() => preloader.stopPerm())
    .then(transition.show)
    .then(() => preloader.destroy())
    .then(() => error.mount(document.body))
    .then(() => error.show())
    .then(transition.hide)
}

function threeSetup () {
  three.setup(document.querySelector('.game-three'))
  three.addComponent(new Main())
}

function startExperience () {
  const lang = store.get('lang')
  // TODO: Order setlang method?
  Promise.resolve()
    .then(() => !config.quickstart ? transition.show() : true)
    .then(() => config.enableSpeech && speech.setLang(lang))
    .then(() => config.enableSpeech && orders.setLang(lang))
    .then(() => config.enableSpeech && orders.listen())
    // initiate the GUI just before leaving the Home
    // and just after start listening to orders
    .then(() => gameGui.hydrate(document.querySelector('.game-gui')))
    .then(three.start)
    .then(introduction.setup)
    .then(() => !config.quickstart ? home.destroy() : document.querySelector('.homescreen').parentNode.removeChild(document.querySelector('.homescreen')))
    .then(() => !config.quickstart ? transition.hide() : true)
}

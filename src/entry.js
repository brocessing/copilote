import throttle from 'lodash/throttle'
import config from 'config'
import store from 'utils/store'
import prng from 'utils/prng'

import preloader from 'controllers/preloader/preloader'
import speech from 'controllers/speech/speech'
import volume from 'controllers/volume/volume'
import orders from 'controllers/orders/orders'
import three from 'controllers/three/three'

import Homescreen from 'components/dom/Homescreen/Homescreen'
import GameGUI from 'components/dom/GameGUI/GameGUI'
import Main from 'components/three/Main/Main'

prng.setSeed(0)

const gameGui = new GameGUI()
const home = new Homescreen()
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
  .then(preloader.loadTextures)
  .then(preloader.loadObjects)
  .then(preloader.loadChunks)
  .then(threeSetup)
  .then(() => config.enableSpeech && speech.start())
  .then(() => config.enableSpeech && volume.start())
  .then(() => home.hydrate(document.querySelector('.homescreen')))
  .then(home.show)
  .then(preloader.hide)
  .then(() => config.quickstart && startExperience(config.quickstart))
  .catch(err => { console.error(err) })

function threeSetup () {
  three.setup(document.querySelector('.game-three'))
  three.addComponent(new Main())
}

function startExperience (lang = 'fr') {
  // TODO: Order setlang method?
  Promise.resolve()
    .then(() => config.enableSpeech && speech.setLang(lang))
    .then(() => config.enableSpeech && orders.listen())
    // initiate the GUI just before leaving the Home
    // and just after start listening to orders
    .then(() => gameGui.hydrate(document.querySelector('.game-gui')))
    .then(three.start)
    .then(home.hide)
}

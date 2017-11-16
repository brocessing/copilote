import random from 'utils/random'

import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import three from 'controllers/three/three'

import Terrain from 'components/three/Terrain/Terrain'
import PlayerCar from 'components/three/PlayerCar/PlayerCar'
import Ground from 'components/three/Ground/Ground'

import camera from 'controllers/camera/camera'
import cops from 'controllers/cops/cops'

import particles from 'controllers/particles/particles'

import gui from 'controllers/datgui/datgui'
import store from 'utils/store'
import events from 'utils/events'
import overlay from 'controllers/gameOverlay/gameOverlay'
import speech from 'controllers/speech/speech'
import orders from 'controllers/orders/orders'
import config from 'config'
import map from 'controllers/map/map'
import prng from 'utils/prng'

import stress from 'controllers/stress/stress'

export default class Main extends ThreeComponent {
  setup () {
    this.bindFuncs(['tutorialEnd', 'orderOnce', 'onDead', 'reboot'])
    cops.setup()

    this.ground = this.addComponent(new Ground())
    this.playerCar = this.addComponent(new PlayerCar())
    this.terrain = this.addComponent(new Terrain())
    this.score = 0
    camera.setTarget(this.playerCar)
    particles.setup()

    this.resize(store.get('size'))
    overlay.mount()
    setTimeout(() => {
      if (config.quickstart) this.reboot()
      else this.gameOverlay()
    }, 1)

    this.scoreNeedsUpdate = false
    store.watch('order.once', this.orderOnce)
    store.watch('player.dead', this.onDead)
    events.on('reboot', this.reboot)

    const d = { 'reset': () => { this.reboot() } }
    gui.add(d, 'reset')
  }

  tutorialEnd () {
    events.off('tutorial.end', this.tutorialEnd)
    if (!speech.isRecognizing() && speech.getPending() !== 'start') {
      config.enableSpeech && speech.setLang(store.get('lang'))
      speech.start()
    }
    config.enableSpeech && orders.setLang(store.get('lang'))
    config.enableSpeech && orders.listen()

    camera.normalView()
    this.camIntro = false
    this.timerBeforeWakeup = 4000
    store.set('radar.status', 'visible')
    store.set('status.status', 'visible')
    store.set('score.status', 'visible')
  }

  orderOnce () {
    console.warn('YO')
    this.scoreNeedsUpdate = true
    this.timerBeforeWakeup = null
    overlay.onWakeup()
    store.unwatch('order.once', this.orderOnce)
    this.timerBeforeCopSpawn = 4000
  }

  gameOverlay () {
    if (speech.isRecognizing() && speech.getPending() !== 'stop') {
      speech.stop()
    }
    this.intro = true
    this.camIntro = true
    camera.bankView(true)
    this.timerBeforeTuto = 2000
    this.timerBeforeWakeup = null
    this.timerBeforeCopSpawn = null
    events.on('tutorial.end', this.tutorialEnd)
  }

  introUpdate (dt) {
    if (this.timerBeforeCopSpawn !== null) {
      if (this.timerBeforeCopSpawn <= 0) {
        this.timerBeforeCopSpawn = null
        cops.setSpawn(true)
        this.intro = false
      } else {
        this.timerBeforeCopSpawn -= dt
      }
    }

    if (this.timerBeforeTuto !== null) {
      if (this.timerBeforeTuto <= 0) {
        overlay.startTutorial()
        this.timerBeforeTuto = null
      } else {
        this.timerBeforeTuto -= dt
      }
    }

    if (this.timerBeforeWakeup !== null) {
      if (this.timerBeforeWakeup <= 0) {
        overlay.wakeup()
        this.timerBeforeWakeup = null
      } else {
        this.timerBeforeWakeup -= dt
      }
    }

    if (this.camIntro && camera.specialTarget.dist < 0.2) camera.specialTarget.dist += 0.0005
  }

  update (dt) {
    if (this.scoreNeedsUpdate) {
      this.score = this.score + dt / 60
      const score = Math.floor(this.score)
      if (score !== this.score) store.set('score.value', score)

      // stress update
      if (stress.panic) stress.remove(0.002)
      else stress.remove(0.00004)
    }

    super.update(dt)
    cops.update(dt)
    particles.update(dt)
    camera.update(dt)

    if (this.intro) this.introUpdate(dt)
  }

  onDead (isDead) {
    if (!isDead) return
    this.scoreNeedsUpdate = false
    overlay.gameOver(store.get('score.value'))
  }

  reboot () {
    stress.remove(1)
    this.score = 0
    this.scoreNeedsUpdate = false
    store.set('score.value', this.score)
    prng.setSeed(+(new Date()))

    orders.unlisten()

    map.reset()
    cops.setSpawn(false)
    this.playerCar.reset()
    events.emit('minimap.reset')

    camera.setTarget(this.playerCar)
    camera.normalView(true)

    store.unwatch('order.once', this.orderOnce)
    store.set('order.once', false)
    store.watch('order.once', this.orderOnce)

    this.timerBeforeTuto = null
    this.timerBeforeCopSpawn = null
    this.intro = true
    this.tutorialEnd()
  }

  resize (size) {
    super.resize(size)

    const scale = (size.h / 750) * (store.get('pixelratio') / 2)
    console.log(store.get('pixelratio'), scale, size.h)
    particles.setScale(scale)
  }
}

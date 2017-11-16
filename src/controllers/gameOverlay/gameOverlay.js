import store from 'utils/store'
import camera from 'controllers/camera/camera'
import GameOverlay from 'components/dom/GameOverlay/GameOverlay'
import noop from 'utils/noop'
import Popin from 'components/dom/Popin/Popin'
import orders from 'controllers/orders/orders'
import speech from 'controllers/speech/speech'
import config from 'config'
import events from 'utils/events'
import transition from 'controllers/transitionOverlay/transitionOverlay'
import GameOver from 'components/dom/GameOver/GameOver'

let component
let prevPopin
let currentPopin
let radar
let ontutoend = noop
let sleep = false

function setup () {
  if (!component) component = new GameOverlay()
}

function mount () {
  if (!component) setup()
  component.mount(document.querySelector('.game-gui'))
}

function show () {
  component.show()
}

function hide () {
  component.hide()
}

function endtutorial () {
  if (currentPopin) currentPopin.hide().then(() => currentPopin.destroy())
  component.refs.base.classList.remove('visible')

  store.set('radar.status', 'visible')
  store.set('status.status', 'visible')
  store.set('score.status', 'visible')

  window.setTimeout(() => events.emit('tutorial.end'), 500)
}

function step1 () {
  currentPopin = new Popin({
    class: 'introduction-popin',
    label: 'intro.gps',
    skip: 'intro.button.skip',
    next: 'intro.button.next'
  })
  currentPopin.mount(component.refs.base)
  currentPopin.show()
  const prev = currentPopin
  currentPopin.onnext = () => { prev.hide().then(() => prev.destroy()); step2() }
  currentPopin.onskip = () => { endtutorial() }
}

function step2 () {
  currentPopin = new Popin({
    class: 'introduction-popin',
    label: 'intro.police',
    skip: 'intro.button.skip',
    next: 'intro.button.next'
  })
  currentPopin.mount(component.refs.base)
  currentPopin.show()

  store.set('radar.status', 'visible')

  const prev = currentPopin
  currentPopin.onnext = () => { prev.hide().then(() => prev.destroy()); step3() }
  currentPopin.onskip = () => { endtutorial() }
}

function step3 () {
  currentPopin = new Popin({
    class: 'introduction-popin',
    label: 'intro.stress',
    next: 'intro.button.start'

  })
  currentPopin.mount(component.refs.base)
  currentPopin.show()

  store.set('radar.status', 'transparent')
  store.set('status.status', 'visible')

  const prev = currentPopin
  currentPopin.onnext = () => { prev.hide().then(() => prev.destroy()); endtutorial() }
  currentPopin.onskip = () => { endtutorial() }
}

function startTutorial () {
  component.refs.base.classList.add('visible')
  step1()
}

function onWakeup () {
  if (!sleep) return
  if (currentPopin) currentPopin.hide().then(() => currentPopin.destroy())
  component.refs.base.classList.remove('visible')
  sleep = false
}

function wakeup () {
  sleep = true
  component.refs.base.classList.add('visible')
  currentPopin = new Popin({
    class: 'introduction-popin',
    label: 'intro.wakeup'
  })
  currentPopin.mount(component.refs.base)
  currentPopin.show()
}

function gameOver (score) {
  setTimeout(() => {
    store.set('radar.status', 'hidden')
    store.set('status.status', 'hidden')
    store.set('score.status', 'hidden')
    events.emit('bubbles.reset')
    component.refs.base.classList.add('visible')
    const gameover = new GameOver({ score })
    gameover.mount(component.refs.base)
    gameover.onrestart = () => {
      transition.show()
        .then(() => events.emit('reboot'))
        .then(() => gameover.destroy())
        .then(() => component.refs.base.classList.remove('visible'))
        .then(() => transition.hide())
    }
    gameover.show()
  }, 1000)
}

export default {
  gameOver,
  onWakeup,
  wakeup,
  setup,
  mount,
  show,
  hide,
  startTutorial
}

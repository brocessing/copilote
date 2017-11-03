import three from 'controllers/three/three'
import map from 'controllers/map/map'
import camera from 'controllers/camera/camera'
import Cop from 'components/three/Cop/Cop'
import events from 'utils/events'

let scene
let lastId = -1
const aliveCops = []
const deadCops = []

const maxCops = 0
let copsNeeded = 0
let timerTrigger = 3000
let currentTimer = -10000

function setup () {
  scene = three.getScene()
}

function addCop () {
  const cop = new Cop({
    id: ++lastId,
    onDeath: onCopDeath,
    onRemoved: onCopRemoved
  })
  aliveCops.push(cop)
  scene.add(cop.group)
  events.emit('cop.added', { id: cop.id, position: [cop.group.position.x, cop.group.position.z] })
}

function onCopDeath (cop) {
  events.emit('cop.removed', { id: cop.id })
  const index = aliveCops.indexOf(cop)
  if (~index) aliveCops.splice(index, 1)
}

function onCopRemoved (cop) {
  let index = aliveCops.indexOf(cop)
  if (~index) {
    events.emit('cop.removed', { id: cop.id })
    aliveCops.splice(index, 1)
  } else {
    index = deadCops.indexOf(cop)
    if (~index) deadCops.splice(index, 1)
  }
  scene.remove(cop.group)
  cop.destroy()
}

function update (dt) {
  if (aliveCops.length + copsNeeded < maxCops) {
    copsNeeded = maxCops - aliveCops.length
  }

  currentTimer += dt
  if (currentTimer > timerTrigger) {
    if (copsNeeded--) addCop()
    currentTimer = 0
  }

  aliveCops.forEach(cop => cop.update(dt))
}

export default {
  setup,
  addCop,
  update,
  getAlive () { return aliveCops }
}

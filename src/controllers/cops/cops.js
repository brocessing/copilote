import three from 'controllers/three/three'
import map from 'controllers/map/map'
import camera from 'controllers/camera/camera'
import Cop from 'components/three/Cop/Cop'
import events from 'utils/events'
import store from 'utils/store'
import prng from 'utils/prng'

let scene, chunkSize
let lastId = -1
let aliveCops = []
let deadCops = []

const maxCops = 8
let copsNeeded = 0
let timerTrigger = 3000
let currentTimer = 4000
let spawnable = false

function setup () {
  scene = three.getScene()
  chunkSize = map.getChunkSize()
}

function addCop () {
  const pos = store.get('player.position').slice()

  pos[0] += ((prng.random() > 0.5) ? 1 : -1) * chunkSize
  pos[1] += ((prng.random() > 0.5) ? 1 : -1) * chunkSize
  const chunk = map.getChunkFromThreePos(pos[0], pos[1])
  const kroads = Object.keys(chunk.road)
  // console.log(chunk)
  const road = chunk.road[kroads[prng.randomInt(0, kroads.length - 1)]]
  // const road = chunk.road['5.5']
  // console.log(chunk.x, chunk.y, road.p, chunk.x + road.p[0] + 0.5, chunk.x + road.p[1] + 0.5)
  const cop = new Cop({
    id: ++lastId,
    x: chunk.x + road.p[0] + 0.5,
    y: chunk.y + road.p[1] + 0.5,
    angle: road.r * (Math.PI / 2),
    onDeath: onCopDeath,
    onRemoved: onCopRemoved
  })
  aliveCops.push(cop)
  scene.add(cop.group)
  events.emit('cop.added', { id: cop.id, position: [cop.group.position.x, cop.group.position.z] })
}

function onCopDeath (cop) {
  events.emit('cop.removed', { id: cop.id })
  let index = aliveCops.indexOf(cop)
  if (~index) aliveCops.splice(index, 1)
  index = deadCops.indexOf(cop)
  if (!~index) deadCops.push(cop)
}

function onCopRemoved (cop) {
  let index = aliveCops.indexOf(cop)
  if (~index) {
    events.emit('cop.removed', { id: cop.id })
    aliveCops.splice(index, 1)
  }
  index = deadCops.indexOf(cop)
  if (~index) deadCops.splice(index, 1)
  scene.remove(cop.group)
  cop.destroy()
}

function update (dt) {
  if (!spawnable) return
  if ((aliveCops.length + copsNeeded) < maxCops) {
    copsNeeded = maxCops - aliveCops.length
  }

  currentTimer += dt
  if (currentTimer > timerTrigger) {
    if (copsNeeded--) addCop()
    currentTimer = 0
  }

  aliveCops.forEach(cop => cop.update(dt))
  deadCops.forEach(cop => cop.update(dt))
}

function setSpawn (v) {
  if (v) { spawnable = v; return }
  spawnable = false
  deadCops.forEach(cop => cop.destroy())
  aliveCops.forEach(cop => cop.destroy())
  aliveCops = []
  deadCops = []
  timerTrigger = 3000
  currentTimer = 4000
}

export default {
  setSpawn,
  setup,
  addCop,
  update,
  getAlive () { return aliveCops }
}

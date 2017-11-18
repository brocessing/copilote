/* global Howl */
import anime from 'animejs'
import store from 'utils/store'
import nmod from 'utils/nmod'
import camera from 'controllers/camera/camera'
import prng from 'utils/prng'
import raf from 'utils/raf'
import orders from 'controllers/orders/orders'

const sfx = {}
const instances = {}
let earPos = [0, 0]
let earAng = 0

function setup () {
  sfx.bg = new Howl({
    src: ['sfx/bg-loop-bass.mp3'],
    loop: true,
    volume: 0.1
  })
  sfx.engine = new Howl({
    src: ['sfx/engine-loop.mp3'],
    loop: true,
    volume: 0.5
  })
  sfx.siren1 = new Howl({
    src: ['sfx/siren1.wav'],
    loop: true,
    volume: 0.2
  })
  sfx.blast1 = new Howl({
    src: ['sfx/explosion-crash-1.mp3'],
    volume: 0.1
  })
  sfx.blast2 = new Howl({
    src: ['sfx/explosion-crash-2.mp3'],
    volume: 0.1
  })
  sfx.police0 = new Howl({
    src: ['sfx/police-1.mp3'],
    volume: 0.4
  })
  sfx.police1 = new Howl({
    src: ['sfx/police-2.mp3'],
    volume: 0.4
  })
  sfx.police2 = new Howl({
    src: ['sfx/police-3.mp3'],
    volume: 0.4
  })
  sfx.bank = new Howl({
    src: ['sfx/alarm-loop.mp3'],
    volume: 0.1,
    loop: true
  })
  sfx.radio = new Howl({
    src: ['sfx/1077.mp3'],
    volume: 0.2,
    onend: () => {
      if (!store.get('player.dead')) startBg()
    }
  })
  raf.add(update)
}

let data = { bgVol: 0 }
let rate = 0.5
let targetEngineForce = 0.5
let rapport = 0
let anims = {}

orders.on('radioOn', () => {
  stopBg()
  instances.radio = sfx.radio.play()
})

// store.watch('player.dead', (isDead) => {
//   if (isDead && )
// })

function updateBgVolume (val, instant) {
  if (anims.bg) anims.bg.pause()
  anims.bg = anime({
    targets: data,
    bgVol: val,
    easing: 'linear',
    duration: instant ? 0 : 1500,
    update: () => {
      if (instances.bg) sfx.bg.volume(data.bgVol, instances.bg)
    }
  })
}

let bankPos
function startBank () {
  stopBank()
  instances.bank = sfx.bank.play()
  bankPos = new THREE.Vector3(-1, 0, 0)
}

function stopBank () {
  if (instances.bank) { sfx.bank.stop(instances.bank); instances.bank = null }
}

function startBg () {
  if (instances.radio) { sfx.radio.stop(instances.radio); instances.radio = null }
  stopBg()
  instances.bg = sfx.bg.play()
  sfx.bg.volume(data.bgVol, instances.bg)
}

function stopBg () {
  if (instances.bg) sfx.bg.stop(instances.bg)
}

function updateCoords (pos, ang) {
  earPos[0] = pos.x
  earPos[1] = pos.z
  earAng = ang
}

function updateEngine (vel, angvel, speedLevel = 0, dead) {
  if (!instances.engine && !dead) instances.engine = sfx.engine.play()
  let speed = vel[0] * vel[0] + vel[1] * vel[1]
  speed = speed - (Math.max(1, (speed * 1.6) / 2) - 1)
  const t = Math.max(0, speed - 1.91)
  targetEngineForce = (speed / 1.81 * 1.5 + 0.5 + t * 7) * !dead

  rate += (targetEngineForce - rate) * 0.08 + (Math.abs(angvel) % 1) * 0.04

  if (rate < 1) rapport = 0
  else rapport = 1
  // else if (rate < 2) rapport = 2

  rate = rate - rapport * 0.04
  sfx.engine.rate(rate, instances.engine)
}

let cops = {}

function addCop (id) {
  if (!cops[id]) {
    cops[id] = { id }
    cops[id].siren = sfx.siren1.play()
  }
}

let policeSkit = { timer: 0 }

let i = 0
function emitPoliceSkit (id) {
  // console.warn('SKIT')
  let method = 'police' + i
  if (policeSkit.instance) sfx[method].stop(policeSkit.instance)
  i = i >= 2 ? 0 : i + 1
  method = 'police' + i
  policeSkit.method = method
  policeSkit.instance = sfx[method].play()
  policeSkit.id = id
  policeSkit.timer = 6500 + (prng.random() * 2 - 1) * 2000
}

function update (dt) {
  if (policeSkit.timer > 0) policeSkit.timer -= dt
  if (instances.bank) {
    let ndist = ((bankPos.x - earPos[0]) ** 2 + (bankPos.z - earPos[1]) ** 2)
    let dist = (Math.max(0, ndist - 0.1)) * 0.04
    dist = Math.max(0, Math.min(1, (1 / (dist)) * 0.04))
    let dAng = camera.getCamera().worldToLocal(bankPos.clone()).normalize()
    sfx.bank.volume(dist * 0.14, instances.bank)
    sfx.bank.stereo(dAng.x, instances.bank)
    // if (dist * 0.14 < 0.01) stopBank()
  }
}

function updateCop (id, pos, dt) {
  if (!cops[id]) return

  let ndist = ((pos.x - earPos[0]) ** 2 + (pos.z - earPos[1]) ** 2)

  let dist = (Math.max(0, ndist - 0.1)) * 0.04
  dist = Math.max(0, Math.min(1, (1 / (dist)) * 0.06))

  let dAng = camera.getCamera().worldToLocal(pos.clone()).normalize()

  if (ndist < 8 && policeSkit.timer <= 0) {
    emitPoliceSkit(id)
  }

  if (policeSkit.id === id && policeSkit.timer > 0) {
    if (policeSkit.instance) {
      sfx[policeSkit.method].volume(dist, policeSkit.instance)
      sfx[policeSkit.method].stereo(dAng.x, policeSkit.instance)
    }
  }

  sfx.siren1.volume(dist * 0.8, cops[id].siren)
  sfx.siren1.stereo(dAng.x, cops[id].siren)
}

function removeCop (id) {
  if (policeSkit.id === id && policeSkit.timer > 0) {
    policeSkit.timer = 2000
    policeSkit.id = null
    if (policeSkit.instance) {
      sfx[policeSkit.method].stop(policeSkit.instance)
      policeSkit.instance = null
    }
  }

  if (cops[id]) {
    sfx.siren1.stop(cops[id].siren)
    delete cops[id]
  }
}

let pingpong = false

function blast (pos) {
  pingpong = !pingpong
  const method = pingpong ? 'blast1' : 'blast2'
  const instance = pingpong ? sfx[method].play() : sfx[method].play()
  let dist = ((pos.x - earPos[0]) ** 2 + (pos.z - earPos[1]) ** 2)
  dist = (Math.max(0, dist - 0.1)) * 0.04
  dist = Math.max(0, Math.min(1, (1 / (dist)) * 0.06))
  let dAng = camera.getCamera().worldToLocal(pos.clone()).normalize()
  sfx[method].volume(dist * 0.4, instance)
  sfx[method].stereo(dAng.x, instance)
  sfx[method].rate(1 + (prng.random() * 2 - 1) * 0.3, instance)
  // console.warn('ZOUBIDA')
}

export default {
  setup,
  updateEngine,
  addCop,
  updateCop,
  removeCop,
  updateCoords,
  stopBg,
  startBg,
  updateBgVolume,
  blast,
  startBank,
  stopBank
}

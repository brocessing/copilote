  /* global Howl */
import store from 'utils/store'
import nmod from 'utils/nmod'
import camera from 'controllers/camera/camera'

const sfx = {}
const instances = {}
let earPos = [0, 0]
let earAng = 0

function setup () {
  sfx.engine = new Howl({
    src: ['sfx/engine-loop.mp3'],
    loop: true,
    volume: 0.3
  })
  sfx.siren1 = new Howl({
    src: ['sfx/siren1.wav'],
    loop: true,
    volume: 0.3
  })
}

let rate = 0.5
let targetEngineForce = 0.5
let rapport = 0

function updateCoords (pos, ang) {
  earPos[0] = pos.x
  earPos[1] = pos.z
  earAng = ang
}

function updateEngine (vel, angvel, dead) {

  if (!instances.engine && !dead) instances.engine = sfx.engine.play()
  const speed = vel[0] * vel[0] + vel[1] * vel[1]
  const t = Math.max(0, speed - 1.91)
  targetEngineForce = (speed / 1.81 * 1.5 + 0.5 + t * 7) * !dead
  rate += (targetEngineForce - rate) * 0.08 + (Math.abs(angvel) % 1) * 0.04

  if (rate < 1) rapport = 0
  else if (rate < 1.5) rapport = 1
  else if (rate < 2) rapport = 2

  rate = rate - rapport * 0.04
  sfx.engine.rate(rate, instances.engine)
}

function updateCop (i, pos, dead) {
  const copID = 'cop.' + i
  if (!instances[copID]) instances[copID] = sfx.siren1.play()

  let dist = ((pos.x - earPos[0]) ** 2 + (pos.z - earPos[1]) ** 2)
  dist = (Math.max(0, dist - 0.1)) * 0.04
  dist = Math.max(0, Math.min(1, (1 / (dist)) * 0.06))

  sfx.siren1.volume(dist, instances[copID])


  let dAng = camera.getCamera().worldToLocal(pos.clone()).normalize()

  sfx.siren1.stereo(dAng.x, instances[copID])
}

export default { setup, updateEngine, updateCop, updateCoords }

/* global THREE */

// import store from 'utils/store'
import three from 'controllers/three/three'
// import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
// import kbControls from 'utils/keyboardControls'
import store from 'utils/store'
import gui from 'controllers/datgui/datgui'
import config from 'config'
import cops from 'controllers/cops/cops'
import prng from 'utils/prng'
import sfx from 'controllers/sfx/sfx'
import sky from 'controllers/sky/sky'

const a = true
const minCameraDist = a ? 1.1 : 1.1
const cameraDistMult = a ? 1.3 : 1.3
let relPos = a ? [0, 0.9, -1.8] : [0, 0.9, -0.8]

// lerp value
const lerps = {
  pos: 1,
  ang: a ? 0.03 : 0.01,
  angVel: 0.04,
  lookAt: 0.8,
  cameraDist: 0.01
}

// lerped values
let angularVelocity = 0
let cameraDist = minCameraDist
let camera, target

let fakeTarget
let fakeTargetAngs = {
  fromLerp: 0,
  angVel: 0
}

const maxShake = 250
let shake = 0
let shakeFreq = 0
let shakeVec, targetShakeVec
let shakeMult = 2

const guiFn = { switchToPlayer, switchToCop, explodeCop, explodePlayer }

function addCameraShake (val = shakeMult) {
  shake = maxShake
  shakeMult = val
  shakeVec = new THREE.Vector3(0, 0, 0)
  targetShakeVec = new THREE.Vector3(0, 0, 0)
  shakeFreq = 0
}

function switchToPlayer () {
  const player = store.get('player.vehicle')
  setTarget(player)
}

let currentCop = 0
let currentCop_
function switchToCop () {
  const all = cops.getAlive()
  if (all.length < 1) return
  if (currentCop > all.length - 1) currentCop = 0
  currentCop_ = all[currentCop]
  setTarget(currentCop_)
  currentCop = ((currentCop + 1) >= all.length) ? 0 : currentCop + 1
}

function explodeCop () {
  if (!currentCop_) return
  currentCop_.explode()
}

function explodePlayer () {
  store.get('player.vehicle').explode()
}

function setup () {
  gui.add(guiFn, 'switchToPlayer').name('Switch to player')
  gui.add(guiFn, 'switchToCop').name('Switch to cop')
  gui.add(guiFn, 'explodeCop').name('Explode cop')
  gui.add(guiFn, 'explodePlayer').name('Explode player')

  fakeTarget = new THREE.Object3D()
  three.getScene().add(fakeTarget)

  relPos = new THREE.Vector3(relPos[0], relPos[1], [relPos[2]]).setLength(cameraDist)

  camera = new THREE.PerspectiveCamera(
    a ? 55 : 75,
    window.innerWidth / window.innerHeight,
    config.cullingMin, config.cullingMax
  )

  shakeVec = new THREE.Vector3(0, 0, 0)
  targetShakeVec = new THREE.Vector3(0, 0, 0)
}

function update (dt) {
  if (!target || !camera) return
  const isShaking = (shake > 0)

  shakeVec.lerp(targetShakeVec, 0.1)
  fakeTarget.position.lerp(target.group.position.clone(), lerps.pos)

  // fakeTargetAngs.angVel += (target.angularVelocity * 0.2 - fakeTargetAngs.angVel) * 0.1
  // const targetRot = target.chassis.rotation.y - fakeTargetAngs.angVel
  // fakeTargetAngs.fromLerp += (targetRot - fakeTargetAngs.fromLerp) * lerps.ang
  // fakeTarget.rotation.y = fakeTargetAngs.fromLerp

  // fakeTargetAngs.angVel += (target.angularVelocity * 0.2 - fakeTargetAngs.angVel) * 0.1
  // const targetRot = target.chassis.rotation.y - fakeTargetAngs.angVel
  fakeTargetAngs.fromLerp += (target.chassis.rotation.y - fakeTargetAngs.fromLerp) * lerps.ang
  fakeTarget.rotation.y = fakeTargetAngs.fromLerp

  cameraDist += (Math.max(minCameraDist, target.speed * cameraDistMult) - cameraDist) * lerps.cameraDist

  // stay behind the car
  camera.position.copy(fakeTarget.localToWorld(relPos.clone().setLength(cameraDist)))

  // keep pointing north
  // camera.position.copy(fakeTarget.position).add(relPos.clone().setLength(cameraDist))

  // lerp target camera position
  // camera.position.add(targetCamPos.sub(camera.position).multiplyScalar(lerps.pos))

  // look at the car
  const backQt = camera.quaternion.clone()
  camera.lookAt(target.group.position)
  const targetQt = camera.quaternion.clone()
  camera.setRotationFromQuaternion(backQt)
  camera.quaternion.slerp(targetQt, lerps.lookAt)

  camera.rotation.z += shakeVec.z * 0.5
  camera.rotation.y += shakeVec.z * 0.4
  camera.rotation.x += shakeVec.x * 0.5

  // angularVelocity += (target.angularVelocity - angularVelocity) * lerps.angVel
  // camera.rotation.y += angularVelocity / 10
  // this.camera.rotation.y += dangvel / 100

  sfx.updateCoords(camera.position, camera.rotation.y)
  const vector = camera.getWorldDirection();
  const theta = Math.atan2(vector.x,vector.z);
  sky.setAngle(theta)

  if (!isShaking) return
  const f = shake / maxShake
  // console.log('YOUPI')
  if (!(shakeFreq % (Math.floor(3 * (1 - f))))) {
    // console.log('allo ?')
    targetShakeVec.x = f * (prng.random() * 2 - 1) * 2.5 * shakeMult
    targetShakeVec.y = f * (prng.random() * 2 - 1) * 1.9 * shakeMult
    targetShakeVec.z = f * (prng.random() * 2 - 1) * 2.5 * shakeMult
  }
  shake -= dt * f
  shakeFreq += 1

}

function setTarget (vehicle) {
  target = vehicle
  camera.position.copy(target.group.position).add(relPos)
  camera.lookAt(target.group.position)
  fakeTargetAngs.fromLerp = target.chassis.rotation.y
  fakeTarget.position.copy(target.group.position)
  // this.angvel += (store.get('car.angvel') - this.angvel) * this.alerp
}

export default {
  setup,
  update,
  setTarget,
  addCameraShake,
  getCamera () { return camera }
}

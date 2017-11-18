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
import skyScene from 'controllers/skyScene/skyScene'

const a = true
let minCameraDist = a ? 1.1 : 1.1
let maxCameraDist = 1.5
const cameraDistMult = a ? 1.3 : 1.3
let relPos = a ? [0, 0.9, -1.8] : [0, 0.9, -0.8]

// lerp value
const lerps = {
  curpos: 1,
  curlookAt: 0.8,
  curcameraDist: 0.01,
  pos: 1,
  ang: a ? 0.03 : 0.01,
  angVel: 0.04,
  lookAt: 0.8,
  cameraDist: 0.01
}

// lerped values
let angularVelocity = 0
let cameraDist = minCameraDist
let camera, target, frustum

let specialTarget = {
  pos: null,
  ang: 0,
  dist: 0,
  lookAt: 0,
  use: false
}
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

function setup () {
  fakeTarget = new THREE.Object3D()
  three.getScene().add(fakeTarget)

  relPos = new THREE.Vector3(relPos[0], relPos[1], [relPos[2]]).setLength(cameraDist)
  specialTarget.pos = new THREE.Vector3(0, 0, 0)
  specialTarget.lookAt = new THREE.Vector3(0, 0, 0)

  camera = new THREE.PerspectiveCamera(
    a ? 55 : 75,
    window.innerWidth / window.innerHeight,
    config.cullingMin, config.cullingMax
  )

  frustum = new THREE.Frustum()

  shakeVec = new THREE.Vector3(0, 0, 0)
  targetShakeVec = new THREE.Vector3(0, 0, 0)

  const guiFn = { switchToCop, switchToPlayer }
  gui.add(guiFn, 'switchToCop')
  gui.add(guiFn, 'switchToPlayer')
}

function instantUpdate () {
  if (specialTarget.use) {
    fakeTarget.position.copy(specialTarget.pos)
    fakeTarget.rotation.y = specialTarget.ang
    cameraDist = specialTarget.dist
  } else {
    fakeTarget.position.copy(target.group.position.clone())
    fakeTarget.rotation.y = target.chassis.rotation.y
    cameraDist = Math.min(maxCameraDist, Math.max(minCameraDist, target.speed * cameraDistMult))
  }
}

function update (dt) {
  if (!target || !camera) return
  const isShaking = (shake > 0)

  lerps.curpos += (lerps.pos - lerps.curpos) * 0.005
  lerps.curlookAt += (lerps.lookAt - lerps.curlookAt) * 0.005
  lerps.curcameraDist += (lerps.cameraDist - lerps.curcameraDist) * 0.005
  shakeVec.lerp(targetShakeVec, 0.1)

  if (specialTarget.use) {
    fakeTarget.position.lerp(specialTarget.pos, lerps.curpos)
    fakeTarget.rotation.y += (specialTarget.ang - fakeTarget.rotation.y) * lerps.ang
    cameraDist += (specialTarget.dist - cameraDist) * lerps.curcameraDist
  } else {
    fakeTarget.position.lerp(target.group.position.clone(), lerps.curpos)
    fakeTarget.rotation.y += (target.chassis.rotation.y - fakeTarget.rotation.y) * lerps.ang
    cameraDist += (Math.min(maxCameraDist, Math.max(minCameraDist, target.speed * cameraDistMult)) - cameraDist) * lerps.curcameraDist
  }

  // stay behind the car
  camera.position.copy(fakeTarget.localToWorld(relPos.clone().setLength(cameraDist)))

  // look at the car
  if (specialTarget.use) {
    const backQt = camera.quaternion.clone()
    camera.lookAt(specialTarget.lookAt)
    const targetQt = camera.quaternion.clone()
    camera.setRotationFromQuaternion(backQt)
    camera.quaternion.slerp(targetQt, lerps.curlookAt)
  } else {
    const backQt = camera.quaternion.clone()
    camera.lookAt(target.group.position)
    const targetQt = camera.quaternion.clone()
    camera.setRotationFromQuaternion(backQt)
    camera.quaternion.slerp(targetQt, lerps.curlookAt)
  }

  camera.rotation.z += shakeVec.z * 0.5
  camera.rotation.y += shakeVec.z * 0.4
  camera.rotation.x += shakeVec.x * 0.5
  // angularVelocity += (target.angularVelocity - angularVelocity) * lerps.angVel
  // camera.rotation.y += angularVelocity / 10
  // this.camera.rotation.y += dangvel / 100

  sfx.updateCoords(camera.position, camera.rotation.y)
  const vector = camera.getWorldDirection()
  const theta = Math.atan2(vector.x, vector.z)
  skyScene.setAngle(theta)

  // camera shake
  if (isShaking) {
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

  camera.updateMatrix()
  camera.updateMatrixWorld()
  camera.matrixWorldInverse.getInverse(camera.matrixWorld)
  frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse))
}

function isPointVisible (vec) {
  return frustum.containsPoint(vec)
}

function setTarget (vehicle) {
  target = vehicle
  camera.position.copy(target.group.position).add(relPos)
  camera.lookAt(target.group.position)
  fakeTargetAngs.fromLerp = target.chassis ? target.chassis.rotation.y : target.group.rotation.y
  fakeTarget.position.copy(target.group.position)
  // this.angvel += (store.get('car.angvel') - this.angvel) * this.alerp
}

function normalView (instant = false) {
  specialTarget.use = false
  if (instant) instantUpdate()
  else {
    lerps.curpos = 0
    lerps.curlookAt = 0
    lerps.curcameraDist = 0.06
  }
}

function bankView (instant = false) {
    // relPos = new THREE.Vector3(0.7, 0.1, -0.2)
    // minCameraDist = 0.8
    // cameraDist = 0.8
  specialTarget.use = true
  specialTarget.pos.set(1, 0.6, 0)
  specialTarget.dist = -0.2
  specialTarget.lookAt.set(0, 0.4, 0)
  if (instant) instantUpdate()
  else {
    lerps.curpos = 0
    lerps.curlookAt = 0
    lerps.curcameraDist = 0.06
  }
  // useSpecial = true
}

export default {
  setup,
  instantUpdate,
  update,
  setTarget,
  addCameraShake,
  isPointVisible,
  bankView,
  normalView,
  specialTarget,
  getCamera () { return camera }
}

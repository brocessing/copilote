/* global THREE */

// import store from 'utils/store'
import three from 'controllers/three/three'
// import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
// import kbControls from 'utils/keyboardControls'
import store from 'utils/store'
import gui from 'controllers/datgui/datgui'
import config from 'config'
import cops from 'controllers/cops/cops'

const minCameraDist = 1.1
const cameraDistMult = 1.2
let relPos = [0, 1, -0.8]

// lerp value
const lerps = {
  pos: 1,
  ang: 0.01,
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

const guiFn = { switchToPlayer, switchToCop }

function switchToPlayer () {
  const player = store.get('player.vehicle')
  setTarget(player)
}

function switchToCop () {
  const all = cops.getAlive()
  if (all.length < 1) return
  setTarget(all[0])
}

function setup () {
  const f = gui.folder('camera', {open: true})
  f.add(guiFn, 'switchToPlayer')
  f.add(guiFn, 'switchToCop')
  f.open()

  fakeTarget = new THREE.Object3D()
  three.getScene().add(fakeTarget)

  relPos = new THREE.Vector3(relPos[0], relPos[1], [relPos[2]]).setLength(cameraDist)

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    config.cullingMin, config.cullingMax
  )
  three.getScene().fog = new THREE.Fog(
    config.background,
    config.cullingMax / 3,
    config.cullingMax / 2
  )
}

function update (dt) {
  if (!target || !camera) return

  fakeTarget.position.lerp(target.group.position, lerps.pos)

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

  angularVelocity += (target.angularVelocity - angularVelocity) * lerps.angVel
  // this.camera.rotation.x -= dangvel / 100
  // this.camera.rotation.y += dangvel / 100
}

function setTarget (vehicle) {
  target = vehicle
  camera.position.copy(target.group.position).add(relPos)
  camera.lookAt(target.group.position)
  // this.angvel += (store.get('car.angvel') - this.angvel) * this.alerp
}

export default {
  setup,
  update,
  setTarget,
  getCamera () { return camera }
}

/* global THREE, p2 */

import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import kbControls from 'utils/keyboardControls'

export default class CameraCar extends ThreeComponent {
  setup () {
    this.dist = 1
    this.ipos = new THREE.Vector3(0, 1, -0.8).setLength(1)
    const lerp = 0.1
    this.alerp = 0.05
    this.pangvel = 0
    this.angvel = 0
    this.lerp = new THREE.Vector3(lerp, lerp, lerp)
    this.targetVec = new THREE.Vector3()
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01, 30
    )
  }

  update (dt) {
    if (!this.target) return
    super.update(dt)

    this.dist += (Math.max(1, store.get('car.speed') * 1.5) - this.dist) * 0.02
    this.targetVec.copy(this.target.localToWorld(this.ipos.clone().setLength(this.dist)))
    // this.targetVec.copy(this.target.position).add(this.ipos.clone().setLength(this.dist))
    this.camera.position.add(this.targetVec.sub(this.camera.position).multiply(this.lerp))

    const backQt = this.camera.quaternion.clone()
    this.camera.lookAt(this.target.position)
    const targetQt = this.camera.quaternion.clone()
    this.camera.setRotationFromQuaternion(backQt)
    this.camera.quaternion.slerp(targetQt, 0.2)

    this.angvel += (store.get('car.angvel') - this.angvel) * this.alerp
    const dangvel = this.pangvel - this.angvel
    this.camera.rotation.x -= dangvel / 100
    // this.camera.rotation.y += dangvel / 100
  }

  setTarget (obj) {
    this.target = obj
    this.camera.position.copy(this.target.position).add(this.ipos)
    this.camera.lookAt(this.target.position)
    this.iang = this.camera.rotation.clone()
    // this.angvel += (store.get('car.angvel') - this.angvel) * this.alerp
  }
}

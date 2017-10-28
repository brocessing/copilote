/* global THREE, p2 */

import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import kbControls from 'utils/keyboardControls'

export default class CameraCar extends ThreeComponent {
  setup () {
    this.ipos = new THREE.Vector3(-0.1, 0.7, -0.63).setLength(2)
    const lerp = 0.2
    this.alerp = 0.05
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
    this.angvel += (store.get('car.angvel') - this.angvel) * this.alerp
    super.update(dt)
    this.targetVec.copy(this.target.position).add(this.ipos)
    this.camera.position.add(this.targetVec.sub(this.camera.position).multiply(this.lerp))
    // const backAng = this.camera.rotation.clone()
    // this.camera.lookAt(this.target.position)
    // const targetAng = this.camera.rotation.clone()
    // this.camera.rotation.x = this.iang.x - Math.abs(this.angvel / 30)
    this.camera.rotation.y = this.iang.y - this.angvel / 30
    this.camera.rotation.z = this.iang.z - this.angvel / 40
    // this.camera.rotation.y = backAng.y + (targetAng.y - backAng.y) * 0.5
    // this.camera.rotation.z = backAng.z + (targetAng.z - backAng.z) * 0.5
    // this.camera.rotation.copy(backAng).add(targetAng.sub(backAng).multiply(this.lerp))
  }

  setTarget (obj) {
    this.target = obj
    this.camera.position.copy(this.target.position).add(this.ipos)
    this.camera.lookAt(this.target.position)
    this.iang = this.camera.rotation.clone()
    // this.angvel += (store.get('car.angvel') - this.angvel) * this.alerp
  }
}

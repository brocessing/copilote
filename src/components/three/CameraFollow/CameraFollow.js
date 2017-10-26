/* global THREE, p2 */

import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import kbControls from 'utils/keyboardControls'

export default class CameraCar extends ThreeComponent {
  setup () {
    const lerp = 0.08
    this.lerp = new THREE.Vector3(lerp, lerp, lerp)
    this.targetVec = new THREE.Vector3()
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1, 1000
    )
  }

  update (dt) {
    super.update(dt)
    this.targetVec.copy(this.target.position).add(new THREE.Vector3(-2, 3, -3))
    this.camera.position.add(this.targetVec.sub(this.camera.position).multiply(this.lerp))
    const backAng = this.camera.rotation.clone()
    this.camera.lookAt(this.target.position)
    const targetAng = this.camera.rotation.clone()
    this.camera.rotation.x = backAng.x + (targetAng.x - backAng.x) * 1.7
    this.camera.rotation.y = backAng.y + (targetAng.y - backAng.y) * 1.7
    this.camera.rotation.z = backAng.z + (targetAng.z - backAng.z) * 1.7
    // this.camera.rotation.copy(backAng).add(targetAng.sub(backAng).multiply(this.lerp))
  }

  setTarget (obj) {
    this.target = obj
    this.camera.position.copy(this.target.position).add(new THREE.Vector3(-2, 3, -3))
    this.camera.lookAt(this.target.position)
  }
}

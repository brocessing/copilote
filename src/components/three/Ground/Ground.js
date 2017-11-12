/* global THREE, p2 */

import config from 'config'
import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import ground from 'shaders/ground/ground'

export default class Ground extends ThreeComponent {
  setup () {
    this.group = new THREE.Mesh(new THREE.PlaneGeometry(20, 20, 20, 20), ground.getMaterial())
    // this.meshes.ground.scale.set(100, 100, 1)
    this.group.rotation.x = -Math.PI / 2
    this.group.position.set(0, 0.01, 0)
  }

  update (dt) {
    const pos = store.get('player.position')
    this.group.position.x = pos[0]
    this.group.position.z = pos[1]
  }

  destroy () {
    super.destroy()
  }
}

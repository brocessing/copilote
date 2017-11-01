/* global THREE, p2 */

import store from 'utils/store'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'

export default class Box extends ThreeComponent {
  setup (opts = {}) {
    opts = Object.assign({}, { x: 0, y: 0, z: 0, r: 0 }, opts)
    this.group = new THREE.Group()
    this.meshes.arrow = new THREE.Mesh(store.get('geo.box'), store.get('mat.red'))
    this.meshes.base = new THREE.Mesh(store.get('geo.box'), store.get('mat.red'))
    this.group.add(this.meshes.arrow)
    this.group.add(this.meshes.base)
    this.meshes.base.scale.set(3, 1, 0.1)
    this.meshes.base.position.set(0, 0, 0.3)
    this.group.scale.set(0.02, 0.01, 0.2)
    this.group.position.set(opts.x, opts.y, opts.z)
    this.group.rotation.y = opts.r
  }
}

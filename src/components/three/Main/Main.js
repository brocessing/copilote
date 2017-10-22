/* global THREE */

import ThreeComponent from 'abstractions/ThreeComponent'

export default class Main extends ThreeComponent {
  setup () {
    this.geometries.box = new THREE.BoxGeometry(1, 1, 1)
    this.materials.basic = new THREE.MeshBasicMaterial({color: 0x00ff00})
    this.meshes.cube = new THREE.Mesh(this.geometries.box, this.materials.basic)
    this.group.add(this.meshes.cube)
  }

  update (dt) {
    this.meshes.cube.rotation.x += 0.1
  }
}

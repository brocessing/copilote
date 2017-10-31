/* global THREE */
import store from 'utils/store'
import map from 'controllers/map/map'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import three from 'controllers/three/three'

export default class Waypoint extends ThreeComponent {
  // t: type / p: pos / r: rotation / n: neighbors links
  setup ({ x, y, r, impro }) {
    // console.log('added')
    let mat
    if (impro) mat = store.get('mat.red')
    this.meshes.arrow = new THREE.Mesh(store.get('geo.box'), mat)
    this.meshes.base = new THREE.Mesh(store.get('geo.box'), mat)
    this.group.add(this.meshes.arrow)
    this.group.add(this.meshes.base)
    this.meshes.base.scale.set(3, 1, 0.2)
    this.meshes.base.position.set(0, 0, 0.5)
    this.group.scale.set(0.05, 0.02, 0.2)
    this.group.position.set(x, 0, y)
    this.group.rotation.y = r * -Math.PI / 2
    this.position = this.group.position
    three.getScene().add(this.group)
  }

  destroy () {
    three.getScene().remove(this.group)
    super.destroy()
  }
}

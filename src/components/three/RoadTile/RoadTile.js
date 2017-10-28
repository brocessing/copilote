import store from 'utils/store'
import map from 'controllers/map/map'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import three from 'controllers/three/three'

export default class Terrain extends ThreeComponent {
  setup (opts) {
    // console.log('added')
    this.group = new THREE.Mesh(store.get('geo.plane'), store.get('mat.gray'))
    this.group.position.x = opts.x
    this.group.position.z = opts.y
  }

  update (dt) {
    super.update(dt)
  }

  destroy () {
  }
}

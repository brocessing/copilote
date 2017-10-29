/* global THREE */
import store from 'utils/store'
import map from 'controllers/map/map'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import three from 'controllers/three/three'

export default class Terrain extends ThreeComponent {
  // t: type / p: pos / r: rotation / n: neighbors links
  setup ({ t, p, r }) {
    // console.log('added')
    this.group = new THREE.Mesh(store.get('geo.roads')[t], store.get('mat.road'))
    this.group.rotation.y = r * Math.PI / 2
    this.group.position.x = p[0] + 0.5
    this.group.position.z = p[1] + 0.5
  }

  update (dt) {
    super.update(dt)
  }

  destroy () {
  }
}

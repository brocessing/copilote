/* global THREE, p2 */

import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'

export default class Box extends ThreeComponent {
  setup ({ x, y, width, height }) {
    this.group = new THREE.Mesh(store.get('geo.box'), store.get('mat.blue'))
    this.group.scale.set(width, 1, height)
    this.body = new p2.Body({ mass: 0.5 * ((width + height) / 2), position: [x, y] })
    const shape = new p2.Box({ width, height: height })
    this.body.addShape(shape)
    three.debugBody(this.body)
  }

  update (dt) {
    super.update(dt)
    this.body.velocity[0] *= 0.95
    this.body.velocity[1] *= 0.95
    this.body.angularVelocity *= 0.95
    three.bodyCopy(this.body, this.group)
  }
}

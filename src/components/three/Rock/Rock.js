/* global THREE, p2 */

import config from 'config'
import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import prng from 'utils/prng'
import props from 'shaders/props/props'

const TYPES = {
  0: 'large',
  1: 'medium',
  2: 'small'
}

export default class Rock extends ThreeComponent {
  setup ({ x, y, cx, cy }) {
    const type = prng.hash2dInt(x + cx, y + cy, 0, 2)

    this.group = new THREE.Mesh(
      store.get('geo.rock.' + TYPES[type]),
      props.getMaterial()
    )

    const posx = x + 0.5
    const posy = 0.012
    const posz = y + 0.5
    const angle = prng.random() * Math.PI * 2 + Math.PI / 2

    this.body = new p2.Body({
      position: [-(cx + posx), cy + posz],
      angle: angle
    })

    this.body.propType = 'prop'

    if (type === 0) this.shapeA = this.body.addShape(new p2.Box({ width: 0.77, height: 0.77 }), [0.0, 0.0], 0)
    else if (type === 1) this.shapeA = this.body.addShape(new p2.Box({ width: 0.35, height: 0.35 }), [0.0, -0.1], -0.3)
    else if (type === 2) this.shapeA = this.body.addShape(new p2.Box({ width: 0.65, height: 0.7 }), [0.0, 0.0], -0.6)

    this.group.position.x = -this.body.position[0] - cx
    this.group.position.y = posy
    this.group.position.z = this.body.position[1] - cy
    this.group.rotation.y = this.body.angle

    // three.debugBody(this.body)
  }

  update (dt) {
    // no need updates for fixed props
  }

  destroy () {
    super.destroy()
  }
}

/* global THREE, p2 */

import config from 'config'
import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import prng from 'utils/prng'
import props from 'shaders/props/props'

export default class Station extends ThreeComponent {
  setup ({ x, y, cx, cy }) {
    this.group = new THREE.Mesh(
      store.get('geo.station'),
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
    this.shapeA = this.body.addShape(new p2.Box({ width: 0.79, height: 0.36 }), [0.01, -0.2])
    this.shapeB = this.body.addShape(new p2.Box({ width: 0.33, height: 0.09 }), [0, 0.33])

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

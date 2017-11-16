/* global THREE, p2 */

import config from 'config'
import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import prng from 'utils/prng'
import props from 'shaders/props/props'

export default class Nature2x extends ThreeComponent {
  setup ({ x, y, cx, cy }) {
    this.group = new THREE.Mesh(
      store.get('geo.nature2x'),
      props.getMaterial()
    )

    const posx = x + 0.5
    const posy = 0.012
    const posz = y + 0.5
    const angle = 0 // Math.PI / 2

    this.body = new p2.Body({
      position: [-(cx + posx), cy + posz],
      angle: angle
    })

    this.body.propType = 'prop'
    this.shapeA = this.body.addShape(new p2.Box({ width: 1.4, height: 1.5 }), [0.4, -0.5])

    this.group.position.x = -this.body.position[0] - cx
    this.group.position.y = posy
    this.group.position.z = this.body.position[1] - cy
    this.group.rotation.y = this.body.angle

    store.set('prop.bank', this.group)
    // three.debugBody(this.body)
  }

  update (dt) {
    // no need updates for fixed props
  }

  destroy () {
    super.destroy()
  }
}

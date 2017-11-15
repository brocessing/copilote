/* global THREE, p2 */

import config from 'config'
import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import prng from 'utils/prng'

import props from 'shaders/props/props'

export default class Cactus extends ThreeComponent {
  setup ({ x, y, cx, cy }) {
    // console.log('CACTUS')

    // console.log(x, y)
    this.cx = cx
    this.cy = cy
    this.group = new THREE.Mesh(
      store.get('geo.cactus'),
      !config.lofi ? props.getMaterial() : store.get('mat.wireframe')
    )
    // this.group.scale.set(1, 4, 1)
    // this.group.position.y = 2
    this.body = new p2.Body({
      position: [-(cx + x + 0.5), cy + y + 0.5],
      angle: prng.random() * Math.PI * 2
    })

    this.body.addShape(new p2.Box({ width: 0.06, height: 0.06 }), [-0.05, 0.13])
    this.body.addShape(new p2.Box({ width: 0.06, height: 0.06 }), [0.11, -0.07])
    this.body.addShape(new p2.Box({ width: 0.06, height: 0.06 }), [-0.08, -0.15])
    // this.shape.material = new p2.Material()
    // this.contactMaterials.push(new p2.ContactMaterial(store.get('car.p2material'), this.shape.material, {
    //   restitution: 0.6,
    //   stiffness: Number.MAX_VALUE
    // }))
    // this.group.castShadow = true
    // console.log(store.get('car.p2material'))
    // three.debugBody(this.body)
  }

  update (dt) {
    super.update(dt)
    // this.body.velocity[0] *= 0.95
    // this.body.velocity[1] *= 0.95
    // this.body.angularVelocity *= 0.95
    three.bodyCopy(this.body, this.group, this.cx, this.cy)
  }

  destroy () {
    super.destroy()
  }
}

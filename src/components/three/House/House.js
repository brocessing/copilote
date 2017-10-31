/* global THREE, p2 */

import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'

export default class House extends ThreeComponent {
  setup ({ x, y, cx, cy }) {
    // console.log(x, y)
    this.cx = cx
    this.cy = cy
    this.group = new THREE.Mesh(store.get('geo.box'), store.get('mat.orange'))
    this.group.scale.set(1, 4, 1)
    this.group.position.y = 2
    this.body = new p2.Body({ position: [-(cx + x + 0.5), cy + y + 0.5] })
    this.shape = new p2.Box({ width: 1, height: 1 })
    this.body.addShape(this.shape)
    this.shape.material = new p2.Material()
    // this.group.castShadow = true
    // console.log(store.get('car.p2material'))
    this.world.addContactMaterial(new p2.ContactMaterial(store.get('car.p2material'), this.shape.material, {
      restitution: 0.6,
      stiffness: Number.MAX_VALUE
    }))
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
    this.world.addContactMaterial(store.get('car.p2material'), this.shape.material)
    super.destroy()
  }
}

/* global THREE */

import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'

export default class BodyViewer extends ThreeComponent {
  setup (body) {
    this.pos = body.position
    this.body = body
    const wire = store.get('mat.wireframe')
    const cube = store.get('geo.box')
    this.boxes = []
    body.shapes.forEach(shape => {
      console.log('SHAPE', shape)
      const box = new THREE.Mesh(cube, wire)
      box.scale.set(shape.width, 1, shape.height)
      three.bodyCopy(shape, box)
      this.group.add(box)
      this.boxes.push(box)
    })
  }

  update (dt) {
    three.bodyCopy(this.body, this.group)
  }
}

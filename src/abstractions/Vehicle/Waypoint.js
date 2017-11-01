/* global THREE */
import store from 'utils/store'
import map from 'controllers/map/map'
import three from 'controllers/three/three'

import Arrow from 'components/three/Arrow/Arrow'

export default class Waypoint {
  // t: type / p: pos / r: rotation / n: neighbors links
  constructor (opts) {
    console.log(opts)
    this.angle = opts.r * -Math.PI / 2
    this.x = opts.x
    this.y = opts.y
    this.improvised = !!opts.improvised
    this.debug = !!opts.debug
    console.log('HOLA')
    if (this.debug) {
      console.log('HOLA')
      this.debugArrow = new Arrow({
        x: this.x,
        y: 0.01,
        z: this.y,
        r: this.angle + Math.PI
      })
      three.getScene().add(this.debugArrow.group)
    }
    // console.log('added')
    // let mat
    // if (impro) mat = store.get('mat.red')
    // this.meshes.arrow = new THREE.Mesh(store.get('geo.box'), mat)
    // this.meshes.base = new THREE.Mesh(store.get('geo.box'), mat)
    // this.group.add(this.meshes.arrow)
    // this.group.add(this.meshes.base)
    // this.meshes.base.scale.set(3, 1, 0.2)
    // this.meshes.base.position.set(0, 0, 0.5)
    // this.group.scale.set(0.05, 0.02, 0.2)
    // this.group.position.set(x, 0, y)
    // this.group.rotation.y = r * -Math.PI / 2
    // this.position = this.group.position
    // three.getScene().add(this.group)
  }

  destroy () {
    if (this.debug) {
      three.getScene().remove(this.debugArrow)
      this.debugArrow.destroy()
    }
  }
}

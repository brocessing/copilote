/* global THREE */
import store from 'utils/store'
import map from 'controllers/map/map'
import three from 'controllers/three/three'

import Arrow from 'components/three/Arrow/Arrow'

const colors = {
  '-2': 'gray',
  '-1': 'red',
  '0': 'blue',
  '1': 'green'
}

export default class Waypoint {
  // t: type / p: pos / r: rotation / n: neighbors links
  constructor (opts) {
    // console.log(opts)
    this.angle = opts.r * -Math.PI / 2
    this.x = opts.x
    this.y = opts.y
    this.direction = opts.r
    this.type = opts.type
    this.improvised = !!opts.improvised
    this.debug = !!opts.debug
    // console.log('HOLA')
    if (this.debug) {
      // console.log('HOLA')
      this.debugArrow = new Arrow({
        x: this.x,
        y: 0.01,
        z: this.y,
        r: this.angle + Math.PI,
        color: colors[opts.type]
      })
      three.getScene().add(this.debugArrow.group)
    }
  }

  destroy () {
    if (this.debug) {
      three.getScene().remove(this.debugArrow)
      this.debugArrow.destroy()
    }
  }
}

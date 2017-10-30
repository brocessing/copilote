import three from 'controllers/three/three'
import map from 'controllers/map/map'

export default class Driver {
  constructor (opts) {
    this.vehicle = opts.vehicle
    this.chassis = this.vehicle.chassisBody
    this.vehicle.speed = 0
    this.maxSpeed = 1
    this.orders = []

    this.forward = false
    this.backward = false
    this.turn = 0

    this.pos = this.chassis.position
    this.vel = this.chassis.velocity
    console.log(map.getRoadFromPos(this.pos[0], this.pos[1]))
  }

  randomOrders () {

  }

  update (dt) {
    // speed limiter
    this.vehicle.speed = (this.vel[0] ** 2 + this.vel[1] ** 2) / 2
    if (this.vehicle.speed > this.maxSpeed) {
      const mult = this.maxSpeed / this.vehicle.speed
      this.vel[0] *= mult
      this.vel[1] *= mult
    }
  }
}

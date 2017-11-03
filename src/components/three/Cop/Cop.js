/* global THREE, p2 */

import map from 'controllers/map/map'
import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import Vehicle from 'abstractions/Vehicle/Vehicle'
import config from 'config'
import orders from 'controllers/orders/orders'
import events from 'utils/events'
import noop from 'utils/noop'
/*
  this.group = position sync with the p2 body position
  this.chassis = angle sync with the p2 angle
*/

export default class Cop extends Vehicle {
  setup (opts) {
    this.onDeath = opts.onDeath || noop
    this.onRemoved = opts.onRemoved || noop
    // Vehicle: three
    this.chassis = new THREE.Mesh(store.get('geo.bandit'), store.get('mat.cars'))
    this.group.add(this.chassis)

    this.meshes.shadow = new THREE.Mesh(store.get('geo.plane'), store.get('mat.shadow'))
    const shadow = this.meshes.shadow
    shadow.scale.set(0.11, 0.205, 1)
    shadow.rotation.x = -Math.PI / 2
    shadow.position.set(0, 0.001, 0)
    this.group.add(this.meshes.shadow)
    if (config.lofi) this.meshes.shadow.visible = false

    // Vehicle: p2 main physic attributes
    this.body = new p2.Body({ mass: 1.5, position: [0, 0] })
    const box = new p2.Box({ width: 0.08, height: 0.16 })
    box.material = new p2.Material()
    this.body.addShape(box)
    store.set('car.p2material', box.material)

    // Vehicle: p2.Vehicle specific properties
    this.vehicle = new p2.TopDownVehicle(this.body)
    this.frontWheel = this.vehicle.addWheel({ localPosition: [0, 0.2] })
    this.backWheel = this.vehicle.addWheel({ localPosition: [0, -0.2] })

    // Vehicle driving behaviours
    this.improvise = true
    this.improvisationTreshold = 3
    this.running = true

    this.improvisationMode = 1

    // Misc options
    this.debugSteering = true
    this.debugWaypoints = true
    this.manualControls = false
    this.id = opts.id

    this.maxSpeed = 1.2
    this.backWheelFriction = 3.3
    this.maxSteer = Math.PI / 4
  }

  update (dt) {
    super.update(dt)
    this.meshes.shadow.rotation.z = this.chassis.rotation.y
    events.emit('cop.move', { id: this.id, position: [this.group.position.x, this.group.position.z] })

    const ppos = store.get('player.position')
    const dist = Math.pow(ppos[0] - this.group.position.x, 2) + Math.pow(ppos[1] - this.group.position.z, 2)
    if (dist > 1000) this.onRemoved(this)
  }

  destroy (dt) {
  }
}

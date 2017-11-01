/* global THREE, p2 */

import map from 'controllers/map/map'
import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import Vehicle from 'abstractions/Vehicle/Vehicle'
import config from 'config'
/*
  this.group = position sync with the p2 body position
  this.chassis = angle sync with the p2 angle
*/

export default class PlayerCar extends Vehicle {
  setup (opts) {
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
    this.body = new p2.Body({ mass: 2, position: [0, 0] })
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

    // Misc options
    this.debugSteering = true
    this.debugWaypoints = true
    this.manualControls = false

    store.set('player.position', [0, 0])
    store.set('player.angle', 0)
  }

  update (dt) {
    super.update(dt)

    store.set('car.speed', this.speed)
    store.set('car.angvel', this.body.angularVelocity)

    this.meshes.shadow.rotation.z = this.chassis.rotation.y

    store.set('player.position', [this.group.position.x, this.group.position.z])
    store.set('player.angle', this.chassis.rotation.y)
    map.updateCenter(this.group.position.x, this.group.position.z)
  }
}

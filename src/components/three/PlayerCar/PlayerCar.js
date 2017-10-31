/* global THREE, p2 */

import map from 'controllers/map/map'
import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import kbControls from 'utils/keyboardControls'
import Driver from 'components/three/Driver/Driver'

export default class PlayerCar extends ThreeComponent {
  setup () {
    this.meshes.car = new THREE.Mesh(store.get('geo.bandit'), store.get('mat.cars'))
    // this.meshes.car.scale.set(0.07, 0.07, 0.07)
    this.group.add(this.meshes.car)
    this.targetRot = 0

    this.body = new p2.Body({ mass: 1, position: [0, 0] })
    const box = new p2.Box({ width: 0.08, height: 0.16 })
    this.body.addShape(box)

    this.vehicle = new p2.TopDownVehicle(this.body)
    const frontWheel = this.vehicle.addWheel({ localPosition: [0, 0.5] })
    this.frontWheel = frontWheel
    frontWheel.setSideFriction(3)
    const backWheel = this.vehicle.addWheel({ localPosition: [0, -0.5] })
    backWheel.setSideFriction(1)
    frontWheel.targetSteerValue = 0

    box.material = new p2.Material()
    store.set('car.p2material', box.material)

    this.driver = new Driver({ vehicle: this.vehicle, backWheel, frontWheel })
  }

  update (dt) {
    super.update(dt)
    this.driver.update(dt)

    store.set('car.speed', this.vehicle.speed)
    store.set('car.angvel', this.body.angularVelocity)

    three.bodyCopy(this.body, this.group)
    this.frontWheel.steerValue += (this.frontWheel.targetSteerValue - this.frontWheel.steerValue) * 0.08
    this.targetRot = this.body.angularVelocity / 80 * -(this.body.velocity[0] + this.body.velocity[1])
    this.meshes.car.rotation.z += (this.targetRot - this.meshes.car.rotation.z) * 0.2
    this.targetRot = this.body.angularVelocity / 100 * -(this.body.velocity[0] + this.body.velocity[1])
    this.meshes.car.rotation.x += (this.targetRot - this.meshes.car.rotation.x) * 0.1

    map.updateCenter(this.group.position.x, this.group.position.z)
  }
}

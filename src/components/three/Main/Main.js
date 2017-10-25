/* global THREE, p2 */

import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'

import ParticleSystem from 'components/three/ParticleSystem/ParticleSystem'

export default class Main extends ThreeComponent {
  setup () {
    this.pg = new THREE.Group()
    this.pg.scale.set(2, 2, 2)
    this.pg.position.z = -8
    this.pg.rotation.x = -1
    this.p = new ParticleSystem()
    this.p2 = new ParticleSystem()
    this.meshes.car = new THREE.Mesh(store.get('geo.r5'), store.get('mat.gradient'))
    this.meshes.car.scale.set(0.07, 0.07, 0.07)
    this.group.add(this.meshes.car)
    this.meshes.car.add(this.pg)
    this.geometries.box = new THREE.BoxGeometry(1, 1, 1)
    this.materials.basic = new THREE.MeshBasicMaterial({color: 0x00ff00})
    this.meshes.cube = new THREE.Mesh(this.geometries.box, this.materials.basic)
    // this.group.add(this.meshes.cube)
    this.meshes.car.rotation.x = Math.PI / 2
    this.meshes.car.rotation.y = Math.PI

    this.world = new p2.World({ gravity: [0, 0] })
    this.chassisBody = new p2.Body({ mass: 1, position: [0, 0] })
    const boxShape = new p2.Box({ width: 0.5, height: 1 })
    this.chassisBody.addShape(boxShape)
    this.world.addBody(this.chassisBody)

    this.vehicle = new p2.TopDownVehicle(this.chassisBody)
    const frontWheel = this.vehicle.addWheel({ localPosition: [0, 0.5] })
    frontWheel.setSideFriction(4)
    const backWheel = this.vehicle.addWheel({ localPosition: [0, -0.5] })
    backWheel.setSideFriction(3)
    this.vehicle.addToWorld(this.world)
    const keys = {
      '37': 0, // left
      '39': 0, // right
      '38': 0, // up
      '40': 0 // down
    }
    const maxSteer = Math.PI / 5
    document.addEventListener('keydown', (evt) => {
      keys[evt.keyCode] = 1
      onInputChange()
    })
    document.addEventListener('keyup', (evt) => {
      keys[evt.keyCode] = 0
      onInputChange()
    })
    const self = this
    function onInputChange () {
      // Steer value zero means straight forward. Positive is left and negative right.
      frontWheel.steerValue = maxSteer * (keys[37] - keys[39])

      // Engine force forward
      backWheel.engineForce = keys[38] * 7
      backWheel.setBrakeForce(4)
      if (keys[40]) {
        if (backWheel.getSpeed() > 0.1) {
          // Moving forward - add some brake force to slow down
          backWheel.setBrakeForce(5)
        } else {
          // Moving backwards - reverse the engine force
          backWheel.setBrakeForce(0)
          backWheel.engineForce = -2
        }
      }
    }
    three.getCamera().position.z = 2
    three.getCamera().position.y = -4
    three.getCamera().position.x = 1
    three.getCamera().lookAt(this.meshes.car.position)
    three.getCamera().rotation.z = 0
    three.getCamera().rotation.y = 0
  }

  update (dt) {
    const self = this
    self.p.emit({
      parent: self.group,
      count: 1,
      position: self.meshes.car.localToWorld(new THREE.Vector3(-2.8, 0.1, -7)),
      rotation: self.meshes.car.rotation,
      color: 0xd79a4f,
      life: 50
    })
    self.p2.emit({
      parent: self.group,
      count: 1,
      position: self.meshes.car.localToWorld(new THREE.Vector3(2.8, 0.1, -7)),
      rotation: self.meshes.car.rotation,
      color: 0xd79a4f,
      life: 50
    })
    this.p.update(dt)
    this.p2.update(dt)
    this.world.step(1 / 60)
    console.log(this.chassisBody)
    this.meshes.car.position.x = this.chassisBody.position[0]
    this.meshes.car.position.y = this.chassisBody.position[1]
    // this.meshes.car.position.x = this.chassisBody.position[0]
    this.meshes.car.rotation.y = this.chassisBody.angle + Math.PI
    // this.meshes.car.rotation.x += 0.1
    this.meshes.car.rotation.z = this.chassisBody.angularVelocity / 50 * -(this.chassisBody.velocity[0] + this.chassisBody.velocity[1])
    // this.meshes.car.rotation.x += 0.01
    // this.meshes.car.rotation.x += 0.01
  }
}

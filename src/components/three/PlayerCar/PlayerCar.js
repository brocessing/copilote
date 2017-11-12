/* global THREE, p2 */

import map from 'controllers/map/map'
import store from 'utils/store'
import three from 'controllers/three/three'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import Vehicle from 'abstractions/Vehicle/Vehicle'
import config from 'config'
import orders from 'controllers/orders/orders'
import kbctrl from 'utils/keyboardControls'
import cam from 'controllers/camera/camera'
import particles from 'controllers/particles/particles'
import gui from 'controllers/datgui/datgui'
import sfx from 'controllers/sfx/sfx'

import player from 'shaders/player/player'
/*
  this.group = position sync with the p2 body position
  this.chassis = angle sync with the p2 angle
*/

export default class PlayerCar extends Vehicle {
  setup (opts) {
    // Vehicle: three
    this.chassis = new THREE.Mesh(store.get('geo.bandit'), player.getMaterial())
    this.group.add(this.chassis)
    this.group.position.y = 0.0195

    this.meshes.shadow = new THREE.Mesh(store.get('geo.plane'), store.get('mat.shadow'))
    const shadow = this.meshes.shadow
    shadow.scale.set(0.11, 0.205, 1)
    shadow.rotation.x = -Math.PI / 2
    shadow.position.set(0, 0.001, 0)
    this.group.add(this.meshes.shadow)
    if (config.lofi) this.meshes.shadow.visible = false

    // Vehicle: p2 main physic attributes
    this.body = new p2.Body({ mass: 2, position: [0, 0.1] })
    this.body.propType = 'player'
    const self = this
    this.body.impactCallback = function (opts) {
      if (opts.impactType === 'cop') {
        self.damage(10)
      }
    }

    const box = new p2.Box({ width: 0.1, height: 0.21 })
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
    this.running = false

    // 0: Prefer to go straight
    // 1: Totally random between left / right / top
    this.improvisationMode = 0

    // Misc options
    this.debugSteering = true
    this.debugWaypoints = true
    this.manualControls = false

    store.set('player.position', [0, 0])
    store.set('player.angle', 0)
    store.set('player.vehicle', this)
    store.set('player.body', this.body)

    this.onOrder = this.onOrder.bind(this)
    orders.on(':all', this.onOrder)

    this.maxLife = 40
    this.life = this.maxLife
    // three.debugBody(this.body)

    gui.add(this, 'damage').name('Damage Player')

    this.frontWheel.steerValue = 0
    this.frontWheel.targetSteerValue = 0
    this.backWheel.steerValue = 0
    this.backWheel.targetSteerValue = 0
    this.engineForce = 0
    this.backWheel.setBrakeForce(3)
    this.manualControls = true
    kbctrl(this.frontWheel, this.backWheel)

    this.isPlayer = true
  }

  damage (val = 1) {
    this.life = Math.max(0, this.life - val)
    const lifeIndice = this.life / this.maxLife
    this.smokeDensity = (1 - lifeIndice) * 5
    player.setLife(lifeIndice)
    if (this.life <= 0) this.explode()
  }

  didDie () {
    this.smokeDensity = 15
    particles.emit({
      x: this.group.position.x,
      y: 0.1,
      z: this.group.position.z,
      type: 2,
      amount: 55
    })
    particles.emit({
      x: this.group.position.x,
      y: 0.1,
      z: this.group.position.z,
      type: 3,
      amount: 25
    })
    cam.addCameraShake(1.2)
    store.set('player.dead', true)
  }

  update (dt) {
    super.update(dt)

    this.meshes.shadow.rotation.z = this.chassis.rotation.y

    store.set('player.velocity', this.body.velocity)
    store.set('player.position', [this.group.position.x, this.group.position.z])
    store.set('player.angle', this.chassis.rotation.y)
    map.updateCenter(this.group.position.x, this.group.position.z)

    sfx.updateEngine(this.body.velocity, this.body.angularVelocity, !!this.dead)
  }

  onOrder (data) {
    if (data.type === 'start') {
      this.manualControls = false
      this.running = true
      return
    }

    if (data.type === 'goStraight') {
      // if (this.running === false) return
      this.waypoints.goStraight()
    }

    if (data.type === 'goLeft') {
      // if (this.running === false) return
      this.waypoints.turnLeft()
    }

    if (data.type === 'goRight') {
      // if (this.running === false) return
      this.waypoints.turnRight()
    }

    if (data.type === 'turnBack') {
      // if (this.running === false) return
      this.waypoints.turnBack()
    }

    if (data.type === 'stop') {
      this.running = false
      return
    }

    if (data.type === 'goManual') {
      this.frontWheel.steerValue = 0
      this.frontWheel.targetSteerValue = 0
      this.backWheel.steerValue = 0
      this.backWheel.targetSteerValue = 0
      this.engineForce = 0
      this.backWheel.setBrakeForce(3)
      this.manualControls = true
      kbctrl(this.frontWheel, this.backWheel)
    }
  }
}

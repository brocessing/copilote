/* global THREE */

import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import WaypointManager from './WaypointManager'
import Arrow from 'components/three/Arrow/Arrow'
import nmod from 'utils/nmod'
import store from 'utils/store'
import particles from 'controllers/particles/particles'
import prng from 'utils/prng'
import map from 'controllers/map/map'
export default class Vehicle extends ThreeComponent {
  constructor (opts) {
    super(opts)
    this.speed = 0
    this.maxSpeed = this.maxSpeed !== undefined ? this.maxSpeed : 1
    this.speedMult = 1
    this.dead = false

    // conf
    this.maxSteer = this.maxSteer !== undefined ? this.maxSteer : Math.PI / 5.2
    this.engineBaseForce = this.engineBaseForce !== undefined ? this.engineBaseForce : 2.5 //2.3
    this.frontWheelFriction = this.frontWheelFriction !== undefined ? this.frontWheelFriction : 2
    this.backWheelFriction = this.backWheelFriction !== undefined ? this.backWheelFriction : 2.9
    this.lerpSteerValue = this.lerpSteerValue !== undefined ? this.lerpSteerValue : 0.068
    this.running = !!this.running
    this.useBackward = !!this.backwardDetection
    this.useAntiObstacle = !!this.useAntiObstacle

    this.frontWheel.setSideFriction(this.frontWheelFriction)
    this.backWheel.setSideFriction(this.backWheelFriction)

    this.needsBackwardScore = 0
    this.needsBackward = false
    this.antiObstacleScore = 0
    this.antiObstacle = false
    this.antiObstacleDir = 1

    this.bodyPos = this.body.position
    this.bodyVel = this.body.velocity

    this.waypoints = new WaypointManager({
      isPlayer: !!this.isPlayer,
      debug: !!this.debugWaypoints,
      improvise: !!this.improvise,
      improvisationTreshold: this.improvisationTreshold,
      improvisationMode: this.improvisationMode,
      posPointer: this.bodyPos
    })

    if (this.debugSteering) {
      this.steeringArrow = this.addComponent(new Arrow({ y: 0.1 }))
    }

    this.frontWheel.targetSteerValue = 0

    this.smokeDensity = 0
    this.smokeTimer = 0
    this.smokeCycle = 300

    this.sandDensity = 0
    this.sandTimer = 0
    this.sandCycle = 300

    this.steerSmokeDensity = 0
    this.steerSmokeTimer = 0
    this.steerSmokeCycle = 10
  }

  limitSpeed () {
    const max = this.maxSpeed * (this.isPlayer ? this.speedMult : 1)
    if (this.speed > max) {
      const mult = max / this.speed
      this.bodyVel[0] *= mult
      this.bodyVel[1] *= mult
      this.speed = max
    }
  }

  didDie () {}

  deadUpdate (dt) {
    if (!this.alreadyDead) {
      this.backWheel.setBrakeForce(3)
      this.frontWheel.targetSteerValue = 0
      this.frontWheel.steerValue = 0
      this.frontWheel.engineForce = 0
      // console.log(this.body)
      if (this.vehicle) this.vehicle.removeFromWorld()
      this.vehicle = undefined
      this.world.addBody(this.body)
      this.deadForceTimer = 800
      this.alreadyDead = true
      this.chassis.material = store.get('mat.sprites2')
      this.didDie()
    }

    if (this.deadForceTimer > 0) {
      const f = this.deadForceTimer / 800
      this.body.applyForceLocal([4.0 * f, -6.0 * f], [0, 0.06 * f])
      this.body.applyForceLocal([3.0 * f, -1.0 * f])
      this.deadForceTimer -= dt
    }
    this.body.velocity[0] *= 0.95
    this.body.velocity[1] *= 0.95
    this.body.angularVelocity *= 0.95
    this.group.position.x = -this.bodyPos[0]
    this.group.position.z = this.bodyPos[1]
    this.chassis.rotation.y = this.body.angle
  }

  smokeUpdate (dt) {
    if (this.smokeDensity > 0) {
      if (this.smokeTimer > this.smokeCycle) {
        particles.emit({
          x: this.group.position.x + (prng.random() * 2 - 1) * 0.05,
          y: 0.05,
          z: this.group.position.z + (prng.random() * 2 - 1) * 0.05,
          type: 1,
          amount: Math.min(2, Math.max(1, 1 * this.smokeDensity))
        })
        this.smokeTimer = 0
      } else {
        this.smokeTimer += dt * this.smokeDensity
      }
    }
    if (this.sandDensity > 0) {
      if (this.sandTimer > this.sandCycle) {
        const vec = this.chassis.localToWorld(new THREE.Vector3(-0.04, 0, -0.06))
        const vec2 = this.chassis.localToWorld(new THREE.Vector3(0.04, 0, -0.06))
        particles.emit({
          x: vec.x,
          y: 0,
          z: vec.z,
          type: 0,
          amount: Math.min(6, Math.max(1, 1 * this.sandDensity))
        })
        particles.emit({
          x: vec2.x,
          y: 0,
          z: vec2.z,
          type: 0,
          amount: Math.min(6, Math.max(1, 1 * this.sandDensity))
        })
        this.sandTimer = 0
      } else {
        this.sandTimer += dt * this.sandDensity
      }
    }
    if (this.steerSmokeDensity > 0) {
      if (this.steerSmokeTimer > this.steerSmokeCycle) {
        const vec = this.chassis.localToWorld(new THREE.Vector3(-0.04, 0, -0.06))
        const vec2 = this.chassis.localToWorld(new THREE.Vector3(0.04, 0, -0.06))
        particles.emit({
          x: vec.x,
          y: 0,
          z: vec.z,
          type: 4,
          amount: Math.min(6, Math.max(1, 1 * this.steerSmokeDensity))
        })
        particles.emit({
          x: vec2.x,
          y: 0,
          z: vec2.z,
          type: 4,
          amount: Math.min(6, Math.max(3, 1 * this.steerSmokeDensity))
        })
        this.steerSmokeTimer = 0
      } else {
        this.steerSmokeTimer += dt * this.steerSmokeDensity
      }
    }
  }

  update (dt) {
    super.update(dt)

    const road = map.getRoadFromThreePos(this.group.position.x, this.group.position.z)

    if (!road) {
      this.sandDensity = 17 * this.speed
      this.speedMult = 0.7
      if (this.isPlayer) this.backWheel.setSideFriction(2.4)
    } else if (road.c === 15) {
      this.sandDensity = 9 * this.speed
      this.speedMult = 0.8
      if (this.isPlayer) this.backWheel.setSideFriction(2.4)
    } else {
      this.sandDensity = 0
      this.speedMult = 1
      if (this.isPlayer) this.backWheel.setSideFriction(2.9)
    }


    // update & limit speed
    this.speed = (this.bodyVel[0] ** 2 + this.bodyVel[1] ** 2) / 2
    this.limitSpeed()
    this.angularVelocity = this.body.angularVelocity

    const angVel = Math.abs(this.angularVelocity)
    this.steerSmokeDensity = (angVel * 0.2) * (angVel > 1.6)

    this.smokeUpdate(dt)



    if (this.dead) {
      this.deadUpdate(dt)
      return
    }

    // update waypoints list
    if (!this.target) {
      this.waypoints.update(this.bodyPos, this.body.angle)
    }

    if (this.running && this.target) {
      this.goto(this.target[0], this.target[1])
    } else if ((this.running || this.manualControls) && this.waypoints.list.length > 0) {
      const closest = this.waypoints.getClosest(-this.bodyPos[0], this.bodyPos[1])
      // console.log(closest.point)
      // console.log(closest.distance)
      // const point = closest.distance < 1.1 ? closest.point : this.waypoints[0]
      this.goto(closest.point)
    } else if (!this.manualControls) {
      this.frontWheel.targetSteerValue = 0
      this.engineForce = 0
      this.backWheel.setBrakeForce(4)
    }

    // copy p2 body parameters to the three group & car
    this.group.position.x = -this.bodyPos[0]
    this.group.position.z = this.bodyPos[1]
    this.chassis.rotation.y = this.body.angle
    // console.log(this.body.angle)

    this.frontWheel.steerValue += (
      (this.frontWheel.targetSteerValue - this.frontWheel.steerValue) *
      (!this.target ? this.lerpSteerValue : 0.4)
    )
    this.targetRot = this.body.angularVelocity / 80 * -(this.body.velocity[0] + this.body.velocity[1])
    this.chassis.rotation.z += (this.targetRot - this.chassis.rotation.z) * 0.2
    this.targetRot = this.body.angularVelocity / 100 * -(this.body.velocity[0] + this.body.velocity[1])
    this.chassis.rotation.x += (this.targetRot - this.chassis.rotation.x) * 0.1
  }

  // One argument: waypoint
  // two arguments: x + y (parallelAng method not used)
  goto (arg1, arg2) {
    const useParallelAng = false // (arg2 !== undefined)
    const isWaypoint = (arg2 === undefined)

    let parallelAng = 0
    if (arg2) {
      // console.log(arg1, arg2)
    }
    // the parallelAng method
    // car angle adjusted to match the next waypoint angle
    // it's cool to smooth the path a bit
    if (useParallelAng) {
      const waypoint = arg1
      const wpNormAng = nmod(waypoint.angle - Math.PI, Math.PI * 2)
      const carNormAng = nmod(this.body.angle, Math.PI * 2)

      parallelAng = wpNormAng - carNormAng
      if (Math.abs(wpNormAng - carNormAng) >= Math.PI) {
        parallelAng -= Math.sign(wpNormAng - carNormAng) * (Math.PI * 1.9)
      }
    }

    // the lookAtAng target method
    // angle of the vehicle adjusted to go directly to the coords
    // reliable but the car can hit buildings
    const targetX = isWaypoint ? arg1.x : arg1
    const targetY = isWaypoint ? arg1.y : arg2

    let lookAtAng = -Math.atan2(
      targetY - this.bodyPos[1], targetX + this.bodyPos[0]
    ) + Math.PI / 2 - this.body.angle

    lookAtAng = lookAtAng % (Math.PI * 2)
    if (Math.abs(lookAtAng) >= Math.PI) {
      lookAtAng -= Math.sign(lookAtAng) * (Math.PI * 2)
    }

    // blend the two methods together (or just use lookAtAng)
    let steerAng = useParallelAng
      ? parallelAng * 0.4 + lookAtAng * 0.6
      : lookAtAng

    // handle backward when the car stay too long in a revert ang
    if (steerAng > Math.PI * 0.6 || steerAng < -Math.PI * 0.6) {
      if (this.needsBackwardScore < 35 && this.needsBackwardScore + 1 >= 35) {
        // console.warn('Backward')
        this.needsBackwardScore = 60
      }
      this.needsBackwardScore = Math.min(80, this.needsBackwardScore + 1)
    } else {
      this.needsBackwardScore = Math.max(0, this.needsBackwardScore - 1)
    }
    this.needsBackward = !(this.needsBackwardScore < 35)

    // Reverse the engine when the car doesn't move for too long
    if (this.running && this.speed < 0.005) {
      if (
        (this.antiObstacleScore < 35 && this.antiObstacleScore + 1 >= 35) ||
        (this.antiObstacleScore < 180 && this.antiObstacleScore + 1 >= 120)
      ) {
        // console.warn('Antiblock Trigger')
        this.antiObstacleDir = (this.antiObstacleDir + 1) % 4
        this.antiObstacleScore = 80
      }
      this.antiObstacleScore = Math.min(240, this.antiObstacleScore + 1)
    } else {
      this.antiObstacleScore = Math.max(0, this.antiObstacleScore - 1)
    }
    this.antiObstacle = !(this.antiObstacleScore < 35)
    if (this.antiObstacle) steerAng += Math.PI * this.antiObstacleDir

    // clamp the value
    steerAng = Math.max(-this.maxSteer, Math.min(this.maxSteer, steerAng))

    let obstacleEngineForce = 1
    let obstacleSteerAng = 1
    if (this.antiObstacle) {
      obstacleEngineForce = ((this.antiObstacleDir > 1) * 2) - 1
      obstacleSteerAng = (this.antiObstacleDir % 2) * 2 - 1
      // console.warn(obstacleEngineForce, obstacleSteerAng)
    }

    // stop here if we are in manual mode
    if (this.debugSteering) {
      this.steeringArrow.group.rotation.y = this.body.angle + steerAng
    }
    if (this.manualControls) return

    if (this.backWard) this.backWheel.setBrakeForce(1)
    else this.backWheel.setBrakeForce(1)

    if (this.antiObstacle) this.backWheel.setBrakeForce(0)
    // update engineForce and steer value
    this.frontWheel.engineForce = (
      this.engineBaseForce * (this.needsBackward ? -0.7 : 1) * obstacleEngineForce
    )
    this.frontWheel.targetSteerValue = (
      steerAng * (this.needsBackward ? -1 : 1) * obstacleSteerAng
    )
  }

  destroy () {
    if (this.body) { this.body.propType = 'dead'; this.body.impactCallback = undefined }
    super.destroy()
    this.chassis = null
  }

  explode () {
    this.dead = true
    if (this.body) { this.body.propType = 'dead'; this.body.impactCallback = undefined }
  }
}

/* global THREE */

import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import WaypointManager from './WaypointManager'
import Arrow from 'components/three/Arrow/Arrow'
import nmod from 'utils/nmod'
import kbctrl from 'utils/keyboardControls'

export default class Vehicle extends ThreeComponent {
  constructor (opts) {
    super(opts)
    this.speed = 0
    this.maxSpeed = 1

    // conf
    this.maxSteer = this.maxSteer !== undefined ? this.maxSteer : Math.PI / 5.2
    this.engineBaseForce = this.engineBaseForce !== undefined ? this.engineBaseForce : 2.5 //2.3
    this.frontWheelFriction = this.frontWheelFriction !== undefined ? this.frontWheelFriction : 2
    this.backWheelFriction = this.backWheelFriction !== undefined ? this.backWheelFriction : 2.8
    this.lerpSteerValue = this.lerpSteerValue !== undefined ? this.lerpSteerValue : 0.068

    this.frontWheel.setSideFriction(this.frontWheelFriction)
    this.backWheel.setSideFriction(this.backWheelFriction)

    this.running = false
    this.useBackward = !!this.backwardDetection
    this.needsBackwardScore = 0
    this.needsBackward = false
    this.useAntiObstacle = !!this.useAntiObstacle
    this.antiObstacleScore = 0
    this.antiObstacle = false

    this.bodyPos = this.body.position
    this.bodyVel = this.body.velocity

    this.waypoints = new WaypointManager({
      debug: !!this.debugWaypoints,
      improvise: !!this.improvise,
      improvistionTreshold: this.improvisationTreshold,
      posPointer: this.bodyPos
    })

    if (this.debugSteering) {
      this.steeringArrow = this.addComponent(new Arrow({ y: 0.1 }))
    }
    if (this.manualControls) kbctrl(this.frontWheel, this.backWheel)

    this.frontWheel.targetSteerValue = 0
  }

  limitSpeed () {
    if (this.speed > this.maxSpeed) {
      const mult = this.maxSpeed / this.speed
      this.bodyVel[0] *= mult
      this.bodyVel[1] *= mult
      this.speed = this.maxSpeed
    }
  }

  update (dt) {
    super.update(dt)
    // update & limit speed
    this.speed = (this.bodyVel[0] ** 2 + this.bodyVel[1] ** 2) / 2
    this.limitSpeed()

    // update waypoints list
    this.waypoints.update()

    this.running = this.waypoints.list.length > 0

    if (this.running) {
      this.goto(this.waypoints.list[0])
    } else {
      this.backWheel.setBrakeForce(2)
    }

    // copy p2 body parameters to the three group & car
    this.group.position.x = -this.bodyPos[0]
    this.group.position.z = this.bodyPos[1]
    this.chassis.rotation.y = this.body.angle
    // console.log(this.body.angle)

    this.frontWheel.steerValue += (this.frontWheel.targetSteerValue - this.frontWheel.steerValue) * this.lerpSteerValue
    this.targetRot = this.body.angularVelocity / 80 * -(this.body.velocity[0] + this.body.velocity[1])
    this.chassis.rotation.z += (this.targetRot - this.chassis.rotation.z) * 0.2
    this.targetRot = this.body.angularVelocity / 100 * -(this.body.velocity[0] + this.body.velocity[1])
    this.chassis.rotation.x += (this.targetRot - this.chassis.rotation.x) * 0.1
  }

  // One argument: waypoint
  // two arguments: x + y (parallelAng method not used)
  goto (arg1, arg2) {
    const useParallelAng = (arg2 !== undefined)
    let parallelAng = 0

    // the parallelAng method
    // car angle adjusted to match the next waypoint angle
    // it's cool to smooth the path a bit
    if (useParallelAng) {
      const waypoint = arg1
      const wpNormAng = nmod(waypoint.angle - Math.PI, Math.PI * 2)
      const carNormAng = nmod(this.body.angle, Math.PI * 2)

      parallelAng = wpNormAng - carNormAng
      if (Math.abs(wpNormAng - carNormAng) >= Math.PI) {
        parallelAng -= Math.sign(wpNormAng - carNormAng) * (Math.PI * 2)
      }
    }

    // the lookAtAng target method
    // angle of the vehicle adjusted to go directly to the coords
    // reliable but the car can hit buildings
    const targetX = useParallelAng ? arg1 : arg1.x
    const targetY = useParallelAng ? arg2 : arg1.y

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
        console.warn('Backward')
        this.needsBackwardScore = 60
      }
      this.needsBackwardScore = Math.min(80, this.needsBackwardScore + 1)
    } else {
      this.needsBackwardScore = Math.max(0, this.needsBackwardScore - 1)
    }
    this.needsBackward = !(this.needsBackwardScore < 35)

    // Reverse the engine when the car doesn't move for too long
    if (this.running && this.speed < 0.005) {
      if (this.antiObstacleScore < 40 && this.antiObstacleScore + 1 >= 40) {
        console.warn('Antiblock')
        this.antiObstacleDir = Math.random() > 0.5 ? 1 : -1
        this.antiObstacleScore = 120
      }
      this.antiObstacleScore = Math.min(120, this.antiObstacleScore + 1)
    } else {
      this.antiObstacleScore = Math.max(0, this.antiObstacleScore - 1)
    }
    this.antiObstacle = !(this.antiObstacleScore < 40)
    if (this.antiObstacle) steerAng += Math.PI * 0.5 * this.antiObstacleDir

    // clamp the value
    steerAng = Math.max(-this.maxSteer, Math.min(this.maxSteer, steerAng))

    // stop here if we are in manual mode
    if (this.debugSteering) {
      this.steeringArrow.group.rotation.y = this.body.angle + steerAng
    }
    if (this.manualControls) return

    if (this.backWard) this.backWheel.setBrakeForce(1)
    else this.backWheel.setBrakeForce(1)

    // update engineForce and steer value
    this.frontWheel.engineForce = (
      this.engineBaseForce * (this.needsBackward ? -0.7 : 1) * (this.antiObstacle ? -1 : 1)
    )
    this.frontWheel.targetSteerValue = (
      steerAng * (this.needsBackward ? -1 : 1) * (this.antiObstacle ? -1 : 1)
    )
  }

  destroy () {
    super.destroy()
    this.chassis.parent.remove(this.chassis)
  }
}

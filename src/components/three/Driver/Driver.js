import three from 'controllers/three/three'
import map from 'controllers/map/map'
import randomInt from 'utils/randomInt'
import Waypoint from 'components/three/Waypoint/Waypoint'
import nmod from 'utils/nmod'
import kbctrl from 'utils/keyboardControls'
import config from 'config'

const IMPROLENGTH = 3
const MAXSTEER = Math.PI / 3.7

function posFromRelativeDirection (pos, absDir, relMove) {
  console.log(absDir, relMove)
  let move
  if (absDir === 0) {
    move = [-relMove[0], -relMove[1]]
  } else if (absDir === 1) {
    move = [relMove[1], -relMove[0]]
  } else if (absDir === 2) {
    move = [relMove[0], relMove[1]]
  } else if (absDir === 3) {
    move = [-relMove[1], relMove[0]]
  }
  // console.log('move', move)
  return [pos[0] + move[0], pos[1] + move[1]]
}

function rotIndexFromPos (ppos, cpos) {
  const dirX = -Math.sign(ppos[0] - cpos[0])
  const dirY = -Math.sign(ppos[1] - cpos[1])
  return rotIndexFromDirs(dirX, dirY)
}

function rotIndexFromDirs (h, v) {
  if (v === -1) return 0
  else if (h === 1) return 1
  else if (v === 1) return 2
  else if (h === -1) return 3
  else return randomInt(0, 3)
}

export default class Driver {
  constructor (opts) {
    this.vehicle = opts.vehicle
    this.chassis = this.vehicle.chassisBody
    this.backWheel = opts.backWheel
    this.frontWheel = opts.frontWheel
    this.vehicle.speed = 0
    this.maxSpeed = 1
    this.wayPoints = []

    this.manual = config.manualDrive
    if (this.manual) kbctrl(this.frontWheel, this.backWheel)

    this.forwardon = false
    this.backwardmode = false
    this.turn = 0
    this.dir = 0

    this.pos = this.chassis.position
    this.vel = this.chassis.velocity

    this.prevResolvedWaypointPos = [this.pos[0], this.pos[1] - 1]
    this.lastResolvedWaypointPos = [this.pos[0], this.pos[1]]

    this.improvise = true
  }

  randomNextWaypoint (prevPos, currentPos) {
    console.log('from:', currentPos[0], currentPos[1])
    const currentRoad = map.getRoadFromThreePos(currentPos[0], currentPos[1])
    // console.log(dirX, dirY)
    const prefNextN = rotIndexFromPos(prevPos, currentPos)

    const prefNextNLeft = prefNextN > 0 ? (prefNextN - 1) % 4 : 3
    const prefNextNRight = (prefNextN + 1) % 4
    const prefNextNBottom = (prefNextN + 2) % 4
    // console.log('neighbors:', currentRoad.n)
    // rel front
    let point

    // TOTAL RANDOM MODE
    const choices = []
    if (currentRoad.n[prefNextN]) choices.push(posFromRelativeDirection(currentPos, prefNextN, [0, 1]))
    if (currentRoad.n[prefNextNLeft]) choices.push(posFromRelativeDirection(currentPos, prefNextN, [1, 0]))
    if (currentRoad.n[prefNextNRight]) choices.push(posFromRelativeDirection(currentPos, prefNextN, [-1, 0]))

    if (choices.length === 0 && currentRoad.n[prefNextNBottom]) {
      choices.push(posFromRelativeDirection(currentPos, prefNextN, [0, -1]))
    }

    point = choices[Math.floor(Math.random() * choices.length)]

    // GO STRAIGHT MODE
    // if (currentRoad.n[prefNextN]) {
    //   console.log('go straight')
    //   point = posFromRelativeDirection(currentPos, prefNextN, [0, 1])
    // // rel left or right
    // } else if (currentRoad.n[prefNextNLeft] && currentRoad.n[prefNextNRight]) {
    //   const left = (Math.random() > 0.5)
    //   console.log(left ? 'turn left' : 'turn right')
    //   point = posFromRelativeDirection(currentPos, prefNextN, [(left ? 1 : -1), 0])
    // // rel left
    // } else if (currentRoad.n[prefNextNLeft]) {
    //   console.log('turn left')
    //   point = posFromRelativeDirection(currentPos, prefNextN, [1, 0])
    // // rel right
    // } else if (currentRoad.n[prefNextNRight]) {
    //   console.log('turn right')
    //   point = posFromRelativeDirection(currentPos, prefNextN, [-1, 0])
    // // rel back
    // } else if (currentRoad.n[prefNextNBottom]) {
    //   console.log('go back')
    //   point = posFromRelativeDirection(currentPos, prefNextN, [0, -1])
    // // shit
    // } else {

    // }

    return point || null
  }

  improviseFromPos (prev, current, quantity) {
    console.log('improvise', quantity, 'paths')
    // return
    for (let i = 0; i < quantity; i++) {
      let next = this.randomNextWaypoint(prev, current)
      console.log('next', next)
      if (next) this.addWaypoint({
        x: next[0],
        y: next[1],
        r: rotIndexFromPos(current, next),
        impro: true
      })
      prev = current
      current = next
    }
  }

  addWaypoint (opts) {
    const wp = new Waypoint(opts)
    this.wayPoints.push(wp)
  }

  removeWaypoints (firstIndex) {
    for (let i = 0; i < firstIndex; i++) {
      this.wayPoints[i].destroy()
    }
    this.wayPoints.splice(0, firstIndex)
  }

  checkWaypoints () {
    for (let i = 0; i < this.wayPoints.length; i++) {
      const waypoint = this.wayPoints[i]
      const dx = -this.pos[0] - waypoint.position.x
      const dy = this.pos[1] - waypoint.position.z
      const dist = dx ** 2 + dy ** 2
      // console.log(dist)
      if (dist < 0.5) {
        this.prevResolvedWaypointPos = this.lastResolvedWaypointPos
        this.lastResolvedWaypointPos = [this.wayPoints[i].position.x, this.wayPoints[i].position.z]
        this.removeWaypoints(i + 1)
        break
      }
    }
  }

  update (dt) {
    // speed limiter
    this.vehicle.speed = (this.vel[0] ** 2 + this.vel[1] ** 2) / 2
    if (this.vehicle.speed > this.maxSpeed) {
      const mult = this.maxSpeed / this.vehicle.speed
      this.vel[0] *= mult
      this.vel[1] *= mult
    }

    this.checkWaypoints()

    if (this.wayPoints.length < IMPROLENGTH && this.improvise) {
      let current
      let prev
      if (this.wayPoints.length > 1) {
        current = [this.wayPoints[this.wayPoints.length - 1].position.x, this.wayPoints[this.wayPoints.length - 1].position.z]
        prev = [this.wayPoints[this.wayPoints.length - 2].position.x, this.wayPoints[this.wayPoints.length - 2].position.z]
      } else if (this.wayPoints.length > 0) {
        current = [this.wayPoints[this.wayPoints.length - 1].position.x, this.wayPoints[this.wayPoints.length - 1].position.z]
        prev = this.lastResolvedWaypointPos
      } else {
        current = this.lastResolvedWaypointPos
        prev = this.prevResolvedWaypointPos
      }
      const quantity = IMPROLENGTH - this.wayPoints.length
      this.improviseFromPos(prev, current, quantity)
    }


    // FOLLOW ALGORYTHM

    const waypoint = this.wayPoints[0]
    const wpNormAng = nmod(waypoint.group.rotation.y - Math.PI, Math.PI * 2)
    const carNormAng = nmod(this.chassis.angle, Math.PI * 2)

    // the parallelAng method
    // more smooth but the parallel can lost the car
    let parallelAng = wpNormAng - carNormAng
    if (Math.abs(wpNormAng - carNormAng) >= Math.PI) parallelAng -= Math.sign(wpNormAng - carNormAng) * (Math.PI * 2)

    // the lookAtAng target method
    // higher risk to hit buildings
    let lookAtAng = -Math.atan2(
      waypoint.group.position.z - this.pos[1], waypoint.group.position.x + this.pos[0]
    ) + Math.PI / 2 - this.chassis.angle
    if (Math.abs(lookAtAng) >= Math.PI) lookAtAng -= Math.sign(lookAtAng) * (Math.PI * 2)

    // blend the two methods together
    let steerAng = parallelAng * 0.75 + lookAtAng * 0.25

    // clamp the value
    steerAng = Math.max(-MAXSTEER, Math.min(MAXSTEER, steerAng))

    if (this.manual) return

    this.forwardon = true
    if (this.forwardon) this.frontWheel.engineForce = 3

    this.frontWheel.targetSteerValue = steerAng
    this.backWheel.targetSteerValue = steerAng
  }
}

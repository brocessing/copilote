import three from 'controllers/three/three'
import map from 'controllers/map/map'
import randomInt from 'utils/randomInt'

function posFromRelativeDirection (pos, absDir, relMove) {
  let v = 0
  let h = 0

  // if (absDir)
}

function indexFromDirs (h, v) {
  if (v === -1) return 0
  else if (h === -1) return 1
  else if (v === 1) return 2
  else if (h === 1) return 3
  else return randomInt(0, 3)
}

export default class Driver {
  constructor (opts) {
    this.vehicle = opts.vehicle
    this.chassis = this.vehicle.chassisBody
    this.vehicle.speed = 0
    this.maxSpeed = 1
    this.wayPoints = []

    this.forward = false
    this.backward = false
    this.turn = 0
    this.dir = 0

    this.pos = this.chassis.position
    this.vel = this.chassis.velocity

    this.previousPos = [this.pos[0], this.pos[1] - 1]

    this.randomOrders()
  }

  randomNextWaypoint (prevPos, currentPos) {
    console.log('from:', currentPos[0], currentPos[1])
    const currentRoad = map.getRoadFromThreePos(currentPos[0], currentPos[1])
    const dirX = -Math.sign(prevPos[0] - currentPos[0])
    const dirY = -Math.sign(prevPos[1] - currentPos[1])
    // console.log(dirX, dirY)
    const prefNextN = indexFromDirs(dirX, dirY)

    const prefNextNLeft = prefNextN > 0 ? (prefNextN - 1) % 4 : 3
    const prefNextNRight = (prefNextN + 1) % 4
    const prefNextNBottom = (prefNextN + 2) % 4
    console.log('neighbors:', currentRoad.n)
    // rel front
    if (currentRoad.n[prefNextN]) {
      console.log('go straight')
      return [currentPos[0], currentPos[1] + 1]
    // rel left or right
    } else if (currentRoad.n[prefNextNLeft] && currentRoad.n[prefNextNRight]) {
      const left = (Math.random() > 0.5)
      console.log(left ? 'turn left' : 'turn right')
      return [currentPos[0] + (left ? 1 : -1), currentPos[1]]
    // rel left
    } else if (currentRoad.n[prefNextNLeft]) {
      console.log('turn left')
      return [currentPos[0] + 1, currentPos[1]]
    // rel right
    } else if (currentRoad.n[prefNextNRight]) {
      console.log('turn right')
      return [currentPos[0] - 1, currentPos[1]]
    // rel back
    } else if (currentRoad.n[prefNextNBottom]) {
      console.log('go back')
      return [currentPos[0], currentPos[1] - 1]
    // shit
    } else {

    }
  }

  randomOrders () {
    let prev = this.previousPos
    let current = this.pos
    return
    for (let i = 0; i < 20; i++) {
      let next = this.randomNextWaypoint(prev, current)
      console.log('next', next)
      this.wayPoints.push(next)
      prev = current
      current = next
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
  }
}

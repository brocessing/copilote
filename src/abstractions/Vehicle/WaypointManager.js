// import rotIndexFromPos from './utils/rotIndexFromPos'
import getNextWaypoint from './utils/getNextWaypoint'
import Waypoint from './Waypoint'
import nmod from 'utils/nmod'
import events from 'utils/events'
import dirFromPos from './utils/directionFromPos'
/*
  WAYPOINT TYPES
  1: user input
  0: default choice (go relatively straight)
  -1: AI choice
  -2: AI choice really bad (backward)
*/

export default class WaypointManager {
  constructor (opts) {
    this.isPlayer = !!opts.isPlayer
    this.debug = !!opts.debug
    this.list = []
    this.pos = [0, 0]
    this.ang = 0
    this.improvise = opts.improvise
    this.improvisationTreshold = opts.improvisationTreshold || 3
    this.improvisationMode = opts.improvisationMode !== undefined ? opts.improvisationMode : 0
    this.chaoticImprovisation = !!(this.improvisationMode === 1)
  }

  improviseFrom (position, direction, quantity) {
    for (let i = 0; i < quantity; i++) {
      let next = getNextWaypoint(position, direction, undefined, this.chaoticImprovisation)
      if (next) {
        this.addWaypoint({
          x: next.position[0],
          y: next.position[1],
          r: next.direction,
          relr: next.relativeDirection,
          type: next.type,
          improvised: true
        })
      }
      direction = next.direction
      position = next.position
    }
  }

  addWaypoint (opts) {
    const nopts = { debug: this.debug }
    if (this.isPlayer && !opts.improvised) {

    }
    const waypoint = new Waypoint(Object.assign({}, nopts, opts))
    this.list.push(waypoint)
  }

  // reach waypoints
  reachWaypoint (index) {
    // const mainPointIsUser = (this.list[index].type === 1)
    for (let i = 0; i <= index; i++) {
      if (this.isPlayer) {
        // TODO: emit each user point reach
        // if main point reach is NOT user, emit for bad waypoints reach
        // if (this.list[i].type === 1)
        // if (this.list[i].type < 0)
      }
      this.list[i].destroy()
    }
    this.list.splice(0, index + 1)
  }

  cancelAll () {
    let i = this.list.length
    while (i--) this.cancelWaypoint(i)
  }

  cancelWaypoint (index, mute = false) {
    this.list[index].destroy()
    if (this.isPlayer && !mute) {
      // TODO: emit cancel event if waypoint is an user one
    }
    this.list.splice(index, 1)
  }

  getClosest (x, y) {
    let closest
    let distance = null
    for (let i = 0; i < this.list.length; i++) {
      const waypoint = this.list[i]
      const dx = x - waypoint.x
      const dy = y - waypoint.y
      const dist = dx ** 2 + dy ** 2
      if (distance === null || dist < distance) {
        closest = waypoint
        distance = dist
      }
    }

    return {
      point: closest,
      distance
    }
  }

  getPointToStartFrom () {
    let fromPos
    let fromDir
    const len = this.list.length
    if (len > 1) {
      fromPos = [this.list[len - 1].x, this.list[len - 1].y]
      let prev = [this.list[len - 2].x, this.list[len - 2].y]
      fromDir = dirFromPos(prev, fromPos)
    } else if (len > 0 && this.lastReachPos) {
      fromPos = [this.list[len - 1].x, this.list[len - 1].y]
      let prev = this.lastReachPos
      fromDir = dirFromPos(prev, fromPos)
    } else if (this.preLastReachPos) {
      fromPos = this.lastReachPos
      let prev = this.preLastReachPos
      fromDir = dirFromPos(prev, fromPos)
    } else {
      fromPos = this.pos
      fromDir = this.getDirFromAngle(this.ang)
    }
    return { pos: fromPos, dir: fromDir }
  }

  getDirFromAngle (ang) {
    return Math.floor(nmod(-ang + Math.PI + Math.PI / 4, Math.PI * 2) / (Math.PI / 2)) % 4
  }

  update (pos, ang) {
    // Search for reached waypoints
    this.pos = [-pos[0], pos[1]]
    this.ang = ang

    let distMin = null
    for (let i = 0; i < this.list.length; i++) {
      const waypoint = this.list[i]
      const dx = this.pos[0] - waypoint.x
      const dy = this.pos[1] - waypoint.y
      const dist = dx ** 2 + dy ** 2
      if (distMin === null || dist < distMin) distMin = dist
      if (dist < 0.5) {
        this.preLastReachPos = i > 0 ? [this.list[i - 1].x, this.list[i - 1].y] : this.lastReachPos
        this.lastReachPos = [this.list[i].x, this.list[i].y]
        this.reachWaypoint(i)
        break
      }
    }

    // Too far away from the closest point, we reset the waypoint list
    if (distMin > 10) {
      let i = this.list.length
      while (i--) this.cancelWaypoint(i)
      this.preLastReachPos = null
      this.lastReachPos = null
    }

    // Do we need to improvise waypoints ?
    // If there isn't enough waypoints to improvise from,
    // improvise from the latest reached waypoints
    if (this.improvise && this.list.length < this.improvisationTreshold) {
      const fromPt = this.getPointToStartFrom()
      const quantity = this.improvisationTreshold - this.list.length
      this.improviseFrom(fromPt.pos, fromPt.dir, quantity)
    }
  }

  makeOrders (orders = []) {
    // console.log('YO')
    // const fromPt = this.getPointToStartFrom()
    let position = this.pos
    let direction = this.getDirFromAngle(this.ang)
    let newWaypoints = []
    let i = 0
    if (orders.length <= 0) return
    while (orders.length > 0 && i < 100) {
      let next = getNextWaypoint(position, direction, orders[0])
      // console.log(next)
      if (!next) break
      newWaypoints.push({
        x: next.position[0],
        y: next.position[1],
        r: next.direction,
        relr: next.relativeDirection,
        type: next.type,
        improvised: (next.type !== 1)
      })
      if (next.type === 1) orders.shift()
      // same point that the one already in the queue, we don't emit canceling events
      if (this.list[0]) {
        if (this.list[0].x === next.position[0] && this.list[0].y === next.position[1]) {
          this.cancelWaypoint(0, true)
        } else {
          this.cancelWaypoint(0)
        }
      }
      direction = next.direction
      position = next.position
      i++
    }
    this.cancelAll()
    newWaypoints.forEach((waypoint) => this.addWaypoint(waypoint))
    newWaypoints = null
  }

  createFromPath (path) {
    const fromPt = this.getPointToStartFrom()
    let prevPos = fromPt.pos
    this.cancelAll()
    this.preLastReachPos = null
    this.lastReachPos = null
    path.forEach(coords => {
      this.addWaypoint({
        x: coords.x,
        y: coords.y,
        r: dirFromPos(prevPos, [coords.x, coords.y]),
        type: 0
      })
      prevPos = [coords.x, coords.y]
    })
  }

  goStraight () {
    this.makeOrders([0])
  }

  turnRight () {
    this.makeOrders([1])
  }

  turnLeft () {
    this.makeOrders([3])
  }

  turnBack () {
    let i = this.list.length
    while (i--) this.cancelWaypoint(i)
    // console.log(this.list)
    const fromPos = this.pos
    const fromDir = this.lastReachPos && this.preLastReachPos
      ? dirFromPos(this.lastReachPos, this.preLastReachPos)
      : this.getDirFromAngle(this.ang - Math.PI)
    const quantity = this.improvisationTreshold > 3 ? this.improvisationTreshold : 3
    this.preLastReachPos = null
    this.lastReachPos = null
    this.improviseFrom(fromPos, fromDir, quantity)
    this.preLastReachPos = [this.list[0].x, this.list[0].y]
    this.lastReachPos = [this.list[1].x, this.list[1].y]
  }
}

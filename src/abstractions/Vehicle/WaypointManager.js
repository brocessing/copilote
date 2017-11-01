import rotIndexFromPos from './utils/rotIndexFromPos'
import getNextRandomWaypoint from './utils/getNextRandomWaypoint'
import Waypoint from './Waypoint'

export default class WaypointManager {
  constructor (opts) {
    this.debug = !!opts.debug
    this.list = []

    this.pos = opts.posPointer
    this.improvise = opts.improvise
    this.improvisationTreshold = opts.improvisationTreshold || 3

    this.preLastReachPos = [-this.pos[0], this.pos[1] - 1]
    this.lastReachPos = [-this.pos[0], this.pos[1]]
  }

  improviseFromPos (prev, current, quantity) {
    for (let i = 0; i < quantity; i++) {
      let next = getNextRandomWaypoint(prev, current)
      if (next) {
        this.addWaypoint({
          x: next[0],
          y: next[1],
          r: rotIndexFromPos(current, next),
          improvised: true
        })
      }
      prev = current
      current = next
    }
  }

  addWaypoint (opts) {
    const waypoint = new Waypoint(Object.assign({}, {
      debug: this.debug
    }, opts))
    this.list.push(waypoint)
  }

  removeWaypoints (length) {
    for (let i = 0; i < length; i++) this.list[i].destroy()
    this.list.splice(0, length)
  }

  update () {
    // Search for reached waypoints
    for (let i = 0; i < this.list.length; i++) {
      const waypoint = this.list[i]
      const dx = -this.pos[0] - waypoint.x
      const dy = this.pos[1] - waypoint.y
      const dist = dx ** 2 + dy ** 2
      if (dist < 0.5) {
        // TODO: if i > 0 preLast is i - 1, not lastReachPos
        this.preLastReachPos = this.lastReachPos
        this.lastReachPos = [this.list[i].x, this.list[i].y]
        this.removeWaypoints(i + 1)
        break
      }
    }
    // Do we need to improvise waypoints ?
    // If there isn't enough waypoints to improvise from,
    // improvise from the latest reached waypoints
    if (this.improvise && this.list.length < this.improvisationTreshold) {
      let current
      let prev
      let len = this.list.length
      if (len > 1) {
        current = [this.list[len - 1].x, this.list[len - 1].y]
        prev = [this.list[len - 2].x, this.list[len - 2].y]
      } else if (len > 0) {
        current = [this.list[len - 1].x, this.list[len - 1].y]
        prev = this.lastReachPos
      } else {
        current = this.lastReachPos
        prev = this.preLastReachPos
      }
      const quantity = this.improvisationTreshold - len
      this.improviseFromPos(prev, current, quantity)
    }
  }
}

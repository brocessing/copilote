import map from 'controllers/map/map'
// import posFromRelativeDirection from './posFromRelativeDirection'
// import rotIndexFromPos from './rotIndexFromPos'
import prng from 'utils/prng'
import createChoice from './createChoice'

const DIRKEYS = {
  0: 'straight',
  1: 'right',
  2: 'back',
  3: 'left'
}

export default function getNextWaypoint (currentPosition, currentDirection, order = undefined, chaotic = false) {
  // console.log('pos', currentPosition, 'dir', currentDirection, 'ord', order)
  const currentRoad = map.getRoadFromThreePos(currentPosition[0], currentPosition[1])

  // if there is a road, stick the waypoint in its center
  if (currentRoad) {
    currentPosition[0] = Math.round(currentPosition[0])
    currentPosition[1] = Math.round(currentPosition[1])
  }

  const relDir = {
    top: currentDirection,
    right: (currentDirection + 1) % 4,
    bottom: (currentDirection + 2) % 4,
    left: (currentDirection + 3) % 4
  }

  const choices = {}
  let choice

  if (currentRoad) {
    if (currentRoad.n[relDir.top]) choices.straight = createChoice(currentPosition, currentDirection, 0)
    if (currentRoad.n[relDir.right]) choices.right = createChoice(currentPosition, currentDirection, 1)
    if (currentRoad.n[relDir.left]) choices.left = createChoice(currentPosition, currentDirection, 3)
  }

  const keys = Object.keys(choices)
  const len = keys.length

  // If no other choice, turn backward
  if (len === 0 && currentRoad && currentRoad.n[relDir.bottom]) {
    choice = createChoice(currentPosition, currentDirection, 2)
    choice.type = -2
    return choice
  }

  // Only one choice, continue
  if (len === 1) {
    choice = choices[keys[0]]
    choice.type = 0
    return choice
  }

  // Multiple possible choice
  if (len > 0) {
    console.warn('MULTIPLE', 'order:', DIRKEYS[order])
    // The user order is found
    if (order !== undefined && choices[DIRKEYS[order]]) {
      console.warn('FOUUUUND')
      choice = choices[DIRKEYS[order]]
      choice.type = 1
      return choice
    }
    // Except if we are in chaotic mode, we alway try to continue to go straight
    if (!chaotic && currentRoad.n[relDir.top]) {
      choice = choices.straight
    } else {
      choice = choices[keys[prng.randomInt(0, len - 1)]]
    }
    choice.type = -1
    return choice
  }

  // If for any reason there is no road we go straight forward
  // choice = createChoice(currentPosition, currentDirection, (prng.randomInt(0, 2) + 3) % 4)
  choice = createChoice(currentPosition, currentDirection, 0)
  choice.type = -2

  return choice
}

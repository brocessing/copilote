import map from 'controllers/map/map'
import posFromRelativeDirection from './posFromRelativeDirection'
import rotIndexFromPos from './rotIndexFromPos'

export default function randomNextWaypoint (prevPos, currentPos) {
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

  // Turn backward if no other choice
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

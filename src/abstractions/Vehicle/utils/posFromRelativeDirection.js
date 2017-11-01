// pos: current position
// absDir: current rotation
// relMove: relative direction where you want to go
export default function posFromRelativeDirection (pos, absDir, relMove) {
  // console.log(absDir, relMove)
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

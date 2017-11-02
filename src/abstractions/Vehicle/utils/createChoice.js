// 0: top (absolute) | straight (relative)
// 1: right
// 2: bottom (absolute) | backward (relative)
// 3: left

const moveFromDir = {
  0: [0, -1],
  1: [1, 0],
  2: [0, 1],
  3: [-1, 0]
}

export default function createChoice (currentPos, currentAbsDir, newRelDir) {
  // console.log(currentAbsDir, newRelDir)
  const newAbsDir = (currentAbsDir + newRelDir) % 4
  const move = moveFromDir[newAbsDir]
  return {
    relativeDirection: newRelDir,
    direction: newAbsDir,
    position: [currentPos[0] + move[0], currentPos[1] + move[1]]
  }
}

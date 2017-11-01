// get rotation index from position
// 0: top | 1: right | 2: bottom | 3: left

import randomInt from 'utils/randomInt'

function rotIndexFromDirs (h, v) {
  if (v === -1) return 0
  else if (h === 1) return 1
  else if (v === 1) return 2
  else if (h === -1) return 3

  // if there is no direction, we randomly choose one
  else return randomInt(0, 3)
}

export default function rotIndexFromPos (ppos, cpos) {
  const dirX = -Math.sign(ppos[0] - cpos[0])
  const dirY = -Math.sign(ppos[1] - cpos[1])
  return rotIndexFromDirs(dirX, dirY)
}

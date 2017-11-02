const fastRandom = require('fast-random')

let seed = 0
let randomizer = fastRandom(seed)

function setSeed (newSeed) {
  seed = newSeed
  randomizer = fastRandom(seed)
}

function random () {
  return randomizer.nextFloat()
}

function randomInt (min, max) {
  return Math.floor(randomizer.nextFloat() * (max - min + 1)) + min
}

function hash2d (x, y) {
  return Math.abs(Math.sin(Math.sin(x * 15.31) + Math.cos(y * 11.33 * (seed + 1)) + x + seed))
}

function hash2dInt (x, y, min, max) {
  return Math.floor(hash2d(x, y) * (max - min + 1)) + min
}

export default {
  setSeed,
  random,
  randomInt,
  hash2d,
  hash2dInt
}

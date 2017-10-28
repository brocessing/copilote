/* global THREE */

import mitt from 'mitt'

const emitter = mitt()
const DISTVIEW = 3 // chunk side
const CHUNKSIZE = 25
// const CENTER = CHUNKSIZE / 2 + 0.5
let currentChunk = null
let loadedChunks = {}
let walkMap = []

function allocateWalkMap () {
  for (let y = 0; y < CHUNKSIZE * DISTVIEW; y++) {
    walkMap[y] = []
    for (let x = 0; x < CHUNKSIZE * DISTVIEW; x++) {
      walkMap[y][x] = 0
    }
  }
}

function regenerateWalkMap () {
  const size = CHUNKSIZE * DISTVIEW
  const incr = (DISTVIEW - 1) / 2
  const minChunkX = currentChunk.chunkX - incr
  const minChunkY = currentChunk.chunkY - incr
  const modul = CHUNKSIZE + 1
  for (let x = 0; x < size; x++) {
    const relChunkX = Math.floor(x / CHUNKSIZE)
    const absChunkX = minChunkX + relChunkX
    let relChunkY
    let absChunkY
    for (let y = 0; y < size; y++) {
      if (!(y % modul)) {
        relChunkY = Math.floor(y / CHUNKSIZE)
        absChunkY = minChunkY + relChunkY
      }
      const relX = x % CHUNKSIZE
      const relY = y % CHUNKSIZE
      // console.log(x, y, relX, relY)
      walkMap[y][x] = loadedChunks[absChunkX + '.' + absChunkY].map[relY][relX]
    }
  }
}

function mockChunk () {
  const data = { map: [], road: {} }
  const map = data.map
  const road = data.road
  for (let x = 0; x < CHUNKSIZE; x++) {
    map[x] = []
    for (let y = 0; y < CHUNKSIZE; y++) {
      const isRoad = Math.round(Math.random())
      map[x][y] = isRoad
      if (!isRoad) continue
      road[x + '.' + y] = { x, y }
    }
  }
  return data
}

function init () {
  allocateWalkMap()
  const incr = (DISTVIEW - 1) / 2
  const minChunkX = -incr
  const maxChunkX = incr
  const minChunkY = -incr
  const maxChunkY = incr
  for (let absChunkX = minChunkX; absChunkX <= maxChunkX; absChunkX++) {
    for (let absChunkY = minChunkY; absChunkY <= maxChunkY; absChunkY++) {
      const id = absChunkX + '.' + absChunkY
      const chunk = mockChunk()
      loadedChunks[id] = {
        id,
        chunkX: absChunkX,
        chunkY: absChunkY,
        x: absChunkX * CHUNKSIZE - CHUNKSIZE / 2,
        y: absChunkY * CHUNKSIZE - CHUNKSIZE / 2,
        road: chunk.road,
        map: chunk.map
      }
      emitter.emit('chunk-added', loadedChunks[id])
    }
  }
  console.log('salut')
  currentChunk = getChunkFromPos(0, 0)
  regenerateWalkMap()
}

function getChunkFromPos (x, y) {
  x = Math.ceil(x / CHUNKSIZE)
  y = Math.ceil(y / CHUNKSIZE)
  const id = x + '.' + y
  return loadedChunks[id] ? loadedChunks[id] : null
}

function updateCenter (x, y) { // pos is three vec3
  x -= CHUNKSIZE / 2
  y -= CHUNKSIZE / 2
  const nchunk = getChunkFromPos(x, y)
  if (nchunk !== currentChunk) {
    console.log(nchunk)
    currentChunk = nchunk
  }
}

function getChunkSize () {
  return CHUNKSIZE
}

export default {
  init,
  updateCenter,
  getChunkSize,
  getChunkFromPos,
  on: emitter.on
}

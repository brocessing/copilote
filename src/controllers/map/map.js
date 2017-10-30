/* global THREE */

import mitt from 'mitt'
import store from 'utils/store'
import config from 'config'

const emitter = mitt()
const DISTVIEW = config.viewDistance // chunk side
const DISTFROMCENTER = (DISTVIEW - 1) / 2
const CHUNKSIZE = config.chunkSize
const MAPCENTER = CHUNKSIZE * ((DISTVIEW - 1) / 2) + (CHUNKSIZE - 1) / 2
let chunksPool = []
let currentMiddleChunk = null
let loadedChunks = {}
let walkMap = []
let prevPos = [0, 0]

function allocateWalkMap () {
  for (let y = 0; y < CHUNKSIZE * DISTVIEW; y++) {
    walkMap[y] = []
    for (let x = 0; x < CHUNKSIZE * DISTVIEW; x++) {
      walkMap[y][x] = 0
    }
  }
}

function regenerateWalkMap () {
  const minChunkX = currentMiddleChunk.chunkX - DISTFROMCENTER
  const minChunkY = currentMiddleChunk.chunkY - DISTFROMCENTER

  walkMap.forEach((arr, y) => {
    const relY = y % CHUNKSIZE
    const relChunkY = Math.floor(y / CHUNKSIZE)
    const absChunkY = minChunkY + relChunkY
    for (let relChunkX = 0; relChunkX < DISTVIEW; relChunkX++) {
      const absChunkX = minChunkX + relChunkX
      if (!loadedChunks[absChunkX + '.' + absChunkY]) console.warn('cant find chunk', absChunkX, absChunkY)
      arr.splice(relChunkX * CHUNKSIZE, CHUNKSIZE, ...loadedChunks[absChunkX + '.' + absChunkY].map[relY])
    }
  })

  console.log(walkMap)
}

function mockChunk () {
  const data = { map: [], road: {}, props: [], buildings: [] }
  const map = data.map
  const road = data.road
  for (let y = 0; y < CHUNKSIZE; y++) {
    map[y] = []
    for (let x = 0; x < CHUNKSIZE; x++) {
      const isRoad = Math.round(Math.random())
      map[y][x] = isRoad
      if (!isRoad) continue
      road[x + '.' + y] = { p: [x, y], c: 255, r: 0, t: 1 }
    }
  }
  return data
}

function init () {
  chunksPool = store.get('map.chunks')
  // for (let i = 0; i < 6; i++) { chunksPool.push(mockChunk()) }

  allocateWalkMap()
  const minChunkX = -DISTFROMCENTER
  const maxChunkX = DISTFROMCENTER
  const minChunkY = -DISTFROMCENTER
  const maxChunkY = DISTFROMCENTER
  for (let absChunkX = minChunkX; absChunkX <= maxChunkX; absChunkX++) {
    for (let absChunkY = minChunkY; absChunkY <= maxChunkY; absChunkY++) {
      const id = absChunkX + '.' + absChunkY
      loadedChunks[id] = newChunkFromPool(absChunkX, absChunkY)
      emitter.emit('chunk-added', loadedChunks[id])
    }
  }
  // console.log('salut')
  currentMiddleChunk = getChunkFromPos(0, 0)
  regenerateWalkMap()
}

function newChunkFromPool (absChunkX, absChunkY) {
  const id = absChunkX + '.' + absChunkY
  const len = chunksPool.length - 1
  const chunk = chunksPool[Math.abs(Math.floor(Math.sin(Math.sin(absChunkX * 15.31) + Math.cos(absChunkY)) * len))]
  return {
    id,
    chunkX: absChunkX,
    chunkY: absChunkY,
    x: absChunkX * CHUNKSIZE - CHUNKSIZE / 2,
    y: absChunkY * CHUNKSIZE - CHUNKSIZE / 2,
    road: chunk.road,
    map: chunk.map
  }
}

function addChunk (x, y) {
  const id = x + '.' + y
  // console.log('add', x, y)
  if (loadedChunks[id]) return
  loadedChunks[id] = newChunkFromPool(x, y)
  // console.log('add', x, y)
  emitter.emit('chunk-added', loadedChunks[id])
}

function removeChunk (x, y) {
  const id = x + '.' + y
  if (!loadedChunks[id]) return
  emitter.emit('chunk-removed', loadedChunks[id])
  delete loadedChunks[id]
}

function onNewMiddleChunk (prevChunkX, prevChunkY, chunkX, chunkY) {
  const xDir = chunkX - prevChunkX
  const yDir = chunkY - prevChunkY

  // vertical move
  if (xDir !== 0) {
    const chunkXtoRemove = prevChunkX - (DISTFROMCENTER * xDir)
    const chunkXtoAdd = chunkX + (DISTFROMCENTER * xDir)
    // console.log('removeX', chunkXtoRemove, 'addX', chunkXtoAdd)
    const minChunkY = prevChunkY - DISTFROMCENTER
    const maxChunkY = prevChunkY + DISTFROMCENTER
    for (let y = minChunkY; y <= maxChunkY; y++) {
      // console.log('rem', chunkXtoRemove, y)
      removeChunk(chunkXtoRemove, y)
      // console.log('add', chunkXtoAdd, y)
      addChunk(chunkXtoAdd, y)
    }

    prevChunkX = chunkX
  }

  // horizontal move
  if (yDir !== 0) {
    const chunkYtoRemove = prevChunkY - (DISTFROMCENTER * yDir)
    const chunkYtoAdd = chunkY + (DISTFROMCENTER * yDir)
    // console.log('removeY', chunkYtoRemove, 'addY', chunkYtoAdd)
    const minChunkX = prevChunkX - DISTFROMCENTER
    const maxChunkX = prevChunkX + DISTFROMCENTER
    for (let x = minChunkX; x <= maxChunkX; x++) {
      // console.log('rem', x, chunkYtoRemove)
      removeChunk(x, chunkYtoRemove)
      // console.log('add', x, chunkYtoAdd)
      addChunk(x, chunkYtoAdd)
    }
  }

  // regenerateWalkMap()
}

function getWalkCoordFromPos (x, y) {
  x = Math.round(x)
  y = Math.round(y)
  const chunk = getChunkFromPos(x, y)
  if (!chunk) return null
  const relX = (x >= 0 ? x : CHUNKSIZE + x) % CHUNKSIZE
  const relY = (y >= 0 ? y : CHUNKSIZE + y) % CHUNKSIZE
  const wx = (chunk.chunkX - currentMiddleChunk.chunkX) * CHUNKSIZE + (MAPCENTER + relX)
  const wy = (chunk.chunkY - currentMiddleChunk.chunkY) * CHUNKSIZE + (MAPCENTER + relY)
  return [wx, wy]
}

function getRoadFromPos (x, y) {
  x = Math.round(x)
  y = Math.round(y)
  const chunkX = Math.floor(x / CHUNKSIZE)
  const chunkY = Math.floor(y / CHUNKSIZE)
  const chunkId = chunkX + '.' + chunkY
  if (!loadedChunks[chunkId]) return null
  const relX = (x >= 0 ? x : CHUNKSIZE - x) % CHUNKSIZE
  const relY = (y >= 0 ? y : CHUNKSIZE - y) % CHUNKSIZE
  const roadId = relX + '.' + relY
  // console.log(loadedChunks[chunkId])
  return loadedChunks[chunkId].road[roadId]
    ? loadedChunks[chunkId].road[roadId]
    : null
}

function getChunkFromPos (x, y) {
  x = Math.round(x)
  y = Math.round(y)
  x = Math.floor(x / CHUNKSIZE)
  y = Math.floor(y / CHUNKSIZE)
  const id = x + '.' + y
  return loadedChunks[id] ? loadedChunks[id] : null
}

function updateCenter (x, y) { // pos is three vec3
  x = Math.round(x)
  y = Math.round(y)

  const offsetX = x + CHUNKSIZE / 2
  const offsetY = y + CHUNKSIZE / 2
  const nchunk = getChunkFromPos(offsetX, offsetY)
  if (nchunk !== null && nchunk !== currentMiddleChunk) {
    console.log('newChunk', nchunk.chunkX, nchunk.chunkY)
    onNewMiddleChunk(currentMiddleChunk.chunkX, currentMiddleChunk.chunkY, nchunk.chunkX, nchunk.chunkY)
    currentMiddleChunk = nchunk
    regenerateWalkMap()
  }

  if (prevPos[0] !== x || prevPos[1] !== y) {
    prevPos[0] = x
    prevPos[1] = y
    const chunk = getChunkFromPos(x, y)
    const relX = (x >= 0 ? x : CHUNKSIZE + x) % CHUNKSIZE
    const relY = (y >= 0 ? y : CHUNKSIZE + y) % CHUNKSIZE
    const walk = getWalkCoordFromPos(x, y)
    console.log(
      'tile:', x, y,
      'chunk:', chunk.chunkX, chunk.chunkY,
      'chunktile:', relX, relY,
      'walkmap:', walkMap[walk[1]][walk[0]]
    )
  }
}

function getChunkSize () {
  return CHUNKSIZE
}

function getWalkMap () {
  return walkMap
}

export default {
  init,
  updateCenter,
  getChunkSize,
  getChunkFromPos,
  getRoadFromPos,
  getWalkCoordFromPos,
  getWalkMap,
  on: emitter.on
}

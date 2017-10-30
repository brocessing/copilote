/* global THREE */

import mitt from 'mitt'
import store from 'utils/store'
import config from 'config'

const emitter = mitt()
const DISTVIEW = config.viewDistance // chunk side
const DISTFROMCENTER = (DISTVIEW - 1) / 2
const CHUNKSIZE = config.chunkSize
// const CENTER = CHUNKSIZE / 2 + 0.5
let chunksPool
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
  const minChunkX = currentChunk.chunkX - DISTFROMCENTER
  const minChunkY = currentChunk.chunkY - DISTFROMCENTER

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
  chunksPool = store.get('map.chunks')
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
  currentChunk = getChunkFromPos(0, 0)
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

function onNewCurrentChunk (prevChunkX, prevChunkY, chunkX, chunkY) {
  const xDir = chunkX - prevChunkX
  const yDir = chunkY - prevChunkY

  // vertical move
  if (xDir !== 0) {
    const chunkXtoRemove = prevChunkX - (DISTFROMCENTER * xDir)
    const chunkXtoAdd = chunkX + (DISTFROMCENTER * xDir)
    console.log('removeX', chunkXtoRemove, 'addX', chunkXtoAdd)
    const minChunkY = prevChunkY - DISTFROMCENTER
    const maxChunkY = prevChunkY + DISTFROMCENTER
    for (let y = minChunkY; y <= maxChunkY; y++) {
      console.log('rem', chunkXtoRemove, y)
      removeChunk(chunkXtoRemove, y)
      console.log('add', chunkXtoAdd, y)
      addChunk(chunkXtoAdd, y)
    }

    prevChunkX = chunkX
  }

  // horizontal move
  if (yDir !== 0) {
    const chunkYtoRemove = prevChunkY - (DISTFROMCENTER * yDir)
    const chunkYtoAdd = chunkY + (DISTFROMCENTER * yDir)
    console.log('removeY', chunkYtoRemove, 'addY', chunkYtoAdd)
    const minChunkX = prevChunkX - DISTFROMCENTER
    const maxChunkX = prevChunkX + DISTFROMCENTER
    for (let x = minChunkX; x <= maxChunkX; x++) {
      console.log('rem', x, chunkYtoRemove)
      removeChunk(x, chunkYtoRemove)
      console.log('add', x, chunkYtoAdd)
      addChunk(x, chunkYtoAdd)
    }
  }

  // regenerateWalkMap()
}

function getRoadFromPos (x, y) {
  const chunkX = Math.ceil(x / CHUNKSIZE)
  const chunkY = Math.ceil(y / CHUNKSIZE)
  const chunkId = chunkX + '.' + chunkY
  if (!loadedChunks[chunkId]) return null
  const relX = x % CHUNKSIZE
  const relY = y % CHUNKSIZE
  const roadId = relX + '.' + relY
  console.log(loadedChunks[chunkId])
  return loadedChunks[chunkId].road[roadId]
    ? loadedChunks[chunkId].road[roadId]
    : null
}

function getChunkFromPos (x, y) {
  x = Math.ceil(x / CHUNKSIZE)
  y = Math.ceil(y / CHUNKSIZE)
  const id = x + '.' + y
  return loadedChunks[id] ? loadedChunks[id] : null
}

function updateCenter (x, y) { // pos is three vec3
  // x -= CHUNKSIZE / 2
  // y -= CHUNKSIZE / 2
  const nchunk = getChunkFromPos(x, y)
  if (nchunk !== null && nchunk !== currentChunk) {
    // console.log(nchunk)
    onNewCurrentChunk(currentChunk.chunkX, currentChunk.chunkY, nchunk.chunkX, nchunk.chunkY)
    currentChunk = nchunk
    regenerateWalkMap()
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
  getRoadFromPos,
  on: emitter.on
}

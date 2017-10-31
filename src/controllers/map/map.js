/* global THREE */

import mitt from 'mitt'
import store from 'utils/store'
import config from 'config'

const emitter = mitt()
const DISTVIEW = config.viewDistance // chunk side
const CHUNKSIZE = config.chunkSize

const CHUNKDISTFROMCENTER = (DISTVIEW - 1) / 2
const CHUNKCENTER = CHUNKSIZE / 2 + 0.5
// const WALKMAPCENTER = CHUNKSIZE * ((DISTVIEW - 1) / 2) + (CHUNKSIZE - 1) / 2
let chunksPool = []
let currentMiddleChunk = null
let loadedChunks = {}
let walkMap = []
let prevPos = [0, 0]

let domDebug
if (config.locDebug) {
  domDebug = document.createElement('pre')
  domDebug.style.zIndex = 10000
  domDebug.style.position = 'fixed'
  domDebug.style.fontSize = '10px'
  domDebug.style.bottom = 0
  domDebug.style.padding = '10px'
  domDebug.style.right = 0
  domDebug.style.color = 'white'
  domDebug.style.background = 'rgba(0, 0, 0, 0.3)'
  document.body.appendChild(domDebug)
}

function allocateWalkMap () {
  for (let y = 0; y < CHUNKSIZE * DISTVIEW; y++) {
    walkMap[y] = []
    for (let x = 0; x < CHUNKSIZE * DISTVIEW; x++) {
      walkMap[y][x] = 0
    }
  }
}

function regenerateWalkMap () {
  const minChunkX = currentMiddleChunk.chunkX - CHUNKDISTFROMCENTER
  const minChunkY = currentMiddleChunk.chunkY - CHUNKDISTFROMCENTER

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

  // console.table(walkMap)
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
  const minChunkX = -CHUNKDISTFROMCENTER
  const maxChunkX = CHUNKDISTFROMCENTER
  const minChunkY = -CHUNKDISTFROMCENTER
  const maxChunkY = CHUNKDISTFROMCENTER
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
  updateCenter(0, 0, true)
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
    map: chunk.map,
    buildings: chunk.buildings,
    props: chunk.props
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
    const chunkXtoRemove = prevChunkX - (CHUNKDISTFROMCENTER * xDir)
    const chunkXtoAdd = chunkX + (CHUNKDISTFROMCENTER * xDir)
    // console.log('removeX', chunkXtoRemove, 'addX', chunkXtoAdd)
    const minChunkY = prevChunkY - CHUNKDISTFROMCENTER
    const maxChunkY = prevChunkY + CHUNKDISTFROMCENTER
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
    const chunkYtoRemove = prevChunkY - (CHUNKDISTFROMCENTER * yDir)
    const chunkYtoAdd = chunkY + (CHUNKDISTFROMCENTER * yDir)
    // console.log('removeY', chunkYtoRemove, 'addY', chunkYtoAdd)
    const minChunkX = prevChunkX - CHUNKDISTFROMCENTER
    const maxChunkX = prevChunkX + CHUNKDISTFROMCENTER
    for (let x = minChunkX; x <= maxChunkX; x++) {
      // console.log('rem', x, chunkYtoRemove)
      removeChunk(x, chunkYtoRemove)
      // console.log('add', x, chunkYtoAdd)
      addChunk(x, chunkYtoAdd)
    }
  }
}

function getThreePosFromWalkCoord (wx, wy, opts = {}) {
  const middleX = opts.middleX !== undefined ? opts.middleX : currentMiddleChunk.chunkX
  const middleY = opts.middleY !== undefined ? opts.middleY : currentMiddleChunk.chunkY
  let x = wx - CHUNKSIZE * (CHUNKDISTFROMCENTER - middleX + 0.5)
  let y = wy - CHUNKSIZE * (CHUNKDISTFROMCENTER - middleY + 0.5)
  return [Math.ceil(x), Math.ceil(y)]
}

function getWalkCoordFromThreePos (tx, ty) {
  return getWalkCoordFromPos(
    Math.floor(Math.round(tx) + CHUNKSIZE / 2),
    Math.floor(Math.round(ty) + CHUNKSIZE / 2)
  )
}

function getWalkCoordFromPos (x, y) {
  const wx = x + CHUNKSIZE * (CHUNKDISTFROMCENTER - currentMiddleChunk.chunkX)
  const wy = y + CHUNKSIZE * (CHUNKDISTFROMCENTER - currentMiddleChunk.chunkY)
  // console.log('w', x, y, wx, wy)
  // console.log(wx, wy)
  return [wx, wy]
}

function getRoadFromThreePos (tx, ty) {
  return getRoadFromPos(
    Math.floor(Math.round(tx) + CHUNKSIZE / 2),
    Math.floor(Math.round(ty) + CHUNKSIZE / 2)
  )
}

function getRoadFromPos (x, y) {
  const chunkX = Math.floor(x / CHUNKSIZE)
  const chunkY = Math.floor(y / CHUNKSIZE)
  const chunkId = chunkX + '.' + chunkY
  // console.log(x, y, loadedChunks[chunkId])
  if (!loadedChunks[chunkId]) return null
  const relX = x < 0
    ? (x % CHUNKSIZE + CHUNKSIZE) % CHUNKSIZE
    : x % CHUNKSIZE
  const relY = y < 0
    ? (y % CHUNKSIZE + CHUNKSIZE) % CHUNKSIZE
    : y % CHUNKSIZE
  const roadId = relX + '.' + relY
  // console.log(loadedChunks[chunkId])
  return loadedChunks[chunkId].road[roadId]
    ? loadedChunks[chunkId].road[roadId]
    : null
}

function getChunkFromThreePos (tx, ty) {
  return getChunkFromPos(
    Math.floor(Math.round(tx) + CHUNKSIZE / 2),
    Math.floor(Math.round(ty) + CHUNKSIZE / 2)
  )
}

function getChunkFromPos (x, y) {
  x = Math.floor(x / CHUNKSIZE)
  y = Math.floor(y / CHUNKSIZE)
  const id = x + '.' + y
  return loadedChunks[id] ? loadedChunks[id] : null
}

function updateCenter (x, y, forcedebug = false) { // pos is three vec3
  const tx = Math.round(x)
  const ty = Math.round(y)
  // convert three pos to map pos
  x = Math.floor(Math.round(x) + CHUNKSIZE / 2)
  y = Math.floor(Math.round(y) + CHUNKSIZE / 2)

  // console.log(offsetX, offsetY)
  const nchunk = getChunkFromPos(x, y)

  if (nchunk !== null && nchunk !== currentMiddleChunk) {
    // console.log('newChunk', nchunk.chunkX, nchunk.chunkY)
    onNewMiddleChunk(currentMiddleChunk.chunkX, currentMiddleChunk.chunkY, nchunk.chunkX, nchunk.chunkY)
    currentMiddleChunk = nchunk
    regenerateWalkMap()
  }

  if (config.locDebug) {
    if (prevPos[0] !== x || prevPos[1] !== y || forcedebug) {
      prevPos[0] = x
      prevPos[1] = y
      const chunk = getChunkFromPos(x, y)
      const relX = x < 0
        ? (x % CHUNKSIZE + CHUNKSIZE) % CHUNKSIZE
        : x % CHUNKSIZE
      const relY = y < 0
        ? (y % CHUNKSIZE + CHUNKSIZE) % CHUNKSIZE
        : y % CHUNKSIZE
      const walk = getWalkCoordFromPos(x, y)
      // console.log(getRoadFromPos(x, y))
      // console.log('walk', walk)
      // console.log(getPosFromWalkCoord(walk[0], walk[1]))
      domDebug.innerHTML = (
        `three: ${tx} ${ty} | pos: ${x} ${y} | chunk: ${chunk.chunkX} ${chunk.chunkY} | chunkPos: ${relX} ${relY} | isRoad: ${walkMap[walk[1]][walk[0]]}`
      )
    }
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
  getChunkFromThreePos,

  getRoadFromPos,
  getRoadFromThreePos,

  getWalkCoordFromPos,
  getWalkCoordFromThreePos,

  getThreePosFromWalkCoord,

  getWalkMap,
  on: emitter.on
}

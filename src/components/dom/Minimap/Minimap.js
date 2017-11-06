import DomComponent from 'abstractions/DomComponent/DomComponent'

import map from 'controllers/map/map'
import store from 'utils/store'
import events from 'utils/events'

const chunkId = (i, j) => `chunk_${i}_${j}`
const translate = ({x, y}) => `translateX(${x}px) translateY(${y}px)`

function createNSNode (n, v) {
  n = document.createElementNS('http://www.w3.org/2000/svg', n)
  for (var p in v) {
    if (p === 'class') {
      (Array.isArray(v[p]) ? v[p] : [v[p]]).forEach(c => n.classList.add(c))
    } else {
      n.setAttributeNS(null, p, v[p])
    }
  }
  return n
}

function createNode (n, v) {
  n = document.createElement(n)
  for (var p in v) {
    if (p === 'class') {
      (Array.isArray(v[p]) ? v[p] : [v[p]]).forEach(c => n.classList.add(c))
    } else n[p] = v[p]
  }
  return n
}

function removeNode (n) {
  n && n.parentNode && n.parentNode.removeChild(n)
}

// function inBound (position, aabb) {
//   return position[0] >= aabb.xmin && position[0] < aabb.xmax &&
//     position[1] >= aabb.ymin && position[1] < aabb.ymax
// }

const defaultOpts = {
  width: 150,
  height: 150,
  viewDistance: 5,
  lockNorth: false
}

export default class Minimap extends DomComponent {
  // called when a new instance of Minimap is made
  didInit (opts) {
    opts = Object.assign({}, defaultOpts, opts || {})

    this.onPlayerMove = this.onPlayerMove.bind(this)
    this.onPlayerRotate = this.onPlayerRotate.bind(this)
    this.onCopAdded = this.onCopAdded.bind(this)
    this.onCopMove = this.onCopMove.bind(this)
    this.onCopRemoved = this.onCopRemoved.bind(this)

    this.width = opts.width
    this.height = opts.height

    this.viewDistance = opts.viewDistance + !(opts.viewDistance & 1)
    this.chunkDistFromCenter = (this.viewDistance - 1) / 2

    this.previousChunk = [0, 0]
    this.currentChunk = [0, 0]

    this.chunkSize = map.getChunkSize()
    this.chunkSVGWidth = this.width / this.viewDistance * 1.3
    this.chunkSVGHeight = this.height / this.viewDistance * 1.3

    this.playerPos = [0, 0]

    this.playerAng = 0
    this.lockNorth = opts.lockNorth
  }

  // the returned DOM is available from this.refs.base
  render () {
    const el = createNode('section', { class: 'gui-minimap' })
    el.style.width = this.width + 'px'
    el.style.height = this.height + 'px'

    this.refs.car = createNode('div', {
      id: 'car',
      class: 'gui-minimap-car'
    })

    this.refs.container = createNode('div', {
      class: 'gui-minimap-container'
    })

    el.appendChild(this.refs.car)
    el.appendChild(this.refs.container)

    for (let i = -this.chunkDistFromCenter; i <= this.chunkDistFromCenter; i++) {
      for (let j = -this.chunkDistFromCenter; j <= this.chunkDistFromCenter; j++) {
        this.addChunk(this.currentChunk[0] + i, this.currentChunk[1] + j)
      }
    }

    return el
  }

  update () {
    this.currentChunk = [
      Math.floor((Math.round(this.playerPos[0]) + this.chunkSize / 2) / this.chunkSize),
      Math.floor((Math.round(this.playerPos[1]) + this.chunkSize / 2) / this.chunkSize)
    ]

    const xDir = this.currentChunk[0] - this.previousChunk[0]
    const yDir = this.currentChunk[1] - this.previousChunk[1]

    if (!xDir && !yDir) return

    // console.log('[minimap] NEW CURRENT', this.currentChunk)

    if (xDir !== 0) {
      const chunkXtoRemove = this.previousChunk[0] - (this.chunkDistFromCenter * xDir)
      const chunkXtoAdd = this.currentChunk[0] + (this.chunkDistFromCenter * xDir)
      const minChunkY = this.previousChunk[1] - this.chunkDistFromCenter
      const maxChunkY = this.currentChunk[1] + this.chunkDistFromCenter
      for (let y = minChunkY; y <= maxChunkY; y++) {
        this.removeChunk(chunkXtoRemove, y)
        this.addChunk(chunkXtoAdd, y)
      }
      this.previousChunk[0] = this.currentChunk[0]
    }

    if (yDir !== 0) {
      const chunkYtoRemove = this.previousChunk[1] - (this.chunkDistFromCenter * yDir)
      const chunkYtoAdd = this.currentChunk[1] + (this.chunkDistFromCenter * yDir)
      const minChunkX = this.previousChunk[0] - this.chunkDistFromCenter
      const maxChunkX = this.currentChunk[0] + this.chunkDistFromCenter
      for (let x = minChunkX; x <= maxChunkX; x++) {
        this.removeChunk(x, chunkYtoRemove)
        this.addChunk(x, chunkYtoAdd)
      }
    }

    this.previousChunk = this.currentChunk.slice()
  }

  addChunk (i, j) {
    // console.log('[minimap] add', i, j, 'current', this.currentChunk)
    if (!this.refs.chunks) this.refs.chunks = []

    let id = chunkId(i, j)
    if (!this.refs.chunks[id]) {
      let chunk = map.getChunkFromPool(i, j)
      if (chunk) {
        let chunkEl = createNSNode('svg', {
          class: 'gui-minimap-chunk',
          width: this.chunkSVGWidth,
          height: this.chunkSVGHeight,
          viewBox: `-0.01 -0.01 ${this.chunkSize + 0.01} ${this.chunkSize + 0.01}`
        })

        chunkEl.style.left = Math.floor((-i * this.chunkSVGWidth) - (this.chunkSVGWidth / 2)) + 'px'
        chunkEl.style.top = Math.floor((-j * this.chunkSVGHeight) - (this.chunkSVGHeight / 2)) + 'px'
        chunkEl.innerHTML = chunk.svg
        this.refs.container.appendChild(chunkEl)

        this.refs.chunks[id] = chunkEl
      }
    }
  }

  removeChunk (i, j) {
    let id = chunkId(i, j)
    removeNode(this.refs.chunks[id])
    // console.log('[minimap] remove', i, j, 'current', this.currentChunk)
    this.refs.chunks[id] = null
    delete this.refs.chunks[id]
  }

  onPlayerMove (newPos) {
    this.playerPos = newPos
    this.refs.container.style.transform = translate({
      x: (this.playerPos[0] / this.chunkSize) * this.chunkSVGWidth,
      y: (this.playerPos[1] / this.chunkSize) * this.chunkSVGHeight
    })

    this.update()
  }

  onPlayerRotate (newAng) {
    this.playerAng = newAng
    if (this.lockNorth) this.refs.base.style.transform = `rotate(${this.playerAng}rad)`
    this.refs.car.style.transform = `rotate(${-this.playerAng}rad)`
  }

  onCopAdded ({ id, position }) {
    if (!this.refs.cops) this.refs.cops = []

    let cop = createNode('div', { class: 'gui-minimap-cop' })
    cop.style.transform = translate({
      x: (position[0] / this.chunkSize) * this.chunkSVGWidth,
      y: (position[1] / this.chunkSize) * this.chunkSVGHeight
    })

    this.refs.container.appendChild(cop)
    this.refs.cops[id] = cop
  }

  onCopMove ({ id, position }) {
    if (this.refs.cops[id]) {
      this.refs.cops[id].style.transform = translate({
        x: (-position[0] / this.chunkSize) * this.chunkSVGWidth,
        y: (-position[1] / this.chunkSize) * this.chunkSVGHeight
      })
    }
  }

  onCopRemoved ({ id }) {
    removeNode(this.refs.cops[id])
    this.refs.cops[id] = null
  }

  didMount (el) {
    store.watch('player.position', this.onPlayerMove)
    store.watch('player.angle', this.onPlayerRotate)
    events.on('cop.added', this.onCopAdded)
    events.on('cop.move', this.onCopMove)
    events.on('cop.removed', this.onCopRemoved)
  }

  willUnmount () {
    store.unwatch('player.position', this.onPlayerMove)
    store.unwatch('player.angle', this.onPlayerRotate)
    events.off('cop.added', this.onCopAdded)
    events.off('cop.move', this.onCopMove)
    events.off('cop.removed', this.onCopRemoved)
  }
}

import DomComponent from 'abstractions/DomComponent/DomComponent'

import map from 'controllers/map/map'
import store from 'utils/store'

export default class Minimap extends DomComponent {
  // called when a new instance of Minimap is made
  didInit (opts) {
    this.onChunkAdded = this.onChunkAdded.bind(this)
    this.onChunkRemoved = this.onChunkRemoved.bind(this)
    this.onPlayerMove = this.onPlayerMove.bind(this)
    this.onPlayerRotate = this.onPlayerRotate.bind(this)

    this.playerPos = [0, 0]
    this.playerAng = 0
  }

  // the returned DOM is available from this.refs.base
  render () {
    const el = document.createElement('section')
    el.classList.add('gui-minimap')
    el.textContent = 'MINIMAP'
    return el
  }

  update () {
    this.refs.base.textContent = `minimap pos [${this.playerPos[0].toFixed(2)}, ${this.playerPos[1].toFixed(2)}] ang ${this.playerAng.toFixed(2)}`
  }

  onChunkRemoved (chunkData) {
    console.log('MINIMAP', 'chunk removed')
  }

  onChunkAdded (chunkData) {
    console.log('MINIMAP', 'chunk added')
  }

  onPlayerRotate (newAng) {
    this.playerAng = newAng
    this.update()
  }

  onPlayerMove (newPos) {
    this.playerPos = newPos
    this.update()
  }

  // el = this.refs.base
  didMount (el) {
    // start listeners
    map.on('chunk-added', this.onChunkAdded)
    map.on('chunk-removed', this.onChunkRemoved)
    store.watch('player.position', this.onPlayerMove)
    store.watch('player.angle', this.onPlayerRotate)
  }

  willUnmount () {
    // start listeners
    map.off('chunk-added', this.onChunkAdded)
    map.off('chunk-removed', this.onChunkRemoved)
    store.unwatch('player.position', this.onPlayerMove)
    store.unwatch('player.angle', this.onPlayerRotate)
  }
}

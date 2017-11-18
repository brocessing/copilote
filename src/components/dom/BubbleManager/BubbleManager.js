import events from 'utils/events'
import DomComponent from 'abstractions/DomComponent/DomComponent'
import Bubble from 'components/dom/Bubble/Bubble'
import store from 'utils/store'
import orders from 'controllers/orders/orders'

let id = 0

export default class GameGUI extends DomComponent {
  didInit () {
    this.bindFuncs(['onOrder'])
    this.bubbles = {}
    orders.on(':all', this.onOrder)
    // this.player = store.get('player')
  }

  render () {
    const el = document.createElement('section')
    el.className = 'gui-bubbles'
    return el
  }

  onOrder (data) {
    if (store.get('player.dead')) return
    if (data.type === 'goManual') this.autoBubble('manual', 6)
    if (data.type === 'speedUp') this.autoBubble('speedup', 4)
    if (data.type === 'speedDown') this.autoBubble('speeddown', 5)
  }

  autoBubble (id, type, delay = 3000) {
    id = id + (++id)
    if (this.bubbles[id] || !this.refs.base) return
    this.addBubble(id, type)
    setTimeout(() => {
      this.deleteBubble(id)
    }, delay)
  }

  addBubble (id, type) {
    if (this.bubbles[id] || !this.refs.base) return
    this.offsetBubbles()
    this.bubbles[id] = new Bubble({ type })
    this.bubbles[id].mount(this.refs.base)
  }

  deleteBubble (id) {
    if (!this.bubbles[id] || !this.refs.base) return
    const bubble = this.bubbles[id]
    delete this.bubbles[id]
    this.offsetBubbles(-1)
    bubble.hide().then(() => bubble.destroy())
  }

  addWaypoint (e) {
    if (store.get('player.dead')) return
    console.warn('ADD', e)
    const id = e.x + '.' + e.y
    this.addBubble(id, e.dir)
  }

  offsetBubbles (off = 0) {
    let i = 0
    let len = Object.keys(this.bubbles).length
    for (let k in this.bubbles) {
      const j = len - i + off
      console.log('OFFF', j)
      const bubble = this.bubbles[k]
      bubble.offset(j)
      i++
    }
  }

  reachWaypoint (e) {
    const id = e.x + '.' + e.y
    this.deleteBubble(id)
  }

  cancelWaypoint (e) {
    const id = e.x + '.' + e.y
    if (!this.bubbles[id] || !this.refs.base) return
    const bubble = this.bubbles[id]
    delete this.bubbles[id]
    this.offsetBubbles(-1)
    bubble.hide().then(() => bubble.destroy())
  }

  reset () {
    const keys = Object.keys(this.bubbles)
    keys.forEach(k => {
      const bubble = this.bubbles[k]
      delete this.bubbles[k]
      bubble.hide().then(() => bubble.destroy())
    })
  }

  didMount () {
    this.bindFuncs(['addWaypoint', 'reachWaypoint', 'cancelWaypoint', 'reset'])
    events.on('waypoints.add', this.addWaypoint)
    events.on('waypoints.reach', this.reachWaypoint)
    events.on('waypoints.cancel', this.cancelWaypoint)
    events.on('bubbles.reset', this.reset)
  }

  willUnmount () {
    events.off('waypoints.add', this.addWaypoint)
    events.off('waypoints.reach', this.reachWaypoint)
    events.off('waypoints.cancel', this.cancelWaypoint)
    events.off('bubbles.reset', this.reset)
  }
}

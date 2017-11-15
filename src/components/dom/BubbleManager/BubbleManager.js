import events from 'utils/events'
import DomComponent from 'abstractions/DomComponent/DomComponent'
import Bubble from 'components/dom/Bubble/Bubble'

export default class GameGUI extends DomComponent {
  didInit () {
    this.bubbles = {}
    // this.player = store.get('player')
  }

  render () {
    const el = document.createElement('section')
    el.className = 'gui-bubbles'
    return el
  }

  addWaypoint (e) {
    console.warn('ADD', e)
    const id = e.x + '.' + e.y
    if (this.bubbles[id] || !this.refs.base) return
    this.offsetBubbles()
    this.bubbles[id] = new Bubble({ type: e.dir })
    this.bubbles[id].mount(this.refs.base)
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
    if (!this.bubbles[id] || !this.refs.base) return
    const bubble = this.bubbles[id]
    delete this.bubbles[id]
    this.offsetBubbles(-1)
    bubble.hide().then(() => bubble.destroy())
  }

  cancelWaypoint (e) {
    const id = e.x + '.' + e.y
    if (!this.bubbles[id] || !this.refs.base) return
    const bubble = this.bubbles[id]
    delete this.bubbles[id]
    this.offsetBubbles(-1)
    bubble.hide().then(() => bubble.destroy())
  }

  willMount (el) {
  }

  didMount () {
    this.addWaypoint = this.addWaypoint.bind(this)
    this.reachWaypoint = this.reachWaypoint.bind(this)
    this.cancelWaypoint = this.cancelWaypoint.bind(this)
    events.on('waypoints.add', this.addWaypoint)
    events.on('waypoints.reach', this.reachWaypoint)
    events.on('waypoints.cancel', this.cancelWaypoint)
  }

  willUnmount () {
    events.off('waypoints.add', this.addWaypoint)
    events.off('waypoints.reach', this.reachWaypoint)
    events.off('waypoints.cancel', this.cancelWaypoint)
  }
}

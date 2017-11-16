import store from 'utils/store'
import DomComponent from 'abstractions/DomComponent/DomComponent'
import Radar from 'components/dom/Radar/Radar'
import Minimap from 'components/dom/Minimap/Minimap'

const STATUS = ['hidden', 'transparent', 'visible']

export default class RadarWrapper extends DomComponent {
  didInit () {
    this.radar = new Radar()
    this.minimap = new Minimap()
  }

  render () {
    const el = document.createElement('section')
    el.className = 'gui-radar-wrapper'
    return el
  }

  didMount (el) {
    this.bindFuncs(['statusChange'])
    this.minimap.mount(el)
    this.radar.mount(el)
    store.watch('radar.status', this.statusChange)
    store.set('radar.status', 'hidden')
  }

  statusChange (status) {
    const el = this.refs.base
    STATUS.forEach(s => {
      if (status === s) el.classList.add(s)
      else el.classList.remove(s)
    })
  }

  willUnmount (el) {
    store.unwatch('radar.status', this.statusChange)
    this.minimap.destroy()
    this.radar.destroy()
  }
}

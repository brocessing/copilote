import store from 'utils/store'
import DomComponent from 'abstractions/DomComponent/DomComponent'
import Face from 'components/dom/Face/Face'
import stress from 'controllers/stress/stress'
import raf from 'utils/raf'

const STATUS = ['hidden', 'transparent', 'visible']

export default class Status extends DomComponent {
  didInit () {
    this.panic = null
    this.face = new Face()
  }

  render () {
    const el = document.createElement('section')
    el.className = 'gui-status'

    const stressbar = document.createElement('div')
    stressbar.className = 'status-stressbar'
    el.appendChild(stressbar)
    this.refs.stressbar = stressbar

    const stresslevel = document.createElement('div')
    stresslevel.className = 'stressbar-level'
    stressbar.appendChild(stresslevel)
    this.refs.stresslevel = stresslevel

    const stressimg = store.get('img.gui.left').cloneNode()
    stressimg.className = 'stressbar-img'
    stressbar.appendChild(stressimg)
    this.refs.stressimg = stressimg
    this.panic = false

    return el
  }

  didMount (el) {
    this.bindFuncs(['statusChange', 'update'])
    this.face.mount(el)
    store.watch('status.status', this.statusChange)
    store.set('status.status', 'hidden')
    raf.add(this.update)
  }

  update (dt) {
    if (stress.panic && !this.panic) {
      this.refs.stresslevel.classList.add('panic')
      this.refs.stressbar.removeChild(this.refs.stressimg)
      const stressimg = store.get('img.gui.left.panic').cloneNode()
      stressimg.className = 'stressbar-img'
      this.refs.stressbar.appendChild(stressimg)
      this.refs.stressimg = stressimg
      this.panic = true
    } else if (!stress.panic && this.panic) {
      this.refs.stresslevel.classList.remove('panic')
      this.refs.stressbar.removeChild(this.refs.stressimg)
      const stressimg = store.get('img.gui.left').cloneNode()
      stressimg.className = 'stressbar-img'
      this.refs.stressbar.appendChild(stressimg)
      this.refs.stressimg = stressimg
      this.panic = false
    }
    this.refs.stresslevel.style.transform = 'scaleY(' + stress.value + ')'
  }

  statusChange (status) {
    const el = this.refs.base
    STATUS.forEach(s => {
      if (status === s) el.classList.add(s)
      else el.classList.remove(s)
    })
  }

  willUnmount (el) {
    raf.remove(this.update)
    store.unwatch('status.status', this.statusChange)
  }
}

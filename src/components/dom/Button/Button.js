import DomComponent from 'abstractions/DomComponent/DomComponent'
import store from 'utils/store'
import raf from 'utils/raf'
import Inrtia from 'utils/Inrtia/Inrtia'
import loc from 'loc'
import noop from 'utils/noop'

export default class Options extends DomComponent {
  didInit (options) {
    this.locCode = options.label
    this.currentOff = [0, 0]
    this.targetOff = [0, 0]
    this.pressed = 0
    this.onclick = noop
    this.ix = new Inrtia({
      value: 0,
      interpolation: 'elastic',
      rigidity: 0.2,
      friction: 10
    })
    this.iy = new Inrtia({
      value: 0,
      interpolation: 'elastic',
      rigidity: 0.2,
      friction: 10
    })
  }

  render () {
    this.refs.front = document.createElement('div')
    this.refs.front.classList.add('button-front')
    this.refs.front.textContent = loc[store.get('lang')][this.locCode]
    this.refs.front.dataset.filltxt = loc[store.get('lang')][this.locCode]
    this.refs.front.style.backgroundImage = 'url(' + store.get('blob.cta') + ')'

    this.refs.back = document.createElement('div')
    this.refs.back.classList.add('button-back')
    this.refs.back.style.backgroundImage = 'url(' + store.get('blob.cta.shadow') + ')'

    this.refs.ground = document.createElement('div')
    this.refs.ground.classList.add('button-ground')
    this.refs.ground.style.backgroundImage = 'url(' + store.get('blob.cta.ground') + ')'

    const el = document.createElement('div')
    el.classList.add('button')
    el.appendChild(this.refs.ground)
    el.appendChild(this.refs.back)
    el.appendChild(this.refs.front)
    return el
  }

  didMount (el) {
    this.bindFuncs(['move', 'out', 'down', 'up', 'click', 'update', 'langChange'])
    el.addEventListener('mousemove', this.move)
    el.addEventListener('mouseout', this.out)
    el.addEventListener('mousedown', this.down)
    el.addEventListener('mouseup', this.up)
    el.addEventListener('click', this.click)
    store.watch('lang', this.langChange)
    raf.add(this.update)
  }

  langChange () {
    this.refs.front.textContent = loc[store.get('lang')][this.locCode]
    this.refs.front.dataset.filltxt = loc[store.get('lang')][this.locCode]
  }

  click () {
    this.onclick()
  }

  out (e) {
    this.ix.to(0)
    this.iy.to(0)
    this.ix.interpolationParams.rigidity = 0.1
    this.iy.interpolationParams.rigidity = 0.1
  }

  move (e) {
    const mx = e ? e.clientX : this.mx
    const my = e ? e.clientY : this.my
    if (e) { this.mx = e.clientX; this.my = e.clientY }
    const bounds = this.refs.base.getBoundingClientRect()
    this.ix.interpolationParams.rigidity = 0.2
    this.iy.interpolationParams.rigidity = 0.2
    this.ix.to(-(bounds.left - mx + bounds.width / 2) * 0.12 * (1 - this.pressed))
    this.iy.to(-(bounds.top - my + bounds.height / 2) * 0.12 - 3 * (1 - this.pressed))
  }

  down () {
    this.pressed = 1
    this.move()
  }

  up () {
    this.pressed = 0
    this.move()
  }

  update () {
    if (!this.refs || !this.refs.front) return
    this.ix.update()
    this.iy.update()
    this.refs.front.style.transform = (
      'translate3d(' +
      this.ix.value + 'px, ' +
      this.iy.value + 'px, ' +
      '0) ' +
      'rotate(' +
        -this.ix.value * this.iy.value * 0.05 + 'deg' +
      ')'
    )
    this.refs.back.style.transform = (
      'translate3d(' +
      this.ix.value * 0.2 + 'px, ' +
      this.iy.value * 0.2 + 'px, ' +
      '0) ' +
      'rotate(' +
        -this.ix.value * 0.8 * this.iy.value * 0.05 + 'deg' +
      ')'
    )
  }

  willUnmount () {
    this.update = noop
    raf.remove(this.update)
    store.unwatch('lang', this.langChange)
    this.refs.base.removeEventListener('click', this.click)
    this.refs.base.removeEventListener('mousemove', this.move)
    this.refs.base.removeEventListener('mouseout', this.out)
    this.refs.base.removeEventListener('mousedown', this.down)
    this.refs.base.removeEventListener('mouseup', this.up)
  }
}

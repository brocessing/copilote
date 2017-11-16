import store from 'utils/store'
import DomComponent from 'abstractions/DomComponent/DomComponent'
import stress from 'controllers/stress/stress'
import raf from 'utils/raf'
import anime from 'animejs'
import events from 'utils/events'

export default class Status extends DomComponent {
  didInit () {
    this.player = store.get('player.vehicle')
    this.lifeId = 0
    this.stressId = 0
    this.bumpTimerMax = 600
    this.bumpTimer = 0
    this.tang = 0
    this.ang = 0
  }

  render () {
    const el = document.createElement('div')
    el.className = 'status-face'

    return el
  }

  swapFace () {
    if (this.refs.img) this.refs.base.removeChild(this.refs.img)
    if (this.anims.swap) { this.anims.swap.pause(); this.anims.swap = null }
    const img = store.get('img.face.' + this.lifeId + '.' + this.stressId).cloneNode()
    img.className = 'face-img'
    this.refs.base.appendChild(img)
    this.refs.img = img
    this.anims.swap = anime({
      targets: img,
      scale: [2.3, 2],
      // rotate: [4, 0],
      skewY: [10, 0],
      elasticity: 700,
      duration: 1000
    })
  }

  didMount (el) {
    this.swapFace()
    this.bindFuncs(['update', 'onDamage'])
    events.on('player.damage', this.onDamage)
    raf.add(this.update)
  }

  onDamage () {
    this.bumpTimer = this.bumpTimerMax
  }

  update (dt) {
    if (!this.player) { this.player = store.get('player.vehicle'); return }

    this.tang = -this.player.body.angularVelocity * 0.05
    this.ang += (this.tang - this.ang) * 0.3
    this.refs.base.style.transform = 'rotate(' + this.ang + 'rad)'

    if (this.bumpTimer > 0) {
      if (this.bumpTimer === this.bumpTimerMax) {
        this.stressId = 3
        this.swapFace()
      }
      this.bumpTimer -= dt
      return
    }

    const pStressId = this.stressId
    const pLifeId = this.lifeId
    if (stress.panic) this.stressId = 3
    else if (stress.value < 0.9) this.stressId = 0
    else this.stressId = 3
    if (pStressId !== this.stressId || pLifeId !== this.lifeId) this.swapFace()
  }

  willUnmount (el) {
    raf.remove(this.update)
  }
}

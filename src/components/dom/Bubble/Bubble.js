import DomComponent from 'abstractions/DomComponent/DomComponent'

import store from 'utils/store'
import anime from 'animejs'
import prng from 'utils/prng'

const TYPES = {
  0: 'straight',
  1: 'right',
  2: 'uturn',
  3: 'left',
  4: 'speedup',
  5: 'speeddown'
}

export default class Bubble extends DomComponent {
  didInit (opts) {
    this.type = TYPES[opts.type]
  }

  render () {
    console.log(this.type)
    const el = document.createElement('div'); el.className = 'bubbles-bubble'
    const img = store.get('img.bubble.' + this.type).cloneNode()
    el.appendChild(img)
    return el
  }

  show () {
    this.anims.show = anime({
      targets: this.refs.base,
      translateY: [0, 0],
      opacity: [0, 1],
      rotate: [-20, 0],
      scale: ['*=0.5', 1],
      duration: 800
    })
  }

  hide () {
    if (this.anims.show) { this.anims.show.pause(); delete this.anims.show }
    if (this.anims.offset) { this.anims.offset.pause(); delete this.anims.offset }
    this.anims.hide = anime({
      targets: this.refs.base,
      translateX: 10,
      opacity: 0,
      rotate: 30,
      scale: 0,
      duration: 1500
    })
    return this.anims.hide.finished
  }

  offset (i) {
    if (this.anims.show) { this.anims.show.pause(); delete this.anims.show }
    if (this.anims.offset) { this.anims.offset.pause(); delete this.anims.offset }
    this.anims.offset = anime({
      targets: this.refs.base,
      translateY: i * -65 + (i - 1) * 5,
      rotate: i * 3,
      scale: 1 - i * 0.1,
      duration: 800
    })
  }

  didMount () {
    // console.log(orders.on)
    // console.log(volume.getVolume() * 1000)
    this.show()
  }
}

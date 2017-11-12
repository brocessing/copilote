import DomComponent from 'abstractions/DomComponent/DomComponent'

import store from 'utils/store'

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
  // show() return a pormise
    return new Promise((resolve, reject) => {
      // call resolve() when animation is done
    })
  }

  didMount () {
    // console.log(orders.on)
    // console.log(volume.getVolume() * 1000)
    this.show()
  }
}

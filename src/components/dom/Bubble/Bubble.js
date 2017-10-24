import DomComponent from 'abstractions/DomComponent/DomComponent'

import orders from 'controllers/orders/orders'

export default class Bubble extends DomComponent {
  didInit (opts) {
    // used from a callback so it's safer to bind this
    this.timeEnd = this.timeEnd.bind(this)
    this.msg = opts.msg
    this.type = opts.type
  }

  render () {
    const el = document.createElement('p')
    el.textContent = this.msg
    return el
  }

  timeEnd () {
    this.destroy()
  }

  didMount () {
    console.log(orders.on)
    this.show()
  }
}

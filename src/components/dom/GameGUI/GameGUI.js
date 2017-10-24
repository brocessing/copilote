import orders from 'controllers/orders/orders'

import DomComponent from 'abstractions/DomComponent/DomComponent'

import Bubble from 'components/dom/Bubble/Bubble'

export default class GameGUI extends DomComponent {
  didInit () {
    this.onOrder = this.onOrder.bind(this)
    this.bubbles = []
  }

  // Called each time a new order is received
  onOrder (data) {
    if (
      this.bubbles.length > 0 &&
      this.bubbles[this.bubbles.length - 1].type === data.type
    ) {
      // do something if this is the same order as the last
    } else {
      // if not create a new bubble
      const bubble = new Bubble({ type: data.type, msg: data.transcript })
      this.bubbles.push(bubble)
      // mount to the base gui component
      bubble.mount(this.refs.base)
      // time end the bubble 3 seconds after
      window.setTimeout(() => {
        // remove from the bubbles array
        const index = this.bubbles.indexOf(bubble)
        if (~index) this.bubbles.splice(index, 1)
        bubble.timeEnd()
      }, 3000)
    }
  }

  didMount () {
    // GUI mounted, we started listening the orders because we can display bubbles
    orders.on(':all', this.onOrder)
  }

  willUnmount () {
    // Stop listening orders
    orders.off(':all', this.onOrder)
  }
}

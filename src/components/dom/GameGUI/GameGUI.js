import DomComponent from 'abstractions/DomComponent/DomComponent'

import Minimap from 'components/dom/Minimap/Minimap'
import BubbleManager from 'components/dom/BubbleManager/BubbleManager'
import Radar from 'components/dom/Radar/Radar'

export default class GameGUI extends DomComponent {
  didInit () {
    this.bubbles = []
    this.minimap = new Minimap()
    this.bubbleManager = new BubbleManager()
    this.radar = new Radar()
  }

  didMount (el) {
    this.bubbleManager.mount(el)
    this.minimap.mount(el)
    this.radar.mount(el)
  }

  willUnmount () {
  }
}

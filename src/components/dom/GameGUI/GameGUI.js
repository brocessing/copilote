import DomComponent from 'abstractions/DomComponent/DomComponent'

import Status from 'components/dom/Status/Status'
import BubbleManager from 'components/dom/BubbleManager/BubbleManager'
import RadarWrapper from 'components/dom/RadarWrapper/RadarWrapper'
import Score from 'components/dom/Score/Score'

export default class GameGUI extends DomComponent {
  didInit () {
    this.bubbles = []
    this.status = new Status()
    this.bubbleManager = new BubbleManager()
    this.radarWrapper = new RadarWrapper()
    this.score = new Score()
  }

  didMount (el) {
    this.bubbleManager.mount(el)
    this.radarWrapper.mount(el)
    this.status.mount(el)
    this.score.mount(el)
  }

  willUnmount () {
  }
}

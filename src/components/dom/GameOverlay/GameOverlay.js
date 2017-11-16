import anime from 'animejs'
import DomComponent from 'abstractions/DomComponent/DomComponent'
import MiniButton from 'components/dom/MiniButton/MiniButton'

export default class GameOverlay extends DomComponent {
  didInit () {
  }

  render () {
    const el = document.createElement('section')
    el.classList.add('gui-introduction')
    return el
  }

  show () {
  }

  hide () {
  }

  didMount (el) {
  }
}

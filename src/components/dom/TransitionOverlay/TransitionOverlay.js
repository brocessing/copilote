import anime from 'animejs'
import DomComponent from 'abstractions/DomComponent/DomComponent'

const COUNT = 5

export default class Preloader extends DomComponent {
  render () {
    const el = document.createElement('section')
    el.classList.add('transition-overlay')

    for (let i = 0; i < COUNT; i++) {
      const panel = document.createElement('div')
      panel.classList.add('overlay-panel')
      el.appendChild(panel)
    }

    return el
  }

  show () {
    this.refs.base.classList.add('visible')
    this.refs.base.classList.remove('hidden')
    return this.timer(1000)
  }

  hide () {
    this.refs.base.classList.remove('visible')
    this.refs.base.classList.add('hidden')
    return this.timer(1000)
  }

  didMount (el) {
  }
}

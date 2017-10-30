import DomComponent from 'abstractions/DomComponent/DomComponent'
import noop from 'utils/noop'

export default class Homescreen extends DomComponent {
  didInit () {
    this.onstart = noop
    this.frenchClick = this.frenchClick.bind(this)
    this.englishClick = this.englishClick.bind(this)
    this.hide = this.hide.bind(this)
  }

  frenchClick () { this.onstart('fr') }
  englishClick () { this.onstart('en') }

  show () {}

  hide () {
    this.destroy()
  }

  didMount (el) {
    this.refs.frenchButton = el.querySelector('button')
    this.refs.frenchButton.addEventListener('click', this.frenchClick)
  }

  willUnmount () {
    // console.log('salut')
    this.refs.frenchButton.removeEventListener('click', this.frenchClick)
  }
}

import DomComponent from 'abstractions/DomComponent/DomComponent'
import Option from 'components/dom/Option/Option'

export default class Options extends DomComponent {
  didInit (options) {
    this.options = options
    this.components = {}
    for (let k in this.options) {
      this.components[k] = new Option(this.options[k])
    }
  }

  render () {
    const el = document.createElement('div')
    el.classList.add('menu-options')
    return el
  }

  didMount (el) {
    for (let k in this.components) this.components[k].mount(el)
  }

  willUnmount () {
    for (let k in this.components) this.components[k].destroy()
    this.options = undefined
    this.components = undefined
  }
}

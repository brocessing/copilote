import noop from 'utils/noop'

export default class Homescreen {
  constructor (el) {
    this.frenchClick = this.frenchClick.bind(this)
    this.englishClick = this.englishClick.bind(this)
    this.hide = this.hide.bind(this)
    if (el) this.bind(el)
    this.onstart = noop
  }

  frenchClick () { this.onstart('fr') }
  englishClick () { this.onstart('en') }

  show () {
  }

  hide () {
    this.destroy()
  }

  bind (el) {
    if (this.bound || !el) return
    this.$ = el
    this.$frenchButton = el.querySelector('button')
    this.attachEvents()
    this.bound = true
  }

  attachEvents () {
    if (!this.$ || this.bound) return
    this.$frenchButton.addEventListener('click', this.frenchClick)
  }

  detachEvents () {
    if (!this.$ || !this.bound) return
    this.$frenchButton.removeEventListener('click', this.frenchClick)
  }

  destroy () {
    if (!this.bound || !this.$) return
    this.detachEvents()
    this.$.parentNode && this.$.parentNode.removeChild(this.$)
    this.$ = null
    this.$frenchButton = null
    this.bound = false
  }
}

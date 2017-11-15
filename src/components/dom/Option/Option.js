import DomComponent from 'abstractions/DomComponent/DomComponent'
import anime from 'animejs'
import noop from 'utils/noop'
import loc from 'loc'
import store from 'utils/store'

export default class Option extends DomComponent {
  didInit (options) {
    console.log(store.get('lang'))
    this.locCode = options.data
    this.choices = loc[store.get('lang')][this.locCode]
    this.current = options.choice | 0
    this.value = this.choices[this.current]
    this.onchange = noop
  }

  render () {
    const el = document.createElement('div')
    el.classList.add('options-option')

    const right = document.createElement('div')
    right.className = 'option-bt option-rightbt'
    right.textContent = '>'
    right.dataset.filltxt = '>'

    const left = document.createElement('div')
    left.className = 'option-bt option-leftbt'
    left.textContent = '<'
    left.dataset.filltxt = '<'

    const current = document.createElement('div')
    current.classList.add('option-current')
    current.textContent = this.value
    current.dataset.filltxt = this.value

    this.refs.left = left
    this.refs.right = right
    this.refs.current = current

    el.appendChild(left)
    el.appendChild(current)
    el.appendChild(right)
    return el
  }

  didMount (el) {
    this.bindFuncs(['prev', 'next', 'langChange'])
    this.refs.left.addEventListener('click', this.prev)
    this.refs.right.addEventListener('click', this.next)
    store.watch('lang', this.langChange)
  }

  next () {
    this.current = (this.current + 1 < this.choices.length)
      ? this.current + 1
      : 0
    this.updateText()
  }

  prev () {
    this.current = (this.current > 0)
      ? this.current - 1
      : (this.choices.length - 1)
    this.updateText()
  }

  langChange () {
    this.choices = loc[store.get('lang')][this.locCode]
    this.value = this.choices[this.current]
    this.refs.current.textContent = this.value
    this.refs.current.dataset.filltxt = this.value
  }

  updateText () {
    this.value = this.choices[this.current]
    this.onchange(this.current, this.value)
    this.refs.current.textContent = this.value
    this.refs.current.dataset.filltxt = this.value
    if (this.anims.current) { this.anims.current.pause(); this.anims.current = undefined }
    this.anims.current = anime({
      targets: this.refs.current,
      scale: [1.3, 1],
      rotate: [-3, 0],
      duration: 800,
      elasticity: 700
    })
  }

  willUnmount () {
    this.refs.left.removeEventListener('click', this.next)
    this.refs.left.removeEventListener('click', this.prev)
    store.unwatch('lang', this.langChange)
  }
}

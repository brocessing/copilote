import anime from 'animejs'
import DomComponent from 'abstractions/DomComponent/DomComponent'
import MiniButton from 'components/dom/MiniButton/MiniButton'
import store from 'utils/store'
import loc from 'loc'
import noop from 'utils/noop'

export default class Popin extends DomComponent {
  didInit (opts) {
    this.class = opts.class
    this.label = opts.label
    this.nextlabel = opts.next
    this.skiplabel = opts.skip
    this.onskip = noop
    this.onnext = noop
    if (this.skiplabel) this.skip = new MiniButton({label: this.skiplabel, class: 'button button-skip'})
    if (this.nextlabel) this.next = new MiniButton({label: this.nextlabel, class: 'button button-next'})
  }

  render () {
    const el = document.createElement('div')
    el.className = this.class

    const msg = document.createElement('p')
    msg.classList.add('popin-message')
    msg.innerHTML = loc[store.get('lang')][this.label]
    msg.dataset.filltxt = loc[store.get('lang')][this.label + '.escaped'] || loc[store.get('lang')][this.label]

    const buttons = document.createElement('div')
    buttons.classList.add('popin-buttons')

    el.appendChild(msg)
    el.appendChild(buttons)

    this.refs.msg = msg
    this.refs.buttons = buttons
    return el
  }

  show () {
    this.refs.base.classList.add('touchable')
    this.anims.msg = anime({
      targets: this.refs.msg,
      translateY: ['100px', '0'],
      opacity: [0, 1],
      duration: 800
    })
    if (this.skip) { this.anims.skip = anime({
      targets: this.skip.refs.base,
      translateY: ['100px', '0'],
      opacity: [0, 1],
      duration: 800,
      delay: 70
    }) }
    if (this.next) { this.anims.next = anime({
      targets: this.next.refs.base,
      translateY: ['100px', '0'],
      opacity: [0, 1],
      duration: 800,
      delay: 140
    }) }
    if (this.next) return this.anims.next.finished
    if (this.skip) return this.anims.skip.finished
    return this.anims.msg.finished
  }

  hide () {
    this.refs.base.classList.remove('touchable')
    this.anims.msg = anime({
      targets: this.refs.msg,
      translateY: [0, -30],
      opacity: [1, 0],
      duration: 500,
      easing: 'easeOutExpo'
    })
    if (this.skip) { this.anims.skip = anime({
      targets: this.skip.refs.base,
      translateY: [0, -30],
      opacity: [1, 0],
      duration: 500,
      delay: 70,
      easing: 'easeOutExpo'
    }) }
    if (this.next) { this.anims.next = anime({
      targets: this.next.refs.base,
      translateY: [0, -30],
      opacity: [1, 0],
      duration: 500,
      delay: 140,
      easing: 'easeOutExpo'
    }) }
    if (this.next) return this.anims.next.finished
    if (this.skip) return this.anims.skip.finished
    return this.anims.msg.finished
  }

  didMount (el) {
    if (this.skip) {
      this.skip.onclick = () => { this.onskip() }
      this.skip.mount(this.refs.buttons)
    }
    if (this.next) {
      this.next.onclick = () => { this.onnext() }
      this.next.mount(this.refs.buttons)
    }
  }

  willUnmount (el) {
    this.onskip = noop
    this.onnext = noop
    if (this.skip) {
      this.skip.onclick = noop
      this.skip.destroy(this.refs.buttons)
    }
    if (this.next) {
      this.next.onclick = noop
      this.next.destroy(this.refs.buttons)
    }
  }
}

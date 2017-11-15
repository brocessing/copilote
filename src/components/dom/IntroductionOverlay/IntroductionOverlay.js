import anime from 'animejs'
import DomComponent from 'abstractions/DomComponent/DomComponent'
import MiniButton from 'components/dom/MiniButton/MiniButton'

export default class Preloader extends DomComponent {
  didInit () {
    this.skip = new MiniButton({label: 'intro.skip'})
    this.next = new MiniButton({label: 'intro.next'})
  }
  render () {
    const el = document.createElement('section')
    el.classList.add('gui-introduction')

    const popin = document.createElement('div')
    popin.classList.add('introduction-popin')

    const msg = document.createElement('p')
    msg.classList.add('popin-message')
    msg.textContent = `Faut qu'on s'échappe de là ! Tu es notre GPS alors utilise ta voix pour nous guider ! \n Joue ton rôle à fond, on compte sur toi !`
    msg.dataset.filltxt = `Faut qu'on s'échappe de là ! Tu es notre GPS alors utilise ta voix pour nous guider ! \n Joue ton rôle à fond, on compte sur toi !`

    popin.appendChild(msg)
    el.appendChild(popin)

    this.refs.popin = popin
    return el
  }

  show () {
  }

  hide () {
  }

  didMount (el) {
    this.skip.mount(this.refs.popin)
    this.skip.refs.base.className = 'button button-skip'
    this.next.mount(this.refs.popin)
    this.next.refs.base.className = 'button button-next'

    console.warn('SALUT')
  }
}

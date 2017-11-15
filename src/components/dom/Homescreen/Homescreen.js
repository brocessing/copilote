import * as Cookies from 'js-cookie'
import DomComponent from 'abstractions/DomComponent/DomComponent'
import Options from 'components/dom/Options/Options'
import Button from 'components/dom/Button/Button'
import store from 'utils/store'
import anime from 'animejs'
import noop from 'utils/noop'

const langCodes = {
  0: 'fr',
  1: 'en'
}

export default class Homescreen extends DomComponent {
  didInit () {
    this.onstart = noop
    this.options = new Options({
      'language': { data: 'home.lang', choice: store.get('langIndex') },
      'quality': { data: 'home.quality', choice: store.get('quality') }
    })
    this.button = new Button({ label: 'home.cta' })
    this.button.onclick = () => { this.onstart() }
    this.options.components.language.onchange = function (index, val = '') {
      Cookies.set('lang', langCodes[index])
      store.set('lang', langCodes[index])
    }
    this.options.components.quality.onchange = function (index, val = '') {
      Cookies.set('quality', index)
      store.set('quality', index)
    }
  }

  didMount (el) {
    this.refs.logo = document.createElement('div')
    this.refs.logo.classList.add('homescreen-logo')
    el.appendChild(this.refs.logo)

    this.refs.menu = document.createElement('div')
    this.refs.menu.classList.add('homescreen-menu')

    el.appendChild(this.refs.menu)
    this.options.mount(this.refs.menu)
    this.button.mount(this.refs.menu)

    for (let k in this.options.components) {
      const component = this.options.components[k]
      component.refs.base.style.opacity = 0
    }
    this.button.refs.base.style.opacity = 0
  }

  show () {
    this.timer(250).then(() => {
      const img = document.createElement('img')
      img.src = store.get('blob.logo')
      this.refs.logo.appendChild(img)
      this.refs.logoImg = img
      this.timer(800).then(() => this.showMenu())
    })
  }

  showMenu () {
    this.anims.logo = anime({
      targets: this.refs.logoImg,
      translateY: ['0', '-110px'],
      scale: [1, 0.95],
      duration: 800
    })
    this.timer(100, () => {
      this.anims.language = anime({
        targets: this.options.components.language.refs.base,
        translateY: ['80px', '0'],
        opacity: [0, 1],
        duration: 800
      })
    })
    this.timer(180, () => {
      this.anims.quality = anime({
        targets: this.options.components.quality.refs.base,
        translateY: ['100px', '0'],
        opacity: [0, 1],
        duration: 800
      })
    })
    this.timer(250, () => {
      this.anims.button = anime({
        targets: this.button.refs.base,
        translateY: ['120px', '0'],
        opacity: [0, 1],
        duration: 800
      })
    })
  }

  willUnmount () {
    this.button.destroy()
    this.options.destroy()
    this.options = undefined
  }
}

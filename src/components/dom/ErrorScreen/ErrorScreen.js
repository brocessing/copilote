import DomComponent from 'abstractions/DomComponent/DomComponent'
import anime from 'animejs'
import store from 'utils/store'
import loc from 'loc'

const TYPES = {
  'Web Speech API unavailable.': 'webspeech',
  'not-allowed': 'notallowed'
}

export default class ErrorScreen extends DomComponent {
  didInit (opts) {
    this.error = opts.error || {}
    this.trueMsg = this.error.message || ''
    this.type = TYPES[this.error.message] || TYPES[this.error.error] || 'unknown'
  }

  render () {
    const el = document.createElement('section')
    el.classList.add('error')

    const msg = document.createElement('div')
    msg.classList.add('error-message')

    const title = document.createElement('p')
    title.classList.add('message-title')
    title.textContent = loc[store.get('lang')]['error.' + this.type]
    title.dataset.filltxt = loc[store.get('lang')]['error.' + this.type]

    const subtitle = document.createElement('p')
    subtitle.classList.add('message-subtitle')
    if (this.type === 'unknown' && this.trueMsg) {
      subtitle.textContent = this.trueMsg
      subtitle.dataset.filltxt = this.trueMsg
    } else {
      subtitle.textContent = loc[store.get('lang')]['error.' + this.type + '.subtitle'] || ''
      subtitle.dataset.filltxt = loc[store.get('lang')]['error.' + this.type + '.subtitle'] || ''
    }

    title.style.opacity = 0
    subtitle.style.opacity = 0
    this.refs.title = title
    this.refs.subtitle = subtitle
    this.refs.message = msg
    msg.appendChild(title)
    msg.appendChild(subtitle)
    el.appendChild(msg)
    return el
  }

  show () {
    this.anims.title = anime({
      targets: this.refs.message,
      translateY: ['-50%', '-50%'],
      translateX: ['-50%', '-50%'],
      scale: [0.6, 1],
      duration: 800,
      opacity: [1, 1]
    })
    this.timer(120).then(() => {
      this.anims.title = anime({
        targets: this.refs.title,
        translateY: [80, 0],
        skewY: [-6, 0],
        duration: 800,
        opacity: [1, 1]
      })
    })
    this.timer(190).then(() => {
      this.anims.subtitle = anime({
        targets: this.refs.subtitle,
        translateY: [100, 0],
        skewY: [6, 0],
        duration: 800,
        opacity: [1, 1]
      })
    })
  }
}

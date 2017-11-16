import anime from 'animejs'
import DomComponent from 'abstractions/DomComponent/DomComponent'
import MiniButton from 'components/dom/MiniButton/MiniButton'
import store from 'utils/store'
import loc from 'loc'
import noop from 'utils/noop'
import padStart from 'lodash/padStart'



export default class GameOver extends DomComponent {
  didInit (opts) {
    this.score = opts.score
    this.class = 'gameover-popin'
    this.onskip = noop
    this.onnext = noop
    this.restart = new MiniButton({label: 'over.cta', class: 'button button-restart'})
  }

  render () {
    const el = document.createElement('div')
    el.className = this.class

    const title = document.createElement('p')
    title.classList.add('popin-title')
    title.innerHTML = loc[store.get('lang')]['over.title']
    title.dataset.filltxt = loc[store.get('lang')]['over.title']

    const score = document.createElement('p')
    score.classList.add('popin-score')
    const val = padStart('' + this.score, 8, '0') + (+this.score > 2 ? 'pts' : 'pt')
    score.innerHTML = val
    score.dataset.filltxt = val

    const subtitle = document.createElement('p')
    subtitle.classList.add('popin-subtitle')

    let val2
    if (this.score < 500) val2 = loc[store.get('lang')]['over.sub'][0]
    else if (this.score < 2000) val2 = loc[store.get('lang')]['over.sub'][1]
    else val2 = loc[store.get('lang')]['over.sub'][2]

    subtitle.innerHTML = val2
    subtitle.dataset.filltxt = val2

    el.appendChild(title)
    el.appendChild(score)
    el.appendChild(subtitle)

    this.refs.title = title
    this.refs.score = score
    this.refs.subtitle = subtitle
    return el
  }

  show () {
    this.refs.base.classList.add('touchable')
    this.anims.title = anime({
      targets: this.refs.title,
      scale: [3, 1],
      rotate: ['-45deg', '0'],
      opacity: [0, 1],
      duration: 800
    })
    this.anims.score = anime({
      targets: this.refs.score,
      translateY: ['100px', '0'],
      opacity: [0, 1],
      duration: 800,
      delay: 400 + 70
    })
    this.anims.subtitle = anime({
      targets: this.refs.subtitle,
      translateY: ['100px', '0'],
      opacity: [0, 1],
      duration: 800,
      delay: 400 + 140
    })
    this.anims.restart = anime({
      targets: this.restart.refs.base,
      translateY: ['100px', '0'],
      opacity: [0, 1],
      duration: 800,
      delay: 400 + 210
    })
    // return this.anims.restart.finished
  }

  hide () {
    this.refs.base.classList.remove('touchable')
  }

  didMount (el) {
    this.restart.onclick = () => { this.onrestart() }
    this.restart.mount(el)
  }

  willUnmount (el) {
    this.onrestart = noop
    this.restart.onclick = noop
    this.restart.destroy()
  }
}

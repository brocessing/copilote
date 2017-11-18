import store from 'utils/store'
import DomComponent from 'abstractions/DomComponent/DomComponent'

import padStart from 'lodash/padStart'

const STATUS = ['hidden', 'transparent', 'visible']

export default class Score extends DomComponent {
  render () {
    const el = document.createElement('section')
    el.className = 'gui-score'

    const score = document.createElement('div')
    score.className = 'score-content'
    this.refs.score = score
    this.updateScore(0)

    el.appendChild(score)
    return el
  }

  updateScore (score) {
    const val = padStart('' + score, 5, '0') + (+score > 2 ? 'pts' : 'pt')
    this.refs.score.textContent = val
    this.refs.score.dataset.filltxt = val
  }

  onScore (val) {
    this.updateScore(val)
  }

  didMount (el) {
    this.bindFuncs(['statusChange', 'onScore'])
    store.watch('score.value', this.onScore)
    store.watch('score.status', this.statusChange)
    store.set('score.status', 'hidden')
  }

  statusChange (status) {
    const el = this.refs.base
    STATUS.forEach(s => {
      if (status === s) el.classList.add(s)
      else el.classList.remove(s)
    })
  }

  willUnmount (el) {
    store.unwatch('score.status', this.statusChange)
  }
}

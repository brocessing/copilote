import store from 'utils/store'
import DomComponent from 'abstractions/DomComponent/DomComponent'

export default class Radar extends DomComponent {
  render () {
    const el = document.createElement('section')
    el.className = 'gui-radar'

    const img = store.get('img.gui.right').cloneNode()
    el.appendChild(img)

    return el
  }
}

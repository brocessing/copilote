import TransitionOverlay from 'components/dom/TransitionOverlay/TransitionOverlay'

const overlay = new TransitionOverlay()
const body = document.body
let base

function setup () {
  overlay.mount(body)
  base = overlay.refs.base
  body.removeChild(base)
}

function show () {
  body.appendChild(base)
  base.getBoundingClientRect()
  return overlay.show()
}

function hide () {
  return new Promise(resolve => {
    overlay
      .hide()
      .then(() => {
        body.removeChild(base)
        resolve()
      })
  })
}

export default { setup, show, hide }

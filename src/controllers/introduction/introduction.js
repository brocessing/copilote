import camera from 'controllers/camera/camera'
import IntroductionOverlay from 'components/dom/IntroductionOverlay/IntroductionOverlay'

let component

function setup () {
  component = new IntroductionOverlay()
}

function mountComponent (el) {
  if (!component) setup()
  component.mount(el)
}

export default {
  setup,
  mountComponent
}

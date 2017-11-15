export default class DomComponent {
  constructor (props) {
    // Add your DOM references to this.refs
    this.refs = {}
    // Add your animejs animation to this.anims
    this.anims = {}
    this.timers = []
    this.didInit(props)
  }

  // Use it if you want to create DOM from the JS and use mount instead of hydrate
  render () {}

  // Helper to show / hide component
  show () {}
  hide () {}

  // Called after the component is instantiated
  didInit () {}

  // Called just before the component is mounted to the DOM
  willMount () {}

  // Called just after the component is mounted to the DOM
  didMount () {}

  // Called just before the component is removed from the DOM
  willUnmount () {}

  // Use a already existing DOM element as base for the component
  hydrate (el) {
    if (!el || this.mounted) return
    this.willMount(el)
    this.refs.base = el
    this.mounted = true
    this.didMount(el)
  }

  // Render DOM from the render() function into an existing DOM element
  // If you specify a sibling, the element will be inserted before it
  mount (parent, sibling = null) {
    if (!parent || this.mounted) return
    const el = this.render()
    if (!el) return
    this.willMount(el)
    sibling ? parent.insertBefore(el, sibling) : parent.appendChild(el)
    this.refs.base = el
    this.mounted = true
    this.didMount(el)
  }

  bindFuncs (funcs) {
    funcs.forEach(func => { this[func] = this[func].bind(this) })
  }

  // Quick helper for timer in promises
  timer (delay, cb) {
    return new Promise((resolve, reject) => {
      const self = this
      if (cb) cb = cb.bind(self)
      const timer = window.setTimeout(callback, delay)
      self.timers.push(timer)
      function callback () {
        const index = self.timers.indexOf(timer)
        if (~index) self.timers.splice(index, 1)
        resolve()
        if (cb) cb()
      }
    })
  }

  // Remove the DOM and destroy the component
  destroy () {
    if (!this.mounted) return
    this.willUnmount(this.refs.base)
    this.refs.base && this.refs.base.parentNode && this.refs.base.parentNode.removeChild(this.refs.base)
    for (let k in this.refs) delete this.refs[k]
    for (let k in this.anims) {
      if (typeof this.anims[k].pause === 'function') this.anims[k].pause()
      delete this.anims[k]
    }
    // remove all non-finished timers
    this.timers.forEach(timer => window.clearTimeout(timer))
    this.anims = undefined
    this.timers = undefined
    this.refs = undefined
    this.mounted = false
  }
}

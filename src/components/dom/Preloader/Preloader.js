import anime from 'animejs'
import DomComponent from 'abstractions/DomComponent/DomComponent'
import loc from 'loc'
import store from 'utils/store'

export default class Preloader extends DomComponent {
  animateLoadingText (dom) {
    const text = dom.textContent.trim()
    dom.innerHTML = ''
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const span = document.createElement('span')
      span.classList.add('loading-char')
      span.textContent = char
      dom.appendChild(span)
    }
  }

  renderPermissionMessage () {
    const el = document.createElement('div')
    el.classList.add('preloader-permission')
    const msg = document.createElement('div')
    msg.classList.add('permission-message')
    msg.textContent = loc[store.get('lang')]['preloader.permission']
    msg.dataset.filltxt = loc[store.get('lang')]['preloader.permission']
    el.appendChild(msg)
    return el
  }

  permissionMessage () {
    this.refs.base.removeChild(this.refs.loading)
    this.refs.loading = undefined
    this.refs.permissions = this.renderPermissionMessage()
    this.refs.permmsg = this.refs.permissions.querySelector('.permission-message')
    this.refs.base.appendChild(this.refs.permissions)
    this.anims.permissions = anime({
      targets: this.refs.permmsg,
      opacity: [0, 1],
      scale: [0.1, 1],
      rotate: [-5, 0],
      duration: 1000
    })
  }

  refreshMessage () {
    this.refs.refresh = document.createElement('div')
    this.refs.refresh.classList.add('permission-refresh')
    this.refs.refresh.innerHTML = loc[store.get('lang')]['preloader.refresh']
    this.refs.refresh.dataset.filltxt = loc[store.get('lang')]['preloader.refresh.nolink']
    this.refs.permmsg.appendChild(this.refs.refresh)
    this.anims.refresh = anime({
      targets: this.refs.permmsg,
      scale: [0.7, 1],
      rotate: [4, 0],
      duration: 1200,
      elasticity: 500
    })
  }

  beginPerm () {
    this.permTimer = window.setTimeout(() => {
      this.permTimer = null
      this.permissionMessage()
      this.beginRefresh()
    }, 300)
  }

  beginRefresh () {
    this.refreshTimer = window.setTimeout(() => {
      this.refreshTimer = null
      this.refreshMessage()
    }, 3500)
  }

  stopPerm () {
    if (this.permTimer) window.clearTimeout(this.permTimer)
    if (this.refreshTimer) window.clearTimeout(this.refreshTimer)
  }

  didMount (el) {
    this.refs.loading = el.querySelector('.preloader-loading')
    this.refs.loading.textContent = loc[store.get('lang')]['preloader.loading']
    this.animateLoadingText(this.refs.loading)
  }
}

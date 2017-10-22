import config from 'config'

const loadjs = window.loadjs
const api = { bindDom, hide, loadJS }

let $el

function bindDom (el) {
  if (el) $el = el
}

function loadJS () {
  return new Promise((resolve, reject) => {
    if (!config.vendors || config.vendors.length < 1) return resolve()
    loadjs(config.vendors, { success: resolve, error: reject })
  })
}

function hide () {
  if (!$el) return
  return new Promise((resolve, reject) => {
    $el.parentNode && $el.parentNode.removeChild($el)
    resolve()
  })
}

export default api

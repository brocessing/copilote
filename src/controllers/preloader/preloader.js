/* global THREE */

import noop from 'utils/noop'
import config from 'config'

const loadjs = window.loadjs
const api = { bindDom, hide, loadJS, loadTextures, loadObjects, loadChunks }

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

function loadTextures () {
  config.initCommonMaterials()
  const loader = new THREE.TextureLoader()
  const p = []
  for (let filepath in config.textures) {
    const cb = config.textures[filepath]
    p.push(new Promise((resolve, reject) => {
      loader.load(
        filepath,
        function (tex) { cb(tex); resolve() },
        noop,
        function () { reject(new Error('Error downloading ' + filepath)) }
      )
    }))
  }
  return Promise.all(p)
}

function loadObjects () {
  config.initCommonGeometries()
  const loader = new THREE.JSONLoader()
  const p = []
  for (let filepath in config.objects) {
    const cb = config.objects[filepath]
    p.push(new Promise((resolve, reject) => {
      loader.load(
        filepath,
        function (geometry, materials) { cb(geometry, materials); resolve() },
        noop,
        function () { reject(new Error('Error downloading ' + filepath)) }
      )
    }))
  }
  return Promise.all(p)
}

function loadChunks () {
  const p = []
  for (let i = 0; i < config.chunks.count; i++) {
    p.push(new Promise((resolve, reject) => {
      const xhr = new window.XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          config.chunks.onchunkload(i, JSON.parse(this.responseText))
          return resolve()
        }
      }
      xhr.open('GET', config.chunks.folder + '/' + i + '.json', true)
      xhr.send()
    }))
  }
  return Promise.all(p)
}

function hide () {
  if (!$el) return
  return new Promise((resolve, reject) => {
    $el.parentNode && $el.parentNode.removeChild($el)
    resolve()
  })
}

export default api

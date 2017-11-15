/* global THREE */

import noop from 'utils/noop'
import config from 'config'
import store from 'utils/store'

const loadjs = window.loadjs
const api = { loadJS, loadTextures, loadObjects, loadChunks, loadImages, loadBlobs }

function loadJS () {
  return new Promise((resolve, reject) => {
    if (!config.vendors || config.vendors.length < 1) return resolve()
    loadjs(config.vendors, {
      success () { loadjs(config.threeDependencies, { success: resolve, error: reject, async: false }) },
      error: reject
    })
  })
}

function loadBlobs () {
  const p = []
  for (let filepath in config.blobs) {
    const key = config.blobs[filepath]
    p.push(new Promise((resolve, reject) => {
      const req = new window.XMLHttpRequest()
      req.open('GET', filepath, true)
      req.responseType = 'blob'
      req.onload = function () {
        if (this.status === 200) {
          const blobFile = this.response
          const blobUrl = window.URL.createObjectURL(blobFile)
          store.set('blob.' + key, blobUrl)
          resolve(blobUrl)
        }
      }
      req.onerror = reject
      req.send()
    }))
  }
  return Promise.all(p)
}

function loadImages () {
  const p = []
  for (let filepath in config.images) {
    const key = config.images[filepath]
    p.push(new Promise((resolve) => {
      const img = document.createElement('img')
      img.onload = function () { store.set('img.' + key, img); resolve() }
      img.src = filepath
      if (img.complete) { store.set('img.' + key, img); resolve() }
    }))
  }
  return Promise.all(p)
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

export default api

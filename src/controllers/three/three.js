/* global THREE */

import raf from 'raf'
import store from 'utils/store'

let scene, camera, renderer
let components = []

function setup (el) {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1, 1000
  )
  renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  renderer.setClearColor(0xf4bc7a, 1)

  store.watch('size', resize)
  resize(store.get('size'))

  el.appendChild(renderer.domElement)
  camera.position.z = 5
}

function start () { raf.add(update) }
function stop () { raf.remove(update) }

function addComponent (component) {
  if (!scene || ~components.indexOf(component) || !component.group) return
  scene.add(component.group)
  components.push(component)
}

function removeComponent (component) {
  const index = components.indexOf(component)
  if (!scene || !~index || !component.group) return
  scene.remove(component.group)
  components.splice(index, 1)
}

function update (dt) {
  components.forEach(component => component.update(dt))
  renderer.render(scene, camera)
}

function resize (size) {
  if (!renderer) return
  camera.aspect = size.w / size.h
  camera.updateProjectionMatrix()
  renderer.setSize(size.w, size.h)
  components.forEach(component => component.resize(size))
}

function getScene () { return scene || null }
function getCamera () { return camera || null }
function getRenderer () { return renderer || null }

export default {
  setup,
  start,
  stop,
  addComponent,
  removeComponent,
  getScene,
  getCamera,
  getRenderer
}

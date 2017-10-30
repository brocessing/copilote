/* global THREE, p2 */

import gui from 'controllers/datgui/datgui'
import raf from 'utils/raf'
import store from 'utils/store'
import config from 'config'
import BodyViewer from 'components/three/BodyViewer/BodyViewer'

let scene, renderer, world, currentCamera
let cameras = {}
let components = []

function setup (el) {
  world = new p2.World({ gravity: [0, 0] })
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(config.background, 5, 15)
  cameras.free = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1, 1000
  )
  renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  renderer.setClearColor(config.background, 1)
  renderer.setPixelRatio(window.devicePixelRatio || 1)

  store.watch('size', resize)
  resize(store.get('size'))

  el.appendChild(renderer.domElement)
  cameras.free.position.z = 5
  switchCamera('free')
  // store.get('geo.plane').translate(0.5, 0, 0.5)

  store.set('mat.blue', new THREE.MeshBasicMaterial({ color: 0x0000ff }))
  store.set('mat.gray', new THREE.MeshBasicMaterial({ color: 0x5a5a5a }))

  store.set('mat.wireframe', new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }))
  store.set('geo.box', new THREE.BoxBufferGeometry(1, 1, 1))
}

function start () { raf.add(update) }
function stop () { raf.remove(update) }

function addCamera (k, cam) {
  cameras[k] = cam
}

function switchCamera (k) {
  currentCamera = cameras[k]
}

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
  world.step(config.p2steps)
  components.forEach(component => component.update(dt))
  renderer.render(scene, currentCamera)
}

function resize (size) {
  if (!renderer) return
  for (let k in cameras) {
    cameras[k].aspect = size.w / size.h
    cameras[k].updateProjectionMatrix()
  }
  renderer.setSize(size.w, size.h)
  components.forEach(component => component.resize(size))
}

function bodyCopy (body, obj3d) {
  obj3d.position.x = -body.position[0]
  obj3d.position.z = body.position[1]
  obj3d.rotation.y = body.angle
}

function debugBody (body) {
  addComponent(new BodyViewer(body))
}

function getScene () { return scene || null }
function getCamera () { return currentCamera || null }
function getRenderer () { return renderer || null }
function getWorld () { return world || null }

export default {
  addCamera,
  switchCamera,
  setup,
  start,
  stop,
  debugBody,
  bodyCopy,
  addComponent,
  removeComponent,
  getScene,
  getCamera,
  getRenderer,
  getWorld
}

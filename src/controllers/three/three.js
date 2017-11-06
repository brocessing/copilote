/* global THREE, p2 */

import gui from 'controllers/datgui/datgui'
import raf from 'utils/raf'
import store from 'utils/store'
import config from 'config'
import BodyViewer from 'components/three/BodyViewer/BodyViewer'
import cameraController from 'controllers/camera/camera'

let scene, renderer, world, camera
let components = []

function setup (el) {
  world = new p2.World({ gravity: [0, 0] })
  scene = new THREE.Scene()
  cameraController.setup()
  camera = cameraController.getCamera()

  renderer = new THREE.WebGLRenderer({ antialias: !(config.lofi) })
  renderer.setClearColor(config.background, 1)
  renderer.setPixelRatio(config.lofi ? 0.5 : window.devicePixelRatio || 1)

  store.watch('size', resize)
  resize(store.get('size'))
  el.appendChild(renderer.domElement)

  world.on('impact', onImpact)
  world.solver.iterations = 4
  world.solver.tolerance = 0.5
  console.log(world)
}

function onImpact (data) {
  const bodyA = data.bodyA
  const bodyB = data.bodyB
  // console.log(data)
  if (!bodyA || !bodyA.propType || !bodyB || !bodyB.propType) return

  const propTypeA = bodyA.propType
  const propTypeB = bodyB.propType

  if (bodyA.impactCallback) bodyA.impactCallback({ impactType: propTypeB })
  if (bodyB.impactCallback) bodyB.impactCallback({ impactType: propTypeA })
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
  world.step(config.p2steps)
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

function bodyCopy (body, obj3d, offx = 0, offy = 0) {
  obj3d.position.x = -body.position[0] - offx
  obj3d.position.z = body.position[1] - offy
  obj3d.rotation.y = body.angle
}

function debugBody (body) {
  addComponent(new BodyViewer(body))
}

function getScene () { return scene || null }
function getRenderer () { return renderer || null }
function getWorld () { return world || null }

export default {
  setup,
  start,
  stop,
  debugBody,
  bodyCopy,
  addComponent,
  removeComponent,
  getScene,
  getRenderer,
  getWorld
}

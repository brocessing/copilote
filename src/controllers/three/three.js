/* global THREE, p2 */

import gui from 'controllers/datgui/datgui'
import raf from 'utils/raf'
import store from 'utils/store'
import config from 'config'
import BodyViewer from 'components/three/BodyViewer/BodyViewer'
import cameraController from 'controllers/camera/camera'

import throttle from 'lodash/throttle'

import skyScene from 'controllers/skyScene/skyScene'

let scene, renderer, world, camera, composer, composerEnabled
let components = []

function setup (el) {
  world = new p2.World({ gravity: [0, 0] })
  scene = new THREE.Scene()
  cameraController.setup()
  camera = cameraController.getCamera()

  renderer = new THREE.WebGLRenderer({ antialias: !(config.lofi) })
  renderer.setClearColor(0x8cd19c, 1)

  store.set('pixelratio', config.lofi ? 0.5 : 1)//window.devicePixelRatio || 1)
  renderer.setPixelRatio(store.get('pixelratio'))

  // scene.fog = new THREE.Fog(
  //   config.background,
  //   config.cullingMax / 3,
  //   config.cullingMax / 2
  // )

  setupPostProcessing()
  skyScene.setup()

  // const guiFn = {
  //   toggleEffectComposer () { composerEnabled = !composerEnabled }
  // }

  // gui.add(guiFn, 'toggleEffectComposer')

  const throttledResize = throttle(resize, 250)
  store.watch('size', throttledResize)
  resize(store.get('size'))
  el.appendChild(renderer.domElement)
  world.on('impact', onImpact)

  // avoid being stuck inside shape
  // world.solver.iterations = 4
  world.solver.tolerance = 2
  // console.log(world)
  renderer.autoClear = false

}

function setupPostProcessing () {
  // Setup render pass
  var renderPass = new THREE.RenderPass(scene, camera)
  // Setup SSAO pass
  // ssaoPass = new THREE.SSAOPass(scene, camera)
  renderPass.renderToScreen = true
  // Add pass to effect composer
  composer = new THREE.EffectComposer(renderer)
  composer.addPass(renderPass)

  composerEnabled = false
}

function onImpact (data) {
  // console.log(data)
  const bodyA = data.bodyA
  const bodyB = data.bodyB
  // console.log(data)
  if (!bodyA || !bodyA.propType || !bodyB || !bodyB.propType) return

  const propTypeA = bodyA.propType
  const propTypeB = bodyB.propType

  if (propTypeA === propTypeB) {
    if (bodyA.impactCallback) bodyA.impactCallback({ impactType: propTypeB })
    else if (bodyB.impactCallback) bodyB.impactCallback({ impactType: propTypeA })
  }

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

  renderer.clear()
  renderer.render(skyScene.scene, skyScene.camera)
  renderer.render(scene, camera)
  // composerEnabled
  //   ? composer.render()
  //   : renderer.render(skyScene.scene, skyScene.camera)
}

function resize (size) {
  if (!renderer) return
  camera.aspect = size.w / size.h
  camera.updateProjectionMatrix()
  renderer.setSize(size.w, size.h)

  const pixelRatio = renderer.getPixelRatio()
  const newWidth = Math.floor(size.w / pixelRatio) || 1
  const newHeight = Math.floor(size.h / pixelRatio) || 1
  composer.setSize(newWidth, newHeight)

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

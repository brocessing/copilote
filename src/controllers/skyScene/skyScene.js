/* global THREE */

import store from 'utils/store'
import sky from 'shaders/sky/sky'

const api = {
  camera: null,
  scene: null,
  quad: null,
  material: null,
  setup,
  setAngle
}

function setup () {
  api.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  api.scene = new THREE.Scene()

  const ratio = 0.4
  const geo = new THREE.PlaneBufferGeometry(2, ratio * 2)
  geo.translate(0, 1 - ratio, 0)

  api.material = sky.getMaterial()
  api.quad = new THREE.Mesh(geo, api.material)
  api.quad.frustumCulled = false
  api.scene.add(api.quad)
}

let pang = 0
function setAngle (nangle) {

  let d = pang - nangle
  if (d > Math.PI && pang >= 0 && nangle < 0) d = pang - (Math.PI + (Math.PI + nangle))
  else if (d < -Math.PI && pang < 0 && nangle >= 0) d = pang + (Math.PI + (Math.PI - nangle))

  // console.log(angle)
  api.material.uniforms.angle.value -= d
  api.material.uniforms.angle.needsUpdate = true
  // console.log(((angle * 180) / Math.PI + 180).toFixed(2))
  pang = nangle
}

export default api

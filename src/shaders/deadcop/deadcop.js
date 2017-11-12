/* global THREE */

import store from 'utils/store'

import vertexShader from './deadcop.vert'
import fragmentShader from './deadcop.frag'

let material

function setup () {
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      texture: { type: 't', value: store.get('tex.vehicles') }
    }
  })
}

export default {
  setup,
  getMaterial () { if (!material) setup(); return material }
}

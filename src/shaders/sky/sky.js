/* global THREE */

import store from 'utils/store'

import vertexShader from './sky.vert'
import fragmentShader from './sky.frag'

let material

function setup () {
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      texture: { type: 't', value: store.get('tex.landscape') },
      angle: { type: 'f', value: 0 }
    },
    depthTest: false,
    depthWrite: false
  })
}

export default {
  setup,
  getMaterial () { if (!material) setup(); return material }
}

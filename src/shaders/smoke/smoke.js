/* global THREE */

import store from 'utils/store'

import vertexShader from './smoke.vert'
import fragmentShader from './smoke.frag'

let material

function setup () {
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      texture: { type: 't', value: store.get('tex.smoke') }
    },
    transparent: true
  })
}

export default {
  setup,
  getMaterial () { if (!material) setup(); return material }
}

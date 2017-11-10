/* global THREE */

import store from 'utils/store'

import vertexShader from './road.vert'
import fragmentShader from './road.frag'

let material

function setup () {
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      texture: { type: 't', value: store.get('tex.road') }
    }
  })
}

export default {
  setup,
  getMaterial () { if (!material) setup(); return material }
}

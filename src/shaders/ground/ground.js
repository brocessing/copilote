/* global THREE */

import vertexShader from './ground.vert'
import fragmentShader from './ground.frag'
import store from 'utils/store'

let material

function setup () {
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      texture: { type: 't', value: store.get('tex.props') }
      // life: { type: 'f', value: 1 }
    }
  })
}

export default {
  setup,
  getMaterial () { if (!material) setup(); return material }
}

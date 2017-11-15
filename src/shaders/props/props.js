/* global THREE */

import store from 'utils/store'

import vertexShader from './props.vert'
import fragmentShader from './props.frag'

let material

function setup () {
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      texture: { type: 't', value: store.get('tex.props') }
    },
    side: THREE.DoubleSide
  })
}

export default {
  setup,
  getMaterial () { if (!material) setup(); return material }
}

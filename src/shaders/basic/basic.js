/* global THREE */

import store from 'utils/store'

import vertexShader from './basic.vert'
import fragmentShader from './basic.frag'

let material

function setup () {
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      texture: { type: 't', value: store.get('tex.spritesheet1') }
    }
  })
}

export default {
  setup,
  getMaterial () { if (!material) setup(); return material }
}

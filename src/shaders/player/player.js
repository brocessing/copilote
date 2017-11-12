/* global THREE */

import store from 'utils/store'

import vertexShader from './player.vert'
import fragmentShader from './player.frag'

let material

function setup () {
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      texture: { type: 't', value: store.get('tex.vehicles') },
      life: { type: 'f', value: 1 }
    }
  })
}

function setLife (val) {
  material.uniforms.life.value = val
  material.uniforms.life.needsUpdate = true
}

export default {
  setup,
  getMaterial () { if (!material) setup(); return material },
  setLife
}

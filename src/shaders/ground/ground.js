/* global THREE */

import vertexShader from './ground.vert'
import fragmentShader from './ground.frag'

let material

function setup () {
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader
  })
}

export default {
  setup,
  getMaterial () { if (!material) setup(); return material }
}

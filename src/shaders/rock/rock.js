/* global THREE */

import vertexShader from './rock.vert'
import fragmentShader from './rock.frag'

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

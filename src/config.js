/* global THREE */

import store from 'utils/store'
import tilePlane from 'utils/tilePlane'

export default {
  quickstart: 'fr',
  speechDebug: false,
  locDebug: true,
  debug: true,
  fpsCounter: true,
  p2steps: 1 / 60,
  enableSpeech: true,
  viewDistance: 3,
  chunkSize: 11,
  background: 0xffda48,
  manualDrive: false,

  // autoload vendors libraries during the preloading phase
  vendors: [
    'vendors/dat.gui.min.js',
    'vendors/three.min.js',
    'vendors/howler.min.js',
    'vendors/p2.min.js'
  ],

  // autoload textures during the preloading phase
  textures: {
    // 'textures/gradients.png': function (tex) {
    //   store.set('tex.gradient', tex)
    //   tex.format = THREE.RGBFormat
    //   tex.needsUpdate = true
    //   store.set('mat.cars', new THREE.MeshBasicMaterial({
    //     color: 0xffffff,
    //     map: tex
    //   }))
    // },
    'textures/carsMap.png': function (tex) {
      store.set('tex.cars', tex)
      tex.format = THREE.RGBAFormat
      tex.magFilter = THREE.NearestFilter
      tex.minFilter = THREE.LinearFilter
      tex.needsUpdate = true
      store.set('mat.cars', new THREE.MeshBasicMaterial({
        transparent: true,
        map: tex
      }))
    },
    // 'textures/roads.png': function (tex) {
    //   store.set('tex.road', tex)
    //   tex.format = THREE.RGBAFormat
    //   tex.magFilter = THREE.NearestFilter
    //   // tex.minFilter = THREE.LinearMigMagLinearFilter
    //   tex.needsUpdate = true
    //   store.set('mat.road', new THREE.MeshBasicMaterial({
    //     color: 0xffffff,
    //     map: tex,
    //     transparent: true
    //   }))
    //   const roads = []
    //   store.set('geo.roads', roads)
    //   roads[0] = tilePlane({ x: 4, y: 4, tileSize: 64, texSize: 256 })
    //   roads[2] = tilePlane({ x: 72, y: 4, tileSize: 64, texSize: 256 })
    //   roads[3] = tilePlane({ x: 4, y: 72, tileSize: 64, texSize: 256 })
    //   roads[4] = tilePlane({ x: 72, y: 72, tileSize: 64, texSize: 256 })
    //   roads[1] = tilePlane({ x: 4, y: 140, tileSize: 64, texSize: 256 })
    // }
    'textures/roadsMap.png': function (tex) {
      store.set('tex.road', tex)
      tex.format = THREE.RGBAFormat
      tex.magFilter = THREE.NearestFilter
      // tex.minFilter = THREE.LinearMigMagLinearFilter
      tex.needsUpdate = true
      store.set('mat.road', new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: tex
        // transparent: true
      }))
      const roads = []
      store.set('geo.roads', roads)
      roads[0] = tilePlane({ x: 1, y: 129, tileSize: 126, texSize: 512 })
      roads[1] = tilePlane({ x: 1, y: 385, tileSize: 126, texSize: 512 })
      roads[2] = tilePlane({ x: 129, y: 129, tileSize: 126, texSize: 512 })
      roads[3] = tilePlane({ x: 1, y: 257, tileSize: 126, texSize: 512 })
      roads[4] = tilePlane({ x: 129, y: 257, tileSize: 126, texSize: 512 })
    }
  },

  // autoload json objects during the preloading phase
  objects: {
    'models/bandit.json': function (geo, mats) {
      const scale = 0.4
      geo.scale(scale, scale, scale)
      geo.translate(0, 0, 0)
      store.set('geo.bandit', geo)
    }
  },

  // autoload chunks
  chunks: {
    folder: 'chunks',
    count: 1,
    onchunkload: function (id, obj) {
      if (!store.get('map.chunks')) store.set('map.chunks', [])
      store.get('map.chunks')[id] = obj
    }
  }
}

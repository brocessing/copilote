/* global THREE */

import store from 'utils/store'
import tilePlane from 'utils/tilePlane'

export default {
  quickstart: 'fr',
  speechDebug: true,
  debug: true,
  fpsCounter: true,
  p2steps: 1 / 60,

  viewDistance: 3,
  chunkSize: 11,
  background: 0xf6bf79,

  // autoload vendors libraries during the preloading phase
  vendors: [
    'vendors/dat.gui.min.js',
    'vendors/three.min.js',
    'vendors/howler.min.js',
    'vendors/p2.min.js',
    'vendors/p2.renderer.min.js'
  ],

  // autoload textures during the preloading phase
  textures: {
    'textures/gradients.png': function (tex) {
      store.set('tex.gradient', tex)
      tex.format = THREE.RGBFormat
      tex.needsUpdate = true
      store.set('mat.gradient', new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: tex
      }))
    },
    'textures/roads.png': function (tex) {
      store.set('tex.road', tex)
      tex.format = THREE.RGBFormat
      tex.magFilter = THREE.NearestFilter
      // tex.minFilter = THREE.LinearMigMagLinearFilter
      tex.needsUpdate = true
      store.set('mat.road', new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: tex
      }))
      const roads = []
      store.set('geo.roads', roads)
      roads[0] = tilePlane({ x: 4, y: 4, tileSize: 64, texSize: 256 })
      roads[2] = tilePlane({ x: 72, y: 4, tileSize: 64, texSize: 256 })
      roads[3] = tilePlane({ x: 4, y: 72, tileSize: 64, texSize: 256 })
      roads[4] = tilePlane({ x: 72, y: 72, tileSize: 64, texSize: 256 })
      roads[1] = tilePlane({ x: 4, y: 140, tileSize: 64, texSize: 256 })
    }
  },

  // autoload json objects during the preloading phase
  objects: {
    'models/r5.json': function (geo, mats) {
      const scale = 0.015
      geo.scale(scale, scale, scale)
      geo.translate(0, 0.1, 0)
      store.set('geo.r5', geo)
    }
  },

  // autoload chunks
  chunks: {
    folder: 'chunks',
    count: 5,
    onchunkload: function (id, obj) {
      if (!store.get('map.chunks')) store.set('map.chunks', [])
      store.get('map.chunks')[id] = obj
    }
  }
}

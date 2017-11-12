/* global THREE */

import store from 'utils/store'
import tilePlane from 'utils/tilePlane'
import road from 'shaders/road/road'

const LOFI = (window.location.hash && window.location.hash === '#lofi')

export default {
  lofi: LOFI, // Special case for RNO melting computer
  enableSpeech: true, //true, //true, // Disable this to test on others navigators
  quickstart: 'fr',
  speechDebug: false,
  locDebug: false,
  debug: true,
  fpsCounter: true,
  p2steps: 1 / 60,
  viewDistance: 3,
  chunkSize: 11,
  background: !LOFI ? 0xffda48 : 0x000000,
  manualDrive: true,
  cullingMin: !LOFI ? 0.07 : 0.1,
  cullingMax: !LOFI ? 9 : 5,

  // autoload vendors libraries during the preloading phase
  vendors: [
    'vendors/dat.gui.min.js',
    'vendors/howler.min.js',
    'vendors/p2.min.js',
    'vendors/three.min.js'
  ],

  threeDependencies: [
    'vendors/three/EffectComposer.js',
    'vendors/three/CopyShader.js',
    'vendors/three/ShaderPass.js',
    'vendors/three/RenderPass.js',
    'vendors/three/OutlinePass.js',
    'vendors/three/LuminosityHighPassShader.js',
    'vendors/three/UnrealBloomPass.js'
  ],

  // preload files as blob url
  blobs: {
  },

  // preload images as dom nodes
  images: {
    'ui/radar.png': 'radar',
    'ui/bubbles/straight.png': 'bubble.straight',
    'ui/bubbles/right.png': 'bubble.right',
    'ui/bubbles/uturn.png': 'bubble.uturn',
    'ui/bubbles/left.png': 'bubble.left',
    'ui/bubbles/speedup.png': 'bubble.speedup',
    'ui/bubbles/speeddown.png': 'bubble.speeddown'
  },

  // create commonly used materials
  initCommonMaterials: function () {
    store.set('mat.ground', new THREE.MeshBasicMaterial({ color: 0xffda48 }))

    store.set('mat.orange', new THREE.MeshBasicMaterial({ color: 0xf6b849 }))
    store.set('mat.red', new THREE.MeshBasicMaterial({ color: 0xff0000 }))
    store.set('mat.green', new THREE.MeshBasicMaterial({ color: 0x00ff00 }))
    store.set('mat.blue', new THREE.MeshBasicMaterial({ color: 0x0000ff }))
    store.set('mat.gray', new THREE.MeshBasicMaterial({ color: 0x5a5a5a }))
    store.set('mat.shadow', new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.7 }))

    store.set('mat.wireframe', new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }))
    store.set('mat.wfwhite', new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }))
    store.set('mat.wfgray', new THREE.MeshBasicMaterial({ color: 0x999999, wireframe: true }))
  },

  // create commonly used geometries
  initCommonGeometries: function () {
    store.set('geo.box', new THREE.BoxBufferGeometry(1, 1, 1))
    store.set('geo.plane', new THREE.PlaneBufferGeometry(1, 1))
  },

  // autoload textures during the preloading phase
  textures: {
    'textures/smoke.png': function (tex) {
      tex.format = THREE.RGBFormat
      tex.magFilter = THREE.NearestFilter
      tex.minFilter = THREE.NearestFilter
      tex.needsUpdate = true
      store.set('tex.smoke', tex)
    },

    'textures/vehicles.png': function (tex) {
      tex.format = THREE.RGBFormat
      tex.magFilter = THREE.NearestFilter
      tex.minFilter = THREE.LinearFilter
      tex.needsUpdate = true
      store.set('tex.vehicles', tex)
    },

    'textures/texMap.png': function (tex) {
      tex.format = THREE.RGBFormat
      tex.magFilter = THREE.NearestFilter
      tex.minFilter = THREE.LinearFilter
      tex.needsUpdate = true
      store.set('tex.spritesheet1', tex)
    },

    'textures/canyon.png': function (tex) {
      tex.format = THREE.RGBFormat
      tex.magFilter = THREE.NearestFilter
      tex.minFilter = THREE.LinearFilter
      tex.needsUpdate = true
      tex.needsUpdate = true
      store.set('tex.landscape', tex)
    },

    'textures/roadsMap.png': function (tex) {
      const roads = []
      store.set('geo.roads', roads)
      if (LOFI) {
        store.set('mat.road', store.get('mat.wfgray'))
        const road = tilePlane({ x: 0, y: 1, tileSize: 1, texSize: 1 })
        for (let i = 0; i < 5; i++) roads[i] = road
        return
      }
      tex.format = THREE.RGBFormat
      tex.magFilter = THREE.NearestFilter
      tex.minFilter = THREE.LinearFilter
      tex.needsUpdate = true
      store.set('tex.road', tex)
      store.set('mat.road', road.getMaterial())
      roads[0] = tilePlane({ x: 1, y: 129, tileSize: 126, texSize: 512 })
      roads[1] = tilePlane({ x: 1, y: 385, tileSize: 126, texSize: 512 })
      roads[2] = tilePlane({ x: 129, y: 129, tileSize: 126, texSize: 512 })
      roads[3] = tilePlane({ x: 1, y: 257, tileSize: 126, texSize: 512 })
      roads[4] = tilePlane({ x: 129, y: 257, tileSize: 126, texSize: 512 })
      roads[5] = tilePlane({ x: 257, y: 129, tileSize: 126, texSize: 512 })
      roads[6] = tilePlane({ x: 257, y: 385, tileSize: 126, texSize: 512 })
      roads[7] = tilePlane({ x: 385, y: 129, tileSize: 126, texSize: 512 })
      roads[8] = tilePlane({ x: 257, y: 257, tileSize: 126, texSize: 512 })
      roads[9] = tilePlane({ x: 385, y: 257, tileSize: 126, texSize: 512 })
      roads[10] = tilePlane({ x: 129, y: 385, tileSize: 126, texSize: 512 })
    }
  },

  // autoload json objects during the preloading phase
  objects: {
    'models/bandit.json': function (geo, mats) {
      const scale = 0.4
      geo.scale(scale, scale, scale)
      geo.translate(0, 0, 0)
      store.set('geo.bandit', geo)
    },
    'models/cop.json': function (geo, mats) {
      const scale = 0.4
      geo.scale(scale, scale, scale)
      geo.translate(0, 0, 0)
      store.set('geo.cop', geo)
    },
    'models/cactus.json': function (geo, mats) {
      // const scale = 0.4
      // geo.scale(scale, scale, scale)
      // geo.translate(0, 0, 0)
      store.set('geo.cactus', geo)
    },
    'models/sign1.json': function (geo, mats) {
      const scale = 0.5
      geo.rotateY(Math.PI / 4)
      geo.scale(scale, scale, scale)
      // geo.translate(0, 0, 0)
      store.set('geo.sign1', geo)
    },
    'models/sign2.json': function (geo, mats) {
      const scale = 0.5
      geo.rotateY(Math.PI / 4)
      geo.scale(scale, scale, scale)
      // geo.translate(0, 0, 0)
      store.set('geo.sign1', geo)
    },
    'models/sign3.json': function (geo, mats) {
      const scale = 0.5
      geo.rotateY(Math.PI / 4)
      geo.scale(scale, scale, scale)
      // geo.translate(0, 0, 0)
      store.set('geo.sign1', geo)
    },
    'models/caillou.json': function (geo, mats) {
      const scale = 0.5
      geo.rotateY(Math.PI / 4)
      geo.scale(scale, scale * 2, scale)
      geo.translate(0, 0.01, 0)
      store.set('geo.caillou', geo)
    }
  },

  // autoload chunks
  chunks: {
    folder: 'chunks',
    count: 7,
    onchunkload: function (id, obj) {
      if (!store.get('map.chunks')) store.set('map.chunks', [])
      store.get('map.chunks')[id] = obj
    }
  }
}

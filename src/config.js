/* global THREE */

import store from 'utils/store'
import tilePlane from 'utils/tilePlane'
import road from 'shaders/road/road'

const LOFI = (window.location.hash && window.location.hash === '#lofi')

export default {
  lofi: LOFI, // Special case for RNO melting computer
  datgui: false,
  fpsCounter: true,
  enableSpeech: true,
  quickstart: true,
  speechDebug: false,
  locDebug: false,
  debug: false,
  p2steps: 1 / 60,
  viewDistance: 3,
  chunkSize: 11,
  background: !LOFI ? 0x8cd19c : 0x000000,
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
    'ui/button.gif': 'cta',
    'ui/button-back.gif': 'cta.shadow',
    'ui/button-ground.gif': 'cta.ground',
    'ui/logo.gif': 'logo'
  },

  // preload images as dom nodes
  images: {
    'ui/faces/face-0-0.gif': 'face.0.0',
    'ui/faces/face-0-1.gif': 'face.0.1',
    'ui/faces/face-0-2.gif': 'face.0.2',
    'ui/faces/face-1-0.gif': 'face.1.0',
    'ui/faces/face-1-1.gif': 'face.1.1',
    'ui/faces/face-1-2.gif': 'face.1.2',
    'ui/faces/face-2-0.gif': 'face.2.0',
    'ui/faces/face-2-1.gif': 'face.2.1',
    'ui/faces/face-2-2.gif': 'face.2.2',

    'ui/right.gui.gif': 'gui.right',
    'ui/left.gui.gif': 'gui.left',
    'ui/left.gui.panic.gif': 'gui.left.panic',

    'ui/bubbles/straight.png': 'bubble.straight',
    'ui/bubbles/right.png': 'bubble.right',
    'ui/bubbles/uturn.png': 'bubble.uturn',
    'ui/bubbles/left.png': 'bubble.left',
    'ui/bubbles/speedup.png': 'bubble.speedup',
    'ui/bubbles/speeddown.png': 'bubble.speeddown',
    'ui/bubbles/wheel.png': 'bubble.wheel',
    'ui/bubbles/radio.png': 'bubble.radio'
  },

  // used for cubemap
  cube: [
    'cube/px.jpg', 'cube/nx.jpg',
    'cube/py.jpg', 'cube/ny.jpg',
    'cube/pz.jpg', 'cube/nz.jpg'
  ],

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

    'textures/props.png': function (tex) {
      tex.format = THREE.RGBFormat
      tex.magFilter = THREE.NearestFilter
      tex.minFilter = THREE.LinearFilter
      tex.needsUpdate = true
      store.set('tex.props', tex)
    },

    'textures/skybox.png': function (tex) {
      tex.format = THREE.RGBFormat
      tex.magFilter = THREE.NearestFilter
      tex.minFilter = THREE.LinearFilter
      tex.needsUpdate = true
      tex.needsUpdate = true
      store.set('tex.landscape', tex)
    },

    'textures/roads.png': function (tex) {
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
    'models/siren.json': function (geo, mats) {
      const scale = 0.4
      geo.scale(scale, scale, scale)
      geo.translate(0, 0, 0)
      store.set('geo.siren', geo)
    },
    'models/bank.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(0, 0, 1.0)
      store.set('geo.bank', geo)
    },
    'models/farm.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(-2.0, 0, -1.0)
      store.set('geo.farm', geo)
    },
    'models/hangar.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(-2.0, 0, 1.0)
      store.set('geo.hangar', geo)
    },
    'models/station.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(-1.0, 0, 1.0)
      store.set('geo.station', geo)
    },
    'models/house.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(4.0, 0, 1.0)
      store.set('geo.house', geo)
    },
    'models/trashyard.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(1.0, 0, -1.0)
      store.set('geo.trashyard', geo)
    },
    'models/rock_2x.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(4.0, 0, -2.0)
      store.set('geo.rock.2x', geo)
    },
    'models/rock_medium.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(3.0, 0, -1.0)
      store.set('geo.rock.medium', geo)
    },
    'models/rock_small.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(2.0, 0, -1.0)
      store.set('geo.rock.small', geo)
    },
    'models/cactus.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(-3.0, 0, 1.0)
      store.set('geo.cactus', geo)
    },
    'models/nature_2x.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(-4.0, 0, -2.0)
      store.set('geo.nature2x', geo)
    },
    'models/ad.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(2.0, 0, 1.0)
      store.set('geo.ad', geo)
    },
    'models/sign.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(1.0, 0, 1.0)
      store.set('geo.sign', geo)
    },
    'models/accident.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(3.0, 0, 1.0)
      store.set('geo.accident', geo)
    },
    'models/motel.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(-1.0, 0, -1.0)
      store.set('geo.motel', geo)
    },
    'models/cigarette.json': function (geo, mats) {
      const scale = 0.5
      geo.scale(scale, scale, scale)
      geo.translate(0.0, 0, -1.0)
      store.set('geo.cigarette', geo)
    }
  },

  // autoload chunks
  chunks: {
    folder: 'chunks',
    count: 16,
    onchunkload: function (id, obj) {
      if (!store.get('map.chunks')) store.set('map.chunks', [])
      store.get('map.chunks')[id] = obj
    }
  }
}

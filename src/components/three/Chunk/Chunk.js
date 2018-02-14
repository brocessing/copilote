/* global THREE */

import store from 'utils/store'
import map from 'controllers/map/map'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import three from 'controllers/three/three'

import RoadTile from 'components/three/RoadTile/RoadTile'

import House from 'components/three/House/House'
import Bank from 'components/three/Bank/Bank'
import Farm from 'components/three/Farm/Farm'
import Hangar from 'components/three/Hangar/Hangar'
import Station from 'components/three/Station/Station'
import Trashyard from 'components/three/Trashyard/Trashyard'
import Rock from 'components/three/Rock/Rock'
import Cactus from 'components/three/Cactus/Cactus'
import Nature2x from 'components/three/Nature2x/Nature2x'
import Ad from 'components/three/Ad/Ad'
import Sign from 'components/three/Sign/Sign'
import Accident from 'components/three/Accident/Accident'
import Motel from 'components/three/Motel/Motel'
import Cigarette from 'components/three/Cigarette/Cigarette'
import Rock2x from 'components/three/Rock2x/Rock2x'

const BUILDINGS = {
  1: { Instance: Bank },
  2: { Instance: Farm },
  3: { Instance: Hangar },
  4: { Instance: Station },
  5: { Instance: House },
  6: { Instance: Trashyard },
  7: { Instance: Ad },
  8: { Instance: Sign },
  9: { Instance: Accident },
  10: { Instance: Motel },
  11: { Instance: Cigarette }
}

const PROPS = {
  1: { Instance: Rock },
  2: { Instance: Cactus },
  3: { Instance: Nature2x },
  4: { Instance: Rock2x }
}

const mergedRoads = {}
const mergedPBs = {}

function mergeRoads (poolId, roads) {
  let tiles = []
  for (let k in roads) {
    const road = roads[k]
    const tile = new RoadTile(road, roads)
    tiles.push(tile)
  }
  let geometry = new THREE.Geometry()
  tiles.forEach(tile => {
    geometry.mergeMesh(tile.group)
    tile.destroy()
    tile = undefined
  })
  tiles = undefined
  mergedRoads[poolId] = new THREE.BufferGeometry().fromGeometry(geometry)
}

export default class Chunk extends ThreeComponent {
  setup (opts) {
    opts.buildings.forEach(building => {
      const id = building[2]
      if (!BUILDINGS[id]) return
      let instanceOpts = {
        x: building[0],
        y: building[1],
        cx: opts.x,
        cy: opts.y
      }
      if (BUILDINGS[id].opts) instanceOpts = BUILDINGS[id].opts(instanceOpts)
      this.addComponent(new BUILDINGS[id].Instance(instanceOpts))
    })

    opts.props.forEach(prop => {
      const id = prop[2]
      if (!PROPS[id]) return
      let instanceOpts = {
        x: prop[0],
        y: prop[1],
        cx: opts.x,
        cy: opts.y
      }
      if (PROPS[id].opts) instanceOpts = PROPS[id].opts(instanceOpts)
      this.addComponent(new PROPS[id].Instance(instanceOpts))
    })

    if (!mergedRoads[opts.poolId]) mergeRoads(opts.poolId, opts.road)
    this.meshes.roads = new THREE.Mesh(mergedRoads[opts.poolId], store.get('mat.road'))
    this.group.add(this.meshes.roads)
  }

  update (dt) {
    super.update(dt)
  }

  destroy () {
    super.destroy()
  }
}

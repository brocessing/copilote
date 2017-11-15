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

const BUILDINGS = {
  1: { Instance: Bank },
  2: { Instance: Farm },
  3: { Instance: Hangar },
  4: { Instance: Station },
  5: { Instance: House },
  6: { Instance: Trashyard }
}

const PROPS = {
  1: { Instance: Rock }
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

    for (let k in opts.road) {
      const road = opts.road[k]
      this.addComponent(new RoadTile(road, opts.road))
    }
  }

  update (dt) {
    super.update(dt)
  }

  destroy () {
    super.destroy()
  }
}

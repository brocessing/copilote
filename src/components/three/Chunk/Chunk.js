import store from 'utils/store'
import map from 'controllers/map/map'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import three from 'controllers/three/three'
import RoadTile from 'components/three/RoadTile/RoadTile'
import House from 'components/three/House/House'

const BUILDINGS = {
  25: { Instance: House },
  15: { Instance: House }
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

    for (let k in opts.road) {
      const road = opts.road[k]
      this.addComponent(new RoadTile(road))
    }
  }

  update (dt) {
    super.update(dt)
  }

  destroy () {
    super.destroy()
  }
}

/* global THREE */
import store from 'utils/store'
import map from 'controllers/map/map'
import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import three from 'controllers/three/three'

const moveFromDir = {
  0: [0, -1],
  1: [1, 0],
  2: [0, 1],
  3: [-1, 0]
}

export default class Terrain extends ThreeComponent {
  // t: type / p: pos / r: rotation / n: neighbors links
  setup (opts, roads) {
    // console.log('added')
    // console.log(opts)
    const isSand = opts.c === 15
    let type = isSand ? opts.t + 5 : opts.t
    if (type === 3) {
      const relDir = opts.n[(opts.r + 1)] % 4 ? 1 : 3
      const move = moveFromDir[(opts.r + relDir) % 4]
      const key = (opts.p[0] + move[0]) + '.' + (opts.p[1] + move[1])
      if (roads[key].c === 15) type = 10
    }
    this.group = new THREE.Mesh(store.get('geo.roads')[type], store.get('mat.road'))
    this.group.rotation.y = opts.r * Math.PI / 2
    this.group.position.x = opts.p[0] + 0.5
    this.group.position.z = opts.p[1] + 0.5
  }

  update (dt) {
    super.update(dt)
  }

  destroy () {
  }
}

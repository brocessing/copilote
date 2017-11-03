import random from 'utils/random'

import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import three from 'controllers/three/three'

import Terrain from 'components/three/Terrain/Terrain'
import PlayerCar from 'components/three/PlayerCar/PlayerCar'
import camera from 'controllers/camera/camera'
import cops from 'controllers/cops/cops'

export default class Main extends ThreeComponent {
  setup () {
    // const gridHelper = new THREE.GridHelper(map.getChunkSize() * 3, map.getChunkSize() * 3)
    // this.group.add(gridHelper)
    // const axisHelper = new THREE.AxisHelper( 5 )
    // this.group.add(axisHelper)
    cops.setup()
    this.playerCar = this.addComponent(new PlayerCar())
    this.terrain = this.addComponent(new Terrain())
    camera.setTarget(this.playerCar)
  }

  update (dt) {
    super.update(dt)
    cops.update(dt)
    camera.update(dt)
  }
}

import random from 'utils/random'

import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import three from 'controllers/three/three'

import PlayerCar from 'components/three/PlayerCar/PlayerCar'
import CameraFollow from 'components/three/CameraFollow/CameraFollow'
import Box from 'components/three/Box/Box'
import Terrain from 'components/three/Terrain/Terrain'
import map from 'controllers/map/map'

export default class Main extends ThreeComponent {
  setup () {
    // const gridHelper = new THREE.GridHelper(map.getChunkSize() * 3, map.getChunkSize() * 3)
    // this.group.add(gridHelper)
    // const axisHelper = new THREE.AxisHelper( 5 )
    // this.group.add(axisHelper)
    this.playerCar = this.addComponent(new PlayerCar())
    this.terrain = this.addComponent(new Terrain())
    // for (let i = 0; i < 150; i++) {
    //   this.addComponent(new Box({
    //     x: i * random(-0.5, 0.5),
    //     y: i * random(-0.5, 0.5),
    //     width: random(0.1, 10),
    //     height: random(0.1, 10)
    //   }))
    // }

    this.cameraFollow = new CameraFollow()
    this.cameraFollow.setTarget(this.playerCar.group, this.playerCar.chassis)
    three.addCamera('car', this.cameraFollow.camera)
    three.switchCamera('car')
  }

  update (dt) {
    super.update(dt)
    this.cameraFollow.update(dt)
  }
}

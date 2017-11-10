import random from 'utils/random'

import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import three from 'controllers/three/three'

import Terrain from 'components/three/Terrain/Terrain'
import PlayerCar from 'components/three/PlayerCar/PlayerCar'
import camera from 'controllers/camera/camera'
import cops from 'controllers/cops/cops'

import particles from 'controllers/particles/particles'

import gui from 'controllers/datgui/datgui'
import store from 'utils/store'

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
    particles.setup()
    // gui.add(this, 'addParticles').name('Spawn particles')
    this.resize(store.get('size'))
  }

  update (dt) {
    super.update(dt)
    cops.update(dt)
    particles.update(dt)
    camera.update(dt)
  }

  resize (size) {
    super.resize(size)
    const scale = (size.h / 750) * (store.get('pixelratio') / 2)
    console.log(store.get('pixelratio'), scale, size.h)
    particles.setScale(scale)
  }
}

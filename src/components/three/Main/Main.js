import random from 'utils/random'

import ThreeComponent from 'abstractions/ThreeComponent/ThreeComponent'
import three from 'controllers/three/three'

import Car from 'components/three/Car/Car'
import CameraFollow from 'components/three/CameraFollow/CameraFollow'
import Box from 'components/three/Box/Box'

export default class Main extends ThreeComponent {
  setup () {
    this.car = this.addComponent(new Car())
    for (let i = 0; i < 150; i++) {
      this.addComponent(new Box({
        x: i * random(-0.5, 0.5),
        y: i * random(-0.5, 0.5),
        width: random(0.1, 10),
        height: random(0.1, 10)
      }))
    }

    this.cameraFollow = new CameraFollow()
    this.cameraFollow.setTarget(this.car.group)
    three.addCamera('car', this.cameraFollow.camera)
    three.switchCamera('car')
  }

  update (dt) {
    super.update(dt)
    this.cameraFollow.update(dt)
  }
}

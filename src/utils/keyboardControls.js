export default function kbControls (frontWheel, backWheel) {
  const keys = {
    '37': 0, // left
    '39': 0, // right
    '38': 0, // up
    '40': 0 // down
  }
  const maxSteer = Math.PI / 3.6

  document.addEventListener('keydown', (evt) => {
    keys[evt.keyCode] = 1
    onInputChange()
  })

  document.addEventListener('keyup', (evt) => {
    keys[evt.keyCode] = 0
    onInputChange()
  })

  function onInputChange () {
    // Steer value zero means straight forward. Positive is left and negative right.
    frontWheel.targetSteerValue = maxSteer * (keys[37] - keys[39])
    backWheel.targetSteerValue = maxSteer * (keys[37] - keys[39])

    // Engine force forward
    backWheel.engineForce = keys[38] * 5
    backWheel.setBrakeForce(3)
    if (keys[40]) {
      if (backWheel.getSpeed() > 0.1) {
        // Moving forward - add some brake force to slow down
        backWheel.setBrakeForce(5)
      } else {
        // Moving backwards - reverse the engine force
        backWheel.setBrakeForce(0)
        backWheel.engineForce = -2
      }
    }
  }
}

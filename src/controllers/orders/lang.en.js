import instructions from 'utils/instructionsCreator'

const english = instructions()

// english
//   .replacer('droite-gauche', 'droite gauche')

english.order('goRight')
  .add('turn right|go right|right')

english.order('goStraight')
  .add('go straight|straight')

english.order('goLeft')
  .add('go left|turn left|left')

english.order('goManual')
  .add('i will drive|i drive', { continuous: false })

english.order('turnBack')
  .add('turn back')

english.order('start')
  .add('start the car', { continuous: false })
  .add('start')

english.order('stop')
  .add('stop the car', { continuous: false })
  .add('stop')

export default english.toObj()

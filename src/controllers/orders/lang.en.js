import instructions from 'utils/instructionsCreator'

const english = instructions()

english
  .replacer('black', 'back')
  .replacer('street', 'straight')

english.order('goRight')
  .add('turn right|go right|right')

english.order('goStraight')
  .add('go straight|straight')

english.order('goLeft')
  .add('go left|turn left|left')

english.order('turnBack')
  .add('turn back|go back')

english.order('start')
  .add('start the car', { continuous: false })
  .add('start')

english.order('stop')
  .add('stop the car', { continuous: false })
  .add('stop')

english.order('goManual')
  .add('i drive|i will drive|i take the lead|give me the controller|gimme the controller', { continuous: false })

english.order('speedUp')
  .add('speed up|faster')

english.order('speedDown')
  .add('speed down|slower|speed o')

english.order('radioOn')
  .add('put the radio on|turn on the radio', { continuous: false })

export default english.toObj()

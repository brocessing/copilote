import instructions from 'utils/instructionsCreator'

const french = instructions()

french
  .replacer('droite-gauche', 'droite gauche')
  .replacer('gauche-droite', 'gauche droite')
  .replacer('france', 'fonce')
  .replacer('annonce|ok morse|cadence', 'avance')
  .replacer('aux lentilles|râle entier', 'ralenti')

french.order('goLeft')
  .add('tourner à gauche|tourne à gauche|à gauche|gauche')

french.order('goRight')
  .add('tourner à droite|tourne à droite|à droite|droite|20 droites')

french.order('goStraight')
  .add('tous droits|vas tout droit|tout droit|tous droit|droit devant|avance|tu dois|toulon')

french.order('speedUp')
  .add('à vence|accéléré|auxerre|fonce|foncer|va plus vite|plus vite|accélère|augmente la vitesse')

french.order('speedDown')
  .add('ralenti|ralentis|ralentir|moins vite|décélérer|décélére|en entier')

french.order('stop')
  .add('stop toi|stop|arrête|arrêter|freine')

french.order('radioOn')
  .add('(?:mets|mais) la radio sur ([a-z0-9 ]+)', { continuous: false, capture: true })

export default french.toObj()

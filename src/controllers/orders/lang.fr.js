import instructions from 'utils/instructionsCreator'

const french = instructions()

french
  .replacer('droite-gauche', 'droite gauche')
  .replacer('gauche-droite', 'gauche droite')
  .replacer('france', 'fonce')
  .replacer('annonce|ok morse|cadence', 'avance')
  .replacer('aux lentilles|râle entier|argentine', 'ralenti')
  .replacer('accès|auxerre|quelle heure', 'accélère')
  .replacer('accroché|accrocher', 'à gauche')

french.order('goRight')
  .add('tourner à droite|tourne à droite|à droite|droite|20 droites')

french.order('goStraight')
  .add('tous droits|vas tout droit|tout droit|tous droit|droit devant|avance|tu dois|toulon')

french.order('goLeft')
  .add('tourner à gauche|tourne à gauche|à gauche|gauche|à cause')

french.order('goManual')
  .add('passe-moi le volant|je prends le volant|je conduis', { continuous: false })

french.order('turnBack')
  .add('fais demi-tour|demi-tour|demi moore')

french.order('start')
  .add('allume le moteur|mets le contact', { continuous: false })
  .add('bernard|neymar|démarre|demarrer|démarrer|avance|avancer')

french.order('stop')
  .add('coupe le (moteur|contact)', { continuous: false })
  .add('stop toi|stop|arrête|arrêter|arrête-toi')

french.order('speedUp')
  .add('accélèrer|accélère|plus vite|foncer|foncer|va plus vite|augmente la vitesse')

french.order('speedDown')
  .add('ralenti|ralentir|ralentis|moins vite|en entier')

french.order('radioOn')
  .add('allume la radio|mets la radio|radio|mets du son|active la radio', { continuous: false })

export default french.toObj()

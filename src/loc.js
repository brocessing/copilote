const fr = {}
const en = {}

fr['preloader.loading'] = 'chargement'
en['preloader.loading'] = 'loading...'

fr['preloader.permission'] = 'C\'est un hold-up ! Donne nous ta voix !'
en['preloader.permission'] = 'This is a hold-up! Give us your voice!'

fr['preloader.refresh'] = 'Le microphone est accessible et rien ne se passe ? <a href="./">Recharge la page !</a>'
en['preloader.refresh'] = 'The mic is enabled and nothing happens ? <a href="./">Reload the page!</a>'

fr['preloader.refresh.nolink'] = 'Le microphone est accessible et rien ne se passe ? Recharge la page !'
en['preloader.refresh.nolink'] = 'The mic is enabled and nothing happens ? Reload the page!'

fr['error.webspeech'] = 'Les vrais braqueurs sont sur Chrome...'
fr['error.webspeech.subtitle'] = 'Le braquage nécessite la Webspeech API pour se dérouler correctement (diponible sur Chrome)'

en['error.webspeech'] = 'Armed robbers are on Chrome browser...'
en['error.webspeech.subtitle'] = 'The heist needs the Webspeech API in order to take place (available on Chrome) '

fr['error.notallowed'] = 'Hé, on t\'entend pas !'
fr['error.notallowed.subtitle'] = 'Active ton micro, puis recharge ton flingue et la page !'

en['error.notallowed'] = 'We can\'t hear you!'
en['error.notallowed.subtitle'] = 'Switch your mic on, then reload your gun and the page!'

fr['error.unknown'] = 'Erreur !'
en['error.unknown'] = 'Error!'

fr['home.cta'] = 'jouer!'
en['home.cta'] = 'play!'

fr['home.lang'] = ['français', 'anglais']
en['home.lang'] = ['french', 'english']

fr['home.quality'] = ['basse qualité', 'haute définition']
en['home.quality'] = ['low quality', 'high quality']

// BUTTONS
fr['intro.button.next'] = `Suivant`
en['intro.button.next'] = `Next`

fr['intro.button.start'] = `On y va!`
en['intro.button.start'] = `Let's go!`

fr['intro.button.skip'] = `Passer`
en['intro.button.skip'] = `Skip`

// GPS
fr['intro.gps'] = `Faut qu'on s'échappe de là !\n Tu es notre GPS alors utilise ta voix pour nous guider !\n Joue ton rôle à fond, on compte sur toi !`
en['intro.gps'] = `We need to escape from the police!\n You are our GPS, so use your voice to guide us!\n Don't mess around, we lean on you!`

// POLICE
fr['intro.police'] = `On a piraté les ondes radios de la police !\n Anticipe leur mouvements avec le radar à l'écran !\n Fais gaffe : la voiture est résistante mais 4 chocs et on est cuit !`
en['intro.police'] = `We hacked police's radios!\n So try to predict their movements with the radar on the screen!\n Be careful : the car is tough but it explodes after 4 bumps!`

// STRESS
fr['intro.stress'] = `Sois précis sur tes instructions sinon c'est la panique !\n Garde un oeil sur la jauge de stress ! \n Allez, on se taille de là !`
en['intro.stress'] = `Your instructions needs to be accurate or it will be too much pressure!\n Keep an eye on the stress bar ! \n Alright, let's get out of here!`

fr['intro.wakeup'] = `Hé, t'es muet ou quoi ?!\n On va à gauche ou à droite ?`
en['intro.wakeup'] = `Hey, are you dumb or what?!\n We go left or right?`

fr['over.title'] = `Coffré!`
en['over.title'] = `Wasted!`

fr['over.sub'] = [
  `Pfff... La prochaine fois, on télécharge Waze...`,
  `Dans 500 mètres, prends la sortie "recommence"`,
  `On y était presque... Dommage que tu finisses en pièce à conviction.`
]
en['over.sub'] = [
  `Uhhh... Next time, we'll use Waze instead...`,
  `In 500 meters, take the exit "start again"`,
  `That was close... It's too bad that you end up as an evidence.`
]

fr['over.cta'] = `Recidiver`
en['over.cta'] = `Reoffend`

export default { fr, en }

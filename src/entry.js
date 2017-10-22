import speech from 'controllers/speech'
import orders from 'controllers/orders'

speech
  .start('fr')
  .then(orders.listen)

const log = document.createElement('pre')
document.body.appendChild(log)

orders.on(':all', ({order}) => {
  if (order === 'radioOn') return
  log.innerHTML = log.innerHTML + order + '\n'
})

orders.on('radioOn', ({order, match}) => {
  console.log(match)
  log.innerHTML = log.innerHTML + '🎶🎶 ' + match[1].toUpperCase() + ' 🎶🎶' + '\n'
})
// let transcript = ''

// speech.on('result', event => {
//   console.log(event)
//   let interim = ''
//   for (var i = event.resultIndex; i < event.results.length; ++i) {
//     if (event.results[i].isFinal) transcript += event.results[i][0].transcript
//     else {
//       interim += event.results[i][0].transcript
//       let a = ''
//       for (let j = 0; j > event.results[i].length; j++) {
//         a += event.results[i][j].transcript + '  /  '
//       }
//       console.log(a)
//     }
//   }
//   div.innerHTML = transcript + interim
// })

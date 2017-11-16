import store from 'utils/store'
import events from 'utils/events'

const api = {
  value: 0,
  panic: false,
  add,
  remove
}

events.on('stress.add', (v) => {
  add(v)
})

events.on('stress.remove', (v) => {
  remove(v)
})

events.on('waypoints.reach', () => {
  remove(0.04)
})

events.on('waypoints.cancel', () => {
  add(0.09)
})

function add (val) {
  if ((api.value + val) >= 1 && api.panic === false) { api.panic = true; store.set('stress.panic', true) }
  api.value = Math.min(1, api.value + val)
}

function remove (val) {
  if ((api.value - val) <= 0 && api.panic === true) { api.panic = false; store.set('stress.panic', false) }
  api.value = Math.max(0, api.value - val)
}

export default api

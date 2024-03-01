import { h } from './lib/h.js'


const online = h('div', {classList: 'message', id: 'online'}, ['Online: '])
//const offline = h('div', {classList: 'message', id: 'offline'}, ['Offline'])

export const contacts = h('div', {id: 'contacts'}, [
  online,
  //offline
])


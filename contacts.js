import { h } from './lib/h.js'

const online = h('div', {classList: 'message', id: 'online'}, ['Online: '])

export const contacts = h('div', {id: 'contacts'}, [online])


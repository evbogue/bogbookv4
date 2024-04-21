import { h } from './lib/h.js'
import { bogbot } from './bogbot.js'
import { avatar } from './avatar.js'
import { search } from './search.js'

const pubkey = await bogbot.pubkey()

export const navbar = h('navbar' , {id: 'navbar'}, [
  search,
  await avatar(pubkey),
  ' ',
  h('a', {href: '#'}, ['Home']),
  ' ',
  h('a', {href: '#settings'}, ['Settings']),
  ' ',
  h('a', {href: 'https://github.com/evbogue/bogbookv4'}, ['Git'])
])

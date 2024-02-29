import { h } from './lib/h.js'
import { ed25519 } from './keys.js'
import { avatar } from './avatar.js'
import { search } from './search.js'

const pubkey = await ed25519.pubkey()

export const navbar = h('navbar' , {id: 'navbar'}, [
  search,
  await avatar(pubkey),
  ' ',
  h('a', {href: '#'}, ['Home']),
  ' ',
  h('a', {href: '#settings'}, ['Keypair']),
  ' ',
  h('a', {href: 'https://github.com/evbogue/bogbookv4'}, ['Git'])
])

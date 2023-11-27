import { h } from './lib/h.js'
import { ed25519 } from './keys.js'
import { avatar } from './avatar.js'

const pubkey = await ed25519.pubkey()

export const navbar = h('navbar' , {id: 'navbar'}, [
  await avatar(pubkey),
  ' ',
  h('a', {href: '#'}, ['Home']),
  ' ',
  h('a', {href: '#settings'}, ['Settings'])
])

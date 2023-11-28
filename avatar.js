import { h } from './lib/h.js'
import { vb } from './lib/vb.js'
import { cachekv } from './lib/cachekv.js'
import { ed25519 } from './keys.js'
import { decode } from './lib/base64.js'

const avatarImg = async (pubkey) => {
  const img = vb(decode(pubkey), 256)

  img.classList = 'avatar'

  return h('a', {href: '#' + pubkey}, [img])
}

const avatarName = async (pubkey) => {
  const name = h('a', {href: '#' + pubkey}, [pubkey.substring(0, 7) + '...'])

  const getPrevious = await cachekv.get(pubkey)

  let previous
  if (getPrevious) { previous = JSON.parse(getPrevious)} else { previous = {} } 

  if (previous && previous.name) {
    name.textContent = previous.name 
  }

  return name
}

export const avatar = async (pubkey) => {
  const span = h('span', [
    await avatarImg(pubkey),
    ' ',
    await avatarName(pubkey),
  ])

  return span
}

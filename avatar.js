import { h } from './lib/h.js'
import { cachekv } from './lib/cachekv.js'
import { ed25519 } from './keys.js'

const avatarName = async (pubkey) => {
  const mykey = await ed25519.pubkey()

  const name = h('a', {href: '#' + pubkey}, [pubkey.substring(0, 7) + '...'])

  const getPrevious = await cachekv.get(pubkey)

  let previous
  if (getPrevious) { previous = JSON.parse(getPrevious)} else { previous = {} } 

  const input = h('input')

  if (previous && previous.name) {
    name.textContent = previous.name 
    input.placeholder = previous.name
  }

  const nameSpan = h('span', [
    name,
    ' ', 
  ])

  const inputSpan = h('span', [
    input,
    ' ',
    h('button', { onclick: async () => {
      if (input.value) {
        previous.name = input.value
        await cachekv.put(pubkey, JSON.stringify(previous))
        inputSpan.replaceWith(await avatarName(pubkey))
      } else {
        inputSpan.replaceWith(await avatarName(pubkey))
      }
    }}, ['Done'])
  ])

  const editButton = h('span', {
    style: 'cursor: pointer;',
    onclick: () => {
      nameSpan.replaceWith(inputSpan)
    }
  }, ['✏️'])

  const avatarSpan = h('span', [
    nameSpan
  ])

  if (pubkey === mykey) {
    nameSpan.appendChild(editButton)
  }
  
  return avatarSpan 
}

export const avatar = async (pubkey) => {
  const span = h('span', [
    h('span', ['🧑‍💻']),
    ' ',
    await avatarName(pubkey),
  ])

  return span
}

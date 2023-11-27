import { h } from './lib/h.js'
import { ed25519 } from './keys.js'
import { cachekv } from './lib/cachekv.js'

const keypair = await ed25519.keypair()
const pubkey = await ed25519.pubkey() 

const getPrevious = await cachekv.get(pubkey)

let previous

if (getPrevious) { previous = JSON.parse(getPrevious)} else { previous = {} }

const input = h('input')

if (previous && previous.name) {
  input.placeholder = previous.name
}

const textarea = h('textarea', [keypair])

const saveButton = h('button', {
  onclick: async () => {
    if (textarea.value && textarea.value.length === keypair.length) {
      
    } else { 
      alert('Invalid Keypair')
    }
    if (input.value) {
      previous.name = input.value
      await cachekv.put(pubkey, JSON.stringify(previous))
    }
    location.href = '#'
    location.reload()
  }
}, ['Save'])

const deleteEverything = h('button', {style: 'float: right;'}, ['Delete Everything'])

export const settings = h('div', {classList: 'message'}, [
  'Name: ', 
  input,
  h('br'),
  'Keypair:',
  h('br'),
  textarea,
  h('br'),
  deleteEverything,
  saveButton
])

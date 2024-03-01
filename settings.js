import { h } from './lib/h.js'
import { ed25519 } from './keys.js'
import { cachekv } from './lib/cachekv.js'

const keypair = await ed25519.keypair()

const textarea = h('textarea', [keypair])

const deleteKeypair = h('button', {
  style: 'float: right;',
  onclick: async () => {
    await ed25519.deletekey()
    location.href = '#'
    location.reload()
  }
}, ['Delete Keypair'])

const deleteEverything = h('button', {
  style: 'float: right;',
  onclick: async () => {
    await cachekv.clear()
    await ed25519.deletekey() 
    location.href = '#'
    location.reload()
  }
}, ['Delete Everything'])

const saveButton = h('button', {
  onclick: async () => {
    if (textarea.value && textarea.value.length === keypair.length) {
      await localStorage.setItem('keypair', textarea.value)
    } else {
      alert('Invalid Keypair')
    }
    location.href = '#'
    location.reload()
  }
}, ['Save'])

export const settings = h('div', {classList: 'message'}, [
  'Keypair:',
  h('br'),
  textarea,
  h('br'),
  deleteKeypair,
  deleteEverything,
  saveButton
])

import { h } from './lib/h.js'
import { gossip } from './gossip.js'
import { ed25519 } from './keys.js'
import { publish, open } from './sbog.js' 
import { find } from './blob.js'
import { box } from './sbox.js'
import { cachekv } from './lib/cachekv.js'
import { avatar } from './avatar.js'
import { logs } from './log.js' 

const pubkey = await ed25519.pubkey()

const id = await avatar(pubkey)

const textarea = h('textarea', {placeholder: 'Write a message', style: 'width: 98%;'})

const button = h('button', {
  onclick: async () => {
    const getPrevious = await cachekv.get(pubkey)

    let previous

    if (!getPrevious) { previous = {} }

    if (getPrevious) {
      previous = JSON.parse(getPrevious)
    }

    let previousHash
    if (previous && previous.msg) {
      previousHash = previous.msg.hash
    } 
    const signed = await publish(textarea.value, previousHash)  
    const opened = await open(signed)
    const blob = await find(opened.data)
    const obj = {
      type: 'post',
      latest: true,
      payload: signed,
      blob
    }
    if (previous && previous.name) {
      obj.name = previous.name
    }
    logs.add(signed)      
    gossip(JSON.stringify(obj))
    previous.msg = opened
    cachekv.put(pubkey, JSON.stringify(previous))  
    textarea.value = ''
    
  }
}, ['Send'])

const composeDiv = h('div', {classList: 'message'}, [
  id,
  textarea,
  h('br'),
  button,
])

export const composer = h('div', [composeDiv])


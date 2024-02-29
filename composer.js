import { h } from './lib/h.js'
import { gossip } from './gossip.js'
import { ed25519 } from './keys.js'
import { publish, open } from './sbog.js' 
import { find } from './blob.js'
import { cachekv } from './lib/cachekv.js'
import { avatar } from './avatar.js'
import { logs } from './log.js' 
import { markdown } from './markdown.js'
import { render } from './render.js'

const pubkey = await ed25519.pubkey()

export const composer = async (msg) => {

  const id = await avatar(pubkey)
  const getPrevious = await cachekv.get(pubkey)

  console.log(getPrevious)

  let previousHash
  let previous

  if (!getPrevious) { previous = {} }

  if (getPrevious) {
    const obj = JSON.parse(getPrevious)
    const opened = await open(obj.payload)
    console.log(opened)
    previous = opened
  }

  console.log(previous)


  if (previous) {
    previousHash = previous.hash
  }

  console.log(previousHash)

  const select = window.getSelection().toString()

  const preview = h('div')

  let context = ''

  if (msg) {
    const getReplyPrevious = JSON.parse(await cachekv.get(msg.author))
    context = '[' + (getReplyPrevious.name || msg.author.substring(0, 7)) + '](' + msg.author + ') ↳ [' + (select || msg.hash.substring(0, 7)) + '](' + msg.hash + ') '
    preview.innerHTML = await markdown(context)
  }

  if (!msg) { msg = {hash: 'home'}}

  const textarea = h('textarea', {placeholder: 'Write a message', style: 'width: 98%;'})

  textarea.addEventListener('input', async () => {
    if (textarea.value) {
      cachekv.put('draft:' + msg.hash, textarea.value)
      
    } else {
      cachekv.rm('draft:' + msg.hash)
    }
    preview.innerHTML = await markdown(context + '\n\n' + textarea.value)
  })

  const got = await cachekv.get('draft:' + msg.hash)

  if (got) {
    textarea.value = got
    preview.innerHTML = await markdown(textarea.value)
  }

  const button = h('button', {
    onclick: async () => {
      let content
      if (context) {
        content = context + '\n\n' + textarea.value
      } else {
        content = textarea.value
      }
      const signed = await publish(content, previousHash)  
      const opened = await open(signed)
      const blob = await find(opened.data)
      const obj = {
        type: 'latest',
        payload: signed,
        blob
      }
      if (previous && previous.name) {
        obj.name = previous.name
      }
      if (previous && previous.image) {
        obj.image = previous.image
      }
      logs.add(signed)
      console.log(obj)      
      gossip(obj)
      previous.payload = signed
      opened.text = blob
      const rendered = await render(opened)
      cachekv.put(pubkey, JSON.stringify(previous))
      textarea.value = ''
      cachekv.rm('draft:' + msg.hash)
      preview.textContent = ''
      if (msg && msg.hash != 'home') {
        if (composeDiv) {
          composeDiv.replaceWith(rendered)
        }
      } if (msg.hash = 'home') {
        composeDiv.after(rendered)
      } 
    }
  }, ['Send'])
  
  const composeDiv = h('div', {classList: 'message'}, [
    id,
    preview,
    textarea,
    h('br'),
    button,
  ])

  return composeDiv
}

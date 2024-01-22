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

const id = await avatar(pubkey)

export const composer = async (msg) => {

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

  const select = window.getSelection().toString()

  const re = h('div')

  let context = ''

  if (msg) {
    const getReplyPrevious = JSON.parse(await cachekv.get(msg.author))
    context = '[' + (getReplyPrevious.name || msg.author.substring(0, 7)) + '](' + msg.author + ') ↳ [' + (select || msg.hash.substring(0, 7)) + '](' + msg.hash + ') '
    re.innerHTML = await markdown(context)
  }

  if (!msg) { msg = {hash: 'home'}}

  const preview = h('div', [h('p', [' '])])

  const textarea = h('textarea', {placeholder: 'Write a message', style: 'width: 98%;'})

  textarea.addEventListener('input', async () => {
    if (textarea.value) {
      cachekv.put('draft:' + msg.hash, textarea.value)
      
    } else {
      cachekv.rm('draft:' + msg.hash)
    }
    preview.innerHTML = await markdown(textarea.value)
  })

  const got = await cachekv.get('draft:' + msg.hash)

  if (got) {
    console.log(got)
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
      opened.text = blob
      const rendered = await render(opened)
      textarea.value = ''
      cachekv.rm('draft:' + msg.hash)
      preview.textContent = ''
      if (msg && msg.hash != 'home') {
        composeDiv.replaceWith(rendered)
      } 
    }
  }, ['Send'])
  
  const composeDiv = h('div', {classList: 'message'}, [
    id,
    re,
    preview,
    textarea,
    h('br'),
    button,
  ])

  return composeDiv
}

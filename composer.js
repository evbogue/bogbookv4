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
import { getInfo, saveInfo } from './getinfo.js'

const pubkey = await ed25519.pubkey()

export const composer = async (msg) => {

  const id = await avatar(pubkey)

  const select = window.getSelection().toString()

  const preview = h('div')

  let context = ''
  
  if (msg) {
    const getReplyPrevious = await getInfo(msg.author)
    //const getReplyPrevious = JSON.parse(await cachekv.get(msg.author))
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
      const latest = await getInfo(pubkey)

      let previousHash

      if (latest.payload) {
        const opened = await open(latest.payload)
        previousHash = opened.hash
      }

      let content
      if (context) {
        content = context + '\n\n' + textarea.value
      } else {
        content = textarea.value
      }
      const signed = await publish(content, previousHash)  
      const opened = await open(signed)
      const blob = await find(opened.data)
      latest.type = 'latest'
      latest.payload = signed
      latest.blob = blob
      logs.add(signed)
      gossip(latest)
      opened.text = blob
      const rendered = await render(opened)
      saveInfo(pubkey, latest) 
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
  
  const composeDiv = h('div', {id: 'reply:' + msg.hash, classList: 'message'}, [
    id,
    preview,
    textarea,
    h('br'),
    button,
  ])

  return composeDiv
}

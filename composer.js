import { h } from './lib/h.js'
import { gossip } from './gossip.js'
import { bogbot } from './bogbot.js'
import { cachekv } from './lib/cachekv.js'
import { avatar } from './avatar.js'
import { markdown } from './markdown.js'
import { render } from './render.js'

const pubkey = await bogbot.pubkey()

export const composer = async (msg) => {

  const id = await avatar(pubkey)

  const preview = h('div')

  let context = ''
  
  if (msg) {
    const getReplyPrevious = await bogbot.getInfo(msg.author)
    context = '[' + (getReplyPrevious.name || msg.author.substring(0, 7)) + '](' + msg.author + ') ↳ [' + (msg.hash.substring(0, 7)) + '](' + msg.hash + ') '
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
      const latest = await bogbot.getInfo(pubkey)

      let previousHash

      if (latest.payload) {
        const opened = await bogbot.open(latest.payload)
        previousHash = opened.hash
      }

      let content
      if (context) {
        content = context + '\n\n' + textarea.value
      } else {
        content = textarea.value
      }
      const signed = await bogbot.publish(content, previousHash)  
      const opened = await bogbot.open(signed)
      const blob = await bogbot.find(opened.data)
      latest.type = 'latest'
      latest.payload = signed
      latest.text = blob
      bogbot.add(signed)
      gossip(latest)
      opened.text = blob
      const rendered = await render(opened)
      bogbot.saveInfo(pubkey, latest) 
      textarea.value = ''
      cachekv.rm('draft:' + msg.hash)
      preview.textContent = ''
      if (msg && msg.hash != 'home') {
        if (composeDiv) {
          composeDiv.replaceWith(rendered)
        }
      } if (msg.hash == 'home') {
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

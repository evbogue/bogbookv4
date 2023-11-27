import { h } from './lib/h.js'
import { human } from './lib/human.js'
import { avatar } from './avatar.js'
import { find } from './blob.js'
import { markdown } from './markdown.js'
import { composer } from './composer.js'

export const render = async (m) => {
  const pubkey = await avatar(m.author)
  const blob = await find(m.data)

  const content = h('div', {id: m.data})

  if (m.text) { content.innerHTML = await markdown(m.text)}

  if (blob) { content.innerHTML = await markdown(blob) }

  const ts = h('a', {href: '#' + m.hash }, [human(new Date(m.timestamp))])

  const raw = h('code')

  const prev = h('a', { href: '#' + m.previous
  }, [h('code', ['prev'])])

  const rawButton = h('code', {
    style: 'cursor: pointer;',
    href: '',
    onclick: (e) => {
      e.preventDefault()
      if (!raw.textContent) {
        raw.textContent = JSON.stringify(m)
      } else { raw.textContent = ''} 
    }
  }, ['raw'])

  setInterval(() => {
    ts.textContent = human(new Date(m.timestamp))
  }, 10000)

  const right = h('span', {style: 'float: right;'}, [
    rawButton,
    ' ',
    prev,
    ' ',
    h('code', [m.author.substring(0, 7)]),
    ' ',
    ts
  ])

  const reply = h('button', {
    onclick: async () => {
      div.parentNode.appendChild(await composer(m))
    }
  }, ['Reply'])

  const div = h('div', {id: m.hash, classList: 'message'}, [
    right, 
    pubkey,
    ' ', 
    content,
    raw,
    reply
  ])

  const msgDiv = h('div', [div])

  return msgDiv
}

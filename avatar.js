import { h } from './lib/h.js'
import { cachekv } from './lib/cachekv.js'
import { stat } from './latest.js'
import { ed25519 } from './keys.js'
import { vb } from './lib/vb.js'
import { decode } from './lib/base64.js'
import { trystero } from './trystero.js'

const pubkey = await ed25519.pubkey()

export const avatar = async (id) => {
  const uploadButton = h('button', {
    onclick: () => {
      input.click()
    }
  }, ['📸 '])

  const input = h('input', {
    type: 'file', style: 'display: none;', onchange: (e) => {
      const file = e.srcElement.files[0]
      const reader = new FileReader()
      reader.onloadend = async () => {
        img.src = await reader.result
        const imagesOnScreen = document.getElementsByClassName('image' + id)
        for (const image of imagesOnScreen) {
          image.src = img.src
        }
        stat.image = img.src
        stat.type = 'latest'
        trystero.send(stat)
        await cachekv.put(pubkey, JSON.stringify(stat))
      }
      reader.readAsDataURL(file)
  }})

  const img = vb(decode(id), 256)

  img.classList = 'avatar image' + id

  const link = h('a', {href: '#' + id, classList: 'name' + id}, [id.substring(0, 7) + '...'])

  const getInfo = await cachekv.get(id)

  let latest = {}

  if (getInfo) {
    latest = JSON.parse(getInfo)
  }
  if (latest.name) {
    link.textContent = latest.name
  }

  if (latest.image) {
    img.src = latest.image
  }

  const space = h('span', [' '])
  const spacetwo = h('span', [' '])

  const span = h('span', [
    img,
    ' ',
    link,
    space
  ])

  const edit = h('button', {onclick: () => {
    const input = h('input', {style: 'width: 125px;', placeholder: id.substring(0, 7) + '...' || stat.name })
    const editSpan = h('span', [
      input,
      h('button', {onclick: async () => {
        if (input.value) {
          stat.name = input.value
          link.textContent = input.value
          await cachekv.put(pubkey, JSON.stringify(stat))
          stat.type = 'latest'
          trystero.send(stat)
          const namesOnScreen = document.getElementsByClassName('name' + id)
          for (const names of namesOnScreen) {
            names.textContent = input.value
          }
          editSpan.replaceWith(span)
        }
      }}, ['Save'])
    ])
    span.replaceWith(editSpan)
  }}, ['📝'])

  if (id === pubkey) {
    space.after(input)
    space.after(uploadButton)
    space.after(spacetwo)
    space.after(edit)
  }

  return span
}


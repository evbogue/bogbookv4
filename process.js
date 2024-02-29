import { h } from './lib/h.js'
import { open } from './sbog.js'
import { unbox } from './sbox.js'
import { make, find } from './blob.js'
import { render } from './render.js'
import { cachekv } from './lib/cachekv.js'
import { logs } from './log.js'
import { markdown } from './markdown.js'
import { gossip } from './gossip.js'
import { avatar } from './avatar.js'

export const process = async (msg, id) => {
  const scroller = document.getElementById('scroller')
  if (msg.length === 44) {
    const blob = await find(msg)

    if (blob) {
      const obj = {type: 'blob', payload: blob}
      gossip(obj)
    }
  }

  if (msg.type === 'blob') {
    const hash = await make(msg.payload)
    const blobDiv = document.getElementById(hash)
    if (blobDiv) { blobDiv.innerHTML = await markdown(msg.payload)}
  }
  if (msg.type === 'post' || msg.type === 'latest') {
    const opened = await open(msg.payload)
    const alreadyHave = await logs.get(opened.hash)
    
    if (msg.type === 'latest') {
      const getDetails = await cachekv.get(opened.author)

      let latest = {}

      if (getDetails) {latest = JSON.parse(getDetails)}

      if (msg.image || msg.name) {
        if (msg.name) {
          if (latest.name != msg.name) {

            latest.name = msg.name
            setTimeout(() => {
              const namesOnScreen = document.getElementsByClassName('name' + opened.author)
              for (const names of namesOnScreen) {
                names.textContent = latest.name
              }
            }, 100)

          }
        }
        if (msg.image) {
          if (latest.image != msg.image) {
            latest.image = msg.image
            setTimeout(() => {
              const imagesOnScreen = document.getElementsByClassName('image' + opened.author)
              for (const image of imagesOnScreen) {
                image.src = latest.image
              }
            }, 100)
          }
        }
      }
      await cachekv.put(opened.author, JSON.stringify(msg))
      if (id) {
        const onlineId = document.getElementById(id)
        const newOnlineId = h('div', {id, classList: 'message'}, [await avatar(opened.author)])
        onlineId.replaceWith(newOnlineId)
      }
    }

    if (!alreadyHave) {
      logs.add(opened.raw)
      if (msg.blob) {
        await make(msg.blob)
      }
      if (msg.boxed) {
        opened.text =  '🔒 '
        opened.text = opened.text + (await unbox(msg.boxed) || '')
      } else {
        opened.text = msg.blob
      }

      const rendered = await render(opened)

      const alreadyRendered = document.getElementById(opened.hash)

      const src = window.location.hash.substring(1)

      const shouldWeRender = (src === opened.author || src === opened.hash || src === '')

      if (!scroller.firstChild && shouldWeRender && !alreadyRendered || !alreadyHave && shouldWeRender) {
        scroller.insertBefore(rendered, scroller.childNodes[1])
      }

      const previous = await logs.get(opened.previous)

      if (!previous) { gossip(opened.previous)}
    }
  }
}

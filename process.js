import { h } from './lib/h.js'
import { open } from './sbog.js'
import { unbox } from './sbox.js'
import { make } from './blob.js'
import { render } from './render.js'
import { cachekv } from './lib/cachekv.js'
import { logs } from './log.js'
import { markdown } from './markdown.js'
import { gossip } from './gossip.js'

export const process = async (m) => {
  const scroller = document.getElementById('scroller')
  const msg = await JSON.parse(m)
  if (msg.type === 'blob') {
    const hash = await make(msg.payload)
    const blobDiv = document.getElementById(hash)
    if (blobDiv) { blobDiv.innerHTML = await markdown(msg.payload)}
  }
  if (msg.type === 'post') {
        
    const opened = await open(msg.payload)
    const alreadyHave = await logs.get(opened.hash)

    if (!alreadyHave) {
      logs.add(opened.raw)

      if (msg.latest) {
        const previous = {
          msg: opened
        }
        if (msg.name) {previous.name = msg.name}
        const alreadyHave = await logs.get(opened.hash)
        await cachekv.put(opened.author, (JSON.stringify(previous)))
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

      console.log(shouldWeRender)

      if (!scroller.firstChild && shouldWeRender && !alreadyRendered || !alreadyHave && shouldWeRender && !msg.latest) {
        scroller.appendChild(rendered)
      } else if (!alreadyRendered && !alreadyHave && shouldWeRender && msg.latest) {
        scroller.insertBefore(rendered, scroller.childNodes[1])
      }

      const previous = await logs.get(opened.previous)

      if (!previous) { gossip(opened.previous)}
    }
  }
}

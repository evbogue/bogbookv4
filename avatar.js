import { h } from './lib/h.js'
import { cachekv } from './lib/cachekv.js'
import { ed25519 } from './keys.js'
import { find, make } from './blob.js'
import { vb } from './lib/vb.js'
import { decode } from './lib/base64.js'
import { trystero } from './trystero.js'
import { getInfo, saveInfo } from './getinfo.js'


const pubkey = await ed25519.pubkey()

export const avatar = async (id) => {
  const img = vb(decode(id), 256)

  img.classList = 'avatar image' + id

  const link = h('a', {href: '#' + id, classList: 'name' + id}, [id.substring(0, 7) + '...'])

  const latest = await getInfo(id)

  if (latest.name) {
    link.textContent = latest.name
  }

  if (latest.image) {
    if (latest.image.length > 44) {
      const blob = await make(latest.image)
      img.src = blob
      latest.image = blob
      await saveInfo(id, latest)
    } if (latest.image.length === 44) {
      const blob = await find(latest.image)
      img.src = blob
      if (!blob) {
        trystero.send(latest.image)
      }
    }
  }

  const span = h('span', [
    img,
    ' ',
    link,
  ])

  return span
}


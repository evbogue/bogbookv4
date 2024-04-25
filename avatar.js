import { h } from './lib/h.js'
import { bogbot } from './bogbot.js'
import { vb } from './lib/vb.js'
import { decode } from './lib/base64.js'
import { gossip} from './gossip.js'

const pubkey = await bogbot.pubkey()

export const avatar = async (id) => {
  const img = vb(decode(id), 256)

  img.classList = 'avatar image' + id

  const link = h('a', {href: '#' + id, classList: 'name' + id}, [id.substring(0, 7) + '...'])

  const latest = await bogbot.getInfo(id)

  if (latest.name) {
    link.textContent = latest.name
  }

  if (latest.image) {
    if (latest.image.length > 44) {
      const blob = await bogbot.make(latest.image)
      img.src = blob
      latest.image = blob
      await bogbot.saveInfo(id, latest)
    } if (latest.image.length === 44) {
      const blob = await bogbot.find(latest.image)
      if (blob) {
      img.src = blob
      }
      if (!blob) {
        gossip(latest.image)
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


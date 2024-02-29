import { process } from './process.js'
import { ed25519 } from './keys.js'
import { addSocket, rmSocket} from './gossip.js'
import { logs } from './log.js'
import { trystero } from './trystero.js'
import { stat } from './latest.js'
import { h } from './lib/h.js'

export const connect = (s) => {
  trystero.connect({appId: 'bogbookv4public', password: 'password'})

  trystero.onmessage(async (data, id) => {
    await process(data, id)
  })

  trystero.join(id => {
    const online = document.getElementById('online')
    trystero.send(stat)
    console.log('joined ' + id)
    const contact = h('div', {id, classList: 'message'})
    online.after(contact)
  })

  trystero.leave(id => {
    const got = document.getElementById(id)
    got.remove()
    console.log('left ' + id)
  })

  const ws = new WebSocket(s)
  ws.binaryType = 'arraybuffer'

  ws.onopen = async () => {
    const pubkey = await ed25519.pubkey()
    addSocket(ws)
    ws.send(pubkey)

    const feeds = await logs.getFeeds()
    feeds.forEach(feed => {
      if (feed != pubkey) {
        ws.send(feed)
      }
    })
  }

  ws.onmessage = async (e) => {
    await process(JSON.parse(e.data))
  }

  ws.onclose = (e) => {
    rmSocket(ws)
    setTimeout(function () {
      connect(s)
    }, 1000)
  }

  let retryCount = 1

  ws.onerror = (err) => {
    setTimeout(() => {
      ws.close()
      rmSocket(ws)
      retryCount++
    }, 10000 * retryCount)
  }
}

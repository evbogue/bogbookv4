import { process } from './process.js'
import { ed25519 } from './keys.js'
import { addSocket, rmSocket} from './gossip.js'
import { logs } from './log.js'

export const connect = (s) => {
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
    await process(e.data)
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

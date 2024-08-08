import { process } from './process.js'
import { bogbot } from './bogbot.js'
import { addSocket, rmSocket} from './gossip.js'
import { joinRoom } from './lib/trystero-torrent.min.js'
import { h } from './lib/h.js'

const pubkey = await bogbot.pubkey()

const room = joinRoom({appId: 'bogbookv4public', password: 'password'}, 'trystero')

export const [ send, onmessage ] = room.makeAction('message')

onmessage(async (data, id) => {
  await process(data, id)
})

room.onPeerJoin(async (id) => {
    const latest = await bogbot.getInfo(pubkey)
    send(latest)
    console.log('joined ' + id)
    const feeds = await bogbot.getFeeds()
    feeds.forEach(feed => {
      if (feed != pubkey) {
        send(feed)
      }
    }) 
    const log = await bogbot.query()
    console.log(log)
    for (const msg of log) {
      if (!msg.text) { 
        console.log('We do not have ' + msg.data)
        send(msg.data)
      }
    }
  })

room.onPeerLeave(id => {
  console.log('left ' + id)
})

export const connect = (s) => {
  const ws = new WebSocket(s)
  //ws.binaryType = 'arraybuffer'

  ws.onopen = async () => {
    const latest = await bogbot.getInfo(pubkey)
    addSocket(ws)
    ws.send(pubkey)
    ws.send(JSON.stringify(latest))
    const feeds = await bogbot.getFeeds()
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

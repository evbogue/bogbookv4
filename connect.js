import { process } from './process.js'
import { bogbot } from './bogbot.js'
import { joinRoom } from './lib/trystero-torrent.min.js'

const pubkey = await bogbot.pubkey()

const room = joinRoom({appId: 'bogbookv4testnet', password: 'password'}, 'trystero')

export const [ send, onmessage ] = room.makeAction('message')

onmessage(async (data, id) => {
  await process(data, id)
})

room.onPeerJoin(async (id) => {
    const latest = await bogbot.getInfo(pubkey)
    send(latest, id)
    console.log('joined ' + id)
    const feeds = await bogbot.getFeeds()
    feeds.forEach(feed => {
      if (feed != pubkey) {
        send(feed, id)
      }
    }) 
  })

room.onPeerLeave(id => {
  console.log('left ' + id)
})

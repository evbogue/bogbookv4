
import { ed25519 } from './keys.js'
import { open } from './sbog.js'

const server = 'wss://bogbook.com/'

const connect = (s) => {
  const ws = new WebSocket(s)

  ws.onmessage = async (e) => {
    ws.send(ed25519.pubkey())
  }

  setInterval(() => {
    ws.send(ed25519.pubkey())
  }, 100000)

  ws.onmessage = async (e) => {
    const parse = JSON.parse(e.data)
    if (parse.latest) {
      const opened = await open(parse.payload)
      const content = 'https://bogbook.com/#' + opened.hash + ' | ' + (parse.name + ' ' || ' ') + opened.author 
      console.log(content)
      fetch('https://ntfy.sh/bogbook', {
        method: 'POST',
        body: content 
      })
    }    
  }

  ws.onclose = (e) => {
    setTimeout(function () {
      connect(s)
    }, 1000)
  }

  let retryCount = 1

  ws.onerror = (err) => {
    setTimeout(() => {
      ws.close()
      retryCount++
    }, 10000 * retryCount)
  }
}

connect(server)

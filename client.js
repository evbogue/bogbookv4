import { ed25519 } from './keys.js'
import { open } from './sbog.js'

const kv = await Deno.openKv()

const server = 'wss://bogbook.com/'

const connect = (s) => {
  const ws = new WebSocket(s)

  ws.onopen = async (e) => {
    console.log('connecting')
    ws.send(ed25519.pubkey())
  }

  setInterval(() => {
    try {
      ws.send(ed25519.pubkey())
    } catch {
      console.log('connection closed')
    }
  }, 100000)

  ws.onmessage = async (e) => {
    const parse = JSON.parse(e.data)
    if (parse.latest) {
      const opened = await open(parse.payload)
      const check = await kv.get([opened.hash])
      if (!check.value) {
        const content = 'https://bogbook.com/#' + opened.hash + ' | ' + (parse.name || '' + ' ' || ' ') + 'https://bogbook.com/#' + opened.author 
        console.log(content)
        kv.set([opened.hash], parse.payload)
        fetch('https://ntfy.sh/bogbook', {
          method: 'POST',
          body: content 
        })
      }
    }    
  }

  ws.onclose = (e) => {
    setTimeout(function () {
      connect(s)
    }, 1000)
  }

  let retryCount = 1

  ws.onerror = () => {
    setTimeout(() => {
      ws.close()
      connect(server)
      retryCount++
    }, 1000 * retryCount)
  }
}

connect(server)

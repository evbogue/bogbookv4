import nacl from './lib/nacl-fast-es.js'
import { decode, encode } from './lib/base64.js'
import { serveDir } from 'https://deno.land/std/http/file_server.ts'

const bogbot = {}

bogbot.open = async (msg) => {
  const opened = new TextDecoder().decode(nacl.sign.open(decode(msg.substring(44)), decode(msg.substring(0, 44))))

  const obj = {
    timestamp: parseInt(opened.substring(0, 13)),
    author: opened.substring(13, 57),
    data: opened.substring(57, 101),
    previous: opened.substring(101, 145),
    hash : opened.substring(145),
    raw: msg
  }

  return obj
}


const sockets = new Set()

const kv = await Deno.openKv()



const process = async (m) => {
  try {
    const msg = await JSON.parse(m.data)
    const opened = await bogbot.open(msg.payload)
    if (msg && msg.type == 'latest') {
      const latest = await kv.get([opened.author])
      if (latest.value === null) {
        const body = 'New post from ' + (msg.name || opened.author.substring(0, 5)) +' https://bogbook.com/#' + opened.hash
        await fetch('https://ntfy.sh/bogbook', {
          method: 'POST',
          body
        })
        await kv.set([opened.author], msg)
        await kv.set([opened.hash], opened.raw)
      }
      else if (latest.value.payload != msg.payload) {
        const body = 'New post from ' + (msg.name || opened.author.substring(0, 5)) +' https://bogbook.com/#' + opened.hash
        await fetch('https://ntfy.sh/bogbook', {
          method: 'POST',
          body
        })
        await kv.set([opened.author], msg)
        await kv.set([opened.hash], opened.raw)
      }
    }
    if (msg.text) {
      const blobhash = await bogbot.make(msg.text)
      await kv.set([blobhash], msg.text)
    }
  } catch (err) { console.log('NOT JSON') }
  try { 
    const opened = await bogbot.open(m.data)
    await kv.set([opened.hash], opened.raw)
  } catch (err) {
  }
  if (m.data.length === 44) {
    try {
      console.log('checking db')
      const msg = await kv.get([m.data])
      if (typeof msg.value === 'object') {
        if (msg.value) {
          const string = JSON.stringify(msg.value)
          m.target.send(string)
        } else { 
          m.target.send(m.data) }
      } else {
        m.target.send(msg.value)
      }
    } catch (err) {}
  }
}

const allEntries = await Array.fromAsync(kv.list({prefix:[]}));
console.log(allEntries) 

Deno.serve((r) => {
  try {
    const { socket, response } = Deno.upgradeWebSocket(r)
    sockets.add(socket)
    socket.onmessage = process
    socket.onclose = _ => sockets.delete(socket)
    return response
  } catch {
    return serveDir(r, {quiet: 'True'})
  }
})

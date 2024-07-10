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
  console.log('received something')
  console.log(m)
  console.log(m.data)
  try {
    const msg = await JSON.parse(m.data)
    console.log(msg)
    const opened = await bogbot.open(msg.payload)
    console.log(opened)
    if (msg && msg.type == 'latest') {
      console.log('LATEST')
      const latest = await kv.get([opened.author])
      console.log(msg)
      console.log(latest)
      if (latest.value === null) {
        console.log('FIRST MESSAGE MAYBE')
        const body = 'New post from ' + (msg.name || opened.author.substring(0, 5)) +' https://bogbook.com/#' + opened.author
        await fetch('https://ntfy.sh/bogbook', {
          method: 'POST',
          body
        })
        await kv.set([opened.author], msg)
        await kv.set([opened.hash], opened.raw)
      }
      else if (latest.value.payload != msg.payload) {
        console.log('SAVE LATEST')
        const body = 'New post from ' + (msg.name || opened.author.substring(0, 5)) +' https://bogbook.com/#' + opened.author
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
  } catch (err) { }
  if (m.data.length === 44) {
    console.log('FIND IT')
    try {
      const msg = await kv.get([m.data])
      console.log(msg)
      if (typeof msg.value === 'object') {
        if (msg.value) {
          const string = JSON.stringify(msg.value)
          m.target.send(string)
        } else { 
          console.log('SENDING HASH ' + m.data)
          m.target.send(m.data) }
      } else {
        console.log('SENDING VALUE ' + m.value)
        m.target.send(msg.value)
      }
    } catch (err) {
      //console.log(err)
    }
  }
}

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

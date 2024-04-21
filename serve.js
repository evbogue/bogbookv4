import { serveDir } from 'https://deno.land/std/http/file_server.ts'
import { bogbot } from './bogbot.js'

const sockets = new Set()
//const channel = new BroadcastChannel("")

const kv = await Deno.openKv()

const process = async (e) => {
  console.log(e.data)
  //(e.target != channel) && channel.postMessage(e.data)
  if (e.data.length > 44) {
    const msg = JSON.parse(e.data)
    if (msg.type === 'post') {
      const opened = await bogbot.open(msg.payload)
      kv.set([opened.hash], opened.raw)
      if (msg.blob) {
        kv.set([opened.data], msg.blob)
        opened.text = msg.blob
      }
    }
    if (msg.boxed) {
      kv.set([opened.data], msg.boxed)
    }
    if (msg.type === 'latest') {
      const opened = await bogbot.open(msg.payload)
      const obj = msg
      if (msg.image) { delete obj.image }
      kv.set([opened.author], obj)
      kv.set([opened.hash], opened.raw)
      if (msg.blob) {
        kv.set([opened.data], msg.blob)
        opened.text = msg.blob
      }
    }
    sockets.forEach(s => s.send(e.data))
  } 
  if (e.data.length === 44) {
    const msg = await kv.get([e.data])
    if (msg.value && msg.value.type === 'latest') {
      msg.value.type = 'post'
      sockets.forEach(s => s.send(JSON.stringify(msg.value)))
    } else if (msg.value) {
      try {
        const opened = await bogbot.open(msg.value)
        const blob = await kv.get([opened.data])
        const tosend = {
          type: 'post',
          payload: msg.value,
        }
        sockets.forEach(s => s.send(JSON.stringify(tosend)))
      } catch {
        const tosend = {
          type: 'blob',
          payload: msg.value
        }
        sockets.forEach(s => s.send(JSON.stringify(tosend)))
      }
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

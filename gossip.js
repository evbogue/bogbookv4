import { trystero } from './trystero.js'

let queue = []

const sockets = new Set()

export const gossip = (msg) => {
  queue.push(msg)

  setInterval(() => {
    queue = []
  }, 10000)
  console.log(queue)
  if (!queue.includes(msg)) {
    console.log(msg)
    if (trystero.send) {
      trystero.send(msg)
    } else {
      setTimeout(() => {
        trystero.send(msg)
      }, 1000)
    }

    if (sockets.length) { 
      sockets.forEach(s => s.send(JSON.stringify(msg)))
    } else {
      setTimeout(function () { sockets.forEach(s => s.send(JSON.stringify(msg))) }, 500)
    }
  }
}

export const addSocket = (s) => sockets.add(s) 

export const rmSocket = (s) => sockets.delete(s)


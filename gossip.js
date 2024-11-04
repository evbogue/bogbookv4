import { send } from './connect.js'

let tq = []

setInterval(() => {
  tq = []
}, 10000)

const sockets = new Set()

export const gossip = async (msg) => {
  if (!tq.includes(msg)) {
    if (send) {
      send(msg)
      tq.push(msg)
    } else {
      setTimeout(() => {
        send(msg)
        tq.push(msg)
      }, 5000)
    }
  }
}


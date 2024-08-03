import { send } from './connect.js'

let wq = []
let tq = []

setInterval(() => {
  tq = []
  wq = []
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
  if (!wq.includes(msg)) {
    let mssg = '' 
    if (msg.length === 44 && !msg.startsWith('{')) { mssg = msg} 
    if (typeof msg === 'object') { mssg = await JSON.stringify(msg)}
    if (sockets.length) {
      sockets.forEach(s => s.send(mssg)) 
      wq.push(mssg)
    } else {
      setTimeout(() => { 
        sockets.forEach(s => s.send(mssg))
        tq.push(mssg)
      }, 1000)
    }
  }
}

export const addSocket = (s) => sockets.add(s) 

export const rmSocket = (s) => sockets.delete(s)


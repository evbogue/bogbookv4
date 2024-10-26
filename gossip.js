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
    console.log('Servering: ')
    console.log(msg)
    let mssg = '' 
    if (msg.length === 44 && !msg.startsWith('{')) {
      console.log('its a hash') 
      mssg = msg
    } 
    if (typeof msg === 'object') {
      console.log('its an object') 
      mssg = await JSON.stringify(msg)
    }
    else {
      console.log('its a blob')
      mssg = msg
    }
    if (sockets.length) {
      sockets.forEach(s => s.send(mssg)) 
      wq.push(mssg)
    } else {
      setTimeout(() => { 
        sockets.forEach(s => s.send(mssg))
        tq.push(mssg)
      }, 5000)
    }
  }
}

export const addSocket = (s) => sockets.add(s) 

export const rmSocket = (s) => sockets.delete(s)


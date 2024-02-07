const sockets = new Set()

export const gossip = (msg) => {
  if (sockets.length) { 
    sockets.forEach(s => s.send(msg))
  } else {
    setTimeout(function () { sockets.forEach(s => s.send(msg)) }, 500)
  }
}

export const addSocket = (s) => sockets.add(s) 

export const rmSocket = (s) => sockets.delete(s)


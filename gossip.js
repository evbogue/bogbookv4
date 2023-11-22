const sockets = new Set()

export const gossip = (msg) => sockets.forEach(s => s.send(msg))

export const addSocket = (s) => sockets.add(s) 

export const rmSocket = (s) => sockets.delete(s)


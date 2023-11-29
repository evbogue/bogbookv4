
const server = 'wss://bogbook.com/'


const connect = (s) => {
  const ws = new WebSocket(s)

  ws.onmessage = async (e) => {
    console.log(e.data)
  }

  ws.onclose = (e) => {
    setTimeout(function () {
      connect(s)
    }, 1000)
  }

  let retryCount = 1

  ws.onerror = (err) => {
    setTimeout(() => {
      ws.close()
      retryCount++
    }, 10000 * retryCount)
  }
}

connect(server)

import { open } from './sbog.js'
import { cachekv } from './lib/cachekv.js'
import { find } from './blob.js'

export const awaitLog = async () => {
  const logs = await cachekv.get('log')
  return logs
}

let arraystore = []

var log = []

function save () {
  const stringedarray = JSON.stringify(arraystore)
  const stringedlog = JSON.stringify(log)
  cachekv.put('log', stringedlog)
  cachekv.put('arraystore', stringedarray)
}

cachekv.get('arraystore').then(file => {
  if (file) {
    arraystore = JSON.parse(file)
    arraystore.sort((a,b) => a.timestamp - b.timestamp)
  }
})

cachekv.get('log').then(file => {
  if (file) {
    log = JSON.parse(file)
    const newset = new Set(log)
    const newarray = []
    newset.forEach(async (msg) => {
      const opened = await open(msg)
      if (opened) {
        const found = await find(opened.data)
        opened.txt = found
        newarray.push(opened)
      }
    })

    setTimeout(function () {
      newarray.sort((a,b) => a.timestamp - b.timestamp)
      arraystore = newarray
      save()
    }, 5000)
  }
})

let newData = true

setInterval(function () {
  if (newData) {
    arraystore.sort((a,b) => a.timestamp - b.timestamp)
    save()
    newData = false
  }
}, 10000)

export const logs = function logs (query) {
  return {
    getLatest: async function (query) {
      if (arraystore[0]) {
        const querylog = arraystore.filter(msg => msg.author == query)
        if (querylog[0]) {
          return querylog[querylog.length - 1]
        }
      } 
    },
    getFeeds: async function () {
      const feeds = []
      
      arraystore.map(msg => {
        if (!feeds.includes(msg.author)) {
          feeds.push(msg.author)
        }
      })

      return feeds
    },
    getLog: async function () {
      return arraystore
    },
    query: async function (query) {
      if (arraystore[0]) {
        if (query.startsWith('?')) {
          const search = query.substring(1).replace(/%20/g, ' ').toUpperCase()
          const querylog = arraystore.filter(msg => msg.txt && msg.txt.toUpperCase().includes(search))
          return querylog 
        } else {
          const querylog = arraystore.filter(msg => msg.author == query || msg.hash == query)
          return querylog 
        }
      }
    },
    get: async function (hash) {
      const msgarray = arraystore.filter(msg => msg.hash == hash)
      if (msgarray[0]) {
        return msgarray[0]
      }  
    }, 
    add: function (msg) {
      open(msg).then(async (opened) => {
        const dupe = arraystore.filter(message => message.hash === opened.hash)
        if (opened && !dupe[0]) {
          const opened = await open(msg)
          const found = await find(opened.data)
          opened.txt = found
          log.push(msg)
          arraystore.push(opened)
          newData = true
          save()
        }
      })
    }
  }
}()

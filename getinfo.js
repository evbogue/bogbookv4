import { cachekv } from './lib/cachekv.js'
import { logs } from './log.js'

const info = new Map()

export const getInfo = async (pubkey) => {
  if (info.has(pubkey)) {
    return info.get(pubkey)
  } else {
    let obj = {}

    const getString = await cachekv.get(pubkey)

    if (getString) {
      try {  
        obj = JSON.parse(getString)
        info.set(pubkey, obj)
      } catch (e) {
        cachekv.rm(pubkey)
      }
    }
    info.set(pubkey, obj)
    return obj
  }
}

export const saveInfo = async (pubkey, data) => {
  console.log(data)
  info.set(pubkey, data)
  await cachekv.put(pubkey, JSON.stringify(data))
}

import { cachekv } from './lib/cachekv.js'
import { logs } from './log.js'

const info = new Map()

export const getInfo = async (pubkey) => {
  if (info.has(pubkey)) {
    console.log(pubkey + ' is in memory.')
    return info.get(pubkey)
  } else {
    console.log(pubkey + ' is not in memory.')
    let obj = {}

    const getString = await cachekv.get(pubkey)

    if (getString)
      obj = JSON.parse(getString)
      info.set(pubkey, obj)
    if (!obj.payload) {
      const getLatest = await logs.getLatest(pubkey)
      if (getLatest) {
        obj.payload = getLatest.raw
        info.set(pubkey, obj)
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

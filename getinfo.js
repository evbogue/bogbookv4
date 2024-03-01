import { cachekv } from './lib/cachekv.js'
import { logs } from './log.js'

export const getInfo = async (pubkey) => {
  let obj = {}
  
  const getString = await cachekv.get(pubkey)

  if (getString)
    obj = JSON.parse(getString)

  if (!obj.payload) {
    const getLatest = await logs.getLatest(pubkey)
    if (getLatest) {
      obj.payload = getLatest.raw
    }
  }

  return obj
}

export const saveInfo = async (pubkey, data) => {
  console.log(data)
  await cachekv.put(pubkey, JSON.stringify(data))
}

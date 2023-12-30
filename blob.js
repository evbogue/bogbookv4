import { encode } from "./lib/base64.js"
import { cachekv } from "./lib/cachekv.js"
import { gossip } from './gossip.js'

export const make = async (file) => {
  const hash = encode(
    Array.from(
      new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(file))
      )
    )
  )
  await cachekv.put(hash, file)
  return hash
}

export const find = async (hash) => {
  const file = await cachekv.get(hash)
  if (file) {
    return file
  } if (!file) {
    gossip(hash)
  }
}


import { cachekv } from './lib/cachekv.js'
import { ed25519 } from './keys.js'

const pubkey = await ed25519.pubkey()

const getLatest = await cachekv.get(pubkey)

export let stat

if (getLatest) {
  stat = JSON.parse(getLatest)
}

if (!stat) {
  stat = {}
  cachekv.put(pubkey, JSON.stringify(stat))
}

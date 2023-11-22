import nacl from './lib/nacl-fast-es.js'
import { ed25519 } from './keys.js'
import { decode, encode } from './lib/base64.js'
import { make, find } from './blob.js'

export async function publish (text, previous) {
  const pubkey = await ed25519.pubkey()
  const privkey = await ed25519.privkey()
  const datahash = await make(text)

  const timestamp = Date.now()

  const msg = timestamp + pubkey + datahash

  const hash = encode(
    Array.from(
      new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg))
      )
    )
  )

  if (!previous) {
    previous = hash
  }

  const next = msg + previous + hash

  const sig = encode(nacl.sign(new TextEncoder().encode(next), decode(privkey)))

  return pubkey + sig
}

export async function open (msg) {
  const opened = new TextDecoder().decode(nacl.sign.open(decode(msg.substring(44)), decode(msg.substring(0, 44))))

  const obj = {
    timestamp: parseInt(opened.substring(0, 13)),
    author: opened.substring(13, 57),
    hash : opened.substring(145),
    previous: opened.substring(101, 145),
    data: opened.substring(57, 101),
    raw: msg
  }

  return obj
}


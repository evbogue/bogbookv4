import nacl from './lib/nacl-fast-es.js'
import { convertPublicKey, convertSecretKey } from './lib/ed2curve.js'
import { decode, encode } from './lib/base64.js'
import { ed25519 } from './keys.js'

export const box = async (msg, recp) => {
  if (recp && recp.length === 44) {
    const keys = await ed25519.keypair()

    const receiver = convertPublicKey(decode(recp))
    const sender = convertPublicKey(decode(keys.substring(0, 44)))
    const privatekey = convertSecretKey(decode(keys.substring(44)))
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const message = new TextEncoder().encode(msg)
    const boxed = nacl.box(message, nonce, receiver, privatekey)
    const nonceMsg = new Uint8Array(sender.length + nonce.length + boxed.length)

    nonceMsg.set(sender)
    nonceMsg.set(nonce, sender.length)
    nonceMsg.set(boxed, sender.length + nonce.length)

    return encode(nonceMsg)
  } else { return }
}

export const unbox = async (base64) => {
  try {
    const boxed = new Uint8Array(decode(base64))

    const keys = await ed25519.keypair()

    const privatekey = convertSecretKey(decode(keys.substring(44)))

    const senderkey = boxed.slice(0, 32)
    const nonce = boxed.slice(32, 32 + 24)
    const msg = boxed.slice(32 + 24)
    const unboxed = nacl.box.open(msg, nonce, senderkey, privatekey)
    const message = new TextDecoder().decode(unboxed)
    return message
  } catch { return }
}


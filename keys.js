import nacl from './lib/nacl-fast-es.js'
import { encode } from './lib/base64.js'

export const ed25519 = {}

export const generate = async () => {
  const genkey = nacl.sign.keyPair()
  const keygen = encode(genkey.publicKey) + encode(genkey.secretKey)
  return keygen
}

ed25519.keypair = async () => {
  const keypair = await localStorage.getItem('keypair')
  if (!keypair) {
    const keypair = await generate()
    localStorage.setItem('keypair', keypair)
    return keypair
  } else {
    return keypair
  }
}

ed25519.pubkey = async () => {
  const keypair = await ed25519.keypair()
  return keypair.substring(0, 44)
}

ed25519.privkey = async () => {
  const keypair = await ed25519.keypair()
  return keypair.substring(44)
}

ed25519.deletekey = async () => {
  localStorage.removeItem('keypair')
}

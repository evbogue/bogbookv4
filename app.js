import { connect } from './connect.js'
import { route } from './route.js'
import { awaitLog} from './log.js'
import { ed25519 } from './keys.js'

const log = await awaitLog()
const key = await ed25519.pubkey()

const server = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host

if (!window.location.hash) { window.location = '#' }

//connect('wss://bogbook.com/')
connect(server)
route(document.body)

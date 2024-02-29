import { connect } from './connect.js'
import { route } from './route.js'
import { awaitLog} from './log.js'
import { ed25519 } from './keys.js'
import { navbar } from './navbar.js'
import { contacts } from './contacts.js'

const log = await awaitLog()
const key = await ed25519.pubkey()

const server = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host

if (!window.location.hash) { window.location = '#' }

//connect('wss://bogbook.com/')
connect(server)

document.body.appendChild(navbar)
document.body.appendChild(contacts)

route(document.body)

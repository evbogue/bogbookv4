import { connect } from './connect.js'
import { route } from './route.js'
import { awaitLog} from './log.js'

const log = await awaitLog()
console.log(log)

const server = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host

if (!window.location.hash) { window.location = '#' }

connect(server)
route(document.body)

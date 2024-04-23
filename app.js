import { connect } from './connect.js'
import { route } from './route.js'
import { bogbot } from './bogbot.js'
import { navbar } from './navbar.js'
import { contacts } from './contacts.js'

// do we still need this?
await bogbot.query()
await bogbot.pubkey()

const server = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host

if (!window.location.hash) { window.location = '#' }

connect('wss://bogbook.com/')
//connect(server)

document.body.appendChild(navbar)
document.body.appendChild(contacts)

route(document.body)

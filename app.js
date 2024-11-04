import { send } from './connect.js'
import { route } from './route.js'
import { bogbot } from './bogbot.js'
import { navbar } from './navbar.js'

const server = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host

if (!window.location.hash) { window.location = '#' }

document.body.appendChild(navbar)

route(document.body)

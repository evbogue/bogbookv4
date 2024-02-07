import { h } from './lib/h.js'
import { composer } from './composer.js'
import { logs } from './log.js' 
import { adder } from './adder.js'
import { gossip }  from './gossip.js'
import { navbar } from './navbar.js'
import { settings } from './settings.js'

export const route = async (container) => {
  const screen = h('div', {id: 'screen'})
  const scroller = h('div', {id: 'scroller'})

  container.appendChild(screen)
  screen.appendChild(scroller)

  const src = window.location.hash.substring(1)

  if (src.length === 43) {
    window.location.hash = src + '='
  }

  screen.appendChild(navbar)

  if (src === '') {
    scroller.appendChild(await composer())
    const log = await logs.getLog()
    adder(log, src, scroller)
  } if (src === 'settings') {
    scroller.appendChild(settings)
  } else {
    const query = await logs.query(src)
    if (query && query.length) {
      adder(query, src, scroller)
    } else if (src.length === 44) {
      gossip(src)
    }
  }

  window.onhashchange = function () {
    screen.parentNode.removeChild(screen)
    route(container)
  }
}

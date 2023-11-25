import { h } from './lib/h.js'
import { composer } from './composer.js'
import { logs } from './log.js' 
import { adder } from './adder.js'
import { gossip }  from './gossip.js'

export const route = async (container) => {
  const screen = h('div', {id: 'screen'})
  const scroller = h('div', {id: 'scroller'})

  container.appendChild(screen)
  screen.appendChild(scroller)

  const src = window.location.hash.substring(1)

  const home = h('a', {href: '#', style: 'position: absolute; top: .25em; left: .25em;'}, ['🏡'])

  if (src === '') {
    scroller.appendChild(composer)
    const log = await logs.getLog()
    adder(log, src, scroller)
  } else {
    screen.appendChild(home)
    const query = await logs.query(src)
    if (query.length) {
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

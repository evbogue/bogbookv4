import { h } from './lib/h.js'
import { composer } from './composer.js'
import { bogbot } from './bogbot.js' 
import { adder } from './adder.js'
import { gossip }  from './gossip.js'
import { settings } from './settings.js'

export const route = async (container) => {
  const screen = h('div', {id: 'screen'})
  const scroller = h('div', {id: 'scroller'})

  const controls = h('div', {id: 'controls'})

  scroller.appendChild(controls)
  container.appendChild(screen)
  screen.appendChild(scroller)

  const src = window.location.hash.substring(1)

  if (src.length === 43) {
    window.location.hash = src + '='
  }

  if (src === '') {
    controls.appendChild(await composer())
  } if (src === 'settings') {
    scroller.appendChild(settings)
  } 

  const query = await bogbot.query(src)

  if (query && query.length) {
    adder(query, src, scroller)
  } else if (src.length === 44) {
    gossip(src)
  }

  window.onhashchange = function () {
    screen.parentNode.removeChild(screen)
    route(container)
  }
}

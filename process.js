import { h } from './lib/h.js'
import { bogbot } from './bogbot.js'
import { render } from './render.js'
import { markdown } from './markdown.js'
import { gossip } from './gossip.js'
import { avatar } from './avatar.js'

export const process = async (msg, id) => {
  const scroller = document.getElementById('scroller')
  if (msg.length === 44 && !msg.startsWith('{')) {

    const get = await bogbot.find(msg)

    if (get && get.type && get.type != 'latest') {
      const obj = {type: 'blob', payload: get}
      gossip(obj)
    } 

    if (get && get.type && get.type === 'latest') {
      get.type = 'post'
      gossip(get)
    }

    const message = await bogbot.query(msg)

    if (message && message[0]) {
      const obj = {
        type: 'post',
        payload: message[0].raw
      }
      gossip(obj)
    }
  }

  if (msg.type === 'blob') {
    const hash = await bogbot.make(msg.payload)
    const blobDiv = document.getElementById(hash)
    if (blobDiv) { blobDiv.innerHTML = await markdown(msg.payload)}
  }
  if ((msg.type === 'post' || msg.type === 'latest') && msg.payload) {
    console.log(msg)
    const opened = await bogbot.open(msg.payload)
    const alreadyHave = await bogbot.query(opened.hash)
    
    if (msg.type === 'latest') {
      const latest = await bogbot.getInfo(opened.author)

      if (msg.image || msg.name) {
        if (msg.name) {
          if (latest.name != msg.name) {

            latest.name = msg.name
            setTimeout(() => {
              const namesOnScreen = document.getElementsByClassName('name' + opened.author)
              for (const names of namesOnScreen) {
                names.textContent = latest.name
              }
            }, 100)

          }
        }
        if (msg.image) {
          if (latest.image != msg.image) {
            latest.image = msg.image
            setTimeout(async () => {
              const imagesOnScreen = document.getElementsByClassName('image' + opened.author)
              for (const image of imagesOnScreen) {
                if (latest.image.length > 44) {
                  image.src = latest.image
                }
                if (latest.image.length == 44) {
                  const blob = await find(latest.image)
                  image.src = blob
                }
              }
            }, 100)
          }
        }
      }
      
      await bogbot.saveInfo(opened.author, msg)
      if (id) {
        const onlineId = document.getElementById(id)
        const newOnlineId = h('span', {id}, [await avatar(opened.author)])
        onlineId.replaceWith(newOnlineId)
      }
    }

    if (!alreadyHave) {
      bogbot.add(opened.raw)
      if (msg.blob) {
        await bogbot.make(msg.blob)
      }
      if (msg.boxed) {
        opened.text =  '🔒 '
        opened.text = opened.text + (await unbox(msg.boxed) || '')
      } else {
        opened.text = msg.blob
      }

      const rendered = await render(opened)

      const alreadyRendered = document.getElementById(opened.hash)

      const src = window.location.hash.substring(1)

      const shouldWeRender = (src === opened.author || src === opened.hash || src === '')

      if (!scroller.firstChild && shouldWeRender && !alreadyRendered || !alreadyHave && shouldWeRender) {
        scroller.insertBefore(rendered, scroller.childNodes[1])
      }

      const previous = await bogbot.query(opened.previous)

      if (!previous && !previous[0]) { gossip(opened.previous)}
    }
  }
}

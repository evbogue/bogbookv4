import { h } from './lib/h.js'

const input = h('input', {id: 'search', placeholder: 'Search', style: 'float: right; margin-right: 2em;'})

input.addEventListener('input', () => {
  location.hash = '?' + input.value
  setTimeout(() => {
    input.focus()
  }, 5)
})

export const search = h('span', [
  input
])
  

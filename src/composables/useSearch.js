import { ref } from 'vue'
import { searchNewTab } from './useSettings.js'

export const searchEngines = {
  '':    { key: '',    name: 'Google',       url: 'https://www.google.com/search?q=' },
  'gh':  { key: 'gh',  name: 'GitHub',       url: 'https://github.com/search?q=' },
  'dd':  { key: 'dd',  name: 'DuckDuckGo',   url: 'https://duckduckgo.com/?q=' },
  'gpt': { key: 'gpt', name: 'ChatGPT',      url: 'https://chatgpt.com/?q=' },
  'yt':  { key: 'yt',  name: 'YouTube',      url: 'https://www.youtube.com/results?search_query=' },
  'npm': { key: 'npm', name: 'npm',          url: 'https://www.npmjs.com/search?q=' },
  'mdn': { key: 'mdn', name: 'MDN',          url: 'https://developer.mozilla.org/en-US/search?q=' },
  'b':   { key: 'b',   name: 'Bing',         url: 'https://www.bing.com/search?q=' },
  'map': { key: 'map', name: 'Google Maps',  url: 'https://www.google.com/maps/search/' },
  'tr':  { key: 'tr',  name: 'Google 翻译',   url: 'https://translate.google.com/?text=' },
  'so':  { key: 'so',  name: 'StackOverflow', url: 'https://stackoverflow.com/search?q=' }
}

export const engineList = Object.values(searchEngines).filter(e => e.key === '' || e.key.length >= 1)

const SE_KEY = 'homepage-search-engine'
export const defaultEngineKey = ref(localStorage.getItem(SE_KEY) || '')

export function useSearch() {
  function detect(query) {
    const m = query.match(/^([a-z]+)\s+(.*)$/)
    if (m && searchEngines[m[1]]) {
      return { engine: searchEngines[m[1]], prefix: m[1], query: m[2] }
    }
    return { engine: searchEngines[defaultEngineKey.value], prefix: '', query }
  }

  function execute(query) {
    const { engine, query: q } = detect(query.trim())
    if (!q) return
    const url = engine.url + encodeURIComponent(q)
    if (searchNewTab.value) window.open(url, '_blank')
    else window.location.href = url
  }

  function setDefaultEngine(key) {
    defaultEngineKey.value = key
    localStorage.setItem(SE_KEY, key)
  }

  return { detect, execute, searchEngines, engineList, defaultEngineKey, setDefaultEngine }
}

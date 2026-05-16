import { reactive, ref, computed } from 'vue'
import { bookmarkSort, categoryOrder } from './useSettings.js'

const STORAGE_KEY = 'homepage-bookmarks'

const defaultBookmarks = {
  '工作': [
    { name: 'GitHub', url: 'https://github.com', desc: '代码托管' },
    { name: 'Gmail', url: 'https://mail.google.com', desc: '邮件' },
    { name: 'Google Drive', url: 'https://drive.google.com', desc: '云存储' },
    { name: 'Calendar', url: 'https://calendar.google.com', desc: '日程' },
    { name: 'Notion', url: 'https://www.notion.so', desc: '文档协作' },
    { name: 'Slack', url: 'https://slack.com', desc: '团队沟通' }
  ],
  '开发': [
    { name: 'Stack Overflow', url: 'https://stackoverflow.com', desc: '技术问答' },
    { name: 'MDN', url: 'https://developer.mozilla.org', desc: 'Web 文档' },
    { name: 'npm', url: 'https://www.npmjs.com', desc: '包管理' },
    { name: 'CodePen', url: 'https://codepen.io', desc: '在线练习' },
    { name: 'Vercel', url: 'https://vercel.com', desc: '部署平台' },
    { name: 'Linear', url: 'https://linear.app', desc: '项目管理' }
  ],
  '社交': [
    { name: 'Twitter', url: 'https://twitter.com', desc: '社交网络' },
    { name: 'Reddit', url: 'https://www.reddit.com', desc: '论坛社区' },
    { name: 'YouTube', url: 'https://www.youtube.com', desc: '视频' },
    { name: 'Hacker News', url: 'https://news.ycombinator.com', desc: '技术资讯' },
    { name: 'Bilibili', url: 'https://www.bilibili.com', desc: '视频' }
  ],
  '媒体': [
    { name: 'Spotify', url: 'https://open.spotify.com', desc: '音乐' },
    { name: 'Netflix', url: 'https://www.netflix.com', desc: '影视' },
    { name: 'YouTube Music', url: 'https://music.youtube.com', desc: '音乐' }
  ],
  '工具': [
    { name: 'Translate', url: 'https://translate.google.com', desc: '翻译' },
    { name: 'Google Maps', url: 'https://maps.google.com', desc: '地图' },
    { name: 'Excalidraw', url: 'https://excalidraw.com', desc: '白板' },
    { name: 'Photopea', url: 'https://www.photopea.com', desc: '图片编辑' },
    { name: 'DeepL', url: 'https://www.deepl.com/translator', desc: '翻译' }
  ],
  'AI': [
    { name: 'ChatGPT', url: 'https://chatgpt.com', desc: 'OpenAI' },
    { name: 'Claude', url: 'https://claude.ai', desc: 'Anthropic' },
    { name: 'Gemini', url: 'https://gemini.google.com', desc: 'Google AI' },
    { name: 'Perplexity', url: 'https://www.perplexity.ai', desc: 'AI 搜索' }
  ]
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return JSON.parse(JSON.stringify(defaultBookmarks))
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const bookmarks = reactive(load())
const categories = ref(Object.keys(bookmarks))
const currentCategory = ref(categories.value[0] || '')

// Init category order if empty
if (categoryOrder.value.length === 0) {
  categoryOrder.value = [...categories.value].filter(c => c !== '未分类')
}

// Auto-load deployed homepage-data.json on startup (from Vercel deployment)
;(async () => {
  try {
    const r = await fetch(`/homepage-data.json?t=${Date.now()}`)
    if (!r.ok) return
    const data = await r.json()
    const remote = data.bookmarks || data // support old format (raw bookmarks)

    if (typeof remote !== 'object' || Array.isArray(remote)) return
    let merged = false
    for (const cat of Object.keys(remote)) {
      if (!bookmarks[cat]) { bookmarks[cat] = []; merged = true }
      for (const bm of remote[cat]) {
        const exists = bookmarks[cat].some(m => m.url === bm.url)
        if (!exists) {
          bookmarks[cat].push({ ...bm, createdAt: Date.now() })
          merged = true
        }
      }
    }
    if (merged) {
      save(bookmarks)
      refreshCategories()
    }

    // Also import settings
    if (data.settings) {
      const { importSettings } = await import('./useSettings.js')
      importSettings(data.settings)
    }
  } catch { /* ignore fetch errors */ }
})()

function sortCategories(cats) {
  const order = categoryOrder.value
  const ordered = []
  const rest = [...cats]
  // Place in manual order
  for (const c of order) {
    const idx = rest.indexOf(c)
    if (idx !== -1) { ordered.push(c); rest.splice(idx, 1) }
  }
  // Append new categories not in order, then 未分类 last
  rest.sort((a, b) => a.localeCompare(b, 'zh-CN'))
  const uncat = rest.indexOf('未分类')
  if (uncat !== -1) { rest.splice(uncat, 1); rest.push('未分类') }
  return [...ordered, ...rest]
}

function refreshCategories() {
  const all = Object.keys(bookmarks)
  categories.value = sortCategories(all)
  // Sync order: keep existing, remove deleted, append new
  const newOrder = categoryOrder.value.filter(c => all.includes(c))
  for (const c of all) { if (!newOrder.includes(c) && c !== '未分类') newOrder.push(c) }
  categoryOrder.value = newOrder
  if (!categories.value.includes(currentCategory.value) || currentCategory.value === '未分类') {
    currentCategory.value = categories.value.find(c => c !== '未分类') || ''
  }
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    if (bookmarkSort.value === 'added') {
      return (b.createdAt || 0) - (a.createdAt || 0)
    }
    return a.name.localeCompare(b.name, 'zh-CN')
  })
}

const sortedBookmarks = computed(() => {
  const cats = sortCategories(Object.keys(bookmarks))
  return cats.map(cat => ({
    category: cat,
    items: sortItems(bookmarks[cat] || [])
  }))
})

export function useBookmarks() {
  function getItems(cat) {
    return sortItems(bookmarks[cat] || [])
  }

  function addBookmark(category, entry) {
    if (!bookmarks[category]) bookmarks[category] = []
    bookmarks[category].push({ ...entry, createdAt: Date.now() })
    save(bookmarks)
    refreshCategories()
    return true
  }

  function updateBookmark(oldCat, oldIdx, newCat, entry) {
    const old = bookmarks[oldCat][oldIdx]
    const updated = { ...entry, createdAt: old.createdAt || entry.createdAt || Date.now() }
    if (oldCat === newCat) {
      bookmarks[oldCat][oldIdx] = updated
    } else {
      bookmarks[oldCat].splice(oldIdx, 1)
      if (bookmarks[oldCat].length === 0) delete bookmarks[oldCat]
      if (!bookmarks[newCat]) bookmarks[newCat] = []
      bookmarks[newCat].push(updated)
    }
    save(bookmarks)
    refreshCategories()
    return true
  }

  function deleteBookmark(cat, idx) {
    bookmarks[cat].splice(idx, 1)
    if (bookmarks[cat].length === 0) delete bookmarks[cat]
    save(bookmarks)
    refreshCategories()
    return true
  }

  function findIndexByUrl(cat, url) {
    const items = bookmarks[cat] || []
    return items.findIndex(bm => bm.url === url)
  }

  function setCategory(cat) {
    if (bookmarks[cat]) currentCategory.value = cat
  }

  function resetToDefaults() {
    Object.keys(bookmarks).forEach(k => delete bookmarks[k])
    Object.entries(defaultBookmarks).forEach(([k, v]) => {
      bookmarks[k] = v.map(bm => ({ ...bm }))
    })
    save(bookmarks)
    refreshCategories()
    currentCategory.value = categories.value[0] || ''
  }

  function exportData() {
    return JSON.stringify(bookmarks, null, 2)
  }

  function importBrowserBookmarks(html) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    let currentFolder = '导入的书签'
    let count = 0

    function isValidUrl(url) {
      if (!url) return false
      if (/^(javascript|data|about|chrome|edge):/i.test(url)) return false
      try {
        const u = new URL(url)
        const ip = u.hostname
        if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.)/.test(ip)) return false
        return true
      } catch { return false }
    }

    function walk(node) {
      for (const child of node.children) {
        // Handle DT wrapper: <DT> contains H3 or A
        if (child.tagName === 'DT') {
          for (const inner of child.children) {
            if (inner.tagName === 'H3') {
              currentFolder = inner.textContent.trim()
            }
            if (inner.tagName === 'A') {
              const url = inner.getAttribute('HREF') || ''
              const name = inner.textContent.trim() || url
              if (!isValidUrl(url)) continue
              const exists = Object.values(bookmarks).some(items =>
                items.some(bm => bm.url === url)
              )
              if (exists) continue
              if (!bookmarks[currentFolder]) bookmarks[currentFolder] = []
              bookmarks[currentFolder].push({ name, url, createdAt: Date.now() })
              count++
            }
          }
        }
        // Also handle direct children (without DT wrapper)
        if (child.tagName === 'H3') {
          currentFolder = child.textContent.trim()
        }
        if (child.tagName === 'A') {
          const url = child.getAttribute('HREF') || ''
          const name = child.textContent.trim() || url
          if (!isValidUrl(url)) continue
          const exists = Object.values(bookmarks).some(items =>
            items.some(bm => bm.url === url)
          )
          if (exists) continue
          if (!bookmarks[currentFolder]) bookmarks[currentFolder] = []
          bookmarks[currentFolder].push({ name, url, createdAt: Date.now() })
          count++
        }
        if (child.tagName === 'DL') {
          const savedFolder = currentFolder
          walk(child)
          currentFolder = savedFolder
        }
      }
    }

    const rootDL = doc.querySelector('DL')
    if (rootDL) walk(rootDL)

    if (count > 0) {
      save(bookmarks)
      refreshCategories()
    }
    return count
  }

  function importData(json) {
    const data = JSON.parse(json)
    if (typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid')
    for (const [cat, items] of Object.entries(data)) {
      if (!Array.isArray(items)) throw new Error('Invalid')
      for (const item of items) {
        if (!item.name || !item.url) throw new Error('Invalid')
      }
    }
    Object.keys(bookmarks).forEach(k => delete bookmarks[k])
    Object.entries(data).forEach(([k, v]) => {
      bookmarks[k] = v.map(bm => ({ ...bm }))
    })
    save(bookmarks)
    refreshCategories()
    currentCategory.value = categories.value[0] || ''
  }

  return {
    bookmarks,
    categories,
    currentCategory,
    sortedBookmarks,
    getItems,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    findIndexByUrl,
    setCategory,
    resetToDefaults,
    exportData,
    importData,
    importBrowserBookmarks,
    refreshCategories,
    saveBookmarks: () => save(bookmarks),
    defaultBookmarks
  }
}

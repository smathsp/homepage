import { ref } from 'vue'
import { ghUsername, ghRepo, ghBranch, ghToken } from './useSettings.js'

const FILE_PATH = 'public/homepage-data.json'
const syncing = ref(false)
const lastSync = ref(localStorage.getItem('homepage-last-sync') || '')

function api(path, opts = {}) {
  const base = `https://api.github.com/repos/${ghUsername.value}/${ghRepo.value}`
  return fetch(base + path, {
    ...opts,
    headers: {
      Authorization: `Bearer ${ghToken.value}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...opts.headers
    }
  })
}

function mergeBookmarks(local, remote) {
  const merged = JSON.parse(JSON.stringify(remote))
  for (const cat of Object.keys(local)) {
    if (!merged[cat]) merged[cat] = []
    for (const bm of local[cat]) {
      const existing = merged[cat].findIndex(m => m.url === bm.url)
      if (existing >= 0) {
        // Local wins for same URL
        merged[cat][existing] = { ...bm }
      } else {
        merged[cat].push({ ...bm })
      }
    }
  }
  return merged
}

export function useGitSync() {
  async function push(bookmarksJson) {
    if (!ghUsername.value || !ghRepo.value || !ghToken.value) {
      throw new Error('请先在设置中填写 GitHub 信息')
    }

    syncing.value = true
    try {
      let sha = ''
      try {
        const r = await api(`/contents/${FILE_PATH}?ref=${ghBranch.value}`)
        if (r.ok) { const d = await r.json(); sha = d.sha }
      } catch { /* new file */ }

      const content = btoa(unescape(encodeURIComponent(bookmarksJson)))
      const body = {
        message: `Update bookmarks — ${new Date().toLocaleString('zh-CN')}`,
        content,
        branch: ghBranch.value
      }
      if (sha) body.sha = sha

      const r = await api(`/contents/${FILE_PATH}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err.message || `HTTP ${r.status}`)
      }

      const now = new Date().toLocaleString('zh-CN')
      lastSync.value = now
      localStorage.setItem('homepage-last-sync', now)
      return true
    } finally {
      syncing.value = false
    }
  }

  async function pull() {
    if (!ghUsername.value || !ghRepo.value || !ghToken.value) {
      throw new Error('请先在设置中填写 GitHub 信息')
    }

    syncing.value = true
    try {
      const r = await api(`/contents/${FILE_PATH}?ref=${ghBranch.value}`)
      if (!r.ok) {
        if (r.status === 404) throw new Error('仓库中未找到书签文件')
        const err = await r.json().catch(() => ({}))
        throw new Error(err.message || `HTTP ${r.status}`)
      }

      const data = await r.json()
      const json = decodeURIComponent(escape(atob(data.content)))
      const bm = JSON.parse(json)
      if (typeof bm !== 'object' || Array.isArray(bm)) throw new Error('格式无效')

      const now = new Date().toLocaleString('zh-CN')
      lastSync.value = now
      localStorage.setItem('homepage-last-sync', now)
      return bm
    } finally {
      syncing.value = false
    }
  }

  async function sync(localBookmarks, localSettings) {
    let remote = { bookmarks: {}, settings: {} }
    try {
      remote = await pull()
    } catch (e) {
      // First sync — no remote file yet, just push local
      if (!e.message.includes('未找到')) throw e
    }
    const mergedBookmarks = mergeBookmarks(localBookmarks, remote.bookmarks || {})
    const mergedSettings = { ...(remote.settings || {}), ...localSettings }
    const merged = { bookmarks: mergedBookmarks, settings: mergedSettings }
    await push(JSON.stringify(merged, null, 2))
    return merged
  }

  async function fetchDeployed() {
    try {
      const r = await fetch(`/${FILE_PATH}?t=${Date.now()}`)
      if (!r.ok) return null
      const data = await r.json()
      if (typeof data === 'object' && !Array.isArray(data)) return data
    } catch { /* no file deployed yet */ }
    return null
  }

  return { syncing, lastSync, push, sync, fetchDeployed }
}

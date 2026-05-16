<script setup>
import { ref } from 'vue'
import { useBookmarks } from '../composables/useBookmarks.js'
import { useSettings } from '../composables/useSettings.js'
import { useToast } from '../composables/useToast.js'

const { bookmarks, refreshCategories, saveBookmarks } = useBookmarks()
const { importSettings } = useSettings()
const { show: toast } = useToast()
const spinning = ref(false)

async function refresh() {
  spinning.value = true
  try {
    const r = await fetch(`/homepage-data.json?t=${Date.now()}`)
    if (!r.ok) { toast('暂无远程数据'); return }
    const data = await r.json()

    let count = 0
    if (data.bookmarks) {
      for (const cat of Object.keys(data.bookmarks)) {
        if (!bookmarks[cat]) bookmarks[cat] = []
        for (const bm of data.bookmarks[cat]) {
          const exists = bookmarks[cat].some(m => m.url === bm.url)
          if (!exists) {
            bookmarks[cat].push({ ...bm, createdAt: Date.now() })
            count++
          }
        }
      }
      if (count > 0) { saveBookmarks(); refreshCategories() }
    }

    if (data.settings) importSettings(data.settings)

    toast(count > 0 ? `已同步 ${count} 个新书签和设置` : '已是最新')
  } catch { toast('刷新失败') }
  finally { spinning.value = false }
}
</script>

<template>
  <button class="refresh-btn" :class="{ spinning }" @click="refresh" aria-label="强制刷新" title="拉取最新数据">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
  </button>
</template>

<style scoped>
.refresh-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 10;
  width: 42px; height: 42px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all var(--duration-fast) var(--ease-out);
}
.refresh-btn:hover { border-color: var(--accent); color: var(--accent); }
.refresh-btn svg { width: 16px; height: 16px; }
.refresh-btn.spinning svg { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) { .refresh-btn { top: 12px; left: 12px; width: 36px; height: 36px; } }
</style>

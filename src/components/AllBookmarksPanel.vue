<script setup>
import { computed } from 'vue'
import { useBookmarks } from '../composables/useBookmarks.js'
import { useUI } from '../composables/useUI.js'

const { sortedBookmarks } = useBookmarks()
const { showContextMenu } = useUI()

const allItems = computed(() => {
  const flat = []
  for (const group of sortedBookmarks.value) {
    for (let i = 0; i < group.items.length; i++) {
      flat.push({ ...group.items[i], category: group.category, catIndex: i })
    }
  }
  return flat
})

function onItemClick(e, url) {
  if (e.button !== 0) return
  e.preventDefault()
  window.location.href = url
}

function onAuxClick(e, url) {
  if (e.button !== 1) return
  window.open(url, '_blank')
}

function onContextMenu(e, cat, idx, url) {
  e.preventDefault()
  showContextMenu(e.clientX, e.clientY, cat, idx, url)
}
</script>

<template>
  <section class="all-bookmarks">
    <h3 class="panel-heading">全部书签</h3>
    <div class="all-grid">
      <a
        v-for="item in allItems"
        :key="item.url + '-' + item.catIndex"
        :href="item.url"
        class="all-card"
        :title="item.name + (item.desc ? ' — ' + item.desc : '')"
        @click="onItemClick($event, item.url)"
        @auxclick.prevent="onAuxClick($event, item.url)"
        @contextmenu.prevent="onContextMenu($event, item.category, item.catIndex, item.url)"
      >
        <div class="all-card-icon">
          <img v-if="item.icon" :src="item.icon" alt="" loading="lazy">
          <span v-else class="all-card-fallback">{{ item.name.charAt(0).toUpperCase() }}</span>
        </div>
        <span class="all-card-name">{{ item.name }}</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.all-bookmarks {
  width: 100%;
  margin-top: 20px;
}

.panel-heading {
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
  padding-left: 4px;
}

.all-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 180px));
  gap: 8px;
  justify-content: center;
  width: 100%;
}

.all-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 10px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all var(--duration-fast) var(--ease-out);
  cursor: pointer;
}
.all-card:hover {
  background: var(--surface-hover);
  border-color: var(--border-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.all-card-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(255,255,255,0.04);
  overflow: hidden;
}
.all-card-icon img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
.all-card-fallback {
  width: 22px; height: 22px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-glow);
  display: flex;
  align-items: center;
  justify-content: center;
}

.all-card-name {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  text-align: center;
  line-height: 1.2;
  word-break: break-word;
  text-wrap: pretty;
}
.all-card:hover .all-card-name { color: var(--accent); }

@media (max-width: 480px) {
  .all-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 140px)); gap: 6px; }
  .all-card { padding: 12px 6px 10px; gap: 6px; }
  .all-card-icon { width: 28px; height: 28px; }
  .all-card-icon img { width: 16px; height: 16px; }
  .all-card-fallback { width: 16px; height: 16px; font-size: 9px; }
  .all-card-name { font-size: 11px; }
}
</style>

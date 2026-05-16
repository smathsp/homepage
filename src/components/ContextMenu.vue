<script setup>
import { useBookmarks } from '../composables/useBookmarks.js'
import { useToast } from '../composables/useToast.js'
import { ctxMenu, useUI } from '../composables/useUI.js'

const { deleteBookmark, findIndexByUrl, getItems } = useBookmarks()
const { show: toast } = useToast()
const { openEditModal, hideContextMenu } = useUI()

function getRealIndex() {
  return findIndexByUrl(ctxMenu.category, ctxMenu.url)
}

function edit() {
  const idx = getRealIndex()
  const bm = getItems(ctxMenu.category).find(b => b.url === ctxMenu.url)
  hideContextMenu()
  if (bm && idx >= 0) openEditModal(ctxMenu.category, idx, bm)
}

function remove() {
  const idx = getRealIndex()
  hideContextMenu()
  if (idx >= 0) {
    deleteBookmark(ctxMenu.category, idx)
    toast('书签已删除。')
  }
}

function openInTab() {
  const url = ctxMenu.url
  hideContextMenu()
  window.open(url, '_blank')
}
</script>

<template>
  <div
    class="context-menu"
    :class="{ open: ctxMenu.open }"
    :style="{ left: ctxMenu.x + 'px', top: ctxMenu.y + 'px' }"
    @click.stop
  >
    <button class="context-menu-item" @click="edit">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      编辑
    </button>
    <button class="context-menu-item" @click="openInTab">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      在新标签页打开
    </button>
    <div class="context-menu-sep"></div>
    <button class="context-menu-item danger" @click="remove">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      删除
    </button>
  </div>
</template>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 200;
  min-width: 140px;
  background: oklch(0.20 0.01 260);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  padding: 6px;
  opacity: 0;
  visibility: hidden;
  transform: scale(0.95);
  transition: all var(--duration-fast) var(--ease-out);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
[data-theme="light"] .context-menu { background: rgba(255,255,255,0.95); }
.context-menu.open { opacity: 1; visibility: visible; transform: scale(1); }
.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-family: var(--font-body);
  color: var(--text);
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  transition: background var(--duration-fast) var(--ease-out);
}
.context-menu-item:hover { background: var(--surface-hover); }
.context-menu-item.danger { color: var(--danger); }
.context-menu-sep { height: 1px; background: var(--border); margin: 4px 8px; }
</style>

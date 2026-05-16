<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBookmarks } from './composables/useBookmarks.js'
import { ctxMenu, useUI } from './composables/useUI.js'
import { bgOrbs, bgDarkImage, bgDarkBlur, bgDarkSaturate, bgDarkBrightness, bgDarkOpacity, bgLightImage, bgLightBlur, bgLightSaturate, bgLightBrightness, bgLightOpacity } from './composables/useSettings.js'
import { useTheme } from './composables/useTheme.js'
import { blurMap } from './composables/useSettings.js'
import ThemeToggle from './components/ThemeToggle.vue'
import ClockSection from './components/ClockSection.vue'
import SearchBar from './components/SearchBar.vue'
import CategoryTabs from './components/CategoryTabs.vue'
import BookmarkGrid from './components/BookmarkGrid.vue'
import AllBookmarksPanel from './components/AllBookmarksPanel.vue'
import BookmarkModal from './components/BookmarkModal.vue'
import ContextMenu from './components/ContextMenu.vue'
import SettingsModal from './components/SettingsModal.vue'
import ToastMessage from './components/ToastMessage.vue'

const { theme } = useTheme()
const { openAddModal } = useUI()
const { categories, setCategory } = useBookmarks()
const searchRef = ref(null)
const visibleCats = computed(() => categories.value.filter(c => c !== '未分类'))

const bgImage = computed(() => theme.value === 'dark' ? bgDarkImage.value : bgLightImage.value)
const bgStyle = computed(() => {
  if (!bgImage.value) return { display: 'none' }
  const isDark = theme.value === 'dark'
  const blur = blurMap[isDark ? bgDarkBlur.value : bgLightBlur.value] ?? 8
  const saturate = (isDark ? bgDarkSaturate.value : bgLightSaturate.value) / 100
  const brightness = (isDark ? bgDarkBrightness.value : bgLightBrightness.value) / 100
  const opacity = (isDark ? bgDarkOpacity.value : bgLightOpacity.value) / 100
  return {
    backgroundImage: `url(${bgImage.value})`,
    filter: `blur(${blur}px) saturate(${saturate}) brightness(${brightness})`,
    opacity
  }
})

// Keyboard shortcuts
function onKeydown(e) {
  const tag = document.activeElement?.tagName
  const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable

  // / or Ctrl+K / Cmd+K focuses search
  if ((e.key === '/' && !isInput) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
    e.preventDefault()
    searchRef.value?.focus()
    return
  }

  // 1-9 category shortcuts
  if (!isInput && e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const idx = parseInt(e.key) - 1
    if (idx < visibleCats.value.length) {
      e.preventDefault()
      setCategory(visibleCats.value[idx])
    }
  }
}

// Close context menu on outside click
function onDocumentClick(e) {
  if (ctxMenu.open && !e.target.closest('.context-menu')) {
    ctxMenu.open = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <!-- Background -->
  <div v-if="bgOrbs" class="bg-orbs">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
  </div>

  <!-- Background image -->
  <div class="bg-image" :style="bgStyle"></div>
  <div v-if="bgImage && theme === 'light'" class="bg-image-mask"></div>

  <ThemeToggle />

  <main class="app-container">
    <ClockSection />
    <SearchBar ref="searchRef" />
    <CategoryTabs />
    <BookmarkGrid />
    <AllBookmarksPanel />
  </main>

  <BookmarkModal />
  <ContextMenu />
  <!-- Floating add button -->
  <button class="fab-add" @click="openAddModal('')" aria-label="添加书签" title="添加书签">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  </button>

  <SettingsModal />
  <ToastMessage />
</template>

<style scoped>
/* ============================================
    BACKGROUND ORBS
    ============================================ */
.bg-orbs { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.12;
  will-change: transform;
}
.orb-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, oklch(0.68 0.18 195), transparent);
  top: -15%; left: -10%;
  animation: orbFloat1 24s ease-in-out infinite;
}
.orb-2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, oklch(0.60 0.15 230), transparent);
  bottom: -20%; right: -8%;
  animation: orbFloat2 28s ease-in-out infinite;
}
.orb-3 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, oklch(0.55 0.12 170), transparent);
  top: 50%; left: 50%;
  animation: orbFloat3 32s ease-in-out infinite;
}

@keyframes orbFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(12%, -8%) scale(1.04); }
  50% { transform: translate(4%, -16%) scale(0.95); }
  75% { transform: translate(-8%, -4%) scale(1.02); }
}
@keyframes orbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-10%, 12%) scale(1.03); }
  50% { transform: translate(-14%, 4%) scale(0.96); }
  75% { transform: translate(4%, 8%) scale(1.05); }
}
@keyframes orbFloat3 {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  25% { transform: translate(-42%, -58%) scale(0.97); }
  50% { transform: translate(-58%, -42%) scale(1.05); }
  75% { transform: translate(-48%, -52%) scale(0.98); }
}

[data-theme="light"] .orb { opacity: 0.08; }

/* ============================================
    BACKGROUND IMAGE
    ============================================ */
.bg-image {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
}
.bg-image-mask {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: rgba(255, 255, 255, 0.45);
  pointer-events: none;
}

/* ============================================
    FLOATING ADD BUTTON
    ============================================ */
.fab-add {
  position: fixed;
  bottom: 70px;
  right: 20px;
  z-index: 50;
  width: 38px; height: 38px;
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
.fab-add:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }

@media (max-width: 768px) {
  .fab-add { bottom: 62px; right: 14px; }
}
</style>

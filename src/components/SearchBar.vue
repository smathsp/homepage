<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useSearch } from '../composables/useSearch.js'
import { useBookmarks } from '../composables/useBookmarks.js'
import { clickNewTab, searchNewTab } from '../composables/useSettings.js'

const { detect, execute, engineList, defaultEngineKey, setDefaultEngine } = useSearch()
const { sortedBookmarks } = useBookmarks()
const query = ref('')
const inputRef = ref(null)
const dropdownOpen = ref(false)
const wrapperRef = ref(null)
const resultsOpen = ref(false)
const selectedIdx = ref(-1)

function onDocumentClick(e) {
  if (!wrapperRef.value?.contains(e.target)) {
    dropdownOpen.value = false
    resultsOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

const detected = computed(() => detect(query.value))
const currentEngine = computed(() => detected.value.engine)
const hasPrefix = computed(() => detected.value.prefix !== '')
const placeholder = computed(() => `搜索 ${currentEngine.value.name}...`)
const showClear = computed(() => query.value.length > 0)

// Bookmark search
const searchQuery = computed(() => hasPrefix.value ? '' : query.value.trim().toLowerCase())

const matchingBookmarks = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 1) return []
  const results = []
  for (const group of sortedBookmarks.value) {
    for (let i = 0; i < group.items.length; i++) {
      const bm = group.items[i]
      const match = (
        bm.name.toLowerCase().includes(searchQuery.value) ||
        (bm.desc && bm.desc.toLowerCase().includes(searchQuery.value)) ||
        bm.url.toLowerCase().includes(searchQuery.value) ||
        (bm.tags && bm.tags.some(t => t.toLowerCase().includes(searchQuery.value)))
      )
      if (match) results.push({ ...bm, category: group.category, catIndex: i })
    }
  }
  return results.slice(0, 10)
})

watch(query, () => { selectedIdx.value = -1 })
watch(matchingBookmarks, () => { selectedIdx.value = -1 })

const showResults = computed(() => !hasPrefix.value && matchingBookmarks.value.length > 0 && query.value.length >= 1)

function onKeydown(e) {
  if (e.key === 'Escape') {
    query.value = ''
    dropdownOpen.value = false
    resultsOpen.value = false
    selectedIdx.value = -1
    e.target.blur()
    return
  }
  if (e.key === 'ArrowDown' && resultsOpen.value) {
    e.preventDefault()
    selectedIdx.value = Math.min(selectedIdx.value + 1, matchingBookmarks.value.length - 1)
    return
  }
  if (e.key === 'ArrowUp' && resultsOpen.value) {
    e.preventDefault()
    selectedIdx.value = Math.max(selectedIdx.value - 1, -1)
    return
  }
  if (e.key === 'Enter') {
    dropdownOpen.value = false
    if (resultsOpen.value && matchingBookmarks.value.length > 0) {
      const idx = Math.max(selectedIdx.value, 0)
      const targetUrl = matchingBookmarks.value[idx].url
      if (clickNewTab.value) window.open(targetUrl, '_blank')
      else window.location.href = targetUrl
    } else {
      execute(query.value)
    }
    resultsOpen.value = false
  }
}

function clear() {
  query.value = ''
  resultsOpen.value = false
  inputRef.value?.focus()
}

function focus() {
  inputRef.value?.focus()
  inputRef.value?.select()
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
  resultsOpen.value = false
}

function selectEngine(engine) {
  setDefaultEngine(engine.key)
  dropdownOpen.value = false
}

function openResult(url) {
  if (clickNewTab.value) window.open(url, '_blank')
  else window.location.href = url
}

function onInput() {
  resultsOpen.value = showResults.value
}

function getFaviconUrl(url) {
  try { return '' } catch { return '' }
}

defineExpose({ focus })
</script>

<template>
  <section class="search-section">
    <div ref="wrapperRef" class="search-wrapper">
      <span
        class="search-engine-badge"
        :class="{ active: dropdownOpen || hasPrefix }"
        @click.stop="toggleDropdown"
        title="点击切换搜索引擎"
      >
        <span class="engine-name">{{ currentEngine.name }}</span>
        <svg class="chevron" :class="{ open: dropdownOpen }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </span>

      <span class="search-divider"></span>

      <input
        ref="inputRef"
        v-model="query"
        type="text"
        class="search-input"
        :placeholder="placeholder"
        autocomplete="off"
        spellcheck="false"
        @keydown="onKeydown"
        @input="onInput"
        @focus="dropdownOpen = false"
      >
      <div v-show="!query" class="search-shortcut">⌘K</div>
      <button v-show="showClear" class="search-clear" @click="clear" aria-label="清除搜索">&times;</button>

      <!-- Engine dropdown -->
      <Transition name="dropdown">
        <div v-if="dropdownOpen" class="engine-dropdown" @click.stop>
          <button
            v-for="eng in engineList"
            :key="eng.key"
            class="engine-option"
            :class="{ selected: !hasPrefix && eng.key === defaultEngineKey }"
            @click="selectEngine(eng)"
          >
            <span class="engine-option-check">&#10003;</span>
            <span class="engine-option-name">{{ eng.name }}</span>
            <span v-if="eng.key" class="engine-prefix-hint">{{ eng.key }}</span>
          </button>
        </div>
      </Transition>

      <!-- Bookmark search results -->
      <Transition name="dropdown">
        <div v-if="resultsOpen" class="results-dropdown" @click.stop>
          <a
            v-for="(bm, i) in matchingBookmarks"
            :key="bm.category + '-' + bm.catIndex"
            :href="bm.url"
            class="result-item"
            :class="{ selected: i === selectedIdx }"
            @click.prevent="openResult(bm.url)"
          >
            <span class="result-icon">{{ bm.name.charAt(0).toUpperCase() }}</span>
            <div class="result-info">
              <span class="result-name">{{ bm.name }}</span>
              <span v-if="bm.desc" class="result-desc">{{ bm.desc }}</span>
              <span v-if="bm.tags && bm.tags.length" class="result-tags">
                <span v-for="t in bm.tags" :key="t" class="result-tag">{{ t }}</span>
              </span>
            </div>
            <span class="result-cat">{{ bm.category }}</span>
          </a>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.search-section { width: 100%; max-width: 620px; align-self: center; }
.search-wrapper {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all var(--duration-fast) var(--ease-out);
  overflow: visible;
}
.search-wrapper:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.search-engine-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 14px 6px 14px 20px;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out);
}
.search-engine-badge:hover { color: var(--accent); }
.search-engine-badge.active { color: var(--accent); }
.chevron {
  flex-shrink: 0;
  transition: transform var(--duration-fast) var(--ease-out);
  opacity: 0.4;
}
.search-engine-badge:hover .chevron { opacity: 0.7; }
.chevron.open { transform: rotate(180deg); opacity: 0.7; }

.search-divider {
  width: 1px;
  height: 24px;
  background: var(--border);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 17px;
  padding: 16px 16px;
  outline: none;
  min-width: 0;
  letter-spacing: 0.01em;
}
.search-input::placeholder { color: var(--text-tertiary); }
.search-clear {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 8px 16px 8px 4px;
  font-size: 18px;
  line-height: 1;
}
.search-clear:hover { color: var(--text); }

/* ---- Shared dropdown styles ---- */
.engine-dropdown, .results-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  background: oklch(0.18 0.01 260);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 8px;
  z-index: 60;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  max-height: 360px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.engine-dropdown { left: 12px; min-width: 220px; max-width: calc(100% - 24px); }
.results-dropdown { left: 0; right: 0; }
.engine-dropdown::-webkit-scrollbar,
.results-dropdown::-webkit-scrollbar { display: none; }

.dropdown-enter-active { animation: dropdownIn 0.18s var(--ease-out); }
.dropdown-leave-active { animation: dropdownOut 0.12s var(--ease-in-out); }
@keyframes dropdownIn { from { opacity: 0; transform: translateY(-6px) scale(0.95); } }
@keyframes dropdownOut { to { opacity: 0; transform: translateY(-4px) scale(0.97); } }

[data-theme="light"] .engine-dropdown,
[data-theme="light"] .results-dropdown { background: rgba(255,255,255,0.96); }

/* ---- Engine options ---- */
.engine-option {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 9px 12px;
  border: none; border-radius: 8px;
  background: none; color: var(--text);
  font-family: var(--font-body); font-size: 13px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}
.engine-option:hover { background: var(--surface-hover); color: var(--accent); }
.engine-option-check {
  width: 16px; font-size: 10px; color: var(--accent);
  opacity: 0; flex-shrink: 0; text-align: center;
  transition: opacity var(--duration-fast) var(--ease-out);
}
.engine-option.selected .engine-option-check { opacity: 1; }
.engine-option.selected { background: var(--surface-active); }
.engine-prefix-hint {
  margin-left: auto; font-size: 10px;
  color: var(--text-tertiary); opacity: 0.6;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}

/* ---- Bookmark results ---- */
.result-item {
  display: flex; align-items: flex-start; gap: 10px;
  width: 100%; padding: 10px 12px;
  border: none; border-radius: 8px;
  background: none; color: var(--text);
  font-family: var(--font-body); font-size: 13px;
  cursor: pointer; text-decoration: none;
  transition: all var(--duration-fast) var(--ease-out);
}
.result-item:hover { background: var(--surface-hover); }
.result-item.selected { background: var(--surface-active); }
.result-icon {
  width: 28px; height: 28px; flex-shrink: 0;
  border-radius: 6px; margin-top: 1px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
  color: var(--accent); background: var(--accent-glow);
  font-family: var(--font-heading);
}
.result-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.result-name { font-weight: 500; line-height: 1.3; }
.result-item:hover .result-name { color: var(--accent); }
.result-desc { font-size: 11px; color: var(--text-tertiary); line-height: 1.3; }
.result-tags { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 2px; }
.result-tag {
  padding: 0 5px; border-radius: 4px;
  font-size: 9px; font-weight: 500;
  color: var(--accent); background: var(--accent-glow);
  white-space: nowrap;
}
.result-cat {
  font-size: 10px; color: var(--text-tertiary);
  opacity: 0.7; flex-shrink: 0; margin-top: 1px;
}

.search-shortcut {
  margin-right: 14px;
  padding: 4px 6px;
  border-radius: 4px;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  color: var(--text-tertiary);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  pointer-events: none;
  user-select: none;
  transition: opacity var(--duration-fast);
}

@media (max-width: 768px) {
  .search-input { font-size: 16px; padding: 14px 12px; }
  .search-engine-badge { padding-left: 16px; font-size: 12px; }
  .engine-dropdown, .results-dropdown { left: 8px; min-width: 180px; }
  .search-shortcut { display: none; }
}
</style>

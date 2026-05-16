<script setup>
import { computed } from 'vue'
import { useBookmarks } from '../composables/useBookmarks.js'

const { categories, currentCategory, setCategory } = useBookmarks()

const visibleCategories = computed(() => categories.value.filter(c => c !== '未分类'))
</script>

<template>
  <nav class="categories">
    <button
      v-for="(cat, i) in visibleCategories"
      :key="cat"
      class="cat-tab"
      :class="{ active: cat === currentCategory }"
      @click="setCategory(cat)"
    >
      {{ cat }}
      <span v-if="i < 9" class="key-hint">{{ i + 1 }}</span>
    </button>
  </nav>
</template>

<style scoped>
.categories {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 100%;
}
.cat-tab {
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  white-space: nowrap;
  user-select: none;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  outline: none;
}
.cat-tab:hover {
  border-color: var(--border-hover);
  background: var(--surface-hover);
  color: var(--text);
}
.cat-tab.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #0b0d10;
  font-weight: 600;
}
.cat-tab .key-hint {
  display: inline-block;
  font-size: 10px;
  opacity: 0.6;
  margin-left: 4px;
  font-weight: 400;
}
@media (max-width: 768px) {
  .categories { gap: 6px; }
  .cat-tab { padding: 6px 14px; font-size: 12px; }
}
</style>

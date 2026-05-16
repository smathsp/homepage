<script setup>
import { computed } from 'vue'
import { useBookmarks } from '../composables/useBookmarks.js'
import { useUI } from '../composables/useUI.js'
import BookmarkCard from './BookmarkCard.vue'

const { currentCategory, getItems } = useBookmarks()
const { showContextMenu } = useUI()

const items = computed(() => getItems(currentCategory.value))
const animationsActive = computed(() =>
  document.documentElement.getAttribute('data-animations') !== 'off'
)
const animationsReduced = computed(() =>
  document.documentElement.getAttribute('data-animations') === 'reduced'
)

function onContextMenu(x, y, cat, idx, url) {
  showContextMenu(x, y, cat, idx, url)
}
</script>

<template>
  <section class="bookmarks-section">
    <TransitionGroup name="list" tag="div" class="bookmarks-grid">
      <BookmarkCard
        v-for="(bm, i) in items"
        :key="bm.url + '-' + i"
        :bookmark="bm"
        :index="i"
        :category="currentCategory"
        :animation-delay="animationsActive ? (animationsReduced ? 0 : i * 0.04) : 0"
        @contextmenu="onContextMenu"
      />
    </TransitionGroup>
  </section>
</template>

<style scoped>
.bookmarks-section { width: 100%; }
.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--card-size), 220px));
  gap: 10px;
  justify-content: center;
  width: 100%;
  position: relative;
}

/* TransitionGroup animations */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.list-leave-active {
  position: absolute;
  visibility: hidden;
  transition: none;
}

@media (max-width: 768px) { .bookmarks-grid { gap: 8px; } }
@media (max-width: 480px) {
  .bookmarks-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 160px)); gap: 6px; }
}
</style>

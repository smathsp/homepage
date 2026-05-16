<script setup>
import { computed, ref, watch } from 'vue'
import { clickNewTab } from '../composables/useSettings.js'

const props = defineProps({
  bookmark: { type: Object, required: true },
  index: { type: Number, required: true },
  category: { type: String, required: true },
  animationDelay: { type: Number, default: 0 }
})

const emit = defineEmits(['contextmenu'])

const iconSrc = computed(() => props.bookmark.icon || '')
const initial = computed(() => props.bookmark.name.charAt(0).toUpperCase())
const imageError = ref(false)

watch(() => props.bookmark.icon, () => {
  imageError.value = false
})

function onClick(e) {
  if (e.ctrlKey || e.metaKey || e.button !== 0) return
  if (clickNewTab.value) window.open(props.bookmark.url, '_blank')
  else window.location.href = props.bookmark.url
}

function onAuxClick(e) {
  if (e.button !== 1) return
  window.open(props.bookmark.url, '_blank')
}

function onContextMenu(e) {
  emit('contextmenu', e.clientX, e.clientY, props.category, props.index, props.bookmark.url)
}
</script>

<template>
  <a
    class="bookmark-card"
    :href="bookmark.url"
    :title="bookmark.name + (bookmark.desc ? ' — ' + bookmark.desc : '')"
    :style="{ animationDelay: animationDelay + 's' }"
    @click.prevent="onClick"
    @auxclick.prevent="onAuxClick"
    @contextmenu.prevent="onContextMenu"
  >
    <div class="favicon-wrap">
      <img v-if="iconSrc && !imageError" :src="iconSrc" alt="" loading="lazy" @error="imageError = true">
      <div v-else class="favicon-fallback">{{ initial }}</div>
    </div>
    <span class="card-name">{{ bookmark.name }}</span>
    <span v-if="bookmark.desc" class="card-desc">{{ bookmark.desc }}</span>
    <span v-if="bookmark.tags && bookmark.tags.length" class="card-tags">
      <span v-for="t in bookmark.tags" :key="t" class="card-tag">{{ t }}</span>
    </span>
  </a>
</template>

<style scoped>
.bookmark-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 22px 12px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all var(--duration-fast) var(--ease-out);
  animation: cardEnter 0.5s var(--ease-out) both;
  user-select: none;
}
.bookmark-card:hover {
  background: var(--surface-hover);
  border-color: var(--border-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.bookmark-card:active { transform: translateY(0) scale(0.98); }
.favicon-wrap {
  width: 44px; height: 44px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
}
.favicon-wrap img { width: 28px; height: 28px; object-fit: contain; }
.favicon-fallback {
  width: 28px; height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-glow);
}
.card-name {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  text-align: center;
  line-height: 1.2;
  text-wrap: pretty;
  word-break: break-word;
}
.card-desc {
  font-size: 11px;
  color: var(--text-tertiary);
  text-align: center;
  line-height: 1.3;
}
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  justify-content: center;
}
.card-tag {
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 500;
  color: var(--accent);
  background: var(--accent-glow);
  white-space: nowrap;
}

[data-card-size="compact"] .bookmark-card { padding: 14px 8px 12px; gap: 6px; }
[data-card-size="compact"] .favicon-wrap { width: 34px; height: 34px; }
[data-card-size="compact"] .favicon-wrap img { width: 22px; height: 22px; }
[data-card-size="compact"] .favicon-fallback { width: 22px; height: 22px; font-size: 11px; }
[data-card-size="compact"] .card-name { font-size: 12px; }
[data-card-size="compact"] .card-desc { display: none; }

[data-card-size="large"] .bookmark-card { padding: 28px 16px 24px; gap: 14px; }
[data-card-size="large"] .favicon-wrap { width: 56px; height: 56px; }
[data-card-size="large"] .favicon-wrap img { width: 36px; height: 36px; }
[data-card-size="large"] .favicon-fallback { width: 36px; height: 36px; font-size: 18px; }
[data-card-size="large"] .card-name { font-size: 16px; }
[data-card-size="large"] .card-desc { display: block; }

@media (max-width: 480px) {
  .bookmark-card { padding: 14px 6px 12px; gap: 6px; }
  .favicon-wrap { width: 32px; height: 32px; }
  .favicon-wrap img { width: 22px; height: 22px; }
  .favicon-fallback { width: 22px; height: 22px; font-size: 11px; }
  .card-name { font-size: 12px; }
}
</style>

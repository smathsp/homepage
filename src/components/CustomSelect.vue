<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: '' },
  options: { type: Array, required: true }, // Array of { label, value }
  width: { type: String, default: '120px' }
})
const emit = defineEmits(['update:modelValue', 'change'])

const open = ref(false)
const selectedOption = computed(() => props.options.find(o => o.value === props.modelValue) || props.options[0])

function toggle() {
  open.value = !open.value
}

function selectOption(opt) {
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
  open.value = false
}

function closeDropdown(e) {
  if (open.value && !e.target.closest('.custom-select')) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', closeDropdown))
onUnmounted(() => document.removeEventListener('click', closeDropdown))
</script>

<template>
  <div class="custom-select" :style="{ width }" @click="toggle">
    <div class="select-trigger" :class="{ open }">
      <span class="select-label">{{ selectedOption?.label }}</span>
      <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
    <Transition name="dropdown">
      <div v-if="open" class="select-dropdown">
        <div 
          v-for="opt in options" 
          :key="opt.value" 
          class="select-option" 
          :class="{ active: opt.value === modelValue }"
          @click.stop="selectOption(opt)"
        >
          {{ opt.label }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.custom-select {
  position: relative;
  font-family: var(--font-body);
  font-size: 13px;
  user-select: none;
}
.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  color: var(--text);
  transition: all var(--duration-fast) var(--ease-out);
}
.select-trigger:hover {
  border-color: var(--border-hover);
  background: var(--surface-hover);
}
.select-trigger.open {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-glow);
}
.chevron {
  width: 14px; height: 14px;
  transition: transform var(--duration-fast) var(--ease-out);
  color: var(--text-secondary);
}
.select-trigger.open .chevron {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: max-content;
  min-width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px;
  box-shadow: var(--shadow-lg);
  z-index: 100;
  max-height: 220px;
  overflow-y: auto;
}

.select-option {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.select-option:hover {
  background: var(--surface-hover);
}
.select-option.active {
  color: var(--accent);
  background: var(--accent-glow);
  font-weight: 500;
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s var(--ease-out);
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
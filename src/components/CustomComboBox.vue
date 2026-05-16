<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, required: true }, // Array of strings
  width: { type: String, default: '100%' },
  placeholder: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const inputRef = ref(null)

const filteredOptions = computed(() => {
  const q = (props.modelValue || '').toLowerCase()
  return props.options.filter(o => o.toLowerCase().includes(q))
})

function openDropdown() {
  open.value = true
}

function selectOption(opt) {
  emit('update:modelValue', opt)
  open.value = false
}

function closeDropdown(e) {
  if (open.value && !e.target.closest('.custom-combo')) {
    open.value = false
  }
}

function onInput(e) {
  emit('update:modelValue', e.target.value)
  open.value = true
}

onMounted(() => document.addEventListener('click', closeDropdown))
onUnmounted(() => document.removeEventListener('click', closeDropdown))
</script>

<template>
  <div class="custom-combo" :style="{ width }">
    <div class="combo-trigger" :class="{ open }">
      <input
        ref="inputRef"
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        @input="onInput"
        @focus="openDropdown"
        class="combo-input"
        autocomplete="off"
      >
      <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" @click.stop="openDropdown">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
    <Transition name="dropdown">
      <div v-if="open && filteredOptions.length > 0" class="combo-dropdown">
        <div 
          v-for="opt in filteredOptions" 
          :key="opt" 
          class="combo-option" 
          :class="{ active: opt === modelValue }"
          @click.stop="selectOption(opt)"
        >
          {{ opt }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.custom-combo {
  position: relative;
  font-family: var(--font-body);
  font-size: 13px;
}
.combo-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  transition: all var(--duration-fast) var(--ease-out);
  overflow: hidden;
}
.combo-trigger:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-glow);
}
.combo-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text);
  padding: 6px 12px;
  font-family: inherit;
  font-size: 13px;
  outline: none;
  width: 100%;
}
.chevron {
  width: 14px; height: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  margin-right: 10px;
  transition: transform var(--duration-fast) var(--ease-out);
}
.combo-trigger.open .chevron {
  transform: rotate(180deg);
}
.combo-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px;
  box-shadow: var(--shadow-lg);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}
.combo-option {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  display: block;
}
.combo-option:hover {
  background: var(--surface-hover);
}
.combo-option.active {
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
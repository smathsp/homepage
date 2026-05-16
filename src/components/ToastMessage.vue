<script setup>
import { useToast } from '../composables/useToast.js'

const { message, visible } = useToast()
</script>

<template>
  <div class="toast" :class="{ show: visible }">{{ message }}</div>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  z-index: 300;
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  background: oklch(0.25 0.01 260);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 13px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  opacity: 0;
  transition: all var(--duration-normal) var(--ease-out);
  pointer-events: none;
  white-space: nowrap;
}
[data-theme="light"] .toast { background: rgba(30,30,35,0.9); color: #fff; }
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
</style>

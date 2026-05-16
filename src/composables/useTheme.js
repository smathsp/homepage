import { ref, watch } from 'vue'
import { accentHue } from './useSettings.js'

const STORAGE_KEY = 'homepage-theme'
const theme = ref(localStorage.getItem(STORAGE_KEY) || 'dark')

function applyAccent() {
  const h = accentHue.value
  const root = document.documentElement
  root.style.setProperty('--accent-h', h)
  // Set light/dark accent based on current theme
  if (theme.value === 'dark') {
    root.style.setProperty('--accent', `oklch(0.68 0.18 ${h})`)
    root.style.setProperty('--accent-dim', `oklch(0.50 0.14 ${h})`)
    root.style.setProperty('--accent-glow', `oklch(0.68 0.18 ${h} / 0.15)`)
  } else {
    root.style.setProperty('--accent', `oklch(0.50 0.18 ${h})`)
    root.style.setProperty('--accent-dim', `oklch(0.40 0.12 ${h})`)
    root.style.setProperty('--accent-glow', `oklch(0.50 0.18 ${h} / 0.12)`)
  }
}

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t)
  applyAccent()
}

watch(accentHue, applyAccent)

export function useTheme() {
  function setTheme(t) {
    theme.value = t
    localStorage.setItem(STORAGE_KEY, t)
  }

  function toggle() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  watch(theme, applyTheme, { immediate: true })

  return { theme, setTheme, toggle }
}

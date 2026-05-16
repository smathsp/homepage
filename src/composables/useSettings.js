import { ref, watch } from 'vue'

function load(key, fallback) {
  const v = localStorage.getItem(`homepage-${key}`)
  return v !== null ? v : fallback
}

function persist(key, value) {
  if (value === null) localStorage.removeItem(`homepage-${key}`)
  else localStorage.setItem(`homepage-${key}`, JSON.stringify(value))
}

// ---- boolean helpers ----
function boolRef(key, fallback) {
  const v = load(key, fallback ? '1' : '0')
  const r = ref(v === '1' || v === 'true')
  watch(r, val => persist(key, val ? '1' : '0'))
  return r
}

// ---- Settings ----
export const bgOrbs        = boolRef('bg-orbs', true)
export const searchNewTab  = boolRef('search-newtab', false)
export const clock24h      = boolRef('clock-24h', true)
export const showSeconds   = boolRef('show-seconds', true)
export const showDate      = boolRef('show-date', true)
export const showGreeting  = boolRef('show-greeting', true)
export const clickNewTab   = boolRef('click-newtab', false)

function safeParse(v, fallback) {
  try { return JSON.parse(v) } catch { return fallback }
}

export const bookmarkSort  = ref(load('bookmark-sort', 'name'))
export const categoryOrder = ref(safeParse(load('category-order', '[]'), []))
export const accentHue     = ref(Number(safeParse(load('accent-hue', '195'), 195)))

// ---- AI ----
export const aiApiKey   = ref(load('ai-apikey', ''))
export const aiModel    = ref(load('ai-model', 'deepseek-chat'))
export const aiEndpoint = ref(load('ai-endpoint', 'https://api.deepseek.com/v1/chat/completions'))

// ---- GitHub ----
export const ghUsername = ref(load('gh-username', ''))
export const ghRepo     = ref(load('gh-repo', ''))
export const ghBranch   = ref(load('gh-branch', 'main'))
export const ghToken    = ref(load('gh-token', ''))

// ---- Background: dark ----
export const bgDarkImage      = ref(load('bg-dark-image', ''))
export const bgDarkBlur       = ref(load('bg-dark-blur', 'md'))
export const bgDarkSaturate   = ref(Number(load('bg-dark-saturate', '50')))
export const bgDarkBrightness = ref(Number(load('bg-dark-brightness', '50')))
export const bgDarkOpacity    = ref(Number(load('bg-dark-opacity', '50')))

// ---- Background: light ----
export const bgLightImage      = ref(load('bg-light-image', ''))
export const bgLightBlur       = ref(load('bg-light-blur', 'md'))
export const bgLightSaturate   = ref(Number(load('bg-light-saturate', '50')))
export const bgLightBrightness = ref(Number(load('bg-light-brightness', '50')))
export const bgLightOpacity    = ref(Number(load('bg-light-opacity', '50')))

// ---- Watchers ----
watch(bookmarkSort,      v => persist('bookmark-sort', v))
watch(categoryOrder,     v => persist('category-order', JSON.stringify(v)))
watch(aiApiKey,          v => persist('ai-apikey', v))
watch(aiModel,           v => persist('ai-model', v))
watch(aiEndpoint,        v => persist('ai-endpoint', v))
watch(ghUsername,        v => persist('gh-username', v))
watch(ghRepo,            v => persist('gh-repo', v))
watch(ghBranch,          v => persist('gh-branch', v))
watch(ghToken,           v => persist('gh-token', v))
watch(accentHue,         v => persist('accent-hue', String(v)))
watch(bgDarkImage,       v => persist('bg-dark-image', v))
watch(bgDarkBlur,        v => persist('bg-dark-blur', v))
watch(bgDarkSaturate,    v => persist('bg-dark-saturate', String(v)))
watch(bgDarkBrightness,  v => persist('bg-dark-brightness', String(v)))
watch(bgDarkOpacity,     v => persist('bg-dark-opacity', String(v)))
watch(bgLightImage,      v => persist('bg-light-image', v))
watch(bgLightBlur,       v => persist('bg-light-blur', v))
watch(bgLightSaturate,   v => persist('bg-light-saturate', String(v)))
watch(bgLightBrightness, v => persist('bg-light-brightness', String(v)))
watch(bgLightOpacity,    v => persist('bg-light-opacity', String(v)))

// Map Tailwind blur tokens to px
export const blurMap = {
  none: 0, sm: 4, '': 8, md: 12, lg: 16, xl: 24, '2xl': 40, '3xl': 64
}

function exportSettings() {
  return {
    bookmarkSort: bookmarkSort.value,
    categoryOrder: categoryOrder.value,
    accentHue: accentHue.value,
    bgOrbs: bgOrbs.value,
    searchNewTab: searchNewTab.value,
    clock24h: clock24h.value,
    showSeconds: showSeconds.value,
    showDate: showDate.value,
    showGreeting: showGreeting.value,
    clickNewTab: clickNewTab.value,
    bgDarkImage: bgDarkImage.value,
    bgDarkBlur: bgDarkBlur.value,
    bgDarkSaturate: bgDarkSaturate.value,
    bgDarkBrightness: bgDarkBrightness.value,
    bgDarkOpacity: bgDarkOpacity.value,
    bgLightImage: bgLightImage.value,
    bgLightBlur: bgLightBlur.value,
    bgLightSaturate: bgLightSaturate.value,
    bgLightBrightness: bgLightBrightness.value,
    bgLightOpacity: bgLightOpacity.value,
    aiModel: aiModel.value,
    aiEndpoint: aiEndpoint.value,
    ghUsername: ghUsername.value,
    ghRepo: ghRepo.value,
    ghBranch: ghBranch.value
    // Sensitive keys excluded: aiApiKey, ghToken
  }
}

function importSettings(data) {
  if (!data) return
  const set = (ref, val) => { if (val !== undefined) ref.value = val }
  set(bookmarkSort, data.bookmarkSort)
  set(categoryOrder, data.categoryOrder)
  set(accentHue, data.accentHue)
  set(bgOrbs, data.bgOrbs)
  set(searchNewTab, data.searchNewTab)
  set(clock24h, data.clock24h)
  set(showSeconds, data.showSeconds)
  set(showDate, data.showDate)
  set(showGreeting, data.showGreeting)
  set(clickNewTab, data.clickNewTab)
  set(bgDarkImage, data.bgDarkImage)
  set(bgDarkBlur, data.bgDarkBlur)
  set(bgDarkSaturate, data.bgDarkSaturate)
  set(bgDarkBrightness, data.bgDarkBrightness)
  set(bgDarkOpacity, data.bgDarkOpacity)
  set(bgLightImage, data.bgLightImage)
  set(bgLightBlur, data.bgLightBlur)
  set(bgLightSaturate, data.bgLightSaturate)
  set(bgLightBrightness, data.bgLightBrightness)
  set(bgLightOpacity, data.bgLightOpacity)
  set(aiModel, data.aiModel)
  set(aiEndpoint, data.aiEndpoint)
  set(ghUsername, data.ghUsername)
  set(ghRepo, data.ghRepo)
  set(ghBranch, data.ghBranch)
}

export function useSettings() {
  return {
    bgOrbs,
    searchNewTab,
    clock24h,
    showSeconds,
    showDate,
    showGreeting,
    clickNewTab,
    bookmarkSort,
    categoryOrder,
    accentHue,
    aiApiKey,
    aiModel,
    aiEndpoint,
    ghUsername,
    ghRepo,
    ghBranch,
    ghToken,
    bgDarkImage, bgDarkBlur, bgDarkSaturate, bgDarkBrightness, bgDarkOpacity,
    bgLightImage, bgLightBlur, bgLightSaturate, bgLightBrightness, bgLightOpacity,
    exportSettings,
    importSettings
  }
}

<script setup>
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme.js'
import { useBookmarks } from '../composables/useBookmarks.js'
import { useToast } from '../composables/useToast.js'
import { useSearch } from '../composables/useSearch.js'
import { cardSize, animations, useUI } from '../composables/useUI.js'
import { useSettings } from '../composables/useSettings.js'
import { useGitSync } from '../composables/useGitSync.js'
import CustomSelect from './CustomSelect.vue'

const { theme, setTheme } = useTheme()
const { categories, exportData, importData, importBrowserBookmarks, resetToDefaults } = useBookmarks()
const safeCategoryOrder = computed(() => {
  const order = Array.isArray(categoryOrder.value) ? categoryOrder.value : []
  if (order.length > 0) return order
  return [...categories.value].filter(c => c !== '未分类')
})
const { show: toast } = useToast()
const { engineList, defaultEngineKey, setDefaultEngine } = useSearch()
const { setCardSize, setAnimations } = useUI()
const {
  bgOrbs, searchNewTab, clock24h, showSeconds,
  showDate, showGreeting, clickNewTab, bookmarkSort,
  accentHue, categoryOrder,
  aiApiKey, aiModel, aiEndpoint,
  ghUsername, ghRepo, ghBranch, ghToken,
  bgDarkImage, bgDarkBlur, bgDarkSaturate, bgDarkBrightness, bgDarkOpacity,
  bgLightImage, bgLightBlur, bgLightSaturate, bgLightBrightness, bgLightOpacity,
  exportSettings: exportSettingsFn, importSettings
} = useSettings()
const { syncing, lastSync, push, sync } = useGitSync()

const open = ref(false)
const fileInput = ref(null)
const bookmarksFileInput = ref(null)
const activeSection = ref('appearance')

const colorPresets = [
  { name: '青色', hue: 195 },
  { name: '蓝色', hue: 245 },
  { name: '紫色', hue: 285 },
  { name: '粉色', hue: 340 },
  { name: '红色', hue: 10 },
  { name: '橙色', hue: 40 },
  { name: '绿色', hue: 145 }
]

const sections = [
  { key: 'appearance', label: '外观' },
  { key: 'background', label: '背景' },
  { key: 'ai',         label: 'AI' },
  { key: 'github',     label: 'GitHub' },
  { key: 'search',     label: '搜索' },
  { key: 'clock',      label: '时钟' },
  { key: 'bookmark',   label: '书签' },
  { key: 'categories', label: '分类' },
  { key: 'data',       label: '数据' }
]

// ---- handlers ----
function onThemeChange(e) { setTheme(e.target.value) }
function onCardSizeChange(e) { setCardSize(e.target.value) }
function onAnimationsChange(e) { setAnimations(e.target.value) }
function onEngineChange(e) { setDefaultEngine(e.target.value) }

function handleExport() {
  const blob = new Blob([exportData()], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = '书签备份-' + new Date().toISOString().slice(0, 10) + '.json'
  a.click()
  toast('书签已导出。')
}

function handleImport() { fileInput.value?.click() }
function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try { importData(reader.result); toast('书签已导入。') }
    catch { toast('书签文件格式无效。') }
  }
  reader.readAsText(file)
  e.target.value = ''
}

function handleReset() {
  if (confirm('确定要恢复为默认书签吗？自定义书签将会丢失。')) {
    resetToDefaults()
    toast('书签已恢复为默认。')
  }
}

function syncOrder() {
  if (categoryOrder.value.length === 0) {
    categoryOrder.value = [...categories.value].filter(c => c !== '未分类')
  }
}
function moveUp(idx) {
  syncOrder()
  if (idx <= 0) return
  const arr = [...categoryOrder.value]
  ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
  categoryOrder.value = arr
}
function moveDown(idx) {
  syncOrder()
  if (idx >= categoryOrder.value.length - 1) return
  const arr = [...categoryOrder.value]
  ;[arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]]
  categoryOrder.value = arr
}

function handleImportBookmarks() { bookmarksFileInput.value?.click() }
function onBookmarksFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const count = importBrowserBookmarks(reader.result)
      if (count > 0) toast(`已导入 ${count} 个书签。`)
      else toast('未找到有效书签。')
    } catch { toast('文件解析失败。') }
  }
  reader.readAsText(file)
  e.target.value = ''
}

async function handlePush() {
  try {
    const data = { bookmarks: JSON.parse(exportData()), settings: exportSettingsFn() }
    await push(JSON.stringify(data, null, 2))
    toast('已上传到 GitHub')
  } catch (e) { toast('上传失败：' + e.message) }
}
async function handleSync() {
  try {
    const localBm = JSON.parse(exportData())
    const localSettings = exportSettingsFn()
    const merged = await sync(localBm, localSettings)
    importData(JSON.stringify(merged.bookmarks))
    if (merged.settings) importSettings(merged.settings)
    toast('同步完成')
  } catch (e) { toast('同步失败：' + e.message) }
}

function handleClearAll() {
  if (confirm('确定要清空所有数据吗？包括书签和所有设置。此操作不可撤销。')) {
    localStorage.clear()
    location.reload()
  }
}

defineExpose({ open })
</script>

<template>
  <!-- Gear trigger -->
  <button class="settings-btn" @click="open = true" aria-label="设置">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  </button>

  <!-- Modal overlay -->
  <Transition name="modal">
    <div v-if="open" class="settings-overlay" @click.self="open = false">
      <div class="settings-modal">
        <div class="settings-header">
          <h2>设置</h2>
          <button class="close-btn" @click="open = false" aria-label="关闭">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="settings-layout">
          <!-- Left sidebar -->
          <nav class="settings-nav">
            <button
              v-for="sec in sections"
              :key="sec.key"
              class="nav-item"
              :class="{ active: activeSection === sec.key }"
              @click="activeSection = sec.key"
            >{{ sec.label }}</button>
          </nav>

          <!-- Right content -->
          <div class="settings-content">

            <!-- 外观 -->
            <div v-show="activeSection === 'appearance'" class="section-panel">
              <div class="setting-row"><span>主题</span><CustomSelect :model-value="theme" @update:model-value="v => onThemeChange({ target: { value: v } })" :options="[{label:'深色',value:'dark'},{label:'浅色',value:'light'}]"/></div>
              <div class="setting-row"><span>卡片大小</span><CustomSelect :model-value="cardSize" @update:model-value="v => onCardSizeChange({ target: { value: v } })" :options="[{label:'紧凑',value:'compact'},{label:'标准',value:'normal'},{label:'宽大',value:'large'}]"/></div>
              <div class="setting-row"><span>动画</span><CustomSelect :model-value="animations" @update:model-value="v => onAnimationsChange({ target: { value: v } })" :options="[{label:'完整',value:'full'},{label:'减弱',value:'reduced'},{label:'关闭',value:'off'}]"/></div>
              <div class="setting-row setting-col"><span>主题色</span>
                <div class="color-presets">
                  <button v-for="c in colorPresets" :key="c.hue" class="color-swatch" :class="{ active: accentHue === c.hue }" :style="{ background: `oklch(0.68 0.18 ${c.hue})` }" :title="c.name" @click="accentHue = c.hue"></button>
                </div>
                <div class="range-row" style="width:100%">
                  <input type="range" min="0" max="360" v-model.number="accentHue" class="range-input">
                  <span class="range-val">{{ accentHue }}°</span>
                </div>
              </div>
            </div>

            <!-- 背景 -->
            <div v-show="activeSection === 'background'" class="section-panel">
              <div class="setting-row"><span>背景动效</span><label class="toggle"><input type="checkbox" v-model="bgOrbs"><span class="toggle-track"></span></label></div>

              <h4 class="sub-heading">暗色背景</h4>
              <div class="setting-row setting-col"><span>图片 URL</span><input type="text" v-model="bgDarkImage" placeholder="https://..." class="text-input"></div>
              <div class="setting-row"><span>模糊</span><CustomSelect v-model="bgDarkBlur" :options="[{label:'无',value:'none'},{label:'sm',value:'sm'},{label:'md',value:'md'},{label:'lg',value:'lg'},{label:'xl',value:'xl'},{label:'2xl',value:'2xl'},{label:'3xl',value:'3xl'}]"/></div>
              <div class="setting-row"><span>饱和度</span><div class="range-row"><input type="range" min="0" max="200" v-model.number="bgDarkSaturate" class="range-input"><span class="range-val">{{ bgDarkSaturate }}</span></div></div>
              <div class="setting-row"><span>亮度</span><div class="range-row"><input type="range" min="0" max="200" v-model.number="bgDarkBrightness" class="range-input"><span class="range-val">{{ bgDarkBrightness }}</span></div></div>
              <div class="setting-row"><span>不透明度</span><div class="range-row"><input type="range" min="0" max="100" v-model.number="bgDarkOpacity" class="range-input"><span class="range-val">{{ bgDarkOpacity }}</span></div></div>
              <div class="setting-row"><span>恢复默认</span><button class="action-btn" @click="bgDarkBlur='md';bgDarkSaturate=50;bgDarkBrightness=50;bgDarkOpacity=50">重置暗色</button></div>

              <div class="setting-sep"></div>

              <h4 class="sub-heading">亮色背景</h4>
              <div class="setting-row setting-col"><span>图片 URL</span><input type="text" v-model="bgLightImage" placeholder="https://..." class="text-input"></div>
              <div class="setting-row"><span>模糊</span><CustomSelect v-model="bgLightBlur" :options="[{label:'无',value:'none'},{label:'sm',value:'sm'},{label:'md',value:'md'},{label:'lg',value:'lg'},{label:'xl',value:'xl'},{label:'2xl',value:'2xl'},{label:'3xl',value:'3xl'}]"/></div>
              <div class="setting-row"><span>饱和度</span><div class="range-row"><input type="range" min="0" max="200" v-model.number="bgLightSaturate" class="range-input"><span class="range-val">{{ bgLightSaturate }}</span></div></div>
              <div class="setting-row"><span>亮度</span><div class="range-row"><input type="range" min="0" max="200" v-model.number="bgLightBrightness" class="range-input"><span class="range-val">{{ bgLightBrightness }}</span></div></div>
              <div class="setting-row"><span>不透明度</span><div class="range-row"><input type="range" min="0" max="100" v-model.number="bgLightOpacity" class="range-input"><span class="range-val">{{ bgLightOpacity }}</span></div></div>
              <div class="setting-row"><span>恢复默认</span><button class="action-btn" @click="bgLightBlur='md';bgLightSaturate=50;bgLightBrightness=50;bgLightOpacity=50">重置亮色</button></div>
            </div>

            <!-- AI -->
            <div v-show="activeSection === 'ai'" class="section-panel">
              <p class="section-desc">使用 DeepSeek API 自动填写书签信息。输入网址后点击 AI 按钮即可补充名称、图标、描述和标签。</p>
              <div class="setting-row setting-col"><span>API Key</span><input type="password" v-model="aiApiKey" placeholder="sk-..." class="text-input"></div>
              <div class="setting-row setting-col"><span>接口地址</span><input type="text" v-model="aiEndpoint" placeholder="https://api.deepseek.com/v1/chat/completions" class="text-input"></div>
              <div class="setting-row setting-col"><span>模型</span><input type="text" v-model="aiModel" placeholder="deepseek-chat" class="text-input"></div>
            </div>

            <!-- GitHub -->
            <div v-show="activeSection === 'github'" class="section-panel">
              <p class="section-desc">Token 仅存储在浏览器本地，只发送到 GitHub API。</p>
              <div class="setting-row setting-col"><span>用户名</span><input type="text" v-model="ghUsername" placeholder="your-username" class="text-input"></div>
              <div class="setting-row setting-col"><span>仓库名</span><input type="text" v-model="ghRepo" placeholder="homepage-data" class="text-input"></div>
              <div class="setting-row setting-col"><span>分支</span><input type="text" v-model="ghBranch" placeholder="main" class="text-input"></div>
              <div class="setting-row setting-col"><span>Token</span><input type="password" v-model="ghToken" placeholder="ghp_..." class="text-input"></div>
              <div class="setting-sep"></div>
              <div class="setting-row">
                <button class="action-btn" :disabled="syncing" @click="handleSync">{{ syncing ? '同步中...' : '一键同步' }}</button>
                <button class="action-btn" :disabled="syncing" @click="handlePush">上传到 GitHub</button>
              </div>
              <p v-if="lastSync" class="sync-status">上次同步：{{ lastSync }}</p>
            </div>

            <!-- 搜索 -->
            <div v-show="activeSection === 'search'" class="section-panel">
              <div class="setting-row"><span>默认引擎</span><CustomSelect :model-value="defaultEngineKey" @update:model-value="v => onEngineChange({ target: { value: v } })" :options="engineList.map(e => ({ label: e.name, value: e.key }))" /></div>
              <div class="setting-row"><span>在新标签页打开</span><label class="toggle"><input type="checkbox" v-model="searchNewTab"><span class="toggle-track"></span></label></div>
            </div>

            <!-- 时钟 -->
            <div v-show="activeSection === 'clock'" class="section-panel">
              <div class="setting-row"><span>时间格式</span><CustomSelect v-model="clock24h" :options="[{label:'24 小时制',value:true},{label:'12 小时制',value:false}]"/></div>
              <div class="setting-row"><span>显示秒</span><label class="toggle"><input type="checkbox" v-model="showSeconds"><span class="toggle-track"></span></label></div>
              <div class="setting-row"><span>显示日期</span><label class="toggle"><input type="checkbox" v-model="showDate"><span class="toggle-track"></span></label></div>
              <div class="setting-row"><span>显示问候语</span><label class="toggle"><input type="checkbox" v-model="showGreeting"><span class="toggle-track"></span></label></div>
            </div>

            <!-- 书签 -->
            <div v-show="activeSection === 'bookmark'" class="section-panel">
              <div class="setting-row"><span>排序方式</span><CustomSelect v-model="bookmarkSort" :options="[{label:'按名称',value:'name'},{label:'按添加时间',value:'added'}]"/></div>
              <div class="setting-row"><span>点击在新标签页打开</span><label class="toggle"><input type="checkbox" v-model="clickNewTab"><span class="toggle-track"></span></label></div>
            </div>

            <!-- 分类排序 -->
            <div v-show="activeSection === 'categories'" class="section-panel">
              <p class="section-desc">拖拽或点击按钮调整分类顺序。未分类始终在末尾。</p>
              <div class="order-list">
                <div v-for="(cat, i) in safeCategoryOrder" :key="cat" class="order-item">
                  <span class="order-idx">{{ i + 1 }}</span>
                  <span class="order-name">{{ cat }}</span>
                  <div class="order-actions">
                    <button class="order-btn" :disabled="i === 0" @click="moveUp(i)" aria-label="上移">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>
                    </button>
                    <button class="order-btn" :disabled="i >= safeCategoryOrder.length - 1" @click="moveDown(i)" aria-label="下移">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                  </div>
                </div>
                <p v-if="safeCategoryOrder.length === 0" class="empty-hint">暂无分类</p>
              </div>
            </div>

            <!-- 数据 -->
            <div v-show="activeSection === 'data'" class="section-panel">
              <div class="setting-row"><button class="action-btn" @click="handleExport">导出书签</button><button class="action-btn" @click="handleImport">导入书签</button></div>
              <div class="setting-row"><button class="action-btn" @click="handleImportBookmarks">导入浏览器书签</button></div>
              <div class="setting-row"><button class="action-btn danger" @click="handleReset">恢复默认书签</button></div>
              <div class="setting-row"><button class="action-btn danger" @click="handleClearAll">清空所有数据</button></div>
              <input ref="fileInput" type="file" accept=".json" style="display:none" @change="onFileChange">
              <input ref="bookmarksFileInput" type="file" accept=".html,.htm" style="display:none" @change="onBookmarksFileChange">
            </div>

          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ---- Trigger button ---- */
.settings-btn {
  position: fixed;
  bottom: 20px;
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
.settings-btn:hover { border-color: var(--border-hover); color: var(--text); }
.settings-btn svg { width: 16px; height: 16px; }

/* ---- Modal overlay ---- */
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.settings-modal {
  background: oklch(0.17 0.01 260);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 640px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
[data-theme="light"] .settings-modal { background: #fff; }

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.settings-header h2 {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
}
.close-btn {
  width: 30px; height: 30px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
}
.close-btn:hover { border-color: var(--border-hover); color: var(--text); }

/* ---- Layout: sidebar + content ---- */
.settings-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.settings-nav {
  width: 140px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  width: 100%;
  padding: 9px 14px;
  border: none;
  border-radius: 8px;
  background: none;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}
.nav-item:hover { background: var(--surface-hover); color: var(--text); }
.nav-item.active { background: var(--surface-active); color: var(--accent); font-weight: 600; }

.settings-content {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 16px 20px;
}
.settings-content::-webkit-scrollbar { display: none; }

.section-panel {
  animation: panelIn 0.2s var(--ease-out);
}
@keyframes panelIn { from { opacity: 0; transform: translateX(6px); } }

/* ---- Setting rows ---- */
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 0;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
  color: var(--text);
  gap: 12px;
}
.setting-row:last-child { border-bottom: none; }

.setting-col { flex-direction: column; align-items: flex-start; gap: 6px; }
.text-input {
  width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
}
.text-input:focus { border-color: var(--accent); }
.text-input::placeholder { color: var(--text-tertiary); }
.range-row { display: flex; align-items: center; gap: 10px; min-width: 140px; }
.range-input { flex: 1; accent-color: var(--accent); height: 4px; cursor: pointer; }
.range-val { font-size: 12px; color: var(--text-tertiary); min-width: 28px; text-align: right; font-variant-numeric: tabular-nums; }

.section-desc { font-size: 12px; color: var(--text-tertiary); margin-bottom: 12px; line-height: 1.5; }
.sub-heading { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
.setting-sep { height: 1px; background: var(--border); margin: 12px 0; }
.sync-status { font-size: 11px; color: var(--text-tertiary); text-align: center; margin-top: 8px; }
.order-list { display: flex; flex-direction: column; gap: 4px; }
.order-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
}
.order-idx { font-size: 11px; color: var(--text-tertiary); min-width: 18px; text-align: center; font-variant-numeric: tabular-nums; }
.order-name { flex: 1; font-size: 14px; color: var(--text); }
.order-actions { display: flex; gap: 2px; }
.order-btn {
  width: 28px; height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
}
.order-btn:hover:not(:disabled) { background: var(--surface-hover); color: var(--accent); }
.order-btn:disabled { opacity: 0.3; cursor: default; }
.empty-hint { text-align: center; color: var(--text-tertiary); font-size: 13px; padding: 16px 0; }

.color-presets { display: flex; gap: 8px; flex-wrap: wrap; }
.color-swatch {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}
.color-swatch:hover { transform: scale(1.15); }
.color-swatch.active { border-color: var(--text); box-shadow: 0 0 0 2px var(--bg); }

/* ---- Toggle ---- */
.toggle { position: relative; display: inline-flex; cursor: pointer; }
.toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
.toggle-track {
  width: 40px; height: 22px;
  border-radius: 11px;
  background: var(--border);
  transition: background var(--duration-fast) var(--ease-out);
  position: relative;
}
.toggle-track::after {
  content: '';
  position: absolute;
  top: 3px; left: 3px;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform var(--duration-fast) var(--ease-out);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle input:checked + .toggle-track { background: var(--accent); }
.toggle input:checked + .toggle-track::after { transform: translateX(18px); }

/* ---- Buttons ---- */
.action-btn {
  padding: 7px 16px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}
.action-btn:hover { background: var(--surface-hover); }
.action-btn.danger { color: var(--danger); border-color: var(--danger); }
.action-btn.danger:hover { background: var(--danger); color: #fff; }

/* ---- Transitions ---- */
.modal-enter-active { transition: opacity 0.2s var(--ease-out); }
.modal-leave-active { transition: opacity 0.15s var(--ease-in-out); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .settings-modal { animation: modalSlideIn 0.25s var(--ease-out); }
.modal-leave-active .settings-modal { animation: modalSlideOut 0.15s var(--ease-in-out); }
@keyframes modalSlideIn { from { transform: translateY(16px) scale(0.97); opacity: 0; } }
@keyframes modalSlideOut { to { transform: translateY(8px) scale(0.98); opacity: 0; } }

@media (max-width: 540px) {
  .settings-overlay { padding: 12px; align-items: flex-end; }
  .settings-modal { max-height: 90vh; max-width: 100%; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
  .settings-layout { flex-direction: column; }
  .settings-nav {
    width: 100%;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid var(--border);
    padding: 6px 8px;
    overflow-x: auto;
  }
  .nav-item { white-space: nowrap; flex-shrink: 0; width: auto; padding: 7px 12px; font-size: 13px; }
  .settings-content { padding: 12px 16px; }
}
</style>

<script setup>
import { watch, nextTick, ref } from 'vue'
import { useBookmarks } from '../composables/useBookmarks.js'
import { useToast } from '../composables/useToast.js'
import { modal, useUI } from '../composables/useUI.js'
import { aiApiKey, aiModel, aiEndpoint } from '../composables/useSettings.js'
import CustomComboBox from './CustomComboBox.vue'

const { categories, addBookmark, updateBookmark, deleteBookmark, setCategory } = useBookmarks()
const { show: toast } = useToast()
const { closeModal } = useUI()

const nameRef = ref(null)
const tagInput = ref('')
const aiLoading = ref(false)

async function aiFill() {
  const url = modal.url.trim()
  if (!url) { toast('请先输入网址'); return }
  if (!aiApiKey.value) { toast('请先在设置中填写 AI API Key'); return }

  aiLoading.value = true
  try {
    const res = await fetch(aiEndpoint.value, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aiApiKey.value}` },
      body: JSON.stringify({
        model: aiModel.value,
        messages: [{
          role: 'user',
          content: `请根据网址 ${url} 提取网站信息，返回纯 JSON（不要 markdown 代码块）：
{
  "name": "网站名称（简短中文）",
  "icon": "网站 logo 或图标的图片 URL，如果找不到就留空字符串",
  "desc": "一句话描述（中文，10字以内）",
  "tags": ["标签1", "标签2"]
}`
        }],
        temperature: 0.3,
        max_tokens: 500
      })
    })
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    // Parse JSON from response (handle markdown code blocks)
    const json = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const info = JSON.parse(json)

    if (info.name && !modal.name) modal.name = info.name
    if (info.icon && !modal.icon) modal.icon = info.icon
    if (info.desc && !modal.desc) modal.desc = info.desc
    if (info.tags && Array.isArray(info.tags)) {
      for (const t of info.tags) {
        if (!modal.tags.includes(t)) modal.tags.push(t)
      }
    }
    toast('AI 已补充信息')
  } catch (e) {
    toast('AI 请求失败：' + (e.message || '未知错误'))
  } finally {
    aiLoading.value = false
  }
}

watch(() => modal.open, async (v) => {
  if (v) { await nextTick(); nameRef.value?.focus() }
})

function addTag() {
  const t = tagInput.value.trim()
  if (t && !modal.tags.includes(t)) {
    modal.tags.push(t)
  }
  tagInput.value = ''
}

function removeTag(idx) {
  modal.tags.splice(idx, 1)
}

function onTagKeydown(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  }
}

function save() {
  const cat = modal.category.trim() || '未分类'
  const name = modal.name.trim()
  let url = modal.url.trim()

  if (!name || !url) { toast('请填写名称和网址。'); return }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url
  try { new URL(url) } catch { toast('请输入有效的网址。'); return }

  const entry = { name, url }
  if (modal.icon.trim()) entry.icon = modal.icon.trim()
  if (modal.desc.trim()) entry.desc = modal.desc.trim()
  if (modal.tags.length > 0) entry.tags = [...modal.tags]

  if (modal.mode === 'edit') {
    updateBookmark(modal.editCat, modal.editIdx, cat, entry)
    toast('书签已更新。')
  } else {
    addBookmark(cat, entry)
    toast('书签已添加。')
  }
  setCategory(cat)
  closeModal()
}

function remove() {
  if (modal.mode !== 'edit') return
  deleteBookmark(modal.editCat, modal.editIdx)
  toast('书签已删除。')
  closeModal()
}
</script>

<template>
  <div class="modal-overlay" :class="{ open: modal.open }" @click.self="closeModal">
    <div class="modal">
      <h3>{{ modal.mode === 'edit' ? '编辑书签' : '添加书签' }}</h3>
      <div class="field">
        <label for="modalCategory">分类</label>
        <CustomComboBox v-model="modal.category" :options="categories" placeholder="留空则为「未分类」" />
      </div>
      <div class="field">
        <label for="modalName">名称</label>
        <input id="modalName" ref="nameRef" v-model="modal.name" type="text" placeholder="网站名称" autocomplete="off">
      </div>
      <div class="field">
        <label for="modalUrl">网址</label>
        <div class="url-row">
          <input id="modalUrl" v-model="modal.url" type="text" placeholder="https://..." autocomplete="off">
          <button class="btn-ai" :disabled="aiLoading" @click="aiFill" title="AI 自动补充">
            <svg v-if="!aiLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span v-else class="spinner"></span>
          </button>
        </div>
      </div>
      <div class="field">
        <label for="modalIcon">图标 URL（选填）</label>
        <input id="modalIcon" v-model="modal.icon" type="text" placeholder="留空则自动获取网站图标" autocomplete="off">
      </div>
      <div class="field">
        <label for="modalDesc">描述（选填）</label>
        <input id="modalDesc" v-model="modal.desc" type="text" placeholder="简短描述" autocomplete="off">
      </div>
      <div class="field">
        <label>标签</label>
        <div class="tag-list">
          <span v-for="(t, i) in modal.tags" :key="i" class="tag-pill">
            {{ t }}
            <button class="tag-remove" @click="removeTag(i)">&times;</button>
          </span>
          <input
            v-model="tagInput"
            type="text"
            class="tag-input"
            placeholder="输入后回车添加"
            @keydown="onTagKeydown"
            @blur="addTag"
          >
        </div>
      </div>
      <div class="modal-actions">
        <button v-if="modal.mode === 'edit'" class="btn btn-danger" style="margin-right:auto" @click="remove">删除</button>
        <button class="btn btn-secondary" @click="closeModal">取消</button>
        <button class="btn btn-primary" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all var(--duration-normal) var(--ease-out);
}
.modal-overlay.open { opacity: 1; visibility: visible; }
.modal {
  background: oklch(0.18 0.01 260);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px;
  width: 90%;
  max-width: 420px;
  box-shadow: var(--shadow-lg);
  transform: translateY(10px) scale(0.97);
  transition: transform var(--duration-normal) var(--ease-out);
}
[data-theme="light"] .modal { background: #fff; }
.modal-overlay.open .modal { transform: translateY(0) scale(1); }
.modal h3 {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text);
}
.field { margin-bottom: 16px; }
label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-family: var(--font-heading);
}
input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 15px;
  outline: none;
  transition: border-color var(--duration-fast) var(--ease-out);
}
input:focus { border-color: var(--accent); }
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 24px;
}
.btn {
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}
.btn-primary { background: var(--accent); border-color: var(--accent); color: #0b0d10; }
.btn-primary:hover { filter: brightness(1.1); }
.btn-secondary { background: var(--surface); color: var(--text); }
.btn-secondary:hover { background: var(--surface-hover); }
.btn-danger { background: transparent; border-color: var(--danger); color: var(--danger); }
.btn-danger:hover { background: var(--danger); color: #fff; }

.url-row { display: flex; gap: 8px; }
.url-row input { flex: 1; }
.btn-ai {
  width: 40px; height: 40px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--accent);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
}
.btn-ai:hover:not(:disabled) { background: var(--accent-glow); border-color: var(--accent); }
.btn-ai:disabled { opacity: 0.5; cursor: default; }
.spinner {
  width: 16px; height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--accent-glow);
  color: var(--accent);
  font-size: 12px;
  font-family: var(--font-body);
}
.tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0 1px;
  opacity: 0.6;
}
.tag-remove:hover { opacity: 1; }
.tag-input {
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
  min-width: 120px;
  flex: 1;
  padding: 2px 0;
}
.tag-input::placeholder { color: var(--text-tertiary); }

@media (max-width: 480px) { .modal { padding: 20px; } }
</style>

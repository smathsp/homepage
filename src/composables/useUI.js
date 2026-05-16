import { reactive, ref } from 'vue'

export const modal = reactive({
  open: false,
  mode: 'add',
  category: '',
  name: '',
  url: '',
  icon: '',
  desc: '',
  tags: [],
  editCat: '',
  editIdx: -1
})

export const ctxMenu = reactive({
  open: false,
  x: 0,
  y: 0,
  category: '',
  index: -1,
  url: ''
})

const CARD_SIZE_KEY = 'homepage-card-size'
const ANIM_KEY = 'homepage-animations'

export const cardSize = ref(localStorage.getItem(CARD_SIZE_KEY) || 'normal')
export const animations = ref(localStorage.getItem(ANIM_KEY) || 'full')

function setCardSize(v) {
  cardSize.value = v
  localStorage.setItem(CARD_SIZE_KEY, v)
  document.documentElement.setAttribute('data-card-size', v)
}

function setAnimations(v) {
  animations.value = v
  localStorage.setItem(ANIM_KEY, v)
  document.documentElement.setAttribute('data-animations', v)
}

// Initialize
document.documentElement.setAttribute('data-card-size', cardSize.value)
document.documentElement.setAttribute('data-animations', animations.value)

export function useUI() {
  function openAddModal(category) {
    modal.mode = 'add'
    modal.category = category || ''
    modal.name = ''
    modal.url = ''
    modal.icon = ''
    modal.desc = ''
    modal.tags = []
    modal.editCat = ''
    modal.editIdx = -1
    modal.open = true
  }

  function openEditModal(category, index, bm) {
    modal.mode = 'edit'
    modal.category = category
    modal.name = bm.name
    modal.url = bm.url
    modal.icon = bm.icon || ''
    modal.desc = bm.desc || ''
    modal.tags = [...(bm.tags || [])]
    modal.editCat = category
    modal.editIdx = index
    modal.open = true
  }

  function closeModal() {
    modal.open = false
  }

  function showContextMenu(x, y, category, index, url) {
    ctxMenu.x = Math.min(x, window.innerWidth - 160)
    ctxMenu.y = Math.min(y, window.innerHeight - 130)
    ctxMenu.category = category
    ctxMenu.index = index
    ctxMenu.url = url
    ctxMenu.open = true
  }

  function hideContextMenu() {
    ctxMenu.open = false
  }

  return {
    openAddModal,
    openEditModal,
    closeModal,
    showContextMenu,
    hideContextMenu,
    setCardSize,
    setAnimations
  }
}

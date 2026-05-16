import { ref } from 'vue'

const message = ref('')
const visible = ref(false)
let timer = null

export function useToast() {
  function show(msg, duration = 2000) {
    clearTimeout(timer)
    message.value = msg
    visible.value = true
    timer = setTimeout(() => { visible.value = false }, duration)
  }

  return { message, visible, show }
}

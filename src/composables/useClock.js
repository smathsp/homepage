import { ref, onMounted, onUnmounted } from 'vue'
import { clock24h } from './useSettings.js'

const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

export function useClock() {
  const time = ref('00:00')
  const seconds = ref('00')
  const date = ref('')
  const greeting = ref('')

  let timer = null

  function pad(n) { return String(n).padStart(2, '0') }

  function update() {
    const now = new Date()
    let h = now.getHours()
    const m = pad(now.getMinutes())
    const s = pad(now.getSeconds())

    if (clock24h.value) {
      time.value = `${pad(h)}:${m}`
    } else {
      const ampm = h >= 12 ? 'PM' : 'AM'
      const h12 = h % 12 || 12
      time.value = `${h12}:${m} ${ampm}`
    }
    seconds.value = s
    date.value = `${now.getFullYear()}年 ${months[now.getMonth()]}${now.getDate()}日 ${days[now.getDay()]}`

    const hour = now.getHours()
    if (hour >= 5 && hour < 12) greeting.value = '早上好'
    else if (hour >= 12 && hour < 17) greeting.value = '下午好'
    else if (hour >= 17 && hour < 22) greeting.value = '晚上好'
    else greeting.value = '夜深了，晚安'
  }

  onMounted(() => {
    update()
    timer = setInterval(update, 1000)
  })

  onUnmounted(() => {
    clearInterval(timer)
  })

  return { time, seconds, date, greeting }
}

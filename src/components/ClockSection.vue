<script setup>
import { useClock } from '../composables/useClock.js'
import { showSeconds, showDate, showGreeting } from '../composables/useSettings.js'

const { time, seconds, date, greeting } = useClock()
</script>

<template>
  <section class="clock-section">
    <div class="time">
      {{ time }}<span v-if="showSeconds" class="seconds">:{{ seconds }}</span>
    </div>
    <div v-if="showDate" class="date">{{ date }}</div>
    <div v-if="showGreeting" class="greeting">{{ greeting }}</div>
  </section>
</template>

<style scoped>
.clock-section { text-align: center; margin-top: 20px; }
.time {
  font-family: var(--font-heading);
  font-size: clamp(48px, 8vw, 80px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--text);
  font-variant-numeric: tabular-nums;
  transition: color var(--duration-slow) var(--ease-out);
}
.time .seconds {
  font-size: 0.45em;
  font-weight: 500;
  color: var(--text-tertiary);
  letter-spacing: 0;
}
.date {
  font-family: var(--font-body);
  font-size: clamp(16px, 2vw, 20px);
  font-weight: 400;
  color: var(--text-secondary);
  margin-top: 6px;
  transition: color var(--duration-slow) var(--ease-out);
}
.greeting {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-tertiary);
  letter-spacing: 0.04em;
  margin-top: 4px;
  transition: color var(--duration-slow) var(--ease-out);
}
@media (max-width: 480px) { .time { font-size: 44px; } }
</style>

<template>
  <div class="screen-shell">
    <header class="screen-top">
      <div class="title-wrap">
        <span class="title-mark"></span>
        <span class="title-text">对外服务监控屏</span>
      </div>
      <div class="clock">{{ nowText }}</div>
    </header>
    <main class="screen-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(Date.now())
let timer

const pad2 = (n) => String(n).padStart(2, '0')

const nowText = computed(() => {
  const d = new Date(now.value)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
})

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})
</script>

<style scoped>
.screen-shell {
  min-height: 100vh;
  background:
    radial-gradient(1200px 520px at 50% -18%, rgba(30, 82, 146, 0.34), rgba(3, 9, 18, 0) 62%),
    linear-gradient(180deg, #040b16 0%, #020711 100%);
  color: #d5ebff;
}

.screen-shell::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: linear-gradient(180deg, rgba(61, 120, 190, 0.09) 0, rgba(61, 120, 190, 0.09) 1px, transparent 1px, transparent 100%);
  background-size: 100% 3px;
  pointer-events: none;
  opacity: 0.15;
}

.screen-top {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border-bottom: 1px solid rgba(49, 106, 172, 0.35);
  background: linear-gradient(180deg, rgba(3, 13, 26, 0.94), rgba(2, 9, 18, 0.86));
  box-shadow: inset 0 -1px 0 rgba(20, 56, 99, 0.55);
}

.title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.title-mark {
  width: 10px;
  height: 18px;
  border-radius: 2px;
  background: linear-gradient(180deg, #6ed6ff 0%, #2393d8 100%);
  box-shadow: 0 0 8px rgba(78, 195, 255, 0.6);
}

.title-text {
  font-size: 17px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 1px;
  color: #dff3ff;
  text-shadow: 0 0 10px rgba(88, 193, 255, 0.25);
}

.clock {
  font-size: 12px;
  color: rgba(208, 232, 255, 0.88);
  letter-spacing: 0.5px;
}

.screen-content {
  height: calc(100vh - 48px);
  padding: 8px;
}
</style>

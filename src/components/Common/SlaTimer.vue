<template>
  <span :class="cls">{{ display }}</span>
</template>
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
const props = defineProps({ seconds: { type: Number, default: 0 } })
const left = ref(props.seconds)
let timer
const tick = () => {
  left.value = Math.max(0, left.value - 1)
}
onMounted(() => {
  timer = setInterval(tick, 1000)
})
onBeforeUnmount(() => timer && clearInterval(timer))
const display = computed(() => {
  const s = left.value
  const h = Math.floor(s / 3600).toString().padStart(2, '0')
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${h}:${m}:${sec}`
})
const cls = computed(() => {
  if (left.value === 0) return 'sla danger'
  if (left.value < 1800) return 'sla warning'
  return 'sla ok'
})
</script>
<style scoped>
.sla {
  font-variant-numeric: tabular-nums;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
}
.ok { background: rgba(16,185,129,0.12); color: #10b981; }
.warning { background: rgba(245,158,11,0.15); color: #d97706; }
.danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
</style>

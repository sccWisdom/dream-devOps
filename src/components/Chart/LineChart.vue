<template>
  <BaseChart :options="opt" :height="height" />
</template>
<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
const props = defineProps({
  data: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  height: { type: String, default: '280px' }
})
const opt = computed(() => ({
  title: { text: props.title, textStyle: { fontSize: 12, fontWeight: 600 } },
  tooltip: { trigger: 'axis' },
  grid: { left: 30, right: 10, top: 30, bottom: 20 },
  xAxis: { type: 'category', data: props.data.map(i => i.name), boundaryGap: false },
  yAxis: { type: 'value' },
  series: [
    { type: 'line', data: props.data.map(i => i.value), areaStyle: { opacity: 0.18 }, smooth: true, lineStyle: { width: 2 } }
  ]
}))
</script>
<style scoped>
</style>

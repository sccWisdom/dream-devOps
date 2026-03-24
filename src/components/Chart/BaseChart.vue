<template>
  <div ref="el" :style="{ width, height }"></div>
</template>

<script setup>
import * as echarts from 'echarts'
import { defineExpose, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { currentTheme } from '@/utils/echarts-theme'

const props = defineProps({
  options: { type: Object, required: true },
  width: { type: String, default: '100%' },
  height: { type: String, default: '300px' }
})

const el = ref(null)
let chart
let themeObserver
let sizeObserver

const resize = () => {
  if (chart) chart.resize()
}

const ensureChart = () => {
  if (!el.value) return
  if (!chart) chart = echarts.init(el.value, currentTheme())
}

const render = async () => {
  if (!el.value) return
  await nextTick()
  ensureChart()
  chart.setOption(props.options, { notMerge: true, lazyUpdate: true })
  resize()
}

const getChart = () => chart
defineExpose({ getChart })

onMounted(() => {
  render()

  window.addEventListener('resize', resize)

  if (el.value) {
    sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(el.value)
  }

  themeObserver = new MutationObserver(() => {
    if (!el.value || !chart) return
    const option = chart.getOption()
    chart.dispose()
    chart = echarts.init(el.value, currentTheme())
    chart.setOption(option, { notMerge: true, lazyUpdate: true })
    resize()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

watch(() => props.options, render, { deep: true })
watch(() => [props.width, props.height], resize)

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  if (themeObserver) themeObserver.disconnect()
  if (sizeObserver) sizeObserver.disconnect()
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<style scoped>
</style>

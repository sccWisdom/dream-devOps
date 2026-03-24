import * as echarts from 'echarts'

const light = {
  color: ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#14b8a6'],
  textStyle: { color: '#334155' },
  grid: { containLabel: true },
  axisPointer: { lineStyle: { color: '#94a3b8' } },
  categoryAxis: {
    axisLine: { lineStyle: { color: '#cbd5e1' } },
    axisLabel: { color: '#475569' },
    splitLine: { show: false }
  },
  valueAxis: {
    axisLine: { show: false },
    axisLabel: { color: '#64748b' },
    splitLine: { lineStyle: { color: '#e2e8f0' } }
  }
}
const dark = {
  color: ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#2dd4bf'],
  textStyle: { color: '#e5e7eb' },
  grid: { containLabel: true },
  axisPointer: { lineStyle: { color: '#64748b' } },
  categoryAxis: {
    axisLine: { lineStyle: { color: '#334155' } },
    axisLabel: { color: '#94a3b8' },
    splitLine: { show: false }
  },
  valueAxis: {
    axisLine: { show: false },
    axisLabel: { color: '#9ca3af' },
    splitLine: { lineStyle: { color: '#1f2937' } }
  }
}

echarts.registerTheme('ops-light', light)
echarts.registerTheme('ops-dark', dark)

export function currentTheme() {
  const isDark = document.documentElement.classList.contains('dark')
  return isDark ? 'ops-dark' : 'ops-light'
}

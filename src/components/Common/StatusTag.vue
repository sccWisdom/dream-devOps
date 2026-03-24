<template>
  <el-tag :type="type" effect="light">{{ label }}</el-tag>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ status: { type: String, default: '' } })
const map = {
  '待接单': { type: 'warning', label: '待接单' },
  '处理中': { type: 'info', label: '处理中' },
  '已升级': { type: 'danger', label: '已升级' },
  '已解决': { type: 'success', label: '已解决' },
  '审批中': { type: 'warning', label: '审批中' },
  '实施中': { type: 'info', label: '实施中' },
  '发布完成': { type: 'success', label: '发布完成' },
  '已转问题': { type: 'danger', label: '已转问题' },
  '已转变更': { type: 'info', label: '已转变更' },
  '已转发布': { type: 'success', label: '已转发布' },
  '已转事件': { type: 'warning', label: '已转事件' },
  '分析中': { type: 'info', label: '分析中' },
  '待方案评审': { type: 'warning', label: '待方案评审' },
  '验证中': { type: 'info', label: '验证中' },
  '发布中': { type: 'info', label: '发布中' },
  '已完成': { type: 'success', label: '已完成' },
  '挂起': { type: 'info', label: '挂起' },
  '已恢复': { type: 'success', label: '已恢复' }
}
const conf = computed(() => map[props.status] || { type: 'primary', label: props.status || '—' })
const type = computed(() => conf.value.type)
const label = computed(() => conf.value.label)
</script>
<style scoped>
</style>

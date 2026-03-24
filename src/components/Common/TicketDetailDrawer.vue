<template>
  <el-drawer :model-value="modelValue" :title="title" :size="size" @close="$emit('update:modelValue', false)">
    <StepFlow v-if="steps && steps.length" :active="active" :steps="steps" style="margin-bottom:12px"/>
    <slot />
    <div style="margin-top:12px">
      <slot name="actions" />
    </div>
  </el-drawer>
</template>
<script setup>
import StepFlow from './StepFlow.vue'
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '详情' },
  size: { type: String, default: '50%' },
  steps: { type: Array, default: () => [] },
  active: { type: Number, default: 0 }
})
defineEmits(['update:modelValue'])
</script>
<style scoped>
</style>

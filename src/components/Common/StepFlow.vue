<template>
  <el-steps :active="active" finish-status="success" align-center>
    <el-step v-for="(s,i) in steps" :key="i" :title="s.title" :description="s.desc" />
  </el-steps>
</template>
<script setup>
defineProps({ active: { type: Number, default: 0 }, steps: { type: Array, default: () => [] } })
</script>
<style scoped>
</style>

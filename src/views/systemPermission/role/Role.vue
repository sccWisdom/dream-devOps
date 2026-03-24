<template>
  <div class="container">
    <div class="page-title">角色管理</div>
    <el-table :data="list" border>
      <el-table-column prop="name" label="角色名称" />
      <el-table-column prop="desc" label="说明" />
      <el-table-column prop="count" label="成员数" width="100"/>
    </el-table>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { getRoles } from '../../../mock-data/modules/system'
const list = ref([])
onMounted(async () => {
  list.value = await getRoles()
})
</script>
<style scoped>
</style>

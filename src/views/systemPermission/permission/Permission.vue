<template>
  <div class="container">
    <div class="page-title">权限管理</div>
    <el-table :data="list" border>
      <el-table-column prop="name" label="权限点" />
      <el-table-column prop="scope" label="范围" width="140"/>
      <el-table-column prop="desc" label="说明" />
    </el-table>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { getPermissions } from '../../../mock-data/modules/system'
const list = ref([])
onMounted(async () => {
  list.value = await getPermissions()
})
</script>
<style scoped>
</style>

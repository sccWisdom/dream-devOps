<template>
  <div class="container">
    <div class="page-title">用户管理</div>
    <el-table :data="list" border>
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="dept" label="部门" width="140"/>
      <el-table-column prop="role" label="角色" width="140"/>
      <el-table-column prop="status" label="状态" width="100"/>
    </el-table>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { getUsers } from '../../../mock-data/modules/system'
const list = ref([])
onMounted(async () => {
  list.value = await getUsers()
})
</script>
<style scoped>
</style>

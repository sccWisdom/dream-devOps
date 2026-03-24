<template>
  <div class="container">
    <div class="page-title">监控告警</div>
    <el-row :gutter="16">
      <el-col :span="16">
        <el-table :data="list" border>
          <el-table-column prop="time" label="时间" width="160"/>
          <el-table-column prop="source" label="来源" width="120"/>
          <el-table-column prop="title" label="告警内容"/>
          <el-table-column prop="level" label="级别" width="80"/>
          <el-table-column prop="status" label="状态" width="100"/>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" type="success" @click="heal(row)">自愈</el-button>
              <el-button size="small" @click="toIncident(row)">转事件</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="panel" style="margin-bottom: 16px">
          <LineChart :data="trend" title="近24h 告警趋势" height="260px"/>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAlarms, getAlarmTrend } from '@/mock-data/modules/alarm'
import LineChart from '@/components/Chart/LineChart.vue'
const list = ref([])
const trend = ref([])
onMounted(async () => {
  list.value = await getAlarms()
  trend.value = await getAlarmTrend()
})
const heal = (row) => {
  row.status = '已恢复'
  ElMessage.success('已执行自愈动作')
}
const toIncident = (row) => {
  row.status = '已关联事件'
  ElMessage.success('已转事件并派发')
}
</script>
<style scoped>
</style>

<template>
  <div class="container">
    <div class="page-title">日志管理</div>
    <QueryBar>
      <template #default>
        <el-form inline>
          <el-form-item label="系统">
            <el-select v-model="query.system" placeholder="全部" style="width: 160px">
              <el-option label="全部" value=""/>
              <el-option label="政务门户" value="政务门户"/>
              <el-option label="数据交换平台" value="数据交换平台"/>
            </el-select>
          </el-form-item>
          <el-form-item label="级别">
            <el-select v-model="query.level" placeholder="全部" style="width: 140px">
              <el-option label="全部" value=""/>
              <el-option label="ERROR" value="ERROR"/>
              <el-option label="WARN" value="WARN"/>
              <el-option label="INFO" value="INFO"/>
            </el-select>
          </el-form-item>
          <el-form-item label="时间">
            <el-date-picker v-model="query.range" type="datetimerange" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD HH:mm:ss"/>
          </el-form-item>
        </el-form>
      </template>
      <template #ops>
        <el-button @click="reset">重置</el-button>
        <el-button type="primary" @click="load">查询</el-button>
        <el-button @click="exportResult">导出</el-button>
      </template>
    </QueryBar>
    <el-row :gutter="16">
      <el-col :span="16">
        <el-table :data="list" border>
          <el-table-column prop="time" label="时间" width="160"/>
          <el-table-column prop="system" label="系统" width="140"/>
          <el-table-column prop="level" label="级别" width="80"/>
          <el-table-column prop="message" label="内容"/>
        </el-table>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" style="margin-bottom: 16px">
          <LineChart :data="trend" title="错误日志趋势" height="260px"/>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { getLogs, getLogTrend } from '@/mock-data/modules/log'
import LineChart from '@/components/Chart/LineChart.vue'
import QueryBar from '@/components/Common/QueryBar.vue'
const query = ref({ system: '', level: '', range: null })
const list = ref([])
const trend = ref([])
const load = async () => {
  list.value = await getLogs(query.value)
  trend.value = await getLogTrend()
}
const reset = () => { query.value = { system: '', level: '', range: null }; load() }
const exportResult = () => {
  const blob = new Blob([JSON.stringify(list.value, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'logs.json'
  a.click()
}
onMounted(load)
</script>
<style scoped>
</style>

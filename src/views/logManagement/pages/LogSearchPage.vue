<template>
  <div class="container">
    <div class="page-title">日志检索查询</div>
    <QueryBar>
      <template #default>
        <el-form inline>
          <el-form-item label="业务系统">
            <el-select v-model="query.system" placeholder="全部" style="width: 180px">
              <el-option label="全部" value=""/>
              <el-option label="政务门户" value="政务门户"/>
              <el-option label="数据交换平台" value="数据交换平台"/>
              <el-option label="智能审批系统" value="智能审批系统"/>
            </el-select>
          </el-form-item>
          <el-form-item label="日志类型">
            <el-select v-model="query.type" placeholder="全部" style="width: 140px">
              <el-option label="全部" value=""/>
              <el-option label="系统日志" value="system"/>
              <el-option label="应用日志" value="application"/>
              <el-option label="访问日志" value="access"/>
              <el-option label="错误日志" value="error"/>
            </el-select>
          </el-form-item>
          <el-form-item label="日志级别">
            <el-select v-model="query.level" placeholder="全部" style="width: 120px">
              <el-option label="全部" value=""/>
              <el-option label="ERROR" value="ERROR"/>
              <el-option label="WARN" value="WARN"/>
              <el-option label="INFO" value="INFO"/>
              <el-option label="DEBUG" value="DEBUG"/>
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker v-model="query.range" type="datetimerange" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD HH:mm:ss"/>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="query.keyword" placeholder="输入关键词" style="width: 200px"/>
          </el-form-item>
        </el-form>
      </template>
      <template #ops>
        <el-button @click="reset">重置</el-button>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="exportResult">导出</el-button>
      </template>
    </QueryBar>
    <el-table :data="logs" border style="margin-top: 16px">
      <el-table-column prop="time" label="时间" width="180"/>
      <el-table-column prop="system" label="业务系统" width="140"/>
      <el-table-column prop="type" label="日志类型" width="120"/>
      <el-table-column prop="level" label="级别" width="80">
        <template #default="scope">
          <el-tag :type="getLevelType(scope.row.level)">{{ scope.row.level }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="日志内容"/>
      <el-table-column prop="source" label="来源" width="120"/>
    </el-table>
    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      style="margin-top: 16px; text-align: right"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { getLogs } from '@/mock-data/modules/log'
import QueryBar from '@/components/Common/QueryBar.vue'

const query = ref({
  system: '',
  type: '',
  level: '',
  range: null,
  keyword: ''
})

const logs = ref([])
const pagination = ref({
  current: 1,
  size: 20,
  total: 0
})

const getLevelType = (level) => {
  const typeMap = {
    ERROR: 'danger',
    WARN: 'warning',
    INFO: 'info',
    DEBUG: 'success'
  }
  return typeMap[level] || 'default'
}

const search = async () => {
  const result = await getLogs({
    ...query.value,
    page: pagination.value.current,
    size: pagination.value.size
  })
  logs.value = result.list || []
  pagination.value.total = result.total || 0
}

const reset = () => {
  query.value = {
    system: '',
    type: '',
    level: '',
    range: null,
    keyword: ''
  }
  pagination.value.current = 1
  search()
}

const exportResult = () => {
  const blob = new Blob([JSON.stringify(logs.value, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'logs.json'
  a.click()
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  search()
}

const handleCurrentChange = (current) => {
  pagination.value.current = current
  search()
}

onMounted(search)
</script>
<style scoped>
.container {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}
</style>
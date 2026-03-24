<template>
  <div class="error-log-board">
    <div class="trend-section">
      <el-card shadow="never" class="card">
        <template #header>
          <div class="card-header">
            <div class="card-title-section">
              <div class="card-title">错误日志趋势</div>
              <div class="card-desc">小时级趋势对比与异常峰值标注</div>
            </div>
            <div class="card-actions">
              <el-select v-model="trendFilter.timeRange" style="width: 140px">
                <el-option label="今日" value="today" />
                <el-option label="昨日" value="yesterday" />
                <el-option label="近7天" value="7d" />
              </el-select>
            </div>
          </div>
        </template>
        <div class="trend-content">
          <div id="trendChart" class="trend-chart"></div>
          <div class="trend-note">
            异常规则：某小时错误量超过上一小时的 2 倍或低于 0.5 倍时自动标注
          </div>
        </div>
      </el-card>
    </div>

    <div class="latest-section">
      <el-card shadow="never" class="card">
        <template #header>
          <div class="card-header">
            <div class="card-title-section">
              <div class="card-title">最新错误日志</div>
              <div class="card-desc">实时追踪最新错误，快速定位与处置</div>
            </div>
            <div class="card-actions">
              <el-select v-model="latestFilter.system" placeholder="选择应用子系统" style="width: 160px">
                <el-option label="全部" value="" />
                <el-option v-for="item in subsystemOptions" :key="item" :label="item" :value="item" />
              </el-select>
              <el-select v-model="latestFilter.refreshInterval" style="width: 140px">
                <el-option label="5分钟" value="5" />
                <el-option label="10分钟" value="10" />
                <el-option label="30分钟" value="30" />
              </el-select>
              <el-switch v-model="latestFilter.autoRefresh" active-text="自动刷新" @change="toggleAutoRefresh" />
              <el-button @click="refreshLatest">
                <el-icon><Refresh /></el-icon>
                手动刷新
              </el-button>
            </div>
          </div>
        </template>

        <div class="table-container">
          <el-table :data="pagedLatestLogs" border stripe style="width: 100%">
            <el-table-column prop="time" label="日志时间" width="180" />
            <el-table-column prop="system" label="应用子系统" width="160" />
            <el-table-column prop="source" label="日志来源" width="160" />
            <el-table-column prop="summary" label="错误内容摘要" min-width="240" show-overflow-tooltip />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click="openLogDetail(scope.row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <span class="count-info">共 {{ latestLogsFiltered.length }} 条记录</span>
            <el-pagination
              v-model:current-page="latestPagination.current"
              v-model:page-size="latestPagination.size"
              :page-sizes="[6, 10, 20]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="latestLogsFiltered.length"
              @size-change="handleLatestSizeChange"
              @current-change="handleLatestCurrentChange"
            />
          </div>
        </div>
      </el-card>
    </div>

    <el-drawer v-model="detailDrawerVisible" title="错误日志详情" size="45%">
      <div class="detail-container">
        <div class="detail-header">
          <div class="detail-row"><span class="label">日志时间</span><span class="value">{{ activeLog?.time }}</span></div>
          <div class="detail-row"><span class="label">应用子系统</span><span class="value">{{ activeLog?.system }}</span></div>
          <div class="detail-row"><span class="label">日志来源</span><span class="value">{{ activeLog?.source }}</span></div>
          <div class="detail-row"><span class="label">错误摘要</span><span class="value">{{ activeLog?.summary }}</span></div>
        </div>
        <div class="detail-body">
          <div class="body-title">完整日志</div>
          <pre class="log-content">{{ activeLog?.detail }}</pre>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount, computed, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const subsystemOptions = [
  '数据开发子系统',
  '数据质量子系统',
  '数据归集子系统',
  '数据支撑子系统',
  '长三角共享交换平台',
  '日志审计子系统'
]

const globalFilter = ref({
  systems: [],
  timeRange: 'today',
  keyword: ''
})

const latestFilter = ref({
  system: '',
  refreshInterval: '5',
  autoRefresh: true
})

const trendFilter = ref({
  systems: [],
  timeRange: 'today'
})

const getHoursByTimeRange = () => {
  const now = new Date()
  const currentHour = now.getHours()
  
  switch (trendFilter.value.timeRange) {
    case 'today':
      // 今日只显示到当前小时
      return Array.from({ length: currentHour + 1 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
    case 'yesterday':
      // 昨日显示完整24小时
      return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
    case '7d':
      // 近7天显示每天的日期
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - 6 + i)
        return `${date.getMonth() + 1}/${date.getDate()}`
      })
    default:
      return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  }
}

const getTrendDataByTimeRange = (system) => {
  const baseData = trendRaw.value[system] || []
  const now = new Date()
  const currentHour = now.getHours()
  
  switch (trendFilter.value.timeRange) {
    case 'today':
      // 今日只显示到当前小时的数据
      return baseData.slice(0, currentHour + 1)
    case 'yesterday':
      // 昨日显示完整24小时数据
      return baseData
    case '7d':
      // 近7天为每个子系统生成不同的趋势数据
      const sevenDayData = {
        '数据开发子系统': [120, 95, 88, 105, 110, 90, 115],
        '数据质量子系统': [80, 75, 68, 75, 85, 70, 90],
        '数据归集子系统': [40, 35, 30, 45, 50, 40, 55],
        '数据支撑子系统': [60, 55, 50, 65, 70, 55, 75],
        '长三角共享交换平台': [50, 45, 40, 55, 60, 45, 65],
        '日志审计子系统': [30, 25, 20, 35, 40, 25, 45]
      }
      return sevenDayData[system] || [100, 90, 80, 95, 105, 85, 100]
    default:
      return baseData
  }
}

const trendRaw = ref({
  '数据开发子系统': [12, 10, 8, 6, 5, 6, 9, 15, 18, 26, 24, 20, 22, 28, 55, 30, 24, 20, 18, 16, 14, 12, 11, 10],
  '数据质量子系统': [6, 4, 4, 3, 2, 3, 5, 7, 12, 13, 16, 14, 12, 18, 20, 15, 12, 10, 9, 8, 7, 6, 5, 4],
  '数据归集子系统': [3, 2, 2, 1, 1, 2, 4, 6, 9, 10, 12, 11, 10, 12, 14, 16, 14, 12, 10, 9, 8, 7, 6, 5],
  '数据支撑子系统': [5, 4, 4, 3, 3, 4, 6, 8, 10, 12, 14, 13, 12, 15, 18, 20, 18, 16, 14, 12, 10, 9, 8, 7],
  '长三角共享交换平台': [4, 3, 3, 2, 2, 3, 5, 7, 9, 11, 13, 12, 10, 13, 15, 17, 15, 13, 11, 9, 8, 7, 6, 5],
  '日志审计子系统': [2, 2, 1, 1, 1, 1, 2, 3, 5, 6, 5, 4, 4, 5, 6, 7, 8, 6, 5, 4, 4, 3, 3, 2]
})

const latestLogs = ref([
  {
    time: '2026-03-20 09:58:12',
    system: '数据开发子系统',
    source: '172.16.12.36',
    summary: '用户鉴权失败，token 已过期',
    detail: '[ERROR] AuthService - token expired for user=U10293, traceId=8c9f2f...'
  },
  {
    time: '2026-03-20 09:57:41',
    system: '数据质量子系统',
    source: '172.51.240.69',
    summary: 'CAS 连接超时，认证接口耗时 3500ms',
    detail: '[ERROR] CASConnector - timeout after 3500ms, endpoint=/cas/validate'
  },
  {
    time: '2026-03-20 09:56:05',
    system: '数据归集子系统',
    source: '10.2.18.9',
    summary: '消息队列堆积，消费延迟 12min',
    detail: '[ERROR] MQConsumer - lag=720s, queue=data-sync, partition=3'
  },
  {
    time: '2026-03-20 09:55:18',
    system: '数据支撑子系统',
    source: '172.51.151.82',
    summary: '网关返回 502，疑似上游服务不可用',
    detail: '[ERROR] Gateway - 502 Bad Gateway, upstream=service-user, reqId=1abf...'
  },
  {
    time: '2026-03-20 09:54:42',
    system: '日志审计子系统',
    source: '172.15.67.73',
    summary: '日志写入失败，ES 拒绝服务',
    detail: '[ERROR] AuditWriter - ES rejected request, status=429'
  },
  {
    time: '2026-03-20 09:54:01',
    system: '长三角共享交换平台',
    source: '172.51.151.88',
    summary: '上传接口报错，文件解析失败',
    detail: '[ERROR] UploadService - parse failed, fileId=F20260320095401'
  },
  {
    time: '2026-03-20 09:53:10',
    system: '数据开发子系统',
    source: '10.2.18.9',
    summary: 'Kafka 连接断开，正在重试',
    detail: '[ERROR] KafkaClient - connection lost, retrying...'
  },
  {
    time: '2026-03-20 09:52:38',
    system: '数据质量子系统',
    source: '172.51.240.69',
    summary: '接口错误率 5.2%，超过阈值',
    detail: '[ERROR] GatewayMonitor - errorRate=5.2%, threshold=3%'
  }
])

const latestPagination = ref({ current: 1, size: 6 })
const detailDrawerVisible = ref(false)
const activeLog = ref(null)

const latestLogsFiltered = computed(() => {
  if (!latestFilter.value.system) return latestLogs.value
  return latestLogs.value.filter(item => item.system === latestFilter.value.system)
})

const pagedLatestLogs = computed(() => {
  const start = (latestPagination.value.current - 1) * latestPagination.value.size
  return latestLogsFiltered.value.slice(start, start + latestPagination.value.size)
})

let chartInstance
let refreshTimer

const buildSeries = () => {
  // 总是显示所有子系统的趋势
  const hoursData = getHoursByTimeRange()
  return subsystemOptions.map((name) => {
    const data = getTrendDataByTimeRange(name)
    const markPointData = []
    data.forEach((val, idx) => {
      if (idx === 0) return
      const prev = data[idx - 1] || 1
      if (val >= prev * 2 || val <= prev * 0.5) {
        markPointData.push({
          coord: [hoursData[idx], val],
          value: val,
          symbol: val >= prev * 2 ? 'triangle' : 'rect',
          symbolSize: 10
        })
      }
    })

    return {
      name,
      type: 'line',
      smooth: true,
      data: data,
      markPoint: {
        data: markPointData
      }
    }
  })
}

const renderChart = () => {
  if (!chartInstance) {
    const chartDom = document.getElementById('trendChart')
    if (!chartDom) return
    chartInstance = echarts.init(chartDom)
  }

  const hoursData = getHoursByTimeRange()

  chartInstance.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '3%',
      top: '8%',
      bottom: '8%',
      containLabel: true
    },
    legend: {
      top: 0
    },
    xAxis: {
      type: 'category',
      data: hoursData
    },
    yAxis: {
      type: 'value',
      name: '错误数'
    },
    series: buildSeries()
  })
}

const applyGlobalFilter = () => {
  trendFilter.value.timeRange = globalFilter.value.timeRange
  renderChart()
}

const refreshAll = () => {
  refreshLatest()
  renderChart()
}

const refreshLatest = () => {
  latestPagination.value.current = 1
}

const openLogDetail = (row) => {
  activeLog.value = row
  detailDrawerVisible.value = true
}

const handleLatestSizeChange = (size) => {
  latestPagination.value.size = size
  latestPagination.value.current = 1
}

const handleLatestCurrentChange = (page) => {
  latestPagination.value.current = page
}

const toggleAutoRefresh = () => {
  if (latestFilter.value.autoRefresh) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const startAutoRefresh = () => {
  stopAutoRefresh()
  const minutes = Number(latestFilter.value.refreshInterval)
  refreshTimer = setInterval(() => {
    refreshLatest()
  }, minutes * 60 * 1000)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

onMounted(() => {
  nextTick(() => {
    renderChart()
  })
  if (latestFilter.value.autoRefresh) {
    startAutoRefresh()
  }
  window.addEventListener('resize', renderChart)
})

onBeforeUnmount(() => {
  stopAutoRefresh()
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', renderChart)
})

watch(() => trendFilter.value.systems, () => {
  renderChart()
})

watch(() => trendFilter.value.timeRange, () => {
  renderChart()
})

watch(() => latestFilter.value.refreshInterval, () => {
  if (latestFilter.value.autoRefresh) {
    startAutoRefresh()
  }
})
</script>

<style scoped>
.error-log-board {
  padding: 20px;
  min-height: 100%;
  background: var(--el-bg-color);
}

.filter-section {
  background: var(--el-fill-color-light);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-form {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trend-section,
.latest-section {
  margin-bottom: 20px;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color);
}

.card-title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.card-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.trend-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trend-chart {
  height: 350px;
  width: 100%;
}

.trend-note {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 0 4px;
}

.table-container {
  padding: 0 20px 20px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color);
}

.count-info {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.detail-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 12px 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.detail-row {
  display: contents;
}

.detail-row .label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  align-self: center;
}

.detail-row .value {
  font-size: 13px;
  color: var(--el-text-color-primary);
  word-break: break-word;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.body-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.log-content {
  background: var(--el-fill-color-light);
  padding: 16px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  font-family: var(--el-font-family-mono);
  max-height: 400px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .error-log-board {
    padding: 12px;
  }
  
  .filter-form {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .card-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .trend-chart {
    height: 280px;
  }
  
  .detail-header {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .detail-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}
</style>

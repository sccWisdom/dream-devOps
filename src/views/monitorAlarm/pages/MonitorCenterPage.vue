<template>
  <div class="container monitor-center-page">
    <div class="page-title">监控中心</div>

    <div class="section-panel alarm-tab-strip">
      <el-tabs v-model="activeCategory" class="alarm-tabs">
        <el-tab-pane
          v-for="item in categories"
          :key="item.key"
          :label="item.label"
          :name="item.key"
        />
      </el-tabs>
    </div>

    <el-card shadow="never" class="panel section-panel">
      <QueryBar>
        <template #default>
          <el-form class="filter-form" inline>
            <el-form-item label="全局搜索" class="filter-item">
              <el-input
                v-model="query.keyword"
                clearable
                placeholder="资源名 / IP"
                style="width: 220px"
              />
            </el-form-item>
            <el-form-item label="时间范围" class="filter-item">
              <el-date-picker
                v-model="query.timeRange"
                type="datetimerange"
                unlink-panels
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 340px"
              />
            </el-form-item>
          </el-form>
        </template>
        <template #ops>
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="search">查询</el-button>
        </template>
      </QueryBar>
    </el-card>

    <div v-if="activeCategory === 'infrastructure'" class="infra-summary-grid">
      <article
        v-for="card in infrastructureCards"
        :key="card.key"
        class="infra-summary-card"
        :class="`tone-${card.tone}`"
      >
        <div class="summary-icon">
          <el-icon>
            <component :is="card.icon" />
          </el-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">{{ card.label }}</div>
          <div class="summary-value">{{ card.value }}</div>
        </div>
      </article>
    </div>

    <el-card shadow="never" class="panel section-panel table-panel">
      <div class="table-head">
        <span>当前分类：{{ activeCategoryLabel }}</span>
        <span>记录数：{{ currentTotal }}</span>
      </div>
      <div class="table-wrap">
        <el-table
          :data="pagedRows"
          border
          stripe
          v-loading="loading"
          style="width: 100%"
          @sort-change="handleSortChange"
        >
          <el-table-column
            v-for="column in currentColumns"
            :key="column.key"
            :prop="column.key"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :sortable="column.sortable ? 'custom' : false"
            :show-overflow-tooltip="column.type !== 'progress'"
          >
            <template #default="{ row }">
              <template v-if="column.type === 'status'">
                <el-tag class="status-tag" :class="statusClass(getColumnValue(row, column))">
                  {{ displayStatus(getColumnValue(row, column)) }}
                </el-tag>
              </template>
              <template v-else-if="column.type === 'progress'">
                <div class="progress-cell" v-if="hasProgressValue(getColumnValue(row, column))">
                  <span class="progress-text">{{ formatProgressValue(getColumnValue(row, column), column) }}</span>
                  <el-progress
                    :show-text="false"
                    :stroke-width="8"
                    :percentage="normalizeProgress(getColumnValue(row, column))"
                    :color="progressColor(getColumnValue(row, column), column.reverse)"
                  />
                </div>
                <span v-else>-</span>
              </template>
              <template v-else>
                {{ formatColumnValue(row, column) }}
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="currentTotal"
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          @size-change="onPageSizeChange"
          @current-change="onPageChange"
        />
      </div>
    </el-card>

    <el-card
      v-if="activeCategory === 'database'"
      shadow="never"
      class="panel section-panel table-panel database-table-panel"
    >
      <div class="table-head database-sub-head">
        <span>数据库表监控</span>
        <span>记录数：{{ databaseTableRows.length }}</span>
      </div>
      <QueryBar>
        <template #default>
          <el-form class="filter-form" inline>
            <el-form-item label="内网IP" class="filter-item">
              <el-select
                v-model="databaseTableFilter.internalIp"
                placeholder="请选择内网IP"
                style="width: 220px"
                @change="loadDatabaseTableData"
              >
                <el-option
                  v-for="item in databaseIpOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </template>
      </QueryBar>
      <div class="table-wrap">
        <el-table
          :data="databaseTableRows"
          border
          stripe
          v-loading="databaseTableLoading"
          style="width: 100%"
        >
          <el-table-column prop="tableName" label="表名" min-width="220" show-overflow-tooltip />
          <el-table-column label="表总空间" min-width="130">
            <template #default="{ row }">
              {{ formatMetricUnit(row.totalSpace, 'GB') }}
            </template>
          </el-table-column>
          <el-table-column label="表可用空间" min-width="130">
            <template #default="{ row }">
              {{ formatMetricUnit(row.freeSpace, 'GB') }}
            </template>
          </el-table-column>
          <el-table-column label="表空间使用率" min-width="180">
            <template #default="{ row }">
              <div class="progress-cell">
                <span class="progress-text">{{ formatProgressValue(row.usedRate, { type: 'progress' }) }}</span>
                <el-progress
                  :show-text="false"
                  :stroke-width="8"
                  :percentage="normalizeProgress(row.usedRate)"
                  :color="progressColor(row.usedRate, true)"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  Coin,
  Cpu,
  DataAnalysis,
  Monitor,
  WarningFilled
} from '@element-plus/icons-vue'
import QueryBar from '@/components/Common/QueryBar.vue'
import {
  listMonitorCenterCategories,
  queryDatabaseTableMonitor,
  queryMonitorCenterList
} from '@/mock-data/modules/alarm'

const route = useRoute()

const loading = ref(false)
const categories = ref([])
const activeCategory = ref('infrastructure')
const rows = ref([])
const databaseTableLoading = ref(false)
const databaseTableRows = ref([])

const query = reactive({
  keyword: '',
  status: '',
  timeRange: [],
  cmdbCategory: ''
})

const databaseTableFilter = reactive({
  internalIp: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const sortState = reactive({
  prop: 'latestAlarmTime',
  order: 'descending'
})

const statusRank = { 正常: 1, 异常: 2 }

const activeCategoryLabel = computed(() => {
  const target = categories.value.find((item) => item.key === activeCategory.value)
  return target?.label || '-'
})

const infrastructureCards = computed(() => {
  if (activeCategory.value !== 'infrastructure') return []
  const source = categoryRows.value
  return [
    {
      key: 'total',
      label: '全部主机数量',
      value: source.length,
      icon: Monitor,
      tone: 'total'
    },
    {
      key: 'cpu',
      label: 'CPU使用率超80%',
      value: source.filter((item) => Number(item.metrics?.cpu || 0) > 80).length,
      icon: Cpu,
      tone: 'cpu'
    },
    {
      key: 'disk',
      label: '磁盘使用率超80%',
      value: source.filter((item) => Number(item.metrics?.disk || 0) > 80).length,
      icon: Coin,
      tone: 'disk'
    },
    {
      key: 'memory',
      label: '内存使用率超80%',
      value: source.filter((item) => Number(item.metrics?.memory || 0) > 80).length,
      icon: DataAnalysis,
      tone: 'memory'
    },
    {
      key: 'abnormal',
      label: '监控异常数',
      value: source.filter((item) => displayStatus(item.status) === '异常').length,
      icon: WarningFilled,
      tone: 'abnormal'
    }
  ]
})

const currentColumns = computed(() => {
  const commonColumns = [
    { key: 'status', label: '监控状态', width: 100, sortable: true, type: 'status' },
    { key: 'latestAlarmTime', label: '最新告警时间', width: 170, sortable: true }
  ]

  if (activeCategory.value === 'infrastructure') {
    return [
      { key: 'resourceName', label: '主机名称', minWidth: 180, sortable: true },
      { key: 'identifier', label: '主机IP', width: 140 },
      { key: 'operator', label: '运营商', width: 100 },
      { key: 'environment', label: '环境', width: 90 },
      { key: 'bizSystem', label: '业务系统', minWidth: 150 },
      { key: 'vendor', label: '厂商', width: 100 },
      { key: 'serverArch', label: '服务器架构', width: 120 },
      { key: 'metrics.unrecoveredCount', label: '告警未恢复量', width: 120, sortable: true },
      { key: 'metrics.memory', label: '内存使用率', minWidth: 150, sortable: true, type: 'progress', reverse: true },
      { key: 'metrics.cpu', label: 'CPU使用率', minWidth: 150, sortable: true, type: 'progress', reverse: true },
      { key: 'metrics.disk', label: '磁盘使用率', minWidth: 150, sortable: true, type: 'progress', reverse: true },
      ...commonColumns
    ]
  }

  if (activeCategory.value === 'platform') {
    return [
      { key: 'resourceName', label: '底座名称', minWidth: 180, sortable: true },
      { key: 'metrics.baseType', label: '底座类型', width: 120 },
      { key: 'internalIp', label: '内网IP', width: 140 },
      { key: 'appSystem', label: '应用系统', minWidth: 150 },
      { key: 'vendor', label: '负责厂商', width: 110 },
      { key: 'operator', label: '运营商', width: 100 },
      { key: 'environment', label: '环境', width: 90 },
      { key: 'metrics.componentStatus', label: '平台组件状态', minWidth: 140 },
      { key: 'metrics.availability', label: '服务可用性', minWidth: 150, sortable: true, type: 'progress', reverse: false },
      { key: 'metrics.responseMs', label: '接口响应耗时', minWidth: 130, sortable: true, formatter: (value) => formatMetricUnit(value, 'ms') },
      { key: 'metrics.nodeHealth', label: '节点健康度', minWidth: 150, sortable: true, type: 'progress', reverse: false },
      ...commonColumns
    ]
  }

  if (activeCategory.value === 'database') {
    return [
      { key: 'resourceName', label: '数据库实例', minWidth: 180, sortable: true },
      { key: 'identifier', label: '内网IP', width: 140 },
      { key: 'appSystem', label: '应用系统', minWidth: 150 },
      { key: 'vendor', label: '负责厂商', width: 110 },
      { key: 'operator', label: '运营商', width: 100 },
      { key: 'environment', label: '环境', width: 90 },
      { key: 'metrics.hostTotalMem', label: '主机总内存', minWidth: 120, sortable: true, formatter: (value) => formatMetricUnit(value, 'GB') },
      { key: 'metrics.hostFreeMem', label: '主机可用内存', minWidth: 130, sortable: true, formatter: (value) => formatMetricUnit(value, 'GB') },
      { key: 'metrics.diskTotal', label: '磁盘总空间', minWidth: 130, sortable: true, formatter: (value) => formatMetricUnit(value, 'GB') },
      { key: 'metrics.sessions', label: '会话数', width: 100, sortable: true },
      { key: 'metrics.maxSessions', label: '最大会话数', width: 120, sortable: true },
      { key: 'metrics.dbStatus', label: '实例状态', width: 110 },
      { key: 'metrics.sessionUsage', label: '会话使用率', minWidth: 150, sortable: true, type: 'progress', reverse: true },
      { key: 'metrics.hostMemUsage', label: '主机内存使用率', minWidth: 160, sortable: true, type: 'progress', reverse: true },
      { key: 'metrics.diskUsage', label: '磁盘使用率', minWidth: 150, sortable: true, type: 'progress', reverse: true },
      { key: 'metrics.tablespaceUsage', label: '表空间使用率', minWidth: 160, sortable: true, type: 'progress', reverse: true },
      ...commonColumns
    ]
  }

  if (activeCategory.value === 'middleware') {
    return [
      { key: 'resourceName', label: '中间件名称', minWidth: 180, sortable: true },
      { key: 'metrics.middlewareType', label: '中间件类型', width: 120 },
      { key: 'internalIp', label: '内网IP', width: 140 },
      { key: 'appSystem', label: '应用系统', minWidth: 150 },
      { key: 'vendor', label: '负责厂商', width: 110 },
      { key: 'operator', label: '运营商', width: 100 },
      { key: 'environment', label: '环境', width: 90 },
      { key: 'purpose', label: '用途', minWidth: 120 },
      { key: 'metrics.socketUsage', label: '套接字数使用率', minWidth: 160, sortable: true, type: 'progress', reverse: true },
      { key: 'metrics.fdUsage', label: '文件描述符使用率', minWidth: 170, sortable: true, type: 'progress', reverse: true },
      { key: 'metrics.memoryUsage', label: '内存使用率', minWidth: 150, sortable: true, type: 'progress', reverse: true },
      { key: 'metrics.consumerGroupCount', label: '消费者分组数量', minWidth: 150, sortable: true },
      { key: 'metrics.lagTotal', label: '滞后量总和', minWidth: 130, sortable: true },
      { key: 'metrics.approxLag', label: '近似滞后量', minWidth: 130, sortable: true },
      { key: 'metrics.topicReplicaCount', label: '主题分区副本数量', minWidth: 160, sortable: true },
      { key: 'metrics.topicCount', label: 'Topic数量', minWidth: 110, sortable: true },
      { key: 'metrics.memoryFragment', label: '内存碎片', minWidth: 110, sortable: true, formatter: (value) => formatMetricUnit(value, 'x') },
      ...commonColumns
    ]
  }

  if (activeCategory.value === 'application') {
    return [
      { key: 'resourceName', label: '主体名称', minWidth: 180, sortable: true },
      { key: 'appSystem', label: '应用系统', minWidth: 150 },
      { key: 'vendor', label: '负责厂商', width: 110 },
      { key: 'operator', label: '运营商', width: 100 },
      { key: 'environment', label: '环境', width: 90 },
      { key: 'metrics.probeUrl', label: '探测URL', minWidth: 220 },
      { key: 'metrics.statusCode', label: '响应码', width: 90, sortable: true },
      { key: 'metrics.responseMs', label: '响应时间', minWidth: 110, sortable: true, formatter: (value) => formatMetricUnit(value, 'ms') },
      { key: 'metrics.probeAbnormal', label: '探测是否异常', minWidth: 120 },
      { key: 'metrics.probeTime', label: '探测时间', minWidth: 170, sortable: true },
      ...commonColumns
    ]
  }

  return [
    { key: 'resourceName', label: '任务名称', minWidth: 220, sortable: true },
    { key: 'appSystem', label: '应用系统', minWidth: 150 },
    { key: 'vendor', label: '负责厂商', width: 110 },
    { key: 'environment', label: '环境', width: 90 },
    { key: 'metrics.executeStatus', label: '任务执行状态', minWidth: 130 },
    { key: 'metrics.successRate', label: '成功率', minWidth: 150, sortable: true, type: 'progress', reverse: false },
    { key: 'metrics.durationSec', label: '执行耗时', minWidth: 110, sortable: true, formatter: (value) => formatMetricUnit(value, '秒') },
    { key: 'metrics.nextRunAt', label: '下次执行时间', minWidth: 170, sortable: true },
    { key: 'metrics.abnormalNodes', label: '异常节点', width: 100, sortable: true },
    ...commonColumns
  ]
})

const categoryRows = computed(() => rows.value.filter((item) => item.category === activeCategory.value))

const databaseIpOptions = computed(() => {
  if (activeCategory.value !== 'database') return []
  return categoryRows.value.map((item) => ({
    label: item.internalIp || item.identifier,
    value: item.internalIp || item.identifier
  }))
})

const sortedRows = computed(() => {
  const list = [...categoryRows.value]
  const { prop, order } = sortState
  if (!prop || !order) return list
  const factor = order === 'ascending' ? 1 : -1

  return list.sort((a, b) => {
    const left = getSortValue(a, prop)
    const right = getSortValue(b, prop)

    if (prop === 'status') {
      return (statusRank[left] - statusRank[right]) * factor
    }

    if (prop === 'latestAlarmTime' || prop === 'metrics.probeTime' || prop === 'metrics.nextRunAt') {
      return (toTime(left) - toTime(right)) * factor
    }

    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * factor
    }

    return String(left ?? '').localeCompare(String(right ?? ''), 'zh-CN') * factor
  })
})

const currentTotal = computed(() => sortedRows.value.length)

const pagedRows = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return sortedRows.value.slice(start, end)
})

function toTime(value) {
  if (!value) return 0
  const ts = new Date(String(value).replace(/-/g, '/')).getTime()
  return Number.isNaN(ts) ? 0 : ts
}

function getValueByPath(target, path) {
  if (!path) return undefined
  return path.split('.').reduce((current, key) => current?.[key], target)
}

function getColumnValue(row, column) {
  return getValueByPath(row, column.key)
}

function getSortValue(row, prop) {
  if (prop === 'status') return displayStatus(row.status)
  const value = getValueByPath(row, prop)
  if (value === undefined || value === null || value === '') return ''
  const numeric = Number(value)
  if (!Number.isNaN(numeric) && `${numeric}` === `${value}`.replace(/,/g, '')) {
    return numeric
  }
  return value
}

function displayStatus(status) {
  return status === '正常' ? '正常' : '异常'
}

function statusClass(status) {
  return displayStatus(status) === '正常' ? 'status-normal' : 'status-abnormal'
}

function hasProgressValue(value) {
  return value !== '' && value !== null && value !== undefined && !Number.isNaN(Number(value))
}

function normalizeProgress(value) {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return 0
  return Math.min(Math.max(numeric, 0), 100)
}

function formatMetricUnit(value, unit) {
  if (value === '' || value === null || value === undefined) return '-'
  return `${value}${unit}`
}

function formatProgressValue(value, column) {
  if (!hasProgressValue(value)) return '-'
  if (typeof column.progressFormatter === 'function') return column.progressFormatter(value)
  return `${Number(value)}%`
}

function formatColumnValue(row, column) {
  const value = getColumnValue(row, column)
  if (typeof column.formatter === 'function') return column.formatter(value, row)
  if (value === '' || value === null || value === undefined) return '-'
  return value
}

function progressColor(value, reverse = true) {
  const percentage = normalizeProgress(value)
  if (reverse) {
    if (percentage >= 80) return '#dc2626'
    if (percentage >= 60) return '#f59e0b'
    return '#16a34a'
  }
  if (percentage >= 95) return '#16a34a'
  if (percentage >= 80) return '#f59e0b'
  return '#dc2626'
}

function normalizeQuery() {
  return {
    keyword: query.keyword.trim(),
    status: query.status,
    cmdbCategory: query.cmdbCategory,
    timeRange: query.timeRange
  }
}

function applyRouteFilters() {
  const routeCategory = String(route.query.category || '').trim()
  if (routeCategory && categories.value.some((item) => item.key === routeCategory)) {
    activeCategory.value = routeCategory
  }
  query.keyword = String(route.query.keyword || '')
  query.status = String(route.query.status || '')
  query.cmdbCategory = String(route.query.cmdbCategory || '')
  const start = String(route.query.startTime || '')
  const end = String(route.query.endTime || '')
  query.timeRange = start && end ? [start, end] : []
}

async function loadData() {
  loading.value = true
  try {
    rows.value = await queryMonitorCenterList(normalizeQuery())
  } finally {
    loading.value = false
  }
}

async function loadDatabaseTableData() {
  if (activeCategory.value !== 'database' || !databaseTableFilter.internalIp) {
    databaseTableRows.value = []
    return
  }
  databaseTableLoading.value = true
  try {
    databaseTableRows.value = await queryDatabaseTableMonitor({
      internalIp: databaseTableFilter.internalIp,
      timeRange: query.timeRange
    })
  } finally {
    databaseTableLoading.value = false
  }
}

function syncDatabaseTableFilter() {
  if (activeCategory.value !== 'database') {
    databaseTableFilter.internalIp = ''
    databaseTableRows.value = []
    return
  }
  const optionValues = databaseIpOptions.value.map((item) => item.value)
  if (optionValues.length === 0) {
    databaseTableFilter.internalIp = ''
    databaseTableRows.value = []
    return
  }
  if (!optionValues.includes(databaseTableFilter.internalIp)) {
    databaseTableFilter.internalIp = optionValues[0]
  }
}

function handleSortChange({ prop, order }) {
  sortState.prop = prop || 'latestAlarmTime'
  sortState.order = order || 'descending'
}

function onPageChange(page) {
  pagination.page = page
}

function onPageSizeChange(size) {
  pagination.pageSize = size
  pagination.page = 1
}

async function search() {
  pagination.page = 1
  await loadData()
  syncDatabaseTableFilter()
  await loadDatabaseTableData()
}

async function resetQuery() {
  query.keyword = ''
  query.status = ''
  query.timeRange = []
  query.cmdbCategory = ''
  pagination.page = 1
  await loadData()
  syncDatabaseTableFilter()
  await loadDatabaseTableData()
}

watch(
  () => activeCategory.value,
  async () => {
    pagination.page = 1
    syncDatabaseTableFilter()
    await loadDatabaseTableData()
  }
)

watch(
  () => [pagination.pageSize, currentTotal.value],
  () => {
    const maxPage = Math.max(1, Math.ceil(currentTotal.value / pagination.pageSize))
    if (pagination.page > maxPage) pagination.page = maxPage
  }
)

watch(
  () => route.query,
  async () => {
    applyRouteFilters()
    pagination.page = 1
    await loadData()
    syncDatabaseTableFilter()
    await loadDatabaseTableData()
  }
)

onMounted(async () => {
  categories.value = await listMonitorCenterCategories()
  if (categories.value.length > 0) {
    activeCategory.value = categories.value[0].key
  }
  applyRouteFilters()
  await loadData()
  syncDatabaseTableFilter()
  await loadDatabaseTableData()
})
</script>

<style scoped>
.monitor-center-page {
  display: grid;
  gap: 12px;
}

.section-panel {
  margin-bottom: 0;
}

.infra-summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.infra-summary-card {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 108px;
  padding: 18px 16px;
  border: 1px solid #e5edf8;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.infra-summary-card::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 4px;
  opacity: 0.9;
}

.summary-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  flex: 0 0 46px;
  font-size: 22px;
}

.summary-content {
  min-width: 0;
}

.summary-label {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
}

.summary-value {
  margin-top: 8px;
  font-size: 28px;
  line-height: 1;
  font-weight: 700;
  color: #0f172a;
}

.tone-total {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.1), #ffffff 70%);
}

.tone-total .summary-icon {
  color: #2563eb;
  background: rgba(59, 130, 246, 0.16);
}

.tone-total::after {
  background: #2563eb;
}

.tone-cpu {
  background: linear-gradient(180deg, rgba(249, 115, 22, 0.12), #ffffff 70%);
}

.tone-cpu .summary-icon {
  color: #ea580c;
  background: rgba(249, 115, 22, 0.16);
}

.tone-cpu::after {
  background: #ea580c;
}

.tone-disk {
  background: linear-gradient(180deg, rgba(168, 85, 247, 0.1), #ffffff 70%);
}

.tone-disk .summary-icon {
  color: #7c3aed;
  background: rgba(168, 85, 247, 0.16);
}

.tone-disk::after {
  background: #7c3aed;
}

.tone-memory {
  background: linear-gradient(180deg, rgba(20, 184, 166, 0.12), #ffffff 70%);
}

.tone-memory .summary-icon {
  color: #0f766e;
  background: rgba(20, 184, 166, 0.16);
}

.tone-memory::after {
  background: #0f766e;
}

.tone-abnormal {
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.12), #ffffff 70%);
}

.tone-abnormal .summary-icon {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.16);
}

.tone-abnormal::after {
  background: #dc2626;
}

.alarm-tab-strip {
  padding: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
}

.alarm-tabs :deep(.el-tabs__nav-wrap::after) {
  background: var(--border);
}

.alarm-tabs :deep(.el-tabs__item.is-active) {
  font-weight: 700;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  row-gap: 8px;
}

.filter-item {
  margin-bottom: 0;
}

.table-panel {
  padding-bottom: 8px;
}

.table-head {
  display: flex;
  justify-content: space-between;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 10px;
}

.database-sub-head {
  align-items: center;
}

.table-wrap {
  overflow-x: auto;
}

.status-tag {
  border-width: 1px;
  font-weight: 600;
}

.status-normal {
  color: #15803d;
  border-color: rgba(22, 163, 74, 0.35);
  background: rgba(22, 163, 74, 0.12);
}

.status-abnormal {
  color: #b91c1c;
  border-color: rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.16);
}

.progress-cell {
  min-width: 120px;
}

.progress-text {
  display: inline-block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #475569;
}

.progress-cell :deep(.el-progress-bar__outer) {
  background: #e2e8f0;
}

.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1400px) {
  .infra-summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1080px) {
  .infra-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .infra-summary-grid {
    grid-template-columns: 1fr;
  }

  .table-head {
    flex-direction: column;
    gap: 4px;
  }
}
</style>

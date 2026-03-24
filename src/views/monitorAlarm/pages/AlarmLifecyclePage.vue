<template>
  <div class="container alarm-lifecycle-page">
    <div class="page-title">告警信息列表</div>

    <div class="section-panel alarm-tab-strip">
      <el-tabs v-model="activeType" class="alarm-tabs" @tab-change="handleTypeChange">
        <el-tab-pane
          v-for="type in alarmTypes"
          :key="type.key"
          :label="type.label"
          :name="type.key"
        />
      </el-tabs>
    </div>

    <el-card shadow="never" class="panel section-panel">
      <QueryBar>
        <template #default>
          <el-form class="filter-form" inline>
            <el-form-item label="关键字" class="filter-item">
              <el-input
                v-model="query.keyword"
                clearable
                placeholder="搜索标题/内容/告警对象"
                style="width: 210px"
              />
            </el-form-item>
            <el-form-item label="告警等级" class="filter-item">
              <el-select v-model="query.level" clearable placeholder="全部" style="width: 120px">
                <el-option label="一级告警" value="一级告警" />
                <el-option label="二级告警" value="二级告警" />
                <el-option label="三级告警" value="三级告警" />
              </el-select>
            </el-form-item>
            <el-form-item label="处理状态" class="filter-item">
              <el-select v-model="query.status" clearable placeholder="全部" style="width: 120px">
                <el-option label="未处理" value="未处理" />
                <el-option label="处理中" value="处理中" />
                <el-option label="已恢复" value="已恢复" />
                <el-option label="已忽略" value="已忽略" />
              </el-select>
            </el-form-item>
            <el-form-item label="是否已派单" class="filter-item">
              <el-select v-model="query.dispatched" clearable placeholder="全部" style="width: 120px">
                <el-option label="是" value="是" />
                <el-option label="否" value="否" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围" class="filter-item">
              <el-date-picker
                v-model="query.timeRange"
                type="datetimerange"
                unlink-panels
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 350px"
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

    <el-card shadow="never" class="panel section-panel table-panel">
      <div class="table-meta">
        <span>当前类型：{{ activeTypeLabel }}</span>
        <span>记录数：{{ pagination.total }}</span>
      </div>
      <div class="table-wrapper">
        <el-table :data="pagedList" border stripe v-loading="loading" style="width: 100%">
          <template v-if="activeType === 'task'">
            <el-table-column prop="taskName" label="任务名称" min-width="220" show-overflow-tooltip />
            <el-table-column prop="team" label="团队" min-width="120" show-overflow-tooltip />
            <el-table-column prop="taskLevel" label="任务层级" min-width="130" show-overflow-tooltip />
            <el-table-column prop="scene" label="所属场景" min-width="160" show-overflow-tooltip />
            <el-table-column label="告警等级" width="100">
              <template #default="{ row }">
                <el-tag :type="levelTagType(row.level)" :class="['alarm-level-tag', levelClass(row.level)]">
                  {{ row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="alarmSource" label="告警来源" min-width="140" show-overflow-tooltip />
            <el-table-column prop="content" label="告警内容" min-width="260" show-overflow-tooltip />
            <el-table-column prop="abnormalReason" label="异常原因" min-width="220" show-overflow-tooltip />
            <el-table-column prop="firstOccurredAt" label="首次发生时间" width="170" />
            <el-table-column prop="lastOccurredAt" label="最新发生时间" width="170" />
            <el-table-column label="处理状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="是否派单" width="90">
              <template #default="{ row }">
                <el-tag :type="row.dispatched ? 'success' : 'info'">{{ row.dispatched ? '是' : '否' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="关联事件单号" width="150">
              <template #default="{ row }">
                <el-link
                  v-if="row.eventNo"
                  type="primary"
                  underline="never"
                  @click="openEvent(row.eventNo)"
                >
                  {{ row.eventNo }}
                </el-link>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </template>
          <template v-else>
            <el-table-column prop="objectName" label="告警对象" min-width="170" show-overflow-tooltip />
            <el-table-column prop="ip" label="IP" width="130" />
            <el-table-column prop="subsystem" label="子系统" min-width="140" show-overflow-tooltip />
            <el-table-column prop="bizSystem" label="业务系统" min-width="150" show-overflow-tooltip />
            <el-table-column prop="ciName" label="关联配置项名称" min-width="160" show-overflow-tooltip />
            <el-table-column
              v-if="activeType !== 'database'"
              :label="typeDimensionLabel"
              min-width="140"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.typeDimension }}
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="运营商" width="100" />
            <el-table-column label="告警等级" width="100">
              <template #default="{ row }">
                <el-tag :type="levelTagType(row.level)" :class="['alarm-level-tag', levelClass(row.level)]">
                  {{ row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="vendor" label="厂商" width="100" />
            <el-table-column prop="content" label="告警内容" min-width="260" show-overflow-tooltip />
            <el-table-column prop="firstOccurredAt" label="首次发生时间" width="170" />
            <el-table-column prop="lastOccurredAt" label="最近发生时间" width="170" />
            <el-table-column label="处理状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="是否派单" width="90">
              <template #default="{ row }">
                <el-tag :type="row.dispatched ? 'success' : 'info'">{{ row.dispatched ? '是' : '否' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="关联事件单号" width="150">
              <template #default="{ row }">
                <el-link
                  v-if="row.eventNo"
                  type="primary"
                  underline="never"
                  @click="openEvent(row.eventNo)"
                >
                  {{ row.eventNo }}
                </el-link>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </template>
          <el-table-column label="操作" fixed="right" width="220">
            <template #default="{ row }">
              <el-space>
                <el-button
                  v-if="!row.dispatched"
                  size="small"
                  type="primary"
                  plain
                  @click="dispatchAlarm(row)"
                >
                  关联派单
                </el-button>
                <el-button
                  v-else
                  size="small"
                  type="primary"
                  @click="openEvent(row.eventNo)"
                >
                  查看事件
                </el-button>
                <el-dropdown @command="(command) => changeStatus(row, command)">
                  <el-button size="small">更新状态</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="未处理">标记未处理</el-dropdown-item>
                      <el-dropdown-item command="处理中">标记处理中</el-dropdown-item>
                      <el-dropdown-item command="已恢复">标记已恢复</el-dropdown-item>
                      <el-dropdown-item command="已忽略">标记已忽略</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="pagination.total"
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          @size-change="onPageSizeChange"
          @current-change="onPageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import QueryBar from '@/components/Common/QueryBar.vue'
import {
  bindAlarmEventOrder,
  listAlarmTypes,
  queryAlarmList,
  updateAlarmStatus
} from '@/mock-data/modules/alarm'

const router = useRouter()
const route = useRoute()

const alarmTypes = ref([])
const activeType = ref('host')
const loading = ref(false)
const tableData = ref([])

const query = reactive({
  keyword: '',
  level: '',
  status: '',
  dispatched: '',
  timeRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const activeTypeLabel = computed(() => {
  const target = alarmTypes.value.find((item) => item.key === activeType.value)
  return target?.label || '-'
})

const typeDimensionLabel = computed(() => {
  const map = {
    host: '资源维度',
    database: '实例维度',
    middleware: '组件维度',
    service: '服务维度',
    task: '任务维度'
  }
  return map[activeType.value] || '分类维度'
})

const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return tableData.value.slice(start, end)
})

function normalizeFilters() {
  return {
    type: activeType.value,
    keyword: query.keyword,
    level: query.level,
    status: query.status,
    dispatched: query.dispatched,
    timeRange: query.timeRange
  }
}

function getTypeDimension(item) {
  const map = {
    host: '计算资源池',
    database: '关系型实例',
    middleware: '基础组件集群',
    service: '业务服务域',
    task: '数据治理'
  }
  return map[item.type] || '-'
}

function applyRouteFilters() {
  const type = String(route.query.type || '').trim()
  if (type && alarmTypes.value.some((item) => item.key === type)) {
    activeType.value = type
  }
  query.keyword = String(route.query.keyword || '')
  query.level = String(route.query.level || '')
  query.status = String(route.query.status || '')
  query.dispatched = String(route.query.dispatched || '')
  const start = String(route.query.startTime || '')
  const end = String(route.query.endTime || '')
  query.timeRange = start && end ? [start, end] : []
}

async function loadData() {
  loading.value = true
  try {
    const list = await queryAlarmList(normalizeFilters())
    tableData.value = list.map((item) => ({ ...item, typeDimension: getTypeDimension(item) }))
    pagination.total = tableData.value.length
    const maxPage = Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
    if (pagination.page > maxPage) {
      pagination.page = maxPage
    }
  } finally {
    loading.value = false
  }
}

function levelTagType(level) {
  const map = {
    一级告警: 'danger',
    二级告警: 'warning',
    三级告警: 'info'
  }
  return map[level] || 'info'
}

function levelClass(level) {
  const map = {
    一级告警: 'level-1',
    二级告警: 'level-2',
    三级告警: 'level-3'
  }
  return map[level] || 'level-3'
}

function statusTagType(status) {
  const map = {
    未处理: 'danger',
    处理中: 'warning',
    已恢复: 'success',
    已忽略: 'info'
  }
  return map[status] || 'info'
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
}

async function resetQuery() {
  query.keyword = ''
  query.level = ''
  query.status = ''
  query.dispatched = ''
  query.timeRange = []
  pagination.page = 1
  await loadData()
}

async function handleTypeChange() {
  await resetQuery()
}

async function dispatchAlarm(row) {
  await bindAlarmEventOrder(row.id)
  ElMessage.success('已关联事件单并归属到事件管理')
  await loadData()
}

function openEvent(eventNo) {
  router.push({
    path: '/dashboard/event',
    query: eventNo ? { eventNo } : undefined
  })
}

async function changeStatus(row, nextStatus) {
  if (row.status === nextStatus) return
  await updateAlarmStatus(row.id, nextStatus)
  ElMessage.success(`告警状态已更新为：${nextStatus}`)
  await loadData()
}

watch(
  () => route.query,
  async () => {
    applyRouteFilters()
    pagination.page = 1
    await loadData()
  }
)

onMounted(async () => {
  alarmTypes.value = await listAlarmTypes()
  if (alarmTypes.value.length > 0) {
    activeType.value = alarmTypes.value[0].key
  }
  applyRouteFilters()
  await loadData()
})
</script>

<style scoped>
.alarm-lifecycle-page {
  padding-top: 16px;
}

.section-panel {
  margin-bottom: 12px;
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

.table-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--muted);
  font-size: 13px;
}

.table-wrapper {
  overflow-x: auto;
}

.alarm-level-tag.level-1 {
  font-weight: 700;
}

.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1400px) {
  .table-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>

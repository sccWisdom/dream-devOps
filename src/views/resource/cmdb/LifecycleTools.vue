<template>
  <div class="panel lifecycle-page">
    <section class="page-head">
      <div>
        <h3 class="head-title">生命周期</h3>
        <p class="head-subtitle">围绕资源状态、自动采集和统计分析提供统一运营视图，保障数据持续准确。</p>
      </div>
      <div class="head-stats">
        <article v-for="item in headCards" :key="item.label" class="head-stat-card">
          <div class="head-stat-label">{{ item.label }}</div>
          <div class="head-stat-value">{{ item.value }}</div>
        </article>
      </div>
    </section>

    <el-tabs v-model="activeTab" class="lifecycle-tabs">
      <el-tab-pane label="生命周期管理" name="lifecycle">
        <div class="tab-shell" v-loading="lifecycleLoading">
          <section class="filter-panel">
            <div class="filter-title">快速查询检索</div>
            <div class="filter-row">
              <el-input v-model="searchKeyword" placeholder="输入 IP/主机名/负责人/业务系统" class="input-wide" clearable />
              <el-select v-model="filterCategory" placeholder="分类" class="input-sm" clearable>
                <el-option v-for="c in categoryOptions" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
              <el-select v-model="filterStatus" placeholder="状态" class="input-xs" clearable>
                <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
              </el-select>
              <el-input v-model="filterBiz" placeholder="业务系统" class="input-sm" clearable />
              <el-input v-model="filterOwner" placeholder="负责人" class="input-sm" clearable />
              <el-button type="primary" @click="applyFilters">查询</el-button>
              <el-button @click="resetFilters">重置</el-button>
            </div>
            <div class="quick-row">
              <span class="quick-label">快捷视图：</span>
              <el-button size="small" :type="quickView==='mine' ? 'primary' : 'default'" @click="toggleQuick('mine')">我的负责资源</el-button>
              <el-button size="small" :type="quickView==='online' ? 'primary' : 'default'" @click="toggleQuick('online')">在线资源</el-button>
              <el-button size="small" :type="quickView==='alert' ? 'primary' : 'default'" @click="toggleQuick('alert')">异常资源</el-button>
              <el-button size="small" :type="quickView==='idle' ? 'primary' : 'default'" @click="toggleQuick('idle')">闲置资源</el-button>
            </div>
          </section>

          <section class="lifecycle-grid">
            <el-card class="panel-card list-card" shadow="never">
              <template #header>
                <div class="card-title">资源实例清单（{{ viewRows.length }}）</div>
              </template>
              <el-table :data="viewRows" border height="480" @selection-change="onSelectionChange">
                <el-table-column type="selection" width="46" />
                <el-table-column prop="name" label="名称" min-width="160" />
                <el-table-column prop="ip" label="IP" width="130" />
                <el-table-column prop="modelName" label="模型" width="110" />
                <el-table-column prop="categoryName" label="分类" width="120" />
                <el-table-column prop="owner" label="负责人" width="110" />
                <el-table-column prop="status" label="状态" width="90">
                  <template #default="{ row }">
                    <el-tag :type="statusTag(row.status)">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="bizSystem" label="所属业务系统" min-width="140" />
              </el-table>
            </el-card>

            <div class="side-stack">
              <el-card class="panel-card" shadow="never">
                <template #header>
                  <div class="card-title">状态变更</div>
                </template>
                <el-form :model="statusForm" label-width="90px">
                  <el-form-item label="目标状态">
                    <el-select v-model="statusForm.status" placeholder="选择状态" style="width:100%">
                      <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="变更原因">
                    <el-input v-model="statusForm.reason" type="textarea" :rows="3" placeholder="填写原因" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="applyStatus">批量变更</el-button>
                    <el-button @click="clearStatusForm">清空</el-button>
                  </el-form-item>
                </el-form>
              </el-card>

              <el-card class="panel-card" shadow="never">
                <template #header>
                  <div class="card-title">状态流转记录</div>
                </template>
                <el-table :data="lifecycleLogs" border height="220">
                  <el-table-column prop="at" label="时间" width="170" />
                  <el-table-column prop="ciName" label="配置项" />
                  <el-table-column prop="status" label="状态" width="90" />
                </el-table>
              </el-card>

              <el-card class="panel-card" shadow="never">
                <template #header>
                  <div class="card-title">到期提醒</div>
                </template>
                <div class="reminder" v-for="item in reminders" :key="item.id">
                  <div class="reminder-title">{{ item.title }}</div>
                  <div class="reminder-meta">{{ item.meta }}</div>
                </div>
                <div v-if="!reminders.length" class="reminder-empty">暂无提醒</div>
              </el-card>
            </div>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane label="自动采集同步" name="discovery">
        <div class="tab-shell" v-loading="discoveryLoading">
          <section class="discovery-grid">
            <el-card class="panel-card list-card" shadow="never">
              <template #header>
                <div class="card-title">采集任务列表</div>
              </template>
              <div class="toolbar-row">
                <el-button type="primary" @click="openTaskDialog()">新增任务</el-button>
                <el-button @click="runDiscoveryNow">立即采集</el-button>
                <el-button @click="loadDiscovery">刷新</el-button>
              </div>
              <el-table :data="discoveryTasks" border height="380">
                <el-table-column prop="target" label="采集对象" />
                <el-table-column prop="method" label="采集方式" width="120" />
                <el-table-column prop="frequency" label="采集频率" width="120" />
                <el-table-column prop="status" label="状态" width="90" />
                <el-table-column prop="updatedAt" label="更新时间" width="170" />
                <el-table-column label="操作" width="190">
                  <template #default="{ row }">
                    <div class="task-action-row">
                      <el-button text type="primary" @click="openTaskDialog(row)">编辑</el-button>
                      <el-button text type="warning" @click="toggleTask(row)">{{ row.status === '运行中' ? '暂停' : '启用' }}</el-button>
                      <el-button text type="danger" @click="removeTask(row)">删除</el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>

            <div class="side-stack">
              <el-card class="panel-card" shadow="never">
                <template #header>
                  <div class="card-title">采集规则配置</div>
                </template>
                <el-form :model="ruleForm" label-width="90px">
                  <el-form-item label="IP 段">
                    <el-select v-model="ruleForm.ipRanges" multiple filterable allow-create default-first-option placeholder="输入 IP 段" style="width:100%" />
                  </el-form-item>
                  <el-form-item label="采集字段">
                    <el-select v-model="ruleForm.fields" multiple filterable allow-create default-first-option placeholder="输入字段" style="width:100%" />
                  </el-form-item>
                  <el-form-item label="去重策略">
                    <el-input v-model="ruleForm.dedup" placeholder="IP + 资产编码" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="saveRules">保存规则</el-button>
                  </el-form-item>
                </el-form>
              </el-card>

              <el-card class="panel-card" shadow="never">
                <template #header>
                  <div class="card-title">采集日志与异常提示</div>
                </template>
                <el-alert
                  title="如出现采集失败，会在日志中标记原因并提示处理建议。"
                  type="info"
                  :closable="false"
                  style="margin-bottom:10px"
                />
                <el-table :data="discoveryLogs" border height="240">
                  <el-table-column prop="at" label="时间" width="170" />
                  <el-table-column prop="modelCode" label="模型" width="90" />
                  <el-table-column prop="discovered" label="发现" width="70" />
                  <el-table-column prop="created" label="新增" width="70" />
                  <el-table-column prop="updated" label="更新" width="70" />
                </el-table>
              </el-card>
            </div>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane label="统计分析报表" name="stats">
        <div class="tab-shell" v-loading="statsLoading">
          <section class="stats-grid">
            <article class="stat-card">
              <div class="stat-label">资源总量</div>
              <div class="stat-value">{{ stats.total }}</div>
            </article>
            <article class="stat-card">
              <div class="stat-label">在线率</div>
              <div class="stat-value">{{ stats.onlineRate }}%</div>
            </article>
            <article class="stat-card">
              <div class="stat-label">异常率</div>
              <div class="stat-value">{{ stats.alertRate }}%</div>
            </article>
            <article class="stat-card">
              <div class="stat-label">闲置率</div>
              <div class="stat-value">{{ stats.idleRate }}%</div>
            </article>
          </section>

          <section class="chart-grid">
            <el-card class="panel-card" shadow="never">
              <template #header>
                <div class="card-title">资源分类占比</div>
              </template>
              <BaseChart :options="categoryChart" height="260px" />
            </el-card>
            <el-card class="panel-card" shadow="never">
              <template #header>
                <div class="card-title">业务系统资源分布</div>
              </template>
              <BaseChart :options="bizChart" height="260px" />
            </el-card>
            <el-card class="panel-card" shadow="never">
              <template #header>
                <div class="card-title">资源增长趋势</div>
              </template>
              <BaseChart :options="trendChart" height="260px" />
            </el-card>
          </section>

          <el-card class="panel-card" shadow="never">
            <template #header>
              <div class="card-title">明细报表</div>
            </template>
            <el-tabs v-model="detailTab">
              <el-tab-pane label="资源清单" name="all">
                <el-table :data="resourceRows" border height="320">
                  <el-table-column prop="name" label="名称" />
                  <el-table-column prop="ip" label="IP" width="130" />
                  <el-table-column prop="modelName" label="模型" width="110" />
                  <el-table-column prop="status" label="状态" width="90" />
                  <el-table-column prop="bizSystem" label="业务系统" />
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="闲置资源清单" name="idle">
                <el-table :data="idleRows" border height="320">
                  <el-table-column prop="name" label="名称" />
                  <el-table-column prop="ip" label="IP" width="130" />
                  <el-table-column prop="modelName" label="模型" width="110" />
                  <el-table-column prop="owner" label="负责人" width="110" />
                  <el-table-column prop="bizSystem" label="业务系统" />
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="异常资源清单" name="alert">
                <el-table :data="alertRows" border height="320">
                  <el-table-column prop="name" label="名称" />
                  <el-table-column prop="ip" label="IP" width="130" />
                  <el-table-column prop="modelName" label="模型" width="110" />
                  <el-table-column prop="statusDetail" label="异常信息" />
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>

  <el-dialog v-model="taskDialogVisible" :title="taskDialogTitle" width="520px">
    <el-form :model="taskForm" label-width="90px">
      <el-form-item label="采集对象">
        <el-input v-model="taskForm.target" placeholder="输入采集对象" />
      </el-form-item>
      <el-form-item label="采集方式">
        <el-select v-model="taskForm.method" placeholder="选择方式" style="width:100%">
          <el-option label="Agent 采集" value="Agent 采集" />
          <el-option label="SSH 采集" value="SSH 采集" />
          <el-option label="API 对接" value="API 对接" />
        </el-select>
      </el-form-item>
      <el-form-item label="采集频率">
        <el-input v-model="taskForm.frequency" placeholder="例如：30 分钟" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="taskForm.status" style="width:100%">
          <el-option label="运行中" value="运行中" />
          <el-option label="已暂停" value="已暂停" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="taskDialogVisible=false">取消</el-button>
      <el-button type="primary" @click="saveTask">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import BaseChart from '@/components/Chart/BaseChart.vue'
import {
  bulkUpdateCiStatus,
  getCategories,
  getCiModels,
  getCis,
  getCmdbStats,
  getDiscoveryLogs,
  getDiscoveryRules,
  getDiscoveryTasks,
  getLifecycleLogs,
  getMonitorStatus,
  getStatusOptions,
  runDiscovery,
  saveDiscoveryRules,
  toggleDiscoveryTask,
  createDiscoveryTask,
  updateDiscoveryTask,
  deleteDiscoveryTask
} from '@/mock-data/modules/cmdb'

const activeTab = ref('lifecycle')
const detailTab = ref('all')

const models = ref([])
const categories = ref([])
const statusOptions = ref([])
const allCis = ref([])
const baseRows = ref([])
const viewRows = ref([])
const selectedIds = ref([])
const lifecycleLogs = ref([])
const monitorMap = ref({})

const lifecycleLoading = ref(false)
const discoveryLoading = ref(false)
const statsLoading = ref(false)

const searchKeyword = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const filterBiz = ref('')
const filterOwner = ref('')
const quickView = ref('')

const statusForm = reactive({ status: '', reason: '' })

const discoveryTasks = ref([])
const discoveryLogs = ref([])
const ruleForm = reactive({ ipRanges: [], fields: [], dedup: '' })
const taskDialogVisible = ref(false)
const taskForm = reactive({ id: '', target: '', method: '', frequency: '', status: '运行中' })

const stats = reactive({ total: 0, onlineRate: 0, alertRate: 0, idleRate: 0, categoryCount: {}, bizCount: {} })
const categoryChart = ref({})
const bizChart = ref({})
const trendChart = ref({})

const resourceRows = computed(() => baseRows.value)
const idleRows = computed(() => baseRows.value.filter(r => r.status === '闲置'))
const alertRows = computed(() => baseRows.value.filter(r => monitorMap.value[r.id]?.status === 'alert').map(r => ({
  ...r,
  statusDetail: monitorMap.value[r.id]?.detail || '告警'
})))

const categoryOptions = computed(() => categories.value.filter(c => !c.parentId))
const reminders = computed(() => {
  const list = baseRows.value.filter(r => ['闲置', '待上线'].includes(r.status))
  return list.slice(0, 5).map(r => ({
    id: r.id,
    title: `${r.name} 需要确认状态`,
    meta: `${r.status} · ${r.bizSystem || '未归属'}`
  }))
})

const headCards = computed(() => [
  { label: '资源总量', value: stats.total },
  { label: '在线率', value: `${stats.onlineRate}%` },
  { label: '异常率', value: `${stats.alertRate}%` },
  { label: '闲置率', value: `${stats.idleRate}%` }
])

const taskDialogTitle = computed(() => (taskForm.id ? '编辑采集任务' : '新增采集任务'))

const statusTag = (status) => {
  if (status === '在线') return 'success'
  if (status === '维修') return 'warning'
  if (status === '报废') return 'danger'
  return 'info'
}

const buildRows = () => {
  const rows = allCis.value.map(ci => {
    const model = models.value.find(m => m.code === ci.modelCode)
    const displayKey = model?.displayField
    const name = displayKey ? ci.attributes?.[displayKey] : ci.id
    const category = categories.value.find(c => c.id === model?.categoryId)
    return {
      id: ci.id,
      name: name || ci.id,
      ip: ci.attributes?.ip || '-',
      modelName: model?.name || ci.modelCode,
      categoryId: model?.categoryId,
      categoryName: category?.name || '未分类',
      owner: ci.attributes?.owner || '-',
      status: ci.status,
      bizSystem: ci.attributes?.bizSystem || '-'
    }
  })
  baseRows.value = rows
  applyFilters()
}

const applyFilters = () => {
  const keyword = searchKeyword.value.trim()
  let rows = [...baseRows.value]
  if (keyword) {
    rows = rows.filter(r => [r.name, r.ip, r.owner, r.bizSystem].some(v => String(v).includes(keyword)))
  }
  if (filterCategory.value) rows = rows.filter(r => r.categoryId === filterCategory.value)
  if (filterStatus.value) rows = rows.filter(r => r.status === filterStatus.value)
  if (filterBiz.value) rows = rows.filter(r => r.bizSystem.includes(filterBiz.value))
  if (filterOwner.value) rows = rows.filter(r => r.owner.includes(filterOwner.value))

  if (quickView.value === 'mine') rows = rows.filter(r => r.owner.includes('运维'))
  if (quickView.value === 'online') rows = rows.filter(r => r.status === '在线')
  if (quickView.value === 'idle') rows = rows.filter(r => r.status === '闲置')
  if (quickView.value === 'alert') rows = rows.filter(r => monitorMap.value[r.id]?.status === 'alert')

  viewRows.value = rows
}

const resetFilters = () => {
  searchKeyword.value = ''
  filterCategory.value = ''
  filterStatus.value = ''
  filterBiz.value = ''
  filterOwner.value = ''
  quickView.value = ''
  buildRows()
}

const toggleQuick = (type) => {
  quickView.value = quickView.value === type ? '' : type
  applyFilters()
}

const onSelectionChange = (rows) => {
  selectedIds.value = rows.map(r => r.id)
}

const applyStatus = async () => {
  if (!statusForm.status) {
    ElMessage.warning('请选择目标状态')
    return
  }
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择需要变更的资源')
    return
  }
  await bulkUpdateCiStatus(selectedIds.value, statusForm.status, statusForm.reason || '批量变更')
  ElMessage.success('状态已更新')
  await loadLifecycle()
}

const clearStatusForm = () => {
  statusForm.status = ''
  statusForm.reason = ''
}

const loadLifecycle = async () => {
  lifecycleLoading.value = true
  try {
    allCis.value = await getCis({})
    lifecycleLogs.value = (await getLifecycleLogs()).map(log => {
      const ci = allCis.value.find(c => c.id === log.ciId)
      const model = models.value.find(m => m.code === ci?.modelCode)
      const key = model?.displayField
      const name = key ? ci?.attributes?.[key] : ci?.id
      return { ...log, ciName: name || log.ciId }
    })
    await loadMonitor()
    buildRows()
  } finally {
    lifecycleLoading.value = false
  }
}

const loadMonitor = async () => {
  const entries = await Promise.all(allCis.value.map(async ci => [ci.id, await getMonitorStatus(ci.id)]))
  monitorMap.value = Object.fromEntries(entries)
}

const loadDiscovery = async () => {
  discoveryLoading.value = true
  try {
    discoveryTasks.value = await getDiscoveryTasks()
    discoveryLogs.value = await getDiscoveryLogs()
    const rule = await getDiscoveryRules()
    ruleForm.ipRanges = rule.ipRanges || []
    ruleForm.fields = rule.fields || []
    ruleForm.dedup = rule.dedup || ''
  } finally {
    discoveryLoading.value = false
  }
}

const openTaskDialog = (row) => {
  if (row) {
    taskForm.id = row.id
    taskForm.target = row.target
    taskForm.method = row.method
    taskForm.frequency = row.frequency
    taskForm.status = row.status
  } else {
    taskForm.id = ''
    taskForm.target = ''
    taskForm.method = 'Agent 采集'
    taskForm.frequency = '30 分钟'
    taskForm.status = '运行中'
  }
  taskDialogVisible.value = true
}

const saveTask = async () => {
  if (!taskForm.target) {
    ElMessage.warning('请填写采集对象')
    return
  }
  if (taskForm.id) {
    await updateDiscoveryTask(taskForm.id, taskForm)
  } else {
    await createDiscoveryTask(taskForm)
  }
  taskDialogVisible.value = false
  await loadDiscovery()
  ElMessage.success('任务已保存')
}

const toggleTask = async (row) => {
  await toggleDiscoveryTask(row.id)
  await loadDiscovery()
}

const removeTask = async (row) => {
  await deleteDiscoveryTask(row.id)
  await loadDiscovery()
}

const saveRules = async () => {
  await saveDiscoveryRules({
    ipRanges: ruleForm.ipRanges,
    fields: ruleForm.fields,
    dedup: ruleForm.dedup
  })
  ElMessage.success('规则已保存')
}

const runDiscoveryNow = async () => {
  await runDiscovery({ modelCode: 'host', count: 3 })
  await loadDiscovery()
  ElMessage.success('已触发采集')
}

const buildCharts = () => {
  const categoryData = Object.entries(stats.categoryCount || {}).map(([name, value]) => ({ name, value }))
  const bizData = Object.entries(stats.bizCount || {})
  categoryChart.value = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      label: { color: '#334155' },
      data: categoryData
    }]
  }
  bizChart.value = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: bizData.map(d => d[0]), axisLabel: { color: '#475569' } },
    yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
    series: [{ type: 'bar', data: bizData.map(d => d[1]), itemStyle: { color: '#3b82f6' } }]
  }
  const days = Array.from({ length: 7 }).map((_, idx) => `近${7 - idx}日`)
  const base = stats.total || 10
  const trend = days.map((_, idx) => Math.max(1, base - (6 - idx) * 2))
  trendChart.value = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: days, axisLabel: { color: '#475569' } },
    yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
    series: [{ type: 'line', data: trend, smooth: true, itemStyle: { color: '#10b981' } }]
  }
}

const loadStats = async () => {
  statsLoading.value = true
  try {
    const res = await getCmdbStats()
    Object.assign(stats, res)
    buildCharts()
  } finally {
    statsLoading.value = false
  }
}

onMounted(async () => {
  models.value = await getCiModels()
  categories.value = await getCategories()
  statusOptions.value = await getStatusOptions()
  await loadLifecycle()
  await loadDiscovery()
  await loadStats()
})
</script>

<style scoped>
.lifecycle-page {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.page-head {
  border: 1px solid #e5edf8;
  border-radius: 12px;
  padding: 14px;
  background: linear-gradient(115deg, rgba(37, 99, 235, 0.1), rgba(255, 255, 255, 0.96));
  display: grid;
  gap: 12px;
}

.head-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.head-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.55;
}

.head-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.head-stat-card {
  border: 1px solid #dbe7fb;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  padding: 10px 12px;
}

.head-stat-label {
  font-size: 12px;
  color: #64748b;
}

.head-stat-value {
  margin-top: 4px;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.lifecycle-tabs {
  border: 1px solid #e5edf8;
  border-radius: 12px;
  background: #fff;
  padding: 12px;
}

.lifecycle-tabs :deep(.el-tabs__header) {
  margin-bottom: 12px;
}

.lifecycle-tabs :deep(.el-tabs__item) {
  font-weight: 600;
}

.tab-shell {
  display: grid;
  gap: 12px;
}

.filter-panel {
  border: 1px solid #e5edf8;
  border-radius: 10px;
  background: linear-gradient(135deg, #ffffff, #f8fbff);
  padding: 12px;
}

.filter-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.input-wide {
  width: 280px;
}

.input-sm {
  width: 180px;
}

.input-xs {
  width: 140px;
}

.quick-row {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.quick-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.lifecycle-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  gap: 12px;
}

.side-stack {
  display: grid;
  gap: 12px;
}

.discovery-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  gap: 12px;
}

.toolbar-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.task-action-row {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.task-action-row :deep(.el-button + .el-button) {
  margin-left: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.stat-card {
  border: 1px solid #e5edf8;
  border-radius: 10px;
  background: #fff;
  padding: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.stat-label {
  font-size: 12px;
  color: #64748b;
}

.stat-value {
  margin-top: 4px;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.panel-card {
  border: 1px solid #e5edf8;
  border-radius: 10px;
}

.list-card :deep(.el-card__body) {
  padding-top: 10px;
}

.card-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.panel-card :deep(.el-table__header) th {
  background: #f3f7ff;
  color: #0f172a;
  font-weight: 700;
}

.panel-card :deep(.el-table__row:hover) td {
  background: #f8fbff;
}

.reminder {
  border: 1px solid #e5edf8;
  background: #f8fbff;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 8px;
}

.reminder-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.reminder-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.reminder-empty {
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 1280px) {
  .head-stats,
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }

  .lifecycle-grid,
  .discovery-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .lifecycle-page {
    padding: 10px;
  }

  .head-stats,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .input-wide,
  .input-sm,
  .input-xs {
    width: 100%;
  }

  .task-action-row {
    gap: 6px;
  }
}
</style>

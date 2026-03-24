<template>
  <div class="container monitor-overview-page">
    <div class="page-title">监控告警总览</div>

    <div class="section-panel overview-filter-section">
      <QueryBar class="overview-query-bar">
        <template #default>
          <el-form class="filter-form" inline>
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
    </div>

    <el-card shadow="never" class="panel section-panel" v-loading="loading">
      <div class="metric-block">
        <div class="block-title">资源监控类指标</div>
        <div class="metric-grid top">
          <article class="metric-card total" @click="goMonitorCenter()">
            <div class="label">监控资源总数</div>
            <div class="value">{{ resourceMetrics.total }}</div>
          </article>
          <article class="metric-card normal" @click="goMonitorCenter({ status: '正常' })">
            <div class="label">正常资源数</div>
            <div class="value">{{ resourceMetrics.normal }}</div>
          </article>
          <article class="metric-card abnormal" @click="goMonitorCenter()">
            <div class="label">异常资源数</div>
            <div class="value">{{ resourceMetrics.abnormal }}</div>
          </article>
        </div>
        <div class="metric-grid category">
          <article
            v-for="item in resourceMetrics.categoryStats"
            :key="item.key"
            class="metric-card category-card"
            @click="goMonitorCenter({ category: item.key })"
          >
            <div class="label">{{ item.label }}</div>
            <div class="value">{{ item.total }}</div>
          </article>
        </div>
      </div>

      <div class="metric-block">
        <div class="block-title">告警统计类指标</div>
        <div class="metric-grid alarm">
          <article class="metric-card total" @click="goAlarmList()">
            <div class="label">今日告警总量</div>
            <div class="value">{{ alarmMetrics.todayTotal }}</div>
          </article>
          <article class="metric-card urgent" @click="goAlarmList({ level: levelLabels[0] })">
            <div class="label">{{ levelLabels[0] || '一级告警' }}</div>
            <div class="value">{{ alarmMetrics.level1 }}</div>
          </article>
          <article class="metric-card warning" @click="goAlarmList({ level: levelLabels[1] })">
            <div class="label">{{ levelLabels[1] || '二级告警' }}</div>
            <div class="value">{{ alarmMetrics.level2 }}</div>
          </article>
          <article class="metric-card info" @click="goAlarmList({ level: levelLabels[2] })">
            <div class="label">{{ levelLabels[2] || '三级告警' }}</div>
            <div class="value">{{ alarmMetrics.level3 }}</div>
          </article>
          <article class="metric-card warning" @click="goAlarmList({ status: statusLabels[0] })">
            <div class="label">未处理告警数</div>
            <div class="value">{{ alarmMetrics.unhandled }}</div>
          </article>
          <article class="metric-card normal" @click="goAlarmList({ dispatched: '是' })">
            <div class="label">已派单告警数</div>
            <div class="value">{{ alarmMetrics.dispatched }}</div>
          </article>
          <article class="metric-card recovered" @click="goAlarmList({ status: statusLabels[2] })">
            <div class="label">告警恢复数</div>
            <div class="value">{{ alarmMetrics.recovered }}</div>
          </article>
        </div>
      </div>
    </el-card>

    <el-row :gutter="12" class="chart-row" v-loading="loading">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="panel chart-card">
          <template #header>
            <div class="chart-title">近 7 日资源健康趋势</div>
          </template>
          <div class="chart-box">
            <BaseChart ref="resourceChartRef" :options="resourceTrendOption" height="280px" />
            <div class="chart-overlay" @click="goMonitorCenter()" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="panel chart-card">
          <template #header>
            <div class="chart-title">近 7 日告警数量趋势</div>
          </template>
          <div class="chart-box">
            <BaseChart ref="alarmTrendChartRef" :options="alarmTrendOption" height="280px" />
            <div class="chart-overlay" @click="goAlarmList()" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="panel chart-card">
          <template #header>
            <div class="chart-title">告警分类分布</div>
          </template>
          <div class="chart-box">
            <BaseChart ref="categoryChartRef" :options="categoryDistOption" height="280px" />
            <div class="chart-overlay" @click="goAlarmList()" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="panel chart-card">
          <template #header>
            <div class="chart-title">告警等级分布</div>
          </template>
          <div class="chart-box">
            <BaseChart ref="levelChartRef" :options="levelDistOption" height="280px" />
            <div class="chart-overlay" @click="goAlarmList()" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseChart from '@/components/Chart/BaseChart.vue'
import QueryBar from '@/components/Common/QueryBar.vue'
import { getMonitorAlarmOverview } from '@/mock-data/modules/alarm'

const router = useRouter()

const loading = ref(false)
const query = reactive({
  timeRange: []
})

const resourceMetrics = reactive({
  total: 0,
  normal: 0,
  abnormal: 0,
  categoryStats: []
})

const alarmMetrics = reactive({
  todayTotal: 0,
  level1: 0,
  level2: 0,
  level3: 0,
  unhandled: 0,
  dispatched: 0,
  recovered: 0
})

const trends = reactive({
  resourceHealth: [],
  alarm: []
})

const distributions = reactive({
  alarmCategory: [],
  alarmLevel: []
})

const levelLabels = ref([])
const statusLabels = ref([])

const resourceChartRef = ref(null)
const alarmTrendChartRef = ref(null)
const categoryChartRef = ref(null)
const levelChartRef = ref(null)

const resourceTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['正常', '异常'] },
  xAxis: { type: 'category', data: trends.resourceHealth.map((item) => item.day) },
  yAxis: { type: 'value' },
  series: [
    { name: '正常', type: 'line', smooth: true, data: trends.resourceHealth.map((item) => item.normal), itemStyle: { color: '#16a34a' } },
    { name: '异常', type: 'line', smooth: true, data: trends.resourceHealth.map((item) => item.abnormal), itemStyle: { color: '#ef4444' } }
  ]
}))

const alarmTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: trends.alarm.map((item) => item.day) },
  yAxis: { type: 'value' },
  series: [
    {
      name: '告警数量',
      type: 'bar',
      data: trends.alarm.map((item) => item.total),
      itemStyle: { color: '#3b82f6' }
    }
  ]
}))

const categoryDistOption = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [
    {
      type: 'pie',
      radius: ['38%', '66%'],
      data: distributions.alarmCategory.map((item) => ({
        key: item.key,
        name: item.name,
        value: item.value
      }))
    }
  ]
}))

const levelDistOption = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [
    {
      type: 'pie',
      radius: ['35%', '65%'],
      data: distributions.alarmLevel.map((item) => ({ name: item.name, value: item.value }))
    }
  ]
}))

function toDayRange(day) {
  return {
    startTime: `${day} 00:00:00`,
    endTime: `${day} 23:59:59`
  }
}

function baseQueryRange() {
  if (Array.isArray(query.timeRange) && query.timeRange.length === 2) {
    return { startTime: query.timeRange[0], endTime: query.timeRange[1] }
  }
  return {}
}

function goMonitorCenter(extra = {}) {
  const payload = {
    ...baseQueryRange(),
    category: extra.category || '',
    status: extra.status || '',
    keyword: ''
  }
  router.push({ path: '/alarm/center', query: payload })
}

function goAlarmList(extra = {}) {
  const payload = {
    ...baseQueryRange(),
    type: extra.type || '',
    level: extra.level || '',
    status: extra.status || '',
    dispatched: extra.dispatched || ''
  }
  router.push({ path: '/alarm/lifecycle', query: payload })
}

function bindChartEvents() {
  const resourceChart = resourceChartRef.value?.getChart?.()
  if (resourceChart) {
    resourceChart.off('click')
    resourceChart.on('click', (params) => {
      const range = toDayRange(params.name)
      goMonitorCenter(range)
    })
  }

  const alarmTrendChart = alarmTrendChartRef.value?.getChart?.()
  if (alarmTrendChart) {
    alarmTrendChart.off('click')
    alarmTrendChart.on('click', (params) => {
      const range = toDayRange(params.name)
      goAlarmList(range)
    })
  }

  const categoryChart = categoryChartRef.value?.getChart?.()
  if (categoryChart) {
    categoryChart.off('click')
    categoryChart.on('click', (params) => {
      const category = params?.data?.key || ''
      goAlarmList({ type: mapMonitorCategoryToAlarmType(category) })
    })
  }

  const levelChart = levelChartRef.value?.getChart?.()
  if (levelChart) {
    levelChart.off('click')
    levelChart.on('click', (params) => {
      goAlarmList({ level: params.name })
    })
  }
}

function normalizeQuery() {
  return {
    timeRange: query.timeRange
  }
}

async function loadData() {
  loading.value = true
  try {
    const data = await getMonitorAlarmOverview(normalizeQuery())
    Object.assign(resourceMetrics, data.resourceMetrics || {})
    Object.assign(alarmMetrics, data.alarmMetrics || {})
    trends.resourceHealth = data.trends?.resourceHealth || []
    trends.alarm = data.trends?.alarm || []
    distributions.alarmCategory = data.distributions?.alarmCategory || []
    distributions.alarmLevel = data.distributions?.alarmLevel || []
    levelLabels.value = data.optionMeta?.levelLabels || alarmLevelOptions.value
    statusLabels.value = data.optionMeta?.statusLabels || alarmStatusOptions.value
  } finally {
    loading.value = false
  }
}

async function search() {
  await loadData()
}

async function resetQuery() {
  query.timeRange = []
  await loadData()
}

watch(
  () => [resourceTrendOption.value, alarmTrendOption.value, categoryDistOption.value, levelDistOption.value],
  async () => {
    await nextTick()
    bindChartEvents()
  },
  { deep: true }
)

onMounted(async () => {
  await loadData()
})
</script>

<style scoped>
.monitor-overview-page {
  display: grid;
  gap: 12px;
}

.section-panel {
  margin-bottom: 0;
}

.overview-filter-section :deep(.overview-query-bar.query-bar) {
  padding: 0;
  margin-bottom: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  row-gap: 8px;
}

.filter-item {
  margin-bottom: 0;
}

.metric-block + .metric-block {
  margin-top: 14px;
}

.block-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}

.metric-grid {
  display: grid;
  gap: 10px;
}

.metric-grid.top {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 10px;
}

.metric-grid.category {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.metric-grid.alarm {
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.metric-card {
  border: 1px solid #e5edf8;
  border-radius: 10px;
  padding: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
}

.metric-card .label {
  font-size: 12px;
  color: #64748b;
}

.metric-card .value {
  margin-top: 6px;
  font-size: 24px;
  line-height: 1;
  font-weight: 700;
  color: #0f172a;
}

.metric-card.total {
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.08), #ffffff);
}

.metric-card.normal {
  background: linear-gradient(180deg, rgba(22, 163, 74, 0.12), #ffffff);
}

.metric-card.abnormal {
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.12), #ffffff);
}

.metric-card.urgent {
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.14), #ffffff);
}

.metric-card.warning {
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.14), #ffffff);
}

.metric-card.info {
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.12), #ffffff);
}

.metric-card.recovered {
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.14), #ffffff);
}

.chart-row {
  margin: 0;
}

.chart-card {
  margin-bottom: 12px;
}

.chart-box {
  position: relative;
}

.chart-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  cursor: pointer;
  background: transparent;
}

.chart-click {
  cursor: pointer;
}

.chart-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

@media (max-width: 1600px) {
  .metric-grid.category {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .metric-grid.alarm {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .metric-grid.top,
  .metric-grid.category,
  .metric-grid.alarm {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .metric-grid.top,
  .metric-grid.category,
  .metric-grid.alarm {
    grid-template-columns: 1fr;
  }
}
</style>

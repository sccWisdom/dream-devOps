<template>
  <div class="container ops-report-page" v-loading="loading">
    <div class="report-head panel">
      <div class="head-main">
        <div class="page-title" style="margin-bottom: 4px;">{{ report?.title || '运维报表' }}</div>
        <div class="head-subtitle">{{ report?.subtitle }}</div>
        <div class="head-meta">
          <span>归口团队：{{ report?.owner || '-' }}</span>
          <span>更新时间：{{ report?.updatedAt || '-' }}</span>
        </div>
      </div>
      <div class="head-tools">
        <el-radio-group v-model="period" size="small" @change="handlePeriodChange">
          <el-radio-button
            v-for="option in periodOptions"
            :key="option.value"
            :label="option.value"
          >
            {{ option.label }}
          </el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-if="period === 'custom'"
          v-model="customRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          @change="handleRangeChange"
        />
        <el-button size="small" @click="load">
          刷新
        </el-button>
        <el-button type="primary" size="small" @click="onExport">
          导出报表
        </el-button>
      </div>
    </div>

    <div class="alert-list" v-if="report?.alerts?.length">
      <el-alert
        v-for="(item, idx) in report.alerts"
        :key="`${item.title}-${idx}`"
        :type="item.type"
        :title="item.title"
        :description="item.desc"
        show-icon
        :closable="false"
      />
    </div>

    <div class="kpi-grid">
      <div
        v-for="item in report?.kpis || []"
        :key="item.label"
        class="kpi-card"
      >
        <div class="kpi-label">{{ item.label }}</div>
        <div class="kpi-value">{{ item.valueText }}</div>
        <div class="kpi-foot">
          <span class="kpi-trend" :class="`tone-${item.trendTone}`">{{ item.trendText }}</span>
          <span class="kpi-badge" :class="`badge-${item.trendTone}`">{{ item.badge }}</span>
        </div>
      </div>
    </div>

    <div class="grid">
      <el-card shadow="never" class="panel span-8">
        <div class="panel-title">{{ report?.trendTitle }}</div>
        <BaseChart :options="trendOption" height="320px" />
      </el-card>

      <el-card shadow="never" class="panel span-4">
        <div class="panel-title">{{ report?.distributionTitle }}</div>
        <BaseChart :options="distributionOption" height="320px" />
      </el-card>

      <el-card shadow="never" class="panel span-8">
        <div class="panel-title">{{ report?.executionTitle }}</div>
        <BaseChart :options="executionOption" height="300px" />
      </el-card>

      <el-card shadow="never" class="panel span-4">
        <div class="panel-title">{{ report?.riskTitle }}</div>
        <div class="risk-list">
          <div v-for="item in report?.risks || []" :key="item.name" class="risk-row">
            <div class="risk-top">
              <span>{{ item.name }}</span>
              <span :class="`risk-${item.status}`">{{ item.valueText }}</span>
            </div>
            <el-progress
              :percentage="item.score"
              :status="item.status === 'risk' ? 'exception' : (item.status === 'good' ? 'success' : '')"
              :stroke-width="8"
              :show-text="false"
            />
            <div class="risk-target">目标：{{ item.targetText }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="grid second-grid">
      <el-card shadow="never" class="panel span-7">
        <div class="panel-title">指标口径设计</div>
        <el-table :data="report?.indicatorCatalog || []" size="small" border stripe>
          <el-table-column prop="dimension" label="维度" width="100" />
          <el-table-column prop="metric" label="指标" width="130" />
          <el-table-column prop="formula" label="口径说明" min-width="230" />
          <el-table-column prop="target" label="目标值" width="120" />
          <el-table-column prop="frequency" label="频率" width="90" />
          <el-table-column prop="source" label="数据源" width="110" />
        </el-table>
      </el-card>

      <el-card shadow="never" class="panel span-5">
        <div class="panel-title">行动清单与关键事件</div>
        <el-table :data="report?.actions || []" size="small" border>
          <el-table-column prop="owner" label="责任团队" width="94" />
          <el-table-column prop="action" label="行动项" min-width="156" />
          <el-table-column prop="due" label="截止时间" width="96" />
          <el-table-column prop="priority" label="优先级" width="80">
            <template #default="{ row }">
              <el-tag :type="priorityType[row.priority] || 'info'" size="small">{{ row.priority }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="86">
            <template #default="{ row }">
              <el-tag :type="statusType[row.status] || 'info'" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="timeline-title">关键事件时间线</div>
        <el-timeline>
          <el-timeline-item
            v-for="item in report?.timeline || []"
            :key="`${item.time}-${item.title}`"
            :type="item.type"
            :timestamp="item.time"
            placement="top"
          >
            <div class="timeline-item-title">{{ item.title }}</div>
            <div class="timeline-item-content">{{ item.content }}</div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>

    <el-card shadow="never" class="panel detail-panel">
      <div class="panel-title">{{ report?.detailTitle }}</div>
      <el-table :data="report?.details || []" border stripe>
        <el-table-column
          v-for="column in report?.detailColumns || []"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
        >
          <template #default="{ row }">
            <el-tag
              v-if="column.tagType"
              :type="column.tagType[row[column.prop]] || 'info'"
              size="small"
            >
              {{ row[column.prop] }}
            </el-tag>
            <span v-else>{{ row[column.prop] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import BaseChart from '@/components/Chart/BaseChart.vue'
import { getOpsReportData } from '@/mock-data/modules/ops-report'

const props = defineProps({
  reportType: { type: String, required: true }
})

const loading = ref(false)
const report = ref(null)
const period = ref('week')
const customRange = ref([])
const periodOptions = ref([
  { value: 'day', label: '日报' },
  { value: 'week', label: '周报' },
  { value: 'month', label: '月报' },
  { value: 'custom', label: '自定义' }
])

const priorityType = {
  高: 'danger',
  中: 'warning',
  低: 'info'
}

const statusType = {
  进行中: 'warning',
  待开始: 'info',
  待评审: '',
  已完成: 'success'
}

const trendOption = computed(() => {
  const data = report.value?.trend || []
  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 2 },
    grid: { left: 18, right: 12, top: 38, bottom: 12, containLabel: true },
    xAxis: { type: 'category', data: data.map(item => item.name), boundaryGap: false },
    yAxis: { type: 'value' },
    series: [
      {
        name: '实际值',
        type: 'line',
        smooth: true,
        data: data.map(item => item.value),
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.14 }
      }
    ]
  }
})

const distributionOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [
    {
      type: 'pie',
      radius: ['42%', '72%'],
      center: ['50%', '44%'],
      label: { formatter: '{b}\n{d}%' },
      itemStyle: { borderRadius: 8, borderWidth: 1 },
      data: report.value?.distribution || []
    }
  ]
}))

const executionOption = computed(() => {
  const data = report.value?.execution || []
  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 2 },
    grid: { left: 18, right: 12, top: 38, bottom: 12, containLabel: true },
    xAxis: { type: 'category', data: data.map(item => item.name) },
    yAxis: { type: 'value' },
    series: [
      {
        name: '已完成',
        type: 'bar',
        stack: 'total',
        barWidth: 12,
        data: data.map(item => item.done),
        itemStyle: { borderRadius: [8, 8, 0, 0] }
      },
      {
        name: '处理中',
        type: 'bar',
        stack: 'total',
        barWidth: 12,
        data: data.map(item => item.inProgress)
      },
      {
        name: '延期',
        type: 'bar',
        stack: 'total',
        barWidth: 12,
        data: data.map(item => item.delayed)
      }
    ]
  }
})

async function load() {
  loading.value = true
  try {
    const data = await getOpsReportData(props.reportType, {
      period: period.value,
      range: period.value === 'custom' ? customRange.value : undefined
    })
    report.value = data
    periodOptions.value = data.periodOptions || periodOptions.value
    if (period.value !== data.period) period.value = data.period
  } finally {
    loading.value = false
  }
}

function handlePeriodChange(next) {
  if (next === 'custom' && !customRange.value.length) {
    customRange.value = [dayjs().subtract(13, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
  }
  load()
}

function handleRangeChange() {
  if (period.value === 'custom') load()
}

function onExport() {
  ElMessage.success(`已提交《${report.value?.title || '运维报表'}》导出任务`)
}

onMounted(load)
</script>

<style scoped>
.report-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  background:
    linear-gradient(120deg, rgba(37, 99, 235, 0.08), rgba(255, 255, 255, 0.92)),
    radial-gradient(circle at 80% -20%, rgba(30, 64, 175, 0.13), rgba(0, 0, 0, 0) 60%);
}

.head-subtitle {
  font-size: 13px;
  color: rgba(71, 85, 105, 0.95);
}

.head-meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: rgba(100, 116, 139, 0.92);
}

.head-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.alert-list {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.kpi-card {
  border-radius: 12px;
  border: 1px solid #e7edf8;
  padding: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(241, 245, 255, 0.72));
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.kpi-label {
  font-size: 12px;
  color: rgba(71, 85, 105, 0.95);
}

.kpi-value {
  margin-top: 6px;
  font-size: 23px;
  font-weight: 800;
  color: #0f172a;
}

.kpi-foot {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.kpi-trend {
  font-size: 12px;
  font-weight: 700;
}

.kpi-badge {
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
}

.tone-good { color: #15803d; }
.tone-flat { color: #475569; }
.tone-risk { color: #b91c1c; }

.badge-good {
  color: #166534;
  background: rgba(34, 197, 94, 0.15);
}

.badge-flat {
  color: #334155;
  background: rgba(148, 163, 184, 0.18);
}

.badge-risk {
  color: #991b1b;
  background: rgba(239, 68, 68, 0.16);
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.second-grid {
  align-items: start;
}

.span-8 { grid-column: span 8; }
.span-7 { grid-column: span 7; }
.span-5 { grid-column: span 5; }
.span-4 { grid-column: span 4; }

.panel-title {
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.9);
}

.risk-list {
  display: grid;
  gap: 11px;
}

.risk-row {
  border: 1px solid #ecf0f7;
  border-radius: 10px;
  padding: 8px 10px;
  background: rgba(248, 250, 252, 0.92);
}

.risk-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
}

.risk-good { color: #166534; font-weight: 700; }
.risk-warn { color: #92400e; font-weight: 700; }
.risk-risk { color: #991b1b; font-weight: 700; }

.risk-target {
  margin-top: 6px;
  font-size: 11px;
  color: rgba(100, 116, 139, 0.9);
}

.timeline-title {
  margin-top: 14px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.85);
}

.timeline-item-title {
  font-size: 12px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.9);
}

.timeline-item-content {
  margin-top: 3px;
  font-size: 12px;
  color: rgba(71, 85, 105, 0.88);
}

.detail-panel {
  padding-top: 8px;
}

@media (max-width: 1460px) {
  .kpi-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1220px) {
  .span-8,
  .span-7,
  .span-5 {
    grid-column: 1 / -1;
  }
  .span-4 {
    grid-column: span 6;
  }
}

@media (max-width: 900px) {
  .report-head {
    flex-direction: column;
  }
  .head-tools {
    justify-content: flex-start;
  }
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .span-4 {
    grid-column: 1 / -1;
  }
}

@media (max-width: 680px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>


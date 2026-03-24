<template>
  <div class="container reports">
    <div class="head">
      <div class="page-title" style="margin:0">运维报表</div>
      <div class="filters">
        <el-radio-group v-model="mode" size="small">
          <el-radio-button label="day">日报</el-radio-button>
          <el-radio-button label="week">周报</el-radio-button>
          <el-radio-button label="custom">自定义</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-model="range"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
        />
        <el-button type="primary" size="small" @click="reload">
          <el-icon style="margin-right:6px"><RefreshRight /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">总工单</div>
        <div class="kpi-value">{{ kpi.total }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">已解决</div>
        <div class="kpi-value">{{ kpi.resolved }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">超时工单</div>
        <div class="kpi-value">{{ kpi.overtime }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">平均响应</div>
        <div class="kpi-value">{{ kpi.avgResponseMin }}<span class="kpi-unit">min</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Top 系统</div>
        <div class="kpi-value kpi-text">{{ kpi.topSystem || '-' }}</div>
      </div>
    </div>

    <div class="grid">
      <el-card shadow="never" class="panel span-8">
        <LineChart :data="trend" title="工单趋势" height="340px" />
      </el-card>

      <el-card shadow="never" class="panel span-4">
        <BaseChart :options="priorityOption" height="340px" />
      </el-card>

      <el-card shadow="never" class="panel span-4">
        <BaseChart :options="topSystemOption" height="300px" />
      </el-card>

      <el-card shadow="never" class="panel span-8">
        <BaseChart :options="typeStackOption" height="300px" />
      </el-card>
    </div>

    <el-card shadow="never" class="panel table-panel">
      <div class="table-title">明细列表</div>
      <el-table :data="latest" border stripe>
        <el-table-column prop="id" label="单号" width="170" />
        <el-table-column prop="type" label="类型" width="80" />
        <el-table-column prop="title" label="标题" min-width="260" />
        <el-table-column prop="priority" label="优先级" width="80" />
        <el-table-column prop="status" label="状态" width="110" />
        <el-table-column prop="system" label="系统" width="140" />
      </el-table>
    </el-card>
  </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'
import BaseChart from '@/components/Chart/BaseChart.vue'
import LineChart from '@/components/Chart/LineChart.vue'
import { getReportData } from '@/mock-data/modules/workbench'

const mode = ref('week')
const range = ref([])

const kpi = ref({ total: 0, resolved: 0, overtime: 0, avgResponseMin: 0, topSystem: '' })
const trend = ref([])
const byType = ref([])
const priorityPie = ref([])
const topSystems = ref([])
const latest = ref([])

const priorityOption = computed(() => ({
  title: { text: '优先级占比', left: 'left', textStyle: { fontSize: 12, fontWeight: 700 } },
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [
    {
      type: 'pie',
      radius: ['46%', '74%'],
      center: ['50%', '46%'],
      itemStyle: { borderRadius: 6, borderWidth: 1 },
      label: { formatter: '{b}\n{d}%' },
      data: priorityPie.value
    }
  ]
}))

const topSystemOption = computed(() => ({
  title: { text: 'Top 系统工单量', left: 'left', textStyle: { fontSize: 12, fontWeight: 700 } },
  tooltip: { trigger: 'axis' },
  grid: { left: 18, right: 12, top: 28, bottom: 12, containLabel: true },
  xAxis: { type: 'value' },
  yAxis: { type: 'category', data: topSystems.value.map(i => i.name) },
  series: [
    {
      type: 'bar',
      barWidth: 10,
      data: topSystems.value.map(i => i.value),
      itemStyle: { borderRadius: [0, 6, 6, 0] }
    }
  ]
}))

const typeStackOption = computed(() => ({
  title: { text: '按类型拆分（待处理/已关闭）', left: 'left', textStyle: { fontSize: 12, fontWeight: 700 } },
  tooltip: { trigger: 'axis' },
  legend: { top: 0 },
  grid: { left: 18, right: 12, top: 38, bottom: 12, containLabel: true },
  xAxis: { type: 'category', data: byType.value.map(i => i.name) },
  yAxis: { type: 'value' },
  series: [
    { name: '待处理', type: 'bar', stack: 'total', data: byType.value.map(i => i.open), barWidth: 12, itemStyle: { borderRadius: [6, 6, 0, 0] } },
    { name: '已关闭', type: 'bar', stack: 'total', data: byType.value.map(i => i.closed), barWidth: 12, itemStyle: { borderRadius: [6, 6, 0, 0] } }
  ]
}))

const reload = async () => {
  const d = await getReportData({ mode: mode.value, range: range.value })
  kpi.value = d.kpi || kpi.value
  trend.value = d.trend || []
  byType.value = d.byType || []
  priorityPie.value = d.priorityPie || []
  topSystems.value = d.topSystems || []
  latest.value = d.latest || []
}

onMounted(reload)
</script>
<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.kpi-card {
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.06), rgba(255,255,255,0.9));
  border: 1px solid #e8eefc;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
  padding: 12px 12px;
}

.kpi-label {
  font-size: 12px;
  color: rgba(71, 85, 105, 0.82);
}

.kpi-value {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.92);
}

.kpi-text {
  font-size: 16px;
  font-weight: 700;
}

.kpi-unit {
  font-size: 12px;
  font-weight: 700;
  margin-left: 6px;
  color: rgba(100, 116, 139, 0.9);
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.span-8 {
  grid-column: span 8;
}

.span-4 {
  grid-column: span 4;
}

.table-panel {
  padding-top: 8px;
}

.table-title {
  font-size: 13px;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.86);
  margin-bottom: 10px;
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .span-8 {
    grid-column: 1 / -1;
  }
  .span-4 {
    grid-column: span 6;
  }
}

@media (max-width: 860px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .span-4 {
    grid-column: 1 / -1;
  }
}
</style>

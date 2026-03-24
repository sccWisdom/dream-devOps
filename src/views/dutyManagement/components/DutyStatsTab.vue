<template>
  <el-card shadow="never" class="panel" style="margin-bottom:12px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div style="font-weight:700">值班统计</div>
      <el-space wrap>
        <el-date-picker v-model="month" type="month" value-format="YYYY-MM" format="YYYY-MM" />
        <el-button @click="reload">刷新</el-button>
      </el-space>
    </div>
  </el-card>

  <div class="stat-grid" style="margin-bottom:12px">
    <div class="stat-card">
      <div class="label">排班总天数</div>
      <div class="value">{{ stats?.kpi?.totalDuty ?? 0 }}</div>
    </div>
    <div class="stat-card">
      <div class="label">签到率</div>
      <div class="value">{{ pct(stats?.kpi?.checkInRate) }}</div>
    </div>
    <div class="stat-card">
      <div class="label">交接完成率</div>
      <div class="value">{{ pct(stats?.kpi?.handoverRate) }}</div>
    </div>
    <div class="stat-card">
      <div class="label">日志提交率</div>
      <div class="value">{{ pct(stats?.kpi?.logRate) }}</div>
    </div>
  </div>

  <el-row :gutter="16">
    <el-col :span="16">
      <el-card shadow="never" class="panel" style="margin-bottom:12px">
        <div style="font-weight:700;margin-bottom:10px">人员值班分布</div>
        <BaseChart :options="dutyChart" height="320px" />
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card shadow="never" class="panel" style="margin-bottom:12px">
        <div style="font-weight:700;margin-bottom:10px">告警与应急</div>
        <div class="stat-grid" style="grid-template-columns:repeat(2,1fr)">
          <div class="stat-card">
            <div class="label">工单处置量</div>
            <div class="value">{{ stats?.kpi?.totalTickets ?? 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="label">告警响应数</div>
            <div class="value">{{ stats?.kpi?.totalAlarms ?? 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="label">告警均响应(分)</div>
            <div class="value">{{ stats?.kpi?.alarmAvgResponseMin ?? 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="label">应急事件数</div>
            <div class="value">{{ stats?.kpi?.totalEmergencies ?? 0 }}</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="never" class="panel">
        <div style="font-weight:700;margin-bottom:10px">人员明细</div>
        <el-table :data="stats?.byUser || []" border size="small">
          <el-table-column prop="user" label="人员" width="80" />
          <el-table-column prop="dutyCount" label="值班" width="70" />
          <el-table-column prop="tickets" label="工单" width="70" />
          <el-table-column prop="alarms" label="告警" width="70" />
          <el-table-column prop="emergencies" label="应急" width="70" />
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useDutyStore } from '@/store'
import BaseChart from '@/components/Chart/BaseChart.vue'

const store = useDutyStore()
const month = ref(formatMonth(new Date()))
const stats = ref(null)

const reload = async () => {
  stats.value = await store.stats({ month: month.value })
}

watch(month, async (m) => {
  await store.loadSchedules(m)
  await reload()
})

onMounted(async () => {
  await store.init(month.value)
  await reload()
})

const dutyChart = computed(() => {
  const list = stats.value?.byUser || []
  const names = list.map(i => i.user)
  const duty = list.map(i => i.dutyCount)
  const ended = list.map(i => i.ended)
  return {
    grid: { left: 40, right: 20, top: 30, bottom: 30, containLabel: true },
    tooltip: { trigger: 'axis' },
    legend: { data: ['排班', '已结束'] },
    xAxis: { type: 'category', data: names, axisLabel: { interval: 0 } },
    yAxis: { type: 'value' },
    series: [
      { name: '排班', type: 'bar', data: duty, barWidth: 18, itemStyle: { borderRadius: [6, 6, 0, 0] } },
      { name: '已结束', type: 'bar', data: ended, barWidth: 18, itemStyle: { borderRadius: [6, 6, 0, 0] } }
    ]
  }
})

function pct(v) {
  const n = Number(v || 0)
  return `${n.toFixed(1)}%`
}

function formatMonth(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}
</script>

<style scoped>
</style>


<template>
  <div class="container itsm-report-page" v-loading="loading">
    <section class="panel hero-panel">
      <div class="hero-main">
        <div class="page-title">运维日报、周报</div>
        <div class="hero-subtitle">
          {{
            dashboard?.subtitle ||
            '围绕 ITSM 运维服务体系，实时展示事件、问题、变更、发布全链路指标。'
          }}
        </div>
        <div class="hero-meta">
          <span>当前服务：{{ dashboard?.serviceLabel || '-' }}</span>
          <span>统计口径：{{ period === 'day' ? '日报' : '周报' }}</span>
          <span>更新时间：{{ dashboard?.updatedAt || '-' }}</span>
        </div>
      </div>
      <div class="hero-tools">
        <el-radio-group v-model="period" size="small" @change="handlePeriodChange">
          <el-radio-button label="day">日报</el-radio-button>
          <el-radio-button label="week">周报</el-radio-button>
        </el-radio-group>
      </div>
    </section>

    <section class="service-tabs-wrap panel">
      <el-tabs v-model="activeService" class="service-tabs" stretch @tab-change="handleServiceTabChange">
        <el-tab-pane v-for="item in serviceOptions" :key="item.value" :name="item.value">
          <template #label>
            <div class="service-tab-label">
              <div class="tab-title">{{ item.label }}</div>
              <div class="tab-desc">{{ item.desc }}</div>
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
    </section>

    <section class="kpi-grid">
      <article v-for="metric in dashboard?.kpis || []" :key="metric.key || metric.label" class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">{{ metric.label }}</span>
          <span class="kpi-delta" :class="`tone-${metric.tone || metric.trendTone || 'flat'}`">
            {{ metric.deltaText || metric.trendText || '' }}
          </span>
        </div>
        <div class="kpi-value">{{ metric.valueText || metric.value || '--' }}</div>
        <div class="kpi-foot">{{ metric.desc || metric.badge || '' }}</div>
      </article>
    </section>

    <section v-if="activeService === 'incident'" class="chart-grid">
      <el-card shadow="never" class="panel-card span-8">
        <div class="panel-title">7日工单积压趋势</div>
        <BaseChart :options="incidentBacklogTrendOption" height="320px" />
      </el-card>

      <el-card shadow="never" class="panel-card span-12 list-card">
        <div class="panel-title">近7日报障单平均处理时长</div>
        <div class="table-shell">
          <el-table :data="incidentDurationTableData" size="small" border stripe class="compact-table duration-table">
            <el-table-column prop="date" label="日期" width="96" />
            <el-table-column prop="alarmTotal" label="告警工单总时长（小时）" width="160" />
            <el-table-column prop="bizHandle" label="业务报障处置时长（小时）" width="180" />
            <el-table-column prop="bizVerify" label="业务报障验证时长（小时）" width="180" />
          </el-table>
        </div>
      </el-card>

      <el-card shadow="never" class="panel-card span-12 list-card">
        <div class="panel-title">近七日报障单处置情况</div>
        <div class="table-header-stats">
          <div class="stat-item">
            <span class="stat-label">7日总新增：</span>
            <span class="stat-value">{{ totalNewCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">7日总完成：</span>
            <span class="stat-value">{{ totalDoneCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">7日平均关单率：</span>
            <span class="stat-value">{{ averageCloseRate }}</span>
          </div>
        </div>
        <div class="table-shell">
          <el-table
            :data="incidentDisposalRows"
            size="small"
            border
            height="310"
            :span-method="objectSpanMethod"
            :row-class-name="disposalRowClass"
            class="compact-table disposal-table"
            style="width: 100%"
            :fit="true"
          >
            <el-table-column prop="date" label="日期" width="100" />
            <el-table-column prop="type" label="报障类型" width="108" />
            <el-table-column prop="newCount" label="当日新增" width="96" />
            <el-table-column prop="doneCount" label="当日已完成" width="104" />
            <el-table-column prop="historyDone" label="完成历史" width="96" />
            <el-table-column prop="closeRate" label="当日关单率" width="120" />
          </el-table>
        </div>
      </el-card>

      <el-card shadow="never" class="panel-card span-12 list-card">
        <div class="panel-title">数据任务执行情况</div>
        <div class="table-shell">
          <el-table
            :data="incidentTaskExecutionRows"
            size="small"
            border
            stripe
            class="compact-table execution-table"
            style="width: 100%"
            :fit="true"
          >
            <el-table-column prop="taskType" label="任务类别" width="128" />
            <el-table-column prop="taskCount" label="任务/接口数" width="136" />
            <el-table-column prop="successRate" label="成功率（当日）" width="140" />
            <el-table-column prop="newInterface" label="新增接口" width="120" />
            <el-table-column prop="offlineInterface" label="下线接口" width="120" />
          </el-table>
        </div>
      </el-card>

      <el-card shadow="never" class="panel-card span-4">
        <div class="panel-title">{{ dashboard?.topSystems?.title || '事件单涉及业务系统TOP5' }}</div>
        <BaseChart :options="topSystemsOption" height="280px" />
      </el-card>

      <el-card shadow="never" class="panel-card span-4">
        <div class="panel-title">{{ dashboard?.analysisA?.title || '事件单根因排序' }}</div>
        <BaseChart :options="analysisAOption" height="280px" />
      </el-card>

      <el-card shadow="never" class="panel-card span-4">
        <div class="panel-title">{{ dashboard?.analysisB?.title || '事件单涉及委办前置机TOP5委办' }}</div>
        <BaseChart :options="analysisBOption" height="280px" />
      </el-card>
    </section>

    <section v-else-if="activeService === 'change'" class="chart-grid">
      <el-card shadow="never" class="panel-card span-8">
        <div class="panel-title">近7日治理任务上线情况</div>
        <BaseChart :options="changeReleaseTrendOption" height="320px" />
      </el-card>

      <el-card shadow="never" class="panel-card span-4">
        <div class="panel-title">上线概览</div>
        <div class="change-summary-list">
          <div v-for="item in changeSummaryCards" :key="item.label" class="change-summary-item">
            <div class="summary-label">{{ item.label }}</div>
            <div class="summary-value">{{ item.value }}</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="panel-card span-12">
        <div class="panel-title">近7日治理任务上线明细</div>
        <el-table :data="changeReleaseRows" size="small" border stripe style="width: 100%">
          <el-table-column prop="date" label="日期" width="98" />
          <el-table-column prop="nonCritical" label="非重要业务" width="132" />
          <el-table-column prop="critical" label="重要业务" width="120" />
          <el-table-column prop="total" label="申请上线总量" width="132" />
          <el-table-column prop="success" label="成功上线" width="112" />
          <el-table-column prop="successRate" label="上线成功率" width="120" />
        </el-table>
      </el-card>
    </section>

    <section v-else class="chart-grid">
      <el-card shadow="never" class="panel-card span-8">
        <div class="panel-title">{{ dashboard?.trend?.title || '趋势分析' }}</div>
        <BaseChart :options="trendOption" height="320px" />
      </el-card>

      <el-card shadow="never" class="panel-card span-4">
        <div class="panel-title">服务健康指数</div>
        <div class="health-list">
          <div v-for="item in dashboard?.health || []" :key="item.name" class="health-row">
            <div class="health-head">
              <span>{{ item.name }}</span>
              <span :class="`risk-${item.status}`">{{ item.valueText }}</span>
            </div>
            <el-progress
              :percentage="item.score"
              :status="item.status === 'risk' ? 'exception' : item.status === 'good' ? 'success' : ''"
              :stroke-width="9"
              :show-text="false"
            />
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="panel-card span-6">
        <div class="panel-title">{{ dashboard?.topSystems?.title || 'TOP 排名' }}</div>
        <BaseChart :options="topSystemsOption" height="300px" />
      </el-card>

      <el-card shadow="never" class="panel-card span-6">
        <div class="panel-title">{{ dashboard?.analysisA?.title || '指标分布' }}</div>
        <BaseChart :options="analysisAOption" height="300px" />
      </el-card>

      <el-card shadow="never" class="panel-card span-6">
        <div class="panel-title">{{ dashboard?.analysisB?.title || '补充分析' }}</div>
        <BaseChart :options="analysisBOption" height="300px" />
      </el-card>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import BaseChart from "@/components/Chart/BaseChart.vue";
import { getItsmDailyWeeklyData } from "@/mock-data/modules/itsm-daily-weekly";

const serviceOptions = [
  { value: "incident", label: "事件管理", desc: "事件效率与根因治理" },
  { value: "problem", label: "问题管理", desc: "问题复盘与消缺闭环" },
  { value: "change", label: "变更管理", desc: "变更执行与风险控制" },
  { value: "release", label: "发布管理", desc: "发布质量与环境分布" },
];

const activeService = ref("incident");
const period = ref("day");
const loading = ref(false);
const dashboard = ref(null);

const dateLabels = computed(() => {
  const source = dashboard.value?.trend?.items || [];
  if (source.length >= 7) return source.slice(0, 7).map((item) => item.label);
  return ["03-16", "03-17", "03-18", "03-19", "03-20", "03-21", "03-22"];
});

const incidentSeriesBase = {
  backlog: {
    external: [39, 36, 34, 33, 31, 30, 28],
    internal: [26, 24, 22, 21, 20, 19, 18],
    monitor: [44, 42, 41, 39, 37, 36, 35],
  },
  disposal: {
    external: {
      newCount: [54, 52, 50, 48, 47, 46, 45],
      doneCount: [48, 49, 47, 46, 45, 44, 43],
    },
    internal: {
      newCount: [36, 35, 34, 33, 32, 30, 29],
      doneCount: [31, 32, 31, 30, 30, 28, 27],
    },
    monitor: {
      newCount: [63, 62, 60, 59, 57, 56, 55],
      doneCount: [57, 58, 56, 55, 54, 53, 52],
    },
  },
  duration: {
    alarmTotal: [6.6, 6.4, 6.1, 6.0, 5.8, 5.6, 5.5],
    bizHandle: [4.3, 4.2, 4.0, 3.9, 3.8, 3.7, 3.6],
    bizVerify: [2.2, 2.1, 2.0, 1.9, 1.9, 1.8, 1.8],
  },
  taskExecution: [
    { taskType: "归集任务", taskCount: 368, successRate: 99.28, newInterface: 0, offlineInterface: 0 },
    { taskType: "治理任务", taskCount: 214, successRate: 98.72, newInterface: 0, offlineInterface: 0 },
    { taskType: "共享接口", taskCount: 492, successRate: 99.56, newInterface: 12, offlineInterface: 3 },
  ],
};

const incidentDisposalCategories = [
  { key: "monitor", label: "监控告警" },
  { key: "internal", label: "内部报障" },
  { key: "external", label: "外部报障" },
];

const changeSeriesBase = {
  nonCritical: [18, 20, 22, 21, 23, 24, 26],
  critical: [6, 7, 8, 8, 9, 10, 11],
};

const periodScale = computed(() => (period.value === "day" ? 0.74 : 1));

const incidentBacklogSeries = computed(() => {
  const scale = periodScale.value;
  return {
    external: incidentSeriesBase.backlog.external.map((value) => Math.max(1, Math.round(value * scale))),
    internal: incidentSeriesBase.backlog.internal.map((value) => Math.max(1, Math.round(value * scale))),
    monitor: incidentSeriesBase.backlog.monitor.map((value) => Math.max(1, Math.round(value * scale))),
  };
});

const incidentBacklogTrendOption = computed(() => ({
  tooltip: { trigger: "axis" },
  legend: { top: 4 },
  grid: { left: 18, right: 12, top: 36, bottom: 12, containLabel: true },
  xAxis: { type: "category", data: dateLabels.value, boundaryGap: false },
  yAxis: { type: "value", name: "积压单量" },
  series: [
    { name: "外部报障", type: "line", smooth: true, data: incidentBacklogSeries.value.external, lineStyle: { width: 2, color: "#2563eb" }, itemStyle: { color: "#2563eb" }, areaStyle: { opacity: 0.08, color: "#2563eb" } },
    { name: "内部报障", type: "line", smooth: true, data: incidentBacklogSeries.value.internal, lineStyle: { width: 2, color: "#0ea5e9" }, itemStyle: { color: "#0ea5e9" }, areaStyle: { opacity: 0.08, color: "#0ea5e9" } },
    { name: "监控告警", type: "line", smooth: true, data: incidentBacklogSeries.value.monitor, lineStyle: { width: 2, color: "#7c3aed" }, itemStyle: { color: "#7c3aed" }, areaStyle: { opacity: 0.08, color: "#7c3aed" } },
  ],
}));

const incidentDisposalRows = computed(() => {
  const scale = periodScale.value;
  const labels = dateLabels.value;
  return labels.flatMap((date, index) => {
    return incidentDisposalCategories.map((category) => {
      const disposalData = incidentSeriesBase.disposal[category.key];
      const baseNew = disposalData?.newCount?.[index] || 0;
      const baseDone = disposalData?.doneCount?.[index] || 0;
      const newCount = Math.max(1, Math.round(baseNew * scale));
      const doneCount = Math.max(1, Math.round(baseDone * scale));
      const historyDone = (disposalData?.doneCount || [])
        .slice(0, index + 1)
        .reduce((sum, value) => sum + Math.round((value || 0) * scale), 0);
      return {
        date,
        type: category.label,
        newCount,
        doneCount,
        historyDone,
        closeRate: `${((doneCount / Math.max(newCount, 1)) * 100).toFixed(2)}%`,
      };
    });
  });
});

const incidentTaskExecutionRows = computed(() => {
  const scale = periodScale.value;
  return incidentSeriesBase.taskExecution.map((item) => ({
    taskType: item.taskType,
    taskCount: Math.max(1, Math.round(item.taskCount * scale)),
    successRate: `${(item.successRate - (period.value === "day" ? 0.16 : 0)).toFixed(2)}%`,
    newInterface: Math.max(0, Math.round(item.newInterface * scale)),
    offlineInterface: Math.max(0, Math.round(item.offlineInterface * scale)),
  }));
});

const incidentDurationTableData = computed(() => {
  const scale = periodScale.value;
  return dateLabels.value.map((date, index) => ({
    date,
    alarmTotal: (incidentSeriesBase.duration.alarmTotal[index] * scale).toFixed(2),
    bizHandle: (incidentSeriesBase.duration.bizHandle[index] * scale).toFixed(2),
    bizVerify: (incidentSeriesBase.duration.bizVerify[index] * scale).toFixed(2),
  }));
});

const totalNewCount = computed(() => incidentDisposalRows.value.reduce((sum, row) => sum + row.newCount, 0));
const totalDoneCount = computed(() => incidentDisposalRows.value.reduce((sum, row) => sum + row.doneCount, 0));
const averageCloseRate = computed(() => {
  const rates = incidentDisposalRows.value.map((row) => Number.parseFloat(String(row.closeRate).replace("%", "")) || 0);
  const sum = rates.reduce((acc, rate) => acc + rate, 0);
  return `${(sum / Math.max(rates.length, 1)).toFixed(2)}%`;
});

function objectSpanMethod({ rowIndex, columnIndex }) {
  if (columnIndex === 0) {
    const groupSize = incidentDisposalCategories.length;
    if (rowIndex % groupSize === 0) return { rowspan: groupSize, colspan: 1 };
    return { rowspan: 0, colspan: 0 };
  }
  return undefined;
}

function disposalRowClass({ rowIndex }) {
  const groupSize = incidentDisposalCategories.length;
  const group = Math.floor(rowIndex / groupSize);
  return group % 2 === 0 ? "group-even" : "group-odd";
}

const changeReleaseRows = computed(() => {
  const scale = periodScale.value;
  return dateLabels.value.map((date, index) => {
    const nonCritical = Math.max(1, Math.round(changeSeriesBase.nonCritical[index] * scale));
    const critical = Math.max(1, Math.round(changeSeriesBase.critical[index] * scale));
    const total = nonCritical + critical;
    const success = Math.max(1, total - (index % 3 === 0 ? 1 : 0));
    return {
      date,
      nonCritical,
      critical,
      total,
      success,
      successRate: `${((success / total) * 100).toFixed(2)}%`,
    };
  });
});

const changeReleaseTrendOption = computed(() => ({
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  legend: { top: 4 },
  grid: { left: 20, right: 16, top: 36, bottom: 14, containLabel: true },
  xAxis: { type: "category", data: changeReleaseRows.value.map((item) => item.date) },
  yAxis: [{ type: "value", name: "任务数" }, { type: "value", name: "总量", min: 0 }],
  series: [
    { name: "非重要业务", type: "bar", stack: "上线", barWidth: 14, data: changeReleaseRows.value.map((item) => item.nonCritical), itemStyle: { color: "#60a5fa", borderRadius: [6, 6, 0, 0] } },
    { name: "重要业务", type: "bar", stack: "上线", barWidth: 14, data: changeReleaseRows.value.map((item) => item.critical), itemStyle: { color: "#2563eb" } },
    { name: "申请上线总量", type: "line", yAxisIndex: 1, smooth: true, data: changeReleaseRows.value.map((item) => item.total), lineStyle: { color: "#f97316", width: 2 }, itemStyle: { color: "#f97316" } },
  ],
}));

const changeSummaryCards = computed(() => {
  const totals = changeReleaseRows.value.reduce(
    (acc, item) => {
      acc.nonCritical += item.nonCritical;
      acc.critical += item.critical;
      acc.total += item.total;
      return acc;
    },
    { nonCritical: 0, critical: 0, total: 0 }
  );
  const successAvg =
    changeReleaseRows.value.reduce((acc, item) => acc + Number(item.successRate.replace("%", "")), 0) /
    Math.max(changeReleaseRows.value.length, 1);

  return [
    { label: "非重要业务上线总量", value: `${totals.nonCritical} 单` },
    { label: "重要业务上线总量", value: `${totals.critical} 单` },
    { label: "申请上线总量", value: `${totals.total} 单` },
    { label: "7日平均上线成功率", value: `${successAvg.toFixed(2)}%` },
  ];
});

const trendOption = computed(() => {
  const items = dashboard.value?.trend?.items || [];
  return {
    tooltip: { trigger: "axis" },
    legend: { top: 4 },
    grid: { left: 18, right: 12, top: 36, bottom: 12, containLabel: true },
    xAxis: { type: "category", data: items.map((item) => item.label), boundaryGap: false },
    yAxis: { type: "value" },
    series: [
      {
        name: dashboard.value?.trend?.seriesName || "工单量",
        type: "line",
        smooth: true,
        data: items.map((item) => item.value),
        areaStyle: { opacity: 0.15 },
        lineStyle: { width: 2 },
      },
    ],
  };
});

const topSystemsOption = computed(() => {
  const items = [...(dashboard.value?.topSystems?.items || [])].sort((a, b) => b.value - a.value);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 100, right: 14, top: 14, bottom: 14, containLabel: true },
    xAxis: { type: "value" },
    yAxis: { type: "category", data: items.map((item) => item.name), inverse: true, axisLabel: { width: 84, overflow: "truncate" } },
    series: [{ type: "bar", data: items.map((item) => item.value), barWidth: 14, itemStyle: { borderRadius: [0, 8, 8, 0], color: "#2563eb" } }],
  };
});

const analysisAOption = computed(() => buildAnalysisOption(dashboard.value?.analysisA));
const analysisBOption = computed(() => buildAnalysisOption(dashboard.value?.analysisB));

function buildAnalysisOption(block) {
  const items = block?.items || [];
  if (block?.type === "pie") {
    return {
      tooltip: { trigger: "item" },
      legend: { bottom: 0 },
      series: [
        {
          type: "pie",
          radius: ["42%", "72%"],
          center: ["50%", "42%"],
          label: { formatter: "{b}\n{d}%" },
          itemStyle: { borderWidth: 1, borderRadius: 8 },
          data: items.map((item) => ({ name: item.name, value: item.value })),
        },
      ],
    };
  }
  const sorted = [...items].sort((a, b) => b.value - a.value);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 20, right: 14, top: 16, bottom: 34, containLabel: true },
    xAxis: { type: "category", data: sorted.map((item) => item.name), axisLabel: { rotate: 16 } },
    yAxis: { type: "value" },
    series: [{ type: "bar", data: sorted.map((item) => item.value), barMaxWidth: 18, itemStyle: { borderRadius: [8, 8, 0, 0], color: "#0ea5e9" } }],
  };
}

async function loadData() {
  if (loading.value) return;
  loading.value = true;
  try {
    dashboard.value = await getItsmDailyWeeklyData({ serviceType: activeService.value, period: period.value });
  } finally {
    loading.value = false;
  }
}

function handleServiceTabChange(service) {
  const nextService = String(service);
  if (!serviceOptions.some((item) => item.value === nextService)) return;
  activeService.value = nextService;
  loadData();
}

function handlePeriodChange() {
  loadData();
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.itsm-report-page {
  display: grid;
  gap: 12px;
}

.hero-panel {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 16px;
  background: radial-gradient(circle at 80% -20%, rgba(37, 99, 235, 0.12), rgba(0, 0, 0, 0) 60%),
    linear-gradient(115deg, rgba(14, 165, 233, 0.09), rgba(255, 255, 255, 0.94));
}

.hero-subtitle {
  font-size: 13px;
  color: rgba(71, 85, 105, 0.95);
}

.hero-meta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 12px;
  color: rgba(100, 116, 139, 0.92);
}

.hero-tools {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.service-tabs-wrap {
  padding-bottom: 4px;
}

.service-tab-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-height: 40px;
}

.tab-title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.tab-desc {
  font-size: 12px;
  color: rgba(71, 85, 105, 0.9);
}

.service-tabs :deep(.el-tabs__header) {
  margin-bottom: 2px;
}

.service-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background: #e3e9f4;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.kpi-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(241, 245, 255, 0.75));
  padding: 12px;
}

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.kpi-label {
  font-size: 12px;
  color: rgba(71, 85, 105, 0.95);
}

.kpi-delta {
  font-size: 12px;
  font-weight: 700;
}

.tone-good {
  color: #166534;
}

.tone-flat {
  color: #475569;
}

.tone-risk {
  color: #991b1b;
}

.kpi-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.kpi-foot {
  margin-top: 10px;
  font-size: 11px;
  color: rgba(100, 116, 139, 0.9);
  line-height: 1.45;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 12px;
}

.panel-card {
  padding-top: 8px;
}

.panel-title {
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.9);
}

.list-card {
  border: 1px solid #e6edf6;
  background: linear-gradient(180deg, #ffffff, #f7faff);
}

.table-shell {
  border: 1px solid #edf1f7;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.table-header-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-label {
  font-size: 12px;
  color: #475569;
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  background: #fff;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.compact-table :deep(.el-table__header) th {
  background: #f1f5f9;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
}

.compact-table :deep(.el-table__row) td {
  padding: 8px 0;
  font-size: 12px;
  color: #334155;
}

.disposal-table :deep(.group-even) td {
  background: #f8fafc;
}

.disposal-table :deep(.group-odd) td {
  background: #ffffff;
}

.execution-table :deep(.el-table__row) td {
  background: #fcfdff;
}

.span-12 {
  grid-column: span 12;
}

.span-8 {
  grid-column: span 8;
}

.span-6 {
  grid-column: span 6;
}

.span-4 {
  grid-column: span 4;
}

.change-summary-list {
  display: grid;
  gap: 10px;
}

.change-summary-item {
  border: 1px solid #ebf0fa;
  border-radius: 10px;
  padding: 10px 12px;
  background: rgba(248, 250, 252, 0.95);
}

.summary-label {
  font-size: 12px;
  color: rgba(71, 85, 105, 0.92);
}

.summary-value {
  margin-top: 4px;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.health-list {
  display: grid;
  gap: 10px;
}

.health-row {
  border: 1px solid #ebf0fa;
  border-radius: 10px;
  padding: 8px 10px;
  background: rgba(248, 250, 252, 0.95);
}

.health-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
}

.risk-good {
  color: #166534;
  font-weight: 700;
}

.risk-warn {
  color: #92400e;
  font-weight: 700;
}

.risk-risk {
  color: #991b1b;
  font-weight: 700;
}

@media (max-width: 1320px) {
  .tab-desc {
    display: none;
  }

  .kpi-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .span-8,
  .span-6,
  .span-4 {
    grid-column: span 12;
  }
}

@media (max-width: 980px) {
  .hero-panel {
    flex-direction: column;
  }

  .hero-tools {
    justify-content: flex-start;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .kpi-value {
    font-size: 22px;
  }

  .table-header-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .compact-table :deep(.el-table__row) td {
    font-size: 11px;
    padding: 6px 4px;
  }

  .compact-table :deep(.el-table__header) th {
    font-size: 11px;
    padding: 8px 4px;
  }
}
</style>

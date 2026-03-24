<template>
  <div class="container">
    <div class="page-title">自动化运维统计</div>
    
    <!-- 统计卡片 -->
    <div class="stats-container" style="margin-bottom: 16px">
      <div class="stats-card">
        <div class="stats-title">规则总数</div>
        <div class="stats-value">{{ rules.length }}</div>
        <div class="stats-subtitle">启用: {{ enabledRules }} | 灰度: {{ grayRules }} | 停用: {{ disabledRules }}</div>
      </div>
      <div class="stats-card">
        <div class="stats-title">脚本总数</div>
        <div class="stats-value">{{ scripts.length }}</div>
        <div class="stats-subtitle">Shell: {{ shellScripts }} | Python: {{ pythonScripts }} | Bat: {{ batScripts }}</div>
      </div>
      <div class="stats-card">
        <div class="stats-title">今日告警总数</div>
        <div class="stats-value">{{ todayAlerts }}</div>
        <div class="stats-subtitle">自动处置: {{ todayAutoHandledAlerts }}</div>
      </div>
      <div class="stats-card">
        <div class="stats-title">自动处置告警</div>
        <div class="stats-value">{{ todayAutoHandledAlerts }}</div>
        <div class="stats-subtitle">成功: {{ todayAutoHandledSuccess }} | 失败: {{ todayAutoHandledFailed }}</div>
      </div>
      <div class="stats-card">
        <div class="stats-title">自动处置成功率</div>
        <div class="stats-value">{{ automationRate }}%</div>
        <div class="stats-subtitle">
          较昨日: 
          <span :class="['change-value', { 'positive': automationRateChange > 0, 'negative': automationRateChange < 0 }]">
            {{ Math.abs(automationRateChange) }}%
            <span v-if="automationRateChange > 0">↑</span>
            <span v-else-if="automationRateChange < 0">↓</span>
          </span>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="12">
        <el-card shadow="never">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
            <div style="font-weight: 600">执行趋势</div>
            <el-radio-group v-model="timeDimension" @change="updateExecutionChart">
              <el-radio-button label="month">按月</el-radio-button>
              <el-radio-button label="day">按日</el-radio-button>
            </el-radio-group>
          </div>
          <div id="executionChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div style="margin-bottom: 16px; font-weight: 600">规则执行分布</div>
          <div id="ruleDistributionChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 月度统计 -->
    <el-card shadow="never">
      <div style="margin-bottom: 16px; font-weight: 600">月度执行统计</div>
      <div id="monthlyChart" style="height: 300px"></div>
    </el-card>
  </div>
</template>
<script setup>
import { onMounted, ref, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getRules, getScripts, getStatistics } from '../../../mock-data/modules/autoops'

// 状态管理
const rules = ref([])
const scripts = ref([])
const statistics = ref({})
const timeDimension = ref('month')
const executionChart = ref(null)
const monthlyChart = ref(null)

// 月度数据 - 确保执行趋势和月度统计使用相同的数据
const monthlyData = ref([
  { month: '1月', success: 114, fail: 6, total: 120, successRate: 95 },
  { month: '2月', success: 138, fail: 12, total: 150, successRate: 92 },
  { month: '3月', success: 169, fail: 11, total: 180, successRate: 94 },
  { month: '4月', success: 134, fail: 6, total: 140, successRate: 96 },
  { month: '5月', success: 149, fail: 11, total: 160, successRate: 93 },
  { month: '6月', success: 194, fail: 6, total: 200, successRate: 97 }
])

// 统计数据
const enabledRules = computed(() => rules.value.filter(r => r.status === '启用').length)
const grayRules = computed(() => rules.value.filter(r => r.status === '灰度').length)
const disabledRules = computed(() => rules.value.filter(r => r.status === '停用').length)

const shellScripts = computed(() => scripts.value.filter(s => s.type === 'Shell').length)
const pythonScripts = computed(() => scripts.value.filter(s => s.type === 'Python').length)
const batScripts = computed(() => scripts.value.filter(s => s.type === 'Bat').length)

const todayExecutions = computed(() => statistics.value.todayExecutions || 0)
const todaySuccess = computed(() => statistics.value.todaySuccess || 0)
const todayFailed = computed(() => statistics.value.todayFailed || 0)
const todayAlerts = computed(() => statistics.value.todayAlerts || 0)
const todayAutoHandledAlerts = computed(() => statistics.value.todayAutoHandledAlerts || 0)
const todayAutoHandledSuccess = computed(() => statistics.value.todayAutoHandledSuccess || 0)
const todayAutoHandledFailed = computed(() => statistics.value.todayAutoHandledFailed || 0)
const automationRate = computed(() => statistics.value.automationRate || 0)
const automationRateChange = computed(() => statistics.value.automationRateChange || 0)

// 加载数据
const loadData = async () => {
  rules.value = await getRules()
  scripts.value = await getScripts()
  statistics.value = await getStatistics()
  
  // 延迟初始化图表
  nextTick(() => {
    initCharts()
  })
}

// 初始化图表
const initCharts = () => {
  // 执行趋势图表
  executionChart.value = echarts.init(document.getElementById('executionChart'))
  updateExecutionChart()
  
  // 规则执行分布图
  const distributionChart = echarts.init(document.getElementById('ruleDistributionChart'))
  const distributionOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '规则类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 30, name: '磁盘告警' },
          { value: 25, name: '内存告警' },
          { value: 20, name: '归集任务' },
          { value: 15, name: '治理任务' },
          { value: 10, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  distributionChart.setOption(distributionOption)
  
  // 月度执行统计图表
  monthlyChart.value = echarts.init(document.getElementById('monthlyChart'))
  updateMonthlyChart()
  
  // 响应式处理
  window.addEventListener('resize', () => {
    executionChart.value.resize()
    distributionChart.resize()
    monthlyChart.value.resize()
  })
}

// 更新执行趋势图表
const updateExecutionChart = () => {
  if (!executionChart.value) return
  
  let xAxisData, successData, failData
  
  if (timeDimension.value === 'month') {
    // 使用统一的月度数据
    xAxisData = monthlyData.value.map(item => item.month)
    successData = monthlyData.value.map(item => item.success)
    failData = monthlyData.value.map(item => item.fail)
  } else {
    // 按日数据 - 最近7天
    xAxisData = ['13日', '14日', '15日', '16日', '17日', '18日', '19日']
    successData = [18, 22, 15, 28, 12, 25, 20]
    failData = [2, 3, 1, 4, 2, 3, 2]
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function(params) {
        const month = params[0].name;
        const monthData = monthlyData.value.find(item => item.month === month);
        if (monthData) {
          return month + '<br/>' +
                 '<span style="color: #67C23A;">●</span> 成功: ' + monthData.success + '<br/>' +
                 '<span style="color: #F56C6C;">●</span> 失败: ' + monthData.fail + '<br/>' +
                 '<span style="color: #409EFF;">●</span> 总执行次数: ' + monthData.total + '<br/>' +
                 '<span style="color: #E6A23C;">●</span> 成功率: ' + monthData.successRate + '%';
        }
        return params[0].name + '<br/>' +
               params[0].marker + params[0].seriesName + ': ' + params[0].value + '<br/>' +
               params[1].marker + params[1].seriesName + ': ' + params[1].value;
      }
    },
    legend: {
      data: ['成功', '失败']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '成功',
        type: 'line',
        data: successData,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '失败',
        type: 'line',
        data: failData,
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  }
  
  executionChart.value.setOption(option)
}

// 更新月度执行统计图表
const updateMonthlyChart = () => {
  if (!monthlyChart.value) return
  
  const xAxisData = monthlyData.value.map(item => item.month)
  const totalData = monthlyData.value.map(item => item.total)
  const successRateData = monthlyData.value.map(item => item.successRate)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function(params) {
        const month = params[0].name;
        const monthData = monthlyData.value.find(item => item.month === month);
        if (monthData) {
          return month + '<br/>' +
                 '<span style="color: #67C23A;">●</span> 成功: ' + monthData.success + '<br/>' +
                 '<span style="color: #F56C6C;">●</span> 失败: ' + monthData.fail + '<br/>' +
                 '<span style="color: #409EFF;">●</span> 总执行次数: ' + monthData.total + '<br/>' +
                 '<span style="color: #E6A23C;">●</span> 成功率: ' + monthData.successRate + '%';
        }
        let result = params[0].name + '<br/>';
        params.forEach(function(item) {
          let value = item.value;
          if (item.seriesName === '成功率') {
            value += '%';
          }
          result += item.marker + item.seriesName + ': ' + value + '<br/>';
        });
        return result;
      }
    },
    legend: {
      data: ['执行次数', '成功率']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: [
      {
        type: 'value',
        name: '执行次数',
        position: 'left'
      },
      {
        type: 'value',
        name: '成功率(%)',
        position: 'right',
        max: 100
      }
    ],
    series: [
      {
        name: '执行次数',
        type: 'bar',
        data: totalData
      },
      {
        name: '成功率',
        type: 'line',
        yAxisIndex: 1,
        data: successRateData
      }
    ]
  }
  
  monthlyChart.value.setOption(option)
}



onMounted(() => {
  loadData()
})
</script>
<style scoped>
.container {
  padding: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.stats-container {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  width: 100%;
}

.stats-card {
  flex: 1;
  margin: 0 8px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stats-card:first-child {
  margin-left: 0;
}

.stats-card:last-child {
  margin-right: 0;
}

.stats-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stats-subtitle {
  font-size: 12px;
  color: #999;
}

.change-value {
  margin-left: 4px;
}

.change-value.positive {
  color: #67C23A;
}

.change-value.negative {
  color: #F56C6C;
}
</style>
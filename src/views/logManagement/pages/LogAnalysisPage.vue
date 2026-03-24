<template>
  <div class="container">
    <div class="page-title">日志智能分析</div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="never" class="mb-20">
          <template #header>
            <div class="card-header">
              <span>错误日志趋势</span>
              <el-select v-model="timeRange" size="small" @change="loadData">
                <el-option label="最近24小时" value="24h"/>
                <el-option label="最近7天" value="7d"/>
                <el-option label="最近30天" value="30d"/>
              </el-select>
            </div>
          </template>
          <LineChart :data="errorTrend" title="错误日志变化趋势" height="300px"/>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="mb-20">
          <template #header>
            <div class="card-header">
              <span>日志级别分布</span>
            </div>
          </template>
          <div id="levelChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="never" class="mb-20">
          <template #header>
            <div class="card-header">
              <span>系统日志分布</span>
            </div>
          </template>
          <div id="systemChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="mb-20">
          <template #header>
            <div class="card-header">
              <span>日志类型分布</span>
            </div>
          </template>
          <div id="typeChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>错误日志Top 10</span>
        </div>
      </template>
      <el-table :data="topErrors" border>
        <el-table-column prop="rank" label="排名" width="80"/>
        <el-table-column prop="message" label="错误信息"/>
        <el-table-column prop="count" label="出现次数" width="120"/>
        <el-table-column prop="system" label="业务系统" width="140"/>
        <el-table-column prop="lastOccurrence" label="最近出现时间" width="180"/>
      </el-table>
    </el-card>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { getLogTrend, getLogAnalysis } from '@/mock-data/modules/log'
import LineChart from '@/components/Chart/LineChart.vue'
import * as echarts from 'echarts'

const timeRange = ref('24h')
const errorTrend = ref([])
const topErrors = ref([])
let levelChart = null
let systemChart = null
let typeChart = null

const loadData = async () => {
  // 加载错误日志趋势
  errorTrend.value = await getLogTrend(timeRange.value)
  
  // 加载日志分析数据
  const analysisData = await getLogAnalysis(timeRange.value)
  topErrors.value = analysisData.topErrors || []
  
  // 更新图表
  nextTick(() => {
    updateLevelChart(analysisData.levelDistribution || {})
    updateSystemChart(analysisData.systemDistribution || {})
    updateTypeChart(analysisData.typeDistribution || {})
  })
}

const updateLevelChart = (data) => {
  if (!levelChart) {
    levelChart = echarts.init(document.getElementById('levelChart'))
  }
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: '日志级别',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: Object.entries(data).map(([name, value]) => ({ name, value }))
      }
    ]
  }
  
  levelChart.setOption(option)
}

const updateSystemChart = (data) => {
  if (!systemChart) {
    systemChart = echarts.init(document.getElementById('systemChart'))
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Object.keys(data),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '日志数量',
        type: 'bar',
        data: Object.values(data)
      }
    ]
  }
  
  systemChart.setOption(option)
}

const updateTypeChart = (data) => {
  if (!typeChart) {
    typeChart = echarts.init(document.getElementById('typeChart'))
  }
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: '日志类型',
        type: 'pie',
        radius: '60%',
        data: Object.entries(data).map(([name, value]) => ({ name, value })),
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
  
  typeChart.setOption(option)
}

const handleResize = () => {
  levelChart?.resize()
  systemChart?.resize()
  typeChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

watch(timeRange, loadData)
</script>
<style scoped>
.container {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.mb-20 {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
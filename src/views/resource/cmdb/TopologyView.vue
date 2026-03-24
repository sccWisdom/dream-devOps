<template>
  <div class="panel topology-page" v-loading="loading">
    <section class="page-head">
      <div>
        <h3 class="head-title">关系拓扑</h3>
        <p class="head-subtitle">按业务系统和模型组合查看配置项关系，支持手动建立、自动补齐与图谱导出。</p>
      </div>
      <div class="head-tag">当前已展示 {{ nodes.length }} 个节点</div>
    </section>

    <section class="control-panel">
      <div class="control-group">
        <div class="group-title">筛选条件</div>
        <el-select v-model="selectedBiz" placeholder="按业务系统筛选" clearable class="control-select" @change="load">
          <el-option v-for="biz in bizSystems" :key="biz" :label="biz" :value="biz" />
        </el-select>
        <el-select v-model="selectedModelCodes" multiple collapse-tags collapse-tags-tooltip placeholder="选择模型" class="control-model" @change="load">
          <el-option v-for="m in models" :key="m.code" :label="`${m.name}（${m.code}）`" :value="m.code" />
        </el-select>
        <el-input v-model="keyword" placeholder="关键字搜索" class="control-keyword" clearable @keyup.enter="applyFilter" />
        <el-button type="primary" @click="applyFilter">查询</el-button>
        <el-button @click="resetKeyword">清空关键字</el-button>
        <el-button @click="load">刷新</el-button>
      </div>

      <div class="control-group">
        <div class="group-title">图谱操作</div>
        <el-button @click="openRelationDialog">手动建立</el-button>
        <el-button type="primary" @click="autoLink">自动建立</el-button>
        <el-button @click="zoomOut">缩小</el-button>
        <el-button @click="zoomIn">放大</el-button>
        <el-button @click="resetZoom">重置</el-button>
        <el-button @click="exportImage">导出图片</el-button>
      </div>
    </section>

    <section class="metric-grid">
      <article class="metric-card">
        <div class="metric-label">节点数</div>
        <div class="metric-value">{{ nodes.length }}</div>
      </article>
      <article class="metric-card">
        <div class="metric-label">关系数</div>
        <div class="metric-value">{{ links.length }}</div>
      </article>
      <article class="metric-card">
        <div class="metric-label">告警节点</div>
        <div class="metric-value is-alert">{{ alertCount }}</div>
      </article>
      <article class="metric-card">
        <div class="metric-label">当前缩放</div>
        <div class="metric-value">{{ zoom.toFixed(2) }}</div>
      </article>
    </section>

    <section class="graph-shell">
      <div class="graph-canvas">
        <BaseChart ref="chartRef" :options="option" height="620px" />
      </div>

      <aside class="legend">
        <div class="legend-title">模型标识</div>
        <div class="legend-list">
          <div class="legend-row" v-for="m in models" :key="m.code">
            <span class="legend-dot" :style="{ background: modelColor(m.code) }" />
            <span>{{ m.name }}</span>
          </div>
          <div class="legend-row">
            <span class="legend-dot alert" />
            <span>告警高亮</span>
          </div>
        </div>
      </aside>
    </section>
  </div>

  <el-dialog v-model="relationVisible" title="建立关联关系" width="560px">
    <el-form :model="relationForm" label-width="90px">
      <el-form-item label="起点">
        <el-select v-model="relationForm.fromId" placeholder="选择配置项" filterable style="width:100%">
          <el-option v-for="ci in nodes" :key="ci.id" :label="ciLabel(ci)" :value="ci.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="关系类型">
        <el-select v-model="relationForm.typeKey" placeholder="选择关系类型" style="width:100%">
          <el-option v-for="t in relationTypes" :key="t.key" :label="t.label" :value="t.key" />
        </el-select>
      </el-form-item>
      <el-form-item label="终点">
        <el-select v-model="relationForm.toId" placeholder="选择配置项" filterable style="width:100%">
          <el-option v-for="ci in nodes" :key="ci.id" :label="ciLabel(ci)" :value="ci.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="relationVisible=false">取消</el-button>
      <el-button type="primary" @click="saveRelation">确认建立</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import BaseChart from '@/components/Chart/BaseChart.vue'
import {
  createCiRelation,
  getCiModels,
  getCis,
  getModelRelations,
  getRelationTypes,
  getTopology
} from '@/mock-data/modules/cmdb'

const chartRef = ref(null)
const loading = ref(false)
const models = ref([])
const relationTypes = ref([])
const bizSystems = ref([])
const selectedModelCodes = ref([])
const selectedBiz = ref('')
const keyword = ref('')
const option = ref({})
const zoom = ref(1)

const rawNodes = ref([])
const rawLinks = ref([])
const nodes = ref([])
const links = ref([])

const relationVisible = ref(false)
const relationForm = ref({ fromId: '', toId: '', typeKey: '' })

const modelColor = (code) => {
  const palette = {
    app: '#3b82f6',
    middleware: '#f97316',
    host: '#22c55e',
    server: '#14b8a6',
    db: '#f59e0b',
    vm: '#8b5cf6'
  }
  return palette[code] || '#64748b'
}

const ciLabel = (ci) => {
  if (!ci) return '-'
  const model = models.value.find(m => m.code === ci.modelCode)
  const name = ci.name || ci.id
  return `${name}（${model?.name || ci.modelCode}）`
}

const alertCount = computed(() => nodes.value.filter(n => n.status === 'alert').length)

const buildOption = (list, rels) => {
  const data = list.map(n => ({
    id: n.id,
    name: n.name,
    value: n.modelCode,
    category: n.modelCode,
    symbolSize: n.status === 'alert' ? 62 : 50,
    itemStyle: {
      color: n.status === 'alert' ? '#ef4444' : modelColor(n.modelCode),
      borderColor: n.status === 'alert' ? '#fecaca' : '#1e293b',
      borderWidth: 2,
      shadowBlur: n.status === 'alert' ? 18 : 8,
      shadowColor: n.status === 'alert' ? 'rgba(239,68,68,0.65)' : 'rgba(15,23,42,0.35)'
    },
    label: {
      color: '#e2e8f0',
      fontWeight: 600
    },
    tooltip: {
      formatter: `${n.name}<br/>模型：${n.modelCode}<br/>业务：${n.bizSystem || '-'}<br/>状态：${n.status === 'alert' ? '告警' : '正常'}`
    }
  }))

  const edges = rels.map(r => ({
    source: r.source,
    target: r.target,
    label: { show: true, formatter: r.label },
    lineStyle: { color: '#94a3b8' }
  }))

  return {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        zoom: zoom.value,
        label: { show: true },
        force: { repulsion: 240, edgeLength: 140 },
        data,
        links: edges,
        lineStyle: { color: '#94a3b8', width: 1.2 },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 2.2 }
        }
      }
    ]
  }
}

const applyFilter = () => {
  const key = keyword.value.trim().toLowerCase()
  const filteredNodes = key
    ? rawNodes.value.filter(n => String(n.name || '').toLowerCase().includes(key))
    : [...rawNodes.value]
  const ids = new Set(filteredNodes.map(n => n.id))
  const filteredLinks = rawLinks.value.filter(l => ids.has(l.source) && ids.has(l.target))
  nodes.value = filteredNodes
  links.value = filteredLinks
  option.value = buildOption(filteredNodes, filteredLinks)
}

const resetKeyword = () => {
  keyword.value = ''
  applyFilter()
}

const load = async () => {
  loading.value = true
  try {
    const { nodes: n, links: l } = await getTopology({
      modelCodes: selectedModelCodes.value,
      bizSystem: selectedBiz.value || undefined
    })
    rawNodes.value = n
    rawLinks.value = l
    applyFilter()
  } finally {
    loading.value = false
  }
}

const loadBase = async () => {
  models.value = await getCiModels()
  relationTypes.value = await getRelationTypes()
  if (!selectedModelCodes.value.length) selectedModelCodes.value = models.value.map(m => m.code)
  const allCis = await getCis({})
  bizSystems.value = Array.from(new Set(allCis.map(ci => ci.attributes?.bizSystem).filter(Boolean)))
}

const openRelationDialog = () => {
  if (!relationForm.value.typeKey && relationTypes.value.length) relationForm.value.typeKey = relationTypes.value[0].key
  if (!relationForm.value.fromId && nodes.value.length) relationForm.value.fromId = nodes.value[0].id
  if (!relationForm.value.toId && nodes.value.length > 1) relationForm.value.toId = nodes.value[1].id
  relationVisible.value = true
}

const saveRelation = async () => {
  const { fromId, toId, typeKey } = relationForm.value
  if (!fromId || !toId || !typeKey) {
    ElMessage.warning('请补全关系信息')
    return
  }
  try {
    await createCiRelation({ fromId, toId, typeKey })
    ElMessage.success('关系已建立')
    relationVisible.value = false
    await load()
  } catch (e) {
    ElMessage.error(e?.message || '关系建立失败')
  }
}

const autoLink = async () => {
  const modelRelations = await getModelRelations()
  const allCis = await getCis({})
  const bizFilter = selectedBiz.value
  let created = 0
  let skipped = 0

  for (const mr of modelRelations) {
    const fromList = allCis.filter(ci => ci.modelCode === mr.fromModelCode)
    const toList = allCis.filter(ci => ci.modelCode === mr.toModelCode)
    for (const from of fromList) {
      if (bizFilter && from.attributes?.bizSystem !== bizFilter) continue
      for (const to of toList) {
        if (bizFilter && to.attributes?.bizSystem !== bizFilter) continue
        try {
          await createCiRelation({ fromId: from.id, toId: to.id, typeKey: mr.typeKey })
          created += 1
        } catch {
          skipped += 1
        }
      }
    }
  }
  ElMessage.success(`已建立 ${created} 条关系，跳过 ${skipped} 条`)
  await load()
}

const zoomIn = () => {
  zoom.value = Math.min(2, zoom.value + 0.1)
  applyFilter()
}

const zoomOut = () => {
  zoom.value = Math.max(0.6, zoom.value - 0.1)
  applyFilter()
}

const resetZoom = () => {
  zoom.value = 1
  applyFilter()
}

const exportImage = () => {
  const chart = chartRef.value?.getChart?.()
  if (!chart) {
    ElMessage.warning('未获取到图表实例')
    return
  }
  const url = chart.getDataURL({ pixelRatio: 2, backgroundColor: '#0f172a' })
  const link = document.createElement('a')
  link.href = url
  link.download = 'cmdb-topology.png'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

onMounted(async () => {
  await loadBase()
  await load()
})
</script>

<style scoped>
.topology-page {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.page-head {
  border: 1px solid #e5edf8;
  border-radius: 12px;
  padding: 14px;
  background: linear-gradient(115deg, rgba(37, 99, 235, 0.11), rgba(255, 255, 255, 0.96));
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
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

.head-tag {
  border: 1px solid #dbe7fb;
  background: rgba(255, 255, 255, 0.86);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  color: #1d4ed8;
  font-weight: 700;
}

.control-panel {
  border: 1px solid #e5edf8;
  border-radius: 12px;
  background: #fff;
  padding: 12px;
  display: grid;
  gap: 10px;
}

.control-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.group-title {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  border-right: 1px solid #e2e8f0;
  padding-right: 10px;
  margin-right: 2px;
}

.control-select {
  width: 220px;
}

.control-model {
  width: 360px;
}

.control-keyword {
  width: 220px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.metric-card {
  border: 1px solid #e5edf8;
  border-radius: 10px;
  background: #fff;
  padding: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.metric-label {
  font-size: 12px;
  color: #64748b;
}

.metric-value {
  margin-top: 4px;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.metric-value.is-alert {
  color: #dc2626;
}

.graph-shell {
  position: relative;
  border: 1px solid #e5edf8;
  border-radius: 12px;
  background: #fff;
  padding: 10px;
}

.graph-canvas {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: radial-gradient(circle at top, #1e293b, #0f172a 60%);
}

.legend {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 180px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 10px;
  padding: 10px;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(4px);
  color: #e2e8f0;
}

.legend-title {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

.legend-list {
  max-height: 320px;
  overflow: auto;
  padding-right: 2px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-bottom: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.alert {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.8);
}

@media (max-width: 1240px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .legend {
    position: static;
    width: auto;
    margin-top: 10px;
  }
}

@media (max-width: 820px) {
  .topology-page {
    padding: 10px;
  }

  .page-head {
    flex-direction: column;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .control-select,
  .control-model,
  .control-keyword {
    width: 100%;
  }
}
</style>

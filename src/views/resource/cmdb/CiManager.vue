<template>
  <div class="panel cmdb-ci-page">
    <div class="ci-toolbar">
      <el-input v-model="keyword" placeholder="全局搜索 IP / 主机名 / 负责人 / 业务系统" class="search" clearable @keyup.enter="load" />
      <el-select v-model="modelCode" placeholder="选择模型" class="select" @change="load">
        <el-option v-for="m in models" :key="m.code" :label="`${m.name}（${m.code}）`" :value="m.code" />
      </el-select>
      <el-button type="primary" :icon="Plus" @click="openCreate">新增配置项</el-button>
      <el-button :icon="Upload" @click="openImport">批量导入</el-button>
      <el-button :icon="Download" @click="doExport">批量导出</el-button>
      <el-button @click="load">刷新</el-button>
    </div>

    <div class="quick-filter">
      <el-button :type="quickView==='owner' ? 'primary' : 'default'" @click="setQuickView('owner')">我的负责资源</el-button>
      <el-button :type="quickView==='online' ? 'primary' : 'default'" @click="setQuickView('online')">在线资源</el-button>
      <el-button :type="quickView==='alert' ? 'primary' : 'default'" @click="setQuickView('alert')">异常资源</el-button>
      <el-button :type="quickView==='idle' ? 'primary' : 'default'" @click="setQuickView('idle')">闲置资源</el-button>
      <el-button text @click="advancedVisible = !advancedVisible">高级筛选</el-button>
    </div>

    <el-collapse-transition>
      <div v-show="advancedVisible" class="advanced-panel">
        <el-form inline>
          <el-form-item label="IP">
            <el-input v-model="filter.ip" placeholder="输入 IP" clearable />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="filter.categoryId" placeholder="选择分类" clearable style="width: 220px">
              <el-option v-for="c in leafCategories" :key="c.id" :label="categoryLabel(c)" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="业务系统">
            <el-input v-model="filter.bizSystem" placeholder="业务系统" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filter.status" placeholder="选择状态" clearable style="width: 140px">
              <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
            </el-select>
          </el-form-item>
          <el-form-item label="负责人">
            <el-input v-model="filter.owner" placeholder="负责人" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="load">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-collapse-transition>

    <div class="batch-bar" v-if="selectedRows.length">
      <span>已选择 {{ selectedRows.length }} 项</span>
      <el-button type="danger" @click="batchRemove">批量删除</el-button>
    </div>

    <el-table :data="rows" border row-key="id" @selection-change="selectedRows = $event">
      <el-table-column type="selection" width="48" />
      <el-table-column prop="displayName" label="名称" min-width="160" />
      <el-table-column v-for="field in tableFields" :key="field.key" :prop="field.key" :label="field.label" :width="field.width || 120">
        <template #default="{ row }">
          {{ row[field.key] || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="row.status === '在线' ? 'success' : row.status === '闲置' ? 'info' : 'warning'">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="360" fixed="right">
        <template #default="{ row }">
          <el-space>
            <el-button text type="primary" :icon="View" @click="openDetail(row)">详情</el-button>
            <el-button text type="primary" :icon="Edit" @click="openEdit(row)">编辑</el-button>
            <el-button text :icon="Share" @click="openRelation(row)">关联</el-button>
            <el-button text :icon="DocumentCopy" @click="copyInfo(row)">复制</el-button>
            <el-button text @click="jumpTo('monitor', row)">监控</el-button>
            <el-button text @click="jumpTo('ticket', row)">工单</el-button>
            <el-button text type="danger" :icon="Delete" @click="remove(row)">删除</el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="760px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item v-for="f in currentFields" :key="f.key" :label="f.label" :prop="f.key">
        <template v-if="fieldType(f) === 'select'">
          <el-select v-model="form[f.key]" style="width: 260px" placeholder="请选择">
            <el-option v-for="o in (f.options||[])" :key="o" :label="o" :value="o" />
          </el-select>
        </template>
        <template v-else-if="fieldType(f) === 'number'">
          <el-input-number v-model="form[f.key]" :min="0" :controls="false" style="width: 260px" />
        </template>
        <template v-else-if="fieldType(f) === 'date'">
          <el-date-picker v-model="form[f.key]" type="date" style="width: 260px" />
        </template>
        <template v-else-if="fieldType(f) === 'relation'">
          <el-select v-model="form[f.key]" style="width: 260px" placeholder="选择关联">
            <el-option v-for="ci in relationOptions[f.key] || []" :key="ci.id" :label="ciLabel(ci)" :value="ci.id" />
          </el-select>
        </template>
        <template v-else>
          <el-input v-model="form[f.key]" />
        </template>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-space>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </el-space>
    </template>
  </el-dialog>

  <el-drawer v-model="relDrawerVisible" title="配置项关系" size="860px">
    <template #default>
      <div class="drawer-title">{{ relTitle }}</div>
      <el-space wrap style="margin-bottom:12px">
        <el-select v-model="relForm.typeKey" placeholder="关系类型" style="width: 220px">
          <el-option v-for="t in relationTypeOptions" :key="t.key" :label="`${t.label}（${t.key}）`" :value="t.key" />
        </el-select>
        <el-select v-model="relForm.toCiId" placeholder="目标配置项" style="width: 360px" filterable>
          <el-option v-for="ci in targetCiOptions" :key="ci.id" :label="ciLabel(ci)" :value="ci.id" />
        </el-select>
        <el-button type="primary" :icon="Plus" @click="addRelation">新增关系</el-button>
      </el-space>
      <el-table :data="outgoingRelations" border>
        <el-table-column prop="typeKey" label="关系类型" width="220">
          <template #default="{ row }">
            {{ typeLabel(row.typeKey) }}（{{ row.typeKey }}）
          </template>
        </el-table-column>
        <el-table-column label="目标配置项">
          <template #default="{ row }">
            {{ ciLabel(ciById(row.toId)) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button text type="danger" :icon="Delete" @click="removeRelation(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </el-drawer>

  <el-drawer v-model="detailVisible" title="配置项详情" size="920px">
    <template #default>
      <div class="detail-grid">
        <el-card class="detail-card">
          <template #header><div class="detail-title">基础信息</div></template>
          <div class="detail-row" v-for="item in detailBase" :key="item.label">
            <span class="detail-label">{{ item.label }}</span>
            <span>{{ item.value }}</span>
          </div>
        </el-card>

        <el-card class="detail-card">
          <template #header><div class="detail-title">关联关系</div></template>
          <el-table :data="detailRelations" border size="small" height="220">
            <el-table-column prop="typeKey" label="关系类型" width="180" />
            <el-table-column prop="target" label="目标配置项" />
          </el-table>
        </el-card>

        <el-card class="detail-card">
          <template #header><div class="detail-title">监控状态</div></template>
          <div class="detail-row">
            <span class="detail-label">状态</span>
            <el-tag :type="monitorInfo.status === 'alert' ? 'danger' : 'success'">{{ monitorInfo.status === 'alert' ? '告警' : '正常' }}</el-tag>
          </div>
          <div class="detail-row"><span class="detail-label">详情</span><span>{{ monitorInfo.detail }}</span></div>
          <div class="detail-row"><span class="detail-label">更新时间</span><span>{{ formatTime(monitorInfo.lastAt) }}</span></div>
        </el-card>

        <el-card class="detail-card">
          <template #header><div class="detail-title">关联工单</div></template>
          <el-table :data="detailTickets" border size="small" height="220">
            <el-table-column prop="id" label="工单号" width="140" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="status" label="状态" width="100" />
          </el-table>
        </el-card>

        <el-card class="detail-card">
          <template #header><div class="detail-title">变更记录</div></template>
          <el-table :data="detailChanges" border size="small" height="220">
            <el-table-column prop="id" label="变更号" width="140" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="status" label="状态" width="100" />
          </el-table>
        </el-card>
      </div>
    </template>
  </el-drawer>

  <el-dialog v-model="importVisible" title="批量导入" width="760px">
    <el-form label-width="110px">
      <el-form-item label="导入模型">
        <el-select v-model="importModelCode" style="width: 260px">
          <el-option v-for="m in models" :key="m.code" :label="`${m.name}（${m.code}）`" :value="m.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="内容">
        <el-input v-model="importText" type="textarea" :rows="10" placeholder='粘贴 JSON 数组内容，例如：[{"ip":"10.1.2.3"}]' />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-space>
        <el-button @click="importVisible=false">取消</el-button>
        <el-button type="primary" @click="doImport">开始导入</el-button>
      </el-space>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, DocumentCopy, Download, Edit, Plus, Share, Upload, View } from '@element-plus/icons-vue'
import {
  createCi,
  createCiRelation,
  deleteCi,
  deleteCiRelation,
  exportCis,
  getCategories,
  getCiChanges,
  getCiModels,
  getCiRelations,
  getCiTickets,
  getCis,
  getModelRelations,
  getMonitorStatus,
  getRelationTypes,
  getStatusOptions,
  importCis,
  updateCi
} from '@/mock-data/modules/cmdb'

const models = ref([])
const categories = ref([])
const relationTypes = ref([])
const modelRelations = ref([])
const statusOptions = ref([])
const rows = ref([])
const modelCode = ref('')
const keyword = ref('')
const quickView = ref('')
const advancedVisible = ref(false)
const selectedRows = ref([])

const filter = reactive({ ip: '', categoryId: '', bizSystem: '', status: '', owner: '' })

const categoryMap = computed(() => {
  const map = {}
  categories.value.forEach(c => { map[c.id] = c })
  return map
})

const leafCategories = computed(() => categories.value.filter(c => c.parentId))

const categoryLabel = (c) => {
  if (!c) return '-'
  if (!c.parentId) return c.name
  const parent = categoryMap.value[c.parentId]
  return parent ? `${parent.name} / ${c.name}` : c.name
}

const currentModel = computed(() => models.value.find(m => m.code === modelCode.value))
const currentFields = computed(() => currentModel.value?.fields || [])
const tableFields = computed(() => {
  // 基础字段，这些字段在所有模型中都应该存在
  const baseFields = [
    { key: 'ip', label: 'IP', width: 140 },
    { key: 'owner', label: '负责人', width: 120 },
    { key: 'bizSystem', label: '所属业务系统', width: 160 },
    { key: 'category', label: '分类', width: 150 }
  ]
  
  // 从当前模型的字段中添加额外的字段
  const modelFields = currentFields.value
    .filter(field => !['ip', 'owner', 'bizSystem', 'category', 'name'].includes(field.key)) // 排除已经在基础字段中的字段
    .map(field => ({
      key: field.key,
      label: field.label,
      width: field.width || 120
    }))
  
  return [...baseFields, ...modelFields]
})

const loadMeta = async () => {
  models.value = await getCiModels()
  categories.value = await getCategories()
  relationTypes.value = await getRelationTypes()
  modelRelations.value = await getModelRelations()
  statusOptions.value = await getStatusOptions()
  if (!modelCode.value && models.value.length) modelCode.value = models.value[0].code
}

const buildRows = async () => {
  const list = await getCis({
    modelCode: modelCode.value,
    keyword: keyword.value,
    ip: filter.ip,
    categoryId: filter.categoryId,
    bizSystem: filter.bizSystem,
    status: filter.status,
    owner: filter.owner
  })
  const monitorList = await Promise.all(list.map(ci => getMonitorStatus(ci.id)))
  const filtered = list.filter((ci, idx) => {
    const monitor = monitorList[idx]
    if (!quickView.value) return true
    if (quickView.value === 'owner') return String(ci.attributes?.owner || '').includes('运维')
    if (quickView.value === 'online') return ci.status === '在线'
    if (quickView.value === 'idle') return ci.status === '闲置'
    if (quickView.value === 'alert') return monitor?.status === 'alert'
    return true
  })
  rows.value = filtered.map((ci, idx) => {
    const monitor = monitorList[idx]
    const model = models.value.find(m => m.code === ci.modelCode)
    const category = categoryLabel(categoryMap.value[model?.categoryId])
    const name = ci.attributes?.name || ci.attributes?.ip || ci.id
    const ip = ci.attributes?.ip || '-'
    
    // 构建基础属性
    const row = {
      ...ci,
      displayName: name,
      ip,
      category,
      owner: ci.attributes?.owner || '-',
      bizSystem: ci.attributes?.bizSystem || '-',
      status: ci.status || '在线',
      monitorStatus: monitor?.status || 'normal'
    }
    
    // 添加模型中定义的其他字段
    if (model?.fields) {
      model.fields.forEach(field => {
        if (!['ip', 'owner', 'bizSystem', 'category', 'name'].includes(field.key)) {
          row[field.key] = ci.attributes?.[field.key] || '-'
        }
      })
    }
    
    return row
  })
}

const load = async () => {
  if (!modelCode.value) return
  await buildRows()
}

onMounted(async () => {
  await loadMeta()
  await load()
})

watch(modelCode, load)

const setQuickView = (view) => {
  quickView.value = quickView.value === view ? '' : view
  load()
}

const resetFilter = () => {
  filter.ip = ''
  filter.categoryId = ''
  filter.bizSystem = ''
  filter.status = ''
  filter.owner = ''
  keyword.value = ''
  load()
}

const dialogVisible = ref(false)
const formRef = ref()
const editingId = ref('')
const form = reactive({})
const relationOptions = ref({})

const rules = computed(() => {
  const r = {}
  for (const f of currentFields.value) {
    if (f.required) r[f.key] = [{ required: true, message: `请输入${f.label}`, trigger: 'blur' }]
  }
  return r
})

const dialogTitle = computed(() => (editingId.value ? '编辑配置项' : '新增配置项'))

const fieldType = (f) => {
  if (f.type === 'select' || f.type === 'enum') return 'select'
  if (f.type === 'date') return 'date'
  if (f.type === 'relation') return 'relation'
  if (f.type === 'number') return 'number'
  return 'text'
}

const resetForm = () => {
  for (const k of Object.keys(form)) delete form[k]
  for (const f of currentFields.value) {
    form[f.key] = ''
  }
}

const loadRelationOptions = async () => {
  relationOptions.value = {}
  for (const f of currentFields.value) {
    if (f.type === 'relation' && f.relationModelCode) {
      relationOptions.value[f.key] = await getCis({ modelCode: f.relationModelCode })
    }
  }
}

const openCreate = async () => {
  editingId.value = ''
  resetForm()
  await loadRelationOptions()
  dialogVisible.value = true
}

const openEdit = async (row) => {
  editingId.value = row.id
  resetForm()
  for (const f of currentFields.value) {
    form[f.key] = row.attributes?.[f.key]
  }
  await loadRelationOptions()
  dialogVisible.value = true
}

const save = async () => {
  await formRef.value?.validate()
  try {
    if (editingId.value) {
      await updateCi(editingId.value, { ...form }, { operator: 'cmdb', source: 'manual' })
      ElMessage.success('已保存')
    } else {
      await createCi(modelCode.value, { ...form }, { operator: 'cmdb', source: 'manual' })
      ElMessage.success('已新增')
    }
    dialogVisible.value = false
    await load()
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  }
}

const remove = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该配置项吗？', '提示', { type: 'warning' })
    await deleteCi(row.id)
    ElMessage.success('已删除')
    await load()
  } catch (e) {
    if (e === 'cancel') return
    ElMessage.error(e?.message || '删除失败')
  }
}

const batchRemove = async () => {
  try {
    await ElMessageBox.confirm('确认删除选中的配置项吗？', '提示', { type: 'warning' })
    for (const row of selectedRows.value) {
      await deleteCi(row.id)
    }
    ElMessage.success('已删除')
    selectedRows.value = []
    await load()
  } catch (e) {
    if (e === 'cancel') return
    ElMessage.error(e?.message || '删除失败')
  }
}

const relDrawerVisible = ref(false)
const activeCi = ref(null)
const outgoingRelations = ref([])
const allCis = ref([])
const relForm = reactive({ typeKey: '', toCiId: '' })

const relTitle = computed(() => {
  if (!activeCi.value) return ''
  return `${ciLabel(activeCi.value)}`
})

const allowedRelations = computed(() => {
  const fromCode = activeCi.value?.modelCode
  if (!fromCode) return []
  return modelRelations.value.filter(r => r.fromModelCode === fromCode)
})

const relationTypeOptions = computed(() => {
  const allowedTypeKeys = Array.from(new Set(allowedRelations.value.map(r => r.typeKey)))
  return relationTypes.value.filter(t => allowedTypeKeys.includes(t.key))
})

const targetModelCodes = computed(() => {
  const fromCode = activeCi.value?.modelCode
  const typeKey = relForm.typeKey
  if (!fromCode || !typeKey) return []
  return allowedRelations.value.filter(r => r.typeKey === typeKey).map(r => r.toModelCode)
})

const targetCiOptions = computed(() => {
  const ids = new Set(outgoingRelations.value.map(r => r.toId))
  const targets = allCis.value
    .filter(ci => ci.id !== activeCi.value?.id)
    .filter(ci => (targetModelCodes.value.length ? targetModelCodes.value.includes(ci.modelCode) : true))
    .filter(ci => !ids.has(ci.id))
  return targets
})

const ciById = (id) => allCis.value.find(ci => ci.id === id)

const ciLabel = (ci) => {
  if (!ci) return '-'
  const m = models.value.find(x => x.code === ci.modelCode)
  const key = m?.displayField
  const name = key ? ci.attributes?.[key] : ''
  return `${name || ci.id}（${m?.name || ci.modelCode}）`
}

const typeLabel = (key) => relationTypes.value.find(t => t.key === key)?.label || key

const loadRelations = async () => {
  if (!activeCi.value) return
  outgoingRelations.value = await getCiRelations({ fromId: activeCi.value.id })
}

const openRelation = async (row) => {
  activeCi.value = row
  relForm.typeKey = ''
  relForm.toCiId = ''
  allCis.value = await getCis({})
  await loadRelations()
  relDrawerVisible.value = true
}

const addRelation = async () => {
  try {
    if (!relForm.typeKey || !relForm.toCiId) {
      ElMessage.warning('请选择关系类型与目标配置项')
      return
    }
    await createCiRelation({ fromId: activeCi.value.id, toId: relForm.toCiId, typeKey: relForm.typeKey })
    ElMessage.success('已新增')
    relForm.toCiId = ''
    await loadRelations()
  } catch (e) {
    ElMessage.error(e?.message || '新增失败')
  }
}

const removeRelation = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该关系吗？', '提示', { type: 'warning' })
    await deleteCiRelation(row.id)
    ElMessage.success('已删除')
    await loadRelations()
  } catch (e) {
    if (e === 'cancel') return
    ElMessage.error(e?.message || '删除失败')
  }
}

const detailVisible = ref(false)
const detailBase = ref([])
const detailRelations = ref([])
const detailTickets = ref([])
const detailChanges = ref([])
const monitorInfo = ref({ status: 'normal', detail: '', lastAt: '' })

const openDetail = async (row) => {
  detailBase.value = [
    { label: '名称', value: row.displayName },
    { label: 'IP', value: row.ip },
    { label: '环境', value: row.model },
    { label: '分类', value: row.category },
    { label: '负责人', value: row.owner },
    { label: '状态', value: row.status },
    { label: '所属业务系统', value: row.bizSystem }
  ]
  const relations = await getCiRelations({ fromId: row.id })
  const all = await getCis({})
  const localLabel = (ci) => {
    if (!ci) return '-'
    const m = models.value.find(x => x.code === ci.modelCode)
    const key = m?.displayField
    const name = key ? ci.attributes?.[key] : ''
    return `${name || ci.id}（${m?.name || ci.modelCode}）`
  }
  detailRelations.value = relations.map(r => ({
    typeKey: typeLabel(r.typeKey),
    target: localLabel(all.find(ci => ci.id === r.toId))
  }))
  monitorInfo.value = await getMonitorStatus(row.id)
  detailTickets.value = await getCiTickets(row.id)
  detailChanges.value = await getCiChanges(row.id)
  detailVisible.value = true
}

const copyInfo = async (row) => {
  const text = `${row.displayName} ${row.ip}`
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch {
    ElMessage.success('已复制')
  }
}

const jumpTo = (type) => {
  ElMessage.success(type === 'monitor' ? '已跳转监控' : '已跳转工单')
}

const formatTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const importVisible = ref(false)
const importText = ref('')
const importModelCode = ref('')

const openImport = () => {
  importModelCode.value = modelCode.value
  importText.value = ''
  importVisible.value = true
}

const doImport = async () => {
  if (!importModelCode.value) return
  const content = String(importText.value || '').trim()
  if (!content) {
    ElMessage.warning('请输入导入内容')
    return
  }
  try {
    const res = await importCis({ modelCode: importModelCode.value, format: 'json', content })
    ElMessage.success(`导入完成：新增 ${res.created}，更新 ${res.updated}，失败 ${res.failed}`)
    importVisible.value = false
    await load()
  } catch (e) {
    ElMessage.error(e?.message || '导入失败')
  }
}

const doExport = async () => {
  if (!modelCode.value) return
  try {
    const text = await exportCis({ modelCode: modelCode.value, format: 'json' })
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cmdb-${modelCode.value}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    ElMessage.success('已导出')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}
</script>

<style scoped>
.cmdb-ci-page .ci-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.cmdb-ci-page .search {
  width: 320px;
}

.cmdb-ci-page .select {
  width: 220px;
}

.quick-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.advanced-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  font-weight: 600;
}

.drawer-title {
  font-weight: 600;
  margin-bottom: 10px;
}

.detail-grid {
  display: grid;
  gap: 12px;
}

.detail-card {
  border: 1px solid #e5edf5;
}

.detail-title {
  font-weight: 600;
}

.detail-row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.detail-label {
  width: 90px;
  color: #64748b;
}
</style>

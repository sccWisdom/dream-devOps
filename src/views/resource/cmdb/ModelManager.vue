﻿<template>
  <div class="panel cmdb-model-page" v-loading="loading">
    <section class="page-head">
      <div class="head-main">
        <h3 class="head-title">资源模型</h3>
        <p class="head-subtitle">统一维护分类、模型字段和模型关系，确保配置项数据结构可控、可追踪。</p>
      </div>
      <div class="head-stats">
        <article v-for="item in summaryCards" :key="item.label" class="head-stat-card">
          <div class="head-stat-label">{{ item.label }}</div>
          <div class="head-stat-value">{{ item.value }}</div>
        </article>
      </div>
    </section>

    <section class="workbench-shell">
      <el-tabs v-model="subTab" class="model-tabs">
        <el-tab-pane label="分类管理" name="categories">
          <div class="action-bar">
            <div class="action-left">
              <el-button type="primary" :icon="Plus" @click="openCreateCategory(null)">新增一级分类</el-button>
              <el-button @click="loadAll">刷新</el-button>
            </div>
            <div class="action-right">共 {{ categories.length }} 个分类</div>
          </div>

          <div class="table-shell tree-shell">
            <el-tree
              :data="categoryTree"
              node-key="id"
              default-expand-all
              :expand-on-click-node="false"
            >
              <template #default="{ data }">
                <div class="tree-node">
                  <div class="tree-title">
                    <span>{{ data.name }}</span>
                    <el-tag v-if="data.status === 'disabled'" size="small" type="warning">已禁用</el-tag>
                  </div>
                  <div class="tree-actions">
                    <el-button text size="small" @click.stop="openCreateCategory(data)">新增子类</el-button>
                    <el-button text size="small" type="primary" @click.stop="openEditCategory(data)">编辑</el-button>
                    <el-button text size="small" @click.stop="toggleCategoryStatus(data)">
                      {{ data.status === 'disabled' ? '启用' : '禁用' }}
                    </el-button>
                    <el-button text size="small" type="danger" @click.stop="removeCategory(data)">删除</el-button>
                  </div>
                </div>
              </template>
            </el-tree>
          </div>
        </el-tab-pane>

        <el-tab-pane label="模型管理" name="models">
          <div class="action-bar">
            <div class="action-left">
              <el-button type="primary" :icon="Plus" @click="openCreateModel">新增模型</el-button>
              <el-input v-model="q" placeholder="搜索模型名称/编码" class="search" clearable />
              <el-button @click="loadAll">刷新</el-button>
            </div>
            <div class="action-right">共 {{ modelRows.length }} 个模型</div>
          </div>

          <div class="table-shell">
            <el-table :data="modelRows" border>
              <el-table-column prop="name" label="模型名称" width="160">
                <template #default="{ row }">
                  <div class="model-name">
                    <span>{{ row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="categoryName" label="所属分类" width="160" />
              <el-table-column prop="fieldCount" label="字段数量" width="100" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ row.status === 'active' ? '启用' : '停用' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="180">
                <template #default="{ row }">
                  {{ formatTime(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" />
              <el-table-column label="操作" width="320" fixed="right">
                <template #default="{ row }">
                  <el-space>
                    <el-button text type="primary" :icon="Edit" @click="openEditModel(row)">编辑</el-button>
                    <el-button text :icon="Setting" @click="openFieldDrawer(row)">字段</el-button>
                    <el-button text :icon="Share" @click="openRelationDrawer(row)">关系</el-button>
                    <el-button text type="danger" :icon="Delete" @click="removeModel(row)">删除</el-button>
                  </el-space>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="关系类型" name="types">
          <div class="action-bar">
            <div class="action-left">
              <el-button type="primary" :icon="Plus" @click="openCreateType">新增关系类型</el-button>
              <el-button @click="loadAll">刷新</el-button>
            </div>
            <div class="action-right">共 {{ relationTypes.length }} 种关系类型</div>
          </div>

          <div class="table-shell">
            <el-table :data="relationTypes" border>
              <el-table-column prop="label" label="名称" />
              <el-table-column prop="key" label="编码" width="180" />
              <el-table-column label="方向" width="100">
                <template #default="{ row }">
                  <el-tag>{{ row.directional ? '有向' : '无向' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button text type="danger" :icon="Delete" @click="removeType(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
<el-dialog v-model="categoryDialogVisible" :title="categoryDialogTitle" width="520px">
    <el-form ref="categoryFormRef" :model="categoryForm" :rules="categoryRules" label-width="100px">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="categoryForm.name" />
      </el-form-item>
      <el-form-item label="父级分类">
        <el-select v-model="categoryForm.parentId" placeholder="一级分类" style="width: 220px" clearable>
          <el-option v-for="c in rootCategories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-space>
        <el-button @click="categoryDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存</el-button>
      </el-space>
    </template>
  </el-dialog>

  <el-dialog v-model="modelDialogVisible" :title="modelDialogTitle" width="640px">
    <el-form ref="modelFormRef" :model="modelForm" :rules="modelRules" label-width="100px">
      <el-form-item label="模型名称" prop="name">
        <el-input v-model="modelForm.name" placeholder="例如：中间件、网络设备" />
      </el-form-item>
      <el-form-item label="编码" prop="code">
        <el-input v-model="modelForm.code" placeholder="小写英文字母/数字，例如：middleware" />
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryId">
        <el-select v-model="modelForm.categoryId" placeholder="选择分类" style="width: 280px">
          <el-option v-for="c in leafCategories" :key="c.id" :label="categoryLabel(c)" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="展示字段" prop="displayField">
        <el-input v-model="modelForm.displayField" placeholder="例如：name/ip" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="modelForm.status" style="width: 160px">
          <el-option label="启用" value="active" />
          <el-option label="停用" value="inactive" />
        </el-select>
      </el-form-item>
      <el-form-item label="说明">
        <el-input v-model="modelForm.description" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-space>
        <el-button @click="modelDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveModel">保存</el-button>
      </el-space>
    </template>
  </el-dialog>

  <el-drawer v-model="fieldDrawerVisible" title="字段配置" size="860px">
    <template #default>
      <div class="drawer-title">{{ currentModel?.name }}（{{ currentModel?.code }}）</div>
      <el-space wrap style="margin-bottom:12px">
        <el-button type="primary" :icon="Plus" @click="openCreateField">新增字段</el-button>
      </el-space>
      <el-table :data="currentFields" border>
        <el-table-column prop="label" label="字段名称" width="160" />
        <el-table-column prop="key" label="编码" width="160" />
        <el-table-column prop="type" label="类型" width="140">
          <template #default="{ row }">{{ fieldTypeLabel(row.type) }}</template>
        </el-table-column>
        <el-table-column label="关联模型" width="160">
          <template #default="{ row }">
            <span v-if="row.type === 'relation'">{{ modelLabel(row.relationModelCode) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="必填" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.required" type="danger">是</el-tag>
            <span v-else>否</span>
          </template>
        </el-table-column>
        <el-table-column label="唯一" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.unique" type="warning">是</el-tag>
            <span v-else>否</span>
          </template>
        </el-table-column>
        <el-table-column label="下拉选项">
          <template #default="{ row }">
            <span v-if="row.type==='select'">{{ (row.options||[]).join(' / ') }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-button text type="primary" :icon="Edit" @click="openEditField(row)">编辑</el-button>
              <el-button text type="danger" :icon="Delete" @click="removeField(row)">删除</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </el-drawer>

  <el-dialog v-model="fieldDialogVisible" :title="fieldDialogTitle" width="680px">
    <el-form ref="fieldFormRef" :model="fieldForm" :rules="fieldRules" label-width="100px">
      <el-form-item label="字段名称" prop="label">
        <el-input v-model="fieldForm.label" />
      </el-form-item>
      <el-form-item label="编码" prop="key">
        <el-input v-model="fieldForm.key" :disabled="fieldKeyLocked" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="fieldForm.type" style="width: 240px">
          <el-option label="文本" value="text" />
          <el-option label="数字" value="number" />
          <el-option label="下拉" value="select" />
          <el-option label="日期" value="date" />
          <el-option label="关联关系" value="relation" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="fieldForm.type==='select'" label="下拉选项" prop="optionsText">
        <el-input v-model="fieldForm.optionsText" placeholder="用英文逗号分隔，例如：生产,测试" />
      </el-form-item>
      <el-form-item v-if="fieldForm.type==='relation'" label="关联模型" prop="relationModelCode">
        <el-select v-model="fieldForm.relationModelCode" style="width: 240px" placeholder="选择模型">
          <el-option v-for="m in models" :key="m.code" :label="`${m.name}（${m.code}）`" :value="m.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="必填">
        <el-switch v-model="fieldForm.required" />
      </el-form-item>
      <el-form-item label="唯一">
        <el-switch v-model="fieldForm.unique" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-space>
        <el-button @click="fieldDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveField">保存</el-button>
      </el-space>
    </template>
  </el-dialog>

  <el-drawer v-model="relationDrawerVisible" title="模型关系配置" size="820px">
    <template #default>
      <div class="drawer-title">{{ currentModel?.name }}（{{ currentModel?.code }}）</div>
      <el-space wrap style="margin-bottom:12px">
        <el-select v-model="newRel.typeKey" placeholder="关系类型" style="width: 200px">
          <el-option v-for="t in relationTypes" :key="t.key" :label="t.label" :value="t.key" />
        </el-select>
        <el-select v-model="newRel.toModelCode" placeholder="目标模型" style="width: 220px">
          <el-option v-for="m in models" :key="m.code" :label="`${m.name}（${m.code}）`" :value="m.code" />
        </el-select>
        <el-button type="primary" :icon="Plus" @click="addModelRelation">新增关系</el-button>
      </el-space>
      <el-table :data="currentModelRelations" border>
        <el-table-column prop="typeKey" label="关系类型" width="200">
          <template #default="{ row }">
            {{ typeLabel(row.typeKey) }}（{{ row.typeKey }}）
          </template>
        </el-table-column>
        <el-table-column prop="toModelCode" label="目标模型">
          <template #default="{ row }">
            {{ modelLabel(row.toModelCode) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button text type="danger" :icon="Delete" @click="removeModelRelation(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </el-drawer>

  <el-dialog v-model="typeDialogVisible" :title="typeDialogTitle" width="560px">
    <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="90px">
      <el-form-item label="名称" prop="label">
        <el-input v-model="typeForm.label" />
      </el-form-item>
      <el-form-item label="编码" prop="key">
        <el-input v-model="typeForm.key" placeholder="例如：owns/depends_on" />
      </el-form-item>
      <el-form-item label="方向">
        <el-switch v-model="typeForm.directional" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-space>
        <el-button @click="typeDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveType">保存</el-button>
      </el-space>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Setting, Share } from '@element-plus/icons-vue'
import {
  createCategory,
  createCiModel,
  createModelRelation,
  createRelationType,
  deleteCategory,
  deleteCiModel,
  deleteModelField,
  deleteModelRelation,
  deleteRelationType,
  getCategories,
  getCiModels,
  getModelRelations,
  getRelationTypes,
  toggleCategory,
  updateCategory,
  updateCiModel,
  upsertModelField
} from '@/mock-data/modules/cmdb'

const loading = ref(false)
const subTab = ref('categories')
const q = ref('')
const categories = ref([])
const models = ref([])
const relationTypes = ref([])
const modelRelations = ref([])

const loadAll = async () => {
  loading.value = true
  try {
    categories.value = await getCategories()
    models.value = await getCiModels()
    relationTypes.value = await getRelationTypes()
    modelRelations.value = await getModelRelations()
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)

const categoryMap = computed(() => {
  const map = {}
  categories.value.forEach(c => { map[c.id] = c })
  return map
})

const rootCategories = computed(() => categories.value.filter(c => !c.parentId))
const leafCategories = computed(() => categories.value.filter(c => c.parentId))

const categoryTree = computed(() => {
  const map = {}
  categories.value.forEach(c => { map[c.id] = { ...c, children: [] } })
  const roots = []
  categories.value.forEach(c => {
    const node = map[c.id]
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
})

const categoryLabel = (c) => {
  if (!c) return '-'
  if (!c.parentId) return c.name
  const parent = categoryMap.value[c.parentId]
  return parent ? `${parent.name} / ${c.name}` : c.name
}

const modelRows = computed(() => {
  const kw = q.value.trim()
  const rows = models.value.map(m => ({
    ...m,
    categoryName: categoryLabel(categoryMap.value[m.categoryId]),
    fieldCount: (m.fields || []).length
  }))
  if (!kw) return rows
  return rows.filter(m => (m.name || '').includes(kw) || (m.code || '').includes(kw))
})

const summaryCards = computed(() => [
  { label: '分类总数', value: categories.value.length },
  { label: '模型总数', value: models.value.length },
  { label: '关系类型', value: relationTypes.value.length },
  { label: '模型关系', value: modelRelations.value.length }
])
const formatTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const categoryDialogVisible = ref(false)
const categoryFormRef = ref()
const editingCategoryId = ref('')
const categoryForm = reactive({ name: '', parentId: null })

const categoryRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const categoryDialogTitle = computed(() => (editingCategoryId.value ? '编辑分类' : '新增分类'))

const openCreateCategory = (parent) => {
  editingCategoryId.value = ''
  categoryForm.name = ''
  categoryForm.parentId = parent?.parentId ? parent.parentId : parent?.id || null
  categoryDialogVisible.value = true
}

const openEditCategory = (row) => {
  editingCategoryId.value = row.id
  categoryForm.name = row.name
  categoryForm.parentId = row.parentId || null
  categoryDialogVisible.value = true
}

const saveCategory = async () => {
  await categoryFormRef.value?.validate()
  try {
    if (editingCategoryId.value) {
      await updateCategory(editingCategoryId.value, { name: categoryForm.name, parentId: categoryForm.parentId })
      ElMessage.success('已保存')
    } else {
      await createCategory({ name: categoryForm.name, parentId: categoryForm.parentId })
      ElMessage.success('已新增')
    }
    categoryDialogVisible.value = false
    await loadAll()
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  }
}

const toggleCategoryStatus = async (row) => {
  try {
    const next = row.status === 'disabled' ? 'active' : 'disabled'
    await toggleCategory(row.id, next)
    ElMessage.success(next === 'disabled' ? '已禁用' : '已启用')
    await loadAll()
  } catch (e) {
    ElMessage.error(e?.message || '操作失败')
  }
}

const removeCategory = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除分类“${row.name}”吗？`, '提示', { type: 'warning' })
    await deleteCategory(row.id)
    ElMessage.success('已删除')
    await loadAll()
  } catch (e) {
    if (e === 'cancel') return
    ElMessage.error(e?.message || '删除失败')
  }
}

const modelDialogVisible = ref(false)
const modelFormRef = ref()
const editingModelId = ref('')
const modelForm = reactive({
  name: '',
  code: '',
  categoryId: '',
  description: '',
  displayField: '',
  status: 'active'
})

const modelRules = {
  name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入模型编码', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择所属分类', trigger: 'change' }],
  displayField: [{ required: true, message: '请输入展示字段', trigger: 'blur' }]
}

const modelDialogTitle = computed(() => (editingModelId.value ? '编辑模型' : '新增模型'))

const resetModelForm = () => {
  modelForm.name = ''
  modelForm.code = ''
  modelForm.categoryId = ''
  modelForm.description = ''
  modelForm.displayField = ''
  modelForm.status = 'active'
}

const openCreateModel = () => {
  editingModelId.value = ''
  resetModelForm()
  modelDialogVisible.value = true
}

const openEditModel = (row) => {
  editingModelId.value = row.id
  modelForm.name = row.name
  modelForm.code = row.code
  modelForm.categoryId = row.categoryId
  modelForm.description = row.description
  modelForm.displayField = row.displayField
  modelForm.status = row.status || 'active'
  modelDialogVisible.value = true
}

const saveModel = async () => {
  await modelFormRef.value?.validate()
  try {
    if (editingModelId.value) {
      await updateCiModel(editingModelId.value, { ...modelForm })
      ElMessage.success('已保存')
    } else {
      await createCiModel({ ...modelForm, fields: [] })
      ElMessage.success('已新增')
    }
    modelDialogVisible.value = false
    await loadAll()
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  }
}

const removeModel = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除模型“${row.name}”吗？`, '提示', { type: 'warning' })
    await deleteCiModel(row.id)
    ElMessage.success('已删除')
    await loadAll()
  } catch (e) {
    if (e === 'cancel') return
    ElMessage.error(e?.message || '删除失败')
  }
}

const currentModel = ref(null)
const fieldDrawerVisible = ref(false)
const currentFields = computed(() => currentModel.value?.fields || [])

const openFieldDrawer = (row) => {
  currentModel.value = row
  fieldDrawerVisible.value = true
}

const fieldDialogVisible = ref(false)
const fieldFormRef = ref()
const fieldKeyLocked = ref(false)
const fieldForm = reactive({
  label: '',
  key: '',
  type: 'text',
  required: false,
  unique: false,
  optionsText: '',
  relationModelCode: ''
})

const fieldRules = {
  label: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
  key: [{ required: true, message: '请输入字段编码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择字段类型', trigger: 'change' }],
  optionsText: [
    {
      validator: (_, v, cb) => {
        if (fieldForm.type !== 'select') return cb()
        if (!String(v || '').trim()) return cb(new Error('请输入下拉选项'))
        cb()
      },
      trigger: 'blur'
    }
  ],
  relationModelCode: [
    {
      validator: (_, v, cb) => {
        if (fieldForm.type !== 'relation') return cb()
        if (!v) return cb(new Error('请选择关联模型'))
        cb()
      },
      trigger: 'change'
    }
  ]
}

const fieldDialogTitle = computed(() => (fieldKeyLocked.value ? '编辑字段' : '新增字段'))

const resetFieldForm = () => {
  fieldForm.label = ''
  fieldForm.key = ''
  fieldForm.type = 'text'
  fieldForm.required = false
  fieldForm.unique = false
  fieldForm.optionsText = ''
  fieldForm.relationModelCode = ''
}

const openCreateField = () => {
  fieldKeyLocked.value = false
  resetFieldForm()
  fieldDialogVisible.value = true
}

const openEditField = (row) => {
  fieldKeyLocked.value = true
  fieldForm.label = row.label
  fieldForm.key = row.key
  fieldForm.type = row.type
  fieldForm.required = !!row.required
  fieldForm.unique = !!row.unique
  fieldForm.optionsText = Array.isArray(row.options) ? row.options.join(',') : ''
  fieldForm.relationModelCode = row.relationModelCode || ''
  fieldDialogVisible.value = true
}

const saveField = async () => {
  await fieldFormRef.value?.validate()
  try {
    const options = fieldForm.type === 'select'
      ? String(fieldForm.optionsText || '').split(',').map(s => s.trim()).filter(Boolean)
      : undefined
    await upsertModelField(currentModel.value.id, {
      label: fieldForm.label,
      key: fieldForm.key,
      type: fieldForm.type,
      required: fieldForm.required,
      unique: fieldForm.unique,
      options,
      relationModelCode: fieldForm.relationModelCode
    })
    ElMessage.success('已保存')
    fieldDialogVisible.value = false
    await loadAll()
    currentModel.value = models.value.find(m => m.id === currentModel.value.id) || currentModel.value
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  }
}

const removeField = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除字段“${row.label}”吗？`, '提示', { type: 'warning' })
    await deleteModelField(currentModel.value.id, row.key)
    ElMessage.success('已删除')
    await loadAll()
    currentModel.value = models.value.find(m => m.id === currentModel.value.id) || currentModel.value
  } catch (e) {
    if (e === 'cancel') return
    ElMessage.error(e?.message || '删除失败')
  }
}

const relationDrawerVisible = ref(false)
const newRel = reactive({ typeKey: '', toModelCode: '' })
const currentModelRelations = computed(() => {
  const code = currentModel.value?.code
  if (!code) return []
  return modelRelations.value.filter(r => r.fromModelCode === code)
})

const openRelationDrawer = (row) => {
  currentModel.value = row
  newRel.typeKey = ''
  newRel.toModelCode = ''
  relationDrawerVisible.value = true
}

const typeLabel = (key) => relationTypes.value.find(t => t.key === key)?.label || key
const modelLabel = (code) => {
  const m = models.value.find(x => x.code === code)
  return m ? `${m.name}（${m.code}）` : code
}

const fieldTypeLabel = (type) => {
  const map = {
    text: '文本',
    number: '数字',
    select: '下拉',
    date: '日期',
    relation: '关联关系'
  }
  return map[type] || type
}

const addModelRelation = async () => {
  try {
    if (!newRel.typeKey || !newRel.toModelCode) {
      ElMessage.warning('请选择关系类型与目标模型')
      return
    }
    await createModelRelation({
      fromModelCode: currentModel.value.code,
      typeKey: newRel.typeKey,
      toModelCode: newRel.toModelCode
    })
    ElMessage.success('已新增')
    await loadAll()
  } catch (e) {
    ElMessage.error(e?.message || '新增失败')
  }
}

const removeModelRelation = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该模型关系吗？', '提示', { type: 'warning' })
    await deleteModelRelation(row.id)
    ElMessage.success('已删除')
    await loadAll()
  } catch (e) {
    if (e === 'cancel') return
    ElMessage.error(e?.message || '删除失败')
  }
}

const typeDialogVisible = ref(false)
const typeFormRef = ref()
const typeForm = reactive({ label: '', key: '', directional: true })
const typeRules = {
  label: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  key: [{ required: true, message: '请输入编码', trigger: 'blur' }]
}
const typeDialogTitle = computed(() => '新增关系类型')

const openCreateType = () => {
  typeForm.label = ''
  typeForm.key = ''
  typeForm.directional = true
  typeDialogVisible.value = true
}

const saveType = async () => {
  await typeFormRef.value?.validate()
  try {
    await createRelationType({ ...typeForm })
    ElMessage.success('已新增')
    typeDialogVisible.value = false
    await loadAll()
  } catch (e) {
    ElMessage.error(e?.message || '新增失败')
  }
}

const removeType = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除关系类型“${row.label}”吗？`, '提示', { type: 'warning' })
    await deleteRelationType(row.key)
    ElMessage.success('已删除')
    await loadAll()
  } catch (e) {
    if (e === 'cancel') return
    ElMessage.error(e?.message || '删除失败')
  }
}
</script>

<style scoped>
.cmdb-model-page {
  display: grid;
  gap: var(--gap);
  padding: var(--gap);
}

.page-head {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  background: linear-gradient(120deg, rgba(37, 99, 235, 0.1), rgba(255, 255, 255, 0.96));
  display: grid;
  gap: 16px;
  box-shadow: var(--shadow);
}

.head-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.head-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.head-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
}

.head-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.head-stat-card {
  border: 1px solid #e8eefc;
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.92);
  padding: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.head-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border-color: var(--brand-300);
}

.head-stat-label {
  font-size: 12px;
  color: var(--muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.head-stat-value {
  margin-top: 6px;
  font-size: 24px;
  font-weight: 700;
  color: var(--brand-600);
}

.workbench-shell {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  background: var(--surface-2);
  box-shadow: var(--shadow);
}

.model-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.model-tabs :deep(.el-tabs__item) {
  font-weight: 600;
  color: var(--muted);
  padding: 10px 20px;
  transition: all 0.2s ease;
}

.model-tabs :deep(.el-tabs__item:hover) {
  color: var(--brand-500);
}

.model-tabs :deep(.el-tabs__item.is-active) {
  color: var(--brand-500);
  font-weight: 700;
}

.model-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--brand-500);
  height: 3px;
  border-radius: 3px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.action-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.action-right {
  font-size: 12px;
  color: var(--muted);
  font-weight: 600;
  background: var(--surface);
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid var(--border);
}

.search {
  width: 280px;
  transition: all 0.2s ease;
}

.search:focus-within {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.table-shell {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface-2);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.tree-shell {
  padding: 12px 0;
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin: 2px 0;
}

.tree-node:hover {
  background: #f8fbff;
  transform: translateX(4px);
}

.tree-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text);
  flex: 1;
}

.tree-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.tree-node:hover .tree-actions {
  opacity: 1;
}

.model-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-shell :deep(.el-table) {
  border-radius: var(--radius);
  overflow: hidden;
}

.table-shell :deep(.el-table__header) th {
  background: #f3f7ff;
  color: var(--text);
  font-weight: 700;
  padding: 12px;
  border-bottom: 1px solid var(--border);
}

.table-shell :deep(.el-table__row) {
  transition: all 0.2s ease;
}

.table-shell :deep(.el-table__row:hover) {
  background: #f8fbff !important;
}

.table-shell :deep(.el-table__row:hover) td {
  background: transparent;
}

.drawer-title {
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text);
  font-size: 16px;
}

@media (max-width: 1200px) {
  .head-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .cmdb-model-page {
    padding: 12px;
  }

  .head-stats {
    grid-template-columns: 1fr;
  }

  .search {
    width: 100%;
  }

  .action-left {
    width: 100%;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .tree-actions {
    flex-wrap: wrap;
  }
}
</style>




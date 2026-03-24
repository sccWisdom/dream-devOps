<template>
  <div class="container">
    <div class="page-title">基础配置</div>

    <el-tabs v-model="configTab">
      <el-tab-pane label="分类管理" name="categories">
        <el-space wrap style="margin-bottom: 10px">
          <el-button type="primary" @click="openCategoryDialog()">新增分类</el-button>
        </el-space>
        <el-table :data="categoryFlat" border>
          <el-table-column label="名称">
            <template #default="{ row }">
              <span :style="{ paddingLeft: `${row._level*16}px` }">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="id" label="ID" width="120" />
          <el-table-column label="父级" width="220">
            <template #default="{ row }">{{ categoryName(row.parentId) }}</template>
          </el-table-column>
          <el-table-column prop="order" label="排序" width="90" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-space>
                <el-button size="small" @click="openCategoryDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteCategory(row)">删除</el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="标签管理" name="tags">
        <el-space wrap style="margin-bottom: 10px">
          <el-input v-model="newTag" placeholder="输入标签名称" style="width: 240px" />
          <el-button type="primary" @click="createTag">新增标签</el-button>
        </el-space>
        <el-table :data="tags" border>
          <el-table-column prop="name" label="标签" />
          <el-table-column prop="id" label="ID" width="120" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button size="small" type="danger" @click="deleteTag(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="模板配置" name="templates">
        <el-space wrap style="margin-bottom: 10px">
          <el-button type="primary" @click="openTemplateDialog()">新增模板</el-button>
        </el-space>
        <el-table :data="templates" border>
          <el-table-column prop="name" label="模板名称" min-width="220" />
          <el-table-column prop="type" label="知识类型" width="160" />
          <el-table-column prop="id" label="ID" width="120" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-space>
                <el-button size="small" @click="openTemplateDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteTemplate(row)">删除</el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="批量导入" name="import">
        <el-card class="panel" style="margin-bottom: 12px">
          <div style="margin-bottom: 8px; font-weight: 600">导入 JSON（数组）</div>
          <div style="margin-bottom: 8px; color: var(--el-text-color-secondary)">
            字段示例：title, content, categoryId, tagIds, acl
          </div>
          <el-upload :show-file-list="false" :before-upload="beforeImport">
            <el-button type="primary">选择文件</el-button>
          </el-upload>
          <div v-if="importResult" style="margin-top: 10px">
            <el-tag type="success" style="margin-right: 8px">成功：{{ importResult.created.length }}</el-tag>
            <el-tag v-if="importResult.errors.length" type="danger">失败：{{ importResult.errors.length }}</el-tag>
            <el-table v-if="importResult.errors.length" :data="importResult.errors" border style="margin-top: 10px">
              <el-table-column prop="index" label="行" width="90" />
              <el-table-column prop="error" label="错误" />
            </el-table>
          </div>
        </el-card>

        <el-space wrap>
          <el-button type="danger" plain @click="resetDb">重置知识库数据</el-button>
        </el-space>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="categoryDialogVisible" :title="categoryDialogForm.id?'编辑分类':'新增分类'" width="520px">
      <el-form label-width="90px">
        <el-form-item label="名称" required>
          <el-input v-model="categoryDialogForm.name" />
        </el-form-item>
        <el-form-item label="父级">
          <el-tree-select
            v-model="categoryDialogForm.parentId"
            :data="categoryTree"
            clearable
            check-strictly
            placeholder="根分类"
            style="width: 320px"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryDialogForm.order" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="templateDialogVisible" :title="templateDialogForm.id?'编辑模板':'新增模板'" width="760px">
      <el-form label-width="90px">
        <el-form-item label="名称" required>
          <el-input v-model="templateDialogForm.name" />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-input v-model="templateDialogForm.type" placeholder="如：SOP / 操作手册 / 案例库" style="width: 320px" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="templateDialogForm.content" type="textarea" :rows="12" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="templateDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import {
  kbCreateTag,
  kbDeleteCategory,
  kbDeleteTag,
  kbDeleteTemplate,
  kbImportArticles,
  kbListCategories,
  kbListTags,
  kbListTemplates,
  kbReset,
  kbUpsertCategory,
  kbUpsertTemplate
} from '@/mock-data/modules/kb'

const userStore = useUserStore()

const configTab = ref('categories')
const categories = ref([])
const tags = ref([])
const templates = ref([])

const loadBase = async () => {
  categories.value = await kbListCategories()
  tags.value = await kbListTags()
  templates.value = await kbListTemplates()
}

const categoryTree = computed(() => {
  const list = categories.value.slice().sort((a, b) => (a.order || 0) - (b.order || 0) || String(a.name).localeCompare(String(b.name)))
  const map = new Map(list.map(c => [c.id, { value: c.id, label: c.name, children: [] }]))
  const roots = []
  list.forEach(c => {
    const node = map.get(c.id)
    if (c.parentId && map.has(c.parentId)) map.get(c.parentId).children.push(node)
    else roots.push(node)
  })
  const clean = (n) => {
    if (!n.children.length) delete n.children
    else n.children.forEach(clean)
  }
  roots.forEach(clean)
  return roots
})

const categoryName = (id) => {
  if (!id) return '-'
  const c = categories.value.find(x => x.id === id)
  return c ? c.name : '-'
}

const categoryFlat = computed(() => {
  const list = categories.value.slice().sort((a, b) => (a.order || 0) - (b.order || 0) || String(a.name).localeCompare(String(b.name)))
  const children = new Map()
  list.forEach(c => {
    const k = c.parentId || '__root__'
    if (!children.has(k)) children.set(k, [])
    children.get(k).push(c)
  })
  const out = []
  const walk = (parentId, level) => {
    ;(children.get(parentId || '__root__') || []).forEach(c => {
      out.push({ ...c, _level: level })
      walk(c.id, level + 1)
    })
  }
  walk(null, 0)
  return out
})

const newTag = ref('')
const createTag = async () => {
  try {
    await kbCreateTag(newTag.value)
    newTag.value = ''
    await loadBase()
    ElMessage.success('已新增标签')
  } catch (e) {
    ElMessage.error(e?.message || '新增失败')
  }
}

const deleteTag = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除标签「${row.name}」？`, '提示', { type: 'warning' })
    await kbDeleteTag(row.id)
    await loadBase()
    ElMessage.success('已删除')
  } catch {}
}

const categoryDialogVisible = ref(false)
const categoryDialogForm = reactive({ id: '', name: '', parentId: '', order: 0 })
const openCategoryDialog = (row) => {
  categoryDialogForm.id = row?.id || ''
  categoryDialogForm.name = row?.name || ''
  categoryDialogForm.parentId = row?.parentId || ''
  categoryDialogForm.order = row?.order || 0
  categoryDialogVisible.value = true
}
const saveCategory = async () => {
  try {
    await kbUpsertCategory({
      id: categoryDialogForm.id || undefined,
      name: categoryDialogForm.name,
      parentId: categoryDialogForm.parentId || null,
      order: categoryDialogForm.order
    })
    categoryDialogVisible.value = false
    await loadBase()
    ElMessage.success('已保存')
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  }
}
const deleteCategory = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除分类「${row.name}」及其子分类？`, '提示', { type: 'warning' })
    await kbDeleteCategory(row.id)
    await loadBase()
    ElMessage.success('已删除')
  } catch {}
}

const templateDialogVisible = ref(false)
const templateDialogForm = reactive({ id: '', name: '', type: '', content: '' })
const openTemplateDialog = (row) => {
  templateDialogForm.id = row?.id || ''
  templateDialogForm.name = row?.name || ''
  templateDialogForm.type = row?.type || ''
  templateDialogForm.content = row?.content || ''
  templateDialogVisible.value = true
}
const saveTemplate = async () => {
  try {
    await kbUpsertTemplate({
      id: templateDialogForm.id || undefined,
      name: templateDialogForm.name,
      type: templateDialogForm.type,
      content: templateDialogForm.content
    })
    templateDialogVisible.value = false
    await loadBase()
    ElMessage.success('已保存')
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  }
}
const deleteTemplate = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除模板「${row.name}」？`, '提示', { type: 'warning' })
    await kbDeleteTemplate(row.id)
    await loadBase()
    ElMessage.success('已删除')
  } catch {}
}

const importResult = ref(null)
const beforeImport = async (file) => {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    if (!Array.isArray(data)) throw new Error('JSON 顶层需为数组')
    importResult.value = await kbImportArticles(data, { by: userStore.name })
    ElMessage.success('导入完成')
  } catch (e) {
    ElMessage.error(e?.message || '导入失败')
  }
  return false
}

const resetDb = async () => {
  try {
    await ElMessageBox.confirm('将清空并重置知识库数据（仅影响本地浏览器存储）。确认继续？', '提示', { type: 'warning' })
    await kbReset()
    importResult.value = null
    await loadBase()
    ElMessage.success('已重置')
  } catch {}
}

onMounted(async () => {
  await loadBase()
})
</script>
<style scoped>
</style>
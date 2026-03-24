<template>
  <div class="container priority-page">
    <div class="title-bar">
      <div class="title">优先级管理</div>
      <div class="title-line"></div>
    </div>

    <QueryBar>
      <el-input v-model="q" placeholder="优先级" style="width: 320px" clearable @keyup.enter="onSearch">
        <template #append>
          <el-button type="primary" :icon="Search" @click="onSearch">搜索</el-button>
        </template>
      </el-input>
      <template #ops>
        <el-button type="primary" @click="openCreate">新增</el-button>
      </template>
    </QueryBar>

    <el-card shadow="never" class="panel">
      <el-table :data="rows" border>
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="name" label="名称">
          <template #default="{ row }">
            <span class="name" :style="{ color: row.color }">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否启用" width="220">
          <template #default="{ row }">
            <div class="enable">
              <span class="flag">否</span>
              <el-switch v-model="row.enabled" />
              <span class="flag on">是</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="描述" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" :icon="Delete" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="visible" :title="dialogTitle" width="900px" align-center>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px" class="form">
        <el-form-item label="名称：" prop="name" required>
          <el-input v-model="form.name" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="颜色：" prop="color" required>
          <div class="color-row">
            <el-input v-model="form.color" placeholder="请选择" />
            <el-color-picker v-model="form.color" />
          </div>
        </el-form-item>

        <el-form-item label="优先级等级值：" prop="level" required>
          <el-select v-model="form.level" placeholder="请选择优先级等级值">
            <el-option label="P0" value="P0" />
            <el-option label="P1" value="P1" />
            <el-option label="P2" value="P2" />
            <el-option label="P3" value="P3" />
          </el-select>
        </el-form-item>

        <el-form-item label="描述：" prop="desc">
          <el-input v-model="form.desc" type="textarea" :rows="4" placeholder="请输入" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dlg-foot">
          <el-button type="primary" class="btn" @click="save(false)">仅保存</el-button>
          <el-button type="primary" class="btn" @click="save(true)">保存并开启</el-button>
          <el-button class="btn ghost" @click="visible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Search } from '@element-plus/icons-vue'
import QueryBar from '@/components/Common/QueryBar.vue'
import { getPriorityList } from '@/mock-data/modules/priority'

const list = ref([])
const q = ref('')
const visible = ref(false)
const editingId = ref('')
const formRef = ref()

const form = reactive({
  name: '',
  color: '',
  level: '',
  desc: ''
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  color: [{ required: true, message: '请选择颜色', trigger: 'change' }],
  level: [{ required: true, message: '请输入优先级等级值', trigger: 'blur' }]
}

const dialogTitle = computed(() => (editingId.value ? '编辑' : '新增'))

const rows = computed(() => {
  const kw = q.value.trim()
  const src = kw ? list.value.filter((i) => i.name.includes(kw)) : list.value
  const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 }
  return src.slice().sort((a, b) => priorityOrder[a.level] - priorityOrder[b.level])
})

const onSearch = () => {}

const resetForm = () => {
  form.name = ''
  form.color = ''
  form.level = ''
  form.desc = ''
}

const openCreate = () => {
  editingId.value = ''
  resetForm()
  visible.value = true
}

const openEdit = (row) => {
  editingId.value = row.id
  form.name = row.name
  form.color = row.color
  form.level = String(row.level)
  form.desc = row.desc
  visible.value = true
}

const save = async (enableAfter) => {
  await formRef.value?.validate()
  
  const payload = {
    name: form.name,
    color: form.color,
    level: form.level,
    desc: form.desc
  }

  if (editingId.value) {
    const idx = list.value.findIndex((i) => i.id === editingId.value)
    if (idx >= 0) {
      list.value[idx] = { ...list.value[idx], ...payload, enabled: enableAfter ? true : list.value[idx].enabled }
    }
    ElMessage.success('已保存')
  } else {
    list.value.unshift({
      id: `pri-${Date.now()}`,
      ...payload,
      enabled: enableAfter ? true : false
    })
    ElMessage.success('已新增')
  }
  visible.value = false
}

const remove = async (row) => {
  await ElMessageBox.confirm(`确认删除 ${row.name}？`, '提示', { type: 'warning' })
  list.value = list.value.filter((i) => i.id !== row.id)
  ElMessage.success('已删除')
}

onMounted(async () => {
  list.value = await getPriorityList()
})
</script>

<style scoped>
.title-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.title {
  font-size: 16px;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.92);
}

.title-line {
  width: 80px;
  height: 2px;
  background: rgba(37, 99, 235, 0.9);
  border-radius: 999px;
}

.name {
  font-weight: 700;
}

.enable {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.flag {
  color: rgba(71, 85, 105, 0.78);
  font-size: 12px;
}

.flag.on {
  color: rgba(37, 99, 235, 0.9);
}

.form {
  padding: 10px 40px 0 40px;
}

.color-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.color-row :deep(.el-color-picker__trigger) {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid var(--el-border-color);
  transition: all 0.2s ease-in-out;
}

.color-row :deep(.el-color-picker__trigger:hover) {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
  transform: translateY(-1px);
}

.color-row :deep(.el-color-picker__trigger.is-active) {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.dlg-foot {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 6px 0 16px;
}

.btn {
  min-width: 120px;
  height: 36px;
  border-radius: 6px;
}

.ghost {
  border: 1px solid rgba(203, 213, 225, 0.9);
}
</style>


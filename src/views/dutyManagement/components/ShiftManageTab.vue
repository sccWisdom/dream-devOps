<template>
  <el-card shadow="never" class="panel">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-weight:700">班次管理</div>
      <el-space>
        <el-button type="primary" @click="openCreate">新增班次</el-button>
      </el-space>
    </div>

    <el-table :data="store.shifts" border>
      <el-table-column prop="name" label="值班名称" width="140" />
      <el-table-column prop="type" label="班次类型" width="120" />
      <el-table-column label="起止时间" width="160">
        <template #default="{ row }">
          {{ row.startTime }} - {{ row.endTime }}
        </template>
      </el-table-column>
      <el-table-column prop="handoverTime" label="交接班时间" width="120" />
      <el-table-column prop="leader" label="班次负责人" width="120" />
      <el-table-column label="值班人员" min-width="220">
        <template #default="{ row }">
          <el-tag v-for="u in row.members" :key="u" style="margin-right:6px" effect="plain">{{ u }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="启用" width="80">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" @change="v => toggle(row, v)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-space>
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="remove(row)">删除</el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <el-dialog v-model="visible" :title="form.id ? '编辑班次' : '新增班次'" width="640px">
    <el-form :model="form" label-width="110px">
      <el-form-item label="值班名称">
        <el-input v-model="form.name" placeholder="如：白班/夜班" />
      </el-form-item>
      <el-form-item label="班次类型">
        <el-select v-model="form.type" style="width:220px">
          <el-option label="白班" value="白班" />
          <el-option label="夜班" value="夜班" />
        </el-select>
      </el-form-item>
      <el-form-item label="起止时间">
        <el-space>
          <el-time-picker v-model="startTime" placeholder="开始时间" value-format="HH:mm" format="HH:mm" />
          <span>到</span>
          <el-time-picker v-model="endTime" placeholder="结束时间" value-format="HH:mm" format="HH:mm" />
        </el-space>
      </el-form-item>
      <el-form-item label="交接班时间">
        <el-time-picker v-model="handoverTime" placeholder="交接班时间" value-format="HH:mm" format="HH:mm" />
      </el-form-item>
      <el-form-item label="班次负责人">
        <el-select v-model="form.leader" filterable style="width:220px">
          <el-option v-for="u in store.users" :key="u.id" :label="u.name" :value="u.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="值班人员">
        <el-select v-model="form.members" multiple filterable style="width:100%" placeholder="选择值班人员">
          <el-option v-for="u in store.users" :key="u.id" :label="u.name" :value="u.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="值班职责">
        <el-input v-model="form.responsibilities" type="textarea" :rows="3" placeholder="填写值班职责说明" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-space>
        <el-button @click="visible=false">取消</el-button>
        <el-button type="primary" @click="save" :disabled="!canSave">保存</el-button>
      </el-space>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDutyStore } from '@/store'

const store = useDutyStore()
onMounted(() => {
  if (!store.users.length || !store.shifts.length) store.init()
})

const visible = ref(false)
const form = ref({
  id: '',
  name: '',
  type: '日班',
  startTime: '09:00',
  endTime: '18:00',
  handoverTime: '',
  leader: '',
  members: [],
  responsibilities: '',
  enabled: true
})

const startTime = ref('09:00')
const endTime = ref('18:00')
const handoverTime = ref('')

watch(visible, v => {
  if (v) {
    startTime.value = form.value.startTime || '09:00'
    endTime.value = form.value.endTime || '18:00'
    handoverTime.value = form.value.handoverTime || ''
  }
})

const canSave = computed(() => !!form.value.name && !!startTime.value && !!endTime.value)

const resetForm = () => {
  form.value = {
    id: '',
    name: '',
    type: '日班',
    startTime: '09:00',
    endTime: '18:00',
    handoverTime: '',
    leader: '',
    members: [],
    responsibilities: '',
    enabled: true
  }
}

const openCreate = () => {
  resetForm()
  visible.value = true
}

const openEdit = (row) => {
  form.value = {
    id: row.id,
    name: row.name,
    type: row.type,
    startTime: row.startTime,
    endTime: row.endTime,
    handoverTime: row.handoverTime,
    leader: row.leader,
    members: Array.isArray(row.members) ? row.members.slice() : [],
    responsibilities: row.responsibilities,
    enabled: row.enabled !== false
  }
  visible.value = true
}

const save = async () => {
  await store.saveShift({
    ...form.value,
    startTime: startTime.value,
    endTime: endTime.value,
    handoverTime: handoverTime.value
  })
  visible.value = false
  ElMessage.success('已保存')
}

const remove = async (row) => {
  const ok = await ElMessageBox.confirm(`确认删除班次「${row.name}」？相关排班也会被清理。`, '删除', { type: 'warning' }).then(() => true).catch(() => false)
  if (!ok) return
  await store.removeShift(row.id)
  ElMessage.success('已删除')
}

const toggle = async (row, v) => {
  await store.saveShift({ ...row, enabled: !!v })
}
</script>

<style scoped>
</style>


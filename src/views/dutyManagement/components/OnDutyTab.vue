<template>
  <el-card shadow="never" class="panel" style="margin-bottom:12px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div style="font-weight:700">值班在岗</div>
      <el-space wrap>
        <el-date-picker v-model="date" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" />
        <el-select v-model="user" filterable style="width:160px" placeholder="选择人员">
          <el-option v-for="u in store.users" :key="u.id" :label="u.name" :value="u.name" />
        </el-select>
        <el-button @click="reload">刷新</el-button>
      </el-space>
    </div>
  </el-card>

  <el-row :gutter="16">
    <el-col :span="16">
      <el-card shadow="never" class="panel">
        <div style="font-weight:700;margin-bottom:10px">当日值班记录</div>
        <el-table :data="todayList" border>
          <el-table-column prop="shiftName" label="班次" width="120" />
          <el-table-column prop="user" label="值班人员" width="110" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" effect="plain">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="签到 / 签退">
            <template #default="{ row }">
              <span>{{ row.checkInAt ? row.checkInAt.split(' ')[1] : '未签到' }}</span>
              <span style="margin:0 6px;color:#94a3b8">|</span>
              <span>{{ row.checkOutAt ? row.checkOutAt.split(' ')[1] : '未签退' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="交接班" width="160">
            <template #default="{ row }">
              <el-space>
                <el-tag :type="row.handoverDone ? 'success' : 'info'" effect="plain">{{ row.handoverDone ? '已交接' : '未交接' }}</el-tag>
                <el-tag v-if="needHandover(row)" type="warning" effect="plain">交接提醒</el-tag>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card shadow="never" class="panel" style="margin-bottom:12px">
        <div style="font-weight:700;margin-bottom:10px">交接班信息</div>
        <div v-if="handoverInfo" style="line-height:1.9">
          <div><span style="color:#64748b">班次：</span>{{ handoverInfo.shiftName }}</div>
          <div><span style="color:#64748b">交接时间：</span>{{ handoverInfo.handoverTime || '-' }}</div>
          <div><span style="color:#64748b">负责人：</span>{{ handoverInfo.leader || '-' }}</div>
          <div><span style="color:#64748b">职责：</span>{{ handoverInfo.responsibilities || '-' }}</div>
        </div>
        <div v-else style="color:#64748b">未选择记录</div>
      </el-card>

      <el-card shadow="never" class="panel">
        <div style="font-weight:700;margin-bottom:10px">当日全量排班</div>
        <el-table :data="todayAll" border size="small">
          <el-table-column prop="shiftName" label="班次" width="100" />
          <el-table-column prop="user" label="人员" width="90" />
          <el-table-column label="来源" width="70">
            <template #default="{ row }">
              <el-tag size="small" effect="plain">{{ row.source === 'manual' ? '手工' : '自动' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag size="small" :type="statusType(row.status)" effect="plain">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useDutyStore, useUserStore } from '@/store'

const store = useDutyStore()
const userStore = useUserStore()

const date = ref(formatDate(new Date()))
const user = ref('')
const selectedId = ref('')

watch(() => store.users, (u) => {
  if (!user.value && u.length) {
    const hit = u.find(i => i.name === userStore.name)
    user.value = hit?.name || u[0].name
  }
}, { deep: true, immediate: true })

watch(date, async (d) => {
  await ensureMonthLoaded(d)
})

onMounted(async () => {
  await store.init(monthOf(date.value))
  await ensureMonthLoaded(date.value)
})

const todayAll = computed(() => store.schedules.filter(i => i.date === date.value))
const todayList = computed(() => todayAll.value.filter(i => i.user === user.value))

watch(todayList, (list) => {
  if (!selectedId.value && list.length) selectedId.value = list[0].id
}, { deep: true, immediate: true })

const handoverInfo = computed(() => {
  const item = store.schedules.find(i => i.id === selectedId.value) || todayList.value[0]
  if (!item) return null
  const shift = store.shifts.find(s => s.id === item.shiftId)
  return shift ? { ...shift, shiftName: shift.name } : { shiftName: item.shiftName }
})

const reload = async () => {
  await Promise.all([store.loadUsers(), store.loadShifts(), store.loadSchedules(monthOf(date.value))])
}

const signIn = async (row) => {
  selectedId.value = row.id
  const r = await store.checkIn(row.id)
  if (r?.ok) ElMessage.success('已签到')
  else ElMessage.warning(r?.message || '签到失败')
}

const signOut = async (row) => {
  selectedId.value = row.id
  const r = await store.checkOut(row.id)
  if (r?.ok) ElMessage.success('已签退')
  else ElMessage.warning(r?.message || '签退失败')
}

const handover = async (row) => {
  selectedId.value = row.id
  const r = await store.handover(row.id, true)
  if (r?.ok) ElMessage.success('已交接')
  else ElMessage.warning(r?.message || '交接失败')
}

const needHandover = (row) => {
  if (!row || row.handoverDone) return false
  const shift = store.shifts.find(s => s.id === row.shiftId)
  if (!shift?.handoverTime) return false
  const now = new Date()
  const t = `${row.date} ${shift.handoverTime}:00`
  return now.getTime() >= new Date(t).getTime()
}

async function ensureMonthLoaded(d) {
  const m = monthOf(d)
  if (store.currentMonth !== m) await store.loadSchedules(m)
}

function statusType(status) {
  if (status === '值班中') return 'warning'
  if (status === '已结束') return 'success'
  return 'info'
}

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function monthOf(dateStr) {
  return String(dateStr || '').slice(0, 7)
}
</script>

<style scoped>
</style>


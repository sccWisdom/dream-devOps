<template>
  <el-card shadow="never" class="panel" style="margin-bottom:12px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div style="font-weight:700"></div>
      <el-space wrap>
        <el-date-picker v-model="month" type="month" value-format="YYYY-MM" format="YYYY-MM" />
        <el-button type="primary" @click="openAdd()">新增值班</el-button>
      </el-space>
    </div>
  </el-card>

  <el-row :gutter="16">
    <el-col :span="16">
      <el-card shadow="never" class="panel">
        <el-calendar v-model="calendarDate">
          <template #date-cell="{ data }">
            <div class="calendar-cell" @click="openAdd(data.day)">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
                <span :class="['day-number', { 'today-number': isToday(data.day) }]">{{ data.day.split('-').slice(-1)[0] }}</span>
                <el-tag v-if="daySummary[data.day]?.entries?.length" size="small" effect="plain">{{ daySummary[data.day].entries.length }}人次</el-tag>
              </div>
              <div v-if="daySummary[data.day]?.dutyUsers?.length" class="summary-text">值班：{{ formatDutyUsers(daySummary[data.day].dutyUsers) }}</div>
              <div class="summary-tags">
                <el-tag v-if="daySummary[data.day]?.leaveCount" size="small" type="warning" effect="plain">请假 {{ daySummary[data.day].leaveCount }}</el-tag>
                <el-tag v-if="daySummary[data.day]?.swapCount" size="small" type="info" effect="plain">调班 {{ daySummary[data.day].swapCount }}</el-tag>
              </div>
            </div>
          </template>
        </el-calendar>
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card shadow="never" class="panel" style="margin-bottom:12px">
        <div style="font-weight:700;margin-bottom:10px">本月概览</div>
        <div class="stat-grid" style="grid-template-columns:repeat(2,1fr)">
          <div class="stat-card">
            <div class="label">排班天数</div>
            <div class="value">{{ monthSummary.dutyCount }}</div>
          </div>
          <div class="stat-card">
            <div class="label">手工调整</div>
            <div class="value">{{ monthSummary.manualCount }}</div>
          </div>
          <div class="stat-card">
            <div class="label">请假冲突</div>
            <div class="value">{{ monthSummary.conflictCount }}</div>
          </div>
          <div class="stat-card">
            <div class="label">覆盖人员</div>
            <div class="value">{{ monthSummary.userCount }}</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="panel">
        <div style="font-weight:700;margin-bottom:10px">请假 / 调班</div>
        <el-table :data="recentLeaves" border size="small">
          <el-table-column prop="type" label="类型" width="70" />
          <el-table-column prop="user" label="人员" width="80" />
          <el-table-column label="时间" min-width="140">
            <template #default="{ row }">{{ row.fromDate }} ~ {{ row.toDate }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80" />
        </el-table>
      </el-card>
    </el-col>
  </el-row>

  <el-dialog v-model="createVisible" title="新增值班" width="560px">
    <el-form :model="createForm" label-width="96px">
      <el-form-item label="值班表名称">
        <el-input v-model="createForm.tableName" maxlength="40" show-word-limit placeholder="请输入值班表名称" />
      </el-form-item>
      <el-form-item label="选择班次">
        <el-select v-model="createForm.shiftId" style="width:100%" placeholder="请选择班次">
          <el-option v-for="s in store.shifts" :key="s.id" :label="s.name" :value="s.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="值班人员">
        <el-select v-model="createForm.users" multiple filterable style="width:100%" placeholder="请选择值班人员">
          <el-option v-for="u in store.users" :key="u.id" :label="u.name" :value="u.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="值班日期">
        <el-date-picker
          v-model="createForm.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width:100%"
        />
      </el-form-item>
      <el-form-item label="重复规则">
        <el-select v-model="createForm.repeatRule" style="width:100%">
          <el-option label="不重复" value="none" />
          <el-option label="每周" value="weekly" />
          <el-option label="每月" value="monthly" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-space>
        <el-button @click="createVisible=false">取消</el-button>
        <el-button type="primary" @click="submitCreate" :disabled="!canSubmitCreate">提交</el-button>
      </el-space>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useDutyStore } from '@/store'

const store = useDutyStore()
const now = new Date()

const month = ref(formatMonth(now))
const calendarDate = ref(new Date())
const today = formatDate(now)

watch(month, async (m) => {
  calendarDate.value = new Date(`${m}-01`)
  await store.loadSchedules(m)
})

onMounted(async () => {
  await store.init(month.value)
})

const approvedLeaves = computed(() => store.leaveRequests.filter(i => i.status === '已通过'))

const isLeaveConflict = (schedule) => {
  if (!schedule?.user || !schedule?.date) return false
  const d = schedule.date.replaceAll('-', '')
  return approvedLeaves.value.some(l => l.user === schedule.user
    && l.fromDate
    && l.toDate
    && d >= l.fromDate.replaceAll('-', '')
    && d <= l.toDate.replaceAll('-', ''))
}

const daySummary = computed(() => {
  const map = {}
  const ensureDay = (day) => {
    if (!map[day]) {
      map[day] = {
        dutyUsers: [],
        entries: [],
        leaveCount: 0,
        swapCount: 0
      }
    }
    return map[day]
  }

  store.schedules.forEach((item) => {
    if (!item?.date) return
    const current = ensureDay(item.date)
    current.entries.push(item)
    if (item.user && !current.dutyUsers.includes(item.user)) current.dutyUsers.push(item.user)
  })

  const requests = store.leaveRequests.filter(i => i.status !== '已驳回')
  requests.forEach((item) => {
    for (const day of enumerateDates(item.fromDate, item.toDate)) {
      if (!day.startsWith(`${month.value}-`)) continue
      const current = ensureDay(day)
      if (item.type === '调班') current.swapCount += 1
      else current.leaveCount += 1
    }
  })

  return map
})

const monthSummary = computed(() => {
  const list = store.schedules
  const daySet = new Set(list.map(i => i.date).filter(Boolean))
  const manualCount = list.filter(i => i.source === 'manual').length
  const conflictCount = list.filter(i => isLeaveConflict(i)).length
  const userCount = new Set(list.map(i => i.user).filter(Boolean)).size
  return {
    dutyCount: daySet.size,
    manualCount,
    conflictCount,
    userCount
  }
})

const recentLeaves = computed(() => store.leaveRequests.slice(0, 8))

const createVisible = ref(false)
const createForm = ref(createEmptyForm(today))

const canSubmitCreate = computed(() => {
  const range = createForm.value.dateRange
  const hasRange = Array.isArray(range) && range.length === 2 && range[0] && range[1]
  return !!createForm.value.tableName
    && !!createForm.value.shiftId
    && hasRange
    && Array.isArray(createForm.value.users)
    && createForm.value.users.length > 0
})

const openAdd = (day = today) => {
  const defaultShiftId = createForm.value.shiftId || store.shifts[0]?.id || ''
  createForm.value = createEmptyForm(day, defaultShiftId)
  createVisible.value = true
}

const submitCreate = async () => {
  if (!canSubmitCreate.value) return
  const shift = store.shifts.find(i => i.id === createForm.value.shiftId)
  if (!shift) {
    ElMessage.warning('请选择有效班次')
    return
  }

  const dates = expandDates(createForm.value.dateRange, createForm.value.repeatRule)
  const payloads = []

  dates.forEach((date) => {
    createForm.value.users.forEach((user) => {
      const exists = store.schedules.find(i => i.date === date && i.shiftId === shift.id && i.user === user)
      payloads.push({
        id: exists?.id,
        date,
        shiftId: shift.id,
        shiftName: shift.name,
        user,
        source: 'manual',
        status: exists?.status || '计划中',
        note: createForm.value.tableName,
        tableName: createForm.value.tableName,
        repeatRule: createForm.value.repeatRule
      })
    })
  })

  await store.saveSchedules(payloads)
  createVisible.value = false
  ElMessage.success(`已新增 ${payloads.length} 条值班安排`)
}

function expandDates(dateRange, repeatRule) {
  if (!Array.isArray(dateRange) || dateRange.length !== 2) return []
  const [fromDate, toDate] = dateRange
  const baseDates = enumerateDates(fromDate, toDate)
  if (!baseDates.length) return []

  const result = new Set(baseDates)
  if (repeatRule === 'none') return Array.from(result)

  baseDates.forEach((dateText) => {
    const base = new Date(`${dateText}T00:00:00`)
    if (Number.isNaN(base.getTime())) return

    if (repeatRule === 'weekly') {
      const end = new Date(base.getFullYear(), base.getMonth() + 1, 0)
      const cursor = new Date(base)
      while (true) {
        cursor.setDate(cursor.getDate() + 7)
        if (cursor > end) break
        result.add(formatDate(cursor))
      }
    }

    if (repeatRule === 'monthly') {
      const day = base.getDate()
      for (let i = 1; i <= 2; i += 1) {
        const next = new Date(base.getFullYear(), base.getMonth() + i, day)
        if (next.getDate() !== day) continue
        result.add(formatDate(next))
      }
    }
  })

  return Array.from(result).sort()
}

function enumerateDates(fromDate, toDate) {
  if (!fromDate || !toDate) return []
  const from = new Date(`${fromDate}T00:00:00`)
  const to = new Date(`${toDate}T00:00:00`)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) return []

  const list = []
  const cursor = new Date(from)
  while (cursor <= to) {
    list.push(formatDate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return list
}

function formatDutyUsers(users) {
  if (!Array.isArray(users) || !users.length) return '-'
  if (users.length <= 2) return users.join('、')
  return `${users.slice(0, 2).join('、')} 等${users.length}人`
}

function isToday(day) {
  return day === today
}

function createEmptyForm(day, shiftId = '') {
  return {
    tableName: '',
    shiftId,
    users: [],
    dateRange: [day, day],
    repeatRule: 'none'
  }
}

function formatMonth(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
</script>

<style scoped>
.calendar-cell {
  min-height: 72px;
  cursor: pointer;
}

.day-number {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
}

.today-number {
  background: #2563eb;
  color: #fff;
  font-weight: 700;
}

.summary-text {
  margin-top: 4px;
  font-size: 12px;
  color: #1e293b;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-tags {
  margin-top: 4px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
</style>

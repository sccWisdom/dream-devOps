<template>
  <el-card shadow="never" class="panel" style="margin-bottom:12px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div style="font-weight:700">我的值班</div>
      <el-space wrap>
        <el-date-picker v-model="month" type="month" value-format="YYYY-MM" format="YYYY-MM" />
        <el-select v-model="viewer" filterable style="width:160px" placeholder="选择人员">
          <el-option v-for="u in store.users" :key="u.id" :label="u.name" :value="u.name" />
        </el-select>
        <el-radio-group v-model="viewMode">
          <el-radio-button label="日历">日历</el-radio-button>
          <el-radio-button label="列表">列表</el-radio-button>
        </el-radio-group>
        <el-button type="primary" :disabled="!canCheckInToday" @click="checkInToday">值班签到</el-button>
        <el-button @click="openLeave">请假</el-button>
        <el-button @click="openSwap">调班</el-button>
      </el-space>
    </div>
  </el-card>

  <el-row :gutter="16">
    <el-col :span="16">
      <el-card v-if="viewMode==='日历'" shadow="never" class="panel">
        <el-calendar v-model="calendarDate">
          <template #date-cell="{ data }">
            <div class="calendar-cell">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
                <span :class="['day-number', { 'today-number': isToday(data.day) }]">{{ data.day.split('-').slice(-1)[0] }}</span>
                <el-tag v-if="hasMine(data.day)" size="small" effect="plain">{{ viewer }}</el-tag>
              </div>
              <div v-for="i in visibleShifts(data.day)" :key="i.id" style="margin-top:4px;font-size:12px">
                <el-tag size="small" :type="statusType(i.status)" effect="plain">{{ i.shiftName || '班次' }}</el-tag>
              </div>
              <div v-if="hiddenShiftCount(data.day) > 0" class="more-text">+{{ hiddenShiftCount(data.day) }} 条</div>
              <div v-if="showTodayCheckMark(data.day)" class="check-mark">✓ 已签到</div>
            </div>
          </template>
        </el-calendar>
      </el-card>

      <el-card v-else shadow="never" class="panel">
        <el-table :data="mineList" border>
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="shiftName" label="班次" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" effect="plain">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="签到/签退" width="190">
            <template #default="{ row }">
              <span>{{ row.checkInAt ? '已签到' : '未签到' }}</span>
              <span style="margin:0 6px;color:#94a3b8">|</span>
              <span>{{ row.checkOutAt ? '已签退' : '未签退' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="交接班" width="100">
            <template #default="{ row }">
              <el-tag :type="row.handoverDone ? 'success' : 'info'" effect="plain">{{ row.handoverDone ? '已交接' : '未交接' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="值班日志" width="100">
            <template #default="{ row }">
              <el-tag :type="row.logSubmitted ? 'success' : 'info'" effect="plain">{{ row.logSubmitted ? '已提交' : '未提交' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="260">
            <template #default="{ row }">
              <el-space>
                <el-button size="small" type="primary" plain @click="signIn(row)" :disabled="!!row.checkInAt">签到</el-button>
                <el-button size="small" type="warning" plain @click="signOut(row)" :disabled="!!row.checkOutAt">签退</el-button>
                <el-button size="small" type="success" plain @click="handover(row)" :disabled="row.handoverDone">交接</el-button>
                <el-button size="small" @click="toggleLog(row)">{{ row.logSubmitted ? '撤回日志' : '提交日志' }}</el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card shadow="never" class="panel" style="margin-bottom:12px">
        <div style="font-weight:700;margin-bottom:10px">我的请假/调班</div>
        <el-table :data="myRequests" border size="small">
          <el-table-column prop="type" label="类型" width="70" />
          <el-table-column label="时间" min-width="150">
            <template #default="{ row }">{{ row.fromDate }} ~ {{ row.toDate }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80" />
        </el-table>
      </el-card>

      <el-card v-if="isManager" shadow="never" class="panel">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="font-weight:700">审批待办</div>
          <el-tag effect="plain">{{ pendingRequests.length }}</el-tag>
        </div>
        <el-table :data="pendingRequests" border size="small">
          <el-table-column prop="user" label="申请人" width="80" />
          <el-table-column prop="type" label="类型" width="70" />
          <el-table-column label="时间" min-width="150">
            <template #default="{ row }">{{ row.fromDate }} ~ {{ row.toDate }}</template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-space>
                <el-button size="small" type="success" plain @click="approve(row)">通过</el-button>
                <el-button size="small" type="danger" plain @click="reject(row)">驳回</el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
  </el-row>

  <el-dialog v-model="reqVisible" :title="reqForm.type==='调班' ? '调班申请' : '请假申请'" width="520px">
    <el-form :model="reqForm" label-width="90px">
      <el-form-item label="申请人">
        <el-input v-model="reqForm.user" disabled />
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker v-model="range" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item v-if="reqForm.type==='调班'" label="调班对象">
        <el-select v-model="reqForm.targetUser" filterable style="width:220px" placeholder="选择调班对象">
          <el-option v-for="u in otherUsers" :key="u.id" :label="u.name" :value="u.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="原因">
        <el-input v-model="reqForm.reason" type="textarea" :rows="3" placeholder="填写原因" />
      </el-form-item>
      <el-form-item label="抄送">
        <el-select v-model="reqForm.cc" multiple filterable style="width:100%" placeholder="可选">
          <el-option v-for="u in store.users" :key="u.id" :label="u.name" :value="u.name" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-space>
        <el-button @click="reqVisible=false">取消</el-button>
        <el-button type="primary" @click="submitReq" :disabled="!canSubmit">提交</el-button>
      </el-space>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDutyStore, useUserStore } from '@/store'

const store = useDutyStore()
const userStore = useUserStore()
const now = new Date()

const month = ref(formatMonth(now))
const viewer = ref('')
const viewMode = ref('日历')
const calendarDate = ref(new Date())
const today = formatDate(now)

watch(month, async (m) => {
  calendarDate.value = new Date(`${m}-01`)
  await store.loadSchedules(m)
})

watch(() => store.users, (u) => {
  if (!viewer.value && u.length) {
    const hit = u.find(i => i.name === userStore.name)
    viewer.value = hit?.name || u[0].name
  }
}, { deep: true, immediate: true })

onMounted(async () => {
  await store.init(month.value)
  if (!viewer.value && store.users.length) viewer.value = store.users[0].name
})

const mineList = computed(() => store.schedules.filter(i => i.user === viewer.value).slice().sort((a, b) => a.date.localeCompare(b.date)))
const mineByDay = computed(() => {
  const map = {}
  mineList.value.forEach(i => {
    map[i.date] = map[i.date] || []
    map[i.date].push(i)
  })
  return map
})

const todaySchedules = computed(() => mineByDay.value[today] || [])
const canCheckInToday = computed(() => todaySchedules.value.length > 0)

const hasMine = (day) => !!(mineByDay.value[day] && mineByDay.value[day].length)

const visibleShifts = (day) => (mineByDay.value[day] || []).slice(0, 2)
const hiddenShiftCount = (day) => Math.max((mineByDay.value[day] || []).length - 2, 0)

const myRequests = computed(() => store.leaveRequests.filter(i => i.user === viewer.value).slice(0, 10))
const isManager = computed(() => String(userStore.role || '').includes('管理员') || String(userStore.role || '').includes('负责人'))
const pendingRequests = computed(() => store.leaveRequests.filter(i => i.status === '待审批').slice(0, 10))

const reqVisible = ref(false)
const range = ref([])
const reqForm = ref({
  id: '',
  user: '',
  type: '请假',
  fromDate: '',
  toDate: '',
  reason: '',
  targetUser: '',
  cc: []
})

const otherUsers = computed(() => store.users.filter(i => i.name !== viewer.value))
const canSubmit = computed(() => {
  const okRange = Array.isArray(range.value) && range.value.length === 2 && range.value[0] && range.value[1]
  if (!okRange) return false
  if (reqForm.value.type === '调班' && !reqForm.value.targetUser) return false
  return !!reqForm.value.reason
})

const openLeave = () => {
  range.value = []
  reqForm.value = { id: '', user: viewer.value, type: '请假', fromDate: '', toDate: '', reason: '', targetUser: '', cc: [] }
  reqVisible.value = true
}

const openSwap = () => {
  range.value = []
  reqForm.value = { id: '', user: viewer.value, type: '调班', fromDate: '', toDate: '', reason: '', targetUser: '', cc: [] }
  reqVisible.value = true
}

const submitReq = async () => {
  const [fromDate, toDate] = range.value
  await store.submitLeaveRequest({ ...reqForm.value, fromDate, toDate, status: '待审批' })
  reqVisible.value = false
  ElMessage.success('已提交审批')
}

const approve = async (row) => {
  const remark = await ElMessageBox.prompt('填写审批意见（可选）', '通过', { confirmButtonText: '确定', cancelButtonText: '取消', inputValue: '' }).then(r => r.value).catch(() => null)
  if (remark === null) return
  await store.reviewLeaveRequest({ id: row.id, status: '已通过', approver: userStore.name, remark })
  ElMessage.success('已通过')
}

const reject = async (row) => {
  const remark = await ElMessageBox.prompt('填写驳回原因', '驳回', { confirmButtonText: '确定', cancelButtonText: '取消', inputValue: '' }).then(r => r.value).catch(() => null)
  if (remark === null) return
  await store.reviewLeaveRequest({ id: row.id, status: '已驳回', approver: userStore.name, remark })
  ElMessage.success('已驳回')
}

const checkInToday = async () => {
  if (!todaySchedules.value.length) return
  const pending = todaySchedules.value.filter(i => !i.checkInAt)
  if (!pending.length) {
    ElMessage.success('今天已签到')
    return
  }

  let success = 0
  let failed = 0

  for (const item of pending) {
    const r = await store.checkIn(item.id)
    if (r?.ok) success += 1
    else failed += 1
  }

  if (success && !failed) ElMessage.success('签到成功')
  else if (success && failed) ElMessage.warning(`签到完成，成功 ${success} 条，失败 ${failed} 条`)
  else ElMessage.warning('签到失败')
}

const signIn = async (row) => {
  const r = await store.checkIn(row.id)
  if (r?.ok) ElMessage.success('已签到')
  else ElMessage.warning(r?.message || '签到失败')
}

const signOut = async (row) => {
  const r = await store.checkOut(row.id)
  if (r?.ok) ElMessage.success('已签退')
  else ElMessage.warning(r?.message || '签退失败')
}

const handover = async (row) => {
  const r = await store.handover(row.id, true)
  if (r?.ok) ElMessage.success('已交接')
  else ElMessage.warning(r?.message || '交接失败')
}

const toggleLog = async (row) => {
  const r = await store.dutyLog(row.id, !row.logSubmitted)
  if (r?.ok) ElMessage.success(row.logSubmitted ? '已撤回' : '已提交')
  else ElMessage.warning(r?.message || '操作失败')
}

function showTodayCheckMark(day) {
  return day === today && todaySchedules.value.some(i => !!i.checkInAt)
}

function isToday(day) {
  return day === today
}

function statusType(status) {
  if (status === '值班中') return 'warning'
  if (status === '已结束') return 'success'
  return 'info'
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
  min-height: 64px;
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

.more-text {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.check-mark {
  margin-top: 4px;
  font-size: 12px;
  color: #16a34a;
  font-weight: 600;
}
</style>

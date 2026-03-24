<template>
  <el-card shadow="never" class="panel" style="margin-bottom:12px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div style="font-weight:700">值班通知</div>
      <el-space wrap>
        <el-button type="primary" @click="mockAlarm">模拟告警</el-button>
        <el-button type="warning" @click="mockTicket">模拟工单</el-button>
        <el-button type="danger" @click="mockEmergency">模拟应急</el-button>
        <el-button @click="reload">刷新</el-button>
      </el-space>
    </div>
  </el-card>

  <el-row :gutter="16">
    <el-col :span="16">
      <el-card shadow="never" class="panel">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="font-weight:700">通知记录</div>
          <el-space>
            <el-select v-model="filterType" style="width:140px">
              <el-option label="全部" value="" />
              <el-option label="告警" value="告警" />
              <el-option label="工单" value="工单" />
              <el-option label="应急" value="应急" />
            </el-select>
            <el-switch v-model="onlyUnread" inline-prompt :active-text="'未读'" :inactive-text="'全部'" />
          </el-space>
        </div>
        <el-table :data="filtered" border @row-click="open" style="cursor:pointer">
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.read ? 'info' : 'success'" effect="plain">{{ row.read ? '已读' : '未读' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="80" />
          <el-table-column prop="level" label="级别" width="70" />
          <el-table-column prop="title" label="标题" min-width="220" />
          <el-table-column label="渠道" width="160">
            <template #default="{ row }">
              <el-tag v-for="c in row.channels" :key="c" size="small" effect="plain" style="margin-right:6px">{{ c }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card shadow="never" class="panel" style="margin-bottom:12px">
        <div style="font-weight:700;margin-bottom:10px">触达配置</div>
        <el-form :model="cfg" label-width="90px">
          <el-form-item label="站内通知">
            <el-switch v-model="cfg.inapp" />
          </el-form-item>
          <el-form-item label="短信">
            <el-switch v-model="cfg.sms" />
          </el-form-item>
          <el-form-item label="企业微信">
            <el-switch v-model="cfg.wecom" />
          </el-form-item>
          <el-form-item label="钉钉">
            <el-switch v-model="cfg.dingtalk" />
          </el-form-item>
        </el-form>
        <div style="color:#64748b;font-size:12px">当前为前端模拟配置，仅用于展示多渠道触达能力。</div>
      </el-card>

      <el-card shadow="never" class="panel">
        <div style="font-weight:700;margin-bottom:10px">值班负责人</div>
        <div v-if="leaderInfo" style="line-height:1.9">
          <div><span style="color:#64748b">负责人：</span>{{ leaderInfo.name }}</div>
          <div><span style="color:#64748b">电话：</span>{{ leaderInfo.phone || '-' }}</div>
          <div><span style="color:#64748b">班次：</span>{{ leaderInfo.shiftName || '-' }}</div>
          <el-button style="margin-top:10px" type="primary" plain @click="callLeader">一键呼叫</el-button>
        </div>
        <div v-else style="color:#64748b">暂无当日值班负责人</div>
      </el-card>
    </el-col>
  </el-row>

  <el-dialog v-model="detailVisible" title="通知详情" width="560px">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="类型">{{ current?.type }}</el-descriptions-item>
      <el-descriptions-item label="级别">{{ current?.level }}</el-descriptions-item>
      <el-descriptions-item label="标题">{{ current?.title }}</el-descriptions-item>
      <el-descriptions-item label="内容">{{ current?.content }}</el-descriptions-item>
      <el-descriptions-item label="渠道">
        <el-tag v-for="c in current?.channels || []" :key="c" effect="plain" style="margin-right:6px">{{ c }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="触达对象">
        <el-tag v-for="t in current?.targets || []" :key="t" effect="plain" style="margin-right:6px">{{ t }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-space>
        <el-button @click="detailVisible=false">关闭</el-button>
        <el-button type="primary" @click="markRead" :disabled="!current || current.read">标记已读</el-button>
      </el-space>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useDutyStore } from '@/store'

const store = useDutyStore()

const cfg = ref({
  inapp: true,
  sms: true,
  wecom: true,
  dingtalk: false
})

const filterType = ref('')
const onlyUnread = ref(false)

onMounted(async () => {
  await store.init(monthOfToday())
})

const filtered = computed(() => {
  let list = store.notifications.slice()
  if (filterType.value) list = list.filter(i => i.type === filterType.value)
  if (onlyUnread.value) list = list.filter(i => !i.read)
  return list
})

const detailVisible = ref(false)
const current = ref(null)

const open = async (row) => {
  current.value = row
  detailVisible.value = true
  if (!row.read) await store.readNotification(row.id)
}

const markRead = async () => {
  if (!current.value) return
  await store.readNotification(current.value.id)
  current.value = store.notifications.find(i => i.id === current.value.id) || current.value
  ElMessage.success('已标记')
}

const today = () => {
  const t = new Date()
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const d = String(t.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const monthOfToday = () => today().slice(0, 7)

const getTodayDuties = async () => {
  const m = monthOfToday()
  if (store.currentMonth !== m) await store.loadSchedules(m)
  return store.schedules.filter(i => i.date === today())
}

const enabledChannels = () => {
  const a = []
  if (cfg.value.inapp) a.push('站内')
  if (cfg.value.sms) a.push('短信')
  if (cfg.value.wecom) a.push('企业微信')
  if (cfg.value.dingtalk) a.push('钉钉')
  return a.length ? a : ['站内']
}

const pushToToday = async ({ type, level, title, content }) => {
  const duties = await getTodayDuties()
  const targets = duties.map(i => i.user).filter(Boolean)
  await store.sendNotification({
    type,
    level,
    title,
    content,
    channels: enabledChannels(),
    targets
  })
}

const mockAlarm = async () => {
  await pushToToday({
    type: '告警',
    level: 'P1',
    title: '核心接口错误率升高',
    content: '错误率超过阈值，建议立即检查网关与应用实例状态。'
  })
  ElMessage.success('已触发告警通知')
}

const mockTicket = async () => {
  await pushToToday({
    type: '工单',
    level: 'P2',
    title: '数据库巡检工单待处理',
    content: '请在规定时间内完成巡检并回填结果。'
  })
  ElMessage.success('已触发工单通知')
}

const mockEmergency = async () => {
  await pushToToday({
    type: '应急',
    level: 'P1',
    title: '重大故障应急联动',
    content: '触发应急预案，需立即通知值班负责人并组织会商。'
  })
  ElMessage.success('已触发应急通知')
}

const reload = async () => {
  await store.loadNotifications()
}

const leaderInfo = computed(() => {
  const d = today()
  const duties = store.schedules.filter(i => i.date === d)
  const any = duties[0]
  if (!any) return null
  const shift = store.shifts.find(s => s.id === any.shiftId)
  const name = shift?.leader || ''
  const u = store.users.find(i => i.name === name)
  return name ? { name, phone: u?.phone || '', shiftName: shift?.name || any.shiftName } : null
})

const callLeader = () => {
  if (!leaderInfo.value) return
  ElMessage.success(`已发起呼叫：${leaderInfo.value.name} ${leaderInfo.value.phone || ''}`.trim())
}
</script>

<style scoped>
</style>


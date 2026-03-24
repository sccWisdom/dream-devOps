<template>
  <div class="container" style="padding: 20px">
    <div class="page-title" style="margin-bottom: 20px; font-size: 20px; font-weight: bold">事件管理</div>

    <QueryBar>
      <template #default>
        <el-form inline>
          <el-form-item label="事件单号" style="margin-bottom: 0">
            <el-input
              v-model="query.eventNo"
              clearable
              placeholder="请输入事件单号"
              style="width: 220px"
            />
          </el-form-item>
          <el-form-item label="优先级" style="margin-bottom: 0">
            <el-select v-model="query.priority" placeholder="全部" style="width: 140px">
              <el-option label="全部" value="" />
              <el-option label="P1" value="P1" />
              <el-option label="P2" value="P2" />
              <el-option label="P3" value="P3" />
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <template #ops>
        <el-button @click="reset">重置</el-button>
        <el-button type="primary" @click="load">查询</el-button>
      </template>
    </QueryBar>

    <div style="overflow-x: auto; margin-top: 20px">
      <el-table
        ref="tableRef"
        :data="list"
        :row-class-name="tableRowClassName"
        border
        highlight-current-row
        row-key="id"
        style="width: 100%"
      >
        <el-table-column prop="id" label="事件单号" :width="180" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="priority" label="优先级" :width="80" />
        <el-table-column label="状态" :width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column prop="reporter" label="提单人" :width="100" />
        <el-table-column prop="submitTime" label="提交时间" :width="180" />
        <el-table-column prop="assignee" label="处理人" :width="100" />
        <el-table-column label="操作" :width="100">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="open(row)">处置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <TicketDetailDrawer v-model="visible" title="事件详情" :steps="eventSteps" :active="eventActive">
      <el-descriptions :column="2" border style="margin-bottom: 12px">
        <el-descriptions-item label="单号">{{ current?.id }}</el-descriptions-item>
        <el-descriptions-item label="优先级">{{ current?.priority }}</el-descriptions-item>
        <el-descriptions-item label="状态"><StatusTag :status="current?.status" /></el-descriptions-item>
        <el-descriptions-item label="处理人">{{ current?.assignee }}</el-descriptions-item>
      </el-descriptions>

      <el-card class="panel" style="margin-bottom: 12px">
        <div style="font-weight: 600; margin-bottom: 6px">内容</div>
        <div>{{ detail?.content }}</div>
      </el-card>

      <el-row :gutter="12" style="margin-bottom: 12px">
        <el-col :span="12">
          <el-card class="panel">
            <div style="font-weight: 600; margin-bottom: 6px">时间线</div>
            <el-timeline>
              <el-timeline-item v-for="(i, idx) in detail?.timeline" :key="idx" :timestamp="i.time">
                {{ i.text }}
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="panel" style="margin-bottom: 12px">
            <div style="font-weight: 600; margin-bottom: 6px">建议</div>
            <el-tag v-for="(s, idx) in detail?.suggestions" :key="idx" style="margin-right: 6px">{{ s }}</el-tag>
          </el-card>
          <el-card class="panel">
            <div style="font-weight: 600; margin-bottom: 6px">知识推荐</div>
            <div v-if="recommends.length === 0" style="color: var(--el-text-color-secondary)">暂无匹配知识</div>
            <el-link
              v-for="item in recommends"
              :key="item.id"
              type="primary"
              @click="openKb(item)"
              style="display: block; margin-bottom: 6px"
            >
              {{ item.title }}
            </el-link>
          </el-card>
        </el-col>
      </el-row>

      <template #actions>
        <el-space wrap>
          <el-button type="primary" @click="accept" :disabled="current?.status !== '待接单'">接单</el-button>
          <el-button @click="transfer">转派</el-button>
          <el-button type="warning" @click="upgrade">升级</el-button>
          <el-button type="info" @click="hang" :disabled="current?.status === '挂起'">挂起</el-button>
          <el-button type="success" @click="resume" :disabled="current?.status !== '挂起'">恢复</el-button>
          <el-button type="success" plain @click="resolve">解决</el-button>
          <el-button type="primary" plain @click="toKnowledge">转知识库</el-button>
        </el-space>
      </template>
    </TicketDetailDrawer>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import QueryBar from '@/components/Common/QueryBar.vue'
import StatusTag from '@/components/Common/StatusTag.vue'
import TicketDetailDrawer from '@/components/Common/TicketDetailDrawer.vue'
import { getIncidents, getIncidentDetail } from '@/mock-data/modules/event'
import { kbRecommend } from '@/mock-data/modules/kb'

const route = useRoute()
const router = useRouter()

const tableRef = ref()
const query = ref({ priority: '', eventNo: '' })
const list = ref([])
const locatedEventNo = ref('')

const visible = ref(false)
const current = ref(null)
const detail = ref(null)
const recommends = ref([])

async function open(row) {
  current.value = { ...row }
  detail.value = await getIncidentDetail(row.id)
  recommends.value = await kbRecommend(`${current.value.title}\n${detail.value?.content || ''}`, 6)
  visible.value = true
}

async function load() {
  list.value = await getIncidents(query.value)
}

function reset() {
  query.value = { priority: '', eventNo: '' }
  locatedEventNo.value = ''
  load()
}

function tableRowClassName({ row }) {
  return row.id === locatedEventNo.value ? 'event-row-highlight' : ''
}

async function locateByEventNo(eventNo, autoOpen = true) {
  if (!eventNo) return false

  if (!query.value.eventNo || query.value.eventNo !== eventNo) {
    query.value.eventNo = eventNo
    await load()
  }

  const target = list.value.find((item) => item.id === eventNo)
  if (!target) return false

  locatedEventNo.value = target.id
  await nextTick()
  tableRef.value?.setCurrentRow(target)

  const row = document.querySelector('.event-row-highlight')
  if (row) {
    row.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (autoOpen) {
    await open(target)
  }
  return true
}

async function tryLocateFromRoute(options = {}) {
  const { autoOpen = true, notify = false } = options
  const eventNo = String(route.query.eventNo || '').trim()
  if (!eventNo) return

  const found = await locateByEventNo(eventNo, autoOpen)
  if (notify) {
    if (found) ElMessage.success(`已定位到事件单：${eventNo}`)
    else ElMessage.warning(`未找到事件单：${eventNo}`)
  }
}

const accept = () => {
  current.value.status = '处理中'
  ElMessage.success('已接单')
}

const transfer = async () => {
  const val = await ElMessageBox.prompt('输入转派给用户', '转派', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then((r) => r.value).catch(() => null)
  if (val) {
    current.value.assignee = val
    ElMessage.success('已转派')
  }
}

const upgrade = () => {
  current.value.status = '已升级'
  ElMessage.success('已升级至二线')
}

const hang = () => {
  current.value.status = '挂起'
  ElMessage.success('已挂起')
}

const resume = () => {
  current.value.status = '处理中'
  ElMessage.success('已恢复')
}

const resolve = () => {
  current.value.status = '已解决'
  ElMessage.success('已解决')
}

const toKnowledge = () => {
  const title = `事件处置-${current.value?.title || ''}`
  const content = detail.value?.content || ''
  router.push({ path: '/kb', query: { create_from: 'event', title, content } })
}

const openKb = (item) => {
  router.push({ path: '/kb', query: { open_id: item.id } })
}

const eventSteps = [
  { title: '创建', desc: '' },
  { title: '派单/受理', desc: '' },
  { title: '处置', desc: '' },
  { title: '验证', desc: '' },
  { title: '办结', desc: '' }
]
const eventActive = 2

watch(
  () => route.query.eventNo,
  async (val, oldVal) => {
    if (val === oldVal) return
    await tryLocateFromRoute({ autoOpen: true, notify: true })
  }
)

onMounted(async () => {
  await load()
  await tryLocateFromRoute({ autoOpen: true, notify: false })
})
</script>

<style scoped>
:deep(.event-row-highlight > td) {
  background: rgba(37, 99, 235, 0.12) !important;
}
</style>
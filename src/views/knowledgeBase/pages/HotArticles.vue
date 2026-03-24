<template>
  <div class="container">
    <div class="page-title">热门知识</div>

    <el-card class="panel" style="margin-bottom: 12px">
      <el-space wrap>
        <el-button @click="loadHot">刷新</el-button>
        <el-tag type="info">热度=浏览+2*点赞-点踩</el-tag>
      </el-space>
    </el-card>
    <el-table :data="hotList" border @row-click="openDetail" style="cursor: pointer">
      <el-table-column prop="id" label="编号" width="110" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="category" label="分类" width="180" />
      <el-table-column prop="views" label="浏览" width="90" />
      <el-table-column label="点赞" width="90">
        <template #default="{ row }">{{ row.likeCount }}</template>
      </el-table-column>
      <el-table-column label="点踩" width="90">
        <template #default="{ row }">{{ row.dislikeCount }}</template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="detailVisible" title="知识详情" size="52%">
      <template v-if="detail">
        <StepFlow :active="detailStep" :steps="flowSteps" style="margin-bottom: 12px" />

        <el-space wrap style="margin-bottom: 10px">
          <el-tag type="info">{{ detail.view.id }}</el-tag>
          <el-tag :type="statusTagType(detail.view.status)">{{ statusLabel(detail.view.status) }}</el-tag>
          <el-tag :type="detail.view.visibility==='public'?'success':(detail.view.visibility==='sensitive'?'danger':'info')">
            {{ visibilityLabel(detail.view.visibility) }}
          </el-tag>
          <el-tag type="warning">v{{ detail.view.currentVersionNo }}</el-tag>
          <el-tag type="info">浏览 {{ detail.view.views }}</el-tag>
          <el-tag type="success">赞 {{ detail.view.likeCount }}</el-tag>
          <el-tag type="danger">踩 {{ detail.view.dislikeCount }}</el-tag>
        </el-space>

        <div style="font-size: 18px; font-weight: 700; margin-bottom: 10px">{{ detail.view.title }}</div>

        <el-space wrap style="margin-bottom: 12px">
          <el-button type="success" @click="like(detail.view)">点赞</el-button>
          <el-button type="danger" plain @click="dislike(detail.view)">点踩</el-button>
          <el-button v-if="canEditDetail && (detail.view.status==='draft' || detail.view.status==='rejected')" type="primary" @click="openEdit(detail.view)">编辑</el-button>
          <el-button v-if="canEditDetail && (detail.view.status==='draft' || detail.view.status==='rejected')" type="warning" @click="submitForApprove(detail.view)">提交审批</el-button>
          <el-dropdown v-if="canOperateDetail" @command="cmd => handleRowCommand(cmd, detail.view)">
            <el-button>流程操作</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="approve" :disabled="detail.view.status!=='pending'">审批通过</el-dropdown-item>
                <el-dropdown-item command="reject" :disabled="detail.view.status!=='pending'">驳回</el-dropdown-item>
                <el-dropdown-item command="publish" :disabled="detail.view.status!=='approved'">发布</el-dropdown-item>
                <el-dropdown-item command="unpublish" :disabled="detail.view.status!=='published'">下线</el-dropdown-item>
                <el-dropdown-item command="newVersion" :disabled="detail.view.status!=='published'">新版本</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button @click="openVersionDialog(detail.view)">版本历史</el-button>
        </el-space>

        <el-alert
          v-if="masked"
          type="warning"
          title="该知识为敏感内容，已启用加密访问"
          :closable="false"
          style="margin-bottom: 12px"
        >
          <template #default>
            <el-space wrap>
              <el-input v-model="unlockPassword" type="password" show-password placeholder="输入访问口令" style="width: 240px" />
              <el-button type="primary" @click="unlock">解锁</el-button>
            </el-space>
          </template>
        </el-alert>

        <el-card v-if="!masked" class="panel" style="margin-bottom: 12px">
          <div style="white-space: pre-wrap; line-height: 1.65">{{ detail.current.content }}</div>
        </el-card>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-card class="panel">
              <div style="font-weight: 600; margin-bottom: 8px">审批记录</div>
              <el-timeline>
                <el-timeline-item v-for="(r,idx) in detail.article.approveRecords" :key="idx" :timestamp="r.at">
                  {{ approveLabel(r.action) }} · {{ r.by }}<span v-if="r.comment"> · {{ r.comment }}</span>
                </el-timeline-item>
              </el-timeline>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="panel">
              <div style="font-weight: 600; margin-bottom: 8px">权限摘要</div>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="可见性">{{ visibilityLabel(detail.article.acl?.visibility) }}</el-descriptions-item>
                <el-descriptions-item label="加密访问">{{ detail.article.acl?.encrypt ? '启用' : '未启用' }}</el-descriptions-item>
                <el-descriptions-item label="查看范围">{{ aclSummary(detail.article.acl?.read) }}</el-descriptions-item>
                <el-descriptions-item label="编辑范围">{{ aclSummary(detail.article.acl?.edit) }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
        </el-row>
      </template>
    </el-drawer>

    <el-dialog v-model="versionVisible" title="版本历史" width="860px">
      <el-table v-if="versionList.length" :data="versionList" border>
        <el-table-column prop="versionNo" label="版本" width="90">
          <template #default="{ row }">v{{ row.versionNo }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="200" />
        <el-table-column prop="createdBy" label="作者" width="120" />
        <el-table-column prop="changeLog" label="变更说明" />
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-space>
              <el-button size="small" @click="compareVersion(row)">对比当前</el-button>
              <el-button size="small" type="warning" @click="rollback(row)" :disabled="!canEditDetail">回滚为新草稿</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="versionVisible=false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="compareVisible" title="版本对比（当前 vs 选择版本）" width="1000px">
      <el-row :gutter="12">
        <el-col :span="12">
          <el-card class="panel">
            <div style="font-weight: 600; margin-bottom: 6px">当前内容</div>
            <div style="white-space: pre-wrap; line-height: 1.6">{{ compareData.current || '' }}</div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="panel">
            <div style="font-weight: 600; margin-bottom: 6px">选择版本</div>
            <div style="white-space: pre-wrap; line-height: 1.6">{{ compareData.selected || '' }}</div>
          </el-card>
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="compareVisible=false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import StepFlow from '@/components/Common/StepFlow.vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { getUsers, getRoles } from '@/mock-data/modules/system'
import {
  kbApprove,
  kbDislike,
  kbGetArticle,
  kbIncrementView,
  kbLike,
  kbHotList,
  kbNewVersion,
  kbPublish,
  kbReject,
  kbRollback,
  kbSubmit,
  kbUnpublish
} from '@/mock-data/modules/kb'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const users = ref([])
const roles = ref([])
const depts = computed(() => Array.from(new Set(users.value.map(u => u.dept))).filter(Boolean))

const hotList = ref([])

const loadHot = async () => {
  hotList.value = await kbHotList(20)
}

const statusLabel = (s) => ({
  draft: '草稿',
  pending: '审批中',
  approved: '已通过',
  published: '已发布',
  rejected: '已驳回',
  offline: '已下线'
}[s] || s)

const statusTagType = (s) => ({
  draft: 'info',
  pending: 'warning',
  approved: 'primary',
  published: 'success',
  rejected: 'danger',
  offline: 'info'
}[s] || 'info')

const visibilityLabel = (v) => ({ public: '公开', internal: '内部', sensitive: '敏感' }[v] || v || '-')

const approveLabel = (a) => ({
  create: '创建',
  submit: '提交审批',
  approve: '审批通过',
  reject: '驳回',
  publish: '发布',
  unpublish: '下线',
  new_version: '创建新版本',
  rollback: '回滚',
  acl: '权限更新',
  import: '导入'
}[a] || a)

const currentUserInfo = computed(() => {
  const u = users.value.find(x => x.name === userStore.name)
  return {
    name: userStore.name,
    role: u?.role || userStore.role,
    dept: u?.dept || ''
  }
})

const matchScope = (scope, u) => {
  const s = scope || { depts: [], roles: [], users: [] }
  if (!s.depts?.length && !s.roles?.length && !s.users?.length) return true
  if (s.users?.includes(u.name)) return true
  if (u.role && s.roles?.includes(u.role)) return true
  if (u.dept && s.depts?.includes(u.dept)) return true
  return false
}

const canRead = (article) => {
  const u = currentUserInfo.value
  if (u.role === '管理员') return true
  const acl = article?.acl || article?.article?.acl || {}
  const v = acl.visibility || article?.visibility || 'internal'
  if (v === 'public') return true
  return matchScope(acl.read, u) || matchScope(acl.edit, u)
}

const canEdit = (article) => {
  const u = currentUserInfo.value
  if (u.role === '管理员') return true
  const acl = article?.acl || article?.article?.acl || {}
  return matchScope(acl.edit, u)
}

const canEditRow = () => currentUserInfo.value.role === '管理员'
const canOperateRow = () => currentUserInfo.value.role === '管理员'

const detailVisible = ref(false)
const detail = ref(null)
const unlockPassword = ref('')
const unlockedIds = ref(new Set())

const masked = computed(() => {
  const d = detail.value
  if (!d) return false
  const acl = d.article.acl || {}
  if (acl.visibility !== 'sensitive') return false
  if (!acl.encrypt) return false
  return !unlockedIds.value.has(d.view.id)
})

const canEditDetail = computed(() => (detail.value ? canEdit(detail.value) : false))
const canOperateDetail = computed(() => currentUserInfo.value.role === '管理员' || canEditDetail.value)

const flowSteps = [
  { title: '创建', desc: '' },
  { title: '提交', desc: '' },
  { title: '审批', desc: '' },
  { title: '发布', desc: '' }
]
const detailStep = computed(() => {
  const s = detail.value?.view?.status
  if (s === 'draft' || s === 'rejected') return 0
  if (s === 'pending') return 1
  if (s === 'approved') return 2
  if (s === 'published' || s === 'offline') return 3
  return 0
})

const openDetail = async (row) => {
  if (!row?.id) return
  const ok = await refreshDetail(row.id, true)
  if (ok) detailVisible.value = true
}

const openDetailFromQuery = async () => {
  const id = route.query.open_id
  if (!id) return
  const ok = await refreshDetail(String(id), true)
  if (ok) detailVisible.value = true
  await router.replace({ path: route.path, query: {} })
}

const refreshDetail = async (id, inc) => {
  const d = await kbGetArticle(id)
  if (!canRead(d)) {
    ElMessage.error('无权限查看该知识')
    return false
  }
  if (inc) await kbIncrementView(id)
  detail.value = await kbGetArticle(id)
  return true
}

const unlock = async () => {
  try {
    const d = detail.value
    const acl = d?.article?.acl || {}
    const pwd = String(unlockPassword.value || '').trim()
    if (!pwd) return
    const hash = await sha256Hex(`${acl.encryptSalt}:${pwd}`)
    if (hash !== acl.encryptHash) {
      ElMessage.error('口令不正确')
      return
    }
    unlockedIds.value.add(d.view.id)
    unlockPassword.value = ''
    ElMessage.success('已解锁')
  } catch {
    ElMessage.error('解锁失败')
  }
}

const sha256Hex = async (text) => {
  const enc = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const like = async (row) => {
  try {
    await kbLike(row.id)
    await loadHot()
    if (detailVisible.value && detail.value?.view?.id === row.id) await refreshDetail(row.id, false)
  } catch (e) {
    ElMessage.error(e?.message || '失败')
  }
}

const dislike = async (row) => {
  try {
    await kbDislike(row.id)
    await loadHot()
    if (detailVisible.value && detail.value?.view?.id === row.id) await refreshDetail(row.id, false)
  } catch (e) {
    ElMessage.error(e?.message || '失败')
  }
}

const versionVisible = ref(false)
const versionList = ref([])
const versionTargetId = ref('')
const compareVisible = ref(false)
const compareData = reactive({ current: '', selected: '' })

const openVersionDialog = async (row) => {
  versionTargetId.value = row.id
  const d = await kbGetArticle(row.id)
  versionList.value = (d.article.versions || []).slice().sort((a, b) => (b.versionNo || 0) - (a.versionNo || 0))
  versionVisible.value = true
}

const compareVersion = async (ver) => {
  const d = await kbGetArticle(versionTargetId.value)
  compareData.current = d.current.content || ''
  compareData.selected = ver.content || ''
  compareVisible.value = true
}

const rollback = async (ver) => {
  const comment = await ElMessageBox.prompt('可选：回滚说明', '回滚为新草稿', { confirmButtonText: '回滚', cancelButtonText: '取消' }).then(r => r.value).catch(() => null)
  if (comment === null) return
  try {
    await kbRollback(versionTargetId.value, ver.id, comment, { by: currentUserInfo.value.name })
    ElMessage.success('已生成回滚草稿')
    versionVisible.value = false
    await loadHot()
    if (detailVisible.value && detail.value?.view?.id === versionTargetId.value) await refreshDetail(versionTargetId.value, false)
  } catch (e) {
    ElMessage.error(e?.message || '回滚失败')
  }
}

const openEdit = async (row) => {
  router.push({ path: '/kb/articles', query: { open_id: row.id, edit: 'true' } })
}

const submitForApprove = async (row) => {
  const comment = await ElMessageBox.prompt('可选：填写提交说明', '提交审批', {
    confirmButtonText: '提交',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：补充排查步骤'
  }).then(r => r.value).catch(() => null)
  if (comment === null) return
  try {
    await kbSubmit(row.id, comment, { by: currentUserInfo.value.name })
    ElMessage.success('已提交审批')
    await loadHot()
    if (detailVisible.value && detail.value?.view?.id === row.id) await refreshDetail(row.id, false)
  } catch (e) {
    ElMessage.error(e?.message || '提交失败')
  }
}

const handleRowCommand = async (cmd, row) => {
  try {
    if (cmd === 'approve') {
      const comment = await ElMessageBox.prompt('可选：审批意见', '审批通过', { confirmButtonText: '通过', cancelButtonText: '取消' }).then(r => r.value).catch(() => null)
      if (comment === null) return
      await kbApprove(row.id, comment, { by: currentUserInfo.value.name })
      ElMessage.success('已审批通过')
    }
    if (cmd === 'reject') {
      const comment = await ElMessageBox.prompt('填写驳回原因', '驳回', { confirmButtonText: '驳回', cancelButtonText: '取消' }).then(r => r.value).catch(() => null)
      if (comment === null) return
      await kbReject(row.id, comment, { by: currentUserInfo.value.name })
      ElMessage.success('已驳回')
    }
    if (cmd === 'publish') {
      const comment = await ElMessageBox.prompt('可选：发布说明', '发布', { confirmButtonText: '发布', cancelButtonText: '取消' }).then(r => r.value).catch(() => null)
      if (comment === null) return
      await kbPublishSafe(row.id, comment)
      ElMessage.success('已发布')
    }
    if (cmd === 'unpublish') {
      const comment = await ElMessageBox.prompt('可选：下线原因', '下线', { confirmButtonText: '下线', cancelButtonText: '取消' }).then(r => r.value).catch(() => null)
      if (comment === null) return
      await kbUnpublish(row.id, comment, { by: currentUserInfo.value.name })
      ElMessage.success('已下线')
    }
    if (cmd === 'newVersion') {
      const comment = await ElMessageBox.prompt('填写版本变更说明', '新版本', { confirmButtonText: '创建', cancelButtonText: '取消', inputValue: '优化步骤' }).then(r => r.value).catch(() => null)
      if (comment === null) return
      await kbNewVersion(row.id, comment, { by: currentUserInfo.value.name })
      ElMessage.success('已创建新版本草稿')
    }
    await loadHot()
    if (detailVisible.value && detail.value?.view?.id === row.id) await refreshDetail(row.id, false)
  } catch (e) {
    ElMessage.error(e?.message || '操作失败')
  }
}

const kbPublishSafe = async (id, comment) => {
  const { article } = await kbGetArticle(id)
  if (article.acl?.visibility === 'sensitive' && article.acl?.encrypt && !(article.acl?.encryptHash && article.acl?.encryptSalt)) {
    await ElMessageBox.confirm('敏感知识已启用加密访问但未设置口令哈希，建议先编辑设置口令。仍要继续发布吗？', '提示', {
      confirmButtonText: '继续发布',
      cancelButtonText: '取消',
      type: 'warning'
    })
  }
  await kbPublish(id, comment, { by: currentUserInfo.value.name })
}

const aclSummary = (scope) => {
  const s = scope || { depts: [], roles: [], users: [] }
  const a = []
  if (s.depts?.length) a.push(`部门：${s.depts.join('、')}`)
  if (s.roles?.length) a.push(`角色：${s.roles.join('、')}`)
  if (s.users?.length) a.push(`用户：${s.users.join('、')}`)
  return a.length ? a.join('；') : '默认（不限制）'
}

onMounted(async () => {
  users.value = await getUsers()
  roles.value = await getRoles()
  await loadHot()
  await openDetailFromQuery()
})
</script>
<style scoped>
</style>
<template>
  <div class="container">
    <div class="page-title">知识管理</div>

    <QueryBar>
      <template #default>
        <div class="filter-container">
          <el-input 
            v-model="query.keyword" 
            placeholder="搜索标题/内容" 
            class="search-input"
            clearable 
            @keyup.enter="load"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-tree-select
            v-model="query.categoryId"
            :data="categoryTree"
            clearable
            check-strictly
            placeholder="分类"
            class="filter-select"
          />

          <el-select 
            v-model="query.tagIds" 
            multiple 
            collapse-tags 
            collapse-tags-tooltip 
            clearable 
            placeholder="标签" 
            class="filter-select"
          >
            <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>

          <el-select 
            v-model="query.status" 
            clearable 
            placeholder="状态" 
            class="filter-select"
          >
            <el-option label="未提交" value="draft" />
            <el-option label="审批中" value="pending" />
            <el-option label="已发布" value="published" />
            <el-option label="已驳回" value="rejected" />
            <el-option label="已下线" value="offline" />
          </el-select>

          <el-button class="action-btn" @click="load">查询</el-button>
          <el-button class="action-btn" @click="resetQuery">重置</el-button>
        </div>
      </template>
      <template #ops>
        <el-button type="primary" class="create-btn" @click="openCreate">
          <el-icon><Plus /></el-icon>
          新建知识
        </el-button>
      </template>
    </QueryBar>

    <el-table :data="articleList" border @row-click="openDetail" style="cursor: pointer">
      <el-table-column prop="id" label="编号" width="110" />
      <el-table-column prop="title" label="标题" min-width="260" />
      <el-table-column prop="category" label="分类" min-width="160" />
      <el-table-column label="标签" min-width="160">
        <template #default="{ row }">
          <el-tag v-for="(t,idx) in row.tags" :key="idx" size="small" style="margin-right:6px">{{ t }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="views" label="浏览" width="90" />
      <el-table-column label="点赞" width="90">
        <template #default="{ row }">{{ row.likeCount }}</template>
      </el-table-column>
      <el-table-column label="权限" width="110">
        <template #default="{ row }">
          <el-tag size="small" :type="row.visibility==='public'?'success':(row.visibility==='sensitive'?'danger':'info')">
            {{ visibilityLabel(row.visibility) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-space>
            <el-button size="small" @click.stop="openDetail(row)">详情</el-button>
            <el-button v-if="canEditRow(row) && (row.status==='draft' || row.status==='rejected')" size="small" type="primary" @click.stop="openEdit(row)">编辑</el-button>
            <el-button v-if="canEditRow(row) && (row.status==='draft' || row.status==='rejected')" size="small" type="warning" @click.stop="submitForApprove(row)">提交</el-button>
            <el-dropdown v-if="canOperateRow(row)" @command="cmd => handleRowCommand(cmd, row)">
              <el-button size="small">更多</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="approve" :disabled="row.status!=='pending'">审批通过</el-dropdown-item>
                  <el-dropdown-item command="reject" :disabled="row.status!=='pending'">驳回</el-dropdown-item>
                  <el-dropdown-item command="publish" :disabled="row.status!=='approved'">发布</el-dropdown-item>
                  <el-dropdown-item command="unpublish" :disabled="row.status!=='published'">下线</el-dropdown-item>
                  <el-dropdown-item command="newVersion" :disabled="row.status!=='published'">新版本</el-dropdown-item>
                  <el-dropdown-item command="versions">版本历史</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="editVisible" :title="editTitle" size="48%">
      <el-form label-width="96px" class="edit-form">
        <el-form-item label="标题" required>
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="分类" required>
          <el-tree-select
            v-model="editForm.categoryId"
            :data="categoryTree"
            check-strictly
            clearable
            placeholder="请选择分类"
            style="width: 320px"
          />
        </el-form-item>
        <el-form-item label="标签" required>
          <el-select v-model="editForm.tagIds" multiple collapse-tags collapse-tags-tooltip clearable placeholder="请选择标签" style="width: 420px">
            <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板">
          <el-select v-model="selectedTemplateId" clearable placeholder="可选：套用模板" style="width: 320px" @change="applyTemplate">
            <el-option v-for="t in templates" :key="t.id" :label="`${t.name}（${t.type}）`" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input v-model="editForm.content" type="textarea" :rows="14" />
        </el-form-item>
        <el-form-item label="附件">
          <div class="attachment-section">
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              :multiple="true"
              class="attachment-uploader"
              :on-change="onAttachmentChange"
            >
              <el-button type="primary" plain>
                <el-icon><UploadFilled /></el-icon>
                上传附件
              </el-button>
            </el-upload>
            <div class="attachment-tip">支持多个文件，单个不超过 5MB。</div>
            <div v-if="editForm.attachments.length" class="attachment-list">
              <div v-for="file in editForm.attachments" :key="file.id" class="attachment-item">
                <div class="attachment-name">{{ file.name }}</div>
                <div class="attachment-meta">{{ formatFileSize(file.size) }}</div>
                <el-button link type="primary" @click="downloadAttachment(file)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <el-button link type="danger" @click="removeAttachment(file.id)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-collapse v-model="editCollapse">
          <el-collapse-item name="acl" title="权限与分级">
            <el-form-item label="可见性">
              <el-select v-model="editForm.acl.visibility" style="width: 180px">
                <el-option label="公开" value="public" />
                <el-option label="内部" value="internal" />
                <el-option label="敏感" value="sensitive" />
              </el-select>
            </el-form-item>
            <el-form-item label="加密访问">
              <el-space wrap>
                <el-switch v-model="editForm.acl.encrypt" />
                <el-input v-if="editForm.acl.encrypt" v-model="encryptPassword" type="password" show-password placeholder="设置/更新访问口令" style="width: 260px" />
              </el-space>
            </el-form-item>

            <div class="scope-grid">
              <el-card class="panel scope-card">
                <div class="scope-card-title">查看范围</div>
                <div class="scope-card-desc">用于控制谁可以查看该知识。</div>
                <div class="scope-field">
                  <div class="scope-field-label">部门</div>
                  <el-select v-model="editForm.acl.read.depts" multiple collapse-tags collapse-tags-tooltip clearable placeholder="请选择部门" style="width: 100%">
                    <el-option v-for="d in depts" :key="d" :label="d" :value="d" />
                  </el-select>
                </div>
                <div class="scope-field">
                  <div class="scope-field-label">角色</div>
                  <el-select v-model="editForm.acl.read.roles" multiple collapse-tags collapse-tags-tooltip clearable placeholder="请选择角色" style="width: 100%">
                    <el-option v-for="r in roles" :key="r.name" :label="r.name" :value="r.name" />
                  </el-select>
                </div>
                <div class="scope-field">
                  <div class="scope-field-label">用户</div>
                  <el-select v-model="editForm.acl.read.users" multiple collapse-tags collapse-tags-tooltip clearable placeholder="请选择用户" style="width: 100%">
                    <el-option v-for="u in users" :key="u.name" :label="`${u.name}（${u.dept}）`" :value="u.name" />
                  </el-select>
                </div>
              </el-card>
              <el-card class="panel scope-card">
                <div class="scope-card-title">编辑范围</div>
                <div class="scope-card-desc">用于控制谁可以编辑该知识。</div>
                <div class="scope-field">
                  <div class="scope-field-label">部门</div>
                  <el-select v-model="editForm.acl.edit.depts" multiple collapse-tags collapse-tags-tooltip clearable placeholder="请选择部门" style="width: 100%">
                    <el-option v-for="d in depts" :key="d" :label="d" :value="d" />
                  </el-select>
                </div>
                <div class="scope-field">
                  <div class="scope-field-label">角色</div>
                  <el-select v-model="editForm.acl.edit.roles" multiple collapse-tags collapse-tags-tooltip clearable placeholder="请选择角色" style="width: 100%">
                    <el-option v-for="r in roles" :key="r.name" :label="r.name" :value="r.name" />
                  </el-select>
                </div>
                <div class="scope-field">
                  <div class="scope-field-label">用户</div>
                  <el-select v-model="editForm.acl.edit.users" multiple collapse-tags collapse-tags-tooltip clearable placeholder="请选择用户" style="width: 100%">
                    <el-option v-for="u in users" :key="u.name" :label="`${u.name}（${u.dept}）`" :value="u.name" />
                  </el-select>
                </div>
              </el-card>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-form>
      <el-space wrap>
        <el-button @click="editVisible=false">取消</el-button>
        <el-button v-if="editMode==='edit'" type="primary" @click="saveDraft">保存草稿</el-button>
        <el-button v-else type="primary" @click="createDraft">创建草稿</el-button>
        <el-button type="warning" @click="saveAndSubmit">保存并提交</el-button>
      </el-space>
    </el-drawer>

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
        <el-card v-if="!masked && detail.current.attachments?.length" class="panel detail-attachment-card">
          <div class="detail-attachment-title">附件</div>
          <div class="attachment-list">
            <div v-for="file in detail.current.attachments" :key="file.id" class="attachment-item">
              <div class="attachment-name">{{ file.name }}</div>
              <div class="attachment-meta">{{ formatFileSize(file.size) }}</div>
              <el-button link type="primary" @click="downloadAttachment(file)">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
            </div>
          </div>
        </el-card>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-card class="panel">
              <div style="font-weight: 600; margin-bottom: 8px">审批记录</div>
              <el-timeline>
                <el-timeline-item v-for="(r,idx) in detail.article.approveRecords" :key="idx" :timestamp="formatRecordTime(r.at)">
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import QueryBar from '@/components/Common/QueryBar.vue'
import StepFlow from '@/components/Common/StepFlow.vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, UploadFilled, Download, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { getUsers, getRoles } from '@/mock-data/modules/system'
import {
  kbApprove,
  kbCreateDraft,
  kbGetArticle,
  kbIncrementView,
  kbListArticles,
  kbListCategories,
  kbListTags,
  kbListTemplates,
  kbNewVersion,
  kbPublish,
  kbReject,
  kbRollback,
  kbSubmit,
  kbUnpublish,
  kbUpdateDraft
} from '@/mock-data/modules/kb'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const users = ref([])
const roles = ref([])
const depts = computed(() => Array.from(new Set(users.value.map(u => u.dept))).filter(Boolean))

const query = reactive({ keyword: '', categoryId: '', tagIds: [], status: '' })
const articleList = ref([])
const categories = ref([])
const tags = ref([])
const templates = ref([])

const loadBase = async () => {
  categories.value = await kbListCategories()
  tags.value = await kbListTags()
  templates.value = await kbListTemplates()
}

const load = async () => {
  articleList.value = await kbListArticles(query)
}

const resetQuery = () => {
  query.keyword = ''
  query.categoryId = ''
  query.tagIds = []
  query.status = ''
  load()
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

const statusLabel = (s) => ({
  draft: '未提交',
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
  republish: '上线',
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

const editVisible = ref(false)
const editMode = ref('create')
const editTitle = computed(() => (editMode.value === 'edit' ? `编辑知识（${editId.value}）` : '新建知识'))
const editId = ref('')
const selectedTemplateId = ref('')
const encryptPassword = ref('')
const editCollapse = ref(['acl'])
const editForm = reactive({
  title: '',
  categoryId: '',
  tagIds: [],
  content: '',
  attachments: [],
  acl: {
    visibility: 'internal',
    encrypt: false,
    encryptSalt: '',
    encryptHash: '',
    read: { depts: [], roles: [], users: [] },
    edit: { depts: [], roles: [], users: [] }
  }
})
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024
const MAX_ATTACHMENT_COUNT = 8

const sha256Hex = async (text) => {
  const enc = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const setEncryptIfNeeded = async () => {
  if (!editForm.acl.encrypt) {
    editForm.acl.encryptSalt = ''
    editForm.acl.encryptHash = ''
    encryptPassword.value = ''
    return
  }
  const pwd = String(encryptPassword.value || '').trim()
  if (!pwd) return
  const salt = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  editForm.acl.encryptSalt = salt
  editForm.acl.encryptHash = await sha256Hex(`${salt}:${pwd}`)
  encryptPassword.value = ''
}

watch(() => editForm.acl.encrypt, () => {
  if (!editForm.acl.encrypt) {
    editForm.acl.encryptSalt = ''
    editForm.acl.encryptHash = ''
    encryptPassword.value = ''
  }
})

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result || ''))
  reader.onerror = () => reject(new Error('文件读取失败'))
  reader.readAsDataURL(file)
})

const formatFileSize = (size) => {
  const value = Number(size || 0)
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

const onAttachmentChange = async (uploadFile) => {
  const raw = uploadFile?.raw
  if (!raw) return
  if (editForm.attachments.length >= MAX_ATTACHMENT_COUNT) {
    ElMessage.warning(`最多上传 ${MAX_ATTACHMENT_COUNT} 个附件`)
    return
  }
  if (raw.size > MAX_ATTACHMENT_SIZE) {
    ElMessage.warning(`文件 ${raw.name} 超过 5MB，无法上传`)
    return
  }
  const exists = editForm.attachments.some((item) => item.name === raw.name && item.size === raw.size)
  if (exists) {
    ElMessage.warning(`附件 ${raw.name} 已存在`)
    return
  }
  try {
    const content = await fileToDataUrl(raw)
    editForm.attachments.push({
      id: `ATT-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name: raw.name,
      size: raw.size,
      type: raw.type || 'application/octet-stream',
      content,
      uploadedAt: new Date().toISOString()
    })
  } catch (error) {
    ElMessage.error(error?.message || '上传失败')
  }
}

const removeAttachment = (id) => {
  editForm.attachments = editForm.attachments.filter((item) => item.id !== id)
}

const downloadAttachment = (file) => {
  const content = String(file?.content || '')
  if (!content) {
    ElMessage.warning('该附件暂无可下载内容')
    return
  }
  const a = document.createElement('a')
  a.href = content
  a.download = file.name || '附件'
  a.click()
}

const resetEditForm = () => {
  editForm.title = ''
  editForm.categoryId = ''
  editForm.tagIds = []
  editForm.content = ''
  editForm.attachments = []
  editForm.acl.visibility = 'internal'
  editForm.acl.encrypt = false
  editForm.acl.encryptSalt = ''
  editForm.acl.encryptHash = ''
  editForm.acl.read = { depts: [], roles: [], users: [] }
  editForm.acl.edit = { depts: [], roles: [], users: [] }
  selectedTemplateId.value = ''
  encryptPassword.value = ''
}

const applyTemplate = (tplId) => {
  const t = templates.value.find(x => x.id === tplId)
  if (!t) return
  if (!editForm.content || (editForm.content && editForm.content.trim().length < 10)) {
    editForm.content = t.content || ''
  } else {
    ElMessage.warning('当前内容不为空，未自动覆盖。可手动复制模板内容。')
  }
}

const openCreate = async () => {
  editMode.value = 'create'
  editId.value = ''
  resetEditForm()
  editVisible.value = true
  const from = route.query.create_from
  if (from) {
    editForm.title = String(route.query.title || '')
    editForm.content = String(route.query.content || '')
    if (!editForm.categoryId) {
      const cat = categories.value.find(c => c.name === '案例库')
      editForm.categoryId = cat?.id || ''
    }
    await router.replace({ path: route.path, query: {} })
  }
}

const openEdit = async (row) => {
  const id = row.id || row
  const d = await kbGetArticle(id)
  editMode.value = 'edit'
  editId.value = id
  resetEditForm()
  editForm.title = d.current.title
  editForm.categoryId = d.current.categoryId || ''
  editForm.tagIds = d.current.tagIds || []
  editForm.content = d.current.content || ''
  editForm.attachments = Array.isArray(d.current.attachments) ? JSON.parse(JSON.stringify(d.current.attachments)) : []
  editForm.acl = deepMergeAcl(d.article.acl || {})
  editVisible.value = true
}

const deepMergeAcl = (acl) => {
  const base = {
    visibility: 'internal',
    encrypt: false,
    encryptSalt: '',
    encryptHash: '',
    read: { depts: [], roles: [], users: [] },
    edit: { depts: [], roles: [], users: [] }
  }
  const next = JSON.parse(JSON.stringify(base))
  Object.assign(next, acl || {})
  next.read = Object.assign({ depts: [], roles: [], users: [] }, acl?.read || {})
  next.edit = Object.assign({ depts: [], roles: [], users: [] }, acl?.edit || {})
  return next
}

const createDraft = async () => {
  try {
    await setEncryptIfNeeded()
    await kbCreateDraft({
      title: editForm.title,
      categoryId: editForm.categoryId || null,
      tagIds: editForm.tagIds || [],
      content: editForm.content,
      attachments: editForm.attachments,
      acl: editForm.acl
    }, { by: currentUserInfo.value.name })
    ElMessage.success('已创建草稿')
    editVisible.value = false
    await load()
  } catch (e) {
    ElMessage.error(e?.message || '创建失败')
  }
}

const saveDraft = async () => {
  try {
    await setEncryptIfNeeded()
    await kbUpdateDraft(editId.value, {
      title: editForm.title,
      categoryId: editForm.categoryId || null,
      tagIds: editForm.tagIds || [],
      content: editForm.content,
      attachments: editForm.attachments,
      changeLog: '编辑'
    }, { by: currentUserInfo.value.name })
    ElMessage.success('已保存')
    editVisible.value = false
    await load()
    if (detailVisible.value && detail.value?.view?.id === editId.value) await refreshDetail(editId.value, false)
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  }
}

const saveAndSubmit = async () => {
  try {
    const comment = await ElMessageBox.prompt('可选：填写提交说明', '提交审批', {
      confirmButtonText: '提交',
      cancelButtonText: '取消',
      inputPlaceholder: '例如：补充排查步骤'
    }).then(r => r.value).catch(() => null)
    if (comment === null) return
    if (editMode.value === 'create') {
      await setEncryptIfNeeded()
      const a = await kbCreateDraft({
        title: editForm.title,
        categoryId: editForm.categoryId || null,
        tagIds: editForm.tagIds || [],
        content: editForm.content,
        attachments: editForm.attachments,
        acl: editForm.acl
      }, { by: currentUserInfo.value.name })
      await kbSubmit(a.id, comment, { by: currentUserInfo.value.name })
    } else {
      await setEncryptIfNeeded()
      await kbUpdateDraft(editId.value, {
        title: editForm.title,
        categoryId: editForm.categoryId || null,
        tagIds: editForm.tagIds || [],
        content: editForm.content,
        attachments: editForm.attachments,
        changeLog: '编辑'
      }, { by: currentUserInfo.value.name })
      await kbSubmit(editId.value, comment, { by: currentUserInfo.value.name })
    }
    ElMessage.success('已提交审批')
    editVisible.value = false
    await load()
  } catch (e) {
    ElMessage.error(e?.message || '提交失败')
  }
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
    await load()
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
    if (cmd === 'versions') {
      await openVersionDialog(row)
      return
    }
    await load()
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

const formatRecordTime = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).replace('T', ' ').replace(/Z$/, '')
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
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
    await load()
    if (detailVisible.value && detail.value?.view?.id === versionTargetId.value) await refreshDetail(versionTargetId.value, false)
  } catch (e) {
    ElMessage.error(e?.message || '回滚失败')
  }
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
  await loadBase()
  await load()
  if (route.query.create_from) await openCreate()
  await openDetailFromQuery()
})
</script>
<style scoped>
.filter-container {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.search-input {
  width: 280px;
}

.filter-select {
  width: 160px;
}

.action-btn {
  min-width: 80px;
  border-radius: 10px;
  transition: all 160ms ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.create-btn {
  min-width: 120px;
  border-radius: 10px;
  transition: all 160ms ease;
}

.create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.edit-form {
  max-width: 760px;
}

.attachment-section {
  width: 100%;
  border: 1px dashed rgba(148, 163, 184, 0.65);
  border-radius: 10px;
  padding: 12px;
  background: rgba(248, 250, 252, 0.75);
}

.attachment-uploader {
  margin-bottom: 8px;
}

.attachment-tip {
  font-size: 12px;
  color: rgba(100, 116, 139, 0.9);
  margin-bottom: 8px;
}

.attachment-list {
  display: grid;
  gap: 8px;
}

.attachment-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 100px auto auto;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 8px;
  background: #fff;
}

.attachment-name {
  font-size: 13px;
  color: rgba(15, 23, 42, 0.88);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-meta {
  font-size: 12px;
  color: rgba(100, 116, 139, 0.92);
  text-align: right;
}

.scope-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.scope-card {
  border-radius: 10px;
}

.scope-card-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.scope-card-desc {
  font-size: 12px;
  color: rgba(100, 116, 139, 0.9);
  margin-bottom: 10px;
}

.scope-field {
  margin-bottom: 10px;
}

.scope-field:last-child {
  margin-bottom: 0;
}

.scope-field-label {
  font-size: 12px;
  color: rgba(71, 85, 105, 0.92);
  margin-bottom: 6px;
}

.detail-attachment-card {
  margin-bottom: 12px;
}

.detail-attachment-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.search-input :deep(.el-input__wrapper),
.filter-select :deep(.el-select__wrapper) {
  border-radius: 10px;
  border: 1px solid rgba(191, 219, 254, 0.7);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.07);
}

.search-input :deep(.el-input__wrapper.is-focused),
.filter-select :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.35), 0 8px 20px rgba(37, 99, 235, 0.1);
}

@media (max-width: 1200px) {
  .filter-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input,
  .filter-select {
    width: 100%;
  }
  
  .action-btn {
    flex: 1;
  }

  .scope-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .attachment-item {
    grid-template-columns: minmax(0, 1fr) auto;
  }
}
</style>

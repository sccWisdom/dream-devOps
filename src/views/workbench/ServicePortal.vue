<template>
  <div class="container service-portal">
    <div class="hero">
      <div class="hero-inner">
        <el-input
          v-model="keyword"
          class="search-input"
          clearable
          placeholder="请输入服务名称的关键词进行搜索"
          @keyup.enter="onSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" class="search-btn" @click="onSearch">搜一下</el-button>
          </template>
        </el-input>

        <div class="major-tabs">
          <button
            v-for="t in majorTabs"
            :key="t.key"
            class="major-tab"
            :class="{ active: majorType === t.key }"
            @click="setMajorType(t.key)"
          >
            {{ t.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="segments">
      <div
        v-for="s in segments"
        :key="s.key"
        class="seg"
        :class="{ active: segmentKey === s.key }"
        @click="setSegment(s.key)"
      >
        <div class="seg-count">{{ s.count }}</div>
        <div class="seg-label">{{ s.label }}</div>
      </div>
    </div>

    <div class="list-panel">
      <div class="cards-grid">
        <div v-for="item in pageItems" :key="item.id" class="svc-card" @click="open(item)">
          <div class="svc-head">
            <div class="svc-icon" :class="toneClass(item)">
              <el-icon>
                <component :is="getIcon(item.icon)" />
              </el-icon>
            </div>
            <div class="svc-head-main">
              <div class="svc-title-row">
                <div class="svc-title">{{ item.name }}</div>
                <el-button text class="star-btn" @click.stop="toggleStar(item)">
                  <el-icon v-if="item.starred" class="star on"><StarFilled /></el-icon>
                  <el-icon v-else class="star"><Star /></el-icon>
                </el-button>
              </div>
              <div class="svc-tags">
                <span class="tag tag-cat">{{ item.categoryLabel }}</span>
                <span class="tag tag-p" :class="priorityClass(item.priority)">{{ item.priority }}</span>
              </div>
            </div>
          </div>

          <div class="svc-desc">{{ item.desc }}</div>

          <div class="svc-foot">
            <div class="svc-meta">{{ item.submittedCount }} 人已提单</div>
            <div class="svc-action" @click.stop="open(item)">
              去提单
              <el-icon class="arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <div class="pager">
        <div class="pager-left">
          <el-button text class="pager-icon" @click="refreshList">
            <el-icon><RefreshRight /></el-icon>
          </el-button>
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 15, 30]"
          background
          layout="total, prev, pager, next, jumper, sizes"
        />
      </div>
    </div>

    <el-dialog v-model="visible" :title="current?.name || '提交工单'" width="560px">
      <el-form label-width="96px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="form.priority" placeholder="请选择">
            <el-option label="P1" value="P1" />
            <el-option label="P2" value="P2" />
            <el-option label="P3" value="P3" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.desc" type="textarea" :rows="4" placeholder="请简要描述问题" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">提交</el-button>
      </template>
    </el-dialog>

    <!-- 智能助手组件 -->
    <SmartAssistant />
  </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ArrowRight,
  Promotion,
  QuestionFilled,
  RefreshRight,
  Search,
  Setting,
  Star,
  StarFilled,
  Tickets,
  Tools,
  WarningFilled
} from '@element-plus/icons-vue'
import { getServiceCatalog } from '../../mock-data/modules/workbench'
import SmartAssistant from '../../components/Common/SmartAssistant.vue'
const services = ref([])
const keyword = ref('')
const majorType = ref('all')
const segmentKey = ref('all')
const pageSize = ref(12)
const currentPage = ref(1)
const visible = ref(false)
const current = ref(null)
const form = ref({ title: '', priority: 'P3', desc: '' })

const iconMap = {
  tickets: Tickets,
  tools: Tools,
  'warning-filled': WarningFilled,
  promotion: Promotion,
  'question-filled': QuestionFilled,
  setting: Setting
}

const majorTabs = [
  { key: 'all', label: '全部服务' },
  { key: 'incident', label: '事件管理' },
  { key: 'problem', label: '问题管理' },
  { key: 'change', label: '变更管理' },
  { key: 'release', label: '发布管理' },
  { key: 'request', label: '请求管理' }
]

const baseFiltered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  const major = majorType.value
  return services.value.filter((s) => {
    const majorOk = major === 'all' ? true : s.majorType === major
    if (!majorOk) return false
    if (!kw) return true
    return `${s.name} ${s.desc} ${s.categoryLabel}`.toLowerCase().includes(kw)
  })
})

const segments = computed(() => {
  const list = baseFiltered.value
  const countBy = (key) => list.filter((s) => s.categoryKey === key).length
  const favorites = list.filter((s) => s.starred).length
  const recent7d = list.filter((s) => (s.submittedCount || 0) > 0).length
  return [
    { key: 'all', label: '全部服务', count: list.length },
    { key: 'incidentMgmt', label: '事件管理', count: countBy('incidentMgmt') },
    { key: 'problemMgmt', label: '问题管理', count: countBy('problemMgmt') },
    { key: 'changeMgmt', label: '变更管理', count: countBy('changeMgmt') },
    { key: 'releaseMgmt', label: '发布管理', count: countBy('releaseMgmt') },
    { key: 'requestMgmt', label: '请求管理', count: countBy('requestMgmt') },
    { key: 'recent7d', label: '最近7天提单', count: recent7d },
    { key: 'favorites', label: '我的收藏', count: favorites }
  ]
})

const filtered = computed(() => {
  const seg = segmentKey.value
  const list = baseFiltered.value
  if (seg === 'all') return list
  if (seg === 'favorites') return list.filter((s) => s.starred)
  if (seg === 'recent7d') return list.filter((s) => (s.submittedCount || 0) > 0)
  return list.filter((s) => s.categoryKey === seg)
})

const total = computed(() => filtered.value.length)

const pageItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const setMajorType = (key) => {
  majorType.value = key
  segmentKey.value = 'all'
  currentPage.value = 1
}

const setSegment = (key) => {
  segmentKey.value = key
  currentPage.value = 1
}

const onSearch = () => {
  currentPage.value = 1
}

const toneClass = (item) => {
  const map = {
    requestMgmt: 'tone-blue',
    incidentMgmt: 'tone-green',
    releaseMgmt: 'tone-yellow',
    changeMgmt: 'tone-purple',
    problemMgmt: 'tone-amber'
  }
  return map[item.categoryKey] || 'tone-blue'
}

const priorityClass = (p) => {
  const map = { P1: 'p1', P2: 'p2', P3: 'p3' }
  return map[p] || 'p3'
}

const getIcon = (name) => iconMap[name] || Tickets

const toggleStar = (item) => {
  item.starred = !item.starred
}

const open = (item) => {
  current.value = item
  visible.value = true
  form.value = { title: item?.name || '', priority: item?.priority || 'P3', desc: '' }
}

const submit = () => {
  visible.value = false
  ElMessage.success('已提交，编号 INC-20260318-XXX')
  form.value = { title: '', priority: 'P3', desc: '' }
}

const refreshList = async () => {
  services.value = await getServiceCatalog()
}
onMounted(async () => {
  await refreshList()
})
</script>
<style scoped>
.service-portal {
  position: relative;
}

.hero {
  position: relative;
  border-radius: 12px;
  padding: 14px 16px 12px;
  background:
    radial-gradient(900px 260px at 20% -40%, rgba(37, 99, 235, 0.28), rgba(255, 255, 255, 0) 60%),
    radial-gradient(720px 220px at 82% -40%, rgba(96, 165, 250, 0.3), rgba(255, 255, 255, 0) 55%),
    linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,255,255,0.45));
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(10px);
}

.hero-inner {
  display: grid;
  gap: 10px;
}

.search-input :global(.el-input__wrapper) {
  height: 38px;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.08);
}

.search-btn {
  width: 86px;
  border-radius: 8px;
}

.major-tabs {
  display: flex;
  gap: 10px;
  padding-left: 4px;
  flex-wrap: wrap;
}

.major-tab {
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255,255,255,0.6);
  color: rgba(15, 23, 42, 0.72);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
}

.major-tab:hover {
  background: rgba(255,255,255,0.85);
}

.major-tab.active {
  color: rgba(30, 64, 175, 0.98);
  border-color: rgba(37, 99, 235, 0.35);
  background: rgba(37, 99, 235, 0.08);
}

.segments {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(229, 231, 235, 0.9);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.seg {
  border-radius: 10px;
  padding: 10px 6px;
  text-align: center;
  cursor: pointer;
  transition: background-color 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(248, 250, 252, 0.55);
}

.seg:hover {
  background: rgba(255,255,255,0.9);
}

.seg.active {
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.12), rgba(255, 255, 255, 0.9));
  border-color: rgba(37, 99, 235, 0.28);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.12);
}

.seg-count {
  font-size: 16px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.82);
}

.seg.active .seg-count {
  color: rgba(37, 99, 235, 0.95);
}

.seg-label {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(71, 85, 105, 0.78);
}

.seg.active .seg-label {
  color: rgba(37, 99, 235, 0.88);
}

.list-panel {
  margin-top: 12px;
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 12px;
  padding: 14px 14px 10px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.svc-card {
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 10px;
  background: rgba(255,255,255,0.96);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
  padding: 12px 12px 10px;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.svc-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.14);
  border-color: rgba(37, 99, 235, 0.2);
}

.svc-head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.svc-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: rgba(255,255,255,0.98);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
  flex: 0 0 auto;
}

.tone-blue {
  background: linear-gradient(135deg, #2d7df6 0%, #1e40af 100%);
}

.tone-orange {
  background: linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%);
}

.tone-green {
  background: linear-gradient(135deg, #34d399 0%, #16a34a 100%);
}

.tone-yellow {
  background: linear-gradient(135deg, #f6c453 0%, #f59e0b 100%);
}

.tone-purple {
  background: linear-gradient(135deg, #7c83ff 0%, #4f46e5 100%);
}

.tone-amber {
  background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
}

.svc-head-main {
  min-width: 0;
  flex: 1 1 auto;
}

.svc-title-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
}

.svc-title {
  font-size: 14px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.star-btn {
  padding: 0;
  height: 24px;
}

.star {
  color: rgba(148, 163, 184, 0.9);
}

.star.on {
  color: rgba(37, 99, 235, 0.9);
}

.svc-tags {
  margin-top: 6px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  height: 18px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 18px;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.tag-cat {
  background: rgba(37, 99, 235, 0.08);
  color: rgba(30, 64, 175, 0.92);
  border-color: rgba(37, 99, 235, 0.18);
}

.tag-p {
  background: rgba(15, 23, 42, 0.04);
  color: rgba(71, 85, 105, 0.9);
}

.tag-p.p1 {
  background: rgba(239, 68, 68, 0.08);
  color: rgba(220, 38, 38, 0.92);
  border-color: rgba(239, 68, 68, 0.18);
}

.tag-p.p2 {
  background: rgba(245, 158, 11, 0.1);
  color: rgba(217, 119, 6, 0.92);
  border-color: rgba(245, 158, 11, 0.22);
}

.tag-p.p3 {
  background: rgba(34, 197, 94, 0.1);
  color: rgba(22, 163, 74, 0.92);
  border-color: rgba(34, 197, 94, 0.22);
}

.svc-desc {
  margin-top: 10px;
  font-size: 12px;
  color: rgba(71, 85, 105, 0.82);
  line-height: 1.55;
  height: 38px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.svc-foot {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid rgba(226, 232, 240, 0.85);
}

.svc-meta {
  font-size: 12px;
  color: rgba(100, 116, 139, 0.9);
}

.svc-action {
  font-size: 12px;
  font-weight: 600;
  color: rgba(37, 99, 235, 0.92);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.arrow {
  font-size: 12px;
}

.pager {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.pager-left {
  display: flex;
  gap: 6px;
}

.pager-icon {
  height: 28px;
  padding: 0 6px;
  color: rgba(100, 116, 139, 0.9);
}

@media (max-width: 1200px) {
  .segments {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
  .cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .segments {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

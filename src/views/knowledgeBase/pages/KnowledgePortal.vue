<template>
  <div class="container knowledge-portal">
    <div class="hero">
      <div class="hero-inner">
        <el-input
          v-model="keyword"
          class="search-input"
          clearable
          placeholder="请输入服务名称、服务描述的关键词进行搜索"
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

    <div class="main-content">
      <div class="left-panel">
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
          <div class="list-header">
            <div class="list-title">共 {{ total }} 条知识</div>
            <div class="sort-options">
              <el-button
                type="text"
                :class="{ active: sortBy === 'views' }"
                @click="setSort('views')"
              >
                浏览量
                <el-icon :class="{ active: sortBy === 'views' }">
                  <ArrowUp v-if="sortOrder === 'desc' && sortBy === 'views'" />
                  <ArrowDown v-else />
                </el-icon>
              </el-button>
              <el-button
                type="text"
                :class="{ active: sortBy === 'createdAt' }"
                @click="setSort('createdAt')"
              >
                发布时间
                <el-icon :class="{ active: sortBy === 'createdAt' }">
                  <ArrowUp v-if="sortOrder === 'desc' && sortBy === 'createdAt'" />
                  <ArrowDown v-else />
                </el-icon>
              </el-button>
            </div>
          </div>

          <div class="knowledge-list">
            <div v-for="item in pageItems" :key="item.id" class="knowledge-item" @click="openDetail(item)">
              <div class="knowledge-header">
                <div class="knowledge-title">{{ item.title }}</div>
                <div class="knowledge-actions">
                  <el-tag size="small" class="category-tag">{{ item.category }}</el-tag>
                  <el-button text class="star-btn" @click.stop="toggleStar(item)">
                    <el-icon v-if="item.starred" class="star on"><StarFilled /></el-icon>
                    <el-icon v-else class="star"><Star /></el-icon>
                  </el-button>
                  <el-button text class="share-btn" @click.stop>
                    <el-icon><Share /></el-icon>
                  </el-button>
                </div>
              </div>
              <div class="knowledge-content">{{ item.content }}</div>
              <div class="knowledge-footer">
                <div class="knowledge-meta">
                  <span class="meta-item">浏览次数：{{ item.views }}</span>
                  <span class="meta-item">发布日期：{{ formatDate(item.createdAt) }}</span>
                </div>
                <div class="thumb-actions">
                  <button class="thumb-btn like" @click.stop="thumbUp(item)">
                    <span class="thumb-icon">👍</span>
                    <span class="thumb-count">{{ item.likeCount || 0 }}</span>
                  </button>
                  <button class="thumb-btn dislike" @click.stop="thumbDown(item)">
                    <span class="thumb-icon">👎</span>
                    <span class="thumb-count">{{ item.dislikeCount || 0 }}</span>
                  </button>
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
              :page-sizes="[15, 20, 30]"
              background
              layout="total, prev, pager, next, jumper, sizes"
            />
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="hot-panel">
          <div class="hot-header">
            <el-icon class="hot-icon"><Document /></el-icon>
            <span class="hot-title">TOP5知识榜</span>
          </div>
          <div class="hot-list">
            <div v-for="(item, index) in hotItems" :key="item.id" class="hot-item">
              <div class="hot-rank">{{ index + 1 }}</div>
              <div class="hot-content">
                <div class="hot-title">{{ item.title }}</div>
                <div class="hot-meta">
                  <span class="hot-views">浏览次数：{{ item.views }}</span>
                  <span class="hot-date">{{ formatDate(item.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="detailVisible"
      :title="selectedKnowledge?.title || '知识详情'"
      width="700px"
      center
    >
      <div v-if="selectedKnowledge" class="knowledge-detail">
        <div class="detail-meta">
          <el-tag type="info">{{ selectedKnowledge.category }}</el-tag>
          <el-tag type="success">浏览量：{{ selectedKnowledge.views }}</el-tag>
          <el-tag type="warning">发布日期：{{ formatDate(selectedKnowledge.createdAt) }}</el-tag>
        </div>
        <div class="detail-content">
          {{ selectedKnowledge.content }}
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  Search,
  Star,
  StarFilled,
  Share,
  RefreshRight,
  ArrowUp,
  ArrowDown,
  Document
} from '@element-plus/icons-vue'
import { getKnowledgeBase, kbDislike, kbLike } from '@/mock-data/modules/kb'

const knowledgeList = ref([])
const keyword = ref('')
const majorType = ref('all')
const segmentKey = ref('all')
const pageSize = ref(15)
const currentPage = ref(1)
const sortBy = ref('views')
const sortOrder = ref('desc')
const detailVisible = ref(false)
const selectedKnowledge = ref(null)

const majorTabs = [
  { key: 'all', label: '全部知识' },
  { key: 'common', label: '运维通用知识' },
  { key: 'data', label: '数据交维' },
  { key: 'platform', label: '平台交维' },
  { key: 'manual', label: '操作手册' },
  { key: 'sop', label: 'SOP' },
  { key: 'case', label: '案例库' }
]

const baseFiltered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  const major = majorType.value
  return knowledgeList.value.filter((s) => {
    let majorOk = major === 'all' ? true : s.category === major
    // 处理majorType的映射
    if (!majorOk) {
      const majorMap = {
        'common': '运维通用知识',
        'data': '数据交维',
        'platform': '平台交维',
        'manual': '操作手册',
        'sop': 'SOP',
        'case': '案例库'
      }
      const mappedMajor = majorMap[major]
      if (mappedMajor) {
        majorOk = s.category === mappedMajor
      }
    }
    if (!majorOk) return false
    if (!kw) return true
    return `${s.title} ${s.content}`.toLowerCase().includes(kw)
  })
})

const segments = computed(() => {
  const list = baseFiltered.value
  const countBy = (key) => list.filter((s) => s.category === key).length
  const favorites = list.filter((s) => s.starred).length
  const recent7d = list.filter((s) => {
    const date = new Date(s.createdAt)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return date >= sevenDaysAgo
  }).length
  return [
    { key: 'all', label: '全部知识', count: list.length },
    { key: '运维通用知识', label: '运维通用知识', count: countBy('运维通用知识') },
    { key: '数据交维', label: '数据交维', count: countBy('数据交维') },
    { key: '平台交维', label: '平台交维', count: countBy('平台交维') },
    { key: '操作手册', label: '操作手册', count: countBy('操作手册') },
    { key: 'SOP', label: 'SOP', count: countBy('SOP') },
    { key: '案例库', label: '案例库', count: countBy('案例库') },
    { key: 'recent7d', label: '最近7天', count: recent7d },
    { key: 'favorites', label: '我的收藏', count: favorites }
  ]
})

const filtered = computed(() => {
  const seg = segmentKey.value
  const list = baseFiltered.value
  if (seg === 'all') return list
  if (seg === 'favorites') return list.filter((s) => s.starred)
  if (seg === 'recent7d') return list.filter((s) => {
    const date = new Date(s.createdAt)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return date >= sevenDaysAgo
  })
  return list.filter((s) => s.category === seg)
})

const sorted = computed(() => {
  const list = filtered.value
  return [...list].sort((a, b) => {
    if (sortBy.value === 'views') {
      return sortOrder.value === 'desc' ? b.views - a.views : a.views - b.views
    }
    if (sortBy.value === 'createdAt') {
      return sortOrder.value === 'desc' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)
    }
    return 0
  })
})

const total = computed(() => sorted.value.length)

const pageItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sorted.value.slice(start, start + pageSize.value)
})

const hotItems = computed(() => {
  return [...knowledgeList.value]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
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

const setSort = (key) => {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortBy.value = key
    sortOrder.value = 'desc'
  }
}

const toggleStar = (item) => {
  item.starred = !item.starred
}

const openDetail = (item) => {
  selectedKnowledge.value = item
  detailVisible.value = true
}

const thumbUp = async (item) => {
  await kbLike(item.id)
  item.likeCount = (item.likeCount || 0) + 1
}

const thumbDown = async (item) => {
  await kbDislike(item.id)
  item.dislikeCount = (item.dislikeCount || 0) + 1
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const refreshList = async () => {
  knowledgeList.value = await getKnowledgeBase({ statusExclude: ['offline'] })
}

onMounted(async () => {
  await refreshList()
})
</script>
<style scoped>
.knowledge-portal {
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

.main-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  margin-top: 16px;
}

.segments {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(229, 231, 235, 0.9);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  margin-bottom: 16px;
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
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 12px;
  padding: 14px 14px 10px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.85);
}

.list-title {
  font-size: 14px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.92);
}

.sort-options {
  display: flex;
  gap: 16px;
}

.sort-options .el-button {
  color: rgba(71, 85, 105, 0.82);
  font-size: 12px;
  padding: 0;
  height: 24px;
}

.sort-options .el-button.active {
  color: rgba(37, 99, 235, 0.95);
}

.sort-options .el-icon {
  margin-left: 4px;
  font-size: 12px;
}

.knowledge-list {
  display: grid;
  gap: 16px;
}

.knowledge-item {
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 10px;
  background: rgba(255,255,255,0.96);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
  padding: 16px;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.knowledge-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.14);
  border-color: rgba(37, 99, 235, 0.2);
}

.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.knowledge-title {
  font-size: 16px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.92);
  flex: 1;
  margin-right: 12px;
}

.knowledge-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.category-tag {
  background: rgba(37, 99, 235, 0.1);
  color: rgba(37, 99, 235, 0.9);
  border-color: rgba(37, 99, 235, 0.2);
  font-size: 11px;
}

.star-btn, .share-btn {
  padding: 0;
  height: 24px;
}

.star {
  color: rgba(148, 163, 184, 0.9);
}

.star.on {
  color: rgba(37, 99, 235, 0.9);
}

.knowledge-content {
  font-size: 14px;
  color: rgba(71, 85, 105, 0.82);
  line-height: 1.55;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.knowledge-footer {
  border-top: 1px solid rgba(226, 232, 240, 0.85);
  padding-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.knowledge-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: rgba(100, 116, 139, 0.9);
}

.thumb-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.thumb-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  padding: 4px 10px;
  color: rgba(15, 23, 42, 0.86);
  cursor: pointer;
  transition: all 160ms ease;
}

.thumb-btn:hover {
  transform: translateY(-1px);
}

.thumb-btn.like:hover {
  border-color: rgba(22, 163, 74, 0.35);
  color: rgba(21, 128, 61, 0.92);
}

.thumb-btn.dislike:hover {
  border-color: rgba(220, 38, 38, 0.35);
  color: rgba(185, 28, 28, 0.92);
}

.thumb-icon {
  font-size: 20px;
  line-height: 1;
}

.thumb-count {
  font-size: 12px;
  font-weight: 600;
  min-width: 16px;
}

.pager {
  margin-top: 16px;
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

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hot-panel {
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.hot-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.85);
}

.hot-icon {
  color: #3b82f6;
  margin-right: 8px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hot-title {
  font-size: 14px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.92);
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 160ms ease;
}

.hot-item:hover {
  background: rgba(248, 250, 252, 0.8);
}

.hot-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.hot-content {
  flex: 1;
}

.hot-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.92);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.hot-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: rgba(100, 116, 139, 0.9);
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .right-panel {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .segments {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .segments {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  
  .right-panel {
    grid-template-columns: 1fr;
  }
}

.knowledge-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-content {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(71, 85, 105, 0.9);
  white-space: pre-wrap;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 8px;
  padding: 16px;
  background: rgba(248, 250, 252, 0.5);
}
</style>

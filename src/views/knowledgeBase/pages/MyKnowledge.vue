<template>
  <div class="container my-knowledge">
    <div class="overview-cards">
      <div class="card" @click="filterByStatus('pending')">
        <div class="card-icon pending-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">待审核</div>
          <div class="card-count">{{ pendingCount }}</div>
        </div>
      </div>
      <div class="card" @click="filterByStatus('published')">
        <div class="card-icon published-icon">
          <el-icon><Check /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">已发布</div>
          <div class="card-count">{{ publishedCount }}</div>
        </div>
      </div>
      <div class="card" @click="filterByStarred">
        <div class="card-icon starred-icon">
          <el-icon><StarFilled /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">我的收藏</div>
          <div class="card-count">{{ starredCount }}</div>
        </div>
      </div>
      <div class="card" @click="filterByStatus('draft')">
        <div class="card-icon draft-icon">
          <el-icon><Edit /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">草稿</div>
          <div class="card-count">{{ draftCount }}</div>
        </div>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-toolbar">
        <div class="filter-left">
          <el-input
            v-model="searchKeyword"
            class="search-input"
            placeholder="搜索标题/内容"
            clearable
            @keyup.enter="onSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="filterStatus"
            class="filter-select"
            clearable
            placeholder="状态"
            @change="onSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="未提交" value="draft" />
            <el-option label="审批中" value="pending" />
            <el-option label="已发布" value="published" />
            <el-option label="已驳回" value="rejected" />
            <el-option label="已下线" value="offline" />
          </el-select>

          <el-select
            v-model="filterCategory"
            class="filter-select"
            clearable
            placeholder="分类"
            @change="onSearch"
          >
            <el-option label="全部" value="" />
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <el-button type="primary" class="action-btn" @click="onSearch">搜索</el-button>
          <el-button class="action-btn" @click="resetFilter">重置</el-button>
        </div>

        <div class="filter-right">
          <el-button type="primary" class="create-btn" @click="goToCreate">
            <el-icon><Plus /></el-icon>
            新建知识
          </el-button>
        </div>
      </div>
    </div>

    <div class="knowledge-list">
      <el-table :data="pagedKnowledge" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="220" />
        <el-table-column prop="category" label="所属分类" min-width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="180">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              size="small"
              style="margin-right: 4px"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="views" label="阅读量" width="90" />
        <el-table-column prop="starredCount" label="收藏量" width="90" />
        <el-table-column label="操作" min-width="340" fixed="right">
          <template #default="{ row }">
            <el-space size="small" wrap>
              <el-button size="small" @click="viewKnowledge(row)">查看</el-button>
              <el-button size="small" type="primary" @click="editKnowledge(row)">编辑</el-button>
              <el-dropdown trigger="click" @command="(command) => handleMoreCommand(command, row)">
                <el-button size="small">更多</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="star">{{ row.starred ? '取消收藏' : '收藏' }}</el-dropdown-item>
                    <el-dropdown-item
                      v-if="row.status === 'draft' || row.status === 'rejected'"
                      command="submit"
                    >
                      提交审核
                    </el-dropdown-item>
                    <el-dropdown-item v-if="row.status === 'approved'" command="publish">发布</el-dropdown-item>
                    <el-dropdown-item v-if="row.status === 'published'" command="offline">下线</el-dropdown-item>
                    <el-dropdown-item v-if="row.status === 'offline'" command="online">上线</el-dropdown-item>
                    <el-dropdown-item
                      v-if="row.status === 'offline'"
                      command="delete"
                      style="color: var(--el-color-danger)"
                    >
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredKnowledge.length"
          :page-sizes="[10, 20, 50]"
          layout="total, prev, pager, next, jumper, sizes"
        />
      </div>
    </div>

    <el-dialog
      v-model="detailVisible"
      :title="selectedKnowledge?.title || '知识详情'"
      width="700px"
    >
      <div v-if="selectedKnowledge" class="knowledge-detail">
        <div class="detail-meta">
          <el-tag type="info">{{ selectedKnowledge.category }}</el-tag>
          <el-tag type="success">阅读量：{{ selectedKnowledge.views }}</el-tag>
          <el-tag type="warning">收藏量：{{ selectedKnowledge.starredCount }}</el-tag>
          <el-tag :type="getStatusType(selectedKnowledge.status)">
            {{ getStatusLabel(selectedKnowledge.status) }}
          </el-tag>
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
import { computed, onMounted, ref, watch } from 'vue'
import { Search, Plus, Clock, StarFilled, Edit, Check } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import {
  getKnowledgeBase,
  kbPublish,
  kbRepublish,
  kbSubmit,
  kbUnpublish,
  kbDeleteArticle
} from '@/mock-data/modules/kb'

const FAVORITE_KEY = 'intops_kb_my_favorites_v1'

const router = useRouter()
const userStore = useUserStore()

const knowledgeList = ref([])
const searchKeyword = ref('')
const filterStatus = ref('')
const filterCategory = ref('')
const favoriteOnly = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const selectedKnowledge = ref(null)
const favoriteIds = ref(new Set())

const parseFavoriteIds = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(FAVORITE_KEY) || '[]')
    if (!Array.isArray(raw)) return new Set()
    return new Set(raw.filter(Boolean))
  } catch {
    return new Set()
  }
}

const saveFavoriteIds = () => {
  localStorage.setItem(FAVORITE_KEY, JSON.stringify(Array.from(favoriteIds.value)))
}

const withFavoriteState = (list = []) => {
  return list.map((item) => ({
    ...item,
    starred: favoriteIds.value.has(item.id),
    starredCount: item.likeCount || 0
  }))
}

const loadKnowledge = async () => {
  const list = await getKnowledgeBase()
  knowledgeList.value = withFavoriteState(list)
}

const categoryOptions = computed(() => {
  const categories = Array.from(
    new Set(knowledgeList.value.map((item) => item.category).filter(Boolean))
  )
  return categories.map((item) => ({ label: item, value: item }))
})

const filteredKnowledge = computed(() => {
  let result = [...knowledgeList.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((item) => {
      const title = String(item.title || '').toLowerCase()
      const content = String(item.content || '').toLowerCase()
      return title.includes(keyword) || content.includes(keyword)
    })
  }

  if (filterStatus.value) {
    result = result.filter((item) => item.status === filterStatus.value)
  }

  if (filterCategory.value) {
    result = result.filter((item) => item.category === filterCategory.value)
  }

  if (favoriteOnly.value) {
    result = result.filter((item) => item.starred)
  }

  // 默认按最近更新时间排序
  result.sort((a, b) => {
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })

  return result
})

const pagedKnowledge = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredKnowledge.value.slice(start, start + pageSize.value)
})

watch(
  () => filteredKnowledge.value.length,
  (total) => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize.value))
    if (currentPage.value > maxPage) currentPage.value = maxPage
  }
)

watch(pageSize, () => {
  currentPage.value = 1
})

const pendingCount = computed(
  () => knowledgeList.value.filter((item) => item.status === 'pending').length
)
const publishedCount = computed(
  () => knowledgeList.value.filter((item) => item.status === 'published').length
)
const starredCount = computed(
  () => knowledgeList.value.filter((item) => item.starred).length
)
const draftCount = computed(
  () => knowledgeList.value.filter((item) => item.status === 'draft').length
)

const getStatusLabel = (status) => {
  const statusMap = {
    draft: '未提交',
    pending: '审批中',
    approved: '已审批通过',
    published: '已发布',
    offline: '已下线',
    rejected: '已驳回'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    draft: 'info',
    pending: 'warning',
    approved: 'primary',
    published: 'success',
    offline: 'info',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

const onSearch = () => {
  currentPage.value = 1
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  filterCategory.value = ''
  favoriteOnly.value = false
  currentPage.value = 1
}

const filterByStatus = (status) => {
  filterStatus.value = status
  favoriteOnly.value = false
  currentPage.value = 1
}

const filterByStarred = () => {
  favoriteOnly.value = true
  currentPage.value = 1
}

const goToCreate = () => {
  router.push({
    name: 'KbArticles',
    query: { create_from: 'my_knowledge' }
  })
}

const viewKnowledge = (item) => {
  selectedKnowledge.value = item
  detailVisible.value = true
}

const editKnowledge = (item) => {
  router.push({
    name: 'KbArticles',
    query: { open_id: item.id }
  })
}

const toggleStar = (item) => {
  if (favoriteIds.value.has(item.id)) favoriteIds.value.delete(item.id)
  else favoriteIds.value.add(item.id)
  saveFavoriteIds()
  knowledgeList.value = withFavoriteState(knowledgeList.value)
}

const handleMoreCommand = async (command, item) => {
  if (command === 'star') {
    toggleStar(item)
    return
  }
  if (command === 'submit') {
    await submitForApproval(item)
    return
  }
  if (command === 'publish') {
    await publishKnowledge(item)
    return
  }
  if (command === 'offline') {
    await offlineKnowledge(item)
    return
  }
  if (command === 'online') {
    await onlineKnowledge(item)
    return
  }
  if (command === 'delete') {
    await deleteKnowledge(item)
  }
}

const submitForApproval = async (item) => {
  try {
    await ElMessageBox.confirm(`确认提交《${item.title}》进行审核？`, '提交审核', { type: 'warning' })
    await kbSubmit(item.id, '来自“我的知识”提交审核', { by: userStore.name })
    ElMessage.success('提交成功')
    await loadKnowledge()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '提交失败')
    }
  }
}

const publishKnowledge = async (item) => {
  try {
    await ElMessageBox.confirm(`确认发布《${item.title}》？`, '发布知识', { type: 'warning' })
    await kbPublish(item.id, '来自“我的知识”发布', { by: userStore.name })
    ElMessage.success('发布成功')
    await loadKnowledge()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '发布失败')
    }
  }
}

const offlineKnowledge = async (item) => {
  try {
    await ElMessageBox.confirm(`确认下线《${item.title}》？`, '下线知识', { type: 'warning' })
    await kbUnpublish(item.id, '来自“我的知识”下线', { by: userStore.name })
    ElMessage.success('已下线')
    await loadKnowledge()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '下线失败')
    }
  }
}

const onlineKnowledge = async (item) => {
  try {
    await ElMessageBox.confirm(`确认上线《${item.title}》？`, '上线知识', { type: 'warning' })
    await kbRepublish(item.id, '来自“我的知识”上线', { by: userStore.name })
    ElMessage.success('已上线')
    await loadKnowledge()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '上线失败')
    }
  }
}

const deleteKnowledge = async (item) => {
  try {
    await ElMessageBox.confirm(`确认删除《${item.title}》？删除后不可恢复。`, '删除知识', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await kbDeleteArticle(item.id)
    if (favoriteIds.value.has(item.id)) {
      favoriteIds.value.delete(item.id)
      saveFavoriteIds()
    }
    ElMessage.success('删除成功')
    await loadKnowledge()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '删除失败')
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

onMounted(async () => {
  favoriteIds.value = parseFavoriteIds()
  await loadKnowledge()
})
</script>

<style scoped>
.my-knowledge {
  position: relative;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.14);
  border-color: rgba(37, 99, 235, 0.2);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.pending-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.published-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.starred-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.draft-icon {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: rgba(71, 85, 105, 0.82);
  margin-bottom: 4px;
}

.card-count {
  font-size: 24px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.92);
}

.filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.filter-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.filter-right {
  margin-left: auto;
}

.search-input {
  width: 280px;
}

.filter-select {
  width: 140px;
}

.create-btn {
  min-width: 108px;
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

.filter-select :deep(.el-select__wrapper),
.search-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  border: 1px solid rgba(191, 219, 254, 0.7);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.07);
}

.filter-select :deep(.el-select__wrapper.is-focused),
.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.35), 0 8px 20px rgba(37, 99, 235, 0.1);
}

.knowledge-list {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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

@media (max-width: 1200px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 860px) {
  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .filter-right {
    margin-left: 0;
    align-self: flex-end;
  }
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
}
</style>



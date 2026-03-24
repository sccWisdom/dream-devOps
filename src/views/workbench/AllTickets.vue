<template>
  <div class="container all-tickets">
    <div class="page-header">
      <div class="page-title">所有工单</div>
      <el-button type="primary" @click="exportTickets" class="export-btn">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
    </div>
    
    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索工单编号或标题"
        clearable
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
      
      <el-select v-model="filterServiceType" placeholder="服务类型" clearable class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="事件管理" value="事件管理" />
        <el-option label="问题管理" value="问题管理" />
        <el-option label="变更管理" value="变更管理" />
        <el-option label="发布管理" value="发布管理" />
        <el-option label="请求管理" value="请求管理" />
      </el-select>
      
      <el-select v-model="filterStatus" placeholder="状态" clearable class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="待提交" value="待提交" />
        <el-option label="处理中" value="处理中" />
        <el-option label="已完成" value="已完成" />
        <el-option label="已挂起" value="已挂起" />
      </el-select>
      
      <el-select v-model="filterPriority" placeholder="优先级" clearable class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="P0" value="P0" />
        <el-option label="P1" value="P1" />
        <el-option label="P2" value="P2" />
        <el-option label="P3" value="P3" />
      </el-select>
    </div>
    
    <el-table 
      :data="paginatedTickets" 
      border 
      class="ticket-table"
      v-model:selection="selectedTickets"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="id" label="单号" width="180" />
      <el-table-column prop="title" label="工单名称" min-width="200" />
      <el-table-column prop="type" label="服务类型" width="120" />
      <el-table-column prop="progressStatus" label="当前进度" width="120">
        <template #default="scope">
          <span :class="['progress-status-tag', getProgressStatusClass(scope.row.progressStatus)]">
            {{ scope.row.progressStatus }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="assignee" label="当前处置人" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <span :class="['status-tag', getStatusClass(scope.row.status)]">
            {{ scope.row.status }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="requester" label="提单人" width="120" />
      <el-table-column prop="createdAt" label="提交时间" width="180" />
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewDetails(scope.row)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredTickets.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Download } from '@element-plus/icons-vue'
import { getAllTickets } from '../../mock-data/modules/ticket'

const searchKeyword = ref('')
const filterServiceType = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const allTickets = ref([])
const selectedTickets = ref([])

onMounted(async () => {
  allTickets.value = await getAllTickets()
})

const filteredTickets = computed(() => {
  let result = [...allTickets.value]
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(ticket => 
      ticket.id.toLowerCase().includes(keyword) || 
      ticket.title.toLowerCase().includes(keyword)
    )
  }
  
  // 服务类型过滤
  if (filterServiceType.value) {
    result = result.filter(ticket => ticket.type === filterServiceType.value)
  }
  
  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(ticket => ticket.status === filterStatus.value)
  }
  
  // 优先级过滤
  if (filterPriority.value) {
    result = result.filter(ticket => ticket.priority === filterPriority.value)
  }
  
  return result
})

const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTickets.value.slice(start, end)
})

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}





const getProgressStatusClass = (status) => {
  const statusMap = {
    '待分配': 'status-pending',
    '一线运维处理': 'status-processing',
    '二线运维处理': 'status-processing',
    '发起人验证': 'status-verifying',
    '已完成': 'status-completed'
  }
  return statusMap[status] || 'status-pending'
}

const getStatusClass = (status) => {
  const statusMap = {
    '待提交': 'pending',
    '处理中': 'processing',
    '已挂起': 'resolved',
    '已完成': 'completed'
  }
  return statusMap[status] || 'processing'
}

const viewDetails = (ticket) => {
  // 这里可以实现查看工单详情的逻辑
  console.log('查看工单详情:', ticket)
}

const handleSelectionChange = (selection) => {
  selectedTickets.value = selection
}

const exportTickets = () => {
  if (selectedTickets.value.length === 0) {
    alert('请先选择要导出的工单！')
    return
  }
  // 这里可以实现导出工单的逻辑
  console.log('导出工单:', selectedTickets.value)
  // 模拟导出成功
  alert(`成功导出 ${selectedTickets.value.length} 条工单记录！`)
}
</script>

<style scoped>
.all-tickets {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 300px;
}

.filter-select {
  width: 140px;
}

.ticket-table {
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.ticket-table :deep(.el-table__header-wrapper) {
  background: #f8fafc;
}

.ticket-table :deep(.el-table__header-wrapper th) {
  font-weight: 600;
  color: #334155;
}

.progress-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.progress-text {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.progress-status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.progress-status-tag.status-pending {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.progress-status-tag.status-processing {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
  border: 1px solid rgba(124, 58, 237, 0.2);
}

.progress-status-tag.status-verifying {
  background: rgba(245, 158, 11, 0.1);
  color: #ea580c;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.progress-status-tag.status-completed {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.priority-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.priority-tag.p1 {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.priority-tag.p2 {
  background: rgba(245, 158, 11, 0.1);
  color: #ea580c;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.priority-tag.p3 {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.pending {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.status-tag.processing {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
  border: 1px solid rgba(124, 58, 237, 0.2);
}

.status-tag.resolved {
  background: rgba(245, 158, 11, 0.1);
  color: #ea580c;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.status-tag.completed {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 1200px) {
  .filter-bar {
    flex-wrap: wrap;
  }
  
  .search-input {
    min-width: 250px;
  }
  
  .filter-select {
    width: 120px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    min-width: unset;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .all-tickets {
    padding: 12px;
  }
}
</style>
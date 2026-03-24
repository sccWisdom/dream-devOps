<template>
  <div class="ticket-workflow">
    <!-- 资源列表部分 -->
    <div class="resource-list">
      <div class="list-header">
        <h2>服务配置列表</h2>
        <div class="header-actions">
          <el-input v-model="searchQuery" placeholder="请输入服务名称" class="search-input">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="createNew">+ 新建</el-button>
        </div>
      </div>
      <el-table :data="resourceList" style="width: 100%">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="序号" width="80" />
        <el-table-column prop="name" label="服务名称" width="160" />
        <el-table-column prop="type" label="服务类型" width="140" />
        <el-table-column prop="protocol" label="服务协议" width="150" />
        <el-table-column prop="priority" label="推荐优先级" width="120" />
        <el-table-column prop="owner" label="负责人" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="online"
              inactive-value="offline"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="280">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" text size="small" @click="editResource(scope.row)">编辑</el-button>
              <el-button type="primary" size="small" @click="enterEditor(scope.row)">服务配置</el-button>
              <el-button size="small" @click="deleteResource(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="新增工单流程"
      width="700px"
    >
      <el-form :model="formData" label-width="120px">
        <el-form-item label="服务名称" required>
          <el-input v-model="formData.name" placeholder="请输入服务名称" />
        </el-form-item>
        <el-form-item label="服务描述" required>
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入服务描述"
            rows="3"
          />
        </el-form-item>
        <el-form-item label="服务类型" required>
          <el-select v-model="formData.type" placeholder="请选择服务类型">
            <el-option label="事件管理" value="事件管理" />
            <el-option label="问题管理" value="问题管理" />
            <el-option label="变更管理" value="变更管理" />
            <el-option label="发布管理" value="发布管理" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务协议" required>
          <el-select v-model="formData.protocol" placeholder="请选择服务协议">
            <el-option label="报障单服务协议" value="报障单服务协议" />
            <el-option label="问题单服务协议" value="问题单服务协议" />
            <el-option label="变更单服务协议" value="变更单服务协议" />
            <el-option label="发布单服务协议" value="发布单服务协议" />
          </el-select>
        </el-form-item>
        <el-form-item label="推荐优先级" required>
          <el-select v-model="formData.priority" placeholder="请选择推荐优先级">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" required>
          <el-input v-model="formData.owner" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="服务配置">
          <el-button type="primary" @click="goToFormConfig">进入配置</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="saveForm">保存</el-button>
          <el-button type="success" @click="saveAndOnline">保存并上线</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Grid,
  Edit,
  ArrowDown,
  Document,
  Reading,
  Menu,
  DataAnalysis,
  Refresh,
  Operation,
  Upload,
  VideoPlay,
  VideoPause,
  User,
  Monitor,
  Connection,
  ChatDotSquare,
  Stamp,
  ZoomIn,
  ZoomOut,
  Link,
  Operation as SOperation
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const resourceList = ref([])
const dialogVisible = ref(false)
const formData = ref({
  name: '',
  description: '',
  type: '',
  protocol: '',
  priority: '',
  owner: '',
  category: '',
  path: '',
  identifier: ''
})

// 模拟数据
const mockResources = [
  {
    id: 1,
    name: '故障单服务流程',
    type: '事件管理',
    category: 'fault',
    creator: '运维经理',
    createTime: '2025-08-25 10:04',
    owner: '运维经理',
    status: 'online',
    description: '处理故障单的流程',
    protocol: '报障单服务协议',
    priority: '高'
  },
  {
    id: 2,
    name: '问题单服务流程',
    type: '问题管理',
    category: 'problem',
    creator: '运维经理',
    createTime: '2025-10-20 13:15',
    owner: '运维经理',
    status: 'online',
    description: '问题处理',
    protocol: '问题单服务协议',
    priority: '中'
  },
  {
    id: 3,
    name: '平台交维服务流程',
    type: '变更管理',
    category: 'change',
    creator: '运维经理',
    createTime: '2025-11-03 09:04',
    owner: '运维经理',
    status: 'online',
    description: '处理系统变更的流程',
    protocol: '平台交维服务协议',
    priority: '中'
  },
  {
    id: 4,
    name: '发布单服务流程',
    type: '发布管理',
    category: 'publish',
    creator: '运维经理',
    createTime: '2025-11-04 14:43',
    owner: '运维经理',
    status: 'online',
    description: '处理系统发布的流程',
    protocol: '发布单服务协议',
    priority: '高'
  },
  {
    id: 5,
    name: '数据交维服务流程',
    type: '变更管理',
    category: 'quality',
    creator: '运维经理',
    createTime: '2026-01-28 13:52',
    owner: '运维经理',
    status: 'online',
    description: '处理质量问题的流程',
    protocol: '数据交维服务协议',
    priority: '低'
  }
]

// 方法
const createNew = () => {
  // 重置表单数据
  formData.value = {
    id: null,
    name: '',
    description: '',
    type: '',
    protocol: '',
    priority: '',
    owner: '',
    category: '',
    path: '',
    identifier: ''
  }
  // 打开表单
  dialogVisible.value = true
}

const editResource = (row) => {
  // 填充表单数据
  formData.value = {
    ...row
  }
  // 打开表单
  dialogVisible.value = true
}

const enterEditor = (row) => {
  router.push(`/dashboard/ticket-workflow/edit/${row.id}`)
}

const deleteResource = (row) => {
  // 删除资源
  ElMessage.info('删除资源')
}

const saveForm = () => {
  if (formData.value.id) {
    // 编辑模式
    const index = resourceList.value.findIndex(item => item.id === formData.value.id)
    if (index !== -1) {
      resourceList.value[index] = {
        ...resourceList.value[index],
        name: formData.value.name,
        description: formData.value.description,
        type: formData.value.type,
        protocol: formData.value.protocol,
        priority: formData.value.priority,
        owner: formData.value.owner,
        category: formData.value.category || formData.value.name.toLowerCase(),
        path: formData.value.path || `wohub/op/operation/module/${formData.value.name.toLowerCase()}`,
        identifier: formData.value.identifier || `wohub.operation.module.${formData.value.name.toLowerCase()}`
      }
      ElMessage.success('编辑成功')
    }
  } else {
    // 新增模式
    const newId = resourceList.value.length + 1
    const newResource = {
      id: newId,
      name: formData.value.name,
      identifier: formData.value.identifier || `wohub.operation.module.${formData.value.name.toLowerCase()}`,
      type: formData.value.type,
      category: formData.value.category || formData.value.name.toLowerCase(),
      path: formData.value.path || `wohub/op/operation/module/${formData.value.name.toLowerCase()}`,
      creator: '当前用户',
      createTime: new Date().toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      description: formData.value.description,
      protocol: formData.value.protocol,
      priority: formData.value.priority,
      owner: formData.value.owner,
      status: 'offline'
    }
    resourceList.value.push(newResource)
    ElMessage.success('保存成功')
  }
  dialogVisible.value = false
}

const saveAndOnline = () => {
  if (formData.value.id) {
    // 编辑模式
    const index = resourceList.value.findIndex(item => item.id === formData.value.id)
    if (index !== -1) {
      resourceList.value[index] = {
        ...resourceList.value[index],
        name: formData.value.name,
        description: formData.value.description,
        type: formData.value.type,
        protocol: formData.value.protocol,
        priority: formData.value.priority,
        owner: formData.value.owner,
        category: formData.value.category || formData.value.name.toLowerCase(),
        path: formData.value.path || `wohub/op/operation/module/${formData.value.name.toLowerCase()}`,
        identifier: formData.value.identifier || `wohub.operation.module.${formData.value.name.toLowerCase()}`,
        status: 'online'
      }
      ElMessage.success('编辑并上线成功')
    }
  } else {
    // 新增模式
    const newId = resourceList.value.length + 1
    const newResource = {
      id: newId,
      name: formData.value.name,
      identifier: formData.value.identifier || `wohub.operation.module.${formData.value.name.toLowerCase()}`,
      type: formData.value.type,
      category: formData.value.category || formData.value.name.toLowerCase(),
      path: formData.value.path || `wohub/op/operation/module/${formData.value.name.toLowerCase()}`,
      creator: '当前用户',
      createTime: new Date().toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      description: formData.value.description,
      protocol: formData.value.protocol,
      priority: formData.value.priority,
      owner: formData.value.owner,
      status: 'online'
    }
    resourceList.value.push(newResource)
    ElMessage.success('保存并上线成功')
  }
  dialogVisible.value = false
}

const goToFormConfig = () => {
  // 跳转到表单流程配置页面
  router.push('/dashboard/ticket-workflow/edit/new')
}

const handleStatusChange = (row) => {
  // 处理状态切换
  const statusText = row.status === 'online' ? '已上线' : '未上线'
  ElMessage.success(`已将 ${row.name} 状态修改为 ${statusText}`)
}

// 生命周期
onMounted(() => {
  // 加载资源列表
  resourceList.value = mockResources
})
</script>

<style scoped>
.ticket-workflow {
  padding: 20px;
}

.resource-list {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 300px;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  white-space: nowrap;
}

/* 表格响应式调整 */
@media (max-width: 1400px) {
  .el-table {
    font-size: 13px;
  }
  
  .el-table-column {
    &[width="160"] {
      width: 140px !important;
    }
    
    &[width="180"] {
      width: 160px !important;
    }
    
    &[width="130"] {
      width: 110px !important;
    }
    
    &[width="120"] {
      width: 100px !important;
    }
    
    &[width="280"] {
      width: 240px !important;
    }
  }
  
  .search-input {
    width: 250px;
  }
}

@media (max-width: 1200px) {
  .el-table-column {
    &[width="140"] {
      width: 120px !important;
    }
    
    &[width="160"] {
      width: 140px !important;
    }
    
    &[width="110"] {
      width: 90px !important;
    }
    
    &[width="100"] {
      width: 80px !important;
    }
    
    &[width="240"] {
      width: 200px !important;
    }
  }
  
  .search-input {
    width: 200px;
  }
  
  .action-buttons {
    gap: 6px;
  }
  
  .action-buttons .el-button {
    font-size: 12px;
    padding: 4px 8px;
  }
}

@media (max-width: 1024px) {
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-input {
    flex: 1;
    min-width: 200px;
  }
  
  .el-table-column {
    &[width="120"] {
      width: 100px !important;
    }
    
    &[width="140"] {
      width: 120px !important;
    }
    
    &[width="200"] {
      width: 160px !important;
    }
  }
}

@media (max-width: 768px) {
  .ticket-workflow {
    padding: 10px;
  }
  
  .resource-list {
    padding: 10px;
  }
  
  .list-header h2 {
    font-size: 16px;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .el-table {
    font-size: 12px;
  }
  
  .el-table-column {
    &[width="100"] {
      width: 80px !important;
    }
    
    &[width="120"] {
      width: 100px !important;
    }
    
    &[width="160"] {
      width: 120px !important;
    }
    
    &[width="160"] {
      width: 120px !important;
    }
    
    &[width="180"] {
      width: 140px !important;
    }
    
    &[width="280"] {
      width: 160px !important;
    }
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .action-buttons .el-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
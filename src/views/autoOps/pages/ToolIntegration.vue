<template>
  <div class="container">
    <div class="page-title">工具集成</div>
    
    <el-tabs>
      <el-tab-pane label="运维工具管理">
        <el-card shadow="never">
          <el-row :gutter="16" style="margin-bottom: 16px">
            <el-col :span="12" class="text-left">
              <el-input v-model="toolFilter" placeholder="搜索工具" style="width: 350px" />
            </el-col>
            <el-col :span="12" class="text-right">
              <el-button type="primary" @click="openToolEditor">添加工具</el-button>
              <el-button @click="batchDeleteTool">批量删除</el-button>
            </el-col>
          </el-row>
          <el-table :data="filteredTools" border @selection-change="handleToolSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="工具名称"  />
            <el-table-column prop="type" label="工具类型" width="120" />
            <el-table-column prop="version" label="版本" width="100" />
            <el-table-column prop="status" label="状态" width="150">
              <template #default="scope">
                <el-tag :type="scope.row.status === '启用' ? 'success' : 'danger'">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template #default="scope">
                <el-space>
                  <el-button size="small" @click="editTool(scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteTool(scope.row.id)">删除</el-button>
                  <el-button size="small" @click="useTool(scope.row)">使用</el-button>
                </el-space>
              </template>
            </el-table-column>
          </el-table>
          <div style="display: flex; justify-content: flex-end; margin-top: 16px">
            <el-pagination
              v-model:current-page="toolPage.current"
              v-model:page-size="toolPage.size"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredTools.length"
            />
          </div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="工具使用记录">
        <el-card shadow="never">
          <el-row :gutter="16" style="margin-bottom: 16px">
            <el-col :span="12" class="text-left">
              <el-input v-model="recordFilter" placeholder="搜索记录" style="width: 350px" />
            </el-col>
            <el-col :span="12" class="text-right">
              <el-button type="primary" @click="refreshRecords">刷新</el-button>
            </el-col>
          </el-row>
          <el-table :data="filteredRecords" border>
            <el-table-column prop="toolName" label="工具名称" />
            <el-table-column prop="operator" label="操作人" width="120" />
            <el-table-column prop="operateTime" label="操作时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button size="small" @click="viewRecordDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="display: flex; justify-content: flex-end; margin-top: 16px">
            <el-pagination
              v-model:current-page="recordPage.current"
              v-model:page-size="recordPage.size"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredRecords.length"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 工具编辑弹窗 -->
    <el-dialog v-model="toolDialogVisible" :title="isEditingTool ? '编辑工具' : '添加工具'" width="500px">
      <el-form :model="toolForm" label-width="100px">
        <el-form-item label="工具名称" required>
          <el-input v-model="toolForm.name" placeholder="请输入工具名称" />
        </el-form-item>
        <el-form-item label="工具类型" required>
          <el-select v-model="toolForm.type">
            <el-option label="远程连接" value="远程连接" />
            <el-option label="日志查询" value="日志查询" />
            <el-option label="性能分析" value="性能分析" />
            <el-option label="配置管理" value="配置管理" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本" required>
          <el-input v-model="toolForm.version" placeholder="例如：1.0.0" />
        </el-form-item>
        <el-form-item label="工具路径" required>
          <el-input v-model="toolForm.path" placeholder="请输入工具路径或URL" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="toolForm.status">
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="toolForm.description" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="toolDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTool">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 工具使用弹窗 -->
    <el-dialog v-model="useToolDialogVisible" :title="`使用 ${currentTool.name}`" width="600px">
      <el-form :model="useToolForm" label-width="100px">
        <el-form-item label="目标主机" required>
          <el-input v-model="useToolForm.host" placeholder="请输入主机地址" />
        </el-form-item>
        <el-form-item label="端口" required>
          <el-input v-model.number="useToolForm.port" placeholder="请输入端口" />
        </el-form-item>
        <el-form-item label="参数">
          <el-input v-model="useToolForm.params" type="textarea" rows="3" placeholder="请输入工具参数" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="useToolDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="executeTool">执行</el-button>
      </template>
    </el-dialog>
    
    <!-- 记录详情弹窗 -->
    <el-dialog v-model="recordDetailDialogVisible" title="使用记录详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="工具名称">{{ currentRecord.toolName }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentRecord.operator }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ currentRecord.operateTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentRecord.status }}</el-descriptions-item>
        <el-descriptions-item label="执行参数">{{ currentRecord.params || '-' }}</el-descriptions-item>
        <el-descriptions-item label="执行结果">
          <pre class="result-content">{{ currentRecord.result || '-' }}</pre>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="recordDetailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'

// 状态管理
const tools = ref([
  { id: '1', name: 'SSH远程连接', type: '远程连接', version: '1.0.0', path: '/usr/bin/ssh', status: '启用', description: 'SSH远程连接工具' },
  { id: '2', name: 'LogViewer', type: '日志查询', version: '2.1.0', path: 'http://localhost:8080/logviewer', status: '启用', description: '日志查看工具' },
  { id: '3', name: 'Top', type: '性能分析', version: '3.0.0', path: '/usr/bin/top', status: '启用', description: '系统性能分析工具' },
  { id: '4', name: 'ConfigManager', type: '配置管理', version: '1.5.0', path: 'http://localhost:8080/config', status: '禁用', description: '配置管理工具' }
])

const records = ref([
  { id: '1', toolName: 'SSH远程连接', operator: 'admin', operateTime: '2026-03-19 09:30:00', status: '成功', params: '192.168.1.100 -p 22', result: '连接成功' },
  { id: '2', toolName: 'LogViewer', operator: 'user1', operateTime: '2026-03-19 10:15:00', status: '成功', params: 'app.log -t error', result: '查询到10条错误日志' },
  { id: '3', toolName: 'Top', operator: 'admin', operateTime: '2026-03-19 11:00:00', status: '成功', params: '-c', result: 'CPU使用率: 25%, 内存使用率: 60%' },
  { id: '4', toolName: 'SSH远程连接', operator: 'user2', operateTime: '2026-03-19 14:20:00', status: '失败', params: '192.168.1.200 -p 22', result: '连接超时' }
])

// 分页管理
const toolPage = ref({ current: 1, size: 10 })
const recordPage = ref({ current: 1, size: 10 })

// 筛选条件
const toolFilter = ref('')
const recordFilter = ref('')

// 选择管理
const selectedTools = ref([])

// 弹窗管理
const toolDialogVisible = ref(false)
const useToolDialogVisible = ref(false)
const recordDetailDialogVisible = ref(false)
const isEditingTool = ref(false)

// 当前操作的工具和记录
const currentTool = ref({})
const currentRecord = ref({})

// 表单数据
const toolForm = ref({
  id: '',
  name: '',
  type: '远程连接',
  version: '1.0.0',
  path: '',
  status: '启用',
  description: ''
})

const useToolForm = ref({
  host: '',
  port: '',
  params: ''
})

// 计算属性
const filteredTools = computed(() => {
  return tools.value.filter(tool => 
    tool.name.toLowerCase().includes(toolFilter.value.toLowerCase()) ||
    tool.type.toLowerCase().includes(toolFilter.value.toLowerCase())
  )
})

const filteredRecords = computed(() => {
  return records.value.filter(record => 
    record.toolName.toLowerCase().includes(recordFilter.value.toLowerCase()) ||
    record.operator.toLowerCase().includes(recordFilter.value.toLowerCase())
  )
})

// 方法
const handleToolSelectionChange = (val) => {
  selectedTools.value = val
}

const openToolEditor = () => {
  isEditingTool.value = false
  toolForm.value = {
    id: '',
    name: '',
    type: '远程连接',
    version: '1.0.0',
    path: '',
    status: '启用',
    description: ''
  }
  toolDialogVisible.value = true
}

const editTool = (tool) => {
  isEditingTool.value = true
  toolForm.value = { ...tool }
  toolDialogVisible.value = true
}

const saveTool = () => {
  if (isEditingTool.value) {
    const index = tools.value.findIndex(tool => tool.id === toolForm.value.id)
    if (index !== -1) {
      tools.value[index] = toolForm.value
    }
  } else {
    tools.value.push({
      ...toolForm.value,
      id: Date.now().toString()
    })
  }
  toolDialogVisible.value = false
}

const deleteTool = (id) => {
  tools.value = tools.value.filter(tool => tool.id !== id)
}

const batchDeleteTool = () => {
  const ids = selectedTools.value.map(tool => tool.id)
  tools.value = tools.value.filter(tool => !ids.includes(tool.id))
  selectedTools.value = []
}

const useTool = (tool) => {
  currentTool.value = tool
  useToolForm.value = {
    host: '',
    port: '',
    params: ''
  }
  useToolDialogVisible.value = true
}

const executeTool = () => {
  // 模拟工具执行
  records.value.unshift({
    id: Date.now().toString(),
    toolName: currentTool.value.name,
    operator: '当前用户',
    operateTime: new Date().toLocaleString(),
    status: '成功',
    params: `主机: ${useToolForm.value.host}, 端口: ${useToolForm.value.port}, 参数: ${useToolForm.value.params}`,
    result: '执行成功'
  })
  useToolDialogVisible.value = false
}

const viewRecordDetail = (record) => {
  currentRecord.value = record
  recordDetailDialogVisible.value = true
}

const refreshRecords = () => {
  // 模拟刷新记录
  console.log('刷新记录')
}
</script>
<style scoped>
.container {
  padding: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.result-content {
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}
</style>
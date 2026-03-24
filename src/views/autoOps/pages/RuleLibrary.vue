<template>
  <div class="container">
    <div class="page-title">处置规则库</div>
    
    <!-- 主要内容区域 -->
    <el-tabs v-model="activeTab">
      <!-- 处置规则 -->
      <el-tab-pane label="处置规则" name="rules">
        <el-card shadow="never">
          <el-row :gutter="16" style="margin-bottom: 16px">
            <el-col :span="12" class="text-left">
              <el-space>
                <el-input v-model="ruleFilter" placeholder="搜索规则" style="width: 350px" />
              </el-space>
            </el-col>
            <el-col :span="12" class="text-right">
              <el-space>
                <el-button type="primary" @click="openRuleEditor">新建规则</el-button>
                <el-button @click="batchEnableRules">批量启用</el-button>
                <el-button @click="batchDisableRules">批量禁用</el-button>
              </el-space>
            </el-col>
          </el-row>
          <el-table :data="filteredRules" border @selection-change="handleRuleSelectionChange" @row-click="viewRuleDetail">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="规则名称" />
            <el-table-column prop="trigger" label="触发条件" width="200" />
            <el-table-column prop="action" label="处置动作" />
            <el-table-column prop="condition" label="执行条件" width="180" />
            <el-table-column prop="fallback" label="异常兜底策略" width="140" />
            <el-table-column prop="scope" label="适用范围" width="130" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-space :separator="''">
                  <el-button size="small" @click.stop="editRule(scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click.stop="confirmDelete('rule', scope.row.id)">删除</el-button>
                </el-space>
              </template>
            </el-table-column>
          </el-table>
          <div style="display: flex; justify-content: flex-end; margin-top: 16px">
            <el-pagination
              v-model:current-page="rulePage.current"
              v-model:page-size="rulePage.size"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredRules.length"
            />
          </div>
        </el-card>
      </el-tab-pane>
      
      <!-- 脚本库 -->
      <el-tab-pane label="脚本库" name="scripts">
        <el-card shadow="never">
          <el-row :gutter="16" style="margin-bottom: 16px">
            <el-col :span="12" class="text-left">
              <el-space>
                <el-input v-model="scriptFilter" placeholder="搜索脚本" style="width: 350px" />
                <el-select v-model="scriptTypeFilter" placeholder="脚本类型" style="width: 120px">
                  <el-option label="全部" value="" />
                  <el-option label="Shell" value="Shell" />
                  <el-option label="Python" value="Python" />
                  <el-option label="Bat" value="Bat" />
                </el-select>
              </el-space>
            </el-col>
            <el-col :span="12" class="text-right">
              <el-space>
                <el-button type="primary" @click="openScriptEditor">新增脚本</el-button>
                <el-button @click="batchDeleteScripts">批量删除</el-button>
              </el-space>
            </el-col>
          </el-row>
          <el-table :data="filteredScripts" border @selection-change="handleScriptSelectionChange" @row-click="viewScriptDetail">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="脚本名称" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="version" label="版本" width="100" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-space :separator="''">
                  <el-button size="small" @click.stop="editScript(scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click.stop="confirmDelete('script', scope.row.id)">删除</el-button>
                </el-space>
              </template>
            </el-table-column>
          </el-table>
          <div style="display: flex; justify-content: flex-end; margin-top: 16px">
            <el-pagination
              v-model:current-page="scriptPage.current"
              v-model:page-size="scriptPage.size"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredScripts.length"
            />
          </div>
        </el-card>
      </el-tab-pane>
      
      <!-- 执行历史 -->
      <el-tab-pane label="执行历史" name="history">
        <el-card shadow="never">
          <el-row :gutter="16" style="margin-bottom: 16px">
            <el-col :span="12" class="text-left">
              <el-space>
                <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
                <el-select v-model="executionStatusFilter" placeholder="执行状态" style="width: 120px">
                  <el-option label="全部" value="" />
                  <el-option label="成功" value="成功" />
                  <el-option label="失败" value="失败" />
                  <el-option label="执行中" value="执行中" />
                </el-select>
                <el-input v-model="historyFilter" placeholder="搜索规则名称" style="width: 350px" />
              </el-space>
            </el-col>
            <el-col :span="12" class="text-right">
              <el-button type="primary" @click="refreshHistory">刷新</el-button>
            </el-col>
          </el-row>
          <el-table :data="filteredHistory" border @row-click="viewExecutionDetail">
            <el-table-column prop="ruleName" label="规则名称" />
            <el-table-column prop="triggerTime" label="触发时间" width="180" />
            <el-table-column prop="executeTime" label="执行时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="执行时长" width="100" />
            <el-table-column prop="operator" label="操作人" width="120" />

          </el-table>
          <div style="display: flex; justify-content: flex-end; margin-top: 16px">
            <el-pagination
              v-model:current-page="historyPage.current"
              v-model:page-size="historyPage.size"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredHistory.length"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 规则编辑弹窗 -->
    <el-dialog v-model="ruleDialogVisible" :title="isEditingRule ? '编辑规则' : '新建规则'" width="600px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="规则名称" required>
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="触发条件" required>
          <el-input v-model="ruleForm.trigger" placeholder="例如：CPU>85% 5m" />
        </el-form-item>
        <el-form-item label="执行条件">
          <el-input v-model="ruleForm.condition" placeholder="例如：时间范围 00:00-24:00" />
        </el-form-item>
        <el-form-item label="处置动作" required>
          <el-input v-model="ruleForm.action" placeholder="例如：扩容 Deployment" />
        </el-form-item>
        <el-form-item label="异常兜底策略">
          <el-input v-model="ruleForm.fallback" placeholder="例如：发送告警通知" />
        </el-form-item>
        <el-form-item label="适用范围">
          <el-input v-model="ruleForm.scope" placeholder="例如：所有服务器" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="ruleForm.status">
            <el-option label="启用" value="启用" />
            <el-option label="灰度" value="灰度" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="ruleForm.description" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 脚本编辑弹窗 -->
    <el-dialog v-model="scriptDialogVisible" :title="isEditingScript ? '编辑脚本' : '上传脚本'" width="600px">
      <el-form :model="scriptForm" label-width="100px">
        <el-form-item label="脚本名称" required>
          <el-input v-model="scriptForm.name" placeholder="请输入脚本名称" />
        </el-form-item>
        <el-form-item label="脚本类型" required>
          <el-select v-model="scriptForm.type">
            <el-option label="Shell" value="Shell" />
            <el-option label="Python" value="Python" />
            <el-option label="Bat" value="Bat" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本" required>
          <el-input v-model="scriptForm.version" placeholder="例如：1.0.0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="scriptForm.description" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="脚本内容">
          <el-input v-model="scriptForm.content" type="textarea" rows="6" placeholder="请输入脚本内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scriptDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveScript">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" :title="detailTitle" width="700px">
      <div v-if="detailType === 'rule'" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="规则名称">{{ detailData.name }}</el-descriptions-item>
          <el-descriptions-item label="触发条件">{{ detailData.trigger }}</el-descriptions-item>
          <el-descriptions-item label="执行条件">{{ detailData.condition || '-' }}</el-descriptions-item>
          <el-descriptions-item label="处置动作">{{ detailData.action }}</el-descriptions-item>
          <el-descriptions-item label="异常兜底策略">{{ detailData.fallback || '-' }}</el-descriptions-item>
          <el-descriptions-item label="适用范围">{{ detailData.scope || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ detailData.status }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ detailData.description || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div v-else-if="detailType === 'script'" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="脚本名称">{{ detailData.name }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ detailData.type }}</el-descriptions-item>
          <el-descriptions-item label="版本">{{ detailData.version }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ detailData.description || '-' }}</el-descriptions-item>
          <el-descriptions-item label="脚本内容">
            <pre class="script-content">{{ detailData.content || '-' }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div v-else-if="detailType === 'execution'" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="规则名称">{{ detailData.ruleName }}</el-descriptions-item>
          <el-descriptions-item label="触发时间">{{ detailData.triggerTime }}</el-descriptions-item>
          <el-descriptions-item label="执行时间">{{ detailData.executeTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ detailData.status }}</el-descriptions-item>
          <el-descriptions-item label="执行时长">{{ detailData.duration }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ detailData.operator }}</el-descriptions-item>
          <el-descriptions-item label="执行结果">
            <pre class="execution-result">{{ detailData.result || '-' }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { getRules, getScripts, getExecutionHistory } from '../../../mock-data/modules/autoops'

// 状态管理
const activeTab = ref('rules')
const rules = ref([])
const scripts = ref([])
const executionHistory = ref([])

// 分页管理
const rulePage = ref({ current: 1, size: 10 })
const scriptPage = ref({ current: 1, size: 10 })
const historyPage = ref({ current: 1, size: 10 })

// 筛选条件
const ruleFilter = ref('')
const scriptFilter = ref('')
const scriptTypeFilter = ref('')
const historyFilter = ref('')
const executionStatusFilter = ref('')
const dateRange = ref([])

// 选择管理
const selectedRules = ref([])
const selectedScripts = ref([])

// 弹窗管理
const ruleDialogVisible = ref(false)
const scriptDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEditingRule = ref(false)
const isEditingScript = ref(false)
const detailTitle = ref('')
const detailType = ref('')
const detailData = ref({})

// 表单数据
const ruleForm = ref({
  id: '',
  name: '',
  trigger: '',
  condition: '',
  action: '',
  fallback: '',
  scope: '',
  status: '启用',
  description: ''
})

const scriptForm = ref({
  id: '',
  name: '',
  type: 'Shell',
  version: '1.0.0',
  description: '',
  content: ''
})

// 计算属性
const filteredRules = computed(() => {
  return rules.value.filter(rule => 
    rule.name.toLowerCase().includes(ruleFilter.value.toLowerCase())
  )
})

const filteredScripts = computed(() => {
  return scripts.value.filter(script => 
    script.name.toLowerCase().includes(scriptFilter.value.toLowerCase()) &&
    (scriptTypeFilter.value ? script.type === scriptTypeFilter.value : true)
  )
})

const filteredHistory = computed(() => {
  return executionHistory.value.filter(item => {
    const matchesFilter = item.ruleName.toLowerCase().includes(historyFilter.value.toLowerCase())
    const matchesStatus = executionStatusFilter.value ? item.status === executionStatusFilter.value : true
    return matchesFilter && matchesStatus
  })
})

// 方法
const getStatusType = (status) => {
  switch (status) {
    case '启用':
    case '成功':
      return 'success'
    case '灰度':
    case '执行中':
      return 'warning'
    case '停用':
    case '失败':
      return 'danger'
    default:
      return ''
  }
}

const handleRuleSelectionChange = (val) => {
  selectedRules.value = val
}

const handleScriptSelectionChange = (val) => {
  selectedScripts.value = val
}

const openRuleEditor = () => {
  isEditingRule.value = false
  ruleForm.value = {
    id: '',
    name: '',
    trigger: '',
    condition: '',
    action: '',
    fallback: '',
    scope: '',
    status: '启用',
    description: ''
  }
  ruleDialogVisible.value = true
}

const editRule = (rule) => {
  isEditingRule.value = true
  ruleForm.value = { ...rule }
  ruleDialogVisible.value = true
}

const saveRule = () => {
  if (isEditingRule.value) {
    const index = rules.value.findIndex(r => r.id === ruleForm.value.id)
    if (index !== -1) {
      rules.value[index] = { ...ruleForm.value, updateTime: new Date().toLocaleString() }
    }
  } else {
    rules.value.push({
      ...ruleForm.value,
      id: Date.now().toString()
    })
  }
  ruleDialogVisible.value = false
}

const deleteRule = (id) => {
  rules.value = rules.value.filter(r => r.id !== id)
}

const batchEnableRules = () => {
  selectedRules.value.forEach(rule => {
    rule.status = '启用'
    rule.updateTime = new Date().toLocaleString()
  })
  selectedRules.value = []
}

const batchDisableRules = () => {
  selectedRules.value.forEach(rule => {
    rule.status = '停用'
    rule.updateTime = new Date().toLocaleString()
  })
  selectedRules.value = []
}

const openScriptEditor = () => {
  isEditingScript.value = false
  scriptForm.value = {
    id: '',
    name: '',
    type: 'Shell',
    version: '1.0.0',
    description: '',
    content: ''
  }
  scriptDialogVisible.value = true
}

const editScript = (script) => {
  isEditingScript.value = true
  scriptForm.value = { ...script }
  scriptDialogVisible.value = true
}

const saveScript = () => {
  if (isEditingScript.value) {
    const index = scripts.value.findIndex(s => s.id === scriptForm.value.id)
    if (index !== -1) {
      scripts.value[index] = { ...scriptForm.value, updateTime: new Date().toLocaleString() }
    }
  } else {
    scripts.value.push({
      ...scriptForm.value,
      id: Date.now().toString()
    })
  }
  scriptDialogVisible.value = false
}

const deleteScript = (id) => {
  scripts.value = scripts.value.filter(s => s.id !== id)
}

const batchDeleteScripts = () => {
  const ids = selectedScripts.value.map(s => s.id)
  scripts.value = scripts.value.filter(s => !ids.includes(s.id))
  selectedScripts.value = []
}

// 确认删除
const confirmDelete = (type, id) => {
  ElMessageBox.confirm('确定要删除这条记录吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if (type === 'rule') {
      deleteRule(id)
    } else if (type === 'script') {
      deleteScript(id)
    }
  }).catch(() => {
    // 取消删除
  })
}

const viewRuleDetail = (rule) => {
  detailTitle.value = '规则详情'
  detailType.value = 'rule'
  detailData.value = rule
  detailDialogVisible.value = true
}

const viewScriptDetail = (script) => {
  detailTitle.value = '脚本详情'
  detailType.value = 'script'
  detailData.value = script
  detailDialogVisible.value = true
}

const viewExecutionDetail = (execution) => {
  detailTitle.value = '执行详情'
  detailType.value = 'execution'
  detailData.value = execution
  detailDialogVisible.value = true
}

const refreshHistory = () => {
  loadExecutionHistory()
}

// 加载数据
const loadData = async () => {
  rules.value = await getRules()
  scripts.value = await getScripts()
  await loadExecutionHistory()
}

const loadExecutionHistory = async () => {
  executionHistory.value = await getExecutionHistory()
}

onMounted(() => {
  loadData()
})
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

.detail-content {
  max-height: 500px;
  overflow-y: auto;
}

.script-content,
.execution-result {
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}
</style>
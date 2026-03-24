<template>
  <div class="container">
    <div class="page-title">日志采集配置</div>
    <el-card shadow="never" class="mb-20">
      <template #header>
        <div class="card-header">
          <span>日志格式解析配置</span>
          <el-button type="primary" @click="openAddParserDialog">添加解析规则</el-button>
        </div>
      </template>
      <el-table :data="parserRules" border>
        <el-table-column prop="id" label="解析格式ID" width="120"/>
        <el-table-column prop="name" label="解析格式名称"/>
        <el-table-column prop="format" label="日志格式类型" width="120"/>
        <el-table-column prop="parseMethod" label="解析方式" width="100"/>
        <el-table-column prop="businessSystem" label="关联业务系统" width="140"/>
        <el-table-column prop="pattern" label="解析模版" width="200"/>
        <el-table-column prop="createTime" label="创建时间" width="180"/>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-switch v-model="scope.row.status" @change="updateParserStatus(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="openEditParserDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteParser(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>采集规则管理</span>
          <el-button type="primary" @click="openAddRuleDialog">添加采集规则</el-button>
        </div>
      </template>
      <el-table :data="collectionRules" border>
        <el-table-column prop="id" label="规则ID" width="100"/>
        <el-table-column prop="name" label="规则名称"/>
        <el-table-column prop="environment" label="环境" width="100"/>
        <el-table-column prop="operator" label="运营商" width="100"/>
        <el-table-column prop="application" label="采集对象(应用)" width="140"/>
        <el-table-column prop="serverIp" label="服务器IP" width="120"/>
        <el-table-column prop="path" label="日志采集路径"/>
        <el-table-column prop="collectionMethod" label="采集方式" width="100"/>
        <el-table-column prop="frequency" label="采集频率" width="120"/>
        <el-table-column prop="filterCondition" label="过滤条件" width="150"/>
        <el-table-column prop="filterKeyword" label="过滤关键字" width="150"/>
        <el-table-column prop="parserId" label="关联解析格式" width="120">
          <template #default="scope">
            {{ getParserName(scope.row.parserId) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-switch v-model="scope.row.status" @change="updateRuleStatus(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"/>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="openEditRuleDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteRule(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加采集规则对话框 -->
    <el-dialog v-model="addRuleDialogVisible" title="添加采集规则" width="600px">
      <div class="form-container">
        <el-form :model="newRule" label-width="120px">
        <el-form-item label="规则名称">
          <el-input v-model="newRule.name"/>
        </el-form-item>
        <el-form-item label="环境">
          <el-select v-model="newRule.environment">
            <el-option label="生产环境" value="生产环境"/>
            <el-option label="测试环境" value="测试环境"/>
            <el-option label="开发环境" value="开发环境"/>
          </el-select>
        </el-form-item>
        <el-form-item label="运营商">
          <el-select v-model="newRule.operator">
            <el-option label="联通" value="联通"/>
            <el-option label="移动" value="移动"/>
            <el-option label="电信" value="电信"/>
          </el-select>
        </el-form-item>
        <el-form-item label="采集对象(应用)">
          <el-select v-model="newRule.application">
            <el-option label="数据开发子系统" value="数据开发子系统"/>
            <el-option label="数据质量子系统" value="数据质量子系统"/>
            <el-option label="数据归集子系统" value="数据归集子系统"/>
            <el-option label="数据支撑子系统" value="数据支撑子系统"/>
            <el-option label="长三角共享交换平台" value="长三角共享交换平台"/>
            <el-option label="日志审计子系统" value="日志审计子系统"/>
          </el-select>
        </el-form-item>
        <el-form-item label="服务器IP">
          <el-input v-model="newRule.serverIp"/>
        </el-form-item>
        <el-form-item label="日志采集路径">
          <el-input v-model="newRule.path" placeholder="例如：/var/log/*.log"/>
        </el-form-item>
        <el-form-item label="采集方式">
          <el-select v-model="newRule.collectionMethod" @change="handleCollectionMethodChange">
            <el-option label="实时采集" value="实时采集"/>
            <el-option label="定时采集" value="定时采集"/>
          </el-select>
        </el-form-item>
        <el-form-item label="采集频率" v-if="newRule.collectionMethod === '定时采集'">
          <el-select v-model="newRule.frequency">
            <el-option label="1分钟" value="1m"/>
            <el-option label="5分钟" value="5m"/>
            <el-option label="15分钟" value="15m"/>
            <el-option label="30分钟" value="30m"/>
            <el-option label="1小时" value="1h"/>
          </el-select>
        </el-form-item>
        <el-form-item label="过滤条件">
          <el-select v-model="newRule.filterCondition" @change="handleFilterConditionChange">
            <el-option label="无过滤" value="无过滤"/>
            <el-option label="只采集含关键字" value="只采集含关键字"/>
            <el-option label="排除某些日志" value="排除某些日志"/>
          </el-select>
        </el-form-item>
        <el-form-item label="过滤关键字" v-if="newRule.filterCondition !== '无过滤'">
          <el-input v-model="newRule.filterKeyword" placeholder="请输入过滤关键字"/>
        </el-form-item>
        <el-form-item label="关联解析格式">
          <el-select v-model="newRule.parserId">
            <el-option v-for="parser in parserRules" :key="parser.id" :label="parser.name" :value="parser.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="newRule.status"/>
        </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addRuleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRule">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 添加解析规则对话框 -->
    <el-dialog v-model="addParserDialogVisible" title="添加解析规则" width="600px">
      <el-form :model="newParser" label-width="120px">
        <el-form-item label="解析格式名称">
          <el-input v-model="newParser.name"/>
        </el-form-item>
        <el-form-item label="日志格式类型">
          <el-select v-model="newParser.format">
            <el-option label="JSON" value="json"/>
            <el-option label="多行文本" value="text"/>
            <el-option label="分隔符文本" value="delimiter"/>
          </el-select>
        </el-form-item>
        <el-form-item label="解析方式">
          <el-select v-model="newParser.parseMethod">
            <el-option label="自动JSON解析" value="自动JSON解析"/>
            <el-option label="正则解析" value="正则解析"/>
          </el-select>
        </el-form-item>
        <el-form-item label="关联业务系统">
          <el-select v-model="newParser.businessSystem">
            <el-option label="数据开发子系统" value="数据开发子系统"/>
            <el-option label="数据归集子系统" value="数据归集子系统"/>
            <el-option label="数据质量子系统" value="数据质量子系统"/>
            <el-option label="数据支撑子系统" value="数据支撑子系统"/>
            <el-option label="长三角共享交换平台" value="长三角共享交换平台"/>
            <el-option label="日志审计子系统" value="日志审计子系统"/>
          </el-select>
        </el-form-item>
        <el-form-item label="解析模板">
          <el-input v-model="newParser.pattern" type="textarea" rows="4"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="newParser.status"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addParserDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveParser">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const collectionRules = ref([
  {
    id: 'R001',
    name: '数据归集子系统应用服务日志',
    environment: '生产环境',
    operator: '联通',
    application: '数据归集子系统',
    serverIp: '172.16.62.157',
    path: '/var/log/system.log',
    collectionMethod: '定时采集',
    frequency: '5m',
    filterCondition: '无过滤',
    filterKeyword: '',
    parserId: 'P001',
    status: true,
    createTime: '2026-03-18 09:00:00'
  },
  {
    id: 'R002',
    name: '数据开发子系统应用服务日志',
    environment: '生产环境',
    operator: '联通',
    application: '数据开发子系统',
    serverIp: '172.16.62.146',
    path: '/opt/app/logs/*.log',
    collectionMethod: '实时采集',
    frequency: '',
    filterCondition: '只采集含关键字',
    filterKeyword: 'error',
    parserId: 'P002',
    status: true,
    createTime: '2026-03-18 10:00:00'
  },
  {
    id: 'R003',
    name: '数据质量子系统访问日志',
    environment: '测试环境',
    operator: '移动',
    application: '数据质量子系统',
    serverIp: '172.16.62.119',
    path: '/var/log/nginx/access.log',
    collectionMethod: '定时采集',
    frequency: '15m',
    filterCondition: '排除某些日志',
    filterKeyword: 'debug',
    parserId: 'P002',
    status: false,
    createTime: '2026-03-18 11:00:00'
  }
])

const parserRules = ref([
  {
    id: 'P001',
    name: 'JSON格式解析',
    format: 'json',
    parseMethod: '自动JSON解析',
    businessSystem: '数据开发子系统',
    pattern: '{"time": "${time}", "level": "${level}", "message": "${message}"}',
    status: true,
    createTime: '2026-03-18 08:00:00'
  },
  {
    id: 'P002',
    name: '多行文本解析',
    format: 'text',
    parseMethod: '正则解析',
    businessSystem: '数据归集子系统',
    pattern: '^([\d.]+) - ([^ ]+) \[(.*?)\] "(.*?)" (\d+) (\d+) "(.*?)" "(.*?)"',
    status: true,
    createTime: '2026-03-18 08:30:00'
  }
])

const addRuleDialogVisible = ref(false)
const addParserDialogVisible = ref(false)

const newRule = ref({
  name: '',
  environment: '',
  operator: '',
  application: '',
  serverIp: '',
  path: '',
  collectionMethod: '定时采集',
  frequency: '5m',
  filterCondition: '无过滤',
  filterKeyword: '',
  parserId: '',
  status: true
})

const newParser = ref({
  name: '',
  format: 'json',
  parseMethod: '自动解析',
  businessSystem: '',
  pattern: '',
  status: true
})

const openAddRuleDialog = () => {
  newRule.value = {
    name: '',
    environment: '',
    operator: '',
    application: '',
    serverIp: '',
    path: '',
    collectionMethod: '定时采集',
    frequency: '5m',
    filterCondition: '无过滤',
    filterKeyword: '',
    parserId: '',
    status: true
  }
  addRuleDialogVisible.value = true
}

const openEditRuleDialog = (rule) => {
  newRule.value = { ...rule }
  addRuleDialogVisible.value = true
}

const handleCollectionMethodChange = () => {
  if (newRule.value.collectionMethod === '实时采集') {
    newRule.value.frequency = ''
  } else {
    newRule.value.frequency = '5m'
  }
}

const handleFilterConditionChange = () => {
  if (newRule.value.filterCondition === '无过滤') {
    newRule.value.filterKeyword = ''
  }
}

const getParserName = (parserId) => {
  const parser = parserRules.value.find(p => p.id === parserId)
  return parser ? parser.name : ''
}

const saveRule = () => {
  if (!newRule.value.name || !newRule.value.environment || !newRule.value.operator || !newRule.value.application || !newRule.value.serverIp || !newRule.value.path || !newRule.value.collectionMethod || !newRule.value.filterCondition) {
    ElMessage.error('请填写完整的规则信息')
    return
  }
  
  if (newRule.value.filterCondition !== '无过滤' && !newRule.value.filterKeyword) {
    ElMessage.error('请填写过滤关键字')
    return
  }
  
  const existingIndex = collectionRules.value.findIndex(r => r.id === newRule.value.id)
  if (existingIndex >= 0) {
    collectionRules.value[existingIndex] = { ...newRule.value }
    ElMessage.success('规则更新成功')
  } else {
    const newId = 'R' + String(collectionRules.value.length + 1).padStart(3, '0')
    collectionRules.value.push({
      ...newRule.value,
      id: newId,
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    })
    ElMessage.success('规则添加成功')
  }
  addRuleDialogVisible.value = false
}

const deleteRule = (id) => {
  collectionRules.value = collectionRules.value.filter(r => r.id !== id)
  ElMessage.success('规则删除成功')
}

const updateRuleStatus = (rule) => {
  ElMessage.success(`规则 ${rule.name} ${rule.status ? '启用' : '禁用'} 成功`)
}

const openAddParserDialog = () => {
  newParser.value = {
    name: '',
    format: 'json',
    parseMethod: '自动JSON解析',
    businessSystem: '',
    pattern: '',
    status: true
  }
  addParserDialogVisible.value = true
}

const openEditParserDialog = (parser) => {
  newParser.value = { ...parser }
  addParserDialogVisible.value = true
}

const saveParser = () => {
  if (!newParser.value.name || !newParser.value.pattern || !newParser.value.parseMethod || !newParser.value.businessSystem) {
    ElMessage.error('请填写完整的解析规则信息')
    return
  }
  
  const existingIndex = parserRules.value.findIndex(p => p.id === newParser.value.id)
  if (existingIndex >= 0) {
    parserRules.value[existingIndex] = { ...newParser.value }
    ElMessage.success('解析规则更新成功')
  } else {
    const newId = 'P' + String(parserRules.value.length + 1).padStart(3, '0')
    parserRules.value.push({
      ...newParser.value,
      id: newId,
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    })
    ElMessage.success('解析规则添加成功')
  }
  addParserDialogVisible.value = false
}

const deleteParser = (id) => {
  parserRules.value = parserRules.value.filter(p => p.id !== id)
  ElMessage.success('解析规则删除成功')
}

const updateParserStatus = (parser) => {
  ElMessage.success(`解析规则 ${parser.name} ${parser.status ? '启用' : '禁用'} 成功`)
}

onMounted(() => {
  // 初始化数据
})
</script>
<style scoped>
.container {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.mb-20 {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.form-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.form-container .el-form {
  width: 100%;
  max-width: 500px;
}
</style>
<template>
  <div class="container">
    <div class="page-title">告警规则配置管理</div>
    <el-card shadow="never" class="panel">
      <el-button type="primary" style="margin-bottom: 16px">新增告警规则</el-button>
      <el-table :data="alarmRules" border>
        <el-table-column prop="id" label="规则ID" width="100" />
        <el-table-column prop="name" label="规则名称" />
        <el-table-column prop="type" label="规则类型" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="240">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="editRule(row)">编辑</el-button>
            <el-button size="small" @click="toggleRule(row)">
              {{ row.status === '启用' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteRule(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-card shadow="never" class="panel" style="margin-top: 20px">
      <el-tabs>
        <el-tab-pane label="阈值规则">
          <el-form :model="thresholdRule" label-width="120px">
            <el-form-item label="规则名称">
              <el-input v-model="thresholdRule.name" />
            </el-form-item>
            <el-form-item label="监控指标">
              <el-select v-model="thresholdRule.metric" placeholder="选择监控指标">
                <el-option label="CPU使用率" value="cpu_usage" />
                <el-option label="内存使用率" value="memory_usage" />
                <el-option label="磁盘使用率" value="disk_usage" />
              </el-select>
            </el-form-item>
            <el-form-item label="阈值条件">
              <el-select v-model="thresholdRule.condition" placeholder="选择条件">
                <el-option label="大于" value="gt" />
                <el-option label="小于" value="lt" />
                <el-option label="等于" value="eq" />
              </el-select>
              <el-input v-model="thresholdRule.value" type="number" style="width: 100px; margin-left: 10px" />
            </el-form-item>
            <el-form-item label="持续时间">
              <el-input v-model="thresholdRule.duration" type="number" style="width: 100px" />
              <span style="margin-left: 10px">分钟</span>
            </el-form-item>
            <el-form-item label="告警级别">
              <el-select v-model="thresholdRule.level" placeholder="选择告警级别">
                <el-option label="紧急" value="critical" />
                <el-option label="重要" value="major" />
                <el-option label="警告" value="warning" />
                <el-option label="提示" value="info" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveThresholdRule">保存规则</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="抑制规则">
          <el-form :model="suppressRule" label-width="120px">
            <el-form-item label="规则名称">
              <el-input v-model="suppressRule.name" />
            </el-form-item>
            <el-form-item label="抑制条件">
              <el-input type="textarea" v-model="suppressRule.condition" rows="4" />
            </el-form-item>
            <el-form-item label="抑制时间">
              <el-input v-model="suppressRule.duration" type="number" style="width: 100px" />
              <span style="margin-left: 10px">分钟</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSuppressRule">保存规则</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="聚合规则">
          <el-form :model="aggregateRule" label-width="120px">
            <el-form-item label="规则名称">
              <el-input v-model="aggregateRule.name" />
            </el-form-item>
            <el-form-item label="聚合字段">
              <el-select v-model="aggregateRule.field" placeholder="选择聚合字段">
                <el-option label="主机" value="host" />
                <el-option label="服务" value="service" />
                <el-option label="告警类型" value="type" />
              </el-select>
            </el-form-item>
            <el-form-item label="聚合时间窗口">
              <el-input v-model="aggregateRule.window" type="number" style="width: 100px" />
              <span style="margin-left: 10px">分钟</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveAggregateRule">保存规则</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const alarmRules = ref([
  { id: 1, name: 'CPU使用率告警', type: '阈值规则', status: '启用', createTime: '2026-03-18 10:00:00' },
  { id: 2, name: '内存使用率告警', type: '阈值规则', status: '启用', createTime: '2026-03-18 11:00:00' },
  { id: 3, name: '磁盘使用率告警', type: '阈值规则', status: '启用', createTime: '2026-03-18 12:00:00' },
  { id: 4, name: '重复告警抑制', type: '抑制规则', status: '启用', createTime: '2026-03-18 13:00:00' }
])

const thresholdRule = ref({
  name: '',
  metric: '',
  condition: '',
  value: '',
  duration: '',
  level: ''
})

const suppressRule = ref({
  name: '',
  condition: '',
  duration: ''
})

const aggregateRule = ref({
  name: '',
  field: '',
  window: ''
})

const editRule = (row) => {
  ElMessage.info('编辑规则: ' + row.name)
}

const toggleRule = (row) => {
  row.status = row.status === '启用' ? '禁用' : '启用'
  ElMessage.success('已' + row.status + '规则: ' + row.name)
}

const deleteRule = (row) => {
  const index = alarmRules.value.findIndex(item => item.id === row.id)
  if (index !== -1) {
    alarmRules.value.splice(index, 1)
    ElMessage.success('已删除规则: ' + row.name)
  }
}

const saveThresholdRule = () => {
  ElMessage.success('保存阈值规则成功')
}

const saveSuppressRule = () => {
  ElMessage.success('保存抑制规则成功')
}

const saveAggregateRule = () => {
  ElMessage.success('保存聚合规则成功')
}
</script>
<style scoped>
.container {
  padding: 20px;
}
.page-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}
.panel {
  margin-bottom: 20px;
}
</style>
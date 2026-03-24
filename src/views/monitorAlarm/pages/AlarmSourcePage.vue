<template>
  <div class="container">
    <div class="page-title">多源告警接入</div>
    <el-card shadow="never" class="panel">
      <el-tabs>
        <el-tab-pane label="告警接入配置">
          <el-button type="primary" style="margin-bottom: 16px">新增告警源</el-button>
          <el-table :data="alarmSources" border>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="告警源名称" />
            <el-table-column prop="type" label="告警源类型" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '启用' ? 'success' : 'danger'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" type="primary" @click="editSource(row)">编辑</el-button>
                <el-button size="small" @click="toggleStatus(row)">
                  {{ row.status === '启用' ? '禁用' : '启用' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="告警标准化配置">
          <el-form :model="standardConfig" label-width="120px">
            <el-form-item label="标准化规则">
              <el-input type="textarea" v-model="standardConfig.rule" rows="4" />
            </el-form-item>
            <el-form-item label="字段映射">
              <el-table :data="standardConfig.fields" border>
                <el-table-column prop="sourceField" label="源字段" />
                <el-table-column prop="targetField" label="目标字段" />
                <el-table-column label="操作" width="120">
                  <template #default="{ $index }">
                    <el-button size="small" type="danger" @click="removeField($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-button type="primary" style="margin-top: 16px" @click="addField">添加字段映射</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveStandardConfig">保存配置</el-button>
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

const alarmSources = ref([
  { id: 1, name: 'Zabbix告警', type: '监控系统', status: '启用', createTime: '2026-03-18 10:00:00' },
  { id: 2, name: 'Prometheus告警', type: '监控系统', status: '启用', createTime: '2026-03-18 11:00:00' },
  { id: 3, name: '应用日志告警', type: '日志系统', status: '禁用', createTime: '2026-03-18 12:00:00' }
])

const standardConfig = ref({
  rule: '将不同告警源的字段映射到标准字段',
  fields: [
    { sourceField: 'alert_name', targetField: 'title' },
    { sourceField: 'severity', targetField: 'level' },
    { sourceField: 'host', targetField: 'source' }
  ]
})

const editSource = (row) => {
  ElMessage.info('编辑告警源: ' + row.name)
}

const toggleStatus = (row) => {
  row.status = row.status === '启用' ? '禁用' : '启用'
  ElMessage.success('已' + row.status + '告警源: ' + row.name)
}

const addField = () => {
  standardConfig.value.fields.push({ sourceField: '', targetField: '' })
}

const removeField = (index) => {
  standardConfig.value.fields.splice(index, 1)
}

const saveStandardConfig = () => {
  ElMessage.success('保存成功')
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
<template>
  <div class="container">
    <div class="page-title">告警多渠道通知配置</div>
    <el-card shadow="never" class="panel">
      <el-tabs>
        <el-tab-pane label="通知渠道配置">
          <el-button type="primary" style="margin-bottom: 16px">新增通知渠道</el-button>
          <el-table :data="notificationChannels" border>
            <el-table-column prop="id" label="渠道ID" width="100" />
            <el-table-column prop="name" label="渠道名称" />
            <el-table-column prop="type" label="渠道类型" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '启用' ? 'success' : 'danger'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" type="primary" @click="editChannel(row)">编辑</el-button>
                <el-button size="small" @click="toggleChannel(row)">
                  {{ row.status === '启用' ? '禁用' : '启用' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="通知规则配置">
          <el-button type="primary" style="margin-bottom: 16px">新增通知规则</el-button>
          <el-table :data="notificationRules" border>
            <el-table-column prop="id" label="规则ID" width="100" />
            <el-table-column prop="name" label="规则名称" />
            <el-table-column prop="level" label="告警级别" width="120" />
            <el-table-column prop="channels" label="通知渠道" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '启用' ? 'success' : 'danger'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" type="primary" @click="editRule(row)">编辑</el-button>
                <el-button size="small" @click="toggleRule(row)">
                  {{ row.status === '启用' ? '禁用' : '启用' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="通知模板配置">
          <el-form :model="notificationTemplate" label-width="120px">
            <el-form-item label="模板名称">
              <el-input v-model="notificationTemplate.name" />
            </el-form-item>
            <el-form-item label="模板类型">
              <el-select v-model="notificationTemplate.type" placeholder="选择模板类型">
                <el-option label="站内通知" value="internal" />
                <el-option label="短信通知" value="sms" />
                <el-option label="钉钉通知" value="dingtalk" />
                <el-option label="企业微信通知" value="wechat" />
              </el-select>
            </el-form-item>
            <el-form-item label="模板内容">
              <el-input type="textarea" v-model="notificationTemplate.content" rows="6" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveTemplate">保存模板</el-button>
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

const notificationChannels = ref([
  { id: 1, name: '站内通知', type: 'internal', status: '启用' },
  { id: 2, name: '短信通知', type: 'sms', status: '启用' },
  { id: 3, name: '钉钉通知', type: 'dingtalk', status: '禁用' },
  { id: 4, name: '企业微信通知', type: 'wechat', status: '启用' }
])

const notificationRules = ref([
  { id: 1, name: '紧急告警通知', level: '紧急', channels: '站内通知, 短信通知, 钉钉通知', status: '启用' },
  { id: 2, name: '重要告警通知', level: '重要', channels: '站内通知, 短信通知', status: '启用' },
  { id: 3, name: '警告告警通知', level: '警告', channels: '站内通知', status: '启用' },
  { id: 4, name: '提示告警通知', level: '提示', channels: '站内通知', status: '禁用' }
])

const notificationTemplate = ref({
  name: '',
  type: '',
  content: '告警级别: ${level}\n告警内容: ${title}\n告警时间: ${time}\n告警来源: ${source}'
})

const editChannel = (row) => {
  ElMessage.info('编辑通知渠道: ' + row.name)
}

const toggleChannel = (row) => {
  row.status = row.status === '启用' ? '禁用' : '启用'
  ElMessage.success('已' + row.status + '通知渠道: ' + row.name)
}

const editRule = (row) => {
  ElMessage.info('编辑通知规则: ' + row.name)
}

const toggleRule = (row) => {
  row.status = row.status === '启用' ? '禁用' : '启用'
  ElMessage.success('已' + row.status + '通知规则: ' + row.name)
}

const saveTemplate = () => {
  ElMessage.success('保存通知模板成功')
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
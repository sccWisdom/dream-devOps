<template>
  <div class="container" style="padding: 20px;">
    <div class="page-title" style="margin-bottom: 20px; font-size: 20px; font-weight: bold;">变更管理</div>
    <QueryBar>
      <template #default>
        <el-form inline>
          <el-form-item label="类型" style="margin-bottom: 0px;">
            <el-select v-model="query.type" placeholder="全部" style="width:140px">
              <el-option label="全部" value=""/>
              <el-option label="常规" value="常规"/>
              <el-option label="紧急" value="紧急"/>
              <el-option label="重大" value="重大"/>
            </el-select>
          </el-form-item>
          <el-form-item label="风险等级" style="margin-bottom: 0px;">
            <el-select v-model="query.risk" placeholder="全部" style="width:140px">
              <el-option label="全部" value=""/>
              <el-option label="低" value="低"/>
              <el-option label="中" value="中"/>
              <el-option label="高" value="高"/>
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <template #ops>
        <el-button @click="reset">重置</el-button>
        <el-button type="primary" @click="load">查询</el-button>
      </template>
    </QueryBar>
    <div style="overflow-x: auto; margin-top: 20px;">
      <el-table :data="list" border style="width: 100%;">
        <el-table-column prop="id" label="变更单号" :width="160" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="type" label="类型" :width="100" />
        <el-table-column prop="risk" label="风险等级" :width="100" />
        <el-table-column label="状态" :width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status"/>
          </template>
        </el-table-column>
        <el-table-column prop="reporter" label="提单人" :width="100" />
        <el-table-column prop="submitTime" label="提交时间" :width="180" />
        <el-table-column label="操作" :width="100">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="open(row)">处置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <TicketDetailDrawer v-model="visible" title="变更详情" :steps="steps" :active="step">
      <el-descriptions :column="2" border style="margin-bottom:12px">
        <el-descriptions-item label="实施计划">{{ plan }}</el-descriptions-item>
        <el-descriptions-item label="回滚方案">{{ rollback }}</el-descriptions-item>
      </el-descriptions>
      <el-card class="panel" style="margin-bottom:12px">
        <div style="font-weight:600;margin-bottom:6px">关联资源</div>
        <el-space style="margin-bottom:8px">
          <el-button type="primary" @click="openSelect">选择资源</el-button>
        </el-space>
        <el-table :data="resources" border>
          <el-table-column prop="type" label="类型" width="100"/>
          <el-table-column prop="name" label="名称/主机"/>
          <el-table-column width="80" label="操作">
            <template #default="{ $index }">
              <el-button type="danger" text @click="removeRes($index)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <el-space>
        <el-button type="primary" @click="approve" :disabled="step!==1">审批通过</el-button>
        <el-button type="warning" @click="implement" :disabled="step!==2">开始实施</el-button>
        <el-button type="success" @click="verify" :disabled="step!==3">验证通过</el-button>
        <el-button type="danger" @click="rollbackAct" :disabled="step<3">回滚</el-button>
      </el-space>
      <el-dialog v-model="selVisible" title="选择资源" width="680px">
        <el-tabs v-model="selTab">
          <el-tab-pane label="业务系统" name="app">
            <el-table :data="apps" @row-click="pickApp" border style="cursor:pointer">
              <el-table-column prop="name" label="名称"/>
              <el-table-column prop="owner" label="负责人" width="120"/>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="主机" name="host">
            <el-table :data="hosts" @row-click="pickHost" border style="cursor:pointer">
              <el-table-column prop="ip" label="IP" width="160"/>
              <el-table-column prop="os" label="系统"/>
              <el-table-column prop="env" label="环境" width="100"/>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-dialog>
    </TicketDetailDrawer>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { getChanges } from '../../../mock-data/modules/change'
import TicketDetailDrawer from '@/components/Common/TicketDetailDrawer.vue'
import StatusTag from '@/components/Common/StatusTag.vue'
import QueryBar from '@/components/Common/QueryBar.vue'
import { getApps, getHosts } from '@/mock-data/modules/cmdb'
const list = ref([])
const query = ref({ type: '', risk: '' })
const visible = ref(false)
const step = ref(1)
const steps = [
  { title: '申请与评估', desc: '' },
  { title: '审批', desc: '' },
  { title: '实施', desc: '' },
  { title: '验证', desc: '' },
  { title: '归档', desc: '' }
]
const plan = '周五22:00-23:00 进行流量切换与参数调整'
const rollback = '如失败，回滚至前版本并恢复参数'
const load = async () => {
  list.value = await getChanges(query.value)
}
const reset = () => { query.value = { type: '', risk: '' }; load() }
const open = (row) => { visible.value = true }
const approve = () => { step.value = 2 }
const implement = () => { step.value = 3 }
const verify = () => { step.value = 4 }
const rollbackAct = () => { step.value = 4 }
const resources = ref([])
const selVisible = ref(false)
const selTab = ref('app')
const apps = ref([])
const hosts = ref([])
const openSelect = async () => {
  selVisible.value = true
  if (!apps.value.length) apps.value = await getApps()
  if (!hosts.value.length) hosts.value = await getHosts()
}
const pickApp = (row) => {
  resources.value.push({ type: '应用', name: row.name })
}
const pickHost = (row) => {
  resources.value.push({ type: '主机', name: row.ip })
}
const removeRes = (i) => resources.value.splice(i, 1)
onMounted(load)
</script>
<style scoped>
</style>

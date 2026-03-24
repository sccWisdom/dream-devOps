<template>
  <div class="container" style="padding: 20px;">
    <div class="page-title" style="margin-bottom: 20px; font-size: 20px; font-weight: bold;">发布管理</div>
    <QueryBar>
      <template #default>
        <el-form inline>
          <el-form-item label="类型" style="margin-bottom: 0px;">
            <el-select v-model="query.type" placeholder="全部" style="width:140px">
              <el-option label="全部" value=""/>
              <el-option label="全量" value="全量"/>
              <el-option label="灰度" value="灰度"/>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" style="margin-bottom: 0px;">
            <el-select v-model="query.status" placeholder="全部" style="width:140px">
              <el-option label="全部" value=""/>
              <el-option label="审批中" value="审批中"/>
              <el-option label="发布中" value="发布中"/>
              <el-option label="验证中" value="验证中"/>
              <el-option label="发布完成" value="发布完成"/>
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
        <el-table-column prop="id" label="发布单号" :width="160" />
        <el-table-column prop="version" label="版本" :width="120" />
        <el-table-column prop="title" label="发布内容" />
        <el-table-column prop="type" label="类型" :width="100" />
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
    <TicketDetailDrawer v-model="visible" title="发布详情" :steps="steps" :active="step">
      <el-space>
        <el-button type="primary" @click="approve" :disabled="step!==1">审批通过</el-button>
        <el-button type="warning" @click="release" :disabled="step!==2">开始发布</el-button>
        <el-button type="success" @click="verify" :disabled="step!==3">验证通过</el-button>
        <el-button type="danger" @click="rollbackAct" :disabled="step<3">回滚</el-button>
      </el-space>
    </TicketDetailDrawer>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { getReleases } from '../../../mock-data/modules/release'
import TicketDetailDrawer from '@/components/Common/TicketDetailDrawer.vue'
import StatusTag from '@/components/Common/StatusTag.vue'
import QueryBar from '@/components/Common/QueryBar.vue'
const list = ref([])
const query = ref({ type: '', status: '' })
const visible = ref(false)
const step = ref(1)
const steps = [
  { title: '申请', desc: '' },
  { title: '审批', desc: '' },
  { title: '发布', desc: '' },
  { title: '验证', desc: '' },
  { title: '归档', desc: '' }
]
const load = async () => {
  list.value = await getReleases(query.value)
}
const reset = () => { query.value = { type: '', status: '' }; load() }
const open = (row) => { visible.value = true }
const approve = () => { step.value = 2 }
const release = () => { step.value = 3 }
const verify = () => { step.value = 4 }
const rollbackAct = () => { step.value = 4 }
onMounted(load)
</script>
<style scoped>
</style>

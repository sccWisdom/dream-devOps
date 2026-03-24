<template>
  <div class="container" style="padding: 20px;">
    <div class="page-title" style="margin-bottom: 20px; font-size: 20px; font-weight: bold;">问题管理</div>
    <QueryBar>
      <template #default>
        <el-form inline>
          <el-form-item label="优先级" style="margin-bottom: 0px;">
            <el-select v-model="query.priority" placeholder="全部" style="width:140px">
              <el-option label="全部" value=""/>
              <el-option label="P1" value="P1"/>
              <el-option label="P2" value="P2"/>
              <el-option label="P3" value="P3"/>
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
        <el-table-column prop="id" label="问题单号" :width="160" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="priority" label="优先级" :width="80" />
        <el-table-column label="状态" :width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status"/>
          </template>
        </el-table-column>
        <el-table-column prop="reporter" label="提单人" :width="100" />
        <el-table-column prop="submitTime" label="提交时间" :width="180" />
        <el-table-column prop="owner" label="负责人" :width="100" />
        <el-table-column label="操作" :width="100">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="open(row)">处置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <TicketDetailDrawer v-model="visible" title="问题详情" :steps="steps" :active="step">
      <el-form label-width="100px" style="max-width:640px">
        <el-form-item label="根因分类">
          <el-select v-model="detail.rootCause" placeholder="选择根因">
            <el-option label="配置错误" value="配置错误"/>
            <el-option label="容量不足" value="容量不足"/>
            <el-option label="代码缺陷" value="代码缺陷"/>
          </el-select>
        </el-form-item>
        <el-form-item label="解决方案">
          <el-input v-model="detail.solution" type="textarea" :rows="4"/>
        </el-form-item>
      </el-form>
      <template #actions>
        <el-space>
          <el-button type="primary" @click="next">下一步</el-button>
          <el-button type="warning" @click="toChange">转变更</el-button>
          <el-button type="success" @click="finish">办结</el-button>
        </el-space>
      </template>
    </TicketDetailDrawer>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import TicketDetailDrawer from '@/components/Common/TicketDetailDrawer.vue'
import StatusTag from '@/components/Common/StatusTag.vue'
import QueryBar from '@/components/Common/QueryBar.vue'
import { getProblems } from '@/mock-data/modules/problem'
const list = ref([])
const query = ref({ priority: '' })
const visible = ref(false)
const step = ref(0)
const steps = [
  { title: '受理', desc: '' },
  { title: '根因分析', desc: '' },
  { title: '方案评审', desc: '' },
  { title: '验证与办结', desc: '' }
]
const detail = ref({ rootCause: '', solution: '' })
const load = async () => {
  list.value = await getProblems(query.value)
}
const reset = () => { query.value = { priority: '' }; load() }
const open = (row) => { visible.value = true; step.value = 1 }
const next = () => { step.value = Math.min(step.value + 1, steps.length) }
const finish = () => { step.value = steps.length }
const toChange = () => { step.value = 2 }
onMounted(load)
</script>
<style scoped>
</style>

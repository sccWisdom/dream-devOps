<template>
  <div class="panel">
    <el-row :gutter="12">
      <el-col :span="12">
        <el-card class="panel">
          <template #header>
            <div class="panel-title">变更联动（模拟）</div>
          </template>
          <el-space wrap style="margin-bottom:10px">
            <el-select v-model="changeId" placeholder="选择变更单" style="width:220px">
              <el-option v-for="c in changes" :key="c.id" :label="`${c.id} ${c.title}`" :value="c.id" />
            </el-select>
            <el-select v-model="targetCiId" placeholder="选择配置项" style="width:320px" filterable>
              <el-option v-for="ci in cis" :key="ci.id" :label="ciLabel(ci)" :value="ci.id" />
            </el-select>
            <el-button type="primary" @click="applyChange">应用变更</el-button>
          </el-space>

          <el-form :model="patch" label-width="110px">
            <el-form-item label="更新字段">
              <el-select v-model="patchKey" placeholder="选择字段" style="width: 260px">
                <el-option v-for="k in patchKeys" :key="k" :label="k" :value="k" />
              </el-select>
            </el-form-item>
            <el-form-item label="新值">
              <el-input v-model="patchValue" placeholder="输入新值（字符串）" />
            </el-form-item>
          </el-form>

          <el-alert
            title="说明：用于演示变更单关联资源，实施完成后自动更新配置项并生成审计记录。"
            type="info"
            :closable="false"
            style="margin-top:10px"
          />
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="panel">
          <template #header>
            <div class="panel-title">资源变更审计</div>
          </template>
          <el-space wrap style="margin-bottom:10px">
            <el-input v-model="auditKeyword" placeholder="搜索（CI/变更单/人员）" style="width:260px" clearable @keyup.enter="loadAudits" />
            <el-select v-model="auditCiId" placeholder="按配置项过滤" style="width:320px" clearable filterable>
              <el-option v-for="ci in cis" :key="ci.id" :label="ciLabel(ci)" :value="ci.id" />
            </el-select>
            <el-button type="primary" @click="loadAudits">查询</el-button>
          </el-space>

          <el-table :data="audits" border height="420">
            <el-table-column prop="at" label="时间" width="190" />
            <el-table-column prop="ciName" label="配置项" />
            <el-table-column prop="modelCode" label="模型" width="100" />
            <el-table-column prop="operator" label="变更人" width="110" />
            <el-table-column prop="changeId" label="关联变更单" width="140" />
            <el-table-column label="差异" width="120">
              <template #default="{ row }">
                <el-button text type="primary" @click="openDiff(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>

  <el-dialog v-model="diffVisible" title="变更差异" width="860px">
    <el-row :gutter="12">
      <el-col :span="12">
        <el-card class="panel">
          <template #header>
            <div class="panel-title">变更前</div>
          </template>
          <pre class="code">{{ pretty(diffRow?.before) }}</pre>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="panel">
          <template #header>
            <div class="panel-title">变更后</div>
          </template>
          <pre class="code">{{ pretty(diffRow?.after) }}</pre>
        </el-card>
      </el-col>
    </el-row>
    <template #footer>
      <el-button @click="diffVisible=false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getChanges } from '@/mock-data/modules/change'
import { applyChangeToCis, getAuditLogs, getCiModels, getCis } from '@/mock-data/modules/cmdb'

const models = ref([])
const changes = ref([])
const cis = ref([])
const changeId = ref('')
const targetCiId = ref('')

const patch = ref({})
const patchKey = ref('')
const patchValue = ref('')

const audits = ref([])
const auditKeyword = ref('')
const auditCiId = ref('')

const diffVisible = ref(false)
const diffRow = ref(null)

const ciLabel = (ci) => {
  if (!ci) return '-'
  const m = models.value.find(x => x.code === ci.modelCode)
  const key = m?.displayField
  const name = key ? ci.attributes?.[key] : ''
  return `${name || ci.id}（${m?.name || ci.modelCode}）`
}

const patchKeys = computed(() => {
  const ci = cis.value.find(x => x.id === targetCiId.value)
  if (!ci) return []
  return Object.keys(ci.attributes || {})
})

const loadBase = async () => {
  models.value = await getCiModels()
  changes.value = await getChanges()
  cis.value = await getCis({})
  if (!changeId.value && changes.value.length) changeId.value = changes.value[0].id
}

const loadAudits = async () => {
  audits.value = await getAuditLogs({ keyword: auditKeyword.value, ciId: auditCiId.value || undefined })
}

onMounted(async () => {
  await loadBase()
  await loadAudits()
})

const applyChange = async () => {
  if (!changeId.value) {
    ElMessage.warning('请选择变更单')
    return
  }
  if (!targetCiId.value) {
    ElMessage.warning('请选择配置项')
    return
  }
  const key = patchKey.value
  const value = patchValue.value
  if (!key) {
    ElMessage.warning('请选择更新字段')
    return
  }
  patch.value = { [key]: value }
  try {
    await applyChangeToCis({
      changeId: changeId.value,
      operator: '变更流程',
      updates: [{ ciId: targetCiId.value, patch: patch.value }]
    })
    ElMessage.success('已应用变更并生成审计')
    cis.value = await getCis({})
    await loadAudits()
  } catch (e) {
    ElMessage.error(e?.message || '应用失败')
  }
}

const openDiff = (row) => {
  diffRow.value = row
  diffVisible.value = true
}

const pretty = (obj) => {
  if (!obj) return ''
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}
</script>

<style scoped>
.panel-title {
  font-weight: 600;
}

.code {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 12px;
  line-height: 1.4;
}
</style>

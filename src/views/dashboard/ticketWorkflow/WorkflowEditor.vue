﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="workflow-editor-page">
    <section class="page-header panel">
      <div>
        <h2>{{ currentResource?.name || '工单流程配置' }}</h2>
        <p class="sub">拖拽左侧组件或节点到中间画布，点击右侧配置属性。</p>
      </div>
      <el-button @click="goBack">返回列表</el-button>
    </section>

    <section class="top-actions panel">
      <el-button type="primary" @click="saveConfig">保存</el-button>
      <el-button @click="previewConfig">预览</el-button>
      <el-button @click="publishConfig">发布</el-button>
      <el-button @click="undo">撤销</el-button>
      <el-button @click="reset">重置</el-button>
    </section>

    <section class="three-column-layout">
      <aside class="left-panel panel">
        <el-tabs v-model="componentTab" stretch>
          <el-tab-pane label="表单组件" name="form-components">
            <div class="component-list">
              <div
                v-for="component in formComponents"
                :key="component.id"
                class="component-item"
                draggable="true"
                @dragstart="onDragStart($event, component)"
              >
                <el-icon><component :is="component.icon" /></el-icon>
                <span>{{ component.name }}</span>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="流程节点" name="process-nodes">
            <div class="component-list">
              <div
                v-for="node in processNodes"
                :key="node.id"
                class="component-item"
                draggable="true"
                @dragstart="onProcessDragStart($event, node)"
              >
                <el-icon><component :is="node.icon" /></el-icon>
                <span>{{ node.name }}</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </aside>

      <main class="center-panel panel">
        <el-tabs v-model="activeTab" stretch>
          <el-tab-pane label="表单设计" name="form">
            <div class="design-canvas" @dragover.prevent="onDragOver" @drop.prevent="onDropForm">
              <Draggable v-model="formFields" item-key="id" class="form-fields" ghost-class="ghost" handle=".drag-handle" @dragover.prevent="onDragOver" @drop.prevent="onDropForm">
                <template #item="{ element }">
                  <div
                    class="form-field-item"
                    @click="selectFormField(element)"
                    :class="{ active: selectedFormField?.id === element.id }"
                  >
                    <div class="field-header">
                      <div class="field-title">
                        <el-icon class="drag-handle"><Rank /></el-icon>
                        <span>{{ element.label }}</span>
                      </div>
                      <el-button text type="danger" size="small" @click.stop="deleteFormField(element.id)">删除</el-button>
                    </div>
                    <div class="field-preview">
                      <el-input v-if="element.type === 'input'" :placeholder="element.placeholder || '请输入'" />
                      <el-input v-else-if="element.type === 'textarea'" type="textarea" :rows="2" :placeholder="element.placeholder || '请输入'" />
                      <el-select v-else-if="element.type === 'select'" placeholder="请选择" style="width: 100%">
                        <el-option label="选项1" value="1" />
                        <el-option label="选项2" value="2" />
                      </el-select>
                      <el-date-picker v-else-if="element.type === 'date'" type="datetime" placeholder="选择日期时间" style="width: 100%" />
                      <el-checkbox v-else-if="element.type === 'checkbox'">复选框</el-checkbox>
                      <el-radio v-else-if="element.type === 'radio'" label="1">单选框</el-radio>
                      <el-upload v-else-if="element.type === 'upload'" action="#" :auto-upload="false">
                        <el-button type="primary">点击上传</el-button>
                      </el-upload>
                    </div>
                  </div>
                </template>
              </Draggable>
            </div>
          </el-tab-pane>

          <el-tab-pane label="流程设计" name="process">
            <div class="design-canvas" @dragover.prevent="onProcessDragOver" @drop.prevent="onProcessDrop">
              <Draggable v-model="processNodesList" item-key="id" class="process-nodes-list" ghost-class="ghost" handle=".drag-handle" @dragover.prevent="onProcessDragOver" @drop.prevent="onProcessDrop">
                <template #item="{ element }">
                  <div
                    class="process-node-item"
                    @click="selectProcessNode(element)"
                    :class="{ active: selectedProcessNode?.id === element.id }"
                  >
                    <div class="node-header">
                      <div class="node-title">
                        <el-icon class="drag-handle"><Rank /></el-icon>
                        <el-icon><component :is="element.icon" /></el-icon>
                        <span>{{ element.name }}</span>
                      </div>
                      <el-button text type="danger" size="small" @click.stop="deleteProcessNode(element.id)">删除</el-button>
                    </div>
                    <div class="node-details">
                      <span>类型：{{ element.type }}</span>
                      <span>派单策略：{{ element.assignee || '未设置' }}</span>
                    </div>
                  </div>
                </template>
              </Draggable>
            </div>
          </el-tab-pane>
        </el-tabs>
      </main>

      <aside class="right-panel panel">
        <div class="property-panel">
          <h3>属性设置</h3>

          <el-form v-if="selectedFormField" label-width="88px" size="small">
            <el-form-item label="字段名称">
              <el-input v-model="selectedFormField.label" />
            </el-form-item>
            <el-form-item label="字段类型">
              <el-select v-model="selectedFormField.type" disabled>
                <el-option label="输入框" value="input" />
                <el-option label="多行文本" value="textarea" />
                <el-option label="下拉框" value="select" />
                <el-option label="日期选择" value="date" />
                <el-option label="复选框" value="checkbox" />
                <el-option label="单选框" value="radio" />
                <el-option label="附件" value="upload" />
              </el-select>
            </el-form-item>
            <el-form-item label="是否必填">
              <el-switch v-model="selectedFormField.required" />
            </el-form-item>
            <el-form-item label="占位提示">
              <el-input v-model="selectedFormField.placeholder" />
            </el-form-item>
          </el-form>

          <el-form v-else-if="selectedProcessNode" label-width="88px" size="small">
            <el-form-item label="节点名称">
              <el-input v-model="selectedProcessNode.name" />
            </el-form-item>
            <el-form-item label="节点类型">
              <el-select v-model="selectedProcessNode.type" @change="handleProcessTypeChange">
                <el-option label="开始节点" value="start" />
                <el-option label="审批节点" value="approval" />
                <el-option label="处理节点" value="process" />
                <el-option label="条件分支" value="condition" />
                <el-option label="结束节点" value="end" />
              </el-select>
            </el-form-item>
            <el-form-item label="派单策略">
              <el-select v-model="selectedProcessNode.assignee">
                <el-option label="按排班" value="schedule" />
                <el-option label="按工单负载" value="balanced" />
                <el-option label="按技能标签" value="skill-based" />
              </el-select>
            </el-form-item>
            <!-- 按排班派单配置 -->
            <el-collapse v-if="selectedProcessNode.assignee === 'schedule'" class="assignee-config">
              <el-collapse-item title="排班派单配置">
                <el-form-item label="绑定值班表">
                  <el-select v-model="selectedProcessNode.scheduleConfig.shift" placeholder="请选择">
                    <el-option label="早班" value="morning" />
                    <el-option label="晚班" value="evening" />
                  </el-select>
                </el-form-item>
                <el-form-item label="派单时间范围">
                  <el-select v-model="selectedProcessNode.scheduleConfig.timeRange" placeholder="请选择">
                    <el-option label="仅工作时间派单" value="work-hours" />
                    <el-option label="24小时派单" value="24-hours" />
                  </el-select>
                </el-form-item>
                <el-form-item label="节假日处理">
                  <el-switch v-model="selectedProcessNode.scheduleConfig.holidayEnabled" />
                </el-form-item>
                <el-form-item label="无人值班兜底策略">
                  <el-select v-model="selectedProcessNode.scheduleConfig.fallback" placeholder="请选择">
                    <el-option label="转值班组长" value="team-leader" />
                    <el-option label="转运维管理员" value="admin" />
                    <el-option label="挂起待人工分派" value="pending" />
                  </el-select>
                </el-form-item>
                <el-form-item label="超时未接单处理">
                  <el-checkbox-group v-model="selectedProcessNode.scheduleConfig.timeoutActions">
                    <el-checkbox label="auto-backup">自动转备值班</el-checkbox>
                    <el-checkbox label="escalation">升级通知</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-collapse-item>
            </el-collapse>

            <!-- 按工单负载派单配置 -->
            <el-collapse v-if="selectedProcessNode.assignee === 'balanced'" class="assignee-config">
              <el-collapse-item title="工单负载派单配置">
                <el-form-item label="均衡规则">
                  <el-select v-model="selectedProcessNode.balancedConfig.rule" placeholder="请选择">
                    <el-option label="优先派给待办最少的人" value="least-tasks" />
                    <el-option label="按负载权重轮询" value="weighted-round-robin" />
                  </el-select>
                </el-form-item>
                <el-form-item label="单人最大待办阈值">
                  <el-input-number v-model="selectedProcessNode.balancedConfig.maxTasks" :min="1" :max="100" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="排除人员">
                  <el-input v-model="selectedProcessNode.balancedConfig.excludedUsers" placeholder="请输入排除人员，用逗号分隔" />
                </el-form-item>
                <el-form-item label="负载相同情况">
                  <el-select v-model="selectedProcessNode.balancedConfig.tiebreaker" placeholder="请选择">
                    <el-option label="随机分派" value="random" />
                    <el-option label="按上次分派轮询" value="last-assigned" />
                  </el-select>
                </el-form-item>
              </el-collapse-item>
            </el-collapse>

            <!-- 按技能标签派单配置 -->
            <el-collapse v-if="selectedProcessNode.assignee === 'skill-based'" class="assignee-config">
              <el-collapse-item title="技能标签派单配置">
                <el-form-item label="技能标签">
                  <el-select v-model="selectedProcessNode.assigneeValue" placeholder="请选择">
                    <el-option label="归集" value="junior" />
                    <el-option label="治理" value="senior" />
                    <el-option label="开发" value="expert" />
                  </el-select>
                </el-form-item>
              </el-collapse-item>
            </el-collapse>

            <!-- 处置时长配置 -->
            <el-collapse class="assignee-config">
              <el-collapse-item title="处置时长配置">
                <el-form-item label="优先级">
                  <el-select v-model="selectedPriority" placeholder="请选择优先级">
                    <el-option label="P1" value="P1" />
                    <el-option label="P2" value="P2" />
                    <el-option label="P3" value="P3" />
                    <el-option label="P4" value="P4" />
                  </el-select>
                </el-form-item>
                <el-form-item v-if="selectedPriority" label="处置时长">
                  <div class="duration-input">
                    <el-input-number v-model="getPriorityDuration(selectedPriority).value" :min="1" :max="1440" placeholder="请输入" />
                    <el-select v-model="getPriorityDuration(selectedPriority).unit" placeholder="时间单位">
                      <el-option label="分钟" value="minutes" />
                      <el-option label="小时" value="hours" />
                    </el-select>
                  </div>
                </el-form-item>
                <el-table v-if="selectedProcessNode.durationConfig" :data="Object.entries(selectedProcessNode.durationConfig).map(([priority, config]) => ({ priority, ...config }))" style="width: 100%; margin-top: 16px">
                  <el-table-column prop="priority" label="优先级" width="80" />
                  <el-table-column prop="value" label="时长" width="100" />
                  <el-table-column prop="unit" label="单位" width="80" />
                  <el-table-column label="操作" width="80">
                    <template #default="{ row }">
                      <el-button text type="danger" size="small" @click="deleteDurationConfig(row.priority)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-collapse-item>
            </el-collapse>
          </el-form>

          <div v-else class="no-selection">请选择一个组件或节点进行配置</div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Draggable from 'vuedraggable'
import {
  ArrowDown,
  Calendar,
  Check,
  CircleCheck,
  Document,
  Edit,
  Operation,
  Rank,
  Select,
  Stamp,
  Upload
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const DRAG_MIME = 'application/x-itsm-workflow'

const currentResource = ref(null)
const activeTab = ref('form')
const componentTab = ref('form-components')
const formFields = ref([])
const processNodesList = ref([])
const selectedFormField = ref(null)
const selectedProcessNode = ref(null)
const selectedPriority = ref('')

const processNodeIconMap = {
  start: Operation,
  approval: Check,
  process: Edit,
  condition: ArrowDown,
  end: Stamp
}

const formComponents = ref([
  { id: 'input', name: '输入框', type: 'input', icon: Document },
  { id: 'textarea', name: '多行文本', type: 'textarea', icon: Document },
  { id: 'select', name: '下拉框', type: 'select', icon: Select },
  { id: 'radio', name: '单选框', type: 'radio', icon: CircleCheck },
  { id: 'checkbox', name: '复选框', type: 'checkbox', icon: Check },
  { id: 'date', name: '日期选择', type: 'date', icon: Calendar },
  { id: 'upload', name: '附件', type: 'upload', icon: Upload }
])

const processNodes = ref([
  { id: 'start', name: '开始节点', type: 'start', icon: Operation },
  { id: 'approval', name: '审批节点', type: 'approval', icon: Check },
  { id: 'process', name: '处理节点', type: 'process', icon: Edit },
  { id: 'condition', name: '条件分支', type: 'condition', icon: ArrowDown },
  { id: 'end', name: '结束节点', type: 'end', icon: Stamp }
])

const goBack = () => {
  router.push('/dashboard/ticket-workflow')
}

const saveConfig = () => ElMessage.success('保存成功')
const previewConfig = () => ElMessage.info('预览功能已触发')
const publishConfig = () => ElMessage.success('发布成功')
const undo = () => ElMessage.info('已撤销上一步')

const reset = () => {
  initMockData()
  selectedFormField.value = null
  selectedProcessNode.value = null
  ElMessage.success('已重置为默认配置')
}

const setDragPayload = (event, payload) => {
  const text = JSON.stringify(payload)
  event.dataTransfer.setData(DRAG_MIME, text)
  event.dataTransfer.setData('text/plain', text)
  event.dataTransfer.effectAllowed = 'copy'
}

const readDragPayload = (event) => {
  const raw = event.dataTransfer.getData(DRAG_MIME) || event.dataTransfer.getData('text/plain')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const onDragStart = (event, component) => {
  setDragPayload(event, {
    kind: 'form-component',
    data: {
      id: component.id,
      name: component.name,
      type: component.type
    }
  })
}

const onDragOver = (event) => {
  event.dataTransfer.dropEffect = 'copy'
}

const onDropForm = (event) => {
  const payload = readDragPayload(event)
  if (!payload || payload.kind !== 'form-component') return

  const component = payload.data
  const newField = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    label: component.name,
    type: component.type,
    required: false,
    placeholder: `请输入${component.name}`
  }
  formFields.value.push(newField)
  selectedFormField.value = newField
  selectedProcessNode.value = null
  ElMessage.success(`已添加${component.name}`)
}

const onProcessDragStart = (event, node) => {
  setDragPayload(event, {
    kind: 'process-node',
    data: {
      id: node.id,
      name: node.name,
      type: node.type
    }
  })
}

const onProcessDragOver = (event) => {
  event.dataTransfer.dropEffect = 'copy'
}

const onProcessDrop = (event) => {
  const payload = readDragPayload(event)
  if (!payload || payload.kind !== 'process-node') return

  const node = payload.data
  const newNode = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    name: node.name,
    type: node.type,
    assignee: '',
    assigneeValue: '',
    scheduleConfig: { shift: '', timeRange: '', holidayEnabled: false, fallback: '', timeoutActions: [] },
    balancedConfig: { rule: '', maxTasks: 5, excludedUsers: '', tiebreaker: '' },
    durationConfig: {},
    icon: processNodeIconMap[node.type] || Edit
  }
  processNodesList.value.push(newNode)
  selectedProcessNode.value = newNode
  selectedFormField.value = null
  ElMessage.success(`已添加${node.name}`)
}

const selectFormField = (field) => {
  selectedFormField.value = field
  selectedProcessNode.value = null
}

const selectProcessNode = (node) => {
  // 确保节点有所有必要的配置对象
  if (!node.scheduleConfig) {
    node.scheduleConfig = { shift: '', timeRange: '', holidayEnabled: false, fallback: '', timeoutActions: [] }
  }
  if (!node.balancedConfig) {
    node.balancedConfig = { rule: '', maxTasks: 5, excludedUsers: '', tiebreaker: '' }
  }
  if (!node.assigneeValue) {
    node.assigneeValue = ''
  }
  if (!node.durationConfig) {
    node.durationConfig = {}
  }
  selectedProcessNode.value = node
  selectedFormField.value = null
  selectedPriority.value = ''
}

const getPriorityDuration = (priority) => {
  if (!selectedProcessNode.value) return { value: 0, unit: 'minutes' }
  if (!selectedProcessNode.value.durationConfig) {
    selectedProcessNode.value.durationConfig = {}
  }
  if (!selectedProcessNode.value.durationConfig[priority]) {
    selectedProcessNode.value.durationConfig[priority] = { value: 0, unit: 'minutes' }
  }
  return selectedProcessNode.value.durationConfig[priority]
}

const deleteDurationConfig = (priority) => {
  if (!selectedProcessNode.value || !selectedProcessNode.value.durationConfig) return
  delete selectedProcessNode.value.durationConfig[priority]
  if (selectedPriority.value === priority) {
    selectedPriority.value = ''
  }
  ElMessage.success('删除成功')
}

const deleteFormField = (id) => {
  formFields.value = formFields.value.filter((field) => field.id !== id)
  if (selectedFormField.value?.id === id) selectedFormField.value = null
  ElMessage.success('字段已删除')
}

const deleteProcessNode = (id) => {
  processNodesList.value = processNodesList.value.filter((node) => node.id !== id)
  if (selectedProcessNode.value?.id === id) selectedProcessNode.value = null
  ElMessage.success('节点已删除')
}

const handleProcessTypeChange = (type) => {
  if (!selectedProcessNode.value) return
  selectedProcessNode.value.icon = processNodeIconMap[type] || Edit
}

const getAssigneeOptions = (assignee) => {
  const options = {
    schedule: [
      { label: '早班', value: 'morning' },
      { label: '晚班', value: 'evening' }
    ],
    'skill-based': [
      { label: '归集', value: 'junior' },
      { label: '治理', value: 'senior' },
      { label: '开发', value: 'expert' }
    ]
  }
  return options[assignee] || []
}

const initMockData = () => {
  formFields.value = [
    {
      id: 1,
      label: '问题描述',
      type: 'textarea',
      required: true,
      placeholder: '请详细描述问题'
    },
    {
      id: 2,
      label: '优先级',
      type: 'select',
      required: true,
      placeholder: '请选择优先级'
    },
    {
      id: 3,
      label: '提交时间',
      type: 'date',
      required: true,
      placeholder: '请选择提交时间'
    }
  ]

  processNodesList.value = [
    { id: 1, name: '开始', type: 'start', assignee: '', assigneeValue: '', durationConfig: {}, icon: Operation },
    { id: 2, name: '技术支持审批', type: 'approval', assignee: 'schedule', assigneeValue: 'morning', scheduleConfig: { shift: 'morning', timeRange: 'work-hours', holidayEnabled: false, fallback: 'team-leader', timeoutActions: ['auto-backup'] }, durationConfig: { P1: { value: 30, unit: 'minutes' }, P2: { value: 60, unit: 'minutes' } }, icon: Check },
    { id: 3, name: '工程师处理', type: 'process', assignee: 'balanced', balancedConfig: { rule: 'least-tasks', maxTasks: 5, excludedUsers: '', tiebreaker: 'random' }, durationConfig: { P1: { value: 120, unit: 'minutes' }, P2: { value: 3, unit: 'hours' }, P3: { value: 6, unit: 'hours' }, P4: { value: 24, unit: 'hours' } }, icon: Edit },
    { id: 4, name: '结束', type: 'end', assignee: '', assigneeValue: '', durationConfig: {}, icon: Stamp }
  ]
}

onMounted(() => {
  const resourceId = Number(route.params.id)
  const mockResources = [
    { id: 1, name: '故障处理' },
    { id: 2, name: '问题处理' },
    { id: 3, name: '需求处理' },
    { id: 4, name: '变更流程' },
    { id: 5, name: '发布流程' }
  ]
  currentResource.value = mockResources.find((item) => item.id === resourceId) || { name: '工单流程配置' }
  initMockData()
})
</script>

<style scoped>
/* 全局样式 */
.workflow-editor-page {
  display: grid;
  height: calc(100vh - 100px);
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  box-sizing: border-box;
}

/* 面板通用样式 */
.panel {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.panel:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  height: 80px;
  box-sizing: border-box;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
}

.sub {
  margin: 8px 0 0;
  font-size: 14px;
  color: #64748b;
}

/* 顶部操作按钮 */
.top-actions {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  height: 80px;
  box-sizing: border-box;
  align-items: center;
}

.top-actions .el-button {
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.top-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.top-actions .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border: none;
  font-weight: 500;
}

.top-actions .el-button--primary:hover {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}

/* 三栏布局 */
.three-column-layout {
  min-height: 0;
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 8px;
  overflow: hidden;
  flex: 1;
}

/* 左侧：组件面板 */
.left-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 中间：设计画布 */
.center-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 右侧：属性面板 */
.right-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Tab 样式 */
.left-panel :deep(.el-tabs),
.center-panel :deep(.el-tabs) {
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.left-panel :deep(.el-tabs__header),
.center-panel :deep(.el-tabs__header) {
  border-bottom: 1px solid #e2e8f0;
  margin: 0;
  padding: 0 20px;
  background: #f8fafc;
}

.left-panel :deep(.el-tabs__nav),
.center-panel :deep(.el-tabs__nav) {
  margin: 0;
  height: 56px;
}

.left-panel :deep(.el-tabs__item),
.center-panel :deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  padding: 0 20px;
  height: 56px;
  line-height: 56px;
  margin: 0 10px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.left-panel :deep(.el-tabs__item:hover),
.center-panel :deep(.el-tabs__item:hover) {
  color: #3b82f6;
}

.left-panel :deep(.el-tabs__item.is-active),
.center-panel :deep(.el-tabs__item.is-active) {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.left-panel :deep(.el-tabs__content),
.center-panel :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

/* 组件列表 */
.component-list {
  padding: 16px;
  display: grid;
  gap: 10px;
}

/* 组件项 */
.component-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: grab;
  background: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.component-item:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.component-item .el-icon {
  font-size: 18px;
  color: #3b82f6;
}

/* 设计画布 */
.design-canvas {
  min-height: 0;
  height: 100%;
  padding: 20px;
  background: #f8fafc;
  overflow: auto;
}

/* 表单字段和流程节点列表 */
.form-fields,
.process-nodes-list {
  min-height: calc(100% - 4px);
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 20px;
  display: grid;
  align-content: start;
  gap: 12px;
  background: #ffffff;
  transition: all 0.3s ease;
}

.form-fields:hover,
.process-nodes-list:hover {
  border-color: #3b82f6;
}

/* 表单字段项和流程节点项 */
.form-field-item,
.process-node-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.form-field-item:hover,
.process-node-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.form-field-item.active,
.process-node-item.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
  background: #eff6ff;
}

/* 字段和节点头部 */
.field-header,
.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.field-title,
.node-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #0f172a;
  font-weight: 600;
  font-size: 14px;
}

/* 拖拽手柄 */
.drag-handle {
  color: #94a3b8;
  cursor: move;
  font-size: 16px;
  transition: all 0.3s ease;
}

.drag-handle:hover {
  color: #3b82f6;
}

/* 字段预览 */
.field-preview {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.field-preview .el-input,
.field-preview .el-select,
.field-preview .el-date-picker {
  width: 100%;
  border-radius: 8px;
}

/* 节点详情 */
.node-details {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  display: grid;
  gap: 6px;
  color: #475569;
  font-size: 13px;
}

/* 属性面板 */
.property-panel {
  padding: 20px;
  overflow: auto;
  flex: 1;
}

.property-panel h3 {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

/* 表单样式 */
:deep(.el-form) {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

:deep(.el-input),
:deep(.el-select),
:deep(.el-switch) {
  width: 100%;
  border-radius: 8px;
}

/* 处理人值 */
.assignee-value {
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
  padding: 6px 10px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

/* 派单策略配置区域 */
.assignee-config {
  margin-top: 16px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.assignee-config :deep(.el-collapse-item__header) {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 500;
  color: #334155;
  padding: 12px 16px;
}

.assignee-config :deep(.el-collapse-item__content) {
  padding: 16px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.assignee-config :deep(.el-collapse-item:last-child .el-collapse-item__content) {
  border-bottom: none;
}

/* 处置时长输入区域 */
.duration-input {
  display: flex;
  gap: 12px;
  align-items: center;
}

.duration-input .el-input-number {
  flex: 1;
}

.duration-input .el-select {
  width: 120px;
}

/* 处置时长表格 */
.assignee-config :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.assignee-config :deep(.el-table th) {
  background: #f8fafc;
  font-weight: 500;
  color: #334155;
}

.assignee-config :deep(.el-table tr:hover) {
  background: #f8fafc;
}

/* 无选择状态 */
.no-selection {
  color: #64748b;
  font-size: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 20px;
  background: #f8fafc;
  text-align: center;
  margin-top: 20px;
}

/* 拖拽样式 */
.ghost {
  opacity: 0.6;
  background: #eff6ff;
  border: 2px dashed #3b82f6;
  border-radius: 12px;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .three-column-layout {
    grid-template-columns: 260px 1fr 300px;
    gap: 8px;
  }
  
  .workflow-editor-page {
    padding: 16px;
    gap: 8px;
  }
}

@media (max-width: 1280px) {
  .three-column-layout {
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(300px, auto);
    height: auto;
    overflow: visible;
  }
  
  .workflow-editor-page {
    height: auto;
    min-height: 100vh;
  }
  
  .page-header,
  .top-actions {
    height: auto;
    min-height: 80px;
  }
}
</style>

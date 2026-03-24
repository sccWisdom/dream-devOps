<template>
    <div class="sla-management">
        <!-- 页面标题 -->
        <div class="page-header">
            <h2>SLA管理</h2>
            <div class="header-actions">
                <el-button type="primary" @click="handleAddProtocol">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    新增
                </el-button>
            </div>
        </div>

        <!-- 服务协议管理 -->
        <el-card class="protocol-card">
            <template #header>
                <div class="card-header">
                    <span>服务协议管理</span>
                    <div class="card-actions">
                        <el-input v-model="searchKeyword" placeholder="服务协议名称" clearable style="width: 240px"
                            prefix-icon="Search" />
                        <el-select v-model="statusFilter" placeholder="是否启用" clearable
                            style="margin-left: 12px; width: 120px">
                            <el-option label="是" value="true" />
                            <el-option label="否" value="false" />
                        </el-select>
                    </div>
                </div>
            </template>

            <!-- 协议列表 -->
            <el-table :data="filteredProtocols" stripe style="width: 100%">
                <el-table-column type="selection" width="40" />
                <el-table-column prop="id" label="序号" width="80" />
                <el-table-column prop="name" label="服务协议名称" width="200" />
                <el-table-column label="是否启用" width="180">
                    <template #default="scope">
                        <el-switch v-model="scope.row.enabled" active-text="是" inactive-text="否"
                            @change="handleStatusChange(scope.row)" />
                    </template>
                </el-table-column>
                <el-table-column prop="appCount" label="应用服务数" width="160" />
                <el-table-column prop="manager" label="负责人" width="180" />
                <el-table-column prop="updateTime" label="更新时间" width="220" />
                <el-table-column label="操作" fixed="right" width="180">
                    <template #default="scope">
                        <div class="action-buttons">
                            <el-button size="small" @click="handleEditProtocol(scope.row)">
                                <el-icon>
                                    <Edit />
                                </el-icon>
                                编辑
                            </el-button>
                            <el-button size="small" type="danger" @click="handleDeleteProtocol(scope.row.id)">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                                删除
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <!-- 新增/编辑协议弹窗 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑服务协议' : '新增服务协议'" width="900px" destroy-on-close
            :close-on-click-modal="false" :close-on-press-escape="false">
            <div class="sla-form-container">
                <el-form :model="form" label-width="140px" class="sla-form">
                    <!-- 基本信息 -->
                    <div class="form-section">
                        <div class="section-title">
                            <el-icon class="section-icon">
                                <InfoFilled />
                            </el-icon>
                            <span>基本信息</span>
                        </div>
                        <el-form-item label="服务协议名称" required>
                            <el-input v-model="form.name" placeholder="请输入服务协议名称" />
                        </el-form-item>
                        <el-form-item label="服务协议描述">
                            <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入服务协议描述" />
                        </el-form-item>
                    </div>

                    <!-- SLA协议设置 -->
                    <div class="form-section">
                        <div class="section-title">
                            <el-icon class="section-icon">
                                <Setting />
                            </el-icon>
                            <span>SLA协议设置</span>
                        </div>
                        <div class="priority-rules-container">
                            <el-button type="primary" size="small" @click="handleAddPriorityRule" class="add-rule-btn">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                                新增优先级规则
                            </el-button>
                            <el-table :data="form.priorityRules" style="margin-top: 16px" class="priority-table">
                                <el-table-column prop="priority" label="优先级" width="120">
                                    <template #default="scope">
                                        <span class="priority-tag"
                                            :class="`priority-${scope.row.priority.toLowerCase()}`">
                                            {{ scope.row.priority }}
                                        </span>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="responseTime" label="响应时长(分钟)" width="200">
                                    <template #default="scope">
                                        <span>{{ scope.row.responseTime }} 分钟</span>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="resolveTime" label="解决时长(小时)" width="200">
                                    <template #default="scope">
                                        <span>{{ scope.row.resolveTime }} 小时</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" fixed="right">
                                    <template #default="scope">
                                        <el-button size="small" type="danger" circle
                                            @click="handleDeletePriorityRule(scope.$index)" class="delete-btn">
                                            <el-icon>
                                                <Delete />
                                            </el-icon>
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>

                    <!-- 预警提醒 -->
                    <div class="form-section">
                        <div class="section-title">
                            <el-icon class="section-icon">
                                <WarningFilled />
                            </el-icon>
                            <span>预警提醒</span>
                        </div>
                        <el-form-item label="启用预警">
                            <el-switch v-model="form.warning.enabled" active-text="是" inactive-text="否"
                                class="form-switch" />
                        </el-form-item>
                        <div v-if="form.warning.enabled" class="warning-settings">
                            <el-form-item label="提醒阈值" required>
                                <div class="threshold-container">
                                    <el-input-number v-model="form.warning.threshold" :min="1" :max="100"
                                        style="width: 140px" class="form-input-number" />
                                    <span style="margin-left: 12px; color: var(--el-text-color-secondary)">%</span>
                                </div>
                            </el-form-item>
                            <el-form-item label="提醒对象" required>
                                <el-checkbox-group v-model="form.warning.notifyObjects" class="checkbox-group">
                                    <el-checkbox label="currentHandler" class="form-checkbox">当前处理人</el-checkbox>
                                    <el-checkbox label="serviceOwner" class="form-checkbox">服务负责人</el-checkbox>
                                    <el-checkbox label="requester" class="form-checkbox">工单发起人</el-checkbox>
                                </el-checkbox-group>
                            </el-form-item>
                            <el-form-item label="提醒方式" required>
                                <el-checkbox-group v-model="form.warning.notifyMethods" class="checkbox-group">
                                    <el-checkbox label="system" class="form-checkbox">系统</el-checkbox>
                                    <el-checkbox label="sms" class="form-checkbox">短信</el-checkbox>
                                </el-checkbox-group>
                            </el-form-item>
                            <el-form-item label="提醒内容" required>
                                <el-input v-model="form.warning.content" type="textarea" :rows="4"
                                    placeholder="请输入提醒内容，支持变量: ${code}, ${name}" />
                            </el-form-item>
                            <el-form-item label="提醒频率" required>
                                <el-radio-group v-model="form.warning.frequency" class="radio-group">
                                    <el-radio label="once" class="form-radio">单次</el-radio>
                                    <el-radio label="interval" class="form-radio">触发提醒阈值时</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </div>
                    </div>

                    <!-- 超时提醒 -->
                    <div class="form-section">
                        <div class="section-title">
                            <el-icon class="section-icon">
                                <Clock />
                            </el-icon>
                            <span>超时提醒</span>
                        </div>
                        <el-form-item label="启用超时提醒">
                            <el-switch v-model="form.overtime.enabled" active-text="是" inactive-text="否"
                                class="form-switch" />
                        </el-form-item>
                        <div v-if="form.overtime.enabled" class="overtime-settings">
                            <el-form-item label="提醒对象" required>
                                <el-checkbox-group v-model="form.overtime.notifyObjects" class="checkbox-group">
                                    <el-checkbox label="currentHandler" class="form-checkbox">当前处理人</el-checkbox>
                                    <el-checkbox label="serviceOwner" class="form-checkbox">服务负责人</el-checkbox>
                                    <el-checkbox label="requester" class="form-checkbox">工单发起人</el-checkbox>
                                </el-checkbox-group>
                            </el-form-item>
                            <el-form-item label="提醒方式" required>
                                <el-checkbox-group v-model="form.overtime.notifyMethods" class="checkbox-group">
                                    <el-checkbox label="system" class="form-checkbox">系统</el-checkbox>
                                    <el-checkbox label="sms" class="form-checkbox">短信</el-checkbox>
                                </el-checkbox-group>
                            </el-form-item>
                            <el-form-item label="提醒内容" required>
                                <el-input v-model="form.overtime.content" type="textarea" :rows="4"
                                    placeholder="请输入提醒内容，支持变量: ${code}, ${name}" />
                            </el-form-item>
                            <el-form-item label="提醒频率" required>
                                <el-radio-group v-model="form.overtime.frequency" class="radio-group">
                                    <el-radio label="once" class="form-radio">单次</el-radio>
                                    <el-radio label="interval" class="form-radio">触发提醒阈值时</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </div>
                    </div>
                </el-form>
            </div>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false" class="footer-btn">关闭</el-button>
                    <el-button type="primary" @click="handleSave" class="footer-btn">保存</el-button>
                    <el-button type="success" @click="handleSaveAndEnable"
                        class="footer-btn save-enable-btn">保存并启用</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Delete, Search, InfoFilled, Setting, WarningFilled, Clock } from '@element-plus/icons-vue'

// 状态管理
const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)

// 表单数据
const form = ref({
    id: '',
    name: '',
    description: '',
    enabled: true,
    priorityRules: [],
    warning: {
        enabled: true,
        threshold: 80,
        notifyObjects: ['currentHandler'],
        notifyMethods: ['system'],
        content: '"${code}-${name}" 工单即将逾期，请尽快处理！',
        frequency: 'once'
    },
    overtime: {
        enabled: true,
        notifyObjects: ['currentHandler'],
        notifyMethods: ['system'],
        content: '"${code}-${name}" 工单已超时，请尽快处理！',
        frequency: 'once'
    }
})

// 模拟数据
const protocols = ref([
    {
        id: 1,
        name: '报障单服务协议',
        description: '报障单服务的SLA协议',
        enabled: true,
        appCount: 7,
        manager: '运维经理',
        updateTime: '2026-03-03 10:47:14'
    },
    {
        id: 2,
        name: '问题单服务协议',
        description: '问题单服务的SLA协议',
        enabled: true,
        appCount: 2,
        manager: '运维经理',
        updateTime: '2026-04-02 11:05:47'
    }
])

// 计算过滤后的协议列表
const filteredProtocols = computed(() => {
    let result = [...protocols.value]

    if (searchKeyword.value) {
        result = result.filter(item =>
            item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
        )
    }

    if (statusFilter.value) {
        const status = statusFilter.value === 'true'
        result = result.filter(item => item.enabled === status)
    }

    total.value = result.length
    return result.slice(
        (currentPage.value - 1) * pageSize.value,
        currentPage.value * pageSize.value
    )
})

// 方法
const handleAddProtocol = () => {
    isEdit.value = false
    form.value = {
        id: '',
        name: '',
        description: '',
        enabled: true,
        priorityRules: [],
        warning: {
            enabled: true,
            threshold: 80,
            notifyObjects: ['currentHandler'],
            notifyMethods: ['system'],
            content: '"${code}-${name}" 工单即将逾期，请尽快处理！',
            frequency: 'once'
        },
        overtime: {
            enabled: true,
            notifyObjects: ['currentHandler'],
            notifyMethods: ['system'],
            content: '"${code}-${name}" 工单已超时，请尽快处理！',
            frequency: 'once'
        }
    }
    dialogVisible.value = true
}

const handleEditProtocol = (protocol) => {
    isEdit.value = true
    form.value = {
        ...protocol,
        priorityRules: protocol.priorityRules || [],
        warning: protocol.warning || {
            enabled: true,
            threshold: 80,
            notifyObjects: ['currentHandler'],
            notifyMethods: ['system'],
            content: '"${code}-${name}" 工单即将逾期，请尽快处理！',
            frequency: 'once'
        },
        overtime: protocol.overtime || {
            enabled: true,
            notifyObjects: ['currentHandler'],
            notifyMethods: ['system'],
            content: '"${code}-${name}" 工单已超时，请尽快处理！',
            frequency: 'once'
        }
    }
    dialogVisible.value = true
}

const handleDeleteProtocol = (id) => {
    protocols.value = protocols.value.filter(item => item.id !== id)
}

const handleStatusChange = (protocol) => {
    // 这里可以添加状态变更的逻辑
    console.log('Status changed:', protocol)
}

const handleAddPriorityRule = () => {
    form.value.priorityRules.push({
        priority: 'P1',
        responseTime: 30,
        resolveTime: 4
    })
}

const handleDeletePriorityRule = (index) => {
    form.value.priorityRules.splice(index, 1)
}

const handleSave = () => {
    if (isEdit.value) {
        const index = protocols.value.findIndex(item => item.id === form.value.id)
        if (index !== -1) {
            protocols.value[index] = { ...form.value }
        }
    } else {
        form.value.id = protocols.value.length + 1
        form.value.appCount = 0
        form.value.manager = 'PEM_DC管理员'
        form.value.updateTime = new Date().toLocaleString()
        protocols.value.push({ ...form.value })
    }
    dialogVisible.value = false
}

const handleSaveAndEnable = () => {
    form.value.enabled = true
    handleSave()
}

const handleSizeChange = (size) => {
    pageSize.value = size
    currentPage.value = 1
}

const handleCurrentChange = (current) => {
    currentPage.value = current
}

// 初始化
onMounted(() => {
    // 这里可以添加初始化逻辑
})
</script>

<style scoped>
.sla-management {
    padding: 20px;
    min-height: calc(100vh - 60px);
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.page-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
}

.header-actions {
    display: flex;
    gap: 12px;
}

.protocol-card {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: var(--el-card-header-bg);
}

.card-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.el-form-item {
    margin-bottom: 16px;
}

.el-table {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.el-table th {
    background-color: var(--el-fill-color-light);
    font-weight: 600;
    color: var(--el-text-color-primary);
}

.el-switch {
    --el-switch-on-color: var(--el-color-primary);
    --el-switch-off-color: var(--el-color-info);
}

/* 表单容器 */
.sla-form-container {
    padding: 20px 0;
}

.sla-form {
    max-height: 600px;
    overflow-y: auto;
    padding-right: 20px;
}

/* 表单区块 */
.form-section {
    margin-bottom: 32px;
    padding: 20px;
    background-color: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--el-border-color);
    transition: all 0.3s ease;
}

.form-section:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 区块标题 */
.section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--el-color-primary-light-9);
}

.section-icon {
    font-size: 18px;
    color: var(--el-color-primary);
    font-weight: 600;
}

.section-title span {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
}

/* 输入元素 */
.sla-form :deep(.el-input__wrapper) {
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
    transition: all 0.3s ease;
    box-shadow: none;
}

.sla-form :deep(.el-input__wrapper:hover) {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.sla-form :deep(.el-input__wrapper.is-focus) {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.sla-form :deep(.el-textarea__inner) {
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
    transition: all 0.3s ease;
    min-height: 100px;
    padding: 12px 16px;
    font-size: 14px;
    line-height: 1.5;
}

.sla-form :deep(.el-textarea__inner:focus) {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
    outline: none;
}

/* 移除多余的边框 */
.sla-form :deep(.el-input) {
    width: 100%;
    max-width: 500px;
}

.sla-form :deep(.el-textarea) {
    width: 100%;
    max-width: 500px;
}

.form-input-number {
    border-radius: 6px;
    border: 1px solid var(--el-border-color);
    transition: all 0.3s ease;
}

.form-input-number:focus-within {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

/* 按钮 */
.add-rule-btn {
    border-radius: 6px;
    transition: all 0.3s ease;
}

.add-rule-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.delete-btn {
    border-radius: 4px;
    transition: all 0.3s ease;
}

.delete-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3);
}

/* 表格 */
.priority-table {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid var(--el-border-color);
    transition: all 0.3s ease;
}

.priority-table:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.priority-table th {
    background-color: var(--el-fill-color-light);
    font-weight: 600;
    color: var(--el-text-color-primary);
    border-bottom: 2px solid var(--el-color-primary-light-9);
    padding: 12px 16px;
}

.priority-table td {
    vertical-align: middle;
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-light);
    transition: all 0.3s ease;
}

.priority-table tr:hover td {
    background-color: var(--el-fill-color-light);
}

/* 优先级标签 */
.priority-tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    min-width: 60px;
}

.priority-p1 {
    background-color: rgba(245, 108, 108, 0.1);
    color: var(--el-color-danger);
    border: 1px solid rgba(245, 108, 108, 0.3);
}

.priority-p2 {
    background-color: rgba(247, 186, 41, 0.1);
    color: var(--el-color-warning);
    border: 1px solid rgba(247, 186, 41, 0.3);
}

.priority-p3 {
    background-color: rgba(64, 158, 255, 0.1);
    color: var(--el-color-primary);
    border: 1px solid rgba(64, 158, 255, 0.3);
}

.priority-p4 {
    background-color: rgba(103, 194, 58, 0.1);
    color: var(--el-color-success);
    border: 1px solid rgba(103, 194, 58, 0.3);
}


/* 阈值容器 */
.threshold-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

/* 复选框和单选框 */
.checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
}

.form-checkbox {
    font-size: 14px;
    color: var(--el-text-color-primary);
    cursor: pointer;
}

.radio-group {
    display: flex;
    gap: 24px;
}

.form-radio {
    font-size: 14px;
    color: var(--el-text-color-primary);
    cursor: pointer;
}

/* 开关 */
.form-switch {
    --el-switch-on-color: var(--el-color-primary);
    --el-switch-off-color: var(--el-color-info);
    font-size: 14px;
}

/* 预警和超时设置 */
.warning-settings,
.overtime-settings {
    margin-top: 16px;
    padding: 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 6px;
    border: 1px solid var(--el-border-color);
}

/* 弹窗底部按钮 */
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    padding: 20px;
    border-top: 1px solid var(--el-border-color);
    background-color: var(--el-bg-color);
    border-radius: 0 0 8px 8px;
}

.footer-btn {
    min-width: 100px;
    height: 36px;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.footer-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.save-enable-btn {
    min-width: 120px;
}

/* 操作按钮样式 */
.action-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
}

.action-buttons .el-button {
    white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 1400px) {
    .el-table {
        font-size: 13px;
    }
    
    .el-table-column {
        &[width="200"] {
            width: 180px !important;
        }
        
        &[width="180"] {
            width: 160px !important;
        }
        
        &[width="160"] {
            width: 140px !important;
        }
        
        &[width="220"] {
            width: 200px !important;
        }
        
        &[width="180"] {
            width: 160px !important;
        }
    }
    
    .card-actions {
        gap: 8px;
    }
    
    .card-actions .el-input {
        width: 200px !important;
    }
    
    .card-actions .el-select {
        width: 100px !important;
    }
}

@media (max-width: 1200px) {
    .el-table-column {
        &[width="180"] {
            width: 160px !important;
        }
        
        &[width="160"] {
            width: 140px !important;
        }
        
        &[width="140"] {
            width: 120px !important;
        }
        
        &[width="200"] {
            width: 180px !important;
        }
        
        &[width="160"] {
            width: 140px !important;
        }
    }
    
    .card-actions {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
    
    .card-actions .el-input,
    .card-actions .el-select {
        width: 100% !important;
    }
    
    .action-buttons {
        gap: 6px;
    }
    
    .action-buttons .el-button {
        font-size: 12px;
        padding: 4px 8px;
    }
}

@media (max-width: 1024px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
    
    .header-actions {
        width: 100%;
        justify-content: flex-start;
    }
    
    .el-table-column {
        &[width="160"] {
            width: 140px !important;
        }
        
        &[width="140"] {
            width: 120px !important;
        }
        
        &[width="180"] {
            width: 160px !important;
        }
        
        &[width="220"] {
            width: 180px !important;
        }
    }
}

@media (max-width: 768px) {
    .sla-management {
        padding: 10px;
    }

    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .card-actions {
        width: 100%;
        justify-content: space-between;
    }

    .sla-form {
        padding-right: 10px;
    }

    .form-section {
        padding: 16px;
        margin-bottom: 24px;
    }

    .form-input,
    .form-textarea {
        max-width: 100%;
    }

    .checkbox-group,
    .radio-group {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }

    .dialog-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }

    .footer-btn {
        width: 100%;
    }
    
    .el-table {
        font-size: 12px;
    }
    
    .el-table-column {
        &[width="140"] {
            width: 120px !important;
        }
        
        &[width="160"] {
            width: 140px !important;
        }
        
        &[width="180"] {
            width: 160px !important;
        }
        
        &[width="220"] {
            width: 180px !important;
        }
    }
    
    .action-buttons {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
    
    .action-buttons .el-button {
        width: 100%;
        justify-content: center;
    }
}
</style>
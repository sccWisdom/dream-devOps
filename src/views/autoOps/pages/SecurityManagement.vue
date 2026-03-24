<template>
  <div class="container">
    <div class="page-title">安全管理</div>
    
    <el-tabs>
      <el-tab-pane label="操作白名单管理">
        <el-card shadow="never">
          <el-row :gutter="16" style="margin-bottom: 16px">
            <el-col :span="12" class="text-left">
              <el-input v-model="whitelistFilter" placeholder="搜索操作" style="width: 200px" />
            </el-col>
            <el-col :span="12" class="text-right">
              <el-button type="primary" @click="openWhitelistEditor">添加操作</el-button>
              <el-button @click="batchDeleteWhitelist">批量删除</el-button>
            </el-col>
          </el-row>
          <el-table :data="filteredWhitelist" border @selection-change="handleWhitelistSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="操作名称" />
            <el-table-column prop="type" label="操作类型" width="120" />
            <el-table-column prop="resource" label="适用资源" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '启用' ? 'success' : 'danger'">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-space>
                  <el-button size="small" @click="editWhitelist(scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteWhitelist(scope.row.id)">删除</el-button>
                </el-space>
              </template>
            </el-table-column>
          </el-table>
          <div style="display: flex; justify-content: flex-end; margin-top: 16px">
            <el-pagination
              v-model:current-page="whitelistPage.current"
              v-model:page-size="whitelistPage.size"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredWhitelist.length"
            />
          </div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="执行权限管理">
        <el-card shadow="never">
          <el-row :gutter="16" style="margin-bottom: 16px">
            <el-col :span="12" class="text-left">
              <el-input v-model="permissionFilter" placeholder="搜索权限" style="width: 200px" />
            </el-col>
            <el-col :span="12" class="text-right">
              <el-button type="primary" @click="openPermissionEditor">添加权限</el-button>
              <el-button @click="batchDeletePermission">批量删除</el-button>
            </el-col>
          </el-row>
          <el-table :data="filteredPermissions" border @selection-change="handlePermissionSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="role" label="角色" />
            <el-table-column prop="resource" label="资源类型" width="120" />
            <el-table-column prop="actions" label="允许操作" />
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-space>
                  <el-button size="small" @click="editPermission(scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deletePermission(scope.row.id)">删除</el-button>
                </el-space>
              </template>
            </el-table-column>
          </el-table>
          <div style="display: flex; justify-content: flex-end; margin-top: 16px">
            <el-pagination
              v-model:current-page="permissionPage.current"
              v-model:page-size="permissionPage.size"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredPermissions.length"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 操作白名单编辑弹窗 -->
    <el-dialog v-model="whitelistDialogVisible" :title="isEditingWhitelist ? '编辑操作' : '添加操作'" width="500px">
      <el-form :model="whitelistForm" label-width="100px">
        <el-form-item label="操作名称" required>
          <el-input v-model="whitelistForm.name" placeholder="请输入操作名称" />
        </el-form-item>
        <el-form-item label="操作类型" required>
          <el-select v-model="whitelistForm.type">
            <el-option label="系统操作" value="系统操作" />
            <el-option label="脚本执行" value="脚本执行" />
            <el-option label="配置修改" value="配置修改" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用资源" required>
          <el-input v-model="whitelistForm.resource" placeholder="例如：服务器、数据库" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="whitelistForm.status">
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="whitelistDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveWhitelist">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 执行权限编辑弹窗 -->
    <el-dialog v-model="permissionDialogVisible" :title="isEditingPermission ? '编辑权限' : '添加权限'" width="500px">
      <el-form :model="permissionForm" label-width="100px">
        <el-form-item label="角色" required>
          <el-select v-model="permissionForm.role">
            <el-option label="管理员" value="管理员" />
            <el-option label="运维人员" value="运维人员" />
            <el-option label="普通用户" value="普通用户" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源类型" required>
          <el-select v-model="permissionForm.resource">
            <el-option label="服务器" value="服务器" />
            <el-option label="数据库" value="数据库" />
            <el-option label="中间件" value="中间件" />
            <el-option label="网络设备" value="网络设备" />
          </el-select>
        </el-form-item>
        <el-form-item label="允许操作" required>
          <el-input v-model="permissionForm.actions" placeholder="例如：查看,编辑,执行" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePermission">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'

// 状态管理
const whitelist = ref([
  { id: '1', name: '服务器重启', type: '系统操作', resource: '服务器', status: '启用' },
  { id: '2', name: '数据库备份', type: '系统操作', resource: '数据库', status: '启用' },
  { id: '3', name: '清理临时文件', type: '脚本执行', resource: '服务器', status: '启用' },
  { id: '4', name: '修改配置文件', type: '配置修改', resource: '服务器,中间件', status: '禁用' }
])

const permissions = ref([
  { id: '1', role: '管理员', resource: '服务器', actions: '查看,编辑,执行,删除' },
  { id: '2', role: '运维人员', resource: '服务器', actions: '查看,编辑,执行' },
  { id: '3', role: '普通用户', resource: '服务器', actions: '查看' },
  { id: '4', role: '管理员', resource: '数据库', actions: '查看,编辑,执行,删除' },
  { id: '5', role: '运维人员', resource: '数据库', actions: '查看,执行' }
])

// 分页管理
const whitelistPage = ref({ current: 1, size: 10 })
const permissionPage = ref({ current: 1, size: 10 })

// 筛选条件
const whitelistFilter = ref('')
const permissionFilter = ref('')

// 选择管理
const selectedWhitelist = ref([])
const selectedPermissions = ref([])

// 弹窗管理
const whitelistDialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const isEditingWhitelist = ref(false)
const isEditingPermission = ref(false)

// 表单数据
const whitelistForm = ref({
  id: '',
  name: '',
  type: '系统操作',
  resource: '',
  status: '启用'
})

const permissionForm = ref({
  id: '',
  role: '运维人员',
  resource: '服务器',
  actions: ''
})

// 计算属性
const filteredWhitelist = computed(() => {
  return whitelist.value.filter(item => 
    item.name.toLowerCase().includes(whitelistFilter.value.toLowerCase())
  )
})

const filteredPermissions = computed(() => {
  return permissions.value.filter(item => 
    item.role.toLowerCase().includes(permissionFilter.value.toLowerCase()) ||
    item.resource.toLowerCase().includes(permissionFilter.value.toLowerCase())
  )
})

// 方法
const handleWhitelistSelectionChange = (val) => {
  selectedWhitelist.value = val
}

const handlePermissionSelectionChange = (val) => {
  selectedPermissions.value = val
}

const openWhitelistEditor = () => {
  isEditingWhitelist.value = false
  whitelistForm.value = {
    id: '',
    name: '',
    type: '系统操作',
    resource: '',
    status: '启用'
  }
  whitelistDialogVisible.value = true
}

const editWhitelist = (item) => {
  isEditingWhitelist.value = true
  whitelistForm.value = { ...item }
  whitelistDialogVisible.value = true
}

const saveWhitelist = () => {
  if (isEditingWhitelist.value) {
    const index = whitelist.value.findIndex(item => item.id === whitelistForm.value.id)
    if (index !== -1) {
      whitelist.value[index] = whitelistForm.value
    }
  } else {
    whitelist.value.push({
      ...whitelistForm.value,
      id: Date.now().toString()
    })
  }
  whitelistDialogVisible.value = false
}

const deleteWhitelist = (id) => {
  whitelist.value = whitelist.value.filter(item => item.id !== id)
}

const batchDeleteWhitelist = () => {
  const ids = selectedWhitelist.value.map(item => item.id)
  whitelist.value = whitelist.value.filter(item => !ids.includes(item.id))
  selectedWhitelist.value = []
}

const openPermissionEditor = () => {
  isEditingPermission.value = false
  permissionForm.value = {
    id: '',
    role: '运维人员',
    resource: '服务器',
    actions: ''
  }
  permissionDialogVisible.value = true
}

const editPermission = (item) => {
  isEditingPermission.value = true
  permissionForm.value = { ...item }
  permissionDialogVisible.value = true
}

const savePermission = () => {
  if (isEditingPermission.value) {
    const index = permissions.value.findIndex(item => item.id === permissionForm.value.id)
    if (index !== -1) {
      permissions.value[index] = permissionForm.value
    }
  } else {
    permissions.value.push({
      ...permissionForm.value,
      id: Date.now().toString()
    })
  }
  permissionDialogVisible.value = false
}

const deletePermission = (id) => {
  permissions.value = permissions.value.filter(item => item.id !== id)
}

const batchDeletePermission = () => {
  const ids = selectedPermissions.value.map(item => item.id)
  permissions.value = permissions.value.filter(item => !ids.includes(item.id))
  selectedPermissions.value = []
}
</script>
<style scoped>
.container {
  padding: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}
</style>
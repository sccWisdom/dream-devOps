<template>
  <el-container style="height: 100vh">
    <el-aside width="240px" class="sidebar">
      <div class="brand">
        <div class="logo"></div>
        <div class="brand-text">智能运维平台</div>
      </div>
      <el-menu ref="menuRef" :default-active="active" :unique-opened="true" class="menu" @select="onSelect" router>
        <el-sub-menu index="workbench">
          <template #title>工作台</template>
          <el-menu-item index="/workbench/service-portal">服务门户</el-menu-item>
          <el-menu-item index="/workbench/work-center">工作中心</el-menu-item>
          <el-menu-item index="/workbench/all-tickets">所有工单</el-menu-item>
          <el-menu-item index="/screen/monitor">监控大屏</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="ops-report">
          <template #title>运维报表</template>
          <el-menu-item index="/ops-report/daily-weekly">运维日报、周报</el-menu-item>
          <el-menu-item index="/ops-report/monitor-statistics">监控统计报表</el-menu-item>
          <el-menu-item index="/ops-report/system-inspection">系统巡检报表</el-menu-item>
          <el-menu-item index="/ops-report/platform-delivery">平台交维报表</el-menu-item>
          <el-menu-item index="/ops-report/data-delivery">数据交维报表</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="itsm">
          <template #title>ITSM</template>
          <el-menu-item index="/dashboard/event">事件管理</el-menu-item>
          <el-menu-item index="/dashboard/problem">问题管理</el-menu-item>
          <el-menu-item index="/dashboard/change">变更管理</el-menu-item>
          <el-menu-item index="/dashboard/release">发布管理</el-menu-item>
          <el-menu-item index="/dashboard/priority">优先级管理</el-menu-item>
          <el-menu-item index="/dashboard/sla">SLA管理</el-menu-item>
          <el-menu-item index="/dashboard/ticket-workflow">服务配置</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="duty">
          <template #title>值班管理</template>
          <el-menu-item index="/duty/shifts">班次管理</el-menu-item>
          <el-menu-item index="/duty/schedule">排班管理</el-menu-item>
          <el-menu-item index="/duty/mine">我的值班</el-menu-item>
          <el-menu-item index="/duty/on-duty">值班在岗</el-menu-item>
          <el-menu-item index="/duty/notifications">值班通知</el-menu-item>
          <el-menu-item index="/duty/stats">值班统计</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="kb">
          <template #title>知识库</template>
          <el-menu-item index="/kb/portal">知识门户</el-menu-item>
          <el-menu-item index="/kb/my-knowledge">我的知识</el-menu-item>
          <el-menu-item index="/kb/articles">知识管理</el-menu-item>
          <el-menu-item index="/kb/config">基础配置</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="cmdb">
          <template #title>CMDB</template>
          <el-menu-item index="/cmdb/model">资源模型</el-menu-item>
          <el-menu-item index="/cmdb/ci">配置项</el-menu-item>
          <el-menu-item index="/cmdb/topology">关系拓扑</el-menu-item>
          <el-menu-item index="/cmdb/lifecycle">生命周期</el-menu-item>
          <el-menu-item index="/cmdb/change-audit">变更联动</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="alarm">
          <template #title>监控告警</template>
          <el-menu-item index="/alarm/overview">监控告警总览</el-menu-item>
          <el-menu-item index="/alarm/center">监控中心</el-menu-item>
          <el-menu-item index="/alarm/lifecycle">告警信息列表</el-menu-item>
          <!-- <el-menu-item index="/alarm/source">多源告警接入</el-menu-item> -->
          <el-menu-item index="/alarm/rule">告警规则配置</el-menu-item>
          <el-menu-item index="/alarm/notification">告警通知配置</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="logs">
          <template #title>日志管理</template>
          <el-menu-item index="/logs/collection">日志采集配置</el-menu-item>
          <el-menu-item index="/logs/error-board">错误日志看板</el-menu-item>
          <el-menu-item index="/logs/parser">日志智能解析</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="auto-ops">
          <template #title>自动化运维</template>
          <el-menu-item index="/auto-ops/rule-library">处置规则库</el-menu-item>
          <el-menu-item index="/auto-ops/statistics">统计分析</el-menu-item>
          <el-menu-item index="/auto-ops/security">安全管理</el-menu-item>
          <el-menu-item index="/auto-ops/tools">工具集成</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="system">
          <template #title>系统管理</template>
          <el-menu-item index="/system/user">用户管理</el-menu-item>
          <el-menu-item index="/system/role">角色管理</el-menu-item>
          <el-menu-item index="/system/permission">权限管理</el-menu-item>
          <el-menu-item index="/system/setting">系统设置</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.parentMenu">{{ route.meta.parentMenu }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="right">
          <el-switch v-model="dark" inline-prompt :active-text="'深色'" :inactive-text="'浅色'"/>
          <el-dropdown>
            <span class="el-dropdown-link">
              admin
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>设置</el-dropdown-item>
                <el-dropdown-item>退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const menuRef = ref()
const active = computed(() => route.path)
const title = computed(() => route.meta?.title || '')
const dark = ref(false)
const ROOT_MENU_INDEXES = ['workbench', 'ops-report', 'itsm', 'duty', 'kb', 'cmdb', 'alarm', 'logs', 'auto-ops', 'system']

const resolveRootMenu = (path) => {
  if (path.startsWith('/workbench') || path.startsWith('/screen')) return 'workbench'
  if (path.startsWith('/ops-report')) return 'ops-report'
  if (path.startsWith('/dashboard')) return 'itsm'
  if (path.startsWith('/duty')) return 'duty'
  if (path.startsWith('/kb')) return 'kb'
  if (path.startsWith('/cmdb')) return 'cmdb'
  if (path.startsWith('/alarm')) return 'alarm'
  if (path.startsWith('/logs')) return 'logs'
  if (path.startsWith('/auto-ops')) return 'auto-ops'
  if (path.startsWith('/system')) return 'system'
  return ''
}

watch(
  () => route.path,
  async (path) => {
    await nextTick()
    if (!menuRef.value) return
    const currentRoot = resolveRootMenu(path)
    ROOT_MENU_INDEXES.forEach((index) => {
      if (index === currentRoot) {
        menuRef.value.open(index)
        return
      }
      menuRef.value.close(index)
    })
  },
  { immediate: true }
)

watch(dark, v => {
  document.documentElement.classList.toggle('dark', v)
})
const onSelect = (path) => {
  if (path !== route.path) router.push(path)
}
</script>
<style scoped>
.sidebar {
  background: linear-gradient(180deg, #0b1220 0%, #0f1b33 100%);
  color: #e5e7eb;
  border-right: 1px solid #152036;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
}
.logo {
  width: 24px;
  height: 24px;
  background-image: url('/logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 4px;
}
.brand-text {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.2px;
}
.menu {
  border-right: none;
  background: transparent;
}
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  background: rgba(255,255,255,0.85);
  backdrop-filter: saturate(180%) blur(8px);
}
.right {
  display: flex;
  align-items: center;
  gap: 12px;
}
:global(.dark) .header {
  background: rgba(15, 27, 51, 0.7);
  border-bottom-color: #152036;
}
:global(.dark) .sidebar {
  background: linear-gradient(180deg, #0b1220 0%, #0f1b33 100%);
  border-right-color: #152036;
}
</style>

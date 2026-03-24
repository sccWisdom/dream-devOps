import { createRouter, createWebHashHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import BasicLayout from '../layouts/BasicLayout.vue'
import ScreenLayout from '../layouts/ScreenLayout.vue'
import ServicePortal from '../views/workbench/ServicePortal.vue'
import WorkCenter from '../views/workbench/WorkCenter.vue'
import AllTickets from '../views/workbench/AllTickets.vue'
import MonitorScreen from '../views/workbench/MonitorScreen.vue'
import DailyWeeklyReport from '../views/opsReports/pages/DailyWeeklyReport.vue'
import MonitorStatisticsReport from '../views/opsReports/pages/MonitorStatisticsReport.vue'
import SystemInspectionReport from '../views/opsReports/pages/SystemInspectionReport.vue'
import PlatformDeliveryReport from '../views/opsReports/pages/PlatformDeliveryReport.vue'
import DataDeliveryReport from '../views/opsReports/pages/DataDeliveryReport.vue'
import TicketWorkflow from '../views/dashboard/ticketWorkflow/TicketWorkflow.vue'
import WorkflowEditor from '../views/dashboard/ticketWorkflow/WorkflowEditor.vue'
import EventManagement from '../views/dashboard/eventManagement/EventManagement.vue'
import ProblemManagement from '../views/dashboard/problemManagement/ProblemManagement.vue'
import ChangeManagement from '../views/dashboard/changeManagement/ChangeManagement.vue'
import ReleaseManagement from '../views/dashboard/releaseManagement/ReleaseManagement.vue'
import PriorityManagement from '../views/dashboard/priorityManagement/PriorityManagement.vue'
import SlaManagement from '../views/dashboard/slaManagement/SlaManagement.vue'
import DutySchedule from '../views/dutyManagement/pages/ScheduleManagement.vue'
import DutyShifts from '../views/dutyManagement/pages/ShiftManagement.vue'
import DutyMine from '../views/dutyManagement/pages/MyDuty.vue'
import DutyOnDuty from '../views/dutyManagement/pages/OnDuty.vue'
import DutyNotifications from '../views/dutyManagement/pages/Notifications.vue'
import DutyStats from '../views/dutyManagement/pages/DutyStats.vue'
import KbArticles from '../views/knowledgeBase/pages/Articles.vue'
import KbBaseConfig from '../views/knowledgeBase/pages/BaseConfig.vue'
import KnowledgePortal from '../views/knowledgeBase/pages/KnowledgePortal.vue'
import MyKnowledge from '../views/knowledgeBase/pages/MyKnowledge.vue'
import CmdbModelPage from '../views/resource/cmdb/pages/ModelPage.vue'
import CmdbCiPage from '../views/resource/cmdb/pages/CiPage.vue'
import CmdbTopologyPage from '../views/resource/cmdb/pages/TopologyPage.vue'
import CmdbLifecyclePage from '../views/resource/cmdb/pages/LifecyclePage.vue'
import CmdbChangeAuditPage from '../views/resource/cmdb/pages/ChangeAuditPage.vue'
import AlarmSourcePage from '../views/monitorAlarm/pages/AlarmSourcePage.vue'
import AlarmRulePage from '../views/monitorAlarm/pages/AlarmRulePage.vue'
import AlarmLifecyclePage from '../views/monitorAlarm/pages/AlarmLifecyclePage.vue'
import AlarmNotificationPage from '../views/monitorAlarm/pages/AlarmNotificationPage.vue'
import MonitorCenterPage from '../views/monitorAlarm/pages/MonitorCenterPage.vue'
import MonitorAlarmOverviewPage from '../views/monitorAlarm/pages/MonitorAlarmOverviewPage.vue'
import LogSearchPage from '../views/logManagement/pages/LogSearchPage.vue'
import LogAnalysisPage from '../views/logManagement/pages/LogAnalysisPage.vue'
import LogCollectionPage from '../views/logManagement/pages/LogCollectionPage.vue'
import ErrorLogBoard from '../views/logManagement/pages/ErrorLogBoard.vue'
import LogParserPage from '../views/logManagement/pages/LogParserPage.vue'
import RuleLibrary from '../views/autoOps/pages/RuleLibrary.vue'
import SecurityManagement from '../views/autoOps/pages/SecurityManagement.vue'
import ToolIntegration from '../views/autoOps/pages/ToolIntegration.vue'
import Statistics from '../views/autoOps/pages/Statistics.vue'
import User from '../views/systemPermission/user/User.vue'
import Role from '../views/systemPermission/role/Role.vue'
import Permission from '../views/systemPermission/permission/Permission.vue'
import Setting from '../views/systemPermission/setting/Setting.vue'
import { pinia } from '../store/pinia'
import { useUserStore } from '../store/modules/user'

const routes = [
  {
    path: '/',
    component: BasicLayout,
    children: [
      { path: '', redirect: '/workbench/service-portal' },
      { path: 'workbench/service-portal', name: 'ServicePortal', component: ServicePortal, meta: { title: '服务门户', parentMenu: '工作台' } },
      { path: 'workbench/work-center', name: 'WorkCenter', component: WorkCenter, meta: { title: '工作中心', parentMenu: '工作台' } },
      { path: 'workbench/all-tickets', name: 'AllTickets', component: AllTickets, meta: { title: '所有工单', parentMenu: '工作台' } },
      { path: 'workbench/reports', redirect: '/ops-report/daily-weekly' }
    ]
  },
  {
    path: '/ops-report',
    component: BasicLayout,
    children: [
      { path: '', redirect: '/ops-report/daily-weekly' },
      { path: 'daily-weekly', name: 'OpsDailyWeekly', component: DailyWeeklyReport, meta: { title: '运维日报、周报', parentMenu: '运维报表' } },
      { path: 'monitor-statistics', name: 'OpsMonitorStatistics', component: MonitorStatisticsReport, meta: { title: '监控统计报表', parentMenu: '运维报表' } },
      { path: 'system-inspection', name: 'OpsSystemInspection', component: SystemInspectionReport, meta: { title: '系统巡检报表', parentMenu: '运维报表' } },
      { path: 'platform-delivery', name: 'OpsPlatformDelivery', component: PlatformDeliveryReport, meta: { title: '平台交维报表', parentMenu: '运维报表' } },
      { path: 'data-delivery', name: 'OpsDataDelivery', component: DataDeliveryReport, meta: { title: '数据交维报表', parentMenu: '运维报表' } }
    ]
  },
  {
    path: '/dashboard',
    component: BasicLayout,
    children: [
      { path: 'event', name: 'EventManagement', component: EventManagement, meta: { title: '事件管理', parentMenu: 'ITSM' } },
      { path: 'problem', name: 'ProblemManagement', component: ProblemManagement, meta: { title: '问题管理', parentMenu: 'ITSM' } },
      { path: 'change', name: 'ChangeManagement', component: ChangeManagement, meta: { title: '变更管理', parentMenu: 'ITSM' } },
      { path: 'release', name: 'ReleaseManagement', component: ReleaseManagement, meta: { title: '发布管理', parentMenu: 'ITSM' } },
      { path: 'priority', name: 'PriorityManagement', component: PriorityManagement, meta: { title: '优先级管理', parentMenu: 'ITSM' } },
      { path: 'sla', name: 'SlaManagement', component: SlaManagement, meta: { title: 'SLA管理', parentMenu: 'ITSM' } },
      { path: 'ticket-workflow', name: 'TicketWorkflow', component: TicketWorkflow, meta: { title: '服务配置', parentMenu: 'ITSM' } },
      { path: 'ticket-workflow/edit/:id', name: 'WorkflowEditor', component: WorkflowEditor, meta: { title: '服务配置编辑', parentMenu: 'ITSM' } }
    ]
  },
  {
    path: '/duty',
    component: BasicLayout,
    children: [
      { path: '', redirect: '/duty/schedule' },
      { path: 'schedule', name: 'DutySchedule', component: DutySchedule, meta: { title: '排班管理', parentMenu: '值班管理' } },
      { path: 'shifts', name: 'DutyShifts', component: DutyShifts, meta: { title: '班次管理', parentMenu: '值班管理' } },
      { path: 'mine', name: 'DutyMine', component: DutyMine, meta: { title: '我的值班', parentMenu: '值班管理' } },
      { path: 'on-duty', name: 'DutyOnDuty', component: DutyOnDuty, meta: { title: '值班在岗', parentMenu: '值班管理' } },
      { path: 'notifications', name: 'DutyNotifications', component: DutyNotifications, meta: { title: '值班通知', parentMenu: '值班管理' } },
      { path: 'stats', name: 'DutyStats', component: DutyStats, meta: { title: '值班统计', parentMenu: '值班管理' } }
    ]
  },
  {
    path: '/kb',
    component: BasicLayout,
    children: [
      { path: '', redirect: '/kb/portal' },
      { path: 'portal', name: 'KnowledgePortal', component: KnowledgePortal, meta: { title: '知识门户', parentMenu: '知识库' } },
      { path: 'my-knowledge', name: 'MyKnowledge', component: MyKnowledge, meta: { title: '我的知识', parentMenu: '知识库' } },
      { path: 'articles', name: 'KbArticles', component: KbArticles, meta: { title: '知识管理', parentMenu: '知识库' } },
      { path: 'config', name: 'KbBaseConfig', component: KbBaseConfig, meta: { title: '基础配置', parentMenu: '知识库' } }
    ]
  },
  {
    path: '/cmdb',
    component: BasicLayout,
    meta: { roles: ['管理员', '运维'] },
    children: [
      { path: '', redirect: '/cmdb/model' },
      { path: 'model', name: 'CmdbModel', component: CmdbModelPage, meta: { title: '资源模型', parentMenu: 'CMDB' } },
      { path: 'ci', name: 'CmdbCi', component: CmdbCiPage, meta: { title: '配置项', parentMenu: 'CMDB' } },
      { path: 'topology', name: 'CmdbTopology', component: CmdbTopologyPage, meta: { title: '关系拓扑', parentMenu: 'CMDB' } },
      { path: 'lifecycle', name: 'CmdbLifecycle', component: CmdbLifecyclePage, meta: { title: '生命周期', parentMenu: 'CMDB' } },
      { path: 'change-audit', name: 'CmdbChangeAudit', component: CmdbChangeAuditPage, meta: { title: '变更联动', parentMenu: 'CMDB' } }
    ]
  },
  {
    path: '/alarm',
    component: BasicLayout,
    children: [
      { path: '', redirect: '/alarm/overview' },
      { path: 'overview', name: 'MonitorAlarmOverview', component: MonitorAlarmOverviewPage, meta: { title: '监控告警总览', parentMenu: '监控告警' } },
      { path: 'center', name: 'MonitorCenter', component: MonitorCenterPage, meta: { title: '监控中心', parentMenu: '监控告警' } },
      { path: 'lifecycle', name: 'AlarmLifecycle', component: AlarmLifecyclePage, meta: { title: '告警信息列表', parentMenu: '监控告警' } },
      // { path: 'source', name: 'AlarmSource', component: AlarmSourcePage, meta: { title: '多源告警接入', parentMenu: '监控告警' } },
      { path: 'rule', name: 'AlarmRule', component: AlarmRulePage, meta: { title: '告警规则配置', parentMenu: '监控告警' } },
      { path: 'notification', name: 'AlarmNotification', component: AlarmNotificationPage, meta: { title: '告警通知配置', parentMenu: '监控告警' } }
    ]
  },
  {
    path: '/logs',
    component: BasicLayout,
    children: [
      { path: '', redirect: '/logs/search' },
      { path: 'search', name: 'LogSearch', component: LogSearchPage, meta: { title: '日志检索查询', parentMenu: '日志管理' } },
      { path: 'analysis', name: 'LogAnalysis', component: LogAnalysisPage, meta: { title: '日志智能分析', parentMenu: '日志管理' } },
      { path: 'collection', name: 'LogCollection', component: LogCollectionPage, meta: { title: '日志采集配置', parentMenu: '日志管理' } },
      { path: 'error-board', name: 'ErrorLogBoard', component: ErrorLogBoard, meta: { title: '错误日志看板', parentMenu: '日志管理' } },
      { path: 'parser', name: 'LogParser', component: LogParserPage, meta: { title: '日志智能解析', parentMenu: '日志管理' } }
    ]
  },
  {
    path: '/auto-ops',
    component: BasicLayout,
    children: [
      { path: '', redirect: '/auto-ops/rule-library' },
      { path: 'rule-library', name: 'RuleLibrary', component: RuleLibrary, meta: { title: '处置规则库', parentMenu: '自动化运维' } },
      { path: 'statistics', name: 'Statistics', component: Statistics, meta: { title: '统计分析', parentMenu: '自动化运维' } },
      { path: 'security', name: 'SecurityManagement', component: SecurityManagement, meta: { title: '安全管理', parentMenu: '自动化运维' } },
      { path: 'tools', name: 'ToolIntegration', component: ToolIntegration, meta: { title: '工具集成', parentMenu: '自动化运维' } }
    ]
  },
  {
    path: '/system',
    component: BasicLayout,
    children: [
      { path: 'user', name: 'UserManage', component: User, meta: { title: '用户管理', parentMenu: '系统管理', roles: ['管理员'] } },
      { path: 'role', name: 'RoleManage', component: Role, meta: { title: '角色管理', parentMenu: '系统管理', roles: ['管理员'] } },
      { path: 'permission', name: 'PermissionManage', component: Permission, meta: { title: '权限管理', parentMenu: '系统管理', roles: ['管理员'] } },
      { path: 'setting', name: 'Setting', component: Setting, meta: { title: '系统设置', parentMenu: '系统管理', roles: ['管理员'] } }
    ]
  },
  {
    path: '/screen',
    component: ScreenLayout,
    children: [
      { path: 'monitor', name: 'MonitorScreen', component: MonitorScreen, meta: { title: '监控大屏', parentMenu: '工作台' } }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  const roles = to.meta?.roles
  if (!roles) return true
  const user = useUserStore(pinia)
  const ok = roles.includes(user.role)
  if (ok) return true
  ElMessage.error('无权限访问')
  return { path: '/workbench/service-portal' }
})

export default router

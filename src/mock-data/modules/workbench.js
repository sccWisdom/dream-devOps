export function getServiceCatalog() {
  return Promise.resolve([
    {
      id: 'svc-request-01',
      name: '请求管理类型的服务',
      categoryKey: 'requestMgmt',
      categoryLabel: '请求管理',
      majorType: 'request',
      priority: 'P3',
      icon: 'tickets',
      starred: false,
      submittedCount: 2,
      desc: '组织设定建立管理的过程，整体规划建立管理流程，提高快速响应的能力。'
    },
    {
      id: 'svc-incident-01',
      name: '事件管理类型的服务',
      categoryKey: 'incidentMgmt',
      categoryLabel: '事件管理',
      majorType: 'incident',
      priority: 'P2',
      icon: 'warning-filled',
      starred: false,
      submittedCount: 2,
      desc: '组织设定建立管理的过程，确保具有及时解决事件的能力。'
    },
    {
      id: 'svc-release-01',
      name: '发布管理类型的服务',
      categoryKey: 'releaseMgmt',
      categoryLabel: '发布管理',
      majorType: 'release',
      priority: 'P1',
      icon: 'promotion',
      starred: true,
      submittedCount: 2,
      desc: '组织设定建立管理的过程，确保具有高效发布的能力。'
    },
    {
      id: 'svc-problem-01',
      name: '问题管理类型的服务',
      categoryKey: 'problemMgmt',
      categoryLabel: '问题管理',
      majorType: 'problem',
      priority: 'P1',
      icon: 'question-filled',
      starred: false,
      submittedCount: 2,
      desc: '组织设定建立管理的过程，分析问题根本原因并确定解决方案。'
    },
    {
      id: 'svc-change-01',
      name: '变更管理类型的服务',
      categoryKey: 'changeMgmt',
      categoryLabel: '变更管理',
      majorType: 'change',
      priority: 'P2',
      icon: 'setting',
      starred: false,
      submittedCount: 2,
      desc: '组织设定建立管理的过程，确保变更有序实施。'
    },
    {
      id: 'svc-incident-02',
      name: '事件管理类型的服务',
      categoryKey: 'incidentMgmt',
      categoryLabel: '事件管理',
      majorType: 'incident',
      priority: 'P2',
      icon: 'warning-filled',
      starred: true,
      submittedCount: 2,
      desc: '组织设定建立管理的过程，确保具有及时解决事件的能力。'
    },
    {
      id: 'svc-request-02',
      name: '请求管理类型的服务',
      categoryKey: 'requestMgmt',
      categoryLabel: '请求管理',
      majorType: 'request',
      priority: 'P3',
      icon: 'tickets',
      starred: false,
      submittedCount: 2,
      desc: '组织设定建立管理的过程，整体规划建立管理流程，提高快速响应的能力。'
    },
    {
      id: 'svc-problem-02',
      name: '问题管理类型的服务',
      categoryKey: 'problemMgmt',
      categoryLabel: '问题管理',
      majorType: 'problem',
      priority: 'P1',
      icon: 'question-filled',
      starred: false,
      submittedCount: 2,
      desc: '组织设定建立管理的过程，分析问题根本原因并确定解决方案。'
    },
    {
      id: 'svc-change-02',
      name: '变更管理类型的服务',
      categoryKey: 'changeMgmt',
      categoryLabel: '变更管理',
      majorType: 'change',
      priority: 'P2',
      icon: 'setting',
      starred: false,
      submittedCount: 2,
      desc: '组织设定建立管理的过程，确保变更有序实施。'
    },
    {
      id: 'svc-release-02',
      name: '发布管理类型的服务',
      categoryKey: 'releaseMgmt',
      categoryLabel: '发布管理',
      majorType: 'release',
      priority: 'P1',
      icon: 'promotion',
      starred: false,
      submittedCount: 2,
      desc: '组织设定建立管理的过程，确保具有高效发布的能力。'
    }
  ])
}

export function getTodayOverview() {
  return Promise.resolve({
    todo: 45,
    backlog: 23,
    suspended: 12,
    overtime: 5,
    resolved: 76
  })
}

export function getChangeCalendar() {
  return Promise.resolve([
    { date: '2026-03-18', title: '核心系统版本升级' },
    { date: '2026-03-19', title: '数据库巡检' }
  ])
}

export function getDutyCalendar() {
  return Promise.resolve([
    { date: '2026-03-18', user: '王伟' },
    { date: '2026-03-19', user: '李静' }
  ])
}

export function getMonitorSeries() {
  const r = prng(20260318)
  const base = []
  let v = 98
  for (let i = 0; i < 24; i++) {
    const jitter = Math.round((r() - 0.5) * 4)
    v = clamp(v + jitter, 92, 100)
    base.push({ name: `${i}:00`, value: v })
  }
  return Promise.resolve(base)
}

export function getReportData() {
  const r = prng(20260318)
  const trend = Array.from({ length: 7 }).map((_, i) => ({ name: `周${i + 1}`, value: Math.round(60 + r() * 80) }))
  const byType = [
    { name: '事件', open: Math.round(8 + r() * 16), closed: Math.round(30 + r() * 36) },
    { name: '问题', open: Math.round(2 + r() * 8), closed: Math.round(6 + r() * 12) },
    { name: '变更', open: Math.round(3 + r() * 10), closed: Math.round(10 + r() * 18) },
    { name: '发布', open: Math.round(1 + r() * 6), closed: Math.round(6 + r() * 12) }
  ]
  const priorityPie = [
    { name: 'P1', value: Math.round(8 + r() * 10) },
    { name: 'P2', value: Math.round(18 + r() * 16) },
    { name: 'P3', value: Math.round(40 + r() * 26) }
  ]
  const topSystems = [
    { name: '政务服务网', value: Math.round(30 + r() * 60) },
    { name: '统一认证', value: Math.round(20 + r() * 50) },
    { name: '数据交换', value: Math.round(16 + r() * 40) },
    { name: '消息总线', value: Math.round(12 + r() * 34) },
    { name: '运维门户', value: Math.round(8 + r() * 28) }
  ]
  const total = byType.reduce((acc, i) => acc + i.open + i.closed, 0)
  const resolved = byType.reduce((acc, i) => acc + i.closed, 0)
  const overtime = Math.round(3 + r() * 6)
  const avgResponseMin = Math.round(6 + r() * 18)

  return Promise.resolve({
    kpi: {
      total,
      resolved,
      overtime,
      avgResponseMin,
      topSystem: topSystems[0]?.name || ''
    },
    trend,
    byType,
    priorityPie,
    topSystems,
    pie: [
      { name: '事件', value: 52 },
      { name: '问题', value: 12 },
      { name: '变更', value: 18 },
      { name: '发布', value: 9 }
    ],
    latest: [
      { id: 'INC-20260318-1021', type: '事件', title: '核心接口错误率升高', priority: 'P1', status: '处理中', system: '政务服务网' },
      { id: 'INC-20260318-1016', type: '事件', title: '数据库连接数逼近阈值', priority: 'P2', status: '已通知', system: '统一认证' },
      { id: 'CHG-20260318-0088', type: '变更', title: '核心系统版本升级验证', priority: 'P2', status: '待审批', system: '数据交换' },
      { id: 'REQ-20260318-0312', type: '请求', title: '账号权限开通', priority: 'P3', status: '待处理', system: '运维门户' }
    ]
  })
}

export function getMonitorDashboard() {
  const r = prng(20260318)
  const successTrend = []
  let v = 98
  for (let i = 0; i < 24; i++) {
    const jitter = Math.round((r() - 0.5) * 4)
    v = clamp(v + jitter, 92, 100)
    successTrend.push({ name: `${i}:00`, value: v })
  }
  const alarmTrend = successTrend.map((i, idx) => ({
    name: i.name,
    value: Math.max(0, Math.round((100 - i.value) * 0.9 + (idx % 3) * 2))
  }))
  const typeDist = [
    { name: '主机', value: Math.round(28 + r() * 18) },
    { name: '应用', value: Math.round(18 + r() * 14) },
    { name: '数据库', value: Math.round(12 + r() * 10) },
    { name: '中间件', value: Math.round(10 + r() * 8) }
  ]
  const avgSuccess = Math.round(successTrend.reduce((acc, i) => acc + i.value, 0) / successTrend.length)
  return Promise.resolve({
    kpi: {
      health: clamp(avgSuccess + 1, 0, 100),
      avgSuccess,
      alarmTotal: alarmTrend.reduce((acc, i) => acc + i.value, 0)
    },
    successTrend,
    alarmTrend,
    typeDist,
    latestAlarms: [
      { id: 'a1', severity: 'P1', title: '核心接口错误率升高', system: '政务服务网', time: '2分钟前', status: '处理中' },
      { id: 'a2', severity: 'P2', title: '数据库连接数逼近阈值', system: '统一认证', time: '6分钟前', status: '已通知' },
      { id: 'a3', severity: 'P2', title: '主机 CPU 持续高占用', system: '数据交换', time: '12分钟前', status: '处理中' },
      { id: 'a4', severity: 'P3', title: '中间件队列堆积', system: '消息总线', time: '18分钟前', status: '观察中' },
      { id: 'a5', severity: 'P3', title: '应用实例重启次数异常', system: '运维门户', time: '25分钟前', status: '观察中' }
    ]
  })
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function prng(seed) {
  let s = seed % 233280
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

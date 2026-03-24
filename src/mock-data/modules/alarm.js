import { hasApiBase, requestJson } from '@/services/http'

const alarmTypes = [
  { key: 'host', label: '主机类告警', cmdbBound: true },
  { key: 'database', label: '数据库告警', cmdbBound: true },
  { key: 'middleware', label: '中间件告警', cmdbBound: true },
  { key: 'service', label: '服务类告警', cmdbBound: true },
  { key: 'task', label: '任务类告警', cmdbBound: false }
]

const levelRankMap = {
  一级告警: 1,
  二级告警: 2,
  三级告警: 3
}

const validStatus = ['未处理', '处理中', '已恢复', '已忽略']

let alarmSeed = [
  {
    id: 'ALM-H-001',
    type: 'host',
    title: '主机 CPU 持续高负载',
    objectName: '统一工具应用主机',
    ip: '10.1.2.3',
    subsystem: '统一工具',
    bizSystem: '统一服务总线',
    ciName: 'ci-host-1',
    operator: '移动',
    vendor: '普元',
    level: '一级告警',
    status: '未处理',
    content: 'CPU 使用率连续10分钟超过92%。',
    firstOccurredAt: '2026-03-24 08:10:00',
    lastOccurredAt: '2026-03-24 08:28:00',
    dispatched: false,
    eventNo: ''
  },
  {
    id: 'ALM-H-002',
    type: 'host',
    title: '磁盘使用量超过85%',
    objectName: '数据质量应用主机',
    ip: '10.1.2.4',
    subsystem: '数据质量系统',
    bizSystem: '数据质量系统',
    ciName: 'ci-host-2',
    operator: '移动',
    vendor: '双杨',
    level: '二级告警',
    status: '处理中',
    content: '磁盘使用量超过85%。',
    firstOccurredAt: '2026-03-24 07:35:00',
    lastOccurredAt: '2026-03-24 08:22:00',
    dispatched: true,
    eventNo: 'INC-20260324001'
  },
  {
    id: 'ALM-H-003',
    type: 'host',
    title: '主机内存可用量过低',
    objectName: 'AI数博士应用主机',
    ip: '10.9.1.15',
    subsystem: 'AI智能问答',
    bizSystem: 'AI智能问答',
    ciName: 'ci-host-3',
    operator: '移动',
    vendor: '双杨',
    level: '三级告警',
    status: '已恢复',
    content: '可用内存低于20%，持续1分钟。',
    firstOccurredAt: '2026-03-23 22:11:00',
    lastOccurredAt: '2026-03-23 22:26:00',
    dispatched: false,
    eventNo: ''
  },
  {
    id: 'ALM-DB-001',
    type: 'database',
    title: '数据库慢查询突增',
    objectName: '移动门户达梦数据库',
    ip: '10.3.8.21',
    subsystem: '数据库监控',
    bizSystem: '统一门户',
    ciName: 'ci-db-1',
    operator: '移动',
    vendor: '双杨',
    level: '一级告警',
    status: '处理中',
    content: '1 分钟内慢查询数超过阈值 500，平均响应升至 2.3 秒。',
    firstOccurredAt: '2026-03-24 08:01:00',
    lastOccurredAt: '2026-03-24 08:29:00',
    dispatched: true,
    eventNo: 'INC-20260324008'
  },
  {
    id: 'ALM-DB-002',
    type: 'database',
    title: '数据库连接池接近上限',
    objectName: '数据归集子系统MySQL数据库',
    ip: '10.3.8.22',
    subsystem: '数据库监控',
    bizSystem: '数据归集',
    ciName: 'ci-db-2',
    operator: '联通',
    vendor: '双杨',
    level: '二级告警',
    status: '未处理',
    content: '活跃连接数持续在上限 90% 以上。',
    firstOccurredAt: '2026-03-24 07:52:00',
    lastOccurredAt: '2026-03-24 08:25:00',
    dispatched: false,
    eventNo: ''
  },
  {
    id: 'ALM-DB-003',
    type: 'database',
    title: '数据库归档任务延迟',
    objectName: '智能运维监控人大金仓数据库',
    ip: '10.3.8.35',
    subsystem: '数据库监控',
    bizSystem: '智能运维监控',
    ciName: 'ci-db-archive-3',
    operator: '联通',
    vendor: '亚信',
    level: '三级告警',
    status: '已忽略',
    content: '离峰归档延迟 30 分钟，业务无影响。',
    firstOccurredAt: '2026-03-24 01:30:00',
    lastOccurredAt: '2026-03-24 01:58:00',
    dispatched: false,
    eventNo: ''
  },
  {
    id: 'ALM-MW-001',
    type: 'middleware',
    title: 'Redis 主从延迟过高',
    objectName: '数据共享Redis',
    ip: '10.4.1.10',
    subsystem: '中间件监控',
    bizSystem: '数据共享',
    ciName: 'ci-mw-1',
    operator: '亚信',
    vendor: 'Redis',
    level: '二级告警',
    status: '处理中',
    content: '复制延迟持续超过 5 秒，可能引发读写不一致。',
    firstOccurredAt: '2026-03-24 07:40:00',
    lastOccurredAt: '2026-03-24 08:21:00',
    dispatched: true,
    eventNo: 'INC-20260324012'
  },
  {
    id: 'ALM-MW-002',
    type: 'middleware',
    title: 'Kafka 消费堆积持续增长',
    objectName: '移动门户Kafka',
    ip: '10.4.1.20',
    subsystem: '移动门户',
    bizSystem: '统一门户',
    ciName: 'ci-mw-2',
    operator: '移动',
    vendor: '双杨',
    level: '一级告警',
    status: '未处理',
    content: '关键主题 backlog 超过 30 万，且 10 分钟内持续增长。',
    firstOccurredAt: '2026-03-24 08:06:00',
    lastOccurredAt: '2026-03-24 08:30:00',
    dispatched: false,
    eventNo: ''
  },
  {
    id: 'ALM-MW-003',
    type: 'middleware',
    title: 'Nginx 5xx 比例升高',
    objectName: '数据归集Nginx',
    ip: '10.4.1.31',
    subsystem: '中间件监控',
    bizSystem: '数据归集',
    ciName: 'ci-nginx-1',
    operator: '联通',
    vendor: '双杨',
    level: '三级告警',
    status: '已恢复',
    content: '5xx 错误比例峰值 4.7%，当前已回落。',
    firstOccurredAt: '2026-03-24 06:12:00',
    lastOccurredAt: '2026-03-24 06:28:00',
    dispatched: false,
    eventNo: ''
  },
  {
    id: 'ALM-SVC-001',
    type: 'service',
    title: '统一认证接口可用率下降',
    objectName: '移动门户应用服务',
    ip: '10.5.2.11',
    subsystem: '应用服务监控',
    bizSystem: '统一门户',
    ciName: 'ci-app-auth-1',
    operator: '移动',
    vendor: '双杨',
    level: '一级告警',
    status: '处理中',
    content: '5 分钟可用率跌至 96.2%，登录失败明显增多。',
    firstOccurredAt: '2026-03-24 08:03:00',
    lastOccurredAt: '2026-03-24 08:30:00',
    dispatched: true,
    eventNo: 'INC-20260324016'
  },
  {
    id: 'ALM-SVC-002',
    type: 'service',
    title: '外部接口响应时间超阈值',
    objectName: '数据归集应用服务',
    ip: '10.5.2.12',
    subsystem: '应用服务监控',
    bizSystem: '数据归集',
    ciName: 'ci-app-1',
    operator: '联通',
    vendor: '双杨',
    level: '二级告警',
    status: '未处理',
    content: 'P95 响应时间连续 10 分钟超过 1800ms。',
    firstOccurredAt: '2026-03-24 07:50:00',
    lastOccurredAt: '2026-03-24 08:24:00',
    dispatched: false,
    eventNo: ''
  },
  {
    id: 'ALM-SVC-003',
    type: 'service',
    title: '服务调用错误率轻微抬升',
    objectName: '星环底座应用服务',
    ip: '10.5.2.33',
    subsystem: '应用服务监控',
    bizSystem: '数据支撑',
    ciName: 'ci-app-msg-1',
    operator: '移动',
    vendor: '星环',
    level: '三级告警',
    status: '已忽略',
    content: '错误率短时波动，未超过业务容忍阈值。',
    firstOccurredAt: '2026-03-24 04:11:00',
    lastOccurredAt: '2026-03-24 04:22:00',
    dispatched: false,
    eventNo: ''
  },
  {
    id: 'ALM-T-001',
    type: 'task',
    title: '数据治理任务失败',
    objectName: 'FUSION_AVG_APPLICATION_TIME_CZJ_DAY',
    ip: '-',
    subsystem: '数据开发子系统',
    bizSystem: '数据开发',
    ciName: '任务类（非 CMDB）',
    operator: '-',
    vendor: '普元',
    level: '一级告警',
    status: '未处理',
    content: '【团队】普元团队【告警分类】执行异常【告警级别】3【告警id】99161e6eafd17ad9bf2086b3a41fb2b8【首次发生时间】2026-01-01 00:29:57.0【告警信息】[FUSION_AVG_APPLICATION_TIME_CZJ_DAY] [daily] [非重点场景] [告警内容：任务执行状态异常:【3.sql语句】执行时失败:2026-01-01 00:02:37.730  [pool-3-thread-2] ERROR - 调用DataSourceConnection.getConnection失败',
    firstOccurredAt: '2026-03-24 02:15:00',
    lastOccurredAt: '2026-03-24 02:30:00',
    dispatched: false,
    eventNo: ''
  },
  {
    id: 'ALM-T-002',
    type: 'task',
    title: '数据同步延迟告警',
    objectName: 'gonganju_db_8_103_dsjzx_base_jsrks_drv_examination_site_df_v999',
    ip: '-',
    subsystem: '数据归集子系统',
    bizSystem: '数据归集',
    ciName: '任务类（非 CMDB）',
    operator: '-',
    vendor: '双杨',
    level: '二级告警',
    status: '处理中',
    content: '【团队】上海市公安局【告警分类】执行异常【告警级别】3【告警id】025032e8d42742009c806a51fba0d8b0【首次发生时间】2025-12-26 04:41:32.0【告警信息】[88dc2504159225997783a7fdce1e694e] [执行状态:FAIL] [day] [执行信息:前置库网络无法连接或已更改账号密码] [gonganju_db_8_103_dsjzx_base_jsrks_drv_examination_site_df_v999]',
    firstOccurredAt: '2026-03-24 06:20:00',
    lastOccurredAt: '2026-03-24 08:20:00',
    dispatched: true,
    eventNo: 'INC-20260324020'
  },
  {
    id: 'ALM-T-003',
    type: 'task',
    title: '质量校验规则触发',
    objectName: 'DWD_QY_INFO',
    ip: '-',
    subsystem: '数据开发子系统',
    bizSystem: '数据开发',
    ciName: '任务类（非 CMDB）',
    operator: '-',
    vendor: '亚信',
    level: '三级告警',
    status: '已恢复',
    content: '【团队】亚信团队【告警分类】执行异常【告警级别】3【告警id】0bf4dfab23b7536d8c3d710088080e94【首次发生时间】2025-12-28 20:27:05.0【告警信息】[DWD_QY_INFO] [daily] [非重点场景] [告警内容：任务是新建状态]',
    firstOccurredAt: '2026-03-24 00:52:00',
    lastOccurredAt: '2026-03-24 01:06:00',
    dispatched: false,
    eventNo: ''
  }
]

const taskAlarmProfiles = {
  'ALM-T-001': {
    team: '普元团队',
    taskLevel: '数据融合',
    scene: '统一画像构建',
    alarmSource: '任务调度中心',
    abnormalReason: '获取数据源连接失败，任务执行进程中断'
  },
  'ALM-T-002': {
    team: '双杨团队',
    taskLevel: '数据归集',
    scene: '公安基础库同步',
    alarmSource: '数据同步任务',
    abnormalReason: '前置库网络无法连接，账号凭据校验失败'
  },
  'ALM-T-003': {
    team: '亚信团队',
    taskLevel: '数据清洗',
    scene: '企业主题数据质量',
    alarmSource: '数据质量校验',
    abnormalReason: '规则校验命中非空约束，关键字段缺失'
  }
}

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function parseTime(value) {
  if (!value) return 0
  return new Date(String(value).replace(/-/g, '/')).getTime()
}

function createEventNo(alarmId) {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const seq = String(alarmId || '').slice(-3).replace(/\D/g, '').padStart(3, '0')
  return `INC-${date}${seq}`
}

function normalizeDispatched(value) {
  if (value === '' || value === undefined || value === null) return ''
  if (value === true || value === '是') return true
  if (value === false || value === '否') return false
  return ''
}

function decorateAlarmItem(item = {}) {
  const profile = taskAlarmProfiles[item.id] || {}
  return {
    ...item,
    taskName: item.taskName || item.objectName || profile.taskName || '-',
    team: item.team || profile.team || '-',
    taskLevel: item.taskLevel || profile.taskLevel || '-',
    scene: item.scene || item.scenario || profile.scene || '-',
    alarmSource: item.alarmSource || item.sourceSystem || profile.alarmSource || '-',
    abnormalReason: item.abnormalReason || item.errorReason || profile.abnormalReason || '-'
  }
}

function normalizeAlarm(item = {}) {
  const rawStatus = item.status || item.processStatus || '未处理'
  const rawLevel = item.level || item.alarmLevel || '三级告警'
  return decorateAlarmItem({
    id: item.id || item.alarmId || '',
    type: item.type || item.alarmType || 'host',
    title: item.title || item.alarmTitle || '',
    objectName: item.objectName || item.alarmObject || item.object || '-',
    ip: item.ip || item.hostIp || '-',
    subsystem: item.subsystem || item.subSystem || '-',
    bizSystem: item.bizSystem || item.businessSystem || '-',
    ciName: item.ciName || item.cmdbCiName || item.cmdbName || '-',
    operator: item.operator || item.carrier || '-',
    vendor: item.vendor || item.manufacturer || '-',
    level: rawLevel,
    status: rawStatus,
    content: item.content || item.alarmContent || '-',
    firstOccurredAt: item.firstOccurredAt || item.firstTime || item.firstOccurTime || '-',
    lastOccurredAt: item.lastOccurredAt || item.lastTime || item.lastOccurTime || '-',
    dispatched: item.dispatched ?? item.hasOrder ?? Boolean(item.eventNo || item.eventOrderNo),
    eventNo: item.eventNo || item.eventOrderNo || item.eventId || ''
  })
}

function extractList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.list)) return payload.list
  if (Array.isArray(payload?.rows)) return payload.rows
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.list)) return payload.data.list
  if (Array.isArray(payload?.result)) return payload.result
  if (Array.isArray(payload?.result?.list)) return payload.result.list
  return []
}

function applyAlarmFilters(params = {}) {
  const {
    type = 'host',
    keyword = '',
    level = '',
    status = '',
    dispatched = '',
    timeRange = []
  } = params
  const dispatchedFlag = normalizeDispatched(dispatched)
  const [start, end] = Array.isArray(timeRange) ? timeRange : []
  const startTs = parseTime(start)
  const endTs = parseTime(end)
  const word = String(keyword || '').trim().toLowerCase()

  return alarmSeed
    .map((item) => normalizeAlarm(item))
    .filter((item) => item.type === type)
    .filter((item) => (level ? item.level === level : true))
    .filter((item) => (status ? item.status === status : true))
    .filter((item) => (dispatchedFlag === '' ? true : item.dispatched === dispatchedFlag))
    .filter((item) => {
      if (!word) return true
      const matchText = [
        item.title,
        item.content,
        item.objectName,
        item.subsystem,
        item.bizSystem,
        item.ciName,
        item.taskName,
        item.team,
        item.taskLevel,
        item.scene,
        item.alarmSource,
        item.abnormalReason
      ].join(' ').toLowerCase()
      return matchText.includes(word)
    })
    .filter((item) => {
      if (!startTs || !endTs) return true
      const ts = parseTime(item.lastOccurredAt)
      return ts >= startTs && ts <= endTs
    })
    .sort((a, b) => {
      const levelDelta = (levelRankMap[a.level] || 99) - (levelRankMap[b.level] || 99)
      if (levelDelta !== 0) return levelDelta
      return parseTime(b.lastOccurredAt) - parseTime(a.lastOccurredAt)
    })
}

function fallbackStats(params = {}) {
  const list = applyAlarmFilters(params)
  return {
    total: list.length,
    level1: list.filter((item) => item.level === '一级告警').length,
    level2: list.filter((item) => item.level === '二级告警').length,
    level3: list.filter((item) => item.level === '三级告警').length,
    unhandled: list.filter((item) => item.status === '未处理').length,
    dispatched: list.filter((item) => item.dispatched).length
  }
}

export async function listAlarmTypes() {
  try {
    const payload = await requestJson('/api/alarms/types')
    const list = extractList(payload)
    if (list.length > 0) {
      return list.map((item) => ({
        key: item.key || item.type || item.code,
        label: item.label || item.name,
        cmdbBound: item.cmdbBound ?? item.bindCmdb ?? true
      }))
    }
  } catch {
    // fall back to local demo data
  }
  return clone(alarmTypes)
}

export async function queryAlarmList(params = {}) {
  try {
    const payload = await requestJson('/api/alarms', { query: params })
    const list = extractList(payload).map(normalizeAlarm)
    if (list.length > 0) {
      return list
    }
  } catch {
    // fall back to local demo data
  }
  return clone(applyAlarmFilters(params))
}

export async function getAlarmStats(params = {}) {
  try {
    const payload = await requestJson('/api/alarms/stats', { query: params })
    const stats = payload?.data || payload?.result || payload
    if (stats && typeof stats.total === 'number') {
      return {
        total: Number(stats.total || 0),
        level1: Number(stats.level1 || stats.critical || 0),
        level2: Number(stats.level2 || stats.major || 0),
        level3: Number(stats.level3 || stats.minor || 0),
        unhandled: Number(stats.unhandled || stats.unProcessed || 0),
        dispatched: Number(stats.dispatched || stats.linkedOrder || 0)
      }
    }
  } catch {
    // fall back to local demo data
  }
  return fallbackStats(params)
}

export async function bindAlarmEventOrder(alarmId) {
  try {
    const payload = await requestJson(`/api/alarms/${alarmId}/dispatch`, {
      method: 'POST'
    })
    const serverAlarm = normalizeAlarm(payload?.data || payload?.result || payload)
    if (serverAlarm.id) {
      const idx = alarmSeed.findIndex((item) => item.id === serverAlarm.id)
      if (idx !== -1) alarmSeed[idx] = serverAlarm
      return serverAlarm
    }
  } catch {
    // fall back to local demo data
  }

  const idx = alarmSeed.findIndex((item) => item.id === alarmId)
  if (idx === -1) return Promise.reject(new Error('告警不存在'))
  const current = alarmSeed[idx]
  if (current.dispatched && current.eventNo) return clone(current)

  const updated = {
    ...current,
    dispatched: true,
    eventNo: createEventNo(current.id),
    status: current.status === '未处理' ? '处理中' : current.status
  }
  alarmSeed[idx] = updated
  return clone(updated)
}

export async function updateAlarmStatus(alarmId, nextStatus) {
  if (!validStatus.includes(nextStatus)) return Promise.reject(new Error('不支持的状态'))

  try {
    await requestJson(`/api/alarms/${alarmId}/status`, {
      method: 'PATCH',
      body: { status: nextStatus }
    })
  } catch {
    // fall back to local demo data
  }

  const idx = alarmSeed.findIndex((item) => item.id === alarmId)
  if (idx === -1) return Promise.reject(new Error('告警不存在'))
  alarmSeed[idx] = { ...alarmSeed[idx], status: nextStatus }
  return clone(alarmSeed[idx])
}

// Keep backward compatibility for legacy monitor page.
export async function getAlarms() {
  try {
    const payload = await requestJson('/api/alarms/legacy', { query: { limit: 8 } })
    const list = extractList(payload)
    if (list.length > 0) {
      return list.map((item) => ({
        time: item.time || item.lastOccurredAt || item.lastTime || '-',
        source: item.source || item.subsystem || '-',
        title: item.title || item.alarmTitle || '-',
        level: item.level || item.alarmLevel || '三级告警',
        status: item.status || '未处理'
      }))
    }
  } catch {
    // fall back to local demo data
  }

  const list = alarmSeed.slice(0, 8).map((item) => ({
    time: item.lastOccurredAt,
    source: item.subsystem,
    title: item.title,
    level: item.level,
    status: item.status
  }))
  return clone(list)
}

export async function getAlarmTrend() {
  try {
    const payload = await requestJson('/api/alarms/trend', { query: { hours: 24 } })
    const list = extractList(payload)
    if (list.length > 0) {
      return list.map((item) => ({
        name: item.name || item.time || item.hour,
        value: Number(item.value || item.count || 0)
      }))
    }
  } catch {
    // fall back to local demo data
  }

  return Array.from({ length: 24 }).map((_, i) => ({
    name: `${String(i).padStart(2, '0')}:00`,
    value: Math.round(Math.random() * 18)
  }))
}

const monitorCenterCategories = [
  { key: 'infrastructure', label: '基础设施监控' },
  { key: 'platform', label: '底座监控' },
  { key: 'database', label: '数据库监控' },
  { key: 'middleware', label: '中间件监控' },
  { key: 'application', label: '应用服务监控' },
]

const monitorStatusOrder = {
  正常: 1,
  预警: 2,
  次要告警: 3,
  紧急告警: 4
}

let monitorCenterSeed = [
  {
    id: 'MC-INF-001',
    category: 'infrastructure',
    resourceName: '云主机-生产-01',
    identifier: '10.10.1.11',
    cmdbCategory: '主机',
    status: '正常',
    latestAlarmTime: '2026-03-24 08:15:00',
    ciId: 'ci-host-001',
    eventNo: '',
    metrics: { cpu: 42, memory: 58, disk: 61, online: '在线' }
  },
  {
    id: 'MC-INF-002',
    category: 'infrastructure',
    resourceName: '云主机-生产-02',
    identifier: '10.10.1.12',
    cmdbCategory: '主机',
    status: '预警',
    latestAlarmTime: '2026-03-24 08:21:00',
    ciId: 'ci-host-002',
    eventNo: '',
    metrics: { cpu: 76, memory: 72, disk: 68, online: '在线' }
  },
  {
    id: 'MC-INF-003',
    category: 'infrastructure',
    resourceName: '虚拟机-数据节点-17',
    identifier: '10.10.3.17',
    cmdbCategory: '虚拟机',
    status: '正常',
    latestAlarmTime: '2026-03-24 08:30:00',
    ciId: 'ci-vm-017',
    eventNo: 'INC-20260324031',
    metrics: { cpu: 91, memory: 88, disk: 93, online: '在线' }
  },
  {
    id: 'MC-PLT-001',
    category: 'platform',
    resourceName: '华为底座-核心集群',
    identifier: '华为底座',
    cmdbCategory: '平台组件',
    status: '正常',
    latestAlarmTime: '2026-03-24 07:42:00',
    ciId: 'ci-plt-hw-001',
    eventNo: '',
    metrics: { baseType: '华为底座', componentStatus: '正常', availability: 99.98, responseMs: 112, nodeHealth: 98 }
  },
  {
    id: 'MC-PLT-002',
    category: 'platform',
    resourceName: '阿里底座-生产域',
    identifier: '阿里底座',
    cmdbCategory: '平台组件',
    status: '预警',
    latestAlarmTime: '2026-03-24 08:11:00',
    ciId: 'ci-plt-ali-001',
    eventNo: '',
    metrics: { baseType: '阿里底座', componentStatus: '部分降级', availability: 99.21, responseMs: 356, nodeHealth: 86 }
  },
  {
    id: 'MC-PLT-003',
    category: 'platform',
    resourceName: '星环底座-数据域',
    identifier: '星环底座',
    cmdbCategory: '平台组件',
    status: '紧急告警',
    latestAlarmTime: '2026-03-24 08:28:00',
    ciId: 'ci-plt-th-001',
    eventNo: 'INC-20260324042',
    metrics: { baseType: '星环底座', componentStatus: '异常', availability: 95.43, responseMs: 820, nodeHealth: 63 }
  },
  {
    id: 'MC-DB-001',
    category: 'database',
    resourceName: '委办指标库-达梦数据库',
    identifier: '10.20.1.20',
    cmdbCategory: '数据库',
    status: '正常',
    latestAlarmTime: '2026-03-24 06:18:00',
    ciId: 'ci-db-mysql-001',
    eventNo: '',
    metrics: { hostTotalMem: 256, hostFreeMem: 130, diskTotal: 2048, sessions: 412, maxSessions: 1500, dbStatus: '运行中', sessionUsage: 27, hostMemUsage: 49, diskUsage: 54, tablespaceUsage: 52 }
  },
  {
    id: 'MC-DB-002',
    category: 'database',
    resourceName: 'pg库',
    identifier: '10.20.1.34',
    cmdbCategory: '数据库',
    status: '次要告警',
    latestAlarmTime: '2026-03-24 08:20:00',
    ciId: 'ci-db-pg-001',
    eventNo: '',
    metrics: { hostTotalMem: 512, hostFreeMem: 96, diskTotal: 4096, sessions: 1660, maxSessions: 2000, dbStatus: '运行中', sessionUsage: 83, hostMemUsage: 81, diskUsage: 77, tablespaceUsage: 85 }
  },
  {
    id: 'MC-DB-003',
    category: 'database',
    resourceName: '归档库-Oracle',
    identifier: '10.20.1.41',
    cmdbCategory: '数据库',
    status: '紧急告警',
    latestAlarmTime: '2026-03-24 08:29:00',
    ciId: 'ci-db-oracle-001',
    eventNo: 'INC-20260324056',
    metrics: { hostTotalMem: 256, hostFreeMem: 28, diskTotal: 3072, sessions: 1840, maxSessions: 2000, dbStatus: '运行中', sessionUsage: 92, hostMemUsage: 89, diskUsage: 91, tablespaceUsage: 94 }
  },
  {
    id: 'MC-MW-001',
    category: 'middleware',
    resourceName: 'RabbitMQ-消息总线',
    identifier: '10.30.1.10',
    cmdbCategory: '中间件',
    status: '正常',
    latestAlarmTime: '2026-03-24 05:35:00',
    ciId: 'ci-mw-rabbit-001',
    eventNo: '',
    metrics: { middlewareType: 'RabbitMQ', componentStatus: '正常', availability: 99.95, responseMs: 66, nodeHealth: 96 }
  },
  {
    id: 'MC-MW-002',
    category: 'middleware',
    resourceName: 'ElasticSearch-检索集群',
    identifier: '10.30.1.21',
    cmdbCategory: '中间件',
    status: '预警',
    latestAlarmTime: '2026-03-24 08:08:00',
    ciId: 'ci-mw-es-001',
    eventNo: '',
    metrics: { middlewareType: 'ElasticSearch', componentStatus: '索引延迟', availability: 99.31, responseMs: 220, nodeHealth: 88 }
  },
  {
    id: 'MC-MW-003',
    category: 'middleware',
    resourceName: 'Kafka-主链路集群',
    identifier: '10.30.1.31',
    cmdbCategory: '中间件',
    status: '次要告警',
    latestAlarmTime: '2026-03-24 08:24:00',
    ciId: 'ci-mw-kafka-001',
    eventNo: '',
    metrics: { middlewareType: 'Kafka', componentStatus: '消费积压', availability: 98.75, responseMs: 338, nodeHealth: 79 }
  },
  {
    id: 'MC-MW-004',
    category: 'middleware',
    resourceName: 'Redis-缓存集群',
    identifier: '10.30.1.42',
    cmdbCategory: '中间件',
    status: '紧急告警',
    latestAlarmTime: '2026-03-24 08:27:00',
    ciId: 'ci-mw-redis-001',
    eventNo: 'INC-20260324073',
    metrics: { middlewareType: 'Redis', componentStatus: '主从延迟异常', availability: 96.02, responseMs: 590, nodeHealth: 67 }
  },
  {
    id: 'MC-APP-001',
    category: 'application',
    resourceName: '统一门户-首页探测',
    identifier: 'https://portal.example.com/health',
    cmdbCategory: '应用服务',
    status: '正常',
    latestAlarmTime: '2026-03-24 07:16:00',
    ciId: 'ci-app-portal-001',
    eventNo: '',
    metrics: { probeUrl: 'https://portal.example.com/health', statusCode: 200, responseMs: 132, probeAbnormal: '否', probeTime: '2026-03-24 08:30:00' }
  },
  {
    id: 'MC-APP-002',
    category: 'application',
    resourceName: '统一认证-登录接口探测',
    identifier: 'https://sso.example.com/api/login',
    cmdbCategory: '应用服务',
    status: '预警',
    latestAlarmTime: '2026-03-24 08:18:00',
    ciId: 'ci-app-sso-001',
    eventNo: '',
    metrics: { probeUrl: 'https://sso.example.com/api/login', statusCode: 200, responseMs: 1088, probeAbnormal: '否', probeTime: '2026-03-24 08:30:00' }
  },
  {
    id: 'MC-APP-003',
    category: 'application',
    resourceName: '政务服务-外网接口探测',
    identifier: 'https://open.example.com/service/ping',
    cmdbCategory: '应用服务',
    status: '紧急告警',
    latestAlarmTime: '2026-03-24 08:30:00',
    ciId: 'ci-app-open-001',
    eventNo: '',
    metrics: { probeUrl: 'https://open.example.com/service/ping', statusCode: 503, responseMs: 2410, probeAbnormal: '是', probeTime: '2026-03-24 08:30:00' }
  },
  {
    id: 'MC-TASK-001',
    category: 'task',
    resourceName: 'DWD_QY_INFO',
    identifier: 'TASK-ERP-MDM-DAILY',
    cmdbCategory: '数据治理任务',
    status: '正常',
    latestAlarmTime: '2026-03-24 03:20:00',
    ciId: '',
    eventNo: '',
    metrics: { executeStatus: '成功', successRate: 99.6, durationSec: 382, nextRunAt: '2026-03-25 03:00:00', abnormalNodes: 0 }
  },
  {
    id: 'MC-TASK-002',
    category: 'task',
    resourceName: 'FUSION_AVG_APPLICATION_TIME_CZJ_DAY',
    identifier: 'TASK-DQ-HOURLY-017',
    cmdbCategory: '数据治理任务',
    status: '次要告警',
    latestAlarmTime: '2026-03-24 08:19:00',
    ciId: '',
    eventNo: '',
    metrics: { executeStatus: '部分失败', successRate: 92.4, durationSec: 901, nextRunAt: '2026-03-24 09:00:00', abnormalNodes: 2 }
  },
  {
    id: 'MC-TASK-003',
    category: 'task',
    resourceName: 'gonganju_db_8_103_dsjzx_base_jsrks_drv_examination_site_df_v999',
    identifier: 'TASK-ODS-CLEAN-NIGHT',
    cmdbCategory: '数据治理任务',
    status: '紧急告警',
    latestAlarmTime: '2026-03-24 08:26:00',
    ciId: '',
    eventNo: 'INC-20260324089',
    metrics: { executeStatus: '失败', successRate: 61.2, durationSec: 1860, nextRunAt: '2026-03-25 01:00:00', abnormalNodes: 5 }
  }
]

const monitorCenterProfiles = {
  'MC-INF-001': {
    operator: '移动',
    environment: '生产',
    bizSystem: '统一门户',
    appSystem: '统一门户',
    vendor: '华为',
    serverArch: '鲲鹏',
    metrics: { unrecoveredCount: 0 }
  },
  'MC-INF-002': {
    operator: '移动',
    environment: '生产',
    bizSystem: '统一门户',
    appSystem: '统一门户',
    vendor: '华为',
    serverArch: 'X86',
    metrics: { unrecoveredCount: 1 }
  },
  'MC-INF-003': {
    operator: '联通',
    environment: '生产',
    bizSystem: '数据治理平台',
    appSystem: '数据治理平台',
    vendor: '浪潮',
    serverArch: 'X86',
    metrics: { unrecoveredCount: 2 }
  },
  'MC-PLT-001': {
    internalIp: '10.40.1.11',
    appSystem: '统一门户',
    vendor: '华为',
    operator: '移动',
    environment: '生产'
  },
  'MC-PLT-002': {
    internalIp: '10.40.1.21',
    appSystem: '数据共享交换',
    vendor: '阿里云',
    operator: '联通',
    environment: '生产'
  },
  'MC-PLT-003': {
    internalIp: '10.40.1.31',
    appSystem: '数据中台',
    vendor: '星环',
    operator: '移动',
    environment: '生产'
  },
  'MC-DB-001': {
    appSystem: '移动门户',
    vendor: '双杨',
    operator: '移动',
    environment: '生产'
  },
  'MC-DB-002': {
    appSystem: '主数据中心',
    vendor: '亚信',
    operator: '联通',
    environment: '生产'
  },
  'MC-DB-003': {
    appSystem: '运维归档中心',
    vendor: '人大金仓',
    operator: '移动',
    environment: '生产'
  },
  'MC-MW-001': {
    appSystem: '统一门户',
    vendor: '普元',
    operator: '移动',
    environment: '生产',
    purpose: '消息总线',
    metrics: { socketUsage: 61, fdUsage: 44 }
  },
  'MC-MW-002': {
    appSystem: '数据归集',
    vendor: '双杨',
    operator: '联通',
    environment: '生产',
    purpose: '全文检索',
    metrics: { memoryUsage: 78 }
  },
  'MC-MW-003': {
    appSystem: '统一门户',
    vendor: '双杨',
    operator: '移动',
    environment: '生产',
    purpose: '消息流转',
    metrics: { consumerGroupCount: 32, lagTotal: 268900, approxLag: 8920, topicReplicaCount: 216, topicCount: 54 }
  },
  'MC-MW-004': {
    appSystem: '数据共享',
    vendor: '亚信',
    operator: '移动',
    environment: '生产',
    purpose: '缓存服务',
    metrics: { memoryFragment: 1.63, memoryUsage: 84 }
  },
  'MC-APP-001': {
    appSystem: '统一门户',
    vendor: '普元',
    operator: '移动',
    environment: '生产'
  },
  'MC-APP-002': {
    appSystem: '统一认证',
    vendor: '双杨',
    operator: '联通',
    environment: '生产'
  },
  'MC-APP-003': {
    appSystem: '政务开放平台',
    vendor: '亚信',
    operator: '移动',
    environment: '生产'
  },
  'MC-TASK-001': {
    appSystem: '数据开发平台',
    vendor: '普元',
    operator: '-',
    environment: '生产'
  },
  'MC-TASK-002': {
    appSystem: '数据归集平台',
    vendor: '双杨',
    operator: '-',
    environment: '生产'
  },
  'MC-TASK-003': {
    appSystem: '数据治理平台',
    vendor: '亚信',
    operator: '-',
    environment: '生产'
  }
}

const databaseTableMonitorSeed = {
  '10.20.1.20': [
    { tableName: 'ods_order_main', totalSpace: 320, freeSpace: 128 },
    { tableName: 'ods_order_detail', totalSpace: 540, freeSpace: 182 },
    { tableName: 'dwd_order_fact', totalSpace: 860, freeSpace: 244 },
    { tableName: 'dws_order_dashboard', totalSpace: 260, freeSpace: 138 }
  ],
  '10.20.1.34': [
    { tableName: 'mdm_customer_info', totalSpace: 680, freeSpace: 96 },
    { tableName: 'mdm_org_info', totalSpace: 240, freeSpace: 72 },
    { tableName: 'mdm_user_profile', totalSpace: 510, freeSpace: 84 },
    { tableName: 'mdm_label_result', totalSpace: 430, freeSpace: 65 }
  ],
  '10.20.1.41': [
    { tableName: 'arch_order_log', totalSpace: 920, freeSpace: 66 },
    { tableName: 'arch_monitor_log', totalSpace: 480, freeSpace: 58 },
    { tableName: 'arch_interface_trace', totalSpace: 760, freeSpace: 84 },
    { tableName: 'arch_change_history', totalSpace: 350, freeSpace: 41 }
  ]
}

function monitorEventNo(resourceId) {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const seq = String(resourceId || '').replace(/\D/g, '').slice(-3).padStart(3, '0')
  return `INC-${date}${seq}`
}

function decorateMonitorCenterItem(item = {}) {
  const profile = monitorCenterProfiles[item.id] || {}
  return {
    ...item,
    operator: item.operator || item.carrier || profile.operator || '-',
    environment: item.environment || item.env || profile.environment || '-',
    bizSystem: item.bizSystem || item.businessSystem || profile.bizSystem || profile.appSystem || '-',
    appSystem: item.appSystem || item.applicationSystem || item.bizSystem || profile.appSystem || profile.bizSystem || '-',
    vendor: item.vendor || item.ownerVendor || item.responsibleVendor || profile.vendor || '-',
    serverArch: item.serverArch || item.architecture || profile.serverArch || '-',
    purpose: item.purpose || item.usage || profile.purpose || '-',
    internalIp: item.internalIp || item.innerIp || profile.internalIp || item.identifier || '-',
    metrics: {
      ...(profile.metrics || {}),
      ...(item.metrics || {})
    }
  }
}

function normalizeDatabaseTableMetric(item = {}) {
  const totalSpace = Number(item.totalSpace ?? item.tableTotalSpace ?? 0)
  const freeSpace = Number(item.freeSpace ?? item.tableFreeSpace ?? 0)
  const usedRate = totalSpace > 0 ? Number((((totalSpace - freeSpace) / totalSpace) * 100).toFixed(2)) : 0
  return {
    tableName: item.tableName || item.name || '-',
    totalSpace,
    freeSpace,
    usedRate
  }
}

function normalizeMonitorCenterItem(item = {}) {
  return decorateMonitorCenterItem({
    id: item.id || item.resourceId || '',
    category: item.category || item.type || 'infrastructure',
    resourceName: item.resourceName || item.name || '-',
    identifier: item.identifier || item.ip || item.mark || '-',
    cmdbCategory: item.cmdbCategory || item.ciCategory || '-',
    status: item.status || '正常',
    latestAlarmTime: item.latestAlarmTime || item.lastAlarmTime || '-',
    ciId: item.ciId || item.cmdbCiId || '',
    eventNo: item.eventNo || item.eventOrderNo || '',
    metrics: item.metrics || {}
  })
}

function formatMonitorMetrics(item) {
  const metrics = item.metrics || {}
  if (item.category === 'infrastructure') {
    return `CPU ${metrics.cpu ?? '-'}% / 内存 ${metrics.memory ?? '-'}% / 磁盘 ${metrics.disk ?? '-'}% / 在线状态 ${metrics.online || '-'}`
  }
  if (item.category === 'platform') {
    return `${metrics.baseType || '-'} / 组件状态 ${metrics.componentStatus || '-'} / 可用性 ${metrics.availability ?? '-'}% / 响应 ${metrics.responseMs ?? '-'}ms / 节点健康 ${metrics.nodeHealth ?? '-'}%`
  }
  if (item.category === 'database') {
    return `会话 ${metrics.sessions ?? '-'}/${metrics.maxSessions ?? '-'}（${metrics.sessionUsage ?? '-'}%）/ 主机内存使用率 ${metrics.hostMemUsage ?? '-'}% / 磁盘使用率 ${metrics.diskUsage ?? '-'}% / 表空间使用率 ${metrics.tablespaceUsage ?? '-'}%`
  }
  if (item.category === 'middleware') {
    return `${metrics.middlewareType || '-'} / 组件状态 ${metrics.componentStatus || '-'} / 可用性 ${metrics.availability ?? '-'}% / 响应 ${metrics.responseMs ?? '-'}ms / 节点健康 ${metrics.nodeHealth ?? '-'}%`
  }
  if (item.category === 'application') {
    return `URL ${metrics.probeUrl || '-'} / 响应码 ${metrics.statusCode ?? '-'} / 响应时间 ${metrics.responseMs ?? '-'}ms / 探测异常 ${metrics.probeAbnormal || '-'} / 探测时间 ${metrics.probeTime || '-'}`
  }
  if (item.category === 'task') {
    return `执行状态 ${metrics.executeStatus || '-'} / 成功率 ${metrics.successRate ?? '-'}% / 执行耗时 ${metrics.durationSec ?? '-'}秒 / 下次执行 ${metrics.nextRunAt || '-'} / 异常节点 ${metrics.abnormalNodes ?? '-'}`
  }
  return '-'
}

function isMonitorCenterAbnormalStatus(status) {
  return status && status !== '正常'
}

function applyMonitorCenterFilters(params = {}) {
  const { keyword = '', status = '', cmdbCategory = '', timeRange = [] } = params
  const word = String(keyword || '').trim().toLowerCase()
  const [start, end] = Array.isArray(timeRange) ? timeRange : []
  const startTs = parseTime(start)
  const endTs = parseTime(end)

  return monitorCenterSeed
    .map((item) => decorateMonitorCenterItem(clone(item)))
    .filter((item) => {
      if (!status) return true
      if (status === '正常') return item.status === '正常'
      if (status === '异常') return isMonitorCenterAbnormalStatus(item.status)
      return item.status === status
    })
    .filter((item) => (cmdbCategory ? item.cmdbCategory === cmdbCategory : true))
    .filter((item) => {
      if (!word) return true
      const source = [
        item.resourceName,
        item.identifier,
        item.internalIp,
        item.operator,
        item.environment,
        item.bizSystem,
        item.appSystem,
        item.vendor,
        item.serverArch,
        item.purpose,
        item.metrics?.baseType,
        item.metrics?.middlewareType,
        item.metrics?.probeUrl
      ].join(' ').toLowerCase()
      return source.includes(word)
    })
    .filter((item) => {
      if (!startTs || !endTs) return true
      const ts = parseTime(item.latestAlarmTime)
      return ts >= startTs && ts <= endTs
    })
    .map((item) => ({ ...clone(item), metricSummary: formatMonitorMetrics(item) }))
}

function buildMonitorCenterStats(params = {}) {
  const list = applyMonitorCenterFilters(params)
  const categoryStats = monitorCenterCategories.map((category) => {
    const rows = list.filter((item) => item.category === category.key)
    const statusRank = rows.reduce((max, item) => Math.max(max, monitorStatusOrder[item.status] || 1), 1)
    const summaryStatus = Object.keys(monitorStatusOrder).find((status) => monitorStatusOrder[status] === statusRank) || '正常'
    return {
      key: category.key,
      label: category.label,
      total: rows.length,
      normal: rows.filter((item) => item.status === '正常').length,
      warning: rows.filter((item) => item.status === '预警').length,
      minor: rows.filter((item) => item.status === '次要告警').length,
      urgent: rows.filter((item) => item.status === '紧急告警').length,
      summaryStatus
    }
  })

  return {
    total: list.length,
    normal: list.filter((item) => item.status === '正常').length,
    alert: list.filter((item) => item.status === '次要告警' || item.status === '紧急告警').length,
    abnormal: list.filter((item) => item.status !== '正常').length,
    categoryStats
  }
}

export async function listMonitorCenterCategories() {
  if (hasApiBase()) {
    try {
      const payload = await requestJson('/api/monitor-center/categories')
      const list = extractList(payload)
      if (list.length > 0) {
        const serverMap = new Map(
          list.map((item) => [
            item.key || item.code || item.type,
            item.label || item.name || '-'
          ])
        )
        return monitorCenterCategories.map((item) => ({
          key: item.key,
          label: serverMap.get(item.key) || item.label
        }))
      }
    } catch {
      // fall back to local demo data
    }
  }
  return clone(monitorCenterCategories)
}

export async function queryMonitorCenterList(params = {}) {
  if (hasApiBase()) {
    try {
      const payload = await requestJson('/api/monitor-center/resources', { query: params })
      const list = extractList(payload).map(normalizeMonitorCenterItem)
      if (list.length > 0) {
        return list.map((item) => ({ ...item, metricSummary: formatMonitorMetrics(item) }))
      }
    } catch {
      // fall back to local demo data
    }
  }
  return applyMonitorCenterFilters(params)
}

export async function queryDatabaseTableMonitor(params = {}) {
  const { internalIp = '', timeRange = [] } = params

  if (hasApiBase()) {
    try {
      const payload = await requestJson('/api/monitor-center/database-tables', {
        query: {
          internalIp,
          timeRange
        }
      })
      const list = extractList(payload).map(normalizeDatabaseTableMetric)
      if (list.length > 0) {
        return list
      }
    } catch {
      // fall back to local demo data
    }
  }

  const rows = databaseTableMonitorSeed[internalIp] || []
  return clone(rows.map((item) => normalizeDatabaseTableMetric(item)))
}

export async function getMonitorCenterStats(params = {}) {
  if (hasApiBase()) {
    try {
      const payload = await requestJson('/api/monitor-center/overview', { query: params })
      const data = payload?.data || payload?.result || payload
      if (data && typeof data.total === 'number') {
        return {
          total: Number(data.total || 0),
          normal: Number(data.normal || 0),
          alert: Number(data.alert || 0),
          abnormal: Number(data.abnormal || 0),
          categoryStats: Array.isArray(data.categoryStats) ? data.categoryStats : []
        }
      }
    } catch {
      // fall back to local demo data
    }
  }
  return buildMonitorCenterStats(params)
}

export async function dispatchMonitorCenterToEvent(resourceId) {
  if (hasApiBase()) {
    try {
      const payload = await requestJson(`/api/monitor-center/resources/${resourceId}/dispatch`, {
        method: 'POST'
      })
      const data = payload?.data || payload?.result || payload
      if (data?.eventNo) {
        const idx = monitorCenterSeed.findIndex((item) => item.id === resourceId)
        if (idx !== -1) {
          monitorCenterSeed[idx] = { ...monitorCenterSeed[idx], eventNo: data.eventNo }
        }
        return { eventNo: data.eventNo }
      }
    } catch {
      // fall back to local demo data
    }
  }

  const idx = monitorCenterSeed.findIndex((item) => item.id === resourceId)
  if (idx === -1) return Promise.reject(new Error('监控资源不存在'))
  if (monitorCenterSeed[idx].eventNo) return { eventNo: monitorCenterSeed[idx].eventNo }
  const eventNo = monitorEventNo(resourceId)
  monitorCenterSeed[idx] = { ...monitorCenterSeed[idx], eventNo }
  return { eventNo }
}

const monitorCategoryToAlarmTypeMap = {
  infrastructure: ['host'],
  platform: ['host'],
  database: ['database'],
  middleware: ['middleware'],
  application: ['service'],
  task: ['task']
}

function dateKey(value) {
  const ts = parseTime(value)
  if (!ts) return ''
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildRecentDays(days = 7) {
  const list = []
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    list.push(`${y}-${m}-${day}`)
  }
  return list
}

function getAlarmLevelLabels() {
  return Object.entries(levelRankMap)
    .sort((a, b) => a[1] - b[1])
    .map(([label]) => label)
}

function applyOverviewAlarmFilters(params = {}) {
  const {
    monitorCategory = '',
    alarmLevel = '',
    alarmStatus = '',
    timeRange = []
  } = params
  const [start, end] = Array.isArray(timeRange) ? timeRange : []
  const startTs = parseTime(start)
  const endTs = parseTime(end)
  const categoryTypes = monitorCategory ? (monitorCategoryToAlarmTypeMap[monitorCategory] || []) : []

  return alarmSeed
    .filter((item) => (categoryTypes.length > 0 ? categoryTypes.includes(item.type) : true))
    .filter((item) => (alarmLevel ? item.level === alarmLevel : true))
    .filter((item) => (alarmStatus ? item.status === alarmStatus : true))
    .filter((item) => {
      if (!startTs || !endTs) return true
      const ts = parseTime(item.lastOccurredAt)
      return ts >= startTs && ts <= endTs
    })
}

function applyOverviewResourceFilters(params = {}) {
  const { monitorCategory = '', timeRange = [] } = params
  const list = applyMonitorCenterFilters({ timeRange })
  return list.filter((item) => (monitorCategory ? item.category === monitorCategory : true))
}

function buildOverviewFromLocal(params = {}) {
  const resources = applyOverviewResourceFilters(params)
  const alarms = applyOverviewAlarmFilters(params)
  const categoryStats = monitorCenterCategories.map((item) => ({
    key: item.key,
    label: item.label,
    total: resources.filter((row) => row.category === item.key).length
  }))

  const today = dateKey(new Date())
  const levelLabels = getAlarmLevelLabels()
  const [level1Label = '一级告警', level2Label = '二级告警', level3Label = '三级告警'] = levelLabels
  const [unhandledLabel = '未处理', processingLabel = '处理中', recoveredLabel = '已恢复'] = validStatus

  const recentDays = buildRecentDays(7)
  const alarmTrend = recentDays.map((day) => ({
    day,
    total: alarms.filter((item) => dateKey(item.lastOccurredAt) === day).length
  }))

  const resourceHealthTrend = recentDays.map((day) => {
    const dayAlarmCount = alarmTrend.find((item) => item.day === day)?.total || 0
    const total = resources.length
    const abnormal = Math.min(total, dayAlarmCount)
    const normal = Math.max(total - abnormal, 0)
    return { day, normal, abnormal }
  })

  const alarmCategoryDistribution = monitorCenterCategories.map((item) => {
    const relatedTypes = monitorCategoryToAlarmTypeMap[item.key] || []
    const value = alarms.filter((row) => relatedTypes.includes(row.type)).length
    return { key: item.key, name: item.label, value }
  })

  const alarmLevelDistribution = [
    { name: level1Label, value: alarms.filter((item) => item.level === level1Label).length },
    { name: level2Label, value: alarms.filter((item) => item.level === level2Label).length },
    { name: level3Label, value: alarms.filter((item) => item.level === level3Label).length }
  ]

  return {
    resourceMetrics: {
      total: resources.length,
      normal: resources.filter((item) => item.status === '正常').length,
      abnormal: resources.filter((item) => item.status !== '正常').length,
      categoryStats
    },
    alarmMetrics: {
      todayTotal: alarms.filter((item) => dateKey(item.lastOccurredAt) === today).length,
      level1: alarms.filter((item) => item.level === level1Label).length,
      level2: alarms.filter((item) => item.level === level2Label).length,
      level3: alarms.filter((item) => item.level === level3Label).length,
      unhandled: alarms.filter((item) => item.status === unhandledLabel).length,
      dispatched: alarms.filter((item) => item.dispatched).length,
      recovered: alarms.filter((item) => item.status === recoveredLabel).length
    },
    trends: {
      resourceHealth: resourceHealthTrend,
      alarm: alarmTrend
    },
    distributions: {
      alarmCategory: alarmCategoryDistribution,
      alarmLevel: alarmLevelDistribution
    },
    optionMeta: {
      levelLabels: [level1Label, level2Label, level3Label],
      statusLabels: [unhandledLabel, processingLabel, recoveredLabel, validStatus[3] || '已忽略']
    }
  }
}

export async function getMonitorAlarmOverview(params = {}) {
  if (hasApiBase()) {
    try {
      const payload = await requestJson('/api/monitor-alert/overview', { query: params })
      const data = payload?.data || payload?.result || payload
      if (data?.resourceMetrics && data?.alarmMetrics) {
        return data
      }
    } catch {
      // fall back to local demo data
    }
  }
  return buildOverviewFromLocal(params)
}

export async function getMonitorAlarmOverviewOptions() {
  const levels = getAlarmLevelLabels()
  return {
    monitorCategories: clone(monitorCenterCategories),
    alarmLevels: levels,
    alarmStatuses: clone(validStatus)
  }
}

import { requestJson } from '@/services/http'

let incidentSeed = [
  { id: 'INC-20260324001', title: '磁盘使用量超过85%', priority: 'P2', status: '处理中', assignee: '王伟', reporter: '监控系统', submitTime: '2026-03-24 07:36:00', slaSeconds: 3 * 3600 + 21 * 60 },
  { id: 'INC-20260324002', title: '数据库连接池接近上限', priority: 'P2', status: '处理中', assignee: '李静', reporter: '监控系统', submitTime: '2026-03-24 07:53:00', slaSeconds: 2 * 3600 + 40 * 60 },
  { id: 'INC-20260324008', title: '数据库慢查询突增', priority: 'P1', status: '处理中', assignee: '赵六', reporter: '监控系统', submitTime: '2026-03-24 08:02:00', slaSeconds: 1 * 3600 + 10 * 60 },
  { id: 'INC-20260324012', title: 'Redis 主从延迟过高', priority: 'P1', status: '处理中', assignee: '周八', reporter: '监控系统', submitTime: '2026-03-24 07:41:00', slaSeconds: 1 * 3600 + 45 * 60 },
  { id: 'INC-20260324016', title: '统一认证接口可用率下降', priority: 'P1', status: '处理中', assignee: '郑十', reporter: '监控系统', submitTime: '2026-03-24 08:04:00', slaSeconds: 55 * 60 },
  { id: 'INC-20260324020', title: '数据同步延迟告警', priority: 'P2', status: '待接单', assignee: '王伟', reporter: '监控系统', submitTime: '2026-03-24 06:21:00', slaSeconds: 2 * 3600 + 15 * 60 },
  { id: 'INC-20260323077', title: '外部接口响应时间超阈值', priority: 'P2', status: '待接单', assignee: '王伟', reporter: '服务监控', submitTime: '2026-03-23 23:18:00', slaSeconds: 2 * 3600 + 5 * 60 },
  { id: 'INC-20260323081', title: 'Kafka 消费堆积持续增长', priority: 'P1', status: '已转问题', assignee: '李静', reporter: '中间件监控', submitTime: '2026-03-23 22:55:00', slaSeconds: 0 },
  { id: 'INC-20260322036', title: '主机 CPU 持续高负载', priority: 'P1', status: '已解决', assignee: '赵六', reporter: '主机监控', submitTime: '2026-03-22 11:09:00', slaSeconds: 0 },
  { id: 'INC-20260321018', title: '质量校验规则触发', priority: 'P3', status: '已解决', assignee: '周八', reporter: '数据治理平台', submitTime: '2026-03-21 09:44:00', slaSeconds: 0 }
]

const detailSeed = {
  'INC-20260324001': {
    content: '主机磁盘平均等待时间持续升高，疑似底层存储抖动。',
    timeline: [
      { time: '07:35', text: '监控检测到 I/O 指标异常' },
      { time: '07:36', text: '自动创建事件单并派发一线' },
      { time: '07:42', text: '开始排查磁盘阵列状态' }
    ]
  },
  'INC-20260324008': {
    content: '数据库慢查询暴增，影响多个业务接口响应。',
    timeline: [
      { time: '08:01', text: '监控平台触发一级告警' },
      { time: '08:02', text: '系统关联事件单并通知数据库组' },
      { time: '08:10', text: '执行索引与 SQL 计划排查' }
    ]
  }
}

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function normalizeIncident(item = {}) {
  return {
    id: item.id || item.eventNo || item.eventId || '',
    title: item.title || item.eventTitle || '-',
    priority: item.priority || item.level || 'P3',
    status: item.status || item.processStatus || '待接单',
    assignee: item.assignee || item.owner || '-',
    reporter: item.reporter || item.creator || '-',
    submitTime: item.submitTime || item.createTime || '-',
    slaSeconds: Number(item.slaSeconds || 0)
  }
}

function normalizeIncidentDetail(payload = {}, id = '') {
  return {
    id: payload.id || payload.eventNo || id,
    title: payload.title || payload.eventTitle || '',
    content: payload.content || payload.description || '暂无详情',
    timeline: Array.isArray(payload.timeline) ? payload.timeline : [],
    suggestions: Array.isArray(payload.suggestions) ? payload.suggestions : ['检查关联服务健康度', '核查近期发布与变更记录'],
    attachments: Array.isArray(payload.attachments) ? payload.attachments : []
  }
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

function fallbackFilter(query = {}) {
  const priority = String(query.priority || '').trim()
  const eventNo = String(query.eventNo || '').trim()
  const keyword = String(query.keyword || '').trim().toLowerCase()

  return incidentSeed
    .filter((item) => (priority ? item.priority === priority : true))
    .filter((item) => (eventNo ? item.id === eventNo : true))
    .filter((item) => {
      if (!keyword) return true
      return `${item.id} ${item.title} ${item.assignee} ${item.reporter}`.toLowerCase().includes(keyword)
    })
}

export async function getIncidents(query = {}) {
  try {
    const payload = await requestJson('/api/events', { query })
    const list = extractList(payload).map(normalizeIncident)
    if (list.length > 0) {
      incidentSeed = list
      return list
    }
  } catch {
    // fall back to local demo data
  }

  return clone(fallbackFilter(query))
}

export async function getIncidentDetail(id) {
  try {
    const payload = await requestJson(`/api/events/${id}`)
    const detail = normalizeIncidentDetail(payload?.data || payload?.result || payload, id)
    if (detail.id) return detail
  } catch {
    // fall back to local demo data
  }

  const base = incidentSeed.find((item) => item.id === id)
  const picked = detailSeed[id] || {
    content: '服务接口响应时间超过阈值，疑似下游依赖慢或线程池耗尽。',
    timeline: [
      { time: '09:10', text: '系统发现异常并告警' },
      { time: '09:12', text: '服务台创建事件单' },
      { time: '09:15', text: '派单至一线运维' }
    ]
  }

  return {
    id,
    title: base?.title || '事件详情',
    content: picked.content,
    timeline: picked.timeline,
    suggestions: ['检查下游服务响应', '查看线程池与连接池配置', '尝试扩容实例或限流'],
    attachments: []
  }
}
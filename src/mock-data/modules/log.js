export function getLogs(query = {}) {
  const data = [
    { time: '2026-03-18 09:10:12', system: '政务门户', level: 'ERROR', message: '接口超时 /api/v1/user' },
    { time: '2026-03-18 09:31:40', system: '数据交换平台', level: 'WARN', message: '队列堆积 > 10w 条' },
    { time: '2026-03-18 10:00:05', system: '政务门户', level: 'INFO', message: '任务执行完成 id=123' }
  ]
  let r = data
  const s = (query.system || '').trim()
  if (s) r = r.filter(i => i.system === s)
  const lv = (query.level || '').trim()
  if (lv) r = r.filter(i => i.level === lv)
  return Promise.resolve(r)
}
export function getLogTrend(timeRange = '24h') {
  const length = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30
  return Promise.resolve(Array.from({ length }).map((_, i) => {
    const name = timeRange === '24h' ? `${i}:00` : timeRange === '7d' ? `Day ${i+1}` : `Day ${i+1}`
    return { name, value: Math.round(Math.random() * 15) }
  }))
}

export function getLogAnalysis(timeRange = '24h') {
  return Promise.resolve({
    levelDistribution: {
      ERROR: Math.round(Math.random() * 50),
      WARN: Math.round(Math.random() * 100),
      INFO: Math.round(Math.random() * 200),
      DEBUG: Math.round(Math.random() * 150)
    },
    systemDistribution: {
      '政务门户': Math.round(Math.random() * 100),
      '数据交换平台': Math.round(Math.random() * 80),
      '智能审批系统': Math.round(Math.random() * 60)
    },
    typeDistribution: {
      '系统日志': Math.round(Math.random() * 90),
      '应用日志': Math.round(Math.random() * 120),
      '访问日志': Math.round(Math.random() * 150),
      '错误日志': Math.round(Math.random() * 40)
    },
    topErrors: [
      { rank: 1, message: '数据库连接超时', count: 15, system: '数据交换平台', lastOccurrence: '2026-03-18 10:15:30' },
      { rank: 2, message: '接口调用失败', count: 12, system: '政务门户', lastOccurrence: '2026-03-18 09:45:12' },
      { rank: 3, message: '内存不足', count: 8, system: '智能审批系统', lastOccurrence: '2026-03-18 11:30:45' },
      { rank: 4, message: '权限验证失败', count: 6, system: '政务门户', lastOccurrence: '2026-03-18 10:20:18' },
      { rank: 5, message: '文件不存在', count: 5, system: '数据交换平台', lastOccurrence: '2026-03-18 09:15:22' },
      { rank: 6, message: '网络连接中断', count: 4, system: '智能审批系统', lastOccurrence: '2026-03-18 11:10:05' },
      { rank: 7, message: '参数错误', count: 3, system: '政务门户', lastOccurrence: '2026-03-18 10:45:33' },
      { rank: 8, message: '服务不可用', count: 3, system: '数据交换平台', lastOccurrence: '2026-03-18 09:30:15' },
      { rank: 9, message: '超时异常', count: 2, system: '智能审批系统', lastOccurrence: '2026-03-18 11:20:40' },
      { rank: 10, message: '数据格式错误', count: 2, system: '政务门户', lastOccurrence: '2026-03-18 10:55:28' }
    ]
  })
}

export function getSlaMatrix() {
  return Promise.resolve([
    { urgency: '高', impact: '高', priority: 'P1' },
    { urgency: '高', impact: '中', priority: 'P1' },
    { urgency: '中', impact: '高', priority: 'P2' },
    { urgency: '低', impact: '中', priority: 'P3' }
  ])
}

export function getSlaTemplates() {
  return Promise.resolve([
    { name: '政务门户SLA', p1: '5m/1h', p2: '15m/4h', p3: '30m/24h' },
    { name: '数据交换SLA', p1: '10m/2h', p2: '30m/6h', p3: '1h/24h' }
  ])
}

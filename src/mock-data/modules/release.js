export function getReleases(query = {}) {
  const base = [
    { id: 'REL-001', version: 'v2.3.1', title: '用户中心优化', type: '全量', status: '审批中', reporter: '张三', submitTime: '2024-01-15 09:10:00' },
    { id: 'REL-002', version: 'v2.3.2', title: '网关限流策略', type: '灰度', status: '验证中', reporter: '李四', submitTime: '2024-01-15 09:20:00' },
    { id: 'REL-003', version: 'v2.3.3', title: '订单系统重构', type: '全量', status: '审批中', reporter: '王五', submitTime: '2024-01-15 09:30:00' },
    { id: 'REL-004', version: 'v2.3.4', title: '支付服务升级', type: '灰度', status: '发布完成', reporter: '赵六', submitTime: '2024-01-15 09:40:00' },
    { id: 'REL-005', version: 'v2.3.5', title: '库存系统优化', type: '全量', status: '审批中', reporter: '孙七', submitTime: '2024-01-15 09:50:00' },
    { id: 'REL-006', version: 'v2.3.6', title: '搜索服务性能优化', type: '灰度', status: '发布中', reporter: '周八', submitTime: '2024-01-15 10:00:00' },
    { id: 'REL-007', version: 'v2.3.7', title: '推荐系统算法更新', type: '全量', status: '发布完成', reporter: '吴九', submitTime: '2024-01-15 10:10:00' },
    { id: 'REL-008', version: 'v2.3.8', title: '日志系统升级', type: '灰度', status: '发布完成', reporter: '郑十', submitTime: '2024-01-15 10:20:00' },
    { id: 'REL-009', version: 'v2.3.9', title: '监控系统集成', type: '全量', status: '验证中', reporter: '王十一', submitTime: '2024-01-15 10:30:00' },
    { id: 'REL-010', version: 'v2.4.0', title: '安全补丁更新', type: '全量', status: '发布完成', reporter: '李十二', submitTime: '2024-01-15 10:40:00' }
  ]
  let result = base
  if (query.type) {
    result = result.filter(i => i.type === query.type)
  }
  if (query.status) {
    result = result.filter(i => i.status === query.status)
  }
  return Promise.resolve(result)
}

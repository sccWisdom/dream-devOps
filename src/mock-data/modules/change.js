export function getChanges(query = {}) {
  const base = [
    { id: 'CHG-001', title: '核心服务灰度发布', type: '常规', risk: '低', status: '审批中', reporter: '张三', submitTime: '2024-01-15 09:10:00' },
    { id: 'CHG-002', title: '数据库参数调整', type: '紧急', risk: '高', status: '实施中', reporter: '李四', submitTime: '2024-01-15 09:20:00' },
    { id: 'CHG-003', title: '网络架构调整', type: '重大', risk: '高', status: '已转发布', reporter: '王五', submitTime: '2024-01-15 09:30:00' },
    { id: 'CHG-004', title: '应用服务器扩容', type: '常规', risk: '低', status: '已转发布', reporter: '赵六', submitTime: '2024-01-15 09:40:00' },
    { id: 'CHG-005', title: '安全补丁更新', type: '紧急', risk: '中', status: '审批中', reporter: '孙七', submitTime: '2024-01-15 09:50:00' },
    { id: 'CHG-006', title: '负载均衡配置调整', type: '常规', risk: '中', status: '实施中', reporter: '周八', submitTime: '2024-01-15 10:00:00' },
    { id: 'CHG-007', title: '存储系统升级', type: '重大', risk: '高', status: '已转发布', reporter: '吴九', submitTime: '2024-01-15 10:10:00' },
    { id: 'CHG-008', title: '监控系统优化', type: '常规', risk: '低', status: '已完成', reporter: '郑十', submitTime: '2024-01-15 10:20:00' },
    { id: 'CHG-009', title: 'API网关配置变更', type: '常规', risk: '中', status: '已转发布', reporter: '王十一', submitTime: '2024-01-15 10:30:00' },
    { id: 'CHG-010', title: '数据备份策略调整', type: '常规', risk: '低', status: '审批中', reporter: '李十二', submitTime: '2024-01-15 10:40:00' }
  ]
  let result = base
  if (query.type) {
    result = result.filter(i => i.type === query.type)
  }
  if (query.risk) {
    result = result.filter(i => i.risk === query.risk)
  }
  return Promise.resolve(result)
}

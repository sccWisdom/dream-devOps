export function getProblems(query = {}) {
  const base = [
    { id: 'PRB-001', title: '缓存击穿导致雪崩', priority: 'P2', status: '分析中', owner: '刘强', reporter: '张三', submitTime: '2024-01-15 09:10:00' },
    { id: 'PRB-002', title: '消息堆积引发延迟', priority: 'P3', status: '待方案评审', owner: '赵敏', reporter: '李四', submitTime: '2024-01-15 09:20:00' },
    { id: 'PRB-003', title: '数据库死锁', priority: 'P1', status: '已转变更', owner: '王五', reporter: '赵六', submitTime: '2024-01-15 09:30:00' },
    { id: 'PRB-004', title: '服务接口超时', priority: 'P2', status: '已转变更', owner: '孙七', reporter: '周八', submitTime: '2024-01-15 09:40:00' },
    { id: 'PRB-005', title: '内存泄漏', priority: 'P1', status: '分析中', owner: '吴九', reporter: '郑十', submitTime: '2024-01-15 09:50:00' },
    { id: 'PRB-006', title: '网络丢包', priority: 'P3', status: '已解决', owner: '王十一', reporter: '李十二', submitTime: '2024-01-15 10:00:00' },
    { id: 'PRB-007', title: 'CPU使用率过高', priority: 'P2', status: '待方案评审', owner: '张十三', reporter: '王十四', submitTime: '2024-01-15 10:10:00' },
    { id: 'PRB-008', title: '磁盘空间不足', priority: 'P3', status: '已解决', owner: '孙十五', reporter: '周十六', submitTime: '2024-01-15 10:20:00' },
    { id: 'PRB-009', title: 'API响应异常', priority: 'P2', status: '已转变更', owner: '吴十七', reporter: '郑十八', submitTime: '2024-01-15 10:30:00' },
    { id: 'PRB-010', title: '配置文件错误', priority: 'P3', status: '已转变更', owner: '王十九', reporter: '李二十', submitTime: '2024-01-15 10:40:00' }
  ]
  const p = (query.priority || '').trim()
  return Promise.resolve(p ? base.filter(i => i.priority === p) : base)
}

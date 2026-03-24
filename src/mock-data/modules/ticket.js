export function getMyTickets() {
  return Promise.resolve([
    { id: 'INC-20260318-001', type: '事件', title: '接口超时', priority: 'P2', status: '处理中', requester: '开发部-李工', createdAt: '2026-03-18 09:15:00' },
    { id: 'INC-20260318-014', type: '事件', title: '数据库连接数过高', priority: 'P1', status: '处理中', requester: '运维部-张工', createdAt: '2026-03-18 10:30:00' },
    { id: 'PRB-20260318-003', type: '问题', title: '缓存击穿导致雪崩', priority: 'P2', status: '已完成', requester: '测试部-王工', createdAt: '2026-03-18 11:45:00' }
  ])
}

export function getAllTickets() {
  return Promise.resolve([
    {
      id: 'INC-20260318-021',
      type: '事件管理',
      title: '【告警分类】数据共享子系统：接口异常-2026-02-05 16:51:28.144 /api/v1/dataexchange/fund-公积金查询接口',
      priority: 'P1',
      status: '已挂起',
      progressStatus: '一线运维处理',
      assignee: '张三',
      requester: '运维部-张工',
      createdAt: '2026-03-18 09:30:00'
    },
    {
      id: 'CHG-20260318-007',
      type: '变更管理',
      title: 'Nginx 配置优化',
      priority: 'P3',
      status: '处理中',
      progressStatus: '二线运维处理',
      assignee: '李四',
      requester: '开发部-李工',
      createdAt: '2026-03-18 10:15:00'
    },
    {
      id: 'PRB-20260318-003',
      type: '问题管理',
      title: '缓存击穿导致系统雪崩',
      priority: 'P2',
      status: '处理中',
      progressStatus: '待分配',
      assignee: '王五',
      requester: '测试部-王工',
      createdAt: '2026-03-18 11:20:00'
    },
    {
      id: 'REL-20260318-001',
      type: '发布管理',
      title: '版本 v2.1.0 发布',
      priority: 'P2',
      status: '已完成',
      progressStatus: '已完成',
      assignee: '赵六',
      requester: '产品部-赵工',
      createdAt: '2026-03-18 14:00:00'
    },
    {
      id: 'REQ-20260318-005',
      type: '请求管理',
      title: '申请新的服务器资源',
      priority: 'P3',
      status: '已挂起',
      progressStatus: '发起人验证',
      assignee: '钱七',
      requester: '技术部-钱工',
      createdAt: '2026-03-18 15:30:00'
    },
    {
      id: 'INC-20260318-022',
      type: '事件管理',
      title: '数据库连接数过高告警',
      priority: 'P1',
      status: '已完成',
      progressStatus: '已完成',
      assignee: '孙八',
      requester: '运维部-张工',
      createdAt: '2026-03-18 08:45:00'
    },
    {
      id: 'CHG-20260318-008',
      type: '变更管理',
      title: 'Redis 集群扩容',
      priority: 'P2',
      status: '处理中',
      progressStatus: '一线运维处理',
      assignee: '周九',
      requester: '开发部-李工',
      createdAt: '2026-03-18 13:20:00'
    },
    {
      id: 'PRB-20260318-004',
      type: '问题管理',
      title: '接口响应时间过长',
      priority: 'P2',
      status: '处理中',
      progressStatus: '二线运维处理',
      assignee: '吴十',
      requester: '测试部-王工',
      createdAt: '2026-03-18 16:10:00'
    }
  ])
}

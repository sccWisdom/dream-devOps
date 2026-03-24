export function getUsers() {
  return Promise.resolve([
    { name: 'admin', dept: '运维中心', role: '管理员', status: '启用' },
    { name: 'zhangsan', dept: '应用运维组', role: '运维工程师', status: '启用' }
  ])
}
export function getRoles() {
  return Promise.resolve([
    { name: '管理员', desc: '全局配置与审批', count: 3 },
    { name: '运维工程师', desc: '处置与巡检', count: 12 }
  ])
}
export function getPermissions() {
  return Promise.resolve([
    { name: 'ticket:view', scope: '工单', desc: '查看工单' },
    { name: 'ticket:assign', scope: '工单', desc: '派单' },
    { name: 'kb:publish', scope: '知识库', desc: '发布知识' }
  ])
}

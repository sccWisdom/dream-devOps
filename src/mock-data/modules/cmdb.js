function nowIso() {
  return new Date().toISOString()
}

function genId(prefix) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`
}

function deepClone(v) {
  return JSON.parse(JSON.stringify(v))
}

const statusOptions = ['待上线', '在线', '闲置', '维修', '报废', '已下线']

let ciCategories = [
  { id: 'cat-host', name: '主机设备', parentId: null, status: 'active' },
  { id: 'cat-network', name: '网络设备', parentId: null, status: 'active' },
  { id: 'cat-middleware', name: '中间件', parentId: null, status: 'active' },
  { id: 'cat-db', name: '数据库', parentId: null, status: 'active' },
  { id: 'cat-app', name: '业务应用', parentId: null, status: 'active' },
  { id: 'cat-cloud', name: '云资源', parentId: null, status: 'active' },
  { id: 'cat-other', name: '其他', parentId: null, status: 'active' },
  { id: 'cat-host-physical', name: '物理机', parentId: 'cat-host', status: 'active' },
  { id: 'cat-host-vm', name: '虚拟机', parentId: 'cat-host', status: 'active' },
  { id: 'cat-network-switch', name: '交换机', parentId: 'cat-network', status: 'active' },
  { id: 'cat-network-router', name: '路由器', parentId: 'cat-network', status: 'active' },
  { id: 'cat-mw-cache', name: '缓存', parentId: 'cat-middleware', status: 'active' },
  { id: 'cat-mw-mq', name: '消息队列', parentId: 'cat-middleware', status: 'active' },
  { id: 'cat-db-rel', name: '关系型数据库', parentId: 'cat-db', status: 'active' },
  { id: 'cat-db-nosql', name: 'NoSQL', parentId: 'cat-db', status: 'active' },
  { id: 'cat-app-web', name: 'Web 应用', parentId: 'cat-app', status: 'active' },
  { id: 'cat-app-mobile', name: '移动应用', parentId: 'cat-app', status: 'active' },
  { id: 'cat-cloud-host', name: '云主机', parentId: 'cat-cloud', status: 'active' },
  { id: 'cat-cloud-obj', name: '对象存储', parentId: 'cat-cloud', status: 'active' },
  { id: 'cat-other-security', name: '安全设备', parentId: 'cat-other', status: 'active' }
]

let relationTypes = [
  { key: 'depends_on', label: '依赖', directional: true },
  { key: 'calls', label: '调用', directional: true },
  { key: 'contains', label: '包含', directional: true },
  { key: 'runs_on', label: '部署于', directional: true }
]
let ciModels = [
  {
    id: 'model-app',
    code: 'app',
    name: '应用',
    categoryId: 'cat-app-web',
    description: '业务应用系统',
    displayField: 'name',
    status: 'active',
    preset: true,
    createdAt: nowIso(),
    fields: [
      { key: 'name', label: '名称', type: 'text', required: true, unique: true },
      { key: 'domain', label: '环境', type: 'text', required: false },
      { key: 'port', label: '端口', type: 'number', required: false },
      { key: 'owner', label: '负责人', type: 'text', required: true },
      { key: 'bizSystem', label: '所属业务系统', type: 'text', required: true }
    ]
  },
  {
    id: 'model-middleware',
    code: 'middleware',
    name: '中间件',
    categoryId: 'cat-middleware',
    description: '中间件组件',
    displayField: 'name',
    status: 'active',
    preset: true,
    createdAt: nowIso(),
    fields: [
      { key: 'name', label: '名称', type: 'text', required: true, unique: true },
      { key: 'type', label: '类型', type: 'select', required: true, options: ['Redis', 'Kafka', 'Nginx', 'ElasticSearch'] },
      { key: 'version', label: '版本', type: 'text', required: false },
      { key: 'owner', label: '负责人', type: 'text', required: true },
      { key: 'bizSystem', label: '所属业务系统', type: 'text', required: false }
    ]
  },
  {
    id: 'model-host',
    code: 'host',
    name: '主机',
    categoryId: 'cat-host-physical',
    description: '物理机 / 云主机',
    displayField: 'ip',
    status: 'active',
    preset: true,
    createdAt: nowIso(),
    fields: [
      { key: 'ip', label: 'IP', type: 'text', required: true, unique: true },
      { key: 'cpu', label: 'CPU', type: 'text', required: true },
      { key: 'memory', label: '内存', type: 'text', required: true },
      { key: 'os', label: '系统', type: 'text', required: true },
      { key: 'env', label: '环境', type: 'select', required: true, options: ['生产', '预发', '测试', '开发'] },
      { key: 'owner', label: '负责人', type: 'text', required: false },
      { key: 'bizSystem', label: '所属业务系统', type: 'text', required: false }
    ]
  },
  {
    id: 'model-server',
    code: 'server',
    name: '服务器',
    categoryId: 'cat-host-physical',
    description: '机房服务器/机架服务器',
    displayField: 'name',
    status: 'active',
    preset: true,
    createdAt: nowIso(),
    fields: [
      { key: 'name', label: '名称', type: 'text', required: true, unique: true },
      { key: 'ip', label: 'IP', type: 'text', required: true, unique: true },
      { key: 'cpu', label: 'CPU', type: 'text', required: true },
      { key: 'memory', label: '内存', type: 'text', required: true },
      { key: 'rack', label: '机柜', type: 'text', required: false },
      { key: 'owner', label: '负责人', type: 'text', required: true },
      { key: 'bizSystem', label: '所属业务系统', type: 'text', required: false }
    ]
  },
  {
    id: 'model-db',
    code: 'db',
    name: '数据库',
    categoryId: 'cat-db-rel',
    description: '数据库实例',
    displayField: 'name',
    status: 'active',
    preset: true,
    createdAt: nowIso(),
    fields: [
      { key: 'name', label: '名称', type: 'text', required: true, unique: true },
      { key: 'engine', label: '引擎', type: 'select', required: true, options: ['MySQL', 'PostgreSQL', 'Oracle', 'SQLServer'] },
      { key: 'version', label: '版本', type: 'text', required: false },
      { key: 'port', label: '端口', type: 'number', required: false },
      { key: 'owner', label: '负责人', type: 'text', required: true },
      { key: 'bizSystem', label: '所属业务系统', type: 'text', required: false }
    ]
  },
  {
    id: 'model-vm',
    code: 'vm',
    name: '虚拟机',
    categoryId: 'cat-host-vm',
    description: '虚拟化资源',
    displayField: 'ip',
    status: 'active',
    preset: true,
    createdAt: nowIso(),
    fields: [
      { key: 'ip', label: 'IP', type: 'text', required: true, unique: true },
      { key: 'cpu', label: 'CPU', type: 'text', required: true },
      { key: 'memory', label: '内存', type: 'text', required: true },
      { key: 'host', label: '宿主机', type: 'text', required: false },
      { key: 'owner', label: '负责人', type: 'text', required: true },
      { key: 'bizSystem', label: '所属业务系统', type: 'text', required: false }
    ]
  }
]

let modelRelations = [
  { id: 'mr-1', fromModelCode: 'app', typeKey: 'calls', toModelCode: 'app' },
  { id: 'mr-2', fromModelCode: 'app', typeKey: 'calls', toModelCode: 'middleware' },
  { id: 'mr-3', fromModelCode: 'middleware', typeKey: 'depends_on', toModelCode: 'db' },
  { id: 'mr-4', fromModelCode: 'middleware', typeKey: 'runs_on', toModelCode: 'host' },
  { id: 'mr-5', fromModelCode: 'app', typeKey: 'runs_on', toModelCode: 'host' },
  { id: 'mr-6', fromModelCode: 'app', typeKey: 'runs_on', toModelCode: 'vm' }
]
let cis = [
  {
    id: 'ci-app-1',
    modelCode: 'app',
    status: '在线',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attributes: { name: '集成门户（移动端）', domain: '生产环境', port: 443, owner: '张敏', bizSystem: '统一门户' }
  },
  {
    id: 'ci-app-2',
    modelCode: 'app',
    status: '在线',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attributes: { name: '数据归集子系统', domain: '生产环境', port: 8443, owner: '李雷', bizSystem: '数据归集' }
  },
  {
    id: 'ci-mw-1',
    modelCode: 'middleware',
    status: '在线',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attributes: { name: 'redis-prod', type: 'Redis', version: '6.2', owner: '平台组', bizSystem: '数据共享' }
  },
  {
    id: 'ci-mw-2',
    modelCode: 'middleware',
    status: '在线',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attributes: { name: 'kafka-core', type: 'Kafka', version: '3.5', owner: '平台组', bizSystem: '政务服务' }
  },
  {
    id: 'ci-host-1',
    modelCode: 'host',
    status: '在线',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attributes: { ip: '10.1.2.3', cpu: '32 核', memory: '128 GB', os: 'CentOS 7', env: '生产', owner: '运维组', bizSystem: '政务服务' }
  },
  {
    id: 'ci-host-2',
    modelCode: 'host',
    status: '维修',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attributes: { ip: '10.1.2.4', cpu: '24 核', memory: '96 GB', os: 'Ubuntu 22.04', env: '测试', owner: '运维组', bizSystem: '数据共享' }
  },
  {
    id: 'ci-server-1',
    modelCode: 'server',
    status: '在线',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attributes: { name: 'SCZJ-SRV-01', ip: '10.2.8.10', cpu: '48 核', memory: '256 GB', rack: 'A-12', owner: '基础设施', bizSystem: '政务服务' }
  },
  {
    id: 'ci-db-1',
    modelCode: 'db',
    status: '在线',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attributes: { name: 'cmdb-mysql', engine: 'MySQL', version: '8.0', port: 3306, owner: '数据库组', bizSystem: '政务服务' }
  },
  {
    id: 'ci-db-2',
    modelCode: 'db',
    status: '在线',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attributes: { name: 'exchange-pg', engine: 'PostgreSQL', version: '14', port: 5432, owner: '数据库组', bizSystem: '数据共享' }
  },
  {
    id: 'ci-vm-1',
    modelCode: 'vm',
    status: '闲置',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attributes: { ip: '10.9.1.15', cpu: '8 核', memory: '32 GB', host: 'vm-cluster-01', owner: '云资源组', bizSystem: '政务服务' }
  }
]

let ciRelations = [
  { id: 'rel-1', typeKey: 'calls', fromId: 'ci-app-1', toId: 'ci-app-2' },
  { id: 'rel-2', typeKey: 'calls', fromId: 'ci-app-1', toId: 'ci-mw-2' },
  { id: 'rel-3', typeKey: 'calls', fromId: 'ci-app-2', toId: 'ci-mw-1' },
  { id: 'rel-4', typeKey: 'depends_on', fromId: 'ci-mw-1', toId: 'ci-db-2' },
  { id: 'rel-5', typeKey: 'depends_on', fromId: 'ci-mw-2', toId: 'ci-db-1' },
  { id: 'rel-6', typeKey: 'runs_on', fromId: 'ci-mw-1', toId: 'ci-host-1' },
  { id: 'rel-7', typeKey: 'runs_on', fromId: 'ci-mw-2', toId: 'ci-host-1' },
  { id: 'rel-8', typeKey: 'runs_on', fromId: 'ci-app-1', toId: 'ci-host-1' },
  { id: 'rel-9', typeKey: 'runs_on', fromId: 'ci-app-2', toId: 'ci-vm-1' }
]

let auditLogs = []
let discoveryLogs = []

let discoveryTasks = [
  { id: 'disc-1', target: '主机设备', method: 'Agent 采集', frequency: '30 分钟', status: '运行中', updatedAt: nowIso() },
  { id: 'disc-2', target: '数据库', method: 'API 对接', frequency: '2 小时', status: '已暂停', updatedAt: nowIso() },
  { id: 'disc-3', target: '业务应用', method: 'SSH 采集', frequency: '每日 03:00', status: '运行中', updatedAt: nowIso() }
]

let discoveryRules = {
  ipRanges: ['10.1.0.0/16', '10.9.0.0/16'],
  fields: ['IP', 'CPU', '内存', '系统', '负责人', '业务系统'],
  dedup: 'IP + 资产编码'
}

let lifecycleLogs = [
  { id: genId('life'), ciId: 'ci-host-2', status: '维修', reason: '硬盘更换', at: nowIso(), operator: '运维组' },
  { id: genId('life'), ciId: 'ci-vm-1', status: '闲置', reason: '业务下线', at: nowIso(), operator: '系统' }
]

let monitorStatus = {
  'ci-app-1': { status: 'normal', lastAt: nowIso(), detail: '无异常' },
  'ci-app-2': { status: 'alert', lastAt: nowIso(), detail: '接口错误率升高' },
  'ci-mw-1': { status: 'normal', lastAt: nowIso(), detail: '集群健康' },
  'ci-mw-2': { status: 'normal', lastAt: nowIso(), detail: '延迟稳定' },
  'ci-host-1': { status: 'normal', lastAt: nowIso(), detail: 'CPU 使用率 23%' },
  'ci-host-2': { status: 'alert', lastAt: nowIso(), detail: '磁盘 IO 抖动' },
  'ci-server-1': { status: 'normal', lastAt: nowIso(), detail: '运行稳定' },
  'ci-db-1': { status: 'normal', lastAt: nowIso(), detail: '连接池健康' },
  'ci-db-2': { status: 'alert', lastAt: nowIso(), detail: '慢查询告警' },
  'ci-vm-1': { status: 'normal', lastAt: nowIso(), detail: '运行稳定' }
}

let ciTickets = {
  'ci-app-2': [
    { id: 'T-20260323001', title: '应用接口超时', status: '处理中', owner: '应用组', createdAt: nowIso() },
    { id: 'T-20260322008', title: '证书即将过期', status: '已完成', owner: '应用组', createdAt: nowIso() }
  ],
  'ci-host-2': [
    { id: 'T-20260321012', title: '磁盘阵列异常', status: '处理中', owner: '运维组', createdAt: nowIso() }
  ]
}

let ciChanges = {
  'ci-app-1': [
    { id: 'CH-20260320001', title: '版本升级', status: '已完成', owner: '发布组', at: nowIso() }
  ],
  'ci-db-2': [
    { id: 'CH-20260319007', title: '参数调优', status: '已完成', owner: '数据库组', at: nowIso() }
  ]
}
function getCategoryById(id) {
  return ciCategories.find(c => c.id === id)
}

function getModelByCode(code) {
  return ciModels.find(m => m.code === code)
}

function normalizeModelCode(code) {
  return (code || '').trim().toLowerCase()
}

function validateModel(model) {
  const code = normalizeModelCode(model.code)
  if (!code) throw new Error('模型编码不能为空')
  if (!model.name?.trim()) throw new Error('模型名称不能为空')
  if (!model.categoryId) throw new Error('所属分类不能为空')
  return { ...model, code }
}

function getCiDisplayName(ci) {
  const model = getModelByCode(ci.modelCode)
  const key = model?.displayField
  const v = key ? ci.attributes?.[key] : undefined
  if (typeof v === 'string' && v) return v
  if (typeof v === 'number') return String(v)
  return ci.id
}

function assertUniqueField(modelCode, fieldKey, value, ignoreCiId) {
  const model = getModelByCode(modelCode)
  const field = model?.fields?.find(f => f.key === fieldKey)
  if (!field?.unique) return
  const exists = cis.some(ci => ci.modelCode === modelCode && ci.id !== ignoreCiId && ci.attributes?.[fieldKey] === value)
  if (exists) throw new Error(`${field.label || fieldKey} 已存在`)
}

function matchKeyword(ci, keyword) {
  if (!keyword) return true
  const values = Object.values(ci.attributes || {}).map(v => String(v ?? ''))
  return values.some(v => v.includes(keyword))
}

export function getCategories() {
  return Promise.resolve(deepClone(ciCategories))
}

export function createCategory(payload) {
  const name = (payload?.name || '').trim()
  const parentId = payload?.parentId || null
  if (!name) return Promise.reject(new Error('分类名称不能为空'))
  if (parentId && !ciCategories.some(c => c.id === parentId)) return Promise.reject(new Error('父级分类不存在'))
  if (ciCategories.some(c => c.parentId === parentId && c.name === name)) return Promise.reject(new Error('分类名称已存在'))
  const id = genId('cat')
  ciCategories = [...ciCategories, { id, name, parentId, status: 'active' }]
  return Promise.resolve(true)
}

export function updateCategory(id, patch) {
  const idx = ciCategories.findIndex(c => c.id === id)
  if (idx === -1) return Promise.reject(new Error('分类不存在'))
  const name = (patch?.name || ciCategories[idx].name).trim()
  if (!name) return Promise.reject(new Error('分类名称不能为空'))
  const parentId = patch?.parentId ?? ciCategories[idx].parentId
  if (ciCategories.some(c => c.id !== id && c.parentId === parentId && c.name === name)) return Promise.reject(new Error('分类名称已存在'))
  ciCategories = ciCategories.map(c => (c.id === id ? { ...c, ...patch, name, parentId } : c))
  return Promise.resolve(true)
}

export function deleteCategory(id) {
  if (ciCategories.some(c => c.parentId === id)) return Promise.reject(new Error('存在子分类，无法删除'))
  if (ciModels.some(m => m.categoryId === id)) return Promise.reject(new Error('已有模型使用该分类'))
  ciCategories = ciCategories.filter(c => c.id !== id)
  return Promise.resolve(true)
}

export function toggleCategory(id, status) {
  ciCategories = ciCategories.map(c => (c.id === id ? { ...c, status } : c))
  return Promise.resolve(true)
}

export function getRelationTypes() {
  return Promise.resolve(deepClone(relationTypes))
}

export function createRelationType(payload) {
  const key = (payload?.key || '').trim()
  const label = (payload?.label || '').trim()
  if (!key) return Promise.reject(new Error('关系类型编码不能为空'))
  if (!label) return Promise.reject(new Error('关系类型名称不能为空'))
  if (relationTypes.some(t => t.key === key)) return Promise.reject(new Error('关系类型编码已存在'))
  relationTypes = [...relationTypes, { key, label, directional: payload?.directional !== false }]
  return Promise.resolve(true)
}

export function deleteRelationType(key) {
  if (modelRelations.some(r => r.typeKey === key)) return Promise.reject(new Error('存在模型关系引用，无法删除'))
  if (ciRelations.some(r => r.typeKey === key)) return Promise.reject(new Error('存在配置项关系引用，无法删除'))
  relationTypes = relationTypes.filter(t => t.key !== key)
  return Promise.resolve(true)
}

export function getCiModels() {
  return Promise.resolve(deepClone(ciModels))
}
export function createCiModel(payload) {
  try {
    const model = validateModel(payload || {})
    if (ciModels.some(m => m.code === model.code)) return Promise.reject(new Error('模型编码已存在'))
    const id = genId('model')
    const fields = Array.isArray(model.fields) ? model.fields : []
    const createdAt = nowIso()
    ciModels = [...ciModels, { ...model, id, fields, status: model.status || 'active', preset: !!model.preset, createdAt }]
    return Promise.resolve(deepClone(ciModels.find(m => m.id === id)))
  } catch (e) {
    return Promise.reject(e)
  }
}

export function updateCiModel(id, patch) {
  try {
    const idx = ciModels.findIndex(m => m.id === id)
    if (idx === -1) return Promise.reject(new Error('模型不存在'))
    const next = validateModel({ ...ciModels[idx], ...patch, id })
    if (ciModels.some(m => m.id !== id && m.code === next.code)) return Promise.reject(new Error('模型编码已存在'))
    ciModels = ciModels.map(m => (m.id === id ? { ...m, ...next } : m))
    return Promise.resolve(deepClone(ciModels.find(m => m.id === id)))
  } catch (e) {
    return Promise.reject(e)
  }
}

export function deleteCiModel(id) {
  const model = ciModels.find(m => m.id === id)
  if (!model) return Promise.resolve(true)
  if (cis.some(ci => ci.modelCode === model.code)) return Promise.reject(new Error('存在配置项，无法删除模型'))
  modelRelations = modelRelations.filter(r => r.fromModelCode !== model.code && r.toModelCode !== model.code)
  ciModels = ciModels.filter(m => m.id !== id)
  return Promise.resolve(true)
}

export function upsertModelField(modelId, payload) {
  const model = ciModels.find(m => m.id === modelId)
  if (!model) return Promise.reject(new Error('模型不存在'))
  const key = (payload?.key || '').trim()
  const label = (payload?.label || '').trim()
  const type = payload?.type || 'text'
  if (!key) return Promise.reject(new Error('字段编码不能为空'))
  if (!label) return Promise.reject(new Error('字段名称不能为空'))
  const nextField = {
    key,
    label,
    type,
    required: !!payload?.required,
    unique: !!payload?.unique,
    options: Array.isArray(payload?.options) ? payload.options : undefined,
    relationModelCode: payload?.relationModelCode || undefined
  }
  const nextFields = model.fields?.some(f => f.key === key)
    ? model.fields.map(f => (f.key === key ? nextField : f))
    : [...(model.fields || []), nextField]
  ciModels = ciModels.map(m => (m.id === modelId ? { ...m, fields: nextFields } : m))
  return Promise.resolve(true)
}

export function deleteModelField(modelId, fieldKey) {
  const model = ciModels.find(m => m.id === modelId)
  if (!model) return Promise.reject(new Error('模型不存在'))
  if (model.displayField === fieldKey) return Promise.reject(new Error('不能删除展示字段'))
  const nextFields = (model.fields || []).filter(f => f.key !== fieldKey)
  ciModels = ciModels.map(m => (m.id === modelId ? { ...m, fields: nextFields } : m))
  cis = cis.map(ci => {
    if (ci.modelCode !== model.code) return ci
    const nextAttr = { ...(ci.attributes || {}) }
    delete nextAttr[fieldKey]
    return { ...ci, attributes: nextAttr, updatedAt: nowIso() }
  })
  return Promise.resolve(true)
}

export function getModelRelations() {
  return Promise.resolve(deepClone(modelRelations))
}

export function createModelRelation(payload) {
  const fromModelCode = normalizeModelCode(payload?.fromModelCode)
  const toModelCode = normalizeModelCode(payload?.toModelCode)
  const typeKey = (payload?.typeKey || '').trim()
  if (!getModelByCode(fromModelCode) || !getModelByCode(toModelCode)) return Promise.reject(new Error('模型不存在'))
  if (!relationTypes.some(t => t.key === typeKey)) return Promise.reject(new Error('关系类型不存在'))
  const exists = modelRelations.some(r => r.fromModelCode === fromModelCode && r.toModelCode === toModelCode && r.typeKey === typeKey)
  if (exists) return Promise.reject(new Error('模型关系已存在'))
  modelRelations = [...modelRelations, { id: genId('mr'), fromModelCode, toModelCode, typeKey }]
  return Promise.resolve(true)
}

export function deleteModelRelation(id) {
  modelRelations = modelRelations.filter(r => r.id !== id)
  return Promise.resolve(true)
}

export function getCis(params = {}) {
  const modelCode = normalizeModelCode(params.modelCode)
  const keyword = (params.keyword || '').trim()
  const ip = (params.ip || '').trim()
  const categoryId = params.categoryId
  const bizSystem = (params.bizSystem || '').trim()
  const status = (params.status || '').trim()
  const owner = (params.owner || '').trim()
  const list = cis
    .filter(ci => (modelCode ? ci.modelCode === modelCode : true))
    .filter(ci => (status ? ci.status === status : true))
    .filter(ci => (ip ? String(ci.attributes?.ip || '').includes(ip) : true))
    .filter(ci => (owner ? String(ci.attributes?.owner || '').includes(owner) : true))
    .filter(ci => (bizSystem ? String(ci.attributes?.bizSystem || '').includes(bizSystem) : true))
    .filter(ci => matchKeyword(ci, keyword))
    .filter(ci => {
      if (!categoryId) return true
      const model = getModelByCode(ci.modelCode)
      return model?.categoryId === categoryId
    })
  return Promise.resolve(deepClone(list))
}

export function createCi(modelCode, attributes, meta = {}) {
  const code = normalizeModelCode(modelCode)
  const model = getModelByCode(code)
  if (!model) return Promise.reject(new Error('模型不存在'))
  const attr = { ...(attributes || {}) }
  for (const f of model.fields || []) {
    if (f.required && (attr[f.key] === undefined || attr[f.key] === null || attr[f.key] === '')) {
      return Promise.reject(new Error(`${f.label || f.key} 不能为空`))
    }
    assertUniqueField(code, f.key, attr[f.key])
  }
  const ci = {
    id: genId(`ci-${code}`),
    modelCode: code,
    status: meta?.status || '在线',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attributes: attr
  }
  cis = [...cis, ci]
  if (meta?.operator || meta?.source) {
    auditLogs = [
      {
        id: genId('audit'),
        ciId: ci.id,
        modelCode: ci.modelCode,
        ciName: getCiDisplayName(ci),
        changeId: meta?.changeId,
        operator: meta?.operator || 'system',
        source: meta?.source || 'manual',
        at: nowIso(),
        before: null,
        after: deepClone(ci)
      },
      ...auditLogs
    ]
  }
  return Promise.resolve(deepClone(ci))
}

export function updateCi(ciId, patchAttributes, meta = {}) {
  const idx = cis.findIndex(ci => ci.id === ciId)
  if (idx === -1) return Promise.reject(new Error('配置项不存在'))
  const before = deepClone(cis[idx])
  const model = getModelByCode(before.modelCode)
  const nextAttr = { ...(before.attributes || {}), ...(patchAttributes || {}) }
  for (const f of model?.fields || []) {
    if (f.required && (nextAttr[f.key] === undefined || nextAttr[f.key] === null || nextAttr[f.key] === '')) {
      return Promise.reject(new Error(`${f.label || f.key} 不能为空`))
    }
    assertUniqueField(before.modelCode, f.key, nextAttr[f.key], before.id)
  }
  const after = { ...before, attributes: nextAttr, updatedAt: nowIso() }
  cis = cis.map(ci => (ci.id === ciId ? after : ci))
  auditLogs = [
    {
      id: genId('audit'),
      ciId: after.id,
      modelCode: after.modelCode,
      ciName: getCiDisplayName(after),
      changeId: meta?.changeId,
      operator: meta?.operator || 'system',
      source: meta?.source || 'manual',
      at: nowIso(),
      before,
      after: deepClone(after)
    },
    ...auditLogs
  ]
  return Promise.resolve(deepClone(after))
}

export function deleteCi(ciId) {
  if (!cis.some(ci => ci.id === ciId)) return Promise.resolve(true)
  ciRelations = ciRelations.filter(r => r.fromId !== ciId && r.toId !== ciId)
  auditLogs = auditLogs.filter(a => a.ciId !== ciId)
  cis = cis.filter(ci => ci.id !== ciId)
  return Promise.resolve(true)
}

export function getCiRelations(params = {}) {
  const fromId = params.fromId
  const toId = params.toId
  const typeKey = params.typeKey
  const list = ciRelations
    .filter(r => (fromId ? r.fromId === fromId : true))
    .filter(r => (toId ? r.toId === toId : true))
    .filter(r => (typeKey ? r.typeKey === typeKey : true))
  return Promise.resolve(deepClone(list))
}

export function createCiRelation(payload) {
  const fromId = payload?.fromId
  const toId = payload?.toId
  const typeKey = (payload?.typeKey || '').trim()
  if (!fromId || !toId) return Promise.reject(new Error('关系两端不能为空'))
  if (!cis.some(ci => ci.id === fromId) || !cis.some(ci => ci.id === toId)) return Promise.reject(new Error('配置项不存在'))
  if (!relationTypes.some(t => t.key === typeKey)) return Promise.reject(new Error('关系类型不存在'))
  const exists = ciRelations.some(r => r.fromId === fromId && r.toId === toId && r.typeKey === typeKey)
  if (exists) return Promise.reject(new Error('关系已存在'))
  ciRelations = [...ciRelations, { id: genId('rel'), fromId, toId, typeKey }]
  return Promise.resolve(true)
}

export function deleteCiRelation(id) {
  ciRelations = ciRelations.filter(r => r.id !== id)
  return Promise.resolve(true)
}
export function getTopology(params = {}) {
  const modelCode = normalizeModelCode(params.modelCode)
  const includeModelCodes = Array.isArray(params.modelCodes) ? params.modelCodes.map(normalizeModelCode) : []
  const bizSystem = (params.bizSystem || '').trim()
  const nodes = cis
    .filter(ci => (modelCode ? ci.modelCode === modelCode : true))
    .filter(ci => (includeModelCodes.length ? includeModelCodes.includes(ci.modelCode) : true))
    .filter(ci => (bizSystem ? String(ci.attributes?.bizSystem || '').includes(bizSystem) : true))
    .map(ci => ({
      id: ci.id,
      name: getCiDisplayName(ci),
      modelCode: ci.modelCode,
      status: monitorStatus[ci.id]?.status || 'normal',
      bizSystem: ci.attributes?.bizSystem || ''
    }))

  const nodeIds = new Set(nodes.map(n => n.id))
  const links = ciRelations
    .filter(r => nodeIds.has(r.fromId) && nodeIds.has(r.toId))
    .map(r => {
      const type = relationTypes.find(t => t.key === r.typeKey)
      return { id: r.id, source: r.fromId, target: r.toId, label: type?.label || r.typeKey, typeKey: r.typeKey }
    })
  return Promise.resolve({ nodes: deepClone(nodes), links: deepClone(links) })
}

export function getAuditLogs(params = {}) {
  const ciId = params.ciId
  const changeId = params.changeId
  const keyword = (params.keyword || '').trim()
  const list = auditLogs
    .filter(a => (ciId ? a.ciId === ciId : true))
    .filter(a => (changeId ? a.changeId === changeId : true))
    .filter(a => {
      if (!keyword) return true
      const hay = `${a.ciName || ''} ${a.changeId || ''} ${a.operator || ''} ${a.source || ''}`
      return hay.includes(keyword)
    })
  return Promise.resolve(deepClone(list))
}

export function getMonitorStatus(ciId) {
  return Promise.resolve(deepClone(monitorStatus[ciId] || { status: 'normal', detail: '暂无数据', lastAt: nowIso() }))
}

export function getCiTickets(ciId) {
  return Promise.resolve(deepClone(ciTickets[ciId] || []))
}

export function getCiChanges(ciId) {
  return Promise.resolve(deepClone(ciChanges[ciId] || []))
}

export async function runDiscovery(params = {}) {
  const modelCode = normalizeModelCode(params.modelCode || 'host')
  if (modelCode !== 'host') return Promise.reject(new Error('当前仅模拟主机自动发现'))
  const count = Number(params.count || 3)
  const envs = ['生产', '预发', '测试', '开发']
  const oss = ['CentOS 7', 'Ubuntu 22.04', 'Debian 12', 'Rocky 9']
  const discovered = Array.from({ length: Math.max(1, Math.min(count, 20)) }).map(() => {
    const last = Math.floor(Math.random() * 200) + 10
    return {
      ip: `10.1.2.${last}`,
      cpu: `${Math.floor(Math.random() * 24) + 8} 核`,
      memory: `${Math.floor(Math.random() * 128) + 32} GB`,
      os: oss[Math.floor(Math.random() * oss.length)],
      env: envs[Math.floor(Math.random() * envs.length)],
      owner: '自动发现',
      bizSystem: '自动采集'
    }
  })
  const existingIps = new Set(cis.filter(ci => ci.modelCode === 'host').map(ci => ci.attributes?.ip))
  const created = []
  const updated = []
  const skipped = []
  for (const item of discovered) {
    if (!item.ip) continue
    if (existingIps.has(item.ip)) {
      const target = cis.find(ci => ci.modelCode === 'host' && ci.attributes?.ip === item.ip)
      if (target) {
        updated.push(item.ip)
        const patch = { ...item }
        delete patch.ip
        await updateCi(target.id, patch, { operator: 'discovery', source: 'discovery' })
      }
    } else {
      created.push(item.ip)
      existingIps.add(item.ip)
      await createCi('host', item, { operator: 'discovery', source: 'discovery' })
    }
  }
  discoveryLogs = [
    { id: genId('disc'), at: nowIso(), modelCode, discovered: discovered.length, created: created.length, updated: updated.length, skipped: skipped.length },
    ...discoveryLogs
  ]
  return Promise.resolve({ discovered, created, updated, skipped })
}

export function getDiscoveryLogs() {
  return Promise.resolve(deepClone(discoveryLogs))
}

export function getDiscoveryTasks() {
  return Promise.resolve(deepClone(discoveryTasks))
}

export function createDiscoveryTask(payload) {
  const task = {
    id: genId('disc-task'),
    target: payload?.target || '未命名',
    method: payload?.method || 'Agent 采集',
    frequency: payload?.frequency || '每天 02:00',
    status: payload?.status || '运行中',
    updatedAt: nowIso()
  }
  discoveryTasks = [task, ...discoveryTasks]
  return Promise.resolve(true)
}

export function updateDiscoveryTask(id, patch) {
  discoveryTasks = discoveryTasks.map(t => (t.id === id ? { ...t, ...patch, updatedAt: nowIso() } : t))
  return Promise.resolve(true)
}

export function deleteDiscoveryTask(id) {
  discoveryTasks = discoveryTasks.filter(t => t.id !== id)
  return Promise.resolve(true)
}

export function toggleDiscoveryTask(id) {
  discoveryTasks = discoveryTasks.map(t => {
    if (t.id !== id) return t
    return { ...t, status: t.status === '运行中' ? '已暂停' : '运行中', updatedAt: nowIso() }
  })
  return Promise.resolve(true)
}

export function getDiscoveryRules() {
  return Promise.resolve(deepClone(discoveryRules))
}

export function saveDiscoveryRules(payload) {
  discoveryRules = { ...discoveryRules, ...payload }
  return Promise.resolve(true)
}

export function getLifecycleLogs(ciId) {
  const list = lifecycleLogs.filter(l => (ciId ? l.ciId === ciId : true))
  return Promise.resolve(deepClone(list))
}

export function updateCiStatus(ciId, status, reason, operator = '系统') {
  const idx = cis.findIndex(ci => ci.id === ciId)
  if (idx === -1) return Promise.reject(new Error('配置项不存在'))
  cis = cis.map(ci => (ci.id === ciId ? { ...ci, status, updatedAt: nowIso() } : ci))
  lifecycleLogs = [
    { id: genId('life'), ciId, status, reason, operator, at: nowIso() },
    ...lifecycleLogs
  ]
  return Promise.resolve(true)
}

export function bulkUpdateCiStatus(ciIds = [], status, reason, operator = '系统') {
  const ids = new Set(ciIds)
  cis = cis.map(ci => (ids.has(ci.id) ? { ...ci, status, updatedAt: nowIso() } : ci))
  lifecycleLogs = [
    ...ciIds.map(ciId => ({ id: genId('life'), ciId, status, reason, operator, at: nowIso() })),
    ...lifecycleLogs
  ]
  return Promise.resolve(true)
}

export function exportCis(params = {}) {
  const modelCode = normalizeModelCode(params.modelCode)
  const format = params.format || 'json'
  const list = cis.filter(ci => (modelCode ? ci.modelCode === modelCode : true))
  if (format === 'json') {
    return Promise.resolve(JSON.stringify(list, null, 2))
  }
  if (format === 'csv') {
    const models = ciModels.filter(m => (modelCode ? m.code === modelCode : true))
    const fieldKeys = Array.from(new Set(models.flatMap(m => (m.fields || []).map(f => f.key))))
    const header = ['id', 'modelCode', 'status', ...fieldKeys]
    const rows = list.map(ci => {
      const cells = header.map(k => {
        if (k === 'id') return ci.id
        if (k === 'modelCode') return ci.modelCode
        if (k === 'status') return ci.status
        return ci.attributes?.[k] ?? ''
      })
      return cells.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')
    })
    return Promise.resolve([header.join(','), ...rows].join('\n'))
  }
  return Promise.reject(new Error('不支持的导出格式'))
}

export async function importCis(params = {}) {
  const modelCode = normalizeModelCode(params.modelCode)
  const format = params.format || 'json'
  const content = params.content || ''
  if (!modelCode) return Promise.reject(new Error('缺少模型编码'))
  if (!getModelByCode(modelCode)) return Promise.reject(new Error('模型不存在'))
  if (format === 'json') {
    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      return Promise.reject(new Error('JSON 解析失败'))
    }
    if (!Array.isArray(parsed)) return Promise.reject(new Error('JSON 内容应为数组'))
    const results = { created: 0, updated: 0, failed: 0 }
    for (const item of parsed) {
      const attrs = item?.attributes || item
      const uniqueField = (getModelByCode(modelCode)?.fields || []).find(f => f.unique)?.key
      const uniqueValue = uniqueField ? attrs?.[uniqueField] : undefined
      const target = uniqueField ? cis.find(ci => ci.modelCode === modelCode && ci.attributes?.[uniqueField] === uniqueValue) : undefined
      try {
        if (target) {
          await updateCi(target.id, attrs, { operator: 'import', source: 'import' })
          results.updated += 1
        } else {
          await createCi(modelCode, attrs, { operator: 'import', source: 'import' })
          results.created += 1
        }
      } catch {
        results.failed += 1
      }
    }
    return Promise.resolve(results)
  }
  return Promise.reject(new Error('当前仅支持 JSON 导入'))
}

export async function applyChangeToCis(params = {}) {
  const changeId = params.changeId
  const operator = params.operator || 'change'
  const updates = Array.isArray(params.updates) ? params.updates : []
  for (const u of updates) {
    const ciId = u?.ciId
    if (!ciId) continue
    const patch = { ...(u?.patch || {}) }
    patch.lastChangeId = changeId
    patch.lastChangedAt = nowIso()
    await updateCi(ciId, patch, { operator, source: 'change', changeId })
  }
  return Promise.resolve(true)
}

export function getCmdbStats() {
  const total = cis.length
  const online = cis.filter(ci => ci.status === '在线').length
  const idle = cis.filter(ci => ci.status === '闲置').length
  const alert = Object.values(monitorStatus).filter(s => s.status === 'alert').length
  const categoryCount = ciModels.reduce((acc, m) => {
    const cat = getCategoryById(m.categoryId)?.name || '未分类'
    acc[cat] = (acc[cat] || 0) + cis.filter(ci => ci.modelCode === m.code).length
    return acc
  }, {})
  const bizCount = cis.reduce((acc, ci) => {
    const biz = ci.attributes?.bizSystem || '未归属'
    acc[biz] = (acc[biz] || 0) + 1
    return acc
  }, {})
  return Promise.resolve({
    total,
    onlineRate: total ? Number(((online / total) * 100).toFixed(2)) : 0,
    alertRate: total ? Number(((alert / total) * 100).toFixed(2)) : 0,
    idleRate: total ? Number(((idle / total) * 100).toFixed(2)) : 0,
    categoryCount,
    bizCount
  })
}

export function getApps() {
  return getCis({ modelCode: 'app' }).then(list => list.map(ci => ci.attributes))
}

export function getHosts() {
  return getCis({ modelCode: 'host' }).then(list => list.map(ci => ci.attributes))
}

export function getStatusOptions() {
  return Promise.resolve(deepClone(statusOptions))
}

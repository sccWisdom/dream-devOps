const STORAGE_KEY = 'intops_kb_db_v1'

const now = () => new Date().toISOString()

const deepClone = (v) => JSON.parse(JSON.stringify(v))

const readStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

const writeStorage = (db) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

const pad3 = (n) => String(n).padStart(3, '0')

const nextId = (db, prefix) => {
  db.seq[prefix] = (db.seq[prefix] || 0) + 1
  return `${prefix}-${pad3(db.seq[prefix])}`
}

const ensureDb = () => {
  const existed = readStorage()
  if (existed && existed.version === 1) return existed
  const db = {
    version: 1,
    seq: { KB: 3, CAT: 7, TAG: 6, TPL: 3, VER: 3 },
    categories: [
      { id: 'CAT-001', name: '运维通用知识', parentId: null, order: 1 },
      { id: 'CAT-002', name: '数据交维', parentId: null, order: 2 },
      { id: 'CAT-003', name: '平台交维', parentId: null, order: 3 },
      { id: 'CAT-004', name: '操作手册', parentId: null, order: 4 },
      { id: 'CAT-005', name: 'SOP', parentId: null, order: 5 },
      { id: 'CAT-006', name: '案例库', parentId: null, order: 6 },
      { id: 'CAT-007', name: '告警处置', parentId: 'CAT-001', order: 1 }
    ],
    tags: [
      { id: 'TAG-001', name: 'nginx' },
      { id: 'TAG-002', name: 'mysql' },
      { id: 'TAG-003', name: 'cpu' },
      { id: 'TAG-004', name: '502' },
      { id: 'TAG-005', name: '连接池' },
      { id: 'TAG-006', name: '应急' }
    ],
    templates: [
      {
        id: 'TPL-001',
        name: 'SOP模板',
        type: 'SOP',
        content: '【适用场景】\n\n【前置条件】\n\n【处置步骤】\n1.\n2.\n\n【回滚与验证】\n\n【注意事项】\n'
      },
      {
        id: 'TPL-002',
        name: '操作手册模板',
        type: '操作手册',
        content: '【目标】\n\n【操作步骤】\n1.\n2.\n\n【常见问题】\n'
      },
      {
        id: 'TPL-003',
        name: '案例库模板',
        type: '案例库',
        content: '【现象】\n\n【原因分析】\n\n【处置过程】\n\n【复盘总结】\n'
      }
    ],
    articles: [
      {
        id: 'KB-001',
        title: 'Nginx 502 常见原因与排查',
        categoryId: 'CAT-005',
        tagIds: ['TAG-001', 'TAG-004'],
        status: 'published',
        currentVersionId: 'VER-001',
        versions: [
          {
            id: 'VER-001',
            versionNo: 1,
            title: 'Nginx 502 常见原因与排查',
            categoryId: 'CAT-005',
            tagIds: ['TAG-001', 'TAG-004'],
            content: '【现象】\n网关返回 502。\n\n【排查】\n1. 检查上游应用是否存活。\n2. 查看错误日志与 upstream 状态。\n3. 检查超时与连接池配置。\n',
            changeLog: '初版',
            createdAt: now(),
            createdBy: 'admin'
          }
        ],
        views: 1234,
        likeCount: 12,
        dislikeCount: 1,
        approveRecords: [
          { action: 'publish', by: 'admin', at: now(), comment: '发布' }
        ],
        acl: {
          visibility: 'internal',
          encrypt: false,
          read: { depts: [], roles: [], users: [] },
          edit: { depts: [], roles: ['管理员'], users: ['admin'] }
        }
      },
      {
        id: 'KB-002',
        title: 'MySQL 连接暴涨应急方案',
        categoryId: 'CAT-006',
        tagIds: ['TAG-002', 'TAG-006', 'TAG-005'],
        status: 'published',
        currentVersionId: 'VER-002',
        versions: [
          {
            id: 'VER-002',
            versionNo: 1,
            title: 'MySQL 连接暴涨应急方案',
            categoryId: 'CAT-006',
            tagIds: ['TAG-002', 'TAG-006', 'TAG-005'],
            content: '【现象】\n连接数飙升，应用大量报错。\n\n【处置】\n1. 排查异常 SQL 与慢查询。\n2. 检查连接池泄漏。\n3. 评估限流与扩容。\n',
            changeLog: '初版',
            createdAt: now(),
            createdBy: 'admin'
          }
        ],
        views: 876,
        likeCount: 8,
        dislikeCount: 0,
        approveRecords: [
          { action: 'publish', by: 'admin', at: now(), comment: '发布' }
        ],
        acl: {
          visibility: 'internal',
          encrypt: false,
          read: { depts: [], roles: [], users: [] },
          edit: { depts: [], roles: ['管理员'], users: ['admin'] }
        }
      },
      {
        id: 'KB-003',
        title: '应用 CPU 飙高定位手册',
        categoryId: 'CAT-004',
        tagIds: ['TAG-003'],
        status: 'published',
        currentVersionId: 'VER-003',
        versions: [
          {
            id: 'VER-003',
            versionNo: 1,
            title: '应用 CPU 飙高定位手册',
            categoryId: 'CAT-004',
            tagIds: ['TAG-003'],
            content: '【目标】\n快速定位 CPU 异常来源。\n\n【步骤】\n1. 查看 top/ps 指标。\n2. 抓取火焰图或线程栈。\n3. 结合监控定位热点接口。\n',
            changeLog: '初版',
            createdAt: now(),
            createdBy: 'admin'
          }
        ],
        views: 542,
        likeCount: 5,
        dislikeCount: 0,
        approveRecords: [
          { action: 'publish', by: 'admin', at: now(), comment: '发布' }
        ],
        acl: {
          visibility: 'internal',
          encrypt: false,
          read: { depts: [], roles: [], users: [] },
          edit: { depts: [], roles: ['管理员'], users: ['admin'] }
        }
      }
    ]
  }
  writeStorage(db)
  return db
}

const save = (db) => {
  writeStorage(db)
  return deepClone(db)
}

const sortByOrder = (a, b) => (a.order || 0) - (b.order || 0) || String(a.name).localeCompare(String(b.name))

const buildCategoryPathMap = (categories) => {
  const map = new Map(categories.map(c => [c.id, c]))
  const cache = new Map()
  const build = (id) => {
    if (!id) return ''
    if (cache.has(id)) return cache.get(id)
    const node = map.get(id)
    if (!node) return ''
    const p = node.parentId ? build(node.parentId) : ''
    const v = p ? `${p}/${node.name}` : node.name
    cache.set(id, v)
    return v
  }
  categories.forEach(c => build(c.id))
  return cache
}

const normalizeKeyword = (s) => String(s || '').trim().toLowerCase()

const getCurrentVersion = (a) => a.versions.find(v => v.id === a.currentVersionId) || a.versions[a.versions.length - 1]
const normalizeAttachments = (attachments) => {
  if (!Array.isArray(attachments)) return []
  return attachments
    .filter(Boolean)
    .map((item) => ({
      id: String(item.id || ''),
      name: String(item.name || ''),
      size: Number(item.size || 0),
      type: String(item.type || ''),
      content: String(item.content || ''),
      uploadedAt: String(item.uploadedAt || now())
    }))
    .filter((item) => item.name)
}

export function kbListCategories() {
  const db = ensureDb()
  return Promise.resolve(deepClone(db.categories).sort(sortByOrder))
}

export function kbUpsertCategory(payload) {
  const db = ensureDb()
  const id = payload.id || nextId(db, 'CAT')
  const existed = db.categories.find(c => c.id === id)
  const next = {
    id,
    name: String(payload.name || '').trim(),
    parentId: payload.parentId || null,
    order: Number(payload.order || 0)
  }
  if (!next.name) return Promise.reject(new Error('分类名称不能为空'))
  if (existed) Object.assign(existed, next)
  else db.categories.push(next)
  return Promise.resolve(save(db))
}

export function kbDeleteCategory(id) {
  const db = ensureDb()
  const del = new Set([id])
  let changed = true
  while (changed) {
    changed = false
    db.categories.forEach(c => {
      if (c.parentId && del.has(c.parentId) && !del.has(c.id)) {
        del.add(c.id)
        changed = true
      }
    })
  }
  db.categories = db.categories.filter(c => !del.has(c.id))
  db.articles.forEach(a => {
    if (del.has(a.categoryId)) a.categoryId = null
    a.versions.forEach(v => {
      if (del.has(v.categoryId)) v.categoryId = null
    })
  })
  return Promise.resolve(save(db))
}

export function kbListTags() {
  const db = ensureDb()
  return Promise.resolve(deepClone(db.tags).sort((a, b) => String(a.name).localeCompare(String(b.name))))
}

export function kbCreateTag(name) {
  const db = ensureDb()
  const n = String(name || '').trim()
  if (!n) return Promise.reject(new Error('标签名称不能为空'))
  if (db.tags.some(t => t.name === n)) return Promise.reject(new Error('标签已存在'))
  db.tags.push({ id: nextId(db, 'TAG'), name: n })
  return Promise.resolve(save(db))
}

export function kbDeleteTag(id) {
  const db = ensureDb()
  db.tags = db.tags.filter(t => t.id !== id)
  db.articles.forEach(a => {
    a.tagIds = (a.tagIds || []).filter(tid => tid !== id)
    a.versions.forEach(v => { v.tagIds = (v.tagIds || []).filter(tid => tid !== id) })
  })
  return Promise.resolve(save(db))
}

export function kbListTemplates() {
  const db = ensureDb()
  return Promise.resolve(deepClone(db.templates).sort((a, b) => String(a.name).localeCompare(String(b.name))))
}

export function kbUpsertTemplate(payload) {
  const db = ensureDb()
  const id = payload.id || nextId(db, 'TPL')
  const existed = db.templates.find(t => t.id === id)
  const next = {
    id,
    name: String(payload.name || '').trim(),
    type: String(payload.type || '').trim(),
    content: String(payload.content || '')
  }
  if (!next.name) return Promise.reject(new Error('模板名称不能为空'))
  if (!next.type) return Promise.reject(new Error('知识类型不能为空'))
  if (existed) Object.assign(existed, next)
  else db.templates.push(next)
  return Promise.resolve(save(db))
}

export function kbDeleteTemplate(id) {
  const db = ensureDb()
  db.templates = db.templates.filter(t => t.id !== id)
  return Promise.resolve(save(db))
}

const baseArticleView = (a, categories, tags, pathMap) => {
  const v = getCurrentVersion(a)
  const cat = categories.find(c => c.id === v.categoryId)
  return {
    id: a.id,
    title: v.title,
    categoryId: v.categoryId,
    category: cat ? (pathMap.get(cat.id) || cat.name) : '-',
    tagIds: v.tagIds || [],
    tags: (v.tagIds || []).map(id => tags.find(t => t.id === id)?.name).filter(Boolean),
    status: a.status,
    views: a.views || 0,
    likeCount: a.likeCount || 0,
    dislikeCount: a.dislikeCount || 0,
    updatedAt: v.createdAt,
    currentVersionNo: v.versionNo || 1,
    visibility: a.acl?.visibility || 'internal'
  }
}

export function kbListArticles(query = {}) {
  const db = ensureDb()
  const categories = db.categories || []
  const tags = db.tags || []
  const pathMap = buildCategoryPathMap(categories)
  const kw = normalizeKeyword(query.keyword)
  const categoryId = query.categoryId || ''
  const status = query.status || ''
  const tagIds = Array.isArray(query.tagIds) ? query.tagIds : []
  let list = db.articles.map(a => baseArticleView(a, categories, tags, pathMap))
  if (kw) {
    list = list.filter(i => {
      const content = kbGetArticleSync(i.id)?.current?.content || ''
      return normalizeKeyword(i.title).includes(kw) || normalizeKeyword(content).includes(kw)
    })
  }
  if (categoryId) list = list.filter(i => i.categoryId === categoryId)
  if (status) list = list.filter(i => i.status === status)
  if (tagIds.length) list = list.filter(i => tagIds.every(t => (i.tagIds || []).includes(t)))
  const sort = query.sort || 'updatedAt_desc'
  const sorter = {
    updatedAt_desc: (a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)),
    views_desc: (a, b) => (b.views || 0) - (a.views || 0),
    hot_desc: (a, b) => kbHotScore(b) - kbHotScore(a)
  }[sort] || ((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
  list.sort(sorter)
  return Promise.resolve(list)
}

const kbGetArticleSync = (id) => {
  const db = ensureDb()
  const a = db.articles.find(x => x.id === id)
  if (!a) return null
  const categories = db.categories || []
  const tags = db.tags || []
  const pathMap = buildCategoryPathMap(categories)
  const current = getCurrentVersion(a)
  const currentWithAttachments = {
    ...current,
    attachments: normalizeAttachments(current?.attachments)
  }
  return {
    article: deepClone(a),
    current: deepClone(currentWithAttachments),
    view: baseArticleView(a, categories, tags, pathMap),
    categories: deepClone(categories),
    tags: deepClone(tags),
    templates: deepClone(db.templates || [])
  }
}

export function kbGetArticle(id) {
  const v = kbGetArticleSync(id)
  if (!v) return Promise.reject(new Error('知识不存在'))
  return Promise.resolve(v)
}

export function kbCreateDraft(payload, meta = {}) {
  const db = ensureDb()
  const id = nextId(db, 'KB')
  const verId = nextId(db, 'VER')
  const title = String(payload.title || '').trim()
  if (!title) return Promise.reject(new Error('标题不能为空'))
  const categoryId = payload.categoryId || null
  const tagIds = Array.isArray(payload.tagIds) ? payload.tagIds : []
  const content = String(payload.content || '')
  const attachments = normalizeAttachments(payload.attachments)
  const createdBy = meta.by || 'admin'
  const v = {
    id: verId,
    versionNo: 1,
    title,
    categoryId,
    tagIds,
    content,
    attachments,
    changeLog: '创建',
    createdAt: now(),
    createdBy
  }
  const a = {
    id,
    status: 'draft',
    currentVersionId: verId,
    versions: [v],
    views: 0,
    likeCount: 0,
    dislikeCount: 0,
    approveRecords: [{ action: 'create', by: createdBy, at: now(), comment: '' }],
    acl: payload.acl || {
      visibility: 'internal',
      encrypt: false,
      read: { depts: [], roles: [], users: [] },
      edit: { depts: [], roles: ['管理员'], users: [createdBy] }
    }
  }
  db.articles.unshift(a)
  save(db)
  return Promise.resolve(deepClone(a))
}

export function kbUpdateDraft(id, payload, meta = {}) {
  const db = ensureDb()
  const a = db.articles.find(x => x.id === id)
  if (!a) return Promise.reject(new Error('知识不存在'))
  if (a.status !== 'draft' && a.status !== 'rejected') return Promise.reject(new Error('非草稿状态不可编辑'))
  const v = getCurrentVersion(a)
  const title = String(payload.title ?? v.title).trim()
  if (!title) return Promise.reject(new Error('标题不能为空'))
  v.title = title
  v.categoryId = payload.categoryId ?? v.categoryId
  v.tagIds = Array.isArray(payload.tagIds) ? payload.tagIds : v.tagIds
  v.content = payload.content ?? v.content
  if (Array.isArray(payload.attachments)) v.attachments = normalizeAttachments(payload.attachments)
  const by = meta.by || 'admin'
  v.createdAt = now()
  v.createdBy = by
  if (payload.changeLog) v.changeLog = String(payload.changeLog)
  return Promise.resolve(save(db))
}

export function kbSubmit(id, comment = '', meta = {}) {
  const db = ensureDb()
  const a = db.articles.find(x => x.id === id)
  if (!a) return Promise.reject(new Error('知识不存在'))
  if (a.status !== 'draft' && a.status !== 'rejected') return Promise.reject(new Error('当前状态不可提交'))
  a.status = 'pending'
  a.approveRecords.push({ action: 'submit', by: meta.by || 'admin', at: now(), comment: String(comment || '') })
  return Promise.resolve(save(db))
}

export function kbApprove(id, comment = '', meta = {}) {
  const db = ensureDb()
  const a = db.articles.find(x => x.id === id)
  if (!a) return Promise.reject(new Error('知识不存在'))
  if (a.status !== 'pending') return Promise.reject(new Error('当前状态不可审批'))
  a.status = 'approved'
  a.approveRecords.push({ action: 'approve', by: meta.by || 'admin', at: now(), comment: String(comment || '') })
  return Promise.resolve(save(db))
}

export function kbReject(id, comment = '', meta = {}) {
  const db = ensureDb()
  const a = db.articles.find(x => x.id === id)
  if (!a) return Promise.reject(new Error('知识不存在'))
  if (a.status !== 'pending') return Promise.reject(new Error('当前状态不可驳回'))
  a.status = 'rejected'
  a.approveRecords.push({ action: 'reject', by: meta.by || 'admin', at: now(), comment: String(comment || '') })
  return Promise.resolve(save(db))
}

export function kbPublish(id, comment = '', meta = {}) {
  const db = ensureDb()
  const a = db.articles.find(x => x.id === id)
  if (!a) return Promise.reject(new Error('知识不存在'))
  if (a.status !== 'approved') return Promise.reject(new Error('需先审批通过'))
  a.status = 'published'
  a.approveRecords.push({ action: 'publish', by: meta.by || 'admin', at: now(), comment: String(comment || '') })
  return Promise.resolve(save(db))
}

export function kbUnpublish(id, comment = '', meta = {}) {
  const db = ensureDb()
  const a = db.articles.find(x => x.id === id)
  if (!a) return Promise.reject(new Error('知识不存在'))
  if (a.status !== 'published') return Promise.reject(new Error('当前状态不可下线'))
  a.status = 'offline'
  a.approveRecords.push({ action: 'unpublish', by: meta.by || 'admin', at: now(), comment: String(comment || '') })
  return Promise.resolve(save(db))
}

export function kbRepublish(id, comment = '', meta = {}) {
  const db = ensureDb()
  const a = db.articles.find(x => x.id === id)
  if (!a) return Promise.reject(new Error('知识不存在'))
  if (a.status !== 'offline') return Promise.reject(new Error('当前状态不可上线'))
  a.status = 'published'
  a.approveRecords.push({ action: 'republish', by: meta.by || 'admin', at: now(), comment: String(comment || '') })
  return Promise.resolve(save(db))
}

export function kbDeleteArticle(id, meta = {}) {
  const db = ensureDb()
  const idx = db.articles.findIndex(x => x.id === id)
  if (idx === -1) return Promise.reject(new Error('知识不存在'))
  const [removed] = db.articles.splice(idx, 1)
  if (removed) {
    removed.approveRecords = removed.approveRecords || []
    removed.approveRecords.push({ action: 'delete', by: meta.by || 'admin', at: now(), comment: '' })
  }
  return Promise.resolve(save(db))
}

export function kbNewVersion(id, changeLog = '新版本', meta = {}) {
  const db = ensureDb()
  const a = db.articles.find(x => x.id === id)
  if (!a) return Promise.reject(new Error('知识不存在'))
  const curr = getCurrentVersion(a)
  const verId = nextId(db, 'VER')
  const nextNo = Math.max(...a.versions.map(v => v.versionNo || 0)) + 1
  const next = {
    id: verId,
    versionNo: nextNo,
    title: curr.title,
    categoryId: curr.categoryId,
    tagIds: deepClone(curr.tagIds || []),
    content: curr.content,
    attachments: normalizeAttachments(curr.attachments),
    changeLog: String(changeLog || '新版本'),
    createdAt: now(),
    createdBy: meta.by || 'admin'
  }
  a.versions.push(next)
  a.currentVersionId = verId
  a.status = 'draft'
  a.approveRecords.push({ action: 'new_version', by: meta.by || 'admin', at: now(), comment: String(changeLog || '') })
  return Promise.resolve(save(db))
}

export function kbListVersions(id) {
  const v = kbGetArticleSync(id)
  if (!v) return Promise.reject(new Error('知识不存在'))
  const versions = (v.article.versions || []).slice().sort((a, b) => (b.versionNo || 0) - (a.versionNo || 0))
  return Promise.resolve(versions)
}

export function kbRollback(id, versionId, comment = '', meta = {}) {
  const db = ensureDb()
  const a = db.articles.find(x => x.id === id)
  if (!a) return Promise.reject(new Error('知识不存在'))
  const target = a.versions.find(v => v.id === versionId)
  if (!target) return Promise.reject(new Error('版本不存在'))
  const verId = nextId(db, 'VER')
  const nextNo = Math.max(...a.versions.map(v => v.versionNo || 0)) + 1
  const next = {
    id: verId,
    versionNo: nextNo,
    title: target.title,
    categoryId: target.categoryId,
    tagIds: deepClone(target.tagIds || []),
    content: target.content,
    attachments: normalizeAttachments(target.attachments),
    changeLog: `回滚至 v${target.versionNo}${comment ? `：${comment}` : ''}`,
    createdAt: now(),
    createdBy: meta.by || 'admin'
  }
  a.versions.push(next)
  a.currentVersionId = verId
  a.status = 'draft'
  a.approveRecords.push({ action: 'rollback', by: meta.by || 'admin', at: now(), comment: String(comment || '') })
  return Promise.resolve(save(db))
}

export function kbUpdateAcl(id, acl, meta = {}) {
  const db = ensureDb()
  const a = db.articles.find(x => x.id === id)
  if (!a) return Promise.reject(new Error('知识不存在'))
  a.acl = deepClone(acl)
  a.approveRecords.push({ action: 'acl', by: meta.by || 'admin', at: now(), comment: '' })
  return Promise.resolve(save(db))
}

export function kbIncrementView(id) {
  const db = ensureDb()
  const a = db.articles.find(x => x.id === id)
  if (!a) return Promise.reject(new Error('知识不存在'))
  a.views = (a.views || 0) + 1
  return Promise.resolve(save(db))
}

export function kbLike(id) {
  const db = ensureDb()
  const a = db.articles.find(x => x.id === id)
  if (!a) return Promise.reject(new Error('知识不存在'))
  a.likeCount = (a.likeCount || 0) + 1
  return Promise.resolve(save(db))
}

export function kbDislike(id) {
  const db = ensureDb()
  const a = db.articles.find(x => x.id === id)
  if (!a) return Promise.reject(new Error('知识不存在'))
  a.dislikeCount = (a.dislikeCount || 0) + 1
  return Promise.resolve(save(db))
}

export function kbHotScore(articleView) {
  const v = articleView || {}
  const views = v.views || 0
  const like = v.likeCount || 0
  const dislike = v.dislikeCount || 0
  return views + like * 2 - dislike
}

export function kbHotList(limit = 10) {
  return kbListArticles({ sort: 'hot_desc' }).then(list => list.slice(0, limit))
}

export function kbRecommend(text, limit = 6) {
  const db = ensureDb()
  const categories = db.categories || []
  const tags = db.tags || []
  const pathMap = buildCategoryPathMap(categories)
  const t = normalizeKeyword(text)
  if (!t) return Promise.resolve([])
  const tokens = Array.from(new Set(t.split(/[\s,，。；;、/|]+/).filter(Boolean))).slice(0, 12)
  const scored = db.articles
    .filter(a => a.status === 'published')
    .map(a => {
      const v = getCurrentVersion(a)
      const base = normalizeKeyword(`${v.title}\n${v.content}`)
      let score = 0
      tokens.forEach(k => {
        if (!k) return
        if (base.includes(k)) score += 2
        if (normalizeKeyword(v.title).includes(k)) score += 3
      })
      score += Math.min(5, Math.floor((a.views || 0) / 200))
      return { a, score }
    })
    .filter(i => i.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map(i => baseArticleView(i.a, categories, tags, pathMap))
  return Promise.resolve(scored)
}

export function kbImportArticles(items = [], meta = {}) {
  const db = ensureDb()
  const created = []
  const errors = []
  items.forEach((raw, idx) => {
    try {
      const title = String(raw.title || '').trim()
      if (!title) throw new Error('title 不能为空')
      const content = String(raw.content || '')
      const categoryId = raw.categoryId || null
      const tagIds = Array.isArray(raw.tagIds) ? raw.tagIds : []
      const acl = raw.acl
      const a = kbCreateDraftSync(db, { title, content, categoryId, tagIds, acl }, meta)
      created.push(a)
    } catch (e) {
      errors.push({ index: idx, error: e?.message || String(e) })
    }
  })
  save(db)
  return Promise.resolve({ created, errors })
}

const kbCreateDraftSync = (db, payload, meta) => {
  const id = nextId(db, 'KB')
  const verId = nextId(db, 'VER')
  const createdBy = meta.by || 'admin'
  const v = {
    id: verId,
    versionNo: 1,
    title: payload.title,
    categoryId: payload.categoryId || null,
    tagIds: Array.isArray(payload.tagIds) ? payload.tagIds : [],
    content: payload.content || '',
    attachments: normalizeAttachments(payload.attachments),
    changeLog: '导入',
    createdAt: now(),
    createdBy
  }
  const a = {
    id,
    status: 'draft',
    currentVersionId: verId,
    versions: [v],
    views: 0,
    likeCount: 0,
    dislikeCount: 0,
    approveRecords: [{ action: 'import', by: createdBy, at: now(), comment: '' }],
    acl: payload.acl || {
      visibility: 'internal',
      encrypt: false,
      read: { depts: [], roles: [], users: [] },
      edit: { depts: [], roles: ['管理员'], users: [createdBy] }
    }
  }
  db.articles.unshift(a)
  return deepClone(a)
}

export function kbReset() {
  localStorage.removeItem(STORAGE_KEY)
  ensureDb()
  return Promise.resolve(true)
}

export function getKnowledgeBase(options = {}) {
  const includeStatuses = Array.isArray(options.statusInclude) ? options.statusInclude.filter(Boolean) : []
  const excludeStatuses = new Set(Array.isArray(options.statusExclude) ? options.statusExclude.filter(Boolean) : [])
  const includeSet = includeStatuses.length ? new Set(includeStatuses) : null
  return kbListArticles().then(list => {
    const filtered = list.filter(item => {
      if (includeSet && !includeSet.has(item.status)) return false
      if (excludeStatuses.has(item.status)) return false
      return true
    })
    return filtered.map(item => ({
      ...item,
      content: kbGetArticleSync(item.id)?.current?.content || '',
      createdAt: item.updatedAt,
      starred: false
    }))
  })
}

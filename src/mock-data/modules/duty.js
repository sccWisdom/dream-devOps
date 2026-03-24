const DB_KEY = 'duty_db_v1'

export function getDutyUsers() {
  const db = ensureDb()
  return Promise.resolve(db.users.slice())
}

export function listDutyShifts() {
  const db = ensureDb()
  return Promise.resolve(db.shifts.slice().sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)))
}

export function upsertDutyShift(payload) {
  const db = ensureDb()
  const now = Date.now()
  const item = normalizeShift(payload)
  const idx = db.shifts.findIndex(i => i.id === item.id)
  if (idx >= 0) db.shifts[idx] = { ...db.shifts[idx], ...item, updatedAt: now }
  else db.shifts.unshift({ ...item, createdAt: now, updatedAt: now })
  saveDb(db)
  return Promise.resolve(true)
}

export function deleteDutyShift(id) {
  const db = ensureDb()
  db.shifts = db.shifts.filter(i => i.id !== id)
  db.schedules = db.schedules.filter(i => i.shiftId !== id)
  saveDb(db)
  return Promise.resolve(true)
}

export function listDutySchedules({ month }) {
  const db = ensureDb()
  const prefix = `${month}-`
  return Promise.resolve(db.schedules.filter(i => i.date.startsWith(prefix)).slice().sort((a, b) => a.date.localeCompare(b.date)))
}

export function upsertDutySchedule(payload) {
  const db = ensureDb()
  const item = normalizeSchedule(payload)
  const idx = db.schedules.findIndex(i => i.id === item.id)
  if (idx >= 0) db.schedules[idx] = { ...db.schedules[idx], ...item, updatedAt: Date.now() }
  else db.schedules.unshift({ ...item, createdAt: Date.now(), updatedAt: Date.now() })
  saveDb(db)
  return Promise.resolve(true)
}

export function deleteDutySchedule(id) {
  const db = ensureDb()
  db.schedules = db.schedules.filter(i => i.id !== id)
  saveDb(db)
  return Promise.resolve(true)
}

export function generateDutySchedules({ month, shiftId, rule }) {
  const db = ensureDb()
  const m = parseMonth(month)
  const days = getDaysInMonth(m.y, m.m)
  const shift = db.shifts.find(i => i.id === shiftId)
  if (!shift) return Promise.resolve({ ok: false, message: '班次不存在' })
  const members = Array.isArray(shift.members) && shift.members.length ? shift.members : db.users.map(i => i.name)
  if (!members.length) return Promise.resolve({ ok: false, message: '班次未配置值班人员' })

  const leaves = db.leaveRequests.filter(i => i.status === '已通过')
  const isOnLeave = (user, date) => {
    const d = date.replaceAll('-', '')
    return leaves.some(l => {
      if (l.user !== user) return false
      const a = (l.fromDate || '').replaceAll('-', '')
      const b = (l.toDate || '').replaceAll('-', '')
      return a && b && d >= a && d <= b
    })
  }

  const keepManual = rule?.keepManual !== false
  const existing = db.schedules.filter(i => i.date.startsWith(`${month}-`) && i.shiftId === shiftId)
  const byDate = new Map(existing.map(i => [i.date, i]))

  let cursor = rule?.startIndex || 0
  const pickUser = (date) => {
    for (let k = 0; k < members.length; k++) {
      const idx = (cursor + k) % members.length
      const cand = members[idx]
      if (!isOnLeave(cand, date)) {
        cursor = (idx + 1) % members.length
        return cand
      }
    }
    const idx = cursor % members.length
    const cand = members[idx]
    cursor = (cursor + 1) % members.length
    return cand
  }

  const created = []
  for (let day = 1; day <= days; day++) {
    const date = formatDate(m.y, m.m, day)
    const exists = byDate.get(date)
    if (exists && keepManual && exists.source === 'manual') continue
    const user = pickUser(date)
    const next = normalizeSchedule({
      id: exists?.id || uid(),
      date,
      shiftId,
      shiftName: shift.name,
      user,
      source: exists?.source === 'manual' && !keepManual ? 'auto' : (exists?.source || 'auto'),
      status: exists?.status || '计划中',
      checkInAt: exists?.checkInAt || '',
      checkOutAt: exists?.checkOutAt || '',
      handoverDone: exists?.handoverDone || false,
      handoverAt: exists?.handoverAt || '',
      logSubmitted: exists?.logSubmitted || false,
      ticketHandled: exists?.ticketHandled ?? Math.floor(1 + Math.random() * 6),
      alarmResponses: exists?.alarmResponses ?? Math.floor(Math.random() * 4),
      alarmAvgResponseMin: exists?.alarmAvgResponseMin ?? Math.floor(3 + Math.random() * 18),
      emergencyCount: exists?.emergencyCount ?? (Math.random() > 0.85 ? 1 : 0)
    })
    if (exists) {
      const idx = db.schedules.findIndex(i => i.id === exists.id)
      if (idx >= 0) db.schedules[idx] = { ...db.schedules[idx], ...next, updatedAt: Date.now() }
      else db.schedules.unshift({ ...next, createdAt: Date.now(), updatedAt: Date.now() })
    } else {
      db.schedules.unshift({ ...next, createdAt: Date.now(), updatedAt: Date.now() })
      created.push(next)
    }
  }
  saveDb(db)
  return Promise.resolve({ ok: true, createdCount: created.length })
}

export function checkInDuty({ scheduleId, at }) {
  const db = ensureDb()
  const i = db.schedules.findIndex(s => s.id === scheduleId)
  if (i < 0) return Promise.resolve({ ok: false, message: '记录不存在' })
  const now = at || nowText()
  const item = db.schedules[i]
  db.schedules[i] = { ...item, status: '值班中', checkInAt: item.checkInAt || now, updatedAt: Date.now() }
  saveDb(db)
  return Promise.resolve({ ok: true })
}

export function checkOutDuty({ scheduleId, at }) {
  const db = ensureDb()
  const i = db.schedules.findIndex(s => s.id === scheduleId)
  if (i < 0) return Promise.resolve({ ok: false, message: '记录不存在' })
  const now = at || nowText()
  const item = db.schedules[i]
  db.schedules[i] = { ...item, status: '已结束', checkOutAt: item.checkOutAt || now, updatedAt: Date.now() }
  saveDb(db)
  return Promise.resolve({ ok: true })
}

export function submitHandover({ scheduleId, done, at }) {
  const db = ensureDb()
  const i = db.schedules.findIndex(s => s.id === scheduleId)
  if (i < 0) return Promise.resolve({ ok: false, message: '记录不存在' })
  const now = at || nowText()
  const item = db.schedules[i]
  db.schedules[i] = { ...item, handoverDone: !!done, handoverAt: done ? (item.handoverAt || now) : '', updatedAt: Date.now() }
  saveDb(db)
  return Promise.resolve({ ok: true })
}

export function submitDutyLog({ scheduleId, submitted }) {
  const db = ensureDb()
  const i = db.schedules.findIndex(s => s.id === scheduleId)
  if (i < 0) return Promise.resolve({ ok: false, message: '记录不存在' })
  const item = db.schedules[i]
  db.schedules[i] = { ...item, logSubmitted: !!submitted, updatedAt: Date.now() }
  saveDb(db)
  return Promise.resolve({ ok: true })
}

export function listLeaveRequests() {
  const db = ensureDb()
  return Promise.resolve(db.leaveRequests.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)))
}

export function createLeaveRequest(payload) {
  const db = ensureDb()
  const item = normalizeLeave(payload)
  db.leaveRequests.unshift({ ...item, createdAt: Date.now(), updatedAt: Date.now() })
  saveDb(db)
  return Promise.resolve(true)
}

export function approveLeaveRequest({ id, status, approver, remark }) {
  const db = ensureDb()
  const idx = db.leaveRequests.findIndex(i => i.id === id)
  if (idx < 0) return Promise.resolve({ ok: false, message: '申请不存在' })
  const item = db.leaveRequests[idx]
  const next = {
    ...item,
    status: status || item.status,
    approver: approver || item.approver,
    remark: remark ?? item.remark,
    updatedAt: Date.now()
  }
  db.leaveRequests[idx] = next
  saveDb(db)
  return Promise.resolve({ ok: true })
}

export function listDutyNotifications() {
  const db = ensureDb()
  return Promise.resolve(db.notifications.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)))
}

export function pushDutyNotification(payload) {
  const db = ensureDb()
  const item = normalizeNotification(payload)
  db.notifications.unshift({ ...item, createdAt: Date.now(), updatedAt: Date.now() })
  saveDb(db)
  return Promise.resolve(true)
}

export function markDutyNotificationRead(id) {
  const db = ensureDb()
  const idx = db.notifications.findIndex(i => i.id === id)
  if (idx < 0) return Promise.resolve(false)
  db.notifications[idx] = { ...db.notifications[idx], read: true, updatedAt: Date.now() }
  saveDb(db)
  return Promise.resolve(true)
}

export function getDutyStats({ month, users }) {
  const db = ensureDb()
  const list = db.schedules.filter(i => i.date.startsWith(`${month}-`))
  const targetUsers = users && users.length ? users : db.users.map(i => i.name)
  const byUser = targetUsers.map(u => {
    const items = list.filter(i => i.user === u)
    const dutyCount = items.length
    const ended = items.filter(i => i.status === '已结束').length
    const checkIn = items.filter(i => i.checkInAt).length
    const handover = items.filter(i => i.handoverDone).length
    const logs = items.filter(i => i.logSubmitted).length
    const tickets = items.reduce((acc, i) => acc + (i.ticketHandled || 0), 0)
    const alarms = items.reduce((acc, i) => acc + (i.alarmResponses || 0), 0)
    const emergencies = items.reduce((acc, i) => acc + (i.emergencyCount || 0), 0)
    const alarmAvg = alarms ? Math.round(items.reduce((acc, i) => acc + (i.alarmAvgResponseMin || 0) * (i.alarmResponses || 0), 0) / alarms) : 0
    return { user: u, dutyCount, ended, checkIn, handover, logs, tickets, alarms, alarmAvg, emergencies }
  })

  const totalDuty = byUser.reduce((acc, i) => acc + i.dutyCount, 0)
  const totalEnded = byUser.reduce((acc, i) => acc + i.ended, 0)
  const totalCheckIn = byUser.reduce((acc, i) => acc + i.checkIn, 0)
  const totalHandover = byUser.reduce((acc, i) => acc + i.handover, 0)
  const totalLogs = byUser.reduce((acc, i) => acc + i.logs, 0)
  const totalTickets = byUser.reduce((acc, i) => acc + i.tickets, 0)
  const totalAlarms = byUser.reduce((acc, i) => acc + i.alarms, 0)
  const totalEmergencies = byUser.reduce((acc, i) => acc + i.emergencies, 0)
  const alarmAvgResponseMin = totalAlarms
    ? Math.round(byUser.reduce((acc, i) => acc + i.alarmAvg * i.alarms, 0) / totalAlarms)
    : 0

  return Promise.resolve({
    kpi: {
      totalDuty,
      checkInRate: totalDuty ? roundPct(totalCheckIn / totalDuty) : 0,
      handoverRate: totalEnded ? roundPct(totalHandover / totalEnded) : 0,
      logRate: totalEnded ? roundPct(totalLogs / totalEnded) : 0,
      totalTickets,
      totalAlarms,
      alarmAvgResponseMin,
      totalEmergencies
    },
    byUser
  })
}

function ensureDb() {
  const raw = safeGet(DB_KEY)
  if (raw) return raw
  const seed = seedDb()
  safeSet(DB_KEY, seed)
  return seed
}

function saveDb(db) {
  safeSet(DB_KEY, db)
}

function safeGet(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function safeSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
  }
}

function uid() {
  return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function seedDb() {
  const users = [
    { id: 'u1', name: '王伟', team: '一线', phone: '13800000001' },
    { id: 'u2', name: '李静', team: '一线', phone: '13800000002' },
    { id: 'u3', name: '张敏', team: '二线', phone: '13800000003' },
    { id: 'u4', name: '陈强', team: '二线', phone: '13800000004' },
    { id: 'u5', name: '赵磊', team: '平台', phone: '13800000005' }
  ]
  const shifts = [
    normalizeShift({
      id: 'shift-day',
      name: '日班',
      type: '日班',
      startTime: '09:00',
      endTime: '18:00',
      handoverTime: '17:30',
      leader: '张敏',
      members: ['王伟', '李静', '陈强'],
      responsibilities: '告警响应、工单处置、应急协同、交接班'
    }),
    normalizeShift({
      id: 'shift-night',
      name: '夜班',
      type: '夜班',
      startTime: '18:00',
      endTime: '09:00',
      handoverTime: '08:30',
      leader: '赵磊',
      members: ['李静', '王伟', '赵磊'],
      responsibilities: '夜间告警值守、重大故障升级、应急事件通知'
    })
  ]
  const leaveRequests = [
    normalizeLeave({
      id: 'leave-1',
      user: '王伟',
      type: '请假',
      fromDate: '2026-03-22',
      toDate: '2026-03-23',
      reason: '个人原因',
      status: '已通过',
      approver: 'admin'
    })
  ]
  return {
    users,
    shifts,
    schedules: [],
    leaveRequests,
    notifications: []
  }
}

function normalizeShift(i) {
  return {
    id: i?.id || uid(),
    name: i?.name || '',
    type: i?.type || '日班',
    startTime: i?.startTime || '09:00',
    endTime: i?.endTime || '18:00',
    handoverTime: i?.handoverTime || '',
    leader: i?.leader || '',
    members: Array.isArray(i?.members) ? i.members : [],
    responsibilities: i?.responsibilities || '',
    enabled: i?.enabled !== false
  }
}

function normalizeSchedule(i) {
  return {
    id: i?.id || uid(),
    date: i?.date || '',
    shiftId: i?.shiftId || '',
    shiftName: i?.shiftName || '',
    user: i?.user || '',
    source: i?.source || 'manual',
    status: i?.status || '计划中',
    checkInAt: i?.checkInAt || '',
    checkOutAt: i?.checkOutAt || '',
    handoverDone: !!i?.handoverDone,
    handoverAt: i?.handoverAt || '',
    logSubmitted: !!i?.logSubmitted,
    ticketHandled: i?.ticketHandled ?? 0,
    alarmResponses: i?.alarmResponses ?? 0,
    alarmAvgResponseMin: i?.alarmAvgResponseMin ?? 0,
    emergencyCount: i?.emergencyCount ?? 0,
    note: i?.note || '',
    tableName: i?.tableName || '',
    repeatRule: i?.repeatRule || 'none'
  }
}

function normalizeLeave(i) {
  return {
    id: i?.id || uid(),
    user: i?.user || '',
    type: i?.type || '请假',
    fromDate: i?.fromDate || '',
    toDate: i?.toDate || '',
    reason: i?.reason || '',
    targetUser: i?.targetUser || '',
    cc: Array.isArray(i?.cc) ? i.cc : [],
    status: i?.status || '待审批',
    approver: i?.approver || '',
    remark: i?.remark || ''
  }
}

function normalizeNotification(i) {
  return {
    id: i?.id || uid(),
    type: i?.type || '告警',
    level: i?.level || 'P2',
    title: i?.title || '',
    content: i?.content || '',
    channels: Array.isArray(i?.channels) && i.channels.length ? i.channels : ['站内'],
    targets: Array.isArray(i?.targets) ? i.targets : [],
    read: !!i?.read,
    action: i?.action || ''
  }
}

function parseMonth(month) {
  const [y, m] = (month || '').split('-').map(Number)
  return { y, m }
}

function getDaysInMonth(y, m) {
  return new Date(y, m, 0).getDate()
}

function formatDate(y, m, d) {
  const mm = String(m).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

function nowText() {
  const t = new Date()
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const d = String(t.getDate()).padStart(2, '0')
  const hh = String(t.getHours()).padStart(2, '0')
  const mm = String(t.getMinutes()).padStart(2, '0')
  const ss = String(t.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

function roundPct(n) {
  return Math.round(n * 1000) / 10
}

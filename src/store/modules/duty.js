import { defineStore } from 'pinia'
import {
  getDutyUsers,
  listDutyShifts,
  upsertDutyShift,
  deleteDutyShift,
  listDutySchedules,
  upsertDutySchedule,
  deleteDutySchedule,
  generateDutySchedules,
  listLeaveRequests,
  createLeaveRequest,
  approveLeaveRequest,
  listDutyNotifications,
  pushDutyNotification,
  markDutyNotificationRead,
  checkInDuty,
  checkOutDuty,
  submitHandover,
  submitDutyLog,
  getDutyStats
} from '@/mock-data/modules/duty'

export const useDutyStore = defineStore('duty', {
  state: () => ({
    users: [],
    shifts: [],
    schedules: [],
    leaveRequests: [],
    notifications: [],
    currentMonth: ''
  }),
  actions: {
    async init(month) {
      await Promise.all([this.loadUsers(), this.loadShifts(), this.loadLeaveRequests(), this.loadNotifications()])
      if (month) await this.loadSchedules(month)
    },
    async loadUsers() {
      this.users = await getDutyUsers()
    },
    async loadShifts() {
      this.shifts = await listDutyShifts()
    },
    async saveShift(payload) {
      await upsertDutyShift(payload)
      await this.loadShifts()
    },
    async removeShift(id) {
      await deleteDutyShift(id)
      await this.loadShifts()
      if (this.currentMonth) await this.loadSchedules(this.currentMonth)
    },
    async loadSchedules(month) {
      this.currentMonth = month
      this.schedules = await listDutySchedules({ month })
    },
    async saveSchedule(payload) {
      await upsertDutySchedule(payload)
      if (this.currentMonth) await this.loadSchedules(this.currentMonth)
    },
    async saveSchedules(payloads = []) {
      const list = Array.isArray(payloads) ? payloads : []
      for (const payload of list) {
        await upsertDutySchedule(payload)
      }
      if (this.currentMonth) await this.loadSchedules(this.currentMonth)
    },
    async removeSchedule(id) {
      await deleteDutySchedule(id)
      if (this.currentMonth) await this.loadSchedules(this.currentMonth)
    },
    async autoGenerateSchedules({ month, shiftId, rule }) {
      const r = await generateDutySchedules({ month, shiftId, rule })
      if (this.currentMonth) await this.loadSchedules(this.currentMonth)
      return r
    },
    async loadLeaveRequests() {
      this.leaveRequests = await listLeaveRequests()
    },
    async submitLeaveRequest(payload) {
      await createLeaveRequest(payload)
      await this.loadLeaveRequests()
    },
    async reviewLeaveRequest({ id, status, approver, remark }) {
      const r = await approveLeaveRequest({ id, status, approver, remark })
      await this.loadLeaveRequests()
      return r
    },
    async loadNotifications() {
      this.notifications = await listDutyNotifications()
    },
    async sendNotification(payload) {
      await pushDutyNotification(payload)
      await this.loadNotifications()
    },
    async readNotification(id) {
      await markDutyNotificationRead(id)
      await this.loadNotifications()
    },
    async checkIn(scheduleId) {
      const r = await checkInDuty({ scheduleId })
      if (this.currentMonth) await this.loadSchedules(this.currentMonth)
      return r
    },
    async checkOut(scheduleId) {
      const r = await checkOutDuty({ scheduleId })
      if (this.currentMonth) await this.loadSchedules(this.currentMonth)
      return r
    },
    async handover(scheduleId, done) {
      const r = await submitHandover({ scheduleId, done })
      if (this.currentMonth) await this.loadSchedules(this.currentMonth)
      return r
    },
    async dutyLog(scheduleId, submitted) {
      const r = await submitDutyLog({ scheduleId, submitted })
      if (this.currentMonth) await this.loadSchedules(this.currentMonth)
      return r
    },
    async stats({ month, users }) {
      return await getDutyStats({ month, users })
    }
  }
})

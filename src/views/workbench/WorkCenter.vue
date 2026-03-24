<template>
  <div class="container work-center">
    <div class="page-title">工作中心</div>

    <!-- 今日工单概览 -->
    <div class="overview-section">
      <div class="section-title">今日工单概览</div>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon todo">
            <el-icon class="icon"><Tickets /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.todo }}</div>
            <div class="stat-label">今日待办工单</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon backlog">
            <el-icon class="icon"><WarningFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.backlog }}</div>
            <div class="stat-label">积压工单</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon suspended">
            <el-icon class="icon"><Timer /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.suspended }}</div>
            <div class="stat-label">挂起工单</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon overtime">
            <el-icon class="icon"><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.overtime }}</div>
            <div class="stat-label">超时工单</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon resolved">
            <el-icon class="icon"><Check /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.resolved }}</div>
            <div class="stat-label">已解决工单</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧：我的工单 -->
      <div class="left-panel">
        <div class="section-title">我的工单</div>
        <div class="ticket-section">
          <div class="ticket-filter">
            <el-select
              v-model="ticketFilter"
              placeholder="状态"
              clearable
              class="filter-select"
            >
              <el-option label="全部" value="" />
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="已解决" value="resolved" />
              <el-option label="已关闭" value="closed" />
            </el-select>
          </div>
          <el-table :data="filteredTickets" class="ticket-table">
            <el-table-column prop="id" label="单号" width="160" />
            <el-table-column prop="type" label="类型" width="80" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="priority" label="优先级" width="80">
              <template #default="scope">
                <span
                  :class="['priority-tag', scope.row.priority.toLowerCase()]"
                >
                  {{ scope.row.priority }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <span :class="['status-tag', scope.row.status]">
                  {{ getStatusText(scope.row.status) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="requester" label="提单人" width="120" />
            <el-table-column prop="createdAt" label="提交时间" width="160" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="primary" size="small">处置</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 右侧：变更日历和值班日历 -->
      <div class="right-panel">
        <!-- 变更日历 -->
        <div class="calendar-section">
          <div class="section-title">
            变更日历
            <span class="date-badge">{{ currentDate }}</span>
          </div>
          <div class="change-calendar">
            <div v-if="changeEvents.length === 0" class="empty-state">
              <el-icon class="empty-icon"><Calendar /></el-icon>
              <div class="empty-text">今日无变更计划</div>
            </div>
            <div v-else class="event-list">
              <div
                v-for="(event, index) in changeEvents"
                :key="index"
                class="event-item"
              >
                <div class="event-time">{{ event.time }}</div>
                <div class="event-content">
                  <div class="event-title">{{ event.title }}</div>
                  <div class="event-desc">{{ event.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 值班日历 -->
        <div class="calendar-section">
          <div class="section-title">
            值班日历
            <span class="date-badge">{{ currentDate }}</span>
          </div>
          <div class="duty-calendar">
            <div v-if="dutyEvents.length === 0" class="empty-state">
              <el-icon class="empty-icon"><UserFilled /></el-icon>
              <div class="empty-text">今日无值班安排</div>
            </div>
            <div v-else class="duty-list">
              <div
                v-for="(duty, index) in dutyEvents"
                :key="index"
                class="duty-item"
              >
                <div class="duty-time">{{ duty.shift }}</div>
                <div class="duty-content">
                  <div class="duty-person">{{ duty.person }}</div>
                  <div class="duty-contact">{{ duty.contact }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Tickets,
  WarningFilled,
  Clock,
  Check,
  Calendar,
  UserFilled,
  ArrowRight,
  Timer,
} from "@element-plus/icons-vue";
import { getMyTickets } from "../../mock-data/modules/ticket";
import { getTodayOverview } from "../../mock-data/modules/workbench";

const mine = ref([]);
const overview = ref({
  todo: 0,
  backlog: 0,
  suspended: 0,
  overtime: 0,
  resolved: 0,
});
const ticketFilter = ref("");
const currentDate = ref("");
const changeEvents = ref([]);
const dutyEvents = ref([]);

onMounted(async () => {
  // 获取我的工单
  mine.value = await getMyTickets();
  // 获取今日工单概览
  overview.value = await getTodayOverview();
  // 设置当前日期
  setCurrentDate();
  // 模拟变更事件数据
  mockChangeEvents();
  // 模拟值班事件数据
  mockDutyEvents();
});

const filteredTickets = computed(() => {
  if (!ticketFilter.value) {
    return mine.value;
  }
  return mine.value.filter((ticket) => ticket.status === ticketFilter.value);
});

const getStatusText = (status) => {
  const statusMap = {
    pending: "待处理",
    processing: "处理中",
    resolved: "已解决",
    closed: "已关闭",
  };
  return statusMap[status] || status;
};

const setCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  currentDate.value = `${year}-${month}-${day}`;
};

const mockChangeEvents = () => {
  changeEvents.value = [
    {
      time: "09:30",
      title: "系统升级",
      description: "生产环境系统版本升级",
    },
    {
      time: "14:00",
      title: "数据库维护",
      description: "主数据库备份与优化",
    },
    {
      time: "16:30",
      title: "网络设备配置",
      description: "核心交换机配置更新",
    },
  ];
};

const mockDutyEvents = () => {
  dutyEvents.value = [
    {
      shift: "早班",
      person: "张三",
      contact: "13800138000",
    },
    {
      shift: "晚班",
      person: "王五",
      contact: "13700137000",
    },
  ];
};
</script>

<style scoped>
.work-center {
  padding: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
}

/* 概览部分 */
.overview-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.date-badge {
  font-size: 12px;
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border-radius: 12px;
  font-weight: 500;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.stat-icon.backlog {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
}

.stat-icon.overtime {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stat-icon.suspended {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.stat-icon.resolved {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.stat-icon .icon {
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

/* 主内容区域 */
.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

/* 左侧面板 */
.left-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.ticket-section {
  margin-top: 16px;
}

.ticket-filter {
  margin-bottom: 16px;
}

.filter-select {
  width: 150px;
}

.ticket-table {
  border-radius: 8px;
  overflow: hidden;
}

.view-all {
  margin-top: 16px;
  text-align: right;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: #2563eb;
}

/* 右侧面板 */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.calendar-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.change-calendar,
.duty-calendar {
  margin-top: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

.event-list,
.duty-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item,
.duty-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(241, 245, 249, 0.6);
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.event-time,
.duty-time {
  width: 60px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.event-content,
.duty-content {
  flex: 1;
}

.event-title,
.duty-person {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.event-desc,
.duty-contact {
  font-size: 12px;
  color: #64748b;
}

/* 标签样式 */
.priority-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.priority-tag.p1 {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.priority-tag.p2 {
  background: rgba(245, 158, 11, 0.1);
  color: #ea580c;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.priority-tag.p3 {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.pending {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.status-tag.processing {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
  border: 1px solid rgba(124, 58, 237, 0.2);
}

.status-tag.resolved {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-tag.closed {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
  border: 1px solid rgba(100, 116, 139, 0.2);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .right-panel {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .calendar-section {
    flex: 1;
    min-width: 300px;
  }
}

@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }

  .right-panel {
    flex-direction: column;
  }

  .work-center {
    padding: 12px;
  }
}
</style>

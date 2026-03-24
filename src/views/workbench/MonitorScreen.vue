<template>
  <div class="monitor-screen">
    <div class="board-columns">
      <section class="board-col left-col">
        <header class="col-header">业务层</header>

        <section class="monitor-panel scene-panel">
          <header class="panel-header">
            <h3>应用场景监控</h3>
          </header>
          <div class="scene-grid">
            <article v-for="item in sceneCards" :key="item.name" class="scene-card">
              <div class="scene-name" :title="item.name">{{ item.name }}</div>
              <div class="scene-stats">
                <div>节点数 {{ item.total }}</div>
                <div>正常节点 {{ item.normal }}</div>
                <div>挂起节点 {{ item.offline }}</div>
              </div>
              <div class="scene-alert">{{ item.alert }}</div>
            </article>
          </div>
        </section>

        <section class="monitor-panel table-panel">
          <header class="panel-header">
            <h3>数据共享监控</h3>
            <strong class="panel-warn">12</strong>
          </header>
          <div class="data-table">
            <div class="table-head table-row">
              <span>集群标签</span>
              <span>接口地址</span>
              <span>接口名</span>
              <span>责任方</span>
              <span>时段可用率</span>
              <span>p95耗时</span>
            </div>
            <div class="table-body">
              <div v-for="row in dataShareRows" :key="row.id" class="table-row">
                <span>{{ row.group }}</span>
                <span class="mono" :title="row.path">{{ row.path }}</span>
                <span :title="row.api">{{ row.api }}</span>
                <span :title="row.owner">{{ row.owner }}</span>
                <span>{{ row.availability }}</span>
                <span :class="['latency', row.latencyClass]">{{ row.latency }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="monitor-panel table-panel">
          <header class="panel-header">
            <h3>数据下发监控</h3>
            <strong class="panel-warn">65</strong>
          </header>
          <div class="data-table">
            <div class="table-head table-row row-5">
              <span>团队名</span>
              <span>异常任务名</span>
              <span>任务周期</span>
              <span>异常类型</span>
              <span>事件单</span>
            </div>
            <div class="table-body">
              <div v-for="row in dataDeliveryRows" :key="row.id" class="table-row row-5">
                <span>{{ row.team }}</span>
                <span :title="row.task">{{ row.task }}</span>
                <span>{{ row.cycle }}</span>
                <span class="warn">{{ row.type }}</span>
                <span>{{ row.ticket }}</span>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section class="board-col right-col">
        <header class="col-header">应用层</header>

        <section class="monitor-panel app-panel">
          <header class="panel-header">
            <h3>共享子系统</h3>
          </header>
          <div class="app-content">
            <div class="subsystem-grid">
              <article v-for="item in sharedSubsystems" :key="item.name" class="subsystem-card">
                <div class="subsystem-name" :title="item.name">{{ item.name }}</div>
                <div class="subsystem-metric">耗时 <span>{{ item.latency }}</span></div>
                <div class="subsystem-metric">健康 <span>{{ item.health }}</span></div>
              </article>
            </div>
            <div class="node-table node-table-tight">
              <div class="node-head node-row">
                <span>单点名称</span>
                <span>服务</span>
                <span>耗时</span>
                <span>所属集群</span>
              </div>
              <div class="node-body">
                <div v-for="row in sharedNodeRows" :key="row.name" class="node-row">
                  <span>{{ row.name }}</span>
                  <span><i class="status-dot"></i></span>
                  <span>{{ row.latency }}</span>
                  <span>{{ row.group }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="monitor-panel app-panel">
          <header class="panel-header">
            <h3>开发子系统-调度集群</h3>
          </header>
          <div class="app-content">
            <div class="subsystem-grid subsystem-grid-small">
              <article v-for="item in devSubsystems" :key="item.name" class="subsystem-card">
                <div class="subsystem-name">{{ item.name }}</div>
                <div class="subsystem-metric">健康 <span>{{ item.health }}</span></div>
              </article>
            </div>
            <div class="node-table node-table-tight">
              <div class="node-head node-row row-3">
                <span>单点名称</span>
                <span>服务</span>
                <span>所属集群</span>
              </div>
              <div class="node-body">
                <div v-for="row in devNodeRows" :key="row.name" class="node-row row-3">
                  <span>{{ row.name }}</span>
                  <span><i class="status-dot"></i></span>
                  <span>{{ row.group }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="cluster-tag">底座-星环</div>

        <section class="monitor-panel channel-panel">
          <header class="panel-header">
            <h3>业务通道</h3>
          </header>
          <div class="channel-grid">
            <article v-for="item in channels" :key="item.name" class="channel-card">
              <div class="channel-name">{{ item.name }}</div>
              <div class="channel-body">
                <p class="channel-status">通道可用</p>
                <p>通道响应时间 <span>{{ item.latency }}</span></p>
                <p>计算资源使用率 <span>{{ item.cpu }}</span></p>
                <p>业务时段读写入SQL数 <span>{{ item.sql }}</span></p>
                <p>网络IO秒量 <span>{{ item.io }}</span></p>
              </div>
            </article>
          </div>
        </section>

        <section class="monitor-panel node-panel">
          <header class="panel-header">
            <h3>服务节点</h3>
          </header>
          <div class="service-grid">
            <article v-for="group in serviceNodeGroups" :key="group.name" class="service-col">
              <div class="service-head">{{ group.name }} <span>{{ group.online }}</span></div>
              <div class="service-rows">
                <div v-for="node in group.nodes" :key="node.name" class="service-row">
                  <span>{{ node.name }}</span>
                  <span>{{ node.latency }}</span>
                  <span class="ok">可用</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </section>
    </div>
  </div>
</template>

<script setup>
const sceneCards = [
  { name: '基层治理只取一次 原地智办', total: 79, normal: 72, offline: 0, alert: 7 },
  { name: '一企一档街镇站点', total: 156, normal: 146, offline: 6, alert: 4 },
  { name: '法人可视化', total: 150, normal: 146, offline: 6, alert: 4 },
  { name: '创新组 一屏观', total: 173, normal: 168, offline: 2, alert: 3 },
  { name: '残疾人就业保障金征缴 一件事', total: 53, normal: 50, offline: 0, alert: 3 },
  { name: '残保金征缴 一件事', total: 24, normal: 21, offline: 0, alert: 3 },
  { name: '养老 一件事', total: 47, normal: 43, offline: 2, alert: 2 },
  { name: '自然人 免申即享', total: 61, normal: 59, offline: 1, alert: 2 },
  { name: '红十字会接口需求任务流程', total: 19, normal: 17, offline: 0, alert: 2 },
  { name: '亚信运维日常巡检', total: 15, normal: 13, offline: 0, alert: 2 },
  { name: '一网通办两页', total: 162, normal: 157, offline: 4, alert: 1 },
  { name: '免申即享 上海市杨浦政务', total: 35, normal: 34, offline: 4, alert: 1 }
]

const dataShareRows = [
  { id: 1, group: '星环', path: '/dataex/api/TAC24/9005', api: '世界信息资源检索', owner: '上海市人资中心', availability: '0.00%', latency: '10.00ms', latencyClass: 'slow' },
  { id: 2, group: '星环', path: '/dataex/api/96c3684468', api: '招标公告', owner: '上海市杨浦和市容局', availability: '0.00%', latency: '173.00ms', latencyClass: 'slow' },
  { id: 3, group: '星环', path: '/dataex/api/06130a6362', api: '劳动仲裁信息表', owner: '上海市人力资源局', availability: '0.00%', latency: '5.00ms', latencyClass: 'fast' },
  { id: 4, group: '代理', path: '/dataex/api/unifiedphone', api: '上海市大数据中心-整合统一', owner: '上海市公安局', availability: '0.00%', latency: '0.00ms', latencyClass: 'fast' },
  { id: 5, group: '阿里', path: '/dataex/api/9e262a3057', api: '机动车基础信息全量', owner: '上海市公安局', availability: '3.39%', latency: '51.00ms', latencyClass: 'normal' },
  { id: 6, group: '星环', path: '/dataex/api/83a7cb3667', api: '纳税申报表', owner: '国家税务总局上海局', availability: '99.70%', latency: '344.00ms', latencyClass: 'slow' },
  { id: 7, group: '星环', path: '/dataex/api/099f1cd81e', api: '房屋权属登记', owner: '上海市规划和自然资源局', availability: '100.00%', latency: '17.00ms', latencyClass: 'normal' },
  { id: 8, group: '星环', path: '/dataex/api/ce324f4d81', api: '社会保险缴费单', owner: '上海市社保中心', availability: '99.90%', latency: '28.00ms', latencyClass: 'normal' }
]

const dataDeliveryRows = [
  { id: 1, team: '数智安全运营团队', task: 'ProTestData_FUSION_SCZJ_GP_PURCHASE_DATA', cycle: '天任务', type: '执行异常', ticket: 'SJ20260321-254' },
  { id: 2, team: '数智安全运营团队', task: 'ProTestData_FUSION_LSSYS_LNR_T_GA_RJBX', cycle: '天任务', type: '执行异常', ticket: 'SJ20260321-255' },
  { id: 3, team: '数智安全运营团队', task: 'ProTestData_FUSION_DSJZX_MZ_D_JBXX_SYNC', cycle: '天任务', type: '执行异常', ticket: 'SJ20260321-262' },
  { id: 4, team: '数智安全运营团队', task: 'ProTestData_FUSION_YLZTK_CHX_FWFY_EVENT', cycle: '天任务', type: '执行异常', ticket: 'SJ20260321-251' },
  { id: 5, team: '数智安全运营团队', task: 'ProTestData_FUSION_SCZJ_GP_PURCHASER_PUSH', cycle: '天任务', type: '执行异常', ticket: 'SJ20260321-239' },
  { id: 6, team: '数智安全运营团队', task: 'ProTestData_YLZTK_CHX_ZH_E_CHART_PUSH', cycle: '天任务', type: '执行异常', ticket: 'SJ20260321-258' },
  { id: 7, team: '数智安全运营团队', task: 'ProTestData_DSZX_JYZX_FY_QS_CLEAN', cycle: '天任务', type: '执行异常', ticket: 'SJ20260321-241' },
  { id: 8, team: '数智安全运营团队', task: 'ProTestData_FUSION_MDL_CTI_SYNC_ODS', cycle: '天任务', type: '执行异常', ticket: 'SJ20260321-246' }
]

const sharedSubsystems = [
  { name: '阿里其他数据服务组', latency: '8.36ms', health: '100.00%' },
  { name: '星环普通服务组', latency: '7.59ms', health: '100.00%' },
  { name: '阿里ali_share服务组', latency: '11.60ms', health: '100.00%' },
  { name: '法接口服务组', latency: '8.86ms', health: '100.00%' },
  { name: '备用集群组', latency: '8.93ms', health: '100.00%' },
  { name: '标准地址库服务组', latency: '7.75ms', health: '100.00%' },
  { name: '星环数据写入组', latency: '8.52ms', health: '100.00%' },
  { name: '星环企业组服务', latency: '8.02ms', health: '100.00%' }
]

const devSubsystems = [
  { name: '安全扫描集群', health: '100.00%' },
  { name: '星环常规集群', health: '100.00%' },
  { name: '测试集群', health: '100.00%' },
  { name: '财政业务集群', health: '100.00%' },
  { name: '质量检查集群', health: '100.00%' },
  { name: '运营报告集群', health: '100.00%' },
  { name: '阿里集群', health: '100.00%' },
  { name: '驾驶舱集群', health: '100.00%' }
]

const sharedNodeRows = [
  { name: '172.27.57.206:9090', latency: '10.47ms', group: '阿里ali_shared服务组' },
  { name: '172.27.148.182:9090', latency: '8.00ms', group: '星环普通服务组' },
  { name: '172.27.57.126:8080', latency: '7.73ms', group: 'APISIX网关' },
  { name: '172.27.57.127:9090', latency: '6.95ms', group: '流接口服务组' }
]

const devNodeRows = [
  { name: '172.27.124.33:8090', group: '测试集群' },
  { name: '172.27.124.18:8090', group: '驾驶舱集群' },
  { name: '172.27.124.19:8090', group: '驾驶舱集群' },
  { name: '172.27.124.34:8090', group: '驾驶舱集群' }
]

const channels = [
  { name: '分发通道', latency: '235ms', cpu: '1.50%', sql: '1', io: '0' },
  { name: '默认查询通道', latency: '274ms', cpu: '0.00%', sql: '0', io: '0' },
  { name: '重点业务通道', latency: '279ms', cpu: '0.00%', sql: '0', io: '0' },
  { name: '驾驶舱分发', latency: '192ms', cpu: '0.00%', sql: '0', io: '0' },
  { name: '驾驶舱查询', latency: '295ms', cpu: '0.00%', sql: '0', io: '0' }
]

const serviceNodeGroups = [
  {
    name: '分发通道',
    online: '0/2',
    nodes: [
      { name: 'quark-server-m668b', latency: '337ms' },
      { name: 'quark-server-qltzk', latency: '244ms' }
    ]
  },
  {
    name: '默认查询',
    online: '0/15',
    nodes: [
      { name: 'quark-server-l9fd8', latency: '307ms' },
      { name: 'quark-server-rztwk', latency: '239ms' }
    ]
  },
  {
    name: '重点业务',
    online: '0/13',
    nodes: [
      { name: 'quark-server-w4scq', latency: '311ms' },
      { name: 'quark-server-tchxn', latency: '295ms' }
    ]
  },
  {
    name: '驾驶舱分发',
    online: '0/3',
    nodes: [
      { name: 'quark-server-7m8sr', latency: '203ms' },
      { name: 'quark-server-q9rg6', latency: '170ms' }
    ]
  },
  {
    name: '驾驶舱查询',
    online: '0/2',
    nodes: [
      { name: 'quark-server-xw5d7', latency: '196ms' },
      { name: 'quark-server-zwvcz', latency: '182ms' }
    ]
  }
]
</script>

<style scoped>
.monitor-screen {
  height: 100%;
  min-height: 0;
  color: #cde7ff;
  overflow: hidden;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Segoe UI', sans-serif;
}

.board-columns {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(520px, 42%) minmax(680px, 58%);
  gap: clamp(8px, 0.6vw, 12px);
  padding: clamp(6px, 0.6vw, 10px);
}

.board-col {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 0.6vw, 10px);
  overflow: hidden;
}

.col-header {
  height: clamp(34px, 2.5vh, 40px);
  border: 1px solid rgba(31, 87, 145, 0.62);
  background: linear-gradient(180deg, rgba(12, 38, 72, 0.86), rgba(6, 20, 42, 0.96));
  box-shadow: inset 0 0 24px rgba(26, 94, 161, 0.26);
  border-radius: 4px;
  color: #ffffff;
  font-size: clamp(13px, 0.9vw, 16px);
  font-weight: 700;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.monitor-panel {
  min-height: 0;
  border: 1px solid rgba(31, 87, 145, 0.62);
  background: linear-gradient(180deg, rgba(6, 21, 41, 0.94), rgba(2, 11, 24, 0.98));
  box-shadow: inset 0 0 24px rgba(14, 68, 129, 0.28), inset 0 1px 0 rgba(78, 146, 210, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scene-panel {
  flex: 1.2;
}

.table-panel {
  flex: 0.88;
}

.app-panel {
  flex: 0.95;
}

.channel-panel {
  flex: 0.62;
}

.node-panel {
  flex: 0.64;
}

.panel-header {
  height: clamp(28px, 2.2vh, 34px);
  padding: 0 clamp(8px, 0.6vw, 10px);
  border-bottom: 1px solid rgba(31, 87, 145, 0.45);
  background: linear-gradient(180deg, rgba(9, 38, 73, 0.74), rgba(5, 19, 38, 0.75));
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.panel-header h3 {
  margin: 0;
  font-size: clamp(12px, 0.78vw, 14px);
  color: #d8efff;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.3px;
}

.panel-warn {
  color: #ff5d6e;
  font-size: clamp(18px, 1.4vw, 22px);
  line-height: 1;
  font-weight: 700;
}

.scene-grid {
  padding: clamp(4px, 0.45vw, 6px);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(4px, 0.35vw, 6px);
  flex: 1;
  min-height: 0;
}

.scene-card {
  border: 1px solid rgba(36, 94, 154, 0.55);
  background: linear-gradient(180deg, rgba(8, 27, 50, 0.96), rgba(4, 14, 30, 0.98));
  box-shadow: inset 0 -14px 22px rgba(21, 104, 156, 0.1);
  padding: clamp(4px, 0.35vw, 6px);
  position: relative;
  overflow: hidden;
  min-height: 76px;
}

.scene-card::after {
  content: '';
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 70px;
  height: 70px;
  background: radial-gradient(circle, rgba(36, 170, 255, 0.22), rgba(0, 0, 0, 0));
}

.scene-name {
  max-width: calc(100% - 34px);
  color: #e3f3ff;
  font-size: clamp(11px, 0.7vw, 13px);
  line-height: 1.25;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scene-stats {
  margin-top: 2px;
  display: grid;
  justify-content: end;
  color: rgba(168, 202, 230, 0.9);
  font-size: clamp(10px, 0.63vw, 12px);
  line-height: 1.25;
  text-align: right;
}

.scene-alert {
  position: absolute;
  left: 8px;
  bottom: 5px;
  color: #ff4e58;
  font-size: clamp(24px, 1.8vw, 30px);
  line-height: 1;
  font-weight: 700;
}

.data-table {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 10% 24% 22% 22% 10% 12%;
  align-items: center;
  gap: clamp(6px, 0.4vw, 8px);
  padding: 0 clamp(8px, 0.6vw, 10px);
  min-width: 640px;
}

.row-5 {
  grid-template-columns: 16% 32% 12% 12% 28%;
  min-width: 540px;
}

.table-head {
  height: clamp(26px, 2vh, 30px);
  color: #3ea6e5;
  background: linear-gradient(180deg, rgba(20, 53, 94, 0.55), rgba(10, 29, 56, 0.55));
  border-bottom: 1px solid rgba(31, 87, 145, 0.42);
  font-size: clamp(11px, 0.66vw, 12px);
  white-space: nowrap;
}

.table-body {
  min-height: 0;
  flex: 1;
  overflow: auto;
}

.table-body .table-row {
  height: clamp(28px, 2.2vh, 32px);
  border-bottom: 1px solid rgba(17, 59, 106, 0.34);
  color: rgba(196, 224, 245, 0.92);
  font-size: clamp(11px, 0.66vw, 12px);
}

.table-body .table-row:hover,
.node-body .node-row:hover,
.service-row:hover {
  background: rgba(28, 90, 155, 0.14);
}

.table-row span,
.node-row span,
.service-row span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mono {
  font-family: Consolas, Monaco, 'Courier New', monospace;
}

.warn {
  color: #ff4d5c;
}

.latency.fast {
  color: #58dba6;
}

.latency.normal {
  color: #88c9f0;
}

.latency.slow {
  color: #ff7c84;
}

.app-content {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 52% 48%;
}

.subsystem-grid {
  min-height: 0;
  overflow: auto;
  padding: clamp(6px, 0.5vw, 8px);
  border-right: 1px solid rgba(31, 87, 145, 0.38);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(6px, 0.5vw, 8px);
  align-content: start;
}

.subsystem-grid-small {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.subsystem-card {
  border: 1px solid rgba(52, 135, 206, 0.6);
  background: linear-gradient(180deg, rgba(8, 34, 60, 0.98), rgba(4, 17, 35, 0.96));
  box-shadow: inset 0 -12px 18px rgba(28, 155, 184, 0.09);
  padding: clamp(4px, 0.35vw, 6px);
  min-height: 60px;
}

.subsystem-name {
  color: #e2f4ff;
  font-weight: 600;
  font-size: clamp(11px, 0.66vw, 12px);
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subsystem-metric {
  color: #93bad7;
  font-size: clamp(10px, 0.62vw, 11px);
  line-height: 1.35;
}

.subsystem-metric span {
  margin-left: 4px;
  color: #e5f7ff;
  font-weight: 600;
}

.node-table {
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.node-row {
  display: grid;
  grid-template-columns: 34% 10% 16% 40%;
  align-items: center;
  gap: clamp(6px, 0.4vw, 8px);
  padding: 0 clamp(8px, 0.6vw, 10px);
  min-width: 360px;
  height: clamp(30px, 2.25vh, 34px);
  color: rgba(197, 224, 247, 0.95);
  border-bottom: 1px solid rgba(17, 59, 106, 0.35);
  font-size: clamp(11px, 0.66vw, 12px);
}

.node-row.row-3 {
  grid-template-columns: 44% 12% 44%;
}

.node-head {
  color: #3ea6e5;
  height: clamp(28px, 2vh, 30px);
  background: linear-gradient(180deg, rgba(20, 53, 94, 0.56), rgba(10, 29, 56, 0.58));
  border-bottom-color: rgba(31, 87, 145, 0.45);
}

.node-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  background: #26e5be;
  box-shadow: 0 0 10px rgba(38, 229, 190, 0.9);
  animation: pulse 1.6s infinite ease-in-out;
}

.cluster-tag {
  height: clamp(26px, 2vh, 30px);
  border: 1px solid rgba(31, 87, 145, 0.5);
  background: linear-gradient(180deg, rgba(8, 26, 50, 0.8), rgba(4, 14, 30, 0.85));
  color: rgba(187, 211, 228, 0.92);
  font-size: clamp(12px, 0.72vw, 13px);
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.channel-grid,
.service-grid {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: clamp(6px, 0.5vw, 8px);
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: clamp(6px, 0.5vw, 8px);
}

.channel-card,
.service-col {
  border: 1px solid rgba(36, 97, 158, 0.58);
  background: linear-gradient(180deg, rgba(6, 24, 45, 0.96), rgba(2, 12, 26, 0.97));
}

.channel-card {
  display: grid;
  grid-template-columns: 28px 1fr;
  min-height: 100px;
}

.channel-name {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 2px;
  color: #2d9dde;
  font-size: clamp(11px, 0.62vw, 12px);
  border-right: 1px solid rgba(36, 97, 158, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.channel-body {
  padding: clamp(4px, 0.4vw, 6px);
  overflow: hidden;
}

.channel-body p {
  margin: 0;
  color: #95c1de;
  font-size: clamp(10px, 0.6vw, 11px);
  line-height: 1.28;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.channel-body p + p {
  margin-top: 2px;
}

.channel-status {
  color: #2fd9b4 !important;
  font-weight: 700;
}

.channel-body span {
  color: #e4f5ff;
  margin-left: 2px;
}

.service-col {
  min-height: 104px;
  display: flex;
  flex-direction: column;
}

.service-head {
  height: clamp(26px, 2vh, 28px);
  padding: 0 8px;
  color: #2f9ee0;
  font-size: clamp(11px, 0.62vw, 12px);
  border-bottom: 1px solid rgba(36, 97, 158, 0.44);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.service-head span {
  color: #4ad1a9;
  margin-left: 8px;
}

.service-rows {
  min-height: 0;
  flex: 1;
  overflow: auto;
}

.service-row {
  height: clamp(28px, 2.2vh, 30px);
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: clamp(6px, 0.4vw, 8px);
  padding: 0 8px;
  color: rgba(197, 223, 245, 0.92);
  border-bottom: 1px solid rgba(17, 59, 106, 0.34);
  font-size: clamp(11px, 0.62vw, 12px);
}

.ok {
  color: #48d4a8;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.75);
  }
}

@media (max-width: 1680px) {
  .board-columns {
    grid-template-columns: 40% 60%;
  }

  .scene-grid,
  .subsystem-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .channel-grid,
  .service-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1366px) {
  .board-columns {
    grid-template-columns: 1fr;
    overflow: auto;
  }

  .board-col {
    overflow: visible;
  }

  .scene-grid,
  .subsystem-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .app-content {
    grid-template-columns: 1fr;
  }

  .subsystem-grid {
    border-right: 0;
    border-bottom: 1px solid rgba(31, 87, 145, 0.38);
  }

  .channel-grid,
  .service-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .scene-grid,
  .subsystem-grid,
  .channel-grid,
  .service-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-head,
  .table-row,
  .row-5,
  .node-row {
    min-width: 560px;
  }
}

@media (max-width: 768px) {
  .scene-grid,
  .subsystem-grid,
  .channel-grid,
  .service-grid {
    grid-template-columns: 1fr;
  }

  .scene-card,
  .channel-card,
  .service-col {
    min-height: 90px;
  }

  .table-head,
  .table-row,
  .row-5,
  .node-row {
    min-width: 520px;
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(10, 29, 56, 0.5);
}

::-webkit-scrollbar-thumb {
  background: rgba(36, 97, 158, 0.55);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(36, 97, 158, 0.72);
}
</style>

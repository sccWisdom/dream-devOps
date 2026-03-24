import dayjs from 'dayjs'

const PERIOD_LABELS = {
  day: '日报',
  week: '周报',
  month: '月报',
  custom: '自定义'
}

const REPORT_MAP = {
  'daily-weekly': {
    seed: 31,
    title: '运维日报、周报',
    subtitle: '围绕工单闭环、SLA 与值班效率，支持每日值守和周复盘。',
    owner: 'NOC 值班组',
    defaultPeriod: 'week',
    periodOptions: ['day', 'week', 'custom'],
    kpis: [
      { label: '工单总量', base: 286, format: 'number', unit: '单', better: 'up', scaleByPeriod: true, delta: 12 },
      { label: '工单闭环率', base: 95.6, format: 'percent', better: 'up', scaleByPeriod: false, delta: 3 },
      { label: 'SLA 达标率', base: 97.2, format: 'percent', better: 'up', scaleByPeriod: false, delta: 2.2 },
      { label: '平均响应时长', base: 11.2, format: 'decimal', unit: '分钟', better: 'down', scaleByPeriod: false, delta: 9 },
      { label: '平均修复时长', base: 38.5, format: 'decimal', unit: '分钟', better: 'down', scaleByPeriod: false, delta: 10 },
      { label: '自动化处置率', base: 63.8, format: 'percent', better: 'up', scaleByPeriod: false, delta: 6 }
    ],
    trend: { title: '工单受理与闭环趋势', base: 40, target: 38, volatility: 8 },
    distributionTitle: '工单类型结构',
    distribution: [['事件', 126], ['问题', 35], ['变更', 51], ['发布', 28], ['服务请求', 42]],
    executionTitle: '班组处理结构',
    execution: [
      ['系统组', 76, 11, 2],
      ['应用组', 65, 13, 3],
      ['数据库组', 57, 8, 2],
      ['网络组', 49, 7, 1],
      ['中间件组', 43, 6, 1]
    ],
    riskTitle: '关键效率指标',
    risks: [
      ['SLA 达标率', 97.2, 98, 'percent', 'up'],
      ['超时工单占比', 3.7, 4.5, 'percent', 'down'],
      ['紧急事件 30 分钟响应率', 95.4, 96, 'percent', 'up'],
      ['值班交接缺陷数', 2.1, 3, 'decimal', 'down', '项'],
      ['知识库复用率', 58.2, 55, 'percent', 'up']
    ],
    alerts: [
      { type: 'warning', title: 'SLA 预警', desc: '数据库组出现 2 单高优超时，建议本班次闭环。' },
      { type: 'success', title: '效率亮点', desc: '自动化处置率持续提升，重复故障工单下降。' }
    ],
    detailTitle: '重点工单明细',
    detailColumns: [
      { prop: 'id', label: '工单编号', width: 170 },
      { prop: 'category', label: '类型', width: 90 },
      { prop: 'title', label: '标题', minWidth: 260 },
      { prop: 'priority', label: '优先级', width: 90, tagType: { P1: 'danger', P2: 'warning', P3: 'info' } },
      { prop: 'status', label: '状态', width: 110, tagType: { 处理中: 'warning', 待验证: 'info', 已解决: 'success' } },
      { prop: 'owner', label: '责任组', width: 110 },
      { prop: 'elapsed', label: '耗时', width: 95 }
    ],
    details: [
      ['INC-20260321-0138', '事件', '核心接口错误率抖动告警', 'P1', '处理中', '应用组', '42 分钟'],
      ['INC-20260321-0112', '事件', '主机 CPU 峰值持续超阈值', 'P2', '待验证', '系统组', '27 分钟'],
      ['CHG-20260321-0041', '变更', '数据库补丁升级后健康检查', 'P2', '处理中', '数据库组', '1.3 小时'],
      ['REQ-20260321-0087', '服务请求', '业务账号批量权限开通', 'P3', '已解决', '服务台', '18 分钟'],
      ['PRB-20260321-0009', '问题', '消息堆积周期性回归问题', 'P2', '待验证', '中间件组', '2.1 小时']
    ],
    indicators: [
      ['工单规模', '工单总量', '周期创建工单数', '趋势可控', '日/周', '工单系统'],
      ['工单效率', '工单闭环率', '闭环工单 / 总工单', '>= 95%', '日/周', '工单系统'],
      ['服务质量', 'SLA 达标率', '达标工单 / 总工单', '>= 98%', '日/周', 'SLA 引擎'],
      ['响应能力', '平均响应时长', '首响总时长 / 工单数', '<= 15 分钟', '日/周', '工单系统'],
      ['自动化', '自动化处置率', '自动处置工单 / 可自动工单', '>= 60%', '周', '自动化平台']
    ],
    actions: [
      ['数据库组', '处理高优超时工单并补齐回放脚本', '今日 18:30', '高', '进行中'],
      ['系统组', '优化批量巡检任务执行窗口', '明日 10:00', '中', '待开始'],
      ['NOC 值班组', '更新值班交接模板', '本周五', '中', '进行中'],
      ['平台组', '推进自动化规则灰度上线', '本周五', '高', '待评审']
    ],
    timeline: [
      ['08:12', 'danger', 'P1 事件升级', '核心接口错误率超阈值，触发跨组协同。'],
      ['09:35', 'warning', '容量预警', '数据库连接池逼近上限，执行限流策略。'],
      ['10:18', 'primary', '变更校验', '补丁升级任务完成，进入业务回归。'],
      ['11:06', 'success', '工单闭环', '账号权限开通工单完成并通知业务。']
    ]
  },
  'monitor-statistics': {
    seed: 47,
    title: '监控统计报表',
    subtitle: '覆盖监控接入质量、告警噪音治理、闭环效率与可用性表现。',
    owner: '监控告警组',
    defaultPeriod: 'week',
    periodOptions: ['day', 'week', 'month', 'custom'],
    kpis: [
      { label: '监控对象总数', base: 1268, format: 'number', unit: '个', better: 'up', scaleByPeriod: false, delta: 4 },
      { label: '告警总量', base: 936, format: 'number', unit: '条', better: 'down', scaleByPeriod: true, delta: 12 },
      { label: '告警压缩率', base: 71.5, format: 'percent', better: 'up', scaleByPeriod: false, delta: 5 },
      { label: '噪音告警占比', base: 13.8, format: 'percent', better: 'down', scaleByPeriod: false, delta: 6 },
      { label: '告警闭环时长', base: 17.6, format: 'decimal', unit: '分钟', better: 'down', scaleByPeriod: false, delta: 10 },
      { label: '核心服务可用性', base: 99.93, format: 'percent', better: 'up', scaleByPeriod: false, delta: 0.6 }
    ],
    trend: { title: '告警触发与闭环趋势', base: 122, target: 116, volatility: 26 },
    distributionTitle: '告警等级结构',
    distribution: [['P1 严重', 26], ['P2 重要', 110], ['P3 提示', 242], ['P4 信息', 330]],
    executionTitle: '监控域处理状态',
    execution: [
      ['主机监控', 178, 24, 7],
      ['应用监控', 146, 22, 6],
      ['数据库监控', 120, 16, 4],
      ['中间件监控', 108, 14, 4],
      ['网络监控', 94, 9, 2]
    ],
    riskTitle: '监控治理指标',
    risks: [
      ['告警接入覆盖率', 96.7, 97, 'percent', 'up'],
      ['误报率', 2.7, 3.5, 'percent', 'down'],
      ['重复告警压缩率', 71.5, 70, 'percent', 'up'],
      ['P1 告警 5 分钟确认率', 93.2, 95, 'percent', 'up'],
      ['告警派单准确率', 89.4, 90, 'percent', 'up']
    ],
    alerts: [
      { type: 'warning', title: '噪音告警偏高', desc: '网络监控域存在重复阈值配置，建议本周清理。' },
      { type: 'info', title: '容量预测提升', desc: '主机监控引入趋势预测后，提前发现容量风险。' }
    ],
    detailTitle: '高优告警明细',
    detailColumns: [
      { prop: 'id', label: '告警编号', width: 180 },
      { prop: 'domain', label: '监控域', width: 110 },
      { prop: 'level', label: '级别', width: 90, tagType: { P1: 'danger', P2: 'warning', P3: 'info' } },
      { prop: 'title', label: '告警内容', minWidth: 280 },
      { prop: 'status', label: '状态', width: 105, tagType: { 已确认: 'warning', 处理中: 'warning', 已闭环: 'success' } },
      { prop: 'owner', label: '责任组', width: 105 },
      { prop: 'duration', label: '持续时长', width: 95 }
    ],
    details: [
      ['ALM-20260321-01183', '应用监控', 'P1', '政务网关 5xx 比例突增', '处理中', '应用组', '19 分钟'],
      ['ALM-20260321-01096', '数据库监控', 'P2', '主库连接池使用率超过 90%', '已确认', '数据库组', '31 分钟'],
      ['ALM-20260321-01042', '主机监控', 'P2', '计算节点 CPU 持续高位', '处理中', '系统组', '44 分钟'],
      ['ALM-20260321-00977', '网络监控', 'P3', '边界设备丢包率波动', '已闭环', '网络组', '12 分钟'],
      ['ALM-20260321-00928', '中间件监控', 'P2', '消息堆积达到预警阈值', '处理中', '中间件组', '37 分钟']
    ],
    indicators: [
      ['监控覆盖', '监控对象总数', '已纳管监控对象数量', '持续提升', '周', '监控平台'],
      ['告警规模', '告警总量', '周期内告警触发总次数', '逐步下降', '日/周', '告警中心'],
      ['噪音治理', '噪音告警占比', '无效告警 / 告警总数', '<= 15%', '周', '告警中心'],
      ['压缩能力', '告警压缩率', '(原始-去重后)/原始', '>= 70%', '周', '告警中心'],
      ['闭环效率', '平均闭环时长', '闭环总时长 / 闭环告警数', '<= 20 分钟', '日/周', '告警中心']
    ],
    actions: [
      ['监控告警组', '清理重复阈值规则并发布治理清单', '今日 17:30', '高', '进行中'],
      ['网络组', '优化链路抖动检测阈值', '明日 11:00', '中', '待开始'],
      ['平台组', '新增业务链路合成监控 12 项', '本周四', '中', '待评审'],
      ['应用组', '完善 P1 告警自动升级策略', '本周五', '高', '进行中']
    ],
    timeline: [
      ['07:48', 'warning', '告警风暴', '网络链路抖动引发批量 P3 告警，启动压缩策略。'],
      ['08:05', 'danger', 'P1 告警', '核心网关 5xx 告警触发升级流程。'],
      ['08:26', 'primary', '跨组联动', '应用与网络协同定位，回滚异常配置。'],
      ['08:39', 'success', '恢复完成', '业务成功率恢复，告警进入观察期。']
    ]
  },
  'system-inspection': {
    seed: 59,
    title: '系统巡检报表',
    subtitle: '跟踪巡检覆盖、隐患识别、整改闭环与自动化执行能力。',
    owner: '系统巡检组',
    defaultPeriod: 'week',
    periodOptions: ['week', 'month', 'custom'],
    kpis: [
      { label: '巡检任务总数', base: 214, format: 'number', unit: '项', better: 'up', scaleByPeriod: true, delta: 8 },
      { label: '巡检完成率', base: 96.1, format: 'percent', better: 'up', scaleByPeriod: false, delta: 2.5 },
      { label: '巡检准时率', base: 93.6, format: 'percent', better: 'up', scaleByPeriod: false, delta: 3.2 },
      { label: '高危隐患整改率', base: 92.4, format: 'percent', better: 'up', scaleByPeriod: false, delta: 4.2 },
      { label: '自动化巡检占比', base: 67.1, format: 'percent', better: 'up', scaleByPeriod: false, delta: 6.1 },
      { label: '平均巡检耗时', base: 16.5, format: 'decimal', unit: '分钟', better: 'down', scaleByPeriod: false, delta: 8 }
    ],
    trend: { title: '巡检任务执行趋势', base: 30, target: 28, volatility: 6 },
    distributionTitle: '隐患类型分布',
    distribution: [['容量风险', 22], ['性能风险', 18], ['安全风险', 12], ['配置偏差', 26], ['备份异常', 15]],
    executionTitle: '环境巡检状态',
    execution: [
      ['生产环境', 96, 8, 2],
      ['预发环境', 58, 6, 2],
      ['测试环境', 46, 5, 1],
      ['灾备环境', 38, 4, 2],
      ['数据中心机房', 30, 3, 1]
    ],
    riskTitle: '巡检质量指标',
    risks: [
      ['巡检覆盖率', 98.1, 98, 'percent', 'up'],
      ['高危隐患闭环时长', 28.4, 32, 'decimal', 'down', '小时'],
      ['巡检漏检率', 1.9, 2.5, 'percent', 'down'],
      ['巡检脚本成功率', 95.8, 96, 'percent', 'up'],
      ['整改复发率', 4.2, 5.5, 'percent', 'down']
    ],
    alerts: [
      { type: 'warning', title: '隐患整改提醒', desc: '2 项高危配置偏差未在 SLA 内完成整改。' },
      { type: 'success', title: '自动化提升', desc: '新增巡检脚本覆盖存储和中间件关键检查项。' }
    ],
    detailTitle: '巡检问题明细',
    detailColumns: [
      { prop: 'id', label: '任务编号', width: 170 },
      { prop: 'system', label: '系统/资源', width: 140 },
      { prop: 'issue', label: '问题项', minWidth: 240 },
      { prop: 'severity', label: '风险级别', width: 92, tagType: { 高: 'danger', 中: 'warning', 低: 'info' } },
      { prop: 'status', label: '整改状态', width: 110, tagType: { 待整改: 'danger', 整改中: 'warning', 已完成: 'success' } },
      { prop: 'owner', label: '责任人', width: 95 },
      { prop: 'deadline', label: '整改期限', width: 120 }
    ],
    details: [
      ['CHK-20260321-062', '核心数据库集群', '备份链路延迟超过基线 30%', '高', '整改中', '赵阳', '03-22 18:00'],
      ['CHK-20260321-055', '业务网关节点', '证书有效期不足 15 天', '中', '待整改', '李睿', '03-23 12:00'],
      ['CHK-20260321-049', '中间件集群', '消费者堆积阈值未按规范配置', '中', '整改中', '王珂', '03-22 20:00'],
      ['CHK-20260321-037', '灾备存储', '增量同步任务失败 1 次', '高', '待整改', '陈明', '03-22 09:00'],
      ['CHK-20260321-028', '运维管理节点', '日志保留策略偏离标准', '低', '已完成', '孙涛', '03-21 16:00']
    ],
    indicators: [
      ['执行规模', '巡检任务总数', '周期计划巡检任务数', '趋势可控', '周/月', '巡检平台'],
      ['执行效率', '巡检完成率', '完成任务 / 计划任务', '>= 95%', '周/月', '巡检平台'],
      ['时效管理', '巡检准时率', '按时完成 / 完成任务', '>= 93%', '周/月', '巡检平台'],
      ['隐患闭环', '高危隐患整改率', '已整改高危隐患 / 高危隐患总数', '>= 90%', '周/月', '隐患台账'],
      ['覆盖质量', '巡检覆盖率', '已巡检资产 / 在网资产', '>= 98%', '周/月', 'CMDB']
    ],
    actions: [
      ['巡检组', '完成高危配置偏差整改复核', '今日 19:00', '高', '进行中'],
      ['数据库组', '补齐备份延迟诊断脚本并回归', '明日 09:30', '高', '待开始'],
      ['安全组', '证书批量续期并更新台账', '本周四', '中', '进行中'],
      ['平台组', '新增自动化巡检模板', '本周五', '中', '待评审']
    ],
    timeline: [
      ['06:40', 'primary', '巡检任务下发', '生产、预发、灾备巡检任务自动触发。'],
      ['08:08', 'warning', '高危隐患发现', '灾备存储增量同步失败，触发工单。'],
      ['09:12', 'danger', '风险升级', '数据库备份延迟超阈值，进入重点跟踪。'],
      ['10:26', 'success', '隐患闭环', '日志保留策略已修复并通过复检。']
    ]
  },
  'platform-delivery': {
    seed: 73,
    title: '平台交维报表',
    subtitle: '面向平台交维流程，度量交接质量、环境一致性与上线稳定性。',
    owner: '平台交维组',
    defaultPeriod: 'week',
    periodOptions: ['week', 'month', 'custom'],
    kpis: [
      { label: '交维需求数', base: 72, format: 'number', unit: '项', better: 'up', scaleByPeriod: true, delta: 10 },
      { label: '准入通过率', base: 94.1, format: 'percent', better: 'up', scaleByPeriod: false, delta: 4 },
      { label: '文档完整率', base: 92.6, format: 'percent', better: 'up', scaleByPeriod: false, delta: 4 },
      { label: '环境一致率', base: 90.8, format: 'percent', better: 'up', scaleByPeriod: false, delta: 4.5 },
      { label: '平均交维周期', base: 3.7, format: 'decimal', unit: '天', better: 'down', scaleByPeriod: false, delta: 8 },
      { label: '上线 7 日稳定率', base: 96.5, format: 'percent', better: 'up', scaleByPeriod: false, delta: 2.8 }
    ],
    trend: { title: '交维需求处理趋势', base: 12, target: 11, volatility: 3 },
    distributionTitle: '交维类型占比',
    distribution: [['新系统交维', 20], ['版本升级交维', 26], ['扩容交维', 14], ['架构调整交维', 9], ['专项保障交维', 12]],
    executionTitle: '责任团队处理状态',
    execution: [
      ['平台组', 28, 5, 1],
      ['应用组', 25, 7, 2],
      ['数据库组', 18, 4, 1],
      ['网络组', 14, 3, 1],
      ['安全组', 12, 2, 1]
    ],
    riskTitle: '交维质量指标',
    risks: [
      ['交接资料完整度', 92.6, 95, 'percent', 'up'],
      ['上线回退率', 2.5, 3.2, 'percent', 'down'],
      ['SOP 覆盖率', 88.6, 90, 'percent', 'up'],
      ['演练通过率', 94.3, 95, 'percent', 'up'],
      ['交维缺陷数', 3.2, 4, 'decimal', 'down', '项']
    ],
    alerts: [
      { type: 'warning', title: '交付缺陷提醒', desc: '2 个版本升级交维缺少回退验证报告。' },
      { type: 'success', title: '稳定性表现', desc: '本周期上线 7 日稳定率高于目标，无重大回退。' }
    ],
    detailTitle: '交维任务明细',
    detailColumns: [
      { prop: 'id', label: '交维单号', width: 170 },
      { prop: 'project', label: '项目/系统', width: 170 },
      { prop: 'type', label: '交维类型', width: 120 },
      { prop: 'stage', label: '当前阶段', width: 110, tagType: { 准入评审: 'warning', 联调验证: 'info', 生产观察: 'warning', 已交接: 'success' } },
      { prop: 'owner', label: '牵头团队', width: 105 },
      { prop: 'score', label: '交付评分', width: 95 },
      { prop: 'risk', label: '风险等级', width: 92, tagType: { 高: 'danger', 中: 'warning', 低: 'success' } }
    ],
    details: [
      ['OPS-HO-20260321-021', '政务统一门户 3.2', '版本升级交维', '联调验证', '平台组', '91', '中'],
      ['OPS-HO-20260321-018', '数据交换总线', '扩容交维', '生产观察', '中间件组', '94', '低'],
      ['OPS-HO-20260321-014', '统一认证中心', '架构调整交维', '准入评审', '应用组', '86', '高'],
      ['OPS-HO-20260321-009', '日志服务平台', '新系统交维', '已交接', '平台组', '96', '低'],
      ['OPS-HO-20260321-006', '备份中心升级', '专项保障交维', '联调验证', '数据库组', '89', '中']
    ],
    indicators: [
      ['交维规模', '交维需求数', '周期新建交维单数量', '趋势可控', '周/月', '交维平台'],
      ['准入质量', '准入通过率', '准入通过单 / 评审单', '>= 93%', '周/月', '交维平台'],
      ['文档质量', '文档完整率', '文档齐备交维单 / 总交维单', '>= 95%', '周/月', '交维平台'],
      ['环境质量', '环境一致率', '一致性校验通过任务 / 总任务', '>= 92%', '周/月', 'CMDB'],
      ['运行稳定', '上线 7 日稳定率', '7 日无重大故障交维单 / 已上线交维单', '>= 96%', '周/月', '工单系统']
    ],
    actions: [
      ['平台组', '补齐交维模板中的回退验证章节', '今日 18:00', '高', '进行中'],
      ['应用组', '统一认证中心交维风险项复核', '明日 10:00', '高', '待开始'],
      ['安全组', '新增上线前安全核查清单', '本周四', '中', '待评审'],
      ['数据库组', '完善扩容交维容量基线评估', '本周五', '中', '进行中']
    ],
    timeline: [
      ['09:10', 'primary', '交维需求评审', '统一认证中心交维单进入准入评审。'],
      ['10:22', 'warning', '文档缺失', '发现 2 份交接文档缺少回退步骤。'],
      ['11:15', 'danger', '高风险标记', '架构调整交维存在配置漂移风险。'],
      ['12:05', 'success', '整改完成', '日志平台交维完成并通过生产观察。']
    ]
  },
  'data-delivery': {
    seed: 89,
    title: '数据交维报表',
    subtitle: '关注数据任务稳定性、时效达标、质量告警与补偿恢复能力。',
    owner: '数据交维组',
    defaultPeriod: 'week',
    periodOptions: ['day', 'week', 'month', 'custom'],
    kpis: [
      { label: '数据作业总量', base: 1860, format: 'number', unit: '次', better: 'up', scaleByPeriod: true, delta: 10 },
      { label: '作业成功率', base: 98.2, format: 'percent', better: 'up', scaleByPeriod: false, delta: 2.5 },
      { label: '时效达标率', base: 95.8, format: 'percent', better: 'up', scaleByPeriod: false, delta: 3.2 },
      { label: '质量告警数', base: 27, format: 'number', unit: '条', better: 'down', scaleByPeriod: true, delta: 8 },
      { label: '同步延迟 P95', base: 9.6, format: 'decimal', unit: '分钟', better: 'down', scaleByPeriod: false, delta: 10 },
      { label: '补偿回放成功率', base: 93.5, format: 'percent', better: 'up', scaleByPeriod: false, delta: 5 }
    ],
    trend: { title: '数据作业执行趋势', base: 264, target: 256, volatility: 44 },
    distributionTitle: '数据任务类型占比',
    distribution: [['实时同步', 520], ['离线批处理', 760], ['数据校验', 260], ['回溯补偿', 180], ['指标聚合', 210]],
    executionTitle: '数据域任务状态',
    execution: [
      ['主数据域', 420, 20, 5],
      ['业务数据域', 356, 24, 6],
      ['日志数据域', 318, 18, 5],
      ['监管报送域', 276, 16, 4],
      ['专题分析域', 232, 12, 3]
    ],
    riskTitle: '数据稳定性指标',
    risks: [
      ['数据一致性通过率', 97.8, 98, 'percent', 'up'],
      ['延迟任务占比', 4.7, 5, 'percent', 'down'],
      ['重复数据率', 0.31, 0.5, 'decimal', 'down', '%'],
      ['异常任务自动修复率', 82.2, 80, 'percent', 'up'],
      ['补偿成功率', 93.5, 94, 'percent', 'up']
    ],
    alerts: [
      { type: 'warning', title: '时效风险', desc: '监管报送域 3 个批任务接近时效阈值，需优先保障。' },
      { type: 'info', title: '质量治理', desc: '新增字段完整性校验规则，可进一步降低质量告警。' }
    ],
    detailTitle: '关键数据任务明细',
    detailColumns: [
      { prop: 'id', label: '任务编号', width: 180 },
      { prop: 'domain', label: '数据域', width: 120 },
      { prop: 'taskType', label: '任务类型', width: 120 },
      { prop: 'status', label: '运行状态', width: 105, tagType: { 运行中: 'warning', 异常: 'danger', 已完成: 'success', 已补偿: 'success' } },
      { prop: 'quality', label: '质量检查', width: 105, tagType: { 通过: 'success', 告警: 'warning', 严重: 'danger' } },
      { prop: 'latency', label: '延迟', width: 90 },
      { prop: 'owner', label: '责任组', width: 110 }
    ],
    details: [
      ['DATA-20260321-3107', '业务数据域', '实时同步', '运行中', '通过', '7 分钟', '数据平台组'],
      ['DATA-20260321-3074', '监管报送域', '离线批处理', '异常', '告警', '16 分钟', '报送组'],
      ['DATA-20260321-3039', '主数据域', '数据校验', '已完成', '通过', '3 分钟', '主数据组'],
      ['DATA-20260321-3008', '日志数据域', '回溯补偿', '已补偿', '通过', '9 分钟', '日志组'],
      ['DATA-20260321-2977', '专题分析域', '指标聚合', '运行中', '告警', '12 分钟', '分析组']
    ],
    indicators: [
      ['作业规模', '数据作业总量', '周期调度任务执行次数', '趋势可控', '日/周/月', '调度平台'],
      ['执行稳定', '作业成功率', '成功任务 / 总任务', '>= 98%', '日/周/月', '调度平台'],
      ['时效能力', '时效达标率', '按 SLA 完成任务 / 总任务', '>= 95%', '日/周/月', '调度平台'],
      ['质量治理', '质量告警数', '质量校验触发告警次数', '持续下降', '日/周', '数据质量平台'],
      ['恢复能力', '补偿回放成功率', '补偿成功任务 / 补偿任务总数', '>= 94%', '周/月', '调度平台']
    ],
    actions: [
      ['数据平台组', '优先处理监管报送域异常批任务', '今日 17:00', '高', '进行中'],
      ['主数据组', '新增跨域一致性对账规则', '明日 11:00', '中', '待开始'],
      ['日志组', '优化回溯补偿并行度策略', '本周四', '中', '进行中'],
      ['分析组', '清理低价值聚合任务以降低延迟', '本周五', '中', '待评审']
    ],
    timeline: [
      ['01:05', 'primary', '批处理窗口启动', '离线批处理作业按计划开始执行。'],
      ['02:18', 'warning', '质量告警', '监管报送域字段完整性告警触发。'],
      ['02:43', 'danger', '任务异常', '报送批任务失败并自动触发补偿回放。'],
      ['03:12', 'success', '补偿成功', '异常任务恢复完成，延迟回落至基线。']
    ]
  }
}

export function getOpsReportData(type, query = {}) {
  const def = REPORT_MAP[type] || REPORT_MAP['daily-weekly']
  const options = def.periodOptions || ['day', 'week', 'month', 'custom']
  const period = options.includes(query.period) ? query.period : def.defaultPeriod
  const periodCtx = buildPeriodContext(period, query.range)
  const rnd = prng(def.seed + periodCtx.seed)

  return Promise.resolve({
    reportType: type,
    title: def.title,
    subtitle: def.subtitle,
    owner: def.owner,
    period,
    periodLabel: PERIOD_LABELS[period] || period,
    periodOptions: options.map((v) => ({ value: v, label: PERIOD_LABELS[v] })),
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
    alerts: def.alerts,
    kpis: buildKpis(def.kpis, periodCtx.factor, rnd),
    trendTitle: def.trend.title,
    trend: buildTrend(def.trend, periodCtx.labels, periodCtx.factor, rnd),
    distributionTitle: def.distributionTitle,
    distribution: def.distribution.map(([name, base]) => ({ name, value: scaled(base, periodCtx.factor, rnd, 0.55) })),
    executionTitle: def.executionTitle,
    execution: def.execution.map(([name, done, inProgress, delayed]) => ({
      name,
      done: scaled(done, periodCtx.factor, rnd, 0.6),
      inProgress: scaled(inProgress, periodCtx.factor, rnd, 0.62),
      delayed: scaled(delayed, periodCtx.factor, rnd, 0.58)
    })),
    riskTitle: def.riskTitle,
    risks: buildRisks(def.risks, rnd),
    detailTitle: def.detailTitle,
    detailColumns: def.detailColumns,
    details: convertDetails(def.details, def.detailColumns),
    indicatorCatalog: convertIndicators(def.indicators),
    actions: convertActions(def.actions),
    timeline: convertTimeline(def.timeline)
  })
}

function buildPeriodContext(period, range) {
  if (period === 'day') {
    return { factor: 0.22, labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`), seed: 11 }
  }
  if (period === 'month') {
    const end = dayjs().startOf('day')
    return {
      factor: 4.2,
      labels: Array.from({ length: 30 }, (_, i) => end.subtract(29 - i, 'day').format('MM-DD')),
      seed: 29
    }
  }
  if (period === 'custom') {
    const { start, end } = normalizeRange(range)
    const days = end.diff(start, 'day') + 1
    return {
      factor: clamp(days / 7, 0.35, 4.8),
      labels: Array.from({ length: days }, (_, i) => start.add(i, 'day').format('MM-DD')),
      seed: days * 13
    }
  }
  const end = dayjs().startOf('day')
  return {
    factor: 1,
    labels: Array.from({ length: 7 }, (_, i) => end.subtract(6 - i, 'day').format('MM-DD')),
    seed: 17
  }
}

function normalizeRange(range) {
  const end = dayjs().startOf('day')
  const start = end.subtract(13, 'day')
  if (!Array.isArray(range) || range.length !== 2) return { start, end }
  const l = dayjs(range[0]).startOf('day')
  const r = dayjs(range[1]).startOf('day')
  if (!l.isValid() || !r.isValid()) return { start, end }
  const left = l.isBefore(r) ? l : r
  const right = l.isBefore(r) ? r : l
  const days = right.diff(left, 'day') + 1
  if (days < 1) return { start, end }
  if (days > 60) return { start: right.subtract(59, 'day'), end: right }
  return { start: left, end: right }
}

function buildKpis(config, factor, rnd) {
  return config.map((item) => {
    const base = (item.scaleByPeriod ?? true) ? item.base * factor : item.base
    const jitter = 0.94 + rnd() * 0.12
    let value = base * jitter
    if (item.format === 'number') value = Math.round(Math.max(0, value))
    if (item.format === 'percent') value = Number(clamp(value, 0, 100).toFixed(2))
    if (item.format === 'decimal') value = Number(Math.max(0, value).toFixed(2))
    const delta = Number((((rnd() - 0.5) * (item.delta || 6))).toFixed(1))
    const good = item.better === 'down' ? delta <= 0 : delta >= 0
    const tone = Math.abs(delta) <= 0.3 ? 'flat' : (good ? 'good' : 'risk')
    return {
      label: item.label,
      value,
      valueText: formatValue(value, item.format, item.unit),
      trendText: `${delta > 0 ? '+' : ''}${delta}% 较上期`,
      trendTone: tone,
      badge: tone === 'good' ? '状态良好' : tone === 'flat' ? '波动可控' : '重点关注'
    }
  })
}

function buildTrend(conf, labels, factor, rnd) {
  const targetBase = Math.max(1, conf.target * Math.max(0.8, factor))
  let current = Math.max(1, conf.base * Math.max(0.82, factor) * (0.92 + rnd() * 0.1))
  return labels.map((name) => {
    current = Math.max(1, current + (rnd() - 0.5) * conf.volatility)
    return {
      name,
      value: Math.round(current),
      target: Math.round(targetBase * (0.96 + rnd() * 0.06))
    }
  })
}

function buildRisks(config, rnd) {
  return config.map(([name, base, target, format, better, unit]) => {
    const value = base * (0.95 + rnd() * 0.1)
    const scoreRaw = better === 'down' ? (target / Math.max(value, 0.0001)) * 100 : (value / target) * 100
    const score = Math.round(clamp(scoreRaw, 0, 120))
    return {
      name,
      valueText: formatValue(value, format, unit),
      targetText: formatValue(target, format, unit),
      score,
      status: score >= 100 ? 'good' : (score >= 90 ? 'warn' : 'risk')
    }
  })
}

function convertDetails(rows, columns) {
  return rows.map((row) => {
    const record = {}
    columns.forEach((column, idx) => {
      record[column.prop] = row[idx]
    })
    return record
  })
}

function convertIndicators(rows) {
  return rows.map(([dimension, metric, formula, target, frequency, source]) => ({
    dimension,
    metric,
    formula,
    target,
    frequency,
    source
  }))
}

function convertActions(rows) {
  return rows.map(([owner, action, due, priority, status]) => ({
    owner,
    action,
    due,
    priority,
    status
  }))
}

function convertTimeline(rows) {
  return rows.map(([time, type, title, content]) => ({
    time,
    type,
    title,
    content
  }))
}

function scaled(base, factor, rnd, minScale = 0.6) {
  return Math.max(1, Math.round(base * Math.max(minScale, factor) * (0.9 + rnd() * 0.22)))
}

function formatValue(value, format, unit = '') {
  if (format === 'percent') return `${Number(value).toFixed(2)}%`
  if (format === 'decimal') {
    const n = Number(value).toFixed(2)
    return unit ? `${n} ${unit}` : n
  }
  if (format === 'number') {
    const n = Number(value).toLocaleString('zh-CN')
    return unit ? `${n} ${unit}` : n
  }
  return String(value)
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function prng(seed) {
  let s = Math.floor(seed) % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 48271) % 2147483647
    return (s - 1) / 2147483646
  }
}

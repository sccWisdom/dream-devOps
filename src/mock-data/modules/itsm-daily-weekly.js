import dayjs from "dayjs";

const PERIOD_CONFIG = {
  day: { label: "日报", factor: 0.74, seed: 17 },
  week: { label: "周报", factor: 1, seed: 53 },
};

const SERVICE_CONFIG = {
  incident: {
    label: "事件管理",
    subtitle: "聚焦事件处置时效、业务影响范围与根因治理闭环。",
    trendName: "事件单量",
    kpis: [
      { key: "total", label: "今日事件总量", base: 342, unit: "单", better: "down", desc: "当日创建事件总量" },
      { key: "closed", label: "今日已闭环事件", base: 316, unit: "单", better: "up", desc: "当日已完成并闭环的事件" },
      { key: "pending", label: "事件挂起数", base: 17, unit: "单", better: "down", desc: "待业务确认或待外部处理" },
      { key: "backlog", label: "积压事件数", base: 29, unit: "单", better: "down", desc: "超过标准处理周期仍未关闭" },
      { key: "timeout", label: "超时事件数", base: 11, unit: "单", better: "down", desc: "未在 SLA 时限内关闭" },
      { key: "sla", label: "事件 SLA 达标率", base: 96.7, unit: "%", digits: 1, better: "up", desc: "响应与恢复均满足 SLA" },
      { key: "firstResponse", label: "30分钟首响达成率", base: 94.8, unit: "%", digits: 1, better: "up", desc: "高优先级事件首响达成情况" },
    ],
    trendBase: [280, 298, 315, 304, 336, 328, 342],
    topSystems: [
      ["数据开发子系统", 86],
      ["数据归集子系统", 73],
      ["目录链子系统", 58],
      ["数据支撑子系统", 51],
      ["数据质量子系统", 47],
    ],
    analysisA: {
      title: "事件单根因排序",
      type: "bar",
      items: [
        ["前置机账号密码错误", 114],
        ["目标表字段缺失", 83],
        ["下发程序生成异常", 62],
        ["依赖任务下线", 41],
        ["归集任务下线", 36],
      ],
    },
    analysisB: {
      title: "事件单涉及委办前置机TOP5委办",
      type: "bar",
      items: [
        ["市公安局", 36],
        ["市人社局", 31],
        ["市市场监管局", 28],
        ["市民政局", 24],
        ["市交通运输局", 21],
      ],
    },
    health: [
      ["平均恢复时长", 39, 45, "分钟", "down"],
      ["重复事件占比", 7.2, 8.5, "%", "down"],
      ["自动化处置率", 64.5, 60, "%", "up"],
    ],
  },
  problem: {
    label: "问题管理",
    subtitle: "关注问题复盘、根因消除与长期稳定性提升。",
    trendName: "问题单量",
    kpis: [
      { key: "total", label: "今日问题总量", base: 76, unit: "单", better: "down", desc: "当日登记问题总量" },
      { key: "resolved", label: "已解决问题", base: 61, unit: "单", better: "up", desc: "完成根因定位并治理" },
      { key: "pending", label: "问题挂起数", base: 9, unit: "单", better: "down", desc: "等待外部资源或业务确认" },
      { key: "backlog", label: "积压问题数", base: 14, unit: "单", better: "down", desc: "超过预期周期未关闭" },
      { key: "eliminate", label: "根因消除率", base: 83.5, unit: "%", digits: 1, better: "up", desc: "结构化修复占比" },
      { key: "reopen", label: "问题复发率", base: 6.4, unit: "%", digits: 1, better: "down", desc: "观察期内再次复发占比" },
    ],
    trendBase: [58, 62, 69, 63, 71, 74, 76],
    topSystems: [["数据开发子系统", 19], ["数据归集子系统", 16], ["数据支撑子系统", 14], ["前置机子系统", 13], ["数据质量子系统", 11]],
    analysisA: {
      title: "问题根因类型分布",
      type: "pie",
      items: [["代码缺陷", 29], ["设计缺陷", 21], ["配置偏差", 18], ["数据模型问题", 14], ["前置机问题", 11]],
    },
    analysisB: {
      title: "问题状态分布",
      type: "bar",
      items: [["待分析", 12], ["处理中", 23], ["待验证", 18], ["已关闭", 61]],
    },
    health: [["平均根因定位时长", 13.6, 15, "小时", "down"], ["问题文档复用率", 72.8, 70, "%", "up"], ["跨团队协同准时率", 91.2, 92, "%", "up"]],
  },
  change: {
    label: "变更管理",
    subtitle: "覆盖变更执行成功率、风险控制与回退治理能力。",
    trendName: "变更单量",
    kpis: [
      { key: "total", label: "今日变更总量", base: 124, unit: "单", better: "down", desc: "当日计划与临时变更总量" },
      { key: "executed", label: "已执行变更", base: 118, unit: "单", better: "up", desc: "按窗口执行并完成记录" },
      { key: "success", label: "变更成功数", base: 111, unit: "单", better: "up", desc: "执行后功能与稳定性达标" },
      { key: "rollback", label: "变更回退数", base: 5, unit: "单", better: "down", desc: "因风险触发回退" },
      { key: "emergency", label: "紧急变更数", base: 8, unit: "单", better: "down", desc: "非计划窗口执行" },
      { key: "compliance", label: "变更合规率", base: 95.6, unit: "%", digits: 1, better: "up", desc: "审批、评估、验证流程完整" },
    ],
    trendBase: [95, 104, 112, 108, 121, 119, 124],
    topSystems: [["政务云管理平台", 25], ["统一消息平台", 22], ["电子印章系统", 20], ["财税协同平台", 18], ["电子档案平台", 16]],
    analysisA: { title: "变更类型分布", type: "pie", items: [["标准变更", 63], ["普通变更", 39], ["紧急变更", 8], ["重大变更", 14]] },
    analysisB: { title: "变更风险等级分布", type: "bar", items: [["低风险", 57], ["中风险", 44], ["高风险", 19], ["极高风险", 4]] },
    health: [["窗口准点率", 93.4, 95, "%", "up"], ["变更验证完成率", 97.1, 96, "%", "up"], ["变更后故障关联率", 4.8, 5.5, "%", "down"]],
  },
  release: {
    label: "发布管理",
    subtitle: "追踪发布质量、环境分布与灰度策略执行效果。",
    trendName: "发布单量",
    kpis: [
      { key: "total", label: "今日发布总量", base: 93, unit: "单", better: "down", desc: "应用与平台发布任务总量" },
      { key: "success", label: "成功发布数", base: 87, unit: "单", better: "up", desc: "流程完成且验证通过" },
      { key: "failed", label: "发布失败数", base: 4, unit: "单", better: "down", desc: "发布中断或回滚失败" },
      { key: "emergency", label: "紧急发布数", base: 6, unit: "单", better: "down", desc: "非计划窗口发布" },
      { key: "canary", label: "灰度发布数", base: 21, unit: "单", better: "up", desc: "采用灰度分批放量" },
      { key: "dora", label: "变更失败率", base: 4.3, unit: "%", digits: 1, better: "down", desc: "发布后触发故障或回滚占比" },
    ],
    trendBase: [72, 78, 83, 81, 88, 90, 93],
    topSystems: [["集成门户（移动端）", 16], ["数据中台DMC", 14], ["数据资产子系统", 13], ["数据开放子系统", 12], ["数据共享子系统", 10]],
    analysisA: { title: "发布环境分布", type: "pie", items: [["生产环境", 47], ["测试环境", 31], ["UAT环境", 15]] },
    analysisB: { title: "发布时间窗口分布", type: "bar", items: [["工作时段", 39], ["夜间窗口", 44], ["周末窗口", 10]] },
    health: [["自动回滚成功率", 95.2, 95, "%", "up"], ["发布验证通过率", 96.4, 96, "%", "up"], ["平均发布时间", 18.7, 20, "分钟", "down"]],
  },
};

export function getItsmDailyWeeklyData({ serviceType = "incident", period = "day" } = {}) {
  const service = SERVICE_CONFIG[serviceType] || SERVICE_CONFIG.incident;
  const periodConfig = PERIOD_CONFIG[period] || PERIOD_CONFIG.day;
  const rand = prng(Date.now() + periodConfig.seed + service.kpis.length * 11);
  const labels = createTrendLabels();

  const kpis = service.kpis.map((metric) => {
    const shouldScale = metric.unit !== "%";
    const base = shouldScale ? metric.base * periodConfig.factor : metric.base;
    const value = normalizeValue(base, metric, rand);
    const delta = Number(((rand() - 0.5) * 8).toFixed(1));
    const tone = evaluateTone(delta, metric.better);
    return {
      ...metric,
      value,
      valueText: formatMetricValue(value, metric),
      delta,
      deltaText: `${delta > 0 ? "+" : ""}${delta}%`,
      tone,
    };
  });

  return Promise.resolve({
    serviceType,
    serviceLabel: service.label,
    subtitle: service.subtitle,
    period,
    periodLabel: periodConfig.label,
    updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    kpis,
    trend: {
      title: "7日工单趋势",
      seriesName: service.trendName,
      items: service.trendBase.map((value, idx) => ({
        label: labels[idx],
        value: Math.max(1, Math.round(value * (periodConfig.factor * (0.92 + rand() * 0.16)))),
      })),
    },
    topSystems: {
      title: "事件单涉及业务系统TOP5",
      items: normalizeItems(service.topSystems, periodConfig.factor, rand),
    },
    analysisA: {
      title: service.analysisA.title,
      type: service.analysisA.type,
      items: normalizeItems(service.analysisA.items, periodConfig.factor, rand),
    },
    analysisB: {
      title: service.analysisB.title,
      type: service.analysisB.type,
      items: normalizeItems(service.analysisB.items, periodConfig.factor, rand),
    },
    health: service.health.map(([name, value, target, unit, better]) => {
      const current = normalizeHealthValue(value, unit, rand);
      const score = healthScore(current, target, better || "up");
      return {
        name,
        value: current,
        target,
        unit,
        valueText: formatHealthValue(current, unit),
        targetText: formatHealthValue(target, unit),
        score,
        status: score >= 100 ? "good" : score >= 90 ? "warn" : "risk",
      };
    }),
  });
}

function createTrendLabels() {
  return Array.from({ length: 7 }, (_, i) => dayjs().subtract(6 - i, "day").format("MM-DD"));
}

function normalizeValue(base, metric, rand) {
  const wave = 0.93 + rand() * 0.14;
  const raw = base * wave;
  if (metric.unit === "%") return Number(clamp(raw, 0, 100).toFixed(metric.digits ?? 1));
  return Math.max(0, Math.round(raw));
}

function normalizeItems(items, factor, rand) {
  return items
    .map(([name, value]) => ({ name, value: Math.max(1, Math.round(value * (0.84 + factor / 8.2) * (0.9 + rand() * 0.2))) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function normalizeHealthValue(value, unit, rand) {
  const wave = 0.96 + rand() * 0.08;
  if (unit === "%") return Number(clamp(value * wave, 0, 100).toFixed(1));
  return Number((value * wave).toFixed(1));
}

function evaluateTone(delta, better) {
  if (Math.abs(delta) <= 0.3) return "flat";
  const good = better === "down" ? delta <= 0 : delta >= 0;
  return good ? "good" : "risk";
}

function formatMetricValue(value, metric) {
  if (metric.unit === "%") return `${Number(value).toFixed(metric.digits ?? 1)}%`;
  return `${Number(value).toLocaleString("zh-CN")} ${metric.unit}`;
}

function healthScore(value, target, better) {
  if (better === "down") return Math.round(clamp((target / Math.max(value, 0.0001)) * 100, 0, 130));
  return Math.round(clamp((value / Math.max(target, 0.0001)) * 100, 0, 130));
}

function formatHealthValue(value, unit) {
  if (unit === "%") return `${Number(value).toFixed(1)}%`;
  return `${Number(value).toFixed(1)} ${unit}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function prng(seed) {
  let s = Math.floor(seed) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

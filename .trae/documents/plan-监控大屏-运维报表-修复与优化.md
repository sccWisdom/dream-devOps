# 计划：修复并优化【监控大屏】与【运维报表】页面

## Summary
本次目标是解决两个菜单页面“图表不显示、样式不专业、监控大屏【返回】按钮无效”的问题，并在不引入真实后端的前提下（继续使用 Mock 数据）增强两个页面的可演示性与信息密度，使其更贴合 PRD/README 描述的原型定位。

## Current State Analysis
### 1) 路由与页面位置（已确认）
- 路由定义：[/src/router/index.js](file:///f:/vscode-workplace/dream-devOps/src/router/index.js#L24-L104)
  - 监控大屏：`/screen/monitor` 使用 [ScreenLayout.vue](file:///f:/vscode-workplace/dream-devOps/src/layouts/ScreenLayout.vue) + [MonitorScreen.vue](file:///f:/vscode-workplace/dream-devOps/src/views/workbench/MonitorScreen.vue)
  - 运维报表：`/workbench/reports` 使用 [BasicLayout.vue](file:///f:/vscode-workplace/dream-devOps/src/layouts/BasicLayout.vue) + [Reports.vue](file:///f:/vscode-workplace/dream-devOps/src/views/workbench/Reports.vue)

### 2) “功能不生效”的根因（高置信）
- 图表不显示：核心图表容器组件 [BaseChart.vue](file:///f:/vscode-workplace/dream-devOps/src/components/Chart/BaseChart.vue) 在运行时通过 `require()` 引入主题模块：
  - `require('@/utils/echarts-theme.js')`（Vite + ESM 环境下运行时通常不存在 `require`），高概率导致浏览器报错从而图表渲染中断。
- 【返回】按钮不反应：大屏布局 [ScreenLayout.vue](file:///f:/vscode-workplace/dream-devOps/src/layouts/ScreenLayout.vue#L1-L10) 在模板中直接使用 `$router.push('/')`，在当前项目的 Vue3 + `<script setup>` 场景下可能无法按预期拿到路由实例（需改为 `useRouter()` 显式调用以消除不确定性）。
- 样式不专业：两页面目前结构偏“Demo 简版”，缺少顶部筛选区、信息分组、统一 KPI 栅格、图表卡片层级与大屏视觉规范（玻璃拟态/暗色对比/模块边界等）。

### 3) PRD/README 的目标对齐点（本次范围）
- PRD 服务门户/工作台为演示原型；监控大屏强调监控数据可视化与处置进度；报表强调可配置统计指标（原型阶段用 Mock 数据演示即可）。
- README 明确：不做真实后端、Mock 驱动 UI、强调流程与交互、优先可视化效果。

## Intent / Success Criteria（来自你的反馈）
- 必须修复：监控大屏与运维报表的图表渲染（进入页面即可稳定显示，无控制台报错）。
- 必须修复：监控大屏的【返回】按钮可用（返回首页/工作台）。
- 视觉目标：页面更像“真实可演示原型”，布局有层级、信息密度更高且风格统一。
- 范围约束：监控大屏只做现有单页（不拆路由、不加第二页/Tab）。
- 运维报表偏好：增强图表丰富度（比当前多图表类型/更多维度展示），不强调导出。

## Proposed Changes
### A. 修复 ECharts 渲染通道（核心）
**文件**：[/src/components/Chart/BaseChart.vue](file:///f:/vscode-workplace/dream-devOps/src/components/Chart/BaseChart.vue)
- 将 `requireTheme()`/`require()` 替换为 ESM `import { currentTheme } from '@/utils/echarts-theme'`。
- 初始化逻辑调整：
  - `echarts.init(el, currentTheme())` → `setOption` → `resize()`（避免首次渲染容器尺寸尚未稳定导致空白）。
  - 增加 `ResizeObserver` 监听容器尺寸变化，替代仅监听 `window.resize`，避免 Element Plus 卡片/栅格变化时图表不重排。
  - 保留 `MutationObserver` 监听 `html.dark` 切换并重建图表实例，但移除 `require` 依赖。
- 结果：监控大屏与运维报表所有图表稳定渲染，且随布局/主题切换自适应。

**文件**：[/src/components/Chart/LineChart.vue](file:///f:/vscode-workplace/dream-devOps/src/components/Chart/LineChart.vue)
- 去除写死的 `title.textStyle.color`，尽量交给主题（`ops-light/ops-dark`）接管，或基于 `documentElement.classList.contains('dark')` 动态设置标题/坐标轴颜色，确保在大屏暗色背景可读。
- 适当优化 `grid` 留白与 tooltip，使其更适合大屏/报表两类场景（可通过 props 控制，保持兼容）。

### B. 修复【监控大屏】返回逻辑 + 视觉与信息密度增强
**文件**：[/src/layouts/ScreenLayout.vue](file:///f:/vscode-workplace/dream-devOps/src/layouts/ScreenLayout.vue)
- 使用 `useRouter()` 提供 `goBack()`，按钮点击执行 `router.push('/')`（或 `router.back()` 作为备选）。
- 样式优化：头部增加当前时间/状态点、按钮样式更贴近大屏（弱边框 + 主色高亮），主体区域改为多列网格承载卡片。

**文件**：[/src/views/workbench/MonitorScreen.vue](file:///f:/vscode-workplace/dream-devOps/src/views/workbench/MonitorScreen.vue)
- 保持单页，但增强模块：
  - 顶部 KPI：保留现有 4 张卡片，补充“请求成功率/告警数/处置中”等（仍用 Mock）。
  - 中部图表区：至少 2–3 张图表卡（折线趋势 + 柱状/堆叠 + 饼图/仪表盘之一），全部基于 `BaseChart` 直接传 `options`，避免新增组件文件。
  - 底部信息区：增加“最新告警/工单处置队列（TopN）”列表或表格（Element Plus table/list），体现处置进度演示。
- 引入轻量“自动刷新”机制（默认关闭或较长间隔）：定时重新拉取 Mock（`getMonitorSeries/getTodayOverview` + 新增 Mock）并更新图表，体现“实时看板”。
- 大屏风格：暗色玻璃拟态卡片、边框发光、模块标题与分割线统一、响应式（≥1200 四列，<1200 三列，移动端两列）。

### C. 优化【运维报表】样式与图表丰富度
**文件**：[/src/views/workbench/Reports.vue](file:///f:/vscode-workplace/dream-devOps/src/views/workbench/Reports.vue)
- 页面结构升级：
  - 顶部筛选条（Element Plus）：报表维度切换（日报/周报/自定义）、日期范围选择、刷新按钮。
  - KPI 概览卡（4–6 个）：总工单、已解决、超时、平均响应、Top 系统等（Mock）。
  - 图表区：从当前 2 张增加到至少 4 张（折线趋势、堆叠柱状（按类型/状态）、饼图（占比）、TopN 条形图（系统/服务））。
  - 明细区：增加一个表格（Top 工单/告警列表）与简单筛选，体现“可演示报表闭环”。
- 图表全部复用 `BaseChart`，减少组件新增；保留现有 `LineChart` 兼容。

### D. Mock 数据扩展（支撑新增图表/列表）
**文件**：[/src/mock-data/modules/workbench.js](file:///f:/vscode-workplace/dream-devOps/src/mock-data/modules/workbench.js)
- 扩展 `getMonitorSeries()`：支持多指标（成功率、告警数、SLA 风险）或新增 `getMonitorDashboard()` 返回聚合结构。
- 扩展 `getReportData()`：返回更多维度（按类型、按状态、按优先级、TopN 系统/服务），用于报表多图表展示。
- 保持原则：仅 Mock、数据结构可读、能稳定复现（必要时引入简单 deterministic 生成逻辑）。

## Assumptions & Decisions
- 继续遵循 README：不接真实后端，所有数据用 Mock 驱动，重点展示“可视化效果 + 交互流程”。
- 监控大屏不拆分成两个路由/Tab，仅在单页内通过模块分区表现 PRD 的“大屏能力”。
- 报表以“更丰富可视化”为主，不实现真实导出；如需要导出仅做按钮/提示（后续可扩展）。

## Verification
- 手动验收（开发环境）：
  - 进入 `/screen/monitor` 与 `/workbench/reports`，图表稳定显示；切换浅色/深色时图表颜色正常。
  - 监控大屏【返回】按钮可用，能回到首页/工作台。
  - 调整窗口尺寸（桌面/窄屏），布局与图表自适应，无溢出与横向滚动条。
- 构建校验：
  - `npm run build` 通过。
  - 浏览器控制台无 `require is not defined`、ECharts init/resize 相关报错。


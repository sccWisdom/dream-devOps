# 🚀 智能运维平台（Intelligent O&M Platform）

## 📌 项目目标
智能运维平台是一套面向政务信息化场景的综合运维管理系统，融合 ITSM、监控告警、CMDB、自动化运维等能力，旨在实现运维工作的标准化、自动化与智能化。平台覆盖事件、问题、变更、发布全流程管理，并结合监控、日志与自动化处置能力，实现运维闭环。
本项目基于 PRD 文档，快速生成一个“可演示的智能运维平台原型系统”，
重点实现：

- 页面结构完整
- 功能模块齐全
- 使用模拟数据驱动
- 支持演示与方案验证

---

## 🧠 原型设计原则

- 不做真实后端
- 使用 Mock 数据驱动 UI
- 不做复杂业务逻辑
- 重点展示流程 & 交互
- 不追求技术复杂度
- 优先可视化效果

---

## 🏗️ 功能模块（来源 PRD）

### 1. 运维工作台
- 服务门户：服务目录展示、统一提单入口、自助服务专区（集成AI问答）
- 工作中心：个人/全部工单管理、今日概览、变更/值班日历
- 监控大屏：业务链路监控、事件处置进度实时看板
- 运维报表：日报/周报、监控统计、系统巡检等自定义报表

### 2. ITSM 流程（工单管理体系）
- 事件管理：智能告警分拣、自动派单、全生命周期处置（接单/转派/挂起/升级）、知识库联动
- 问题管理：根因分析、已知错误库、事件/问题双向联动
- 变更管理：分级审批流程、实施跟踪、回滚机制、全流程审计
- 发布管理：多类型发布策略（灰度/全量）、验证与回滚闭环

### 3. 运维支撑能力
- 值班管理
- 优先级管理、SLA 管理
- 运维知识库（2.8）：
  - 基础配置：分类/标签管理、知识模板配置
  - 全生命周期：草稿→提交→审批→发布/下线，保留审批记录
  - 版本管理：新版本、历史查看、对比、回滚生成新草稿
  - 互动与热度：点赞/点踩、热门知识榜
  - 权限管控：公开/内部/敏感分级；按部门/角色/用户配置查看/编辑；敏感知识支持加密访问（口令校验后解锁）
  - 工单联动：事件详情展示知识推荐，可跳转查看；支持“转知识库”一键带入标题与内容新建
  - 批量导入：支持导入 JSON 数组（模拟）

### 4. 基础能力
- 用户/角色权限
- CMDB 配置管理
- 工单流程、值班请假审批流程、知识发布审批流程的配置能力

### 5. 可观测能力
- 资源监控
- 监控告警
- 日志管理

### 6. 自动化运维
- 自动化脚本执行
- 告警自动处置

---

## 技术说明
- 数据来源：所有展示数据均为模拟生成，符合PRD定义的业务逻辑
- 原型范围：覆盖PRD中98个二级功能点的核心流程演示

## 技术栈
- **前端框架**：`Vue 3` + `Vite`
- **UI组件库**：`Element Plus` 或 `Ant Design` - 提供丰富的后台管理组件。
- **状态管理**：`Pinia` (Vue) - 管理模拟的全局状态（如工单列表、用户信息）。
- **路由**：`Vue Router` 
- **数据模拟**：
    - 硬编码JSON文件（`/mock-data/`目录）存放所有模拟数据。
    - 使用`Mock.js`生成随机但合理的数据（如日志、监控指标）。
- **图表可视化**：`ECharts` 或 `AntV` - 用于绘制监控大屏、报表图表。

## 🖥️ 页面结构设计（建议）


```bash
dream-devOps/	
├── public/                   # 静态资源（不打包，直接复制）
│   └── favicon.ico
├── src/                      # 核心源码目录
│   ├── main.js               # 项目入口文件
│   ├── App.vue               # 根组件
│   
│   ├── assets/               # 静态资源（会被Vite打包）
│   │   ├── images/           # 图片（logo、大屏背景、图标）
│   │   ├── icons/            # SVG图标
│   │   └── styles/           # 全局样式
│   │       ├── mixins.scss   # SCSS混入
│   │       ├── global.scss   # 全局通用样式
│   │       └── variables.scss# SCSS变量（主题色、尺寸）
│
│   ├── layouts/              # 全局布局组件（运维平台核心骨架）
│   │   ├── BasicLayout.vue   # 主布局（侧边栏+顶部导航+内容区）
│   │   ├── ScreenLayout.vue  # 监控大屏专用布局（全屏、无边栏）
│   │   └── components/       # 布局子组件
│   │       ├── Sidebar.vue   # 左侧菜单
│   │       ├── Header.vue    # 顶部导航（用户、通知、全屏）
│   │       └── Footer.vue    # 页脚
│
│   ├── router/               # 路由管理
│   │   ├── index.js          # 路由入口
│   │   └── ...        
│
│   ├── store/                # Pinia状态管理（模块化）
│   │   ├── index.js          # Pinia入口
│   │   ├── modules/          # 状态模块
│   │   │   ├── user.js       # 用户状态
│   │   │   ├── ticket.js     # 工单状态
│   │   │   ├── alert.js      # 告警状态
│   │   │   ├── resource.js   # 资源状态
│   │   │   ├── app.js        # 应用状态
│   │   │   └── ...
│   │   └── persist.js        # 状态持久化
│
│   ├── api/                  # 接口请求管理（统一封装）
│   │   ├── request.js        # Axios封装（请求拦截、响应处理）
│   │   ├── modules/          # 按业务模块拆分接口
│   │   │   ├── workbench.js
│   │   │   ├── event.js
│   │   │   └── ...
│   │   └── mock.js           # Mock接口注册
│
│   ├── mock-data/            # 模拟数据核心目录（你指定的目录）
│   │   ├── index.js          # Mock入口（注册所有模拟接口）
│   │   ├── utils.js          # Mock工具函数（生成随机数据）
│   │   └── modules/          # 按业务模块拆分Mock数据
│   │       ├── workbench.js  # 工作台/大屏Mock
│   │       ├── alarm.js      # 告警数据Mock
│   │       ├── ticket.js     # 工单数据Mock
│   │       └── ...
│
│   ├── views/                # 业务页面（1:1匹配PRD功能模块）
│   │   ├── Login/            # 登录页面
│   │   ├── workbench/               # 工作台模块（服务门户、工作中心、监控大屏、报表）
│   │   │   ├── ServicePortal.vue    # 服务门户（用于进行全类型服务工单（报障、问题、变更、请求）的提单操作）
│   │   │   ├── WorkCenter.vue       # 工作中心
│   │   │   ├── MonitorScreen.vue    # 监控大屏
│   │   │   └── Reports.vue          # 运维报表
│   │   ├── ticket/               # 工单模块管理
│   │   │   ├── eventManagement/     # 事件管理
│   │   │   ├── problemManagement/   # 问题管理
│   │   │   ├── changeManagement/     # 变更管理
│   │   │   ├── releaseManagement/   # 发布管理
│   │   │   └── slaManagement/          # SLA管理（包含优先级管理）
│   │   ├── dutyManagement/   # 值班管理
│   │   ├── knowledgeBase/    # 运维知识库
│   │   ├── systemPermission/ # 系统管理管理
│   │   │   ├── user/                # 用户管理
│   │   │   ├── role/                # 角色管理
│   │   │   ├── permission/          # 权限管理
│   │   │   └── setting/             # 系统设置
│   │   ├── resource/         # 资源管理模块（CMDB）
│   │   ├── monitorAlarm/     # 监控告警
│   │   ├── logManagement/    # 日志管理
│   │   ├── autoOps/          # 自动化运维处置
│   │   └── ...
│
│   ├── components/           # 全局通用组件
│   │   ├── Chart/            # 图表组件（ECharts/AntV封装）
│   │   │   ├── LineChart.vue # 折线图（报表、监控趋势）
│   │   │   ├── BarChart.vue  # 柱状图
│   │   │   ├── PieChart.vue  # 饼图
│   │   │   └── ScreenCard.vue# 大屏数字卡片
│   │   ├── Table/            # 通用表格（工单、资源列表）
│   │   ├── Dialog/           # 通用弹窗
│   │   ├── SlaTimer.vue      # SLA倒计时组件
│   │   ├── AlarmNotice.vue   # 告警通知组件
│   │   └── ...
│
│   ├── hooks/                # 自定义Vue Hooks（逻辑复用--可选）
│   │   ├── useTable.js       # 表格分页/筛选/查询
│   │   ├── useChart.js       # 图表渲染/更新
│   │   ├── useMock.js        # Mock数据调用
│   │   ├── usePermission.js  # 权限控制
│   │   └── ...
│
│   ├── utils/                # 工具函数
│   │   ├── request.js        # HTTP客户端封装（原型阶段可封装Mock请求）
│   │   ├── format.js         # 数据格式化（时间、数字）
│   │   ├── auth.js           # 权限/Token处理
│   │   ├── validate.js       # 表单校验
│   │   └── ...
│
│   └── constants/            # 常量配置
│       ├── status.js         # 工单/告警状态枚举
│       ├── priority.js       # 优先级枚举
│       ├── menu.js           # 侧边菜单配置
│       └── ...
│
├── .eslintrc.js                     # ESLint配置
├── .prettierrc                      # Prettier配置
├── index.html                       # HTML入口
├── package.json                     # 项目依赖配置
├── vite.config.js                   # Vite构建配置
├── README.md                        # 项目说明文档
└── PRD.md                           # 产品需求文档
```

## 📄 参考文档

- 本原型的详细需求依据：`PRD.md` (位于代码仓库根目录)

## 启动命令
- 启动项目：
```bash
npm run dev
```

## 运维知识库（2.8）使用说明
- 数据存储：原型阶段使用浏览器 localStorage 持久化（不同浏览器/不同设备互不影响）
- 批量导入文件格式：JSON 顶层为数组，每个元素支持以下字段

```json
[
  {
    "title": "示例知识",
    "content": "内容（支持多行）",
    "categoryId": "CAT-005",
    "tagIds": ["TAG-001", "TAG-006"],
    "acl": {
      "visibility": "internal",
      "encrypt": false,
      "read": { "depts": ["运维中心"], "roles": ["运维工程师"], "users": [] },
      "edit": { "depts": [], "roles": ["管理员"], "users": ["admin"] }
    }
  }
]
```

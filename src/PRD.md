# 专家发现智能平台 - 产品需求文档 (PRD)

> **文档版本**: v2.1.0  
> **更新日期**: 2026-03-12  
> **技术栈**: React 18 + TypeScript + Tailwind CSS v4  
> **数据模式**: 全静态 Mock 数据（无后端依赖）

---

## 一、产品概述

### 1.1 产品定位

**企业多智能体平台**（专家发现智能平台）是一个面向企业级用户的多智能体协同管理平台，提供智能体全生命周期管理、多智能体工作流编排、运行监测与效果分析等核心能力。平台以"学术专家发现"为核心业务场景，支持论文检索、专家匹配、学者画像、影响力分析、跨领域检索等任务。

### 1.2 核心价值

- **一站式智能体管理**：从创建、配置、测试到发布的完整生命周期管理
- **可视化工作流编排**：通过拖拽式画布实现多智能体协同编排
- **全链路监测**：覆盖智能体性能、执行效果、安全风险的多维度可视化看板
- **开发资源统管**：模型、工具、技能等底层资源的集中配置与复用

### 1.3 用户角色

| 角色 | 说明 | 可用模块 |
|------|------|----------|
| `user`（普通用户） | 使用已发布的智能体和工作流 | 首页、探索市场、Studio |
| `developer`（开发者） | 创建、管理智能体及底层资源 | 全部模块（含工厂、监测看板） |

---

## 二、信息架构

### 2.1 页面路由总览

```
/                          → 重定向至 /galaxy
/galaxy                    → 首页（GalaxyGuardianPage）
/factory                   → 重定向至 /factory/workshop/create
  /factory/workshop/create → 智能体工厂 - 新建智能体（WorkshopCreatePage）
  /factory/workshop/editor/:agentId → 编辑已有智能体
  /factory/warehouse       → 智能体仓库（WarehousePage）
  /factory/warehouse/:agentId → 智能体仓库详情（AgentWarehouseDetailPage）
  /factory/materials/resources → 开发资源管理（MaterialsResourcesPage）
  /factory/materials/explore   → 探索更多资源（MaterialsExplorePage）
  /factory/dashboard       → 工厂概览看板（DashboardPage）
/studio/create             → 工作流 Studio 创建页（StudioCreatePage）
/studio/canvas/:workflowId → 工作流画布编辑页（StudioCanvasPage）
/marketplace               → 探索市场（MarketplacePage）
/marketplace/:agentId      → 智能体详情（AgentDetailPage）
/dashboard/agent-monitor   → 智能体性能监测看板（AgentMonitorDashboard）
/dashboard/execution-effect → 执行效果监测看板（ExecutionEffectDashboard）
/management/agents         → 开发者管理（DeveloperManagementPage）
/management/keys           → 密钥管理（KeyManagementPage）
/management/database       → 数据库管理（DatabaseManagementPage）
/docs                      → 开发者文档（DeveloperDocsPage）
/monitoring                → 监控中心（MonitoringCenterPage）
/security-monitoring       → 安全监控看板（SecurityMonitoringDashboard）
```

### 2.2 布局结构

| 布局模式 | 适用页面 | 说明 |
|----------|----------|------|
| **无 Layout** | Studio 画布、安全监控、智能体监测看板、执行效果看板 | 独立全屏页面，自带顶栏和返回按钮 |
| **带 Layout（隐藏侧栏）** | 首页、工厂所有子页面、Studio 创建页、文档页 | 顶部导航栏，工厂页面使用 `FactorySidebar` |
| **带 Layout（显示侧栏）** | 探索市场、管理页面 | 左侧导航 + 顶栏 |

---

## 三、视觉设计规范

### 3.1 主题色系

| 用途 | 色值 | 说明 |
|------|------|------|
| 主色（海军蓝） | `#0d1b2a` | 一级文字、Logo 背景 |
| 二级文字 | `#4a5b73` | 正文、描述文字 |
| 三级文字 | `#7d8da1` | 辅助说明、标签 |
| 四级文字 | `#a3b1c6` | 最弱层级文字 |
| 页面背景 | `bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]` | 全平台统一渐变背景 |
| 卡片背景 | `bg-white/70 backdrop-blur-xl` 或 `bg-white/80` | 磨玻璃质感 |
| 卡片边框 | `border-[#e2e8f0]` | 统一浅灰边框 |
| 卡片阴影 | `shadow-sm hover:shadow-md transition-shadow` | 与 StudioCanvasPage 对齐 |

### 3.2 功能模块主题色

| 模块 | 主题色 | 渐变底色 |
|------|--------|----------|
| 智能体工厂 | `#2563eb`（蓝） | `#dbeafe → #eff6ff` |
| 工作流 Studio | `#7c3aed`（紫） | `#ede9fe → #f5f3ff` |
| 智能体性能监测 | `#059669`（绿） | `#d1fae5 → #f0fdf4` |
| 执行效果监测 | `#d97706`（琥珀） | `#fef3c7 → #fffbeb` |

### 3.3 设计约束

- 每页字体种类不超过 **5 种**
- 智能体卡片宽度限制 `max-w-[400px]`
- 工厂子页面面包屑区域统一 `px-8 pt-6`
- 全平台搜索统一使用 `fuzzyMatch` 函数（支持子串匹配 + 逐字符模糊匹配）
- 看板页面统一使用确定性种子函数生成差异化数据，切换时 **0.25s 淡入过渡**

---

## 四、功能模块详述

### 4.1 首页（GalaxyGuardianPage）

**路由**: `/galaxy`  
**布局**: 独立全屏（含自有顶栏）

#### 功能描述

平台总入口页面，展示四大核心模块入口卡片，提供科技感视觉体验。

#### 页面结构

1. **顶部导航栏**
   - Logo + 平台名称「企业多智能体平台」
   - 系统运行状态指示灯 + 版本号（v2.1.0）

2. **标题区域**
   - 装饰性 SVG 弧线
   - 主标题「企业多智能体平台」（52px, 300 weight）
   - 副标题「多智能体协同驱动的全流程智能化解决方案」
   - 两侧装饰性圆点+横线

3. **入口卡片网格**（2x2 布局，`maxWidth: 960px`）
   - 每张卡片含：主题色图标（64px 圆角方框）、标题、英文副标题、描述文字
   - 装饰元素：顶部渐变线、角落电路线路图案、点阵微纹、网格叠加层、底部科技装饰条
   - 交互：hover 浮起(-8px) + 发光阴影 + 渐变背景变化 + 箭头指示器出现

4. **底部视觉区域**
   - 节点网络动态连线图（`BottomNetwork`）
   - 四色径向渐变光晕（对应四个模块主题色）
   - 底部装饰线条和中心标记

#### 入口卡片配置

| 卡片 | 目标路由 | 主题色 |
|------|----------|--------|
| 智能体工厂 | `/factory` | `#2563eb` |
| 任务工作流 Studio | `/studio/create` | `#7c3aed` |
| 智能体性能监测看板 | `/dashboard/agent-monitor` | `#059669` |
| 执行效果监测看板 | `/dashboard/execution-effect` | `#d97706` |

---

### 4.2 智能体工厂模块

工厂模块为智能体全生命周期管理的核心模块，含独立侧边栏导航（`FactorySidebar`）和统一面包屑组件（`FactoryBreadcrumb`）。

#### 4.2.1 新建智能体（WorkshopCreatePage）

**路由**: `/factory/workshop/create` | `/factory/workshop/editor/:agentId`

##### 功能描述

以对话式交互引导用户创建智能体，支持自然语言描述需求，AI 自动生成智能体配置方案。

##### 核心功能

- **对话式创建流程**：用户通过聊天界面描述智能体需求
- **AI 流式响应**：模拟 AI 助手逐字输出创建方案（`useStreamText` Hook）
- **画布预览**（`CanvasState`）：实时展示工具和技能的连接拓扑
- **智能体编辑**：支持编辑已有智能体（通过 `:agentId` 参数加载）
- **快速创建模板**：预设多种智能体模板供快速选择

##### 数据结构

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface CanvasState {
  showTools: boolean;
  showSkills: boolean;
  toolItems: string[];
  skillItems: string[];
  connected: boolean;
}
```

#### 4.2.2 智能体仓库（WarehousePage）

**路由**: `/factory/warehouse`

##### 功能描述

管理所有已创建的智能体，支持分类浏览、搜索、批量操作。

##### 核心功能

- **四类标签页**：已发布（published）、已安装（installed）、可升级（upgrade）、草稿（drafts）
- **模糊搜索**：使用 `fuzzyMatch` 函数
- **排序筛选**：全部 / 最近 / 热门
- **智能体操作**：编辑、删除、升级（含进度条动画）
- **升级状态机**：`pending → upgrading → completed`

##### 智能体数据模型

```typescript
interface Agent {
  id: string;
  name: string;
  version: string;
  type: 'single' | 'multi';
  description: string;
  tags: string[];
  creator: { name: string; avatar: string };
  status: 'normal' | 'upgrade' | 'deprecated';
  publishStatus: 'published' | 'draft' | 'installed';
  isFavorite?: boolean;
  successRate?: number;
  callCount?: number;
  avgLatency?: number;
  publishDate: string;
  nodeCount?: number;
  subAgentCount?: number;
  models?: string[];
  tools?: string[];
  subAgents?: { id: string; name: string; role: string; deprecated?: boolean }[];
}
```

#### 4.2.3 智能体仓库详情（AgentWarehouseDetailPage）

**路由**: `/factory/warehouse/:agentId`

##### 功能描述

单个智能体的完整详情页，含配置信息、运行数据、对话测试等功能。

##### 核心功能

- 智能体基本信息展示（名称、版本、类型、描述、标签）
- 子智能体列表（多智能体类型）
- 模型和工具配置查看
- 内置对话测试窗口（支持流式响应模拟）
- 编辑/删除/下载操作

#### 4.2.4 开发资源管理（MaterialsResourcesPage）

**路由**: `/factory/materials/resources`

##### 功能描述

集中管理智能体运行所需的底层资源，包括模型、工具和技能。

##### 核心功能

- **三类资源标签**：模型（models）、工具（tools）、技能（skills）
- **模型管理**：配置 LLM 模型（GPT-4、Claude-3 等），含参数配置弹窗（`ModelConfigModal`）
- **工具管理**：API 工具注册和编辑（`ToolEditModal`）
- **技能管理**：技能编排与编辑（`SkillEditModal`）
- **模糊搜索 + 筛选复选框**

#### 4.2.5 探索更多（MaterialsExplorePage）

**路由**: `/factory/materials/explore`

##### 功能描述

浏览和安装社区共享的智能体及资源。

#### 4.2.6 工厂概览看板（DashboardPage）

**路由**: `/factory/dashboard`

##### 功能描述

展示工厂整体运营数据概览，包括关键指标卡片和趋势图表。

---

### 4.3 工作流 Studio 模块

#### 4.3.1 工作流创建页（StudioCreatePage）

**路由**: `/studio/create`  
**布局**: 独立全屏

##### 功能描述

通过自然语言描述创建多智能体协同工作流，或选择预设模板快速启动。

##### 核心功能

- **自然语言输入**：描述任务需求，自动生成工作流
- **预设模板**：
  - 论文领域专家检索
  - 学者影响力分析
  - 跨领域知识图谱构建
  - 等
- **历史工作流浏览**：支持搜索历史记录
- **模糊搜索**：使用统一 `fuzzyMatch` 函数

#### 4.3.2 工作流画布编辑页（StudioCanvasPage）

**路由**: `/studio/canvas/:workflowId`  
**布局**: 独立全屏

##### 功能描述

可视化工作流编辑器，支持拖拽式节点编排、实时执行预览和调试。

##### 核心功能

- **画布操作**：缩放（ZoomIn/ZoomOut）、平移、全屏、网格对齐
- **节点管理**：添加、编辑、删除工作流步骤节点
- **步骤状态**：`pending → running → completed`
- **思维链展示**：执行过程的分阶段推理展示（`ThinkingStep`）
- **工具栏**：运行、搜索节点、编辑名称、刷新布局
- **右侧面板**：节点详情、执行日志、对话测试
- **复制/分享**：工作流配置导出

##### 数据结构

```typescript
interface WorkflowStep {
  id: string;
  index: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed';
  color: string;
  model?: string;
  tools?: string[];
  subAgents?: { name: string; role: string }[];
  group?: { name: string; description: string };
}

interface ThinkingStep {
  id: string;
  phase: string;
  label: string;
  duration: string;
}
```

---

### 4.4 智能体性能监测看板（AgentMonitorDashboard）

**路由**: `/dashboard/agent-monitor`  
**布局**: 独立全屏

#### 功能描述

实时监控智能体运行状态、安全风险与异常行为，提供多层防护体系的可视化分析。

#### 核心功能

1. **全局安全评分**：综合评分仪表盘（0-100）
2. **安全层级监测**：L1/L2/L3 三层防护体系，各层独立状态指示
3. **异常传播链路**：可视化展示异常事件在不同层级间的传播路径
4. **时间范围选择器**：今日 / 近7天 / 近30天 / 自定义范围
5. **数据响应式刷新**：基于确定性种子函数（`vary`/`varyInt`/`varySpark`），不同时间范围产生差异化 Mock 数据
6. **0.25s 淡入过渡**：切换时间范围时内容平滑过渡

#### 配色方案

| 层级 | 色值 | 用途 |
|------|------|------|
| L1 | `#36cfc9` | 第一层防护 |
| L2 | `#9254de` | 第二层防护 |
| L3 | `#cf1322` | 第三层防护/高危 |

---

### 4.5 执行效果监测看板（ExecutionEffectDashboard）

**路由**: `/dashboard/execution-effect`  
**布局**: 独立全屏

#### 功能描述

API 调用质量、任务执行成效与端到端性能指标的综合分析与洞察平台。

#### 页面层级结构

##### 第一层：顶部导航栏
- 返回按钮 → 首页
- 页面标题「执行效果监测看板」
- 时间范围选择器（`TimeRangePicker` 复用组件）

##### 第二层：筛选栏
- 智能体类型下拉：全部智能体 / 单智能体 / 多智能体协作
- 执行状态下拉：全部状态 / 成功 / 部分成功 / 失败 / 人工接管
- 重置筛选按钮
- `FilterDropdown` 组件：支持全局滚动监听（`capture: true`）自动收回下拉框

##### 第三层：场景标签栏
- 可选场景标签：论文检索、专家匹配、学者画像、影响力分析、跨领域检索、知识图谱
- 支持多选/全选/重置
- 选中数量指示器

##### 第四层：内容区域

###### 模块1：KPI 总览（四卡片网格）

| 指标 | 默认值 | 单智能体 | 多智能体 |
|------|--------|----------|----------|
| 任务成功率 | 94.7% | 96.3% | 91.8% |
| 平均响应延迟 | 3.2s | 1.8s | 5.6s |
| Token 效率 | 1,247 | 680 | 2,134 |
| 任务总量 | 922 | 614 | 308 |

- 每张卡片含迷你折线图（Sparkline）
- 底部分栏显示单/多智能体对比数据
- 通过 `flex` 布局 + `marginTop: auto` 确保四卡片底部数据区水平对齐

###### 模块2：任务执行质量

- **标签页切换**：全部 / 单智能体 / 多智能体
  - 切换时质量矩阵数值、对比表行数、任务分布数据均响应式变化
  - 通过 `qualityData` 派生数据层 + 确定性种子实现
- **质量矩阵**（4���网格）：输出准确率、工具调用成功率、幻觉率、重试率
- **按场景质量对比表**：应用场景、智能体类型、准确率（含进度条）、幻觉率、重试率、平均耗时
- **今日任务结果分布**：堆叠条形图（成功/部分成功/失败/人工接管）

###### 模块3：智能体执行排行 + 任务实时动态（左右分栏）

- **排行榜**：支持按成功率/效率/质量排序（`TabPills` 切换）
- **任务动态**：实时任务状态流（全部/成功/失败/进行中筛选）

###### 模块4：可靠性与稳定性

- 错误率、超时率等指标展示

###### 模块5：多智能体协同分析

- 协同健康度、任务完成率、目标对齐度
- 任务漏斗图

#### 数据响应机制

```typescript
// 确定性种子函数
const RANGE_SEEDS = { today: 1, '7d': 1.35, '30d': 2.1, custom: 1.7 };

function vary(base: number, seed: number, spread = 0.15): number {
  const hash = Math.sin(base * 9301 + seed * 49297) * 0.5 + 0.5;
  return +(base * (1 + (hash - 0.5) * 2 * spread * seed)).toFixed(1);
}

// 场景选择生成二级种子
const scenarioSeed = hash(selectedScenarios) * 0.008;
const combinedSeed = seed + scenarioSeed;

// 质量标签页派生数据
const qualityData = useMemo(() => {
  // qualityTab: '全部' | '单智能体' | '多智能体'
  // - 全部: 原始数据
  // - 单/多: 数值变化 + 表格行过滤 + 分布数据变化
}, [D, qualityTab]);
```

---

### 4.6 其他页面

#### 探索市场（MarketplacePage）
**路由**: `/marketplace`  
浏览和搜索平台上所有已发布的智能体和工作流。

#### 智能体详情（AgentDetailPage）
**路由**: `/marketplace/:agentId`  
查看单个智能体的完整信息，区分用户/开发者视角。

#### 开发者管理（DeveloperManagementPage）
**路由**: `/management/agents`  
开发者资源的高级管理界面。

#### 密钥管理（KeyManagementPage）
**路由**: `/management/keys`  
API 密钥的创建、查看和管理。

#### 数据库管理（DatabaseManagementPage）
**路由**: `/management/database`  
数据库连接和配置管理。

#### 开发者文档（DeveloperDocsPage）
**路由**: `/docs`  
平台 API 文档和开发指南。

#### 监控中心（MonitoringCenterPage）
**路由**: `/monitoring`  
综合运行监控页面。

#### 安全监控看板（SecurityMonitoringDashboard）
**路由**: `/security-monitoring`  
安全事件和威胁监测专用看板。

---

## 五、共享组件库

### 5.1 业务组件

| 组件 | 文件 | 用途 |
|------|------|------|
| `Layout` | `/components/Layout.tsx` | 全局布局容器（含顶栏+侧栏） |
| `FactorySidebar` | `/components/FactorySidebar.tsx` | 工厂模块侧边栏导航 |
| `FactoryBreadcrumb` | `/components/FactoryBreadcrumb.tsx` | 工厂模块面包屑导航（`px-8 pt-6`） |
| `AgentCard` | `/components/AgentCard.tsx` | 智能体信息卡片（`max-w-[400px]`） |
| `WorkflowCard` | `/components/WorkflowCard.tsx` | 工作流信息卡片 |
| `TimeRangePicker` | `/components/TimeRangePicker.tsx` | 时间范围选择器（含日历双面板） |
| `BackButton` | `/components/BackButton.tsx` | 统一返回按钮 |
| `SubAgentsPopover` | `/components/SubAgentsPopover.tsx` | 子智能体弹出信息框 |
| `AgentExperienceDrawer` | `/components/AgentExperienceDrawer.tsx` | 智能体体验抽屉面板 |

### 5.2 UI 基础组件库

基于 shadcn/ui 体系的完整组件库（`/components/ui/`），包括：

`Accordion`, `AlertDialog`, `Alert`, `AspectRatio`, `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Calendar`, `Card`, `Carousel`, `Chart`, `Checkbox`, `Collapsible`, `Command`, `ContextMenu`, `Dialog`, `Drawer`, `DropdownMenu`, `Form`, `HoverCard`, `Input`, `InputOTP`, `Label`, `Menubar`, `NavigationMenu`, `Pagination`, `Popover`, `Progress`, `RadioGroup`, `Resizable`, `ScrollArea`, `Select`, `Separator`, `Sheet`, `Sidebar`, `Skeleton`, `Slider`, `Sonner`, `Switch`, `Table`, `Tabs`, `Textarea`, `Toggle`, `ToggleGroup`, `Tooltip`

### 5.3 工具函数

| 函数 | 用途 | 使用页面 |
|------|------|----------|
| `fuzzyMatch(text, query)` | 统一模糊搜索（子串 + 逐字符匹配） | Studio、仓库、资源管理、探索页 |
| `vary(base, seed, spread)` | 确定性数值变化 | 两个监测看板 |
| `varyInt(base, seed, spread)` | 确定性整数变化 | 两个监测看板 |
| `varySpark(arr, seed)` | Sparkline 数据变化 | 两个监测看板 |

---

## 六、数据模型

### 6.1 Mock 数据源

**文件**: `/data/mockData.ts`

提供全平台共享的静态模拟数据：

- `mockAgents: Agent[]` — 智能体列表（含已发布、草稿、已安装等状态）
- `mockScenes` — 业务场景定义

### 6.2 看板内联 Mock 数据

两个监测看板使用页面内联的 Mock 数据对象，通过确定性种子函数实现时间范围切换时的数据差异化，无需外部数据源。

### 6.3 业务场景

| 场景 | 任务数 | 主题色 |
|------|--------|--------|
| 论文检索 | 234 | `#2563eb` |
| 专家匹配 | 186 | `#8b5cf6` |
| 学者画像 | 152 | `#14b8a6` |
| 影响力分析 | 98 | `#f59e0b` |
| 跨领域检索 | 72 | `#ef4444` |
| 知识图谱 | 58 | `#059669` |

---

## 七、交互规范

### 7.1 全局交互

- **页面转场**：React Router 路由切换，无额外动画
- **卡片 hover**：`shadow-sm → shadow-md`，0.3s 过渡
- **首页入口卡片 hover**：translateY(-8px) + scale(1.015) + 发光阴影 + 渐变背景变化，`cubic-bezier(0.34,1.4,0.64,1)` 弹性曲线
- **看板数据刷新**：opacity 0→1，0.25s ease 过渡

### 7.2 组件交互

| 组件 | 交互行为 |
|------|----------|
| `FilterDropdown` | 点击展开，滚动时自动收回（全局 scroll 监听 `capture: true`） |
| `TabPills` | 点击切换，关联数据即时刷新 |
| `TimeRangePicker` | 预设范围一键选择 + 自定义日期范围双面板日历 |
| `AgentCard` | 点击进入详情，hover 显示操作按钮 |
| 对话流式响应 | 逐字符输出模拟，`useStreamText` Hook |

### 7.3 响应式设计

- 看板页面：固定布局，适配桌面端
- 工厂页面：侧栏 + 主内容区自适应
- 首页：入口卡片 2x2 网格（maxWidth: 960px），居中布局

---

## 八、技术架构

### 8.1 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 + Inline Styles |
| 路由 | React Router v7（`react-router` 包） |
| 图标 | Lucide React |
| 状态管理 | React useState / useMemo（无全局状态库） |
| 数据 | 全静态 Mock 数据（无后端） |

### 8.2 项目结构

```
/
├── App.tsx                          # 路由入口
├── data/
│   └── mockData.ts                  # 共享 Mock 数据
├── components/
│   ├── Layout.tsx                   # 全局布局
│   ├── FactorySidebar.tsx           # 工厂侧栏
│   ├── FactoryBreadcrumb.tsx        # 工厂面包屑
│   ├── AgentCard.tsx                # 智能体卡片
│   ├── WorkflowCard.tsx             # 工作流卡片
│   ├── TimeRangePicker.tsx          # 时间选择器
│   ├── BackButton.tsx               # 返回按钮
│   ├── SubAgentsPopover.tsx         # 子智能体弹窗
│   ├── AgentExperienceDrawer.tsx    # 体验抽屉
│   ├── ui/                          # shadcn/ui 组件库
│   └── pages/
│       ├── GalaxyGuardianPage.tsx           # 首页
│       ├── StudioCreatePage.tsx             # Studio 创建页
│       ├── StudioCanvasPage.tsx             # Studio 画布页
│       ├── AgentMonitorDashboard.tsx        # 性能监测看板
│       ├── ExecutionEffectDashboard.tsx     # 执行效果看板
│       ├── MarketplacePage.tsx              # 探索市场
│       ├── AgentDetailPage.tsx              # 智能体详情
│       ├── SecurityMonitoringDashboard.tsx  # 安全监控
│       └── factory/
│           ├── WorkshopCreatePage.tsx       # 新建智能体
│           ├── WarehousePage.tsx            # 智能体仓库
│           ├── AgentWarehouseDetailPage.tsx # 仓库详情
│           ├── MaterialsResourcesPage.tsx  # 资源管理
│           ├── MaterialsExplorePage.tsx     # 探索资源
│           └── DashboardPage.tsx           # 工厂概览
├── styles/
│   └── globals.css                  # 全局样式 + CSS 变量
└── imports/                         # Figma 导入资源
```

### 8.3 关键设计模式

1. **确定性数据生成**：`Math.sin(base * 9301 + seed * 49297)` 种子函数，确保相同输入产生相同输出
2. **派生数据层**：`useMemo` 链式派生（seed → D → qualityData），筛选条件变化时自动重算
3. **淡入过渡动画**：`useEffect` 监听筛选条件 → opacity 置 0 → setTimeout 180ms → opacity 置 1
4. **统一搜索**：`fuzzyMatch` 函数在各页面复用，支持子串和逐字符两种匹配模式

---

## 九、版本记录

| 版本 | 日期 | 主要变更 |
|------|------|----------|
| v2.1.0 | 2026-03-12 | 首页入口卡片科技感重设计（2x2布局+电路装饰）；执行效果看板质量模块筛选联动完善 |
| v2.0.0 | — | 首页+两看板视觉全面升级；看板时间选择器数据响应式机制；FilterDropdown 滚动自动收回 |
| v1.0.0 | — | 初始版本，含全部页面框架和核心功能 |

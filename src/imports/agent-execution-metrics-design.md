# 智能体执行效果监控 — 指标体系设计 & Design Prompts v1.0

---

## 一、定位与设计理念

### 与安全监控面板的关系

| 面板 | 核心问题 | 视角 |
|------|---------|------|
| Runtime Monitor（安全监控） | "系统安全吗？" | 防御视角 |
| **Execution Monitor（执行效果）** | **"系统能干活吗、干得好吗？"** | **产出视角** |

两个面板是一体两面：安全面板守住底线，效果面板衡量产出。**不应混合安全指标和效果指标。**

### 四维度框架

```
维度 A：任务执行质量  → "做对了吗？"
维度 B：执行效率      → "做得快吗、花多少？"
维度 C：系统可靠性    → "做得稳吗？"
维度 D：协作效能      → "配合得好吗？"（MAS 特有）
```

---

## 二、完整指标定义

### 维度 A — 任务执行质量 (Task Quality)

| 编号 | 指标名称 | 英文标识 | 说明 | 计算方式 | 目标方向 |
|------|---------|---------|------|---------|---------|
| A1 | 任务成功率 | task_success_rate | 任务最终达成预期目标的比例 | 成功任务 / 总任务 × 100% | ↑ 越高越好 |
| A2 | 输出准确率 | output_accuracy | 输出通过质量校验的比例 | 合格输出 / 总输出 × 100% | ↑ 越高越好 |
| A3 | 幻觉率 | hallucination_rate | 产生虚假/无依据内容的频率 | 幻觉检出次数 / 总生成次数 × 100% | ↓ 越低越好 |
| A4 | 工具调用成功率 | tool_call_success_rate | 智能体调用外部工具/API 的成功比例 | 成功调用 / 总调用 × 100% | ↑ 越高越好 |
| A5 | 重试率 | retry_rate | 需要重试才完成的任务占比 | 含重试任务 / 总任务 × 100% | ↓ 越低越好 |
| A6 | 人工接管率 | human_takeover_rate | 需要人工介入的任务比例 | 人工接管次数 / 总任务 × 100% | ↓ 越低越好 |

**质量等级映射：**

| 等级 | 任务成功率 | 幻觉率 | 颜色 |
|------|----------|--------|------|
| 优秀 | ≥ 95% | < 1% | 绿色 #52c41a |
| 良好 | 85-94% | 1-3% | 蓝色 #1890ff |
| 一般 | 70-84% | 3-5% | 橙色 #faad14 |
| 较差 | < 70% | > 5% | 红色 #f5222d |

---

### 维度 B — 执行效率 (Execution Efficiency)

| 编号 | 指标名称 | 英文标识 | 说明 | 计算方式 | 目标方向 |
|------|---------|---------|------|---------|---------|
| B1 | 平均任务耗时 | avg_task_duration | 从任务下发到完成的平均时长 | Σ(完成时间-开始时间) / 任务数 | ↓ 越低越好 |
| B2 | P95 延迟 | p95_latency | 95% 的任务在多长时间内完成 | 延迟分布的95分位值 | ↓ 越低越好 |
| B3 | Token 消耗效率 | token_efficiency | 完成单位任务的平均 token 用量 | 总 token / 完成任务数 | ↓ 越低越好 |
| B4 | 多轮交互效率 | interaction_rounds | 完成任务平均需要几轮对话/推理 | 总轮次 / 完成任务数 | ↓ 越低越好 |
| B5 | 吞吐量 | throughput | 单位时间内完成的任务数 | 完成任务数 / 时间窗口 | ↑ 越高越好 |
| B6 | 队列等待时间 | queue_wait_time | 任务在队列中等待的平均时间 | Σ排队时间 / 任务数 | ↓ 越低越好 |
| B7 | 并发利用率 | concurrency_util | 当前并发任务数 / 最大并发容量 | 当前并发 / 最大并发 × 100% | 适中最佳 |

**效率等级映射（以平均耗时为例）：**

| 等级 | 判定 | 颜色 |
|------|------|------|
| 极快 | < P50 基线 | 绿色 #52c41a |
| 正常 | P50-P75 基线 | 蓝色 #1890ff |
| 偏慢 | P75-P95 基线 | 橙色 #faad14 |
| 过慢 | > P95 基线 | 红色 #f5222d |

---

### 维度 C — 系统可靠性 (System Reliability)

| 编号 | 指标名称 | 英文标识 | 说明 | 计算方式 | 目标方向 |
|------|---------|---------|------|---------|---------|
| C1 | 服务可用率 | service_availability | 系统正常提供服务的时间比例 | 正常时间 / 总时间 × 100% | ↑ 越高越好 |
| C2 | 错误率 | error_rate | 任务执行报错的比例 | 错误数 / 总请求 × 100% | ↓ 越低越好 |
| C3 | 超时率 | timeout_rate | 超过预设时限的任务比例 | 超时任务 / 总任务 × 100% | ↓ 越低越好 |
| C4 | 平均恢复时间 MTTR | mean_time_to_recover | 从故障到恢复的平均时间 | Σ恢复耗时 / 故障次数 | ↓ 越低越好 |
| C5 | 降级运行率 | degradation_rate | 在降级模式下运行的时间比例 | 降级时间 / 总运行时间 × 100% | ↓ 越低越好 |
| C6 | 连续无故障时间 | uptime_streak | 当前连续正常运行的时间 | 距上次故障的时间长度 | ↑ 越长越好 |

**可用率等级（SLA 标准）：**

| 等级 | 可用率 | 含义 | 颜色 |
|------|--------|------|------|
| 四个9 | ≥ 99.99% | 极高可靠性 | 绿色 #52c41a |
| 三个9 | 99.9-99.99% | 高可靠性 | 蓝色 #1890ff |
| 两个9 | 99-99.9% | 标准可靠性 | 橙色 #faad14 |
| 不达标 | < 99% | 可靠性不足 | 红色 #f5222d |

---

### 维度 D — 协作效能 (Collaboration Effectiveness) — MAS 特有

| 编号 | 指标名称 | 英文标识 | 说明 | 计算方式 | 目标方向 |
|------|---------|---------|------|---------|---------|
| D1 | 协作任务完成率 | collab_completion_rate | 多智能体协作任务的成功率 | 协作成功 / 协作总数 × 100% | ↑ 越高越好 |
| D2 | 消息传递成功率 | message_delivery_rate | 智能体间通信的送达率 | 成功送达 / 总消息 × 100% | ↑ 越高越好 |
| D3 | 协作延迟开销 | collaboration_overhead | 协作引入的额外时间成本 | 协作总耗时 - Σ各智能体独立耗时 | ↓ 越低越好 |
| D4 | 目标对齐度 | goal_alignment_score | 协作过程中各智能体目标一致性 | 对齐检查通过率 × 100% | ↑ 越高越好 |
| D5 | 工作流端到端完成率 | workflow_completion_rate | 编排的多步工作流的成功率 | 完成工作流 / 总工作流 × 100% | ↑ 越高越好 |
| D6 | 瓶颈智能体 | bottleneck_agent | 协作链路中耗时最长的节点 | 识别最慢智能体 | 排行榜 |

---

## 三、仪表盘布局设计

### 信息架构（4层递进）

```
Header: 全局执行概览（4个核心 KPI）
    ↓
Zone 1: 执行质量 + 效率趋势（左右双栏）
    ↓
Zone 2: 可靠性全景 + 协作效能（左右双栏）
    ↓
Zone 3: 智能体执行排行 + 任务流水
```

### 全局 KPI 卡片设计

| 位置 | 指标 | 编号 | 核心数字 | 辅助信息 |
|------|------|------|---------|---------|
| 卡片1 | 任务成功率 | A1 | 94.7% | 趋势 sparkline + 环比变化 |
| 卡片2 | 平均任务耗时 | B1 | 3.2s | P95 标注 + 趋势箭头 |
| 卡片3 | Token 消耗效率 | B3 | 1,247/task | 成本换算 + 对比基线 |
| 卡片4 | 人工接管率 | A6 | 2.3% | 趋势 + 目标线对比 |

---

## 四、Design Prompts（可直接复制使用）

---

### Prompt 1: 全局执行效果概览栏 (Header KPIs)

```
Design a full-width execution overview header bar for an AI agent runtime performance monitoring dashboard. This header answers the question: "How well is the system performing right now?"

**Layout:**
- Full width, height ~140px, containing 4 equally-spaced KPI cards
- Each card: white/light card on a soft gray background (#f5f7fa), rounded 16px, subtle shadow

**Card 1 — Task Success Rate (任务成功率):**
- Icon: green checkmark circle (#52c41a)
- Main number: "94.7%" in 36px bold
- Label: "任务成功率" in 13px gray
- Top right: sparkline (mini line chart, ~60px wide) showing 7-day trend
- Badge: "+1.2%" in green with upward arrow

**Card 2 — Average Task Duration (平均任务耗时):**
- Icon: blue clock (#1890ff)
- Main number: "3.2s" in 36px bold
- Label: "平均任务耗时" in 13px gray
- Sub-label: "P95: 8.7s" in 11px muted text
- Badge: "-0.4s" in green (improvement = duration decrease)

**Card 3 — Token Efficiency (Token 消耗效率):**
- Icon: purple diamond (#722ed1)
- Main number: "1,247" in 36px bold
- Label: "Token/任务" in 13px gray
- Sub-label: "≈ ¥0.03/任务" in 11px muted text
- Badge: "-5.2%" in green (lower is better)
- Tiny horizontal bar showing current vs baseline (baseline = dashed line at 1,400)

**Card 4 — Human Takeover Rate (人工接管率):**
- Icon: orange hand/person (#fa8c16)
- Main number: "2.3%" in 36px bold
- Label: "人工接管率" in 13px gray
- Badge: "-0.8%" in green (lower is better)
- Tiny target line indicator: target is <3%, current is within target (green dot)

**Style:**
- Background: #f0f2f5 (light gray)
- Cards: white (#ffffff) with border-radius 16px, box-shadow: 0 2px 8px rgba(0,0,0,0.06)
- Icons: 40px circular background (tinted light version of icon color) with 20px icon inside
- Number font: system bold or DIN Pro / SF Pro Display style
- Sparklines: 1.5px stroke, no dots, smooth curve
- Badges: pill-shaped, 10px font, green for positive changes, red for negative
- Consistent 24px padding inside each card
- Cards have a 3px colored top border matching the icon color
```

---

### Prompt 2: 任务执行质量面板 (Zone 1 — Left)

```
Design a task execution quality panel for an AI agent monitoring dashboard. This panel answers: "Are the agents doing their work correctly?"

**Layout:**
- Card container, width ~55% of the row, height ~360px
- Title: "任务执行质量" with subtitle "Task Execution Quality"

**Content — 3 metric rows stacked vertically:**

**Row 1 — Quality Score Ring:**
- Large donut/ring chart (160px diameter) centered
- Ring shows composite quality score: 92.4/100
- Ring color: green (#52c41a) for the filled arc, #f0f0f0 for the remainder
- Center: score "92.4" in 32px bold + "质量评分" label below
- Around the ring, 4 small satellite indicators:
  - 输出准确率: 96.2%
  - 工具调用成功率: 98.1%
  - 幻觉率: 1.8% (this one with a small orange warning dot since >1%)
  - 重试率: 4.2%

**Row 2 — Quality Breakdown Bars:**
- 4 horizontal progress bars, each showing one quality metric:
  - 输出准确率: 96.2% (green bar)
  - 工具调用成功率: 98.1% (green bar)
  - 幻觉率: 1.8% (orange bar, since >1%. Note: bar shows 1.8% filled from LEFT, representing how much hallucination exists — short bar is good)
  - 重试率: 4.2% (yellow bar)
- Each bar has: label left, percentage right, colored fill proportional to value
- For "inverse" metrics (hallucination, retry), use warm colors and fill from left (short = good)

**Row 3 — Task Outcome Distribution:**
- Horizontal stacked bar showing today's task outcomes:
  - 成功 (green): 847 tasks
  - 部分成功 (yellow): 42 tasks
  - 失败 (red): 12 tasks
  - 人工接管 (orange): 21 tasks
- Below the bar: legend with counts

**Style:**
- White card on light gray background
- Section dividers: 1px #f0f0f0 lines
- Metric labels: 12px, color #8c8c8c
- Values: 14px semi-bold, color #262626
- Progress bars: height 8px, rounded ends, background #f5f5f5
- Quality colors: ≥95% green, 85-94% blue, 70-84% orange, <70% red
```

---

### Prompt 3: 效率趋势面板 (Zone 1 — Right)

```
Design an execution efficiency trend panel for an AI agent monitoring dashboard. This panel answers: "How fast and cost-effective are the agents?"

**Layout:**
- Card container, width ~45% of the row, height ~360px
- Title: "执行效率趋势" with subtitle "Efficiency Trends"

**Content:**

**Section 1 — Dual-axis Line Chart (占 60% 高度):**
- Time range: last 24 hours, X-axis shows hourly ticks
- Left Y-axis: Average task duration (seconds), line color #1890ff (blue), solid
- Right Y-axis: Token consumption per task, line color #722ed1 (purple), dashed
- Both lines are smooth curves with area fill at 10% opacity
- A horizontal dashed reference line at the SLA target duration (e.g., 5s) in red
- Tooltip on hover shows both values at that time point
- Current values highlighted with glowing dots at the rightmost points

**Section 2 — Efficiency Summary Cards (占 40% 高度, 2×2 grid):**
- Mini card 1: "吞吐量" — "142 任务/小时" with trend arrow ↑
- Mini card 2: "P95 延迟" — "8.7s" with status dot (green = within SLA)
- Mini card 3: "队列等待" — "0.8s" with status dot
- Mini card 4: "并发利用率" — "67%" with a tiny horizontal gauge bar (green zone 40-80%, yellow >80%)

**Style:**
- White card, consistent with quality panel
- Chart area: light grid lines at 5% opacity
- Line chart: 2px stroke, smooth bezier curves
- Mini summary cards: 2×2 grid with 12px gap, each card has left color accent bar (4px)
- Number font: tabular/monospace for alignment
- Trend arrows: ↑ green (improvement), ↓ red (degradation), → gray (stable)
- SLA reference line: red dashed, 1px, with "SLA: 5s" label
```

---

### Prompt 4: 系统可靠性全景 (Zone 2 — Left)

```
Design a system reliability overview panel for an AI agent monitoring dashboard. This panel answers: "Is the system running stably?"

**Layout:**
- Card container, width ~50% of the row, height ~320px
- Title: "系统可靠性" with subtitle "System Reliability"

**Content:**

**Top section — Availability & Uptime (占 40% 高度):**
- Left: Large SLA indicator showing "99.92%" in 28px bold. Below: "服务可用率" label. A colored status dot: green if ≥99.9%, yellow if 99-99.9%, red if <99%.
- Right: Uptime streak display: "连续无故障运行 14天7小时" in a rounded pill with a green shield icon. Below: "上次故障: 2025-01-12 03:42" in small gray text.

**Middle section — Reliability Metrics Row (占 30% 高度):**
- 3 inline metric blocks:
  - 错误率: "0.8%" with red mini bar (short = good)
  - 超时率: "1.2%" with orange mini bar
  - MTTR: "47s" with blue text
- Each block: label on top (12px gray), value below (18px bold), tiny status indicator

**Bottom section — Error Type Distribution (占 30% 高度):**
- Small horizontal stacked bar showing error breakdown:
  - 超时错误 (timeout): 45%
  - 模型错误 (model_error): 23%
  - 工具调用失败 (tool_failure): 18%
  - 其他 (other): 14%
- Below: legend with color dots and percentages
- Each segment uses a distinct color from a cohesive palette

**Style:**
- White card with consistent styling
- SLA number uses a large, confident font weight
- Uptime pill: light green background (#f6ffed) with green border (#b7eb8f)
- Error distribution bar: height 12px, rounded, smooth color transitions
- Status dots: 8px circles, filled solid
- MTTR in cool blue to distinguish from error metrics
```

---

### Prompt 5: 协作效能面板 (Zone 2 — Right) — MAS 特有

```
Design a multi-agent collaboration effectiveness panel for an AI agent monitoring dashboard. This panel answers: "How well are the agents working together?" This is unique to Multi-Agent Systems.

**Layout:**
- Card container, width ~50% of the row, height ~320px
- Title: "协作效能" with subtitle "Collaboration Effectiveness"
- A small badge next to the title: "MAS" in purple (#722ed1) indicating this is multi-agent specific

**Content:**

**Top section — Collaboration Health Score (占 35% 高度):**
- Centered: a horizontal "health bar" (like a game HP bar), 280px wide, 24px tall
- Fill: gradient from left (green) to current position at 87.3%
- Label centered inside bar: "协作健康度 87.3%"
- Below bar: 3 contributing factors as small pills:
  - "任务完成率 91.2%" (green pill)
  - "消息送达率 99.8%" (green pill)
  - "目标对齐度 82.1%" (yellow pill — lowest factor highlighted)

**Middle section — Workflow Funnel (占 35% 高度):**
- A mini horizontal funnel showing workflow stages and drop-off:
  - 工作流启动: 200
  - 任务分配: 196 (98%)
  - 智能体执行: 188 (94%)
  - 结果聚合: 181 (90.5%)
  - 最终交付: 174 (87%)
- Each stage is a trapezoid/bar getting slightly narrower
- Drop-off percentages labeled between stages in red if >5%

**Bottom section — Bottleneck Detection (占 30% 高度):**
- Title: "瓶颈智能体 Top 3"
- 3 inline items, each showing:
  - Agent name (e.g., "Summarizer-Agent")
  - Average processing time: "4.7s" (with a small bar)
  - How much slower than average: "+2.1s" in orange
- The slowest agent has a small flame/warning icon

**Style:**
- White card
- Health bar: rounded 12px, green gradient (#52c41a to #95de64), unfilled portion #f0f0f0
- Workflow funnel: soft blue-green tones, each stage slightly lighter
- Bottleneck bars: horizontal, orange/red gradient for slow agents
- "MAS" badge: tiny pill with purple background and white text
- Contributing factor pills: colored background at 15% opacity with colored text
```

---

### Prompt 6: 智能体执行排行榜 (Zone 3 — Left)

```
Design an agent execution performance leaderboard for an AI agent monitoring dashboard. This panel ranks agents by their execution effectiveness.

**Layout:**
- Card container, width ~50% of the row, height ~340px
- Title: "智能体执行排行" with subtitle "Agent Performance Ranking"
- Tab switcher: "成功率" | "效率" | "质量" (toggles between ranking criteria)

**Content — Ranked Agent List (5 rows):**

Each row contains:
- Rank badge: circular, 24px. #1 gold (#faad14), #2 silver (#bfbfbf), #3 bronze (#d48806), others gray
- Agent icon: small colored avatar circle with first letter
- Agent name: "DataExtractor-01" in 14px medium weight
- Primary metric (based on selected tab):
  - 成功率 tab: "97.2%" with a compact horizontal bar filled to that percentage
  - 效率 tab: "2.1s avg" with bar
  - 质量 tab: "95.8 score" with bar
- Secondary info: "847 tasks completed" in small gray text
- Trend indicator: ↑2 (moved up 2 ranks) in green, or ↓1 in red, or "—" in gray
- Status dot: green (active), gray (idle)

**Bottom — Comparison Sparklines:**
- Below the list: 5 overlapping sparklines (one per agent), showing their success rate trend over 7 days
- Each line colored differently, with agent name labels
- This gives a quick visual of performance trends across agents

**Style:**
- Clean table layout with subtle row dividers (#f5f5f5)
- Hover state: row background brightens to #fafafa
- Rank badges: filled circles with white number text
- Performance bars: 6px height, rounded, colored by quality threshold (green/blue/orange/red)
- Tab switcher: underline style, active tab has colored underline
- Sparklines: 1px strokes, low opacity area fills, no axis labels (minimal)
```

---

### Prompt 7: 任务实时流水 (Zone 3 — Right)

```
Design a real-time task execution feed for an AI agent monitoring dashboard. This shows the live stream of task executions with their outcomes.

**Layout:**
- Card container, width ~50% of the row, height ~340px
- Title: "任务执行流水" with subtitle "Real-time Task Feed"
- Top right: filter pills — "全部" | "成功" | "失败" | "进行中"
- Top right: task count badge "今日 892 任务"

**Content — Scrollable Task List (6-8 visible rows):**

Each task row contains:
- Status icon (left, 32px):
  - ✓ green circle: 成功
  - ✕ red circle: 失败
  - ◐ blue spinning: 进行中
  - ⚠ orange triangle: 需人工介入
- Task info (center):
  - Task name: "文档摘要生成 #T-4821" in 14px medium
  - Agent name: "SummaryAgent-02" in 12px gray
  - Task type tag: "文本生成" in a small pill
- Metrics (right):
  - Duration: "2.4s"
  - Tokens: "1,832"
  - Timestamp: "14:23:07"

**For failed tasks:** the row has a subtle red-tinted background (#fff1f0), and shows error type: "timeout" or "hallucination_detected" as a red tag.

**For in-progress tasks:** a subtle animated progress bar runs along the bottom edge of the row.

**Style:**
- Light background, rows alternate between white and #fafafa
- Status icons: 32px circles with white icon inside, colored by status
- New tasks slide in from the top with a brief fade animation
- Failed task rows: left border 3px red (#f5222d)
- In-progress rows: left border 3px blue (#1890ff) with pulse animation
- Filter pills: outlined style, active pill has colored fill
- Scrollbar: thin, semi-transparent, appears on hover
- Timestamps in monospace font
- Consistent 16px horizontal padding, 12px vertical padding per row
```

---

### Prompt 8: 完整页面组装

```
Design a complete AI Agent Execution Effectiveness Monitoring Dashboard. This is a professional performance monitoring interface for a Multi-Agent System (MAS), focused purely on execution quality and efficiency (NOT security — that's a separate dashboard).

**Page title:** "执行效果监控" with subtitle "AI 智能体执行质量与效率总览"

**Page structure (top to bottom):**

1. **Header KPI Bar** (full-width, ~140px): 4 white cards on light gray background, each with colored top accent border:
   - 任务成功率: 94.7%, green accent, +1.2% badge, sparkline
   - 平均任务耗时: 3.2s, blue accent, P95: 8.7s sub-label, -0.4s badge
   - Token消耗效率: 1,247/task, purple accent, ≈¥0.03/task, -5.2% badge
   - 人工接管率: 2.3%, orange accent, -0.8% badge, target indicator <3%

2. **Zone 1** (two columns, ~360px):
   - Left (55%): 任务执行质量 — Composite quality ring (92.4/100) with 4 satellite metrics, quality breakdown bars (输出准确率/工具调用/幻觉率/重试率), task outcome distribution stacked bar
   - Right (45%): 执行效率趋势 — Dual-axis chart (duration + token cost over 24h) with SLA line, 2×2 mini cards (吞吐量/P95延迟/队列等待/并发利用率)

3. **Zone 2** (two columns, ~320px):
   - Left (50%): 系统可靠性 — SLA 99.92% large display + uptime streak, reliability metric row (错误率/超时率/MTTR), error type distribution bar
   - Right (50%): 协作效能 [MAS badge] — Collaboration health bar (87.3%), workflow funnel (200→174 tasks), bottleneck agent top 3

4. **Zone 3** (two columns, ~340px):
   - Left (50%): 智能体执行排行 — Tab-switchable leaderboard (成功率/效率/质量), top 5 agents with rank badges, performance bars, trend indicators, comparison sparklines
   - Right (50%): 任务执行流水 — Real-time scrollable task feed with status icons, task info, duration/tokens/time metrics, filterable by status, failed tasks highlighted in red

**Overall style:**
- Light theme: page background #f0f2f5, cards white #ffffff
- Card style: border-radius 16px, box-shadow 0 2px 8px rgba(0,0,0,0.06), 24px internal padding
- Color system:
  - 质量优秀: #52c41a (green)
  - 质量良好: #1890ff (blue)
  - 需要关注: #faad14 (yellow/orange)
  - 严重问题: #f5222d (red)
  - Token/成本: #722ed1 (purple)
  - 协作/MAS: #13c2c2 (cyan)
- Typography: Chinese-friendly sans-serif (PingFang SC / Noto Sans SC), numbers in DIN Pro or tabular monospace
- Spacing: 24px gap between major zones, 16px gap between cards within zones
- Charts: minimal grid lines, smooth curves, 10% opacity area fills
- Animations: numbers count up on load, sparklines draw from left, new feed items fade in
- Responsive: 2-column layout collapses to single column on narrow screens

**Key UX principles:**
- Top-to-bottom = overview → detail → drill-down
- Every number answers a clear question
- Color is functional, not decorative — green=good, red=problem, always
- Light theme for analytical clarity (vs. dark theme for security SOC-style monitoring)
- This dashboard complements the dark-themed security monitoring dashboard — together they form a complete MAS operations view

**Differentiation from Security Dashboard:**
- Light theme (vs dark) — visually distinct, signals "performance" not "threat"
- Metric focus: success/speed/cost/collaboration (vs risk/attack/defense)
- No security indicators mixed in — clean separation of concerns
```

---

## 五、指标覆盖率总表

| 编号 | 指标 | 维度 | 所在区域 | 展示形式 |
|------|------|------|---------|---------|
| A1 | 任务成功率 | 质量 | Header + Zone1左 | KPI卡片 + 环形图 |
| A2 | 输出准确率 | 质量 | Zone1左 | 进度条 |
| A3 | 幻觉率 | 质量 | Zone1左 | 反向进度条 |
| A4 | 工具调用成功率 | 质量 | Zone1左 | 进度条 |
| A5 | 重试率 | 质量 | Zone1左 | 反向进度条 |
| A6 | 人工接管率 | 质量 | Header | KPI卡片 |
| B1 | 平均任务耗时 | 效率 | Header + Zone1右 | KPI卡片 + 折线图 |
| B2 | P95 延迟 | 效率 | Header辅助 + Zone1右 | 子标签 + 迷你卡片 |
| B3 | Token消耗效率 | 效率 | Header + Zone1右 | KPI卡片 + 折线图 |
| B4 | 多轮交互效率 | 效率 | Zone1右（扩展） | 迷你卡片 |
| B5 | 吞吐量 | 效率 | Zone1右 | 迷你卡片 |
| B6 | 队列等待时间 | 效率 | Zone1右 | 迷你卡片 |
| B7 | 并发利用率 | 效率 | Zone1右 | 迷你条形 |
| C1 | 服务可用率 | 可靠性 | Zone2左 | 大数字 |
| C2 | 错误率 | 可靠性 | Zone2左 | 迷你条形 |
| C3 | 超时率 | 可靠性 | Zone2左 | 迷你条形 |
| C4 | MTTR | 可靠性 | Zone2左 | 数字 |
| C5 | 降级运行率 | 可靠性 | Zone2左（扩展） | 数字 |
| C6 | 连续无故障时间 | 可靠性 | Zone2左 | 时间胶囊 |
| D1 | 协作任务完成率 | 协作 | Zone2右 | 健康条因素 |
| D2 | 消息传递成功率 | 协作 | Zone2右 | 健康条因素 |
| D3 | 协作延迟开销 | 协作 | Zone2右（扩展） | 数字 |
| D4 | 目标对齐度 | 协作 | Zone2右 | 健康条因素 |
| D5 | 工作流完成率 | 协作 | Zone2右 | 漏斗图 |
| D6 | 瓶颈智能体 | 协作 | Zone2右 | 排行 |

**共计 25 个指标，100% 覆盖四个维度。**

---

## 六、与安全监控面板的协同

### 从现有设计中迁移的指标

| 现有设计中的指标 | 归属 | 处理方式 |
|----------------|------|---------|
| API调用成功率 99.2% | 效果面板 | 保留 → 拆分为 C1 服务可用率 + A4 工具调用成功率 |
| 安全风险事件 23 | ❌ 安全面板 | 移除 → 移到安全监控的 G2 AlertStatistics |
| 通过率 98.7% | 效果面板 | 保留 → 归入 A1 任务成功率 |
| 异常拦截数 1,284 | ❌ 安全面板 | 移除 → 移到安全监控的 L1_DefenseRate |
| 调用效果趋势图 | 效果面板 | 保留 → 升级为双轴效率趋势图（耗时+Token） |
| 安全防护概览 | ❌ 安全面板 | 整块移除 → 全部移到安全监控面板 |

### 双面板视觉区分

| 属性 | 安全监控面板 | 执行效果面板 |
|------|------------|------------|
| 主题色调 | 深色 Dark (#0a1628) | 浅色 Light (#f0f2f5) |
| 情绪基调 | 紧张、警觉 | 清晰、分析 |
| 核心颜色 | 红/橙警告色为主 | 绿/蓝正向色为主 |
| 动效风格 | 脉冲、闪烁（引起注意） | 平滑过渡（辅助理解） |
| 适用场景 | 安全运营中心 SOC | 效果分析、周报、汇报 |
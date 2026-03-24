# Runtime Monitor 仪表盘重设计方案

## 一、现有设计与指标体系的差距分析

### 现有设计覆盖的内容
| 模块 | 对应指标 | 问题 |
|------|---------|------|
| 顶部 KPI 卡片（活跃智能体/任务/会话/节点） | 无直接对应 | 这些是**运维指标**，不是安全指标 |
| 实时告警列表 | 部分对应 G2 | 缺少层级标注、严重度分色、攻击模式归类 |
| 智能体状态分布（环形图） | 部分对应 A 系列 | 只有运行状态，缺少信任度/脆弱性/偏离度 |
| 底部摘要卡片（监控/健康/任务） | 无直接对应 | 仍是运维视角，缺少防御率/韧性指标 |

### 指标体系中缺失的关键模块
- **全局安全态势 (G1)** — 最核心的"系统安全吗？"这个问题完全没有回答
- **三层风险面板 (L1/L2/L3)** — 核心架构完全缺失
- **攻击阶段与趋势 (T1/T2)** — 没有时间维度的安全态势
- **智能体画像 (A1-A4)** — 只有运行/离线状态，缺少安全画像
- **跨层关联 (C1-C4)** — 风险传播和根因分析完全缺失

---

## 二、重设计指标体系架构

### 信息架构（5层递进）

```
Layer 0: 全局态势感知（一眼看清"安全吗"）
    ↓
Layer 1: 三层风险概览（哪层出了问题）
    ↓
Layer 2: 时序态势感知（正在发生什么、趋势如何）
    ↓
Layer 3: 智能体安全画像（谁有问题）
    ↓
Layer 4: 跨层关联分析（为什么会这样）
```

### 详细模块定义

---

#### 🔷 Zone 0 — 全局安全态势栏（页面最顶部，全宽）

**核心指标：G1 GlobalSecurityPosture**

| 数据字段 | 展示形式 | 说明 |
|---------|---------|------|
| `overall_score` (0-100) | 大号数字 + 圆弧仪表盘 | 安全评分，越高越安全 |
| `status` (SECURE/CAUTION/ALERT/CRITICAL) | 状态徽章 + 背景色渐变 | 四级安全状态 |
| `weakest_layer` | 标签高亮 | 最薄弱层级 |
| `primary_threat` | 威胁类型标签 | 当前最主要威胁 |

**辅助指标：G2 AlertStatistics（嵌入态势栏右侧）**

| 数据字段 | 展示形式 |
|---------|---------|
| `total_count` | 数字 badge |
| `by_severity` | 三色小圆点 + 数字（info/warning/critical） |
| `alert_rate` | 速率数字 + 趋势微线图(sparkline) |

**设计要点：**
- 安全时：深绿/深青色调，呼吸感弱光效
- 告警时：渐变为橙红色调，增加脉冲动效
- 这一行需要传递情绪——用户进入页面第一眼就要感知到安全/危险

---

#### 🔷 Zone 1 — 三层风险面板（三等分列布局）

每层（L1/L2/L3）是一个独立面板，内含三个维度卡片：

**L1 面板 — 单智能体风险**
| 维度 | 指标 | 展示形式 |
|------|------|---------|
| 风险聚合度 | `L1_RiskLevel` | 风险分数仪表盘 + 五级色阶 + dominant_risk 标签 |
| 攻击态势 | `L1_AttackPattern` | 攻击模式标签（INJECTION/DATA_EXFIL/PRIVILEGE/DECEPTION） + 强度指示条 |
| 系统韧性 | `L1_DefenseRate` | 防御率环形进度条 + blocked/total 数字 |

**L2 面板 — 多智能体交互风险**
| 维度 | 指标 | 展示形式 |
|------|------|---------|
| 风险聚合度 | `L2_RiskLevel` | 同 L1 结构 |
| 攻击态势 | `L2_AttackPattern` | 攻击模式标签（COMM_ATTACK/PROPAGATION/COORDINATION） |
| 系统韧性 | `L2_DefenseRate` | 同 L1 结构 |

**L3 面板 — 系统级风险**
| 维度 | 指标 | 展示形式 |
|------|------|---------|
| 风险聚合度 | `L3_RiskLevel` | 同 L1 结构 |
| 攻击态势 | `L3_AttackPattern` | 攻击模式标签（SYSTEM_BREACH/CASCADE/EMERGENT） |
| 系统韧性 | `L3_DefenseRate` | 同 L1 结构 |

**设计要点：**
- 三列等宽，用层级标识色区分（L1 天蓝 #36cfc9，L2 紫色 #9254de，L3 深红 #cf1322）
- 每列顶部有层级名称 + 当前风险等级色条
- 三个维度纵向排列：风险分数 → 攻击模式 → 防御率

---

#### 🔷 Zone 2 — 时序态势区（横向双列）

**左列：攻击生命周期**

| 指标 | 展示形式 |
|------|---------|
| T1 AttackPhase | 六阶段水平进度条（IDLE → PROBE → INITIAL → ESTABLISH → ESCALATE → ACHIEVE），当前阶段高亮 |
| T4 AttackTempo | 节奏波形指示器（CONTINUOUS/INTERMITTENT/BURST/QUIET） |

**右列：风险趋势**

| 指标 | 展示形式 |
|------|---------|
| T2 RiskTrendForecast | 实时折线图 + 预测区间（阴影区域），velocity 用趋势箭头表示 |
| T3 AlertDensityRate | 面积图（current vs baseline），burst 时背景闪烁 |

**设计要点：**
- 时间轴统一，两列共享 X 轴时间
- 攻击阶段进度条要有"紧迫感"设计——越往右颜色越深

---

#### 🔷 Zone 3 — 智能体安全画像区（横向三列）

**左列：脆弱性排行榜 (A1)**

| 数据 | 展示 |
|------|------|
| Top 5 智能体 | 排行列表，每行含：排名、agent_name、vulnerability_score（水平条）、primary_risk 标签、trend 箭头 |

**中列：问题智能体检测 (A3)**

| 数据 | 展示 |
|------|------|
| 问题智能体列表 | 卡片组，每张含：agent_name、问题类型标签（ROGUE/COMPROMISED/ANOMALOUS/HIGH_RISK）、告警数 |

**右列：智能体信任度分布 (A2)**

| 数据 | 展示 |
|------|------|
| 信任度分布 | 散点图或蜂巢图，X=trust_score，颜色=trust_level |
| 选中智能体 | 弹出雷达图（behavior/communication/history三因素） |

---

#### 🔷 Zone 4 — 跨层关联分析区（全宽）

**左侧：风险传播链 (C1) + 层级升级概率 (C2)**

| 数据 | 展示 |
|------|------|
| 传播链 | 桑基图，L1→L2→L3 三列，流量=传播概率 |
| 升级概率 | 叠加在桑基图层级间，用百分比标注 |

**右侧：根因定位 (C3) + 跨层关联图 (C4)**

| 数据 | 展示 |
|------|------|
| 根因 | 高亮卡片（root_cause_type + root_cause_id + recommendation） |
| 关联图 | 力导向图，节点=layer/risk_type/agent，边=关联关系 |

---

#### 🔷 Zone 5 — 实时告警流（页面底部，全宽）

基于现有设计的告警列表进行增强：

| 增强项 | 说明 |
|--------|------|
| 层级标注 | 每条告警增加 L1/L2/L3 层级标签 |
| 严重度色彩 | info=蓝、warning=橙、critical=红（左侧色条） |
| 风险类型 | 显示具体的20种风险类型标签 |
| 攻击模式归类 | 相关告警可折叠归组 |
| 筛选器 | 按层级/严重度/风险类型筛选 |

---

## 三、颜色规范

### 安全状态色
| 状态 | 色值 | 用途 |
|------|------|------|
| SECURE | `#52c41a` | 安全状态 |
| CAUTION | `#faad14` | 注意状态 |
| ALERT | `#fa8c16` | 警戒状态 |
| CRITICAL | `#f5222d` | 危急状态 |

### 层级标识色
| 层级 | 色值 | 含义 |
|------|------|------|
| L1 | `#36cfc9` | 单智能体风险 |
| L2 | `#9254de` | 多智能体交互风险 |
| L3 | `#cf1322` | 系统级风险 |

### 告警严重度色
| 等级 | 色值 |
|------|------|
| info | `#1890ff` |
| warning | `#faad14` |
| critical | `#f5222d` |

---

## 四、指标覆盖率对照

| 指标编号 | 指标名称 | 所在 Zone | 展示形式 |
|---------|---------|----------|---------|
| G1 | GlobalSecurityPosture | Zone 0 | 仪表盘+状态徽章 |
| G2 | AlertStatistics | Zone 0 右侧 | 数字+微线图 |
| L1.1 | L1_RiskLevel | Zone 1 左列 | 分数仪表盘 |
| L1.2 | L1_AttackPattern | Zone 1 左列 | 模式标签 |
| L1.3 | L1_DefenseRate | Zone 1 左列 | 防御率环 |
| L2.1-L2.3 | L2 三维度 | Zone 1 中列 | 同 L1 结构 |
| L3.1-L3.3 | L3 三维度 | Zone 1 右列 | 同 L1 结构 |
| T1 | AttackPhase | Zone 2 左 | 阶段进度条 |
| T2 | RiskTrendForecast | Zone 2 右 | 趋势折线图 |
| T3 | AlertDensityRate | Zone 2 右 | 面积图 |
| T4 | AttackTempo | Zone 2 左 | 波形指示器 |
| A1 | AgentVulnerabilityRanking | Zone 3 左 | 排行榜 |
| A2 | AgentTrustScore | Zone 3 右 | 散点/雷达图 |
| A3 | ProblematicAgentDetection | Zone 3 中 | 问题卡片组 |
| A4 | AgentBehaviorDeviation | Zone 3（叠加A1） | 偏离度条形 |
| C1 | RiskPropagationChain | Zone 4 左 | 桑基图 |
| C2 | LayerEscalationProbability | Zone 4 左叠加 | 概率标注 |
| C3 | RootCauseLocator | Zone 4 右 | 根因卡片 |
| C4 | CrossLayerCorrelation | Zone 4 右 | 力导向图 |
| — | 实时告警流 | Zone 5 | 增强告警列表 |

**覆盖率：PDF 中全部 18 个指标 + 全局告警 = 100% 覆盖**

---

## 五、Design Prompt（Figma Make / AI 设计工具可用）

以下提供分区域的 Design Prompt，可直接复制到 Figma Make、v0、Bolt 等工具中使用。

---

### Prompt 1: 全局态势栏 (Zone 0)

```
Design a full-width security posture header bar for a real-time multi-agent system (MAS) runtime monitor dashboard.

**Layout:**
- Full width, height ~120px
- Left section (60%): Large circular gauge showing "overall_score" (0-100, higher = safer), with the number "82" centered inside. Next to the gauge: status badge showing "SECURE" in green (#52c41a). Below: two small tags — "Weakest Layer: L2" and "Primary Threat: message_tampering".
- Right section (40%): Alert statistics panel showing: total alert count "47" with a red badge, three severity dots (blue "info: 23", orange "warning: 18", red "critical: 6"), and a sparkline showing alert rate trend (currently "2.3/min").

**Style:**
- Background: dark gradient (from #0a1628 to #0f1f3a) with a subtle grid pattern overlay at 5% opacity
- The circular gauge uses a thick arc stroke — green (#52c41a) for the filled portion, dark gray for unfilled
- Status badge: pill shape with green background and white text
- Typography: score number in 48px bold monospace, labels in 12px uppercase tracking-wider
- When status is CRITICAL, background shifts to dark red gradient with a slow pulse animation on the gauge

**Interaction:** The gauge color and background gradient transition smoothly based on security status (green → yellow → orange → red).
```

---

### Prompt 2: 三层风险面板 (Zone 1)

```
Design a three-column risk panel section for a security monitoring dashboard. Each column represents one layer of a multi-agent system: L1 (Single Agent), L2 (Multi-Agent Interaction), L3 (System Level).

**Layout per column:**
- Column header: Layer name + colored top border (L1: #36cfc9, L2: #9254de, L3: #cf1322)
- Card 1 — Risk Level: Semi-circular gauge (0-100), current score displayed large center, 5-level color coding (safe green → critical red). Below: "Dominant Risk" tag and "Trend" arrow (↑↗→↘↓).
- Card 2 — Attack Pattern: Horizontal tag showing current attack mode (e.g., "INJECTION_ATTACK"), with intensity indicator bar (4 levels: none/probing/active/aggressive). When no attack: show "NONE" in muted style.
- Card 3 — Defense Rate: Circular progress ring (0-100%), percentage number centered. Below: "Blocked: 142 / Total: 156" in small text. Status label (excellent/good/degraded/failing) with corresponding color.

**Style:**
- Background: #111827 (near-black)
- Cards: #1a2332 with 1px border #2a3444, rounded 12px
- Layer header uses the layer's accent color as a 3px top border and icon tint
- Numbers in monospace font (JetBrains Mono or similar), labels in sans-serif
- Each column is equal width with 16px gap between them
- Defense rate ring: filled portion uses green gradient when ≥70%, orange when 50-69%, red when <50%

**Data (for mockup):**
- L1: score 35/medium, INJECTION_ATTACK/active, defense 91%/excellent
- L2: score 58/high, PROPAGATION_ATTACK/probing, defense 73%/good
- L3: score 12/low, NONE/none, defense 95%/excellent
```

---

### Prompt 3: 时序态势区 (Zone 2)

```
Design a two-column temporal analysis section for a security monitoring dashboard.

**Left column — Attack Lifecycle:**
- Component 1: Attack Phase Progress Bar — A horizontal 6-stage pipeline showing: IDLE → PROBE → INITIAL → ESTABLISH → ESCALATE → ACHIEVE. Current stage "INITIAL" is highlighted. Stages left of current are filled, stages right are dimmed. Colors progress from cool blue (IDLE) to hot red (ACHIEVE).
- Component 2: Attack Tempo Indicator — A waveform visualization showing rhythm type. Currently showing "INTERMITTENT" with a dotted pulse pattern. Other states: CONTINUOUS (solid wave), BURST (spikes), QUIET (flat line).

**Right column — Risk Trends:**
- Component 1: Risk Trend Chart — A real-time line chart showing risk score over the last 30 minutes. Current value highlighted. A shaded confidence interval extends 5 minutes into the future. A trend arrow (currently "ESCALATING" ↑) with velocity number "+2.3/min" in orange.
- Component 2: Alert Density Chart — An area chart comparing current density (solid fill) vs baseline density (dashed line). When burst_detected=true, the area above baseline pulses with a warning highlight.

**Style:**
- Dark background (#111827), chart areas slightly lighter (#1a2332)
- Chart lines: primary #36cfc9, baseline #4a5568 dashed
- Forecast/prediction zone: hatched or lower-opacity fill
- Attack phase stages: each stage is a rounded rectangle connected by chevron arrows
- Tempo waveform: animated SVG or CSS animation showing the pulse pattern
- Shared time axis at the bottom spanning both columns
```

---

### Prompt 4: 智能体安全画像区 (Zone 3)

```
Design a three-column agent security profiling section for a runtime monitor dashboard.

**Left column — Vulnerability Ranking (Top 5):**
- A leaderboard list. Each row: rank number (1-5), agent name ("Agent-Alpha", "Agent-Bravo"...), horizontal bar showing vulnerability_score (0-100, longer = more vulnerable), a small risk type tag (e.g., "prompt_injection"), and a trend arrow.
- Row 1 (highest risk) has a subtle red left border.

**Center column — Problematic Agents:**
- Card stack showing detected problem agents. Each card contains: agent name, problem type badge (ROGUE in red, COMPROMISED in orange, ANOMALOUS in yellow, HIGH_RISK in purple), alert count number, and a brief reason text.
- Cards have colored left border matching problem type. Show 3-4 cards.

**Right column — Trust Score Distribution:**
- A scatter plot or bubble chart. X-axis: trust score (0-100). Dots colored by trust level: TRUSTED (#52c41a), SUSPICIOUS (#faad14), UNTRUSTED (#f5222d). Dot size represents alert count.
- Below the chart: summary counts "Trusted: 312 | Suspicious: 25 | Untrusted: 3"

**Style:**
- Dark theme consistent with rest of dashboard
- Vulnerability bars use gradient from green (low score) to red (high score)
- Problem type badges are pill-shaped with colored background
- Trust scatter plot has subtle grid lines and labeled quadrants
- Agent names in medium-weight sans-serif, scores in monospace
```

---

### Prompt 5: 跨层关联分析区 (Zone 4)

```
Design a full-width cross-layer risk analysis section with two halves for a security monitoring dashboard.

**Left half — Risk Propagation Sankey Diagram:**
- A Sankey/flow diagram with three columns representing L1 → L2 → L3.
- L1 column nodes: risk types like "prompt_injection", "jailbreak", "hallucination"
- L2 column nodes: "malicious_propagation", "misinformation_amplification", "identity_spoofing"
- L3 column nodes: "cascading_failure", "group_hallucination", "rogue_agent"
- Flow lines connect source risks to downstream risks, thickness = propagation probability
- Active propagation chains are highlighted in bright color, inactive ones are dimmed
- Between columns, show escalation probability labels (e.g., "L1→L2: 34%", "L2→L3: 12%")

**Right half — Root Cause & Correlation Network:**
- Top: Root Cause Card showing: type "AGENT", id "Agent-Gamma", confidence "87%", impact scope "affects 12 agents", recommendation text.
- Bottom: Force-directed graph. Nodes are circles of three types: layer nodes (large, colored by layer), risk_type nodes (medium), agent nodes (small). Edges connect related nodes, thickness = correlation strength. Edge types shown by line style (solid = causation, dashed = correlation, dotted = propagation).

**Style:**
- Sankey: layer columns colored by L1 #36cfc9, L2 #9254de, L3 #cf1322
- Flow lines use gradient transitioning between layer colors
- Root cause card has a prominent left border in warning orange
- Force graph on dark background with glowing node effects
- Active/highlighted paths have animated dash or glow effect
```

---

### Prompt 6: 实时告警流 (Zone 5)

```
Design a full-width real-time alert feed for a security monitoring dashboard, showing the latest security alerts from a multi-agent system.

**Layout:**
- Header row: "实时告警" title + filter chips for Layer (L1/L2/L3), Severity (info/warning/critical), and Risk Type dropdown. Right side: alert count badge and auto-scroll toggle.
- Alert list: Scrollable vertical list, newest on top. Each alert row contains:
  - Left: 4px colored border indicating severity (blue #1890ff / orange #faad14 / red #f5222d)
  - Layer badge: small pill showing "L1", "L2", or "L3" in layer color
  - Risk type icon + label (e.g., "⚠ prompt_injection")
  - Alert title in bold (e.g., "检索异常行为检测")
  - Description text in gray (e.g., "智能体 #A-2847 查询频率异常升高")
  - Timestamp on the right (e.g., "2分钟前")
  - Severity badge: pill with text "critical" / "warning" / "info"

**Style:**
- Dark background (#0f172a), alert rows on #1a2332 with subtle hover brighten effect
- Severity colors used consistently: info=#1890ff, warning=#faad14, critical=#f5222d
- New alerts slide in from top with a brief highlight animation
- Critical alerts have a subtle pulse/glow on the left border
- Filter chips: dark pill with border, active state fills with corresponding color
- Monospace for timestamps, sans-serif for content
- Show 5-8 alerts visible at once with smooth scroll
```

---

### Prompt 7: 完整页面组装

```
Design a complete security runtime monitoring dashboard for a Multi-Agent System (MAS). This is a professional security operations center (SOC) style interface.

**Page structure (top to bottom):**

1. **Global Security Posture Bar** (full-width, ~120px): Large circular gauge showing overall security score (82/100), "SECURE" status badge in green, weakest layer indicator "L2", primary threat tag "message_tampering". Right side: alert count (47), severity breakdown (info 23 / warning 18 / critical 6), alert rate sparkline (2.3/min).

2. **Three-Layer Risk Panels** (3 equal columns, ~320px height): Each column for L1 (cyan #36cfc9), L2 (purple #9254de), L3 (red #cf1322). Each contains: risk score gauge (0-100), attack pattern tag with intensity bar, defense rate ring with blocked/total stats.

3. **Temporal Analysis** (2 columns, ~280px): Left: 6-stage attack phase pipeline (currently "INITIAL") + attack tempo waveform ("INTERMITTENT"). Right: Risk trend line chart with forecast zone + alert density area chart vs baseline.

4. **Agent Security Profiles** (3 columns, ~300px): Left: Top 5 vulnerability ranking with score bars. Center: Problematic agent cards (ROGUE/COMPROMISED/ANOMALOUS). Right: Trust score scatter plot by trust level.

5. **Cross-Layer Analysis** (full-width, ~360px): Left: Sankey diagram showing risk propagation L1→L2→L3 with escalation probabilities. Right: Root cause card + force-directed correlation network graph.

6. **Real-time Alert Feed** (full-width, scrollable ~300px): Filterable alert stream with layer badges, severity colors, risk type labels, timestamps. New alerts animate in.

**Overall style:**
- Dark theme: base #0a0f1a, cards #141b2d, borders #1e293b
- Color system: safe=#52c41a, caution=#faad14, alert=#fa8c16, critical=#f5222d
- Layer colors: L1=#36cfc9, L2=#9254de, L3=#cf1322
- Typography: titles in bold sans-serif, data numbers in monospace (JetBrains Mono), labels in 11px uppercase with letter-spacing
- Subtle grid background pattern at 3% opacity
- Cards have 1px border with slight glass-morphism (backdrop-filter: blur)
- Critical states trigger subtle ambient glow and pulse animations
- Professional SOC aesthetic — information-dense but organized, zero decorative waste

**Key UX principles:**
- Top-to-bottom = general-to-specific (态势感知 → 分层详情 → 智能体画像 → 根因分析)
- Color is meaningful, never decorative — every color change communicates state
- Numbers update in real-time with brief transition animations
- Dark theme reduces eye strain for monitoring operators during long shifts
```

---

## 六、从现有设计迁移的建议

### 保留的元素
1. **卡片式布局** — 保留，但重新定义卡片内容
2. **环形图** — 保留形式，从"运行状态分布"改为"防御率"和"安全评分"
3. **告警列表** — 保留并增强（增加层级、严重度、风险类型）
4. **顶部概览区** — 保留位置，从运维 KPI 改为安全态势

### 替换的元素
| 原有 | 替换为 | 原因 |
|------|--------|------|
| 活跃智能体数 | 全局安全评分 G1 | 安全仪表盘首要关注安全状态 |
| 运行中任务数 | 告警统计 G2 | 告警是安全监控的核心数据 |
| 活跃会话数 | 攻击阶段 T1 | 需要展示攻击生命周期 |
| 监控节点数 | 防御率摘要 | 韧性比节点数更重要 |
| 智能体状态环形图 | 信任度分布 A2 | 安全画像比运行状态更关键 |
| 底部三卡片 | 三层风险摘要 | 用 L1/L2/L3 替代运维视角 |

### 新增的元素
- 三层风险面板（核心新增）
- 时序态势区（折线图+攻击阶段）
- 跨层桑基图
- 力导向关联图
- 根因定位卡片
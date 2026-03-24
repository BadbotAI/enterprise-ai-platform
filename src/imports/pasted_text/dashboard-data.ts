import { useState } from "react";

// === Color System (matches main dashboard) ===
const C = {
  bg: "#f5f6f8",
  card: "#ffffff",
  border: "#e8eaef",
  text: { pri: "#1c1f26", sec: "#6c7489", tri: "#a0a7b8" },
  accent: "#4e6e96",
  green: "#5a9e6f",
  blue: "#5e8fb8",
  orange: "#b89a6e",
  red: "#b86e6e",
  purple: "#8b72b0",
  teal: "#5a9e96",
};

// === Mock Data (deduplicated, system-level) ===
const DATA = {
  // --- Section 1: 核心效率指标 (3 cards, no duplication) ---
  coreMetrics: {
    successRate: { value: "94.7%", delta: "+1.2%", trend: "up", spark: [88, 90, 91, 93, 92, 94, 93, 95, 94, 95] },
    avgLatency: { value: "3.2s", delta: "-0.4s", trend: "down", sub: "P95: 8.7s", spark: [4.2, 3.8, 3.6, 3.5, 3.4, 3.2, 3.3, 3.1, 3.2, 3.2] },
    tokenEfficiency: { value: "1,247", delta: "-5.2%", trend: "down", sub: "≈ ¥0.03/任务", spark: [1400, 1380, 1350, 1320, 1300, 1280, 1260, 1250, 1247, 1247] },
  },

  // --- Section 2: 任务执行质量 (merged, no ring score, no duplication) ---
  quality: {
    outputAccuracy: 96.2,
    toolCallSuccess: 98.1,
    hallucinationRate: 1.8,
    retryRate: 4.2,
  },
  taskDistribution: { success: 847, partial: 42, failed: 12, humanTakeover: 21 },

  // --- Section 3: 系统可靠性 + 协作效能 (side by side) ---
  reliability: {
    availability: "99.92%",
    uptimeDays: "14天7小时",
    lastIncident: "2025-01-12 03:42",
    errorRate: 0.8,
    timeoutRate: 1.2,
    meanRecovery: "47s",
    errorTypes: [
      { name: "超时错误", pct: 45, color: C.blue },
      { name: "模型错误", pct: 23, color: C.red },
      { name: "工具调用失败", pct: 18, color: C.teal },
      { name: "其他", pct: 14, color: C.text.tri },
    ],
  },
  collaboration: {
    health: 87.3,
    taskCompletion: 91.2,
    messageDelivery: 99.8,
    goalAlignment: 82.1,
    funnel: [
      { stage: "工作流启动", count: 200 },
      { stage: "任务分配", count: 196 },
      { stage: "智能体执行", count: 188 },
      { stage: "结果聚合", count: 181 },
      { stage: "最终交付", count: 174 },
    ],
    bottlenecks: [
      { name: "学术影响力评估", latency: "5.8s", delta: "+2.6s" },
      { name: "跨领域专家发现", latency: "4.5s", delta: "+1.3s" },
      { name: "学者合作网络分析", latency: "4.2s", delta: "+1.0s" },
    ],
  },

  // --- Section 4: 智能体执行排行 + 任务流水 ---
  agentRanking: [
    { name: "学术热点追踪", tag: "学", rate: 99.1, tasks: 2341, trend: "stable" },
    { name: "学者画像分析", tag: "学", rate: 98.2, tasks: 892, trend: "up" },
    { name: "学术影响力评估", tag: "学", rate: 97.1, tasks: 456, trend: "down" },
    { name: "论文专家匹配智能体", tag: "论", rate: 96.8, tasks: 1247, trend: "up" },
    { name: "机构人才图谱", tag: "机", rate: 95.3, tasks: 1123, trend: "down" },
  ],
  taskFeed: [
    { id: "T-4821", name: "文档摘要生成", agent: "学者画像分析", tags: ["文本生成"], latency: "2.4s", tokens: 1832, time: "14:23:07", status: "success" },
    { id: "T-4820", name: "论文元数据提取", agent: "论文专家匹配智能体", tags: ["信息抽取"], latency: "1.7s", tokens: 946, time: "14:22:51", status: "success" },
    { id: "T-4819", name: "专家领域匹配", agent: "跨领域专家发现", tags: ["语义检索"], latency: "—", tokens: "—", time: "14:22:38", status: "running" },
    { id: "T-4818", name: "引用网络分析", agent: "学者合作网络分析", tags: ["图谱分析"], latency: "8.2s", tokens: 3421, time: "14:22:15", status: "failed", error: "超时错误" },
    { id: "T-4817", name: "学者画像生成", agent: "学者画像分析", tags: ["文本生成"], latency: "3.1s", tokens: 2104, time: "14:21:58", status: "success" },
  ],
};

// === Primitives ===
const Card = ({ children, style = {} }) => (
  <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, ...style }}>{children}</div>
);
const Title = ({ children, extra }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
    <span style={{ fontSize: 13, fontWeight: 600, color: C.text.pri }}>{children}</span>
    {extra}
  </div>
);
const N = ({ children, size = 28, color = C.text.pri }) => (
  <span style={{ fontSize: size, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", lineHeight: 1, color }}>{children}</span>
);
const Bar = ({ value, max = 100, color, h = 5 }) => (
  <div style={{ flex: 1, height: h, background: "#eef0f4", borderRadius: h / 2, overflow: "hidden" }}>
    <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color, borderRadius: h / 2, transition: "width 0.5s" }} />
  </div>
);
const Tag = ({ text, color }) => (
  <span style={{ padding: "2px 9px", borderRadius: 4, fontSize: 11, fontWeight: 600, color, background: `${color}0e`, border: `1px solid ${color}1e` }}>{text}</span>
);
const Spark = ({ data, w = 80, h = 24, color = C.accent }) => {
  const mx = Math.max(...data), mn = Math.min(...data), r = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / r) * (h - 4) - 2}`).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" /></svg>;
};
const Delta = ({ value, good }) => {
  const isPositive = value.startsWith("+");
  const color = good === "up" ? (isPositive ? C.green : C.red) : (isPositive ? C.red : C.green);
  return <span style={{ fontSize: 12, fontWeight: 600, color, marginLeft: 6 }}>{value}</span>;
};

// === Segmented Tabs ===
const Tabs = ({ items, value, onChange }) => (
  <div style={{ display: "flex", background: "#f0f1f4", borderRadius: 6, padding: 2 }}>
    {items.map(t => (
      <button key={t} onClick={() => onChange(t)} style={{
        padding: "4px 14px", borderRadius: 4, fontSize: 12, fontFamily: "inherit",
        border: "none", cursor: "pointer", fontWeight: value === t ? 600 : 400,
        background: value === t ? "#fff" : "transparent",
        color: value === t ? C.text.pri : C.text.sec,
        boxShadow: value === t ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
      }}>{t}</button>
    ))}
  </div>
);

// === Stacked Bar ===
const StackedBar = ({ segments, h = 8 }) => {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div style={{ display: "flex", height: h, borderRadius: h / 2, overflow: "hidden", width: "100%" }}>
      {segments.map((s, i) => (
        <div key={i} style={{ width: `${(s.value / total) * 100}%`, height: "100%", background: s.color, transition: "width 0.5s" }} />
      ))}
    </div>
  );
};

// === Funnel ===
const Funnel = ({ steps }) => {
  const max = steps[0].count;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {steps.map((s, i) => {
        const pct = (s.count / max) * 100;
        const opacity = 1 - i * 0.15;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: C.text.sec, width: 72, textAlign: "right", whiteSpace: "nowrap" }}>{s.stage}</span>
            <div style={{ flex: 1, height: 20, background: "#eef0f4", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: C.blue, opacity, borderRadius: 4, transition: "width 0.5s" }} />
            </div>
            <N size={13}>{s.count}</N>
          </div>
        );
      })}
    </div>
  );
};

// ========================
// === MAIN COMPONENT ===
// ========================
export default function ExecutionMonitor() {
  const [rankBy, setRankBy] = useState("成功率");
  const [feedFilter, setFeedFilter] = useState("全部");
  const d = DATA;

  const filteredFeed = d.taskFeed.filter(t => {
    if (feedFilter === "成功") return t.status === "success";
    if (feedFilter === "失败") return t.status === "failed";
    if (feedFilter === "进行中") return t.status === "running";
    return true;
  });

  const statusIcon = (s) => {
    if (s === "success") return <span style={{ color: C.green, fontSize: 16 }}>✓</span>;
    if (s === "failed") return <span style={{ color: C.red, fontSize: 16 }}>✕</span>;
    return <span style={{ color: C.blue, fontSize: 14 }}>◌</span>;
  };

  const trendArrow = (t) => {
    if (t === "up") return <span style={{ color: C.green, fontSize: 11 }}>↑</span>;
    if (t === "down") return <span style={{ color: C.red, fontSize: 11 }}>↓</span>;
    return <span style={{ color: C.text.tri, fontSize: 11 }}>—</span>;
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'PingFang SC','Noto Sans SC','Helvetica Neue',sans-serif", color: C.text.pri }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 28px", background: "#fff", borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16, color: C.text.tri, cursor: "pointer" }}>←</span>
          <span style={{ fontSize: 15, fontWeight: 700 }}>执行效果监控</span>
        </div>
        <span style={{ fontSize: 12, color: C.text.tri }}>智能体执行质量与效率总览</span>
      </div>

      <div style={{ padding: "18px 28px", maxWidth: 1440, margin: "0 auto" }}>

        {/* === Row 1: 三个核心效率指标 === */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
          {[
            { label: "任务成功率", ...d.coreMetrics.successRate, good: "up", sparkColor: C.green },
            { label: "平均任务耗时", ...d.coreMetrics.avgLatency, good: "down", sparkColor: C.blue },
            { label: "Token 消耗效率", ...d.coreMetrics.tokenEfficiency, good: "down", sparkColor: C.text.pri },
          ].map((m, i) => (
            <Card key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 12, color: C.text.tri, marginBottom: 8 }}>{m.label}</div>
                  <div style={{ display: "flex", alignItems: "baseline" }}>
                    <N size={32}>{m.value}</N>
                    <Delta value={m.delta} good={m.good} />
                  </div>
                  {m.sub && <div style={{ fontSize: 11, color: C.text.tri, marginTop: 4 }}>{m.sub}</div>}
                </div>
                <Spark data={m.spark} w={80} h={28} color={m.sparkColor} />
              </div>
            </Card>
          ))}
        </div>

        {/* === Row 2: 任务执行质量 + 任务结果分布 (merged into one card, no duplication) === */}
        <Card style={{ marginBottom: 14 }}>
          <Title>任务执行质量</Title>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
            {[
              { label: "输出准确率", value: d.quality.outputAccuracy, unit: "%", color: C.green, max: 100 },
              { label: "工具调用成功率", value: d.quality.toolCallSuccess, unit: "%", color: C.blue, max: 100 },
              { label: "幻觉率", value: d.quality.hallucinationRate, unit: "%", color: C.orange, max: 10, invert: true },
              { label: "重试率", value: d.quality.retryRate, unit: "%", color: C.orange, max: 20, invert: true },
            ].map((m, i) => (
              <div key={i} style={{ padding: "14px 16px", background: C.bg, borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: C.text.sec }}>{m.label}</span>
                  <N size={18} color={m.invert ? (m.value > 5 ? C.red : C.text.pri) : m.color}>{m.value}{m.unit}</N>
                </div>
                <Bar value={m.invert ? m.max - m.value : m.value} max={m.max} color={m.color} h={4} />
              </div>
            ))}
          </div>

          {/* Task result distribution */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
            <div style={{ fontSize: 12, color: C.text.tri, marginBottom: 8 }}>今日任务结果分布</div>
            <StackedBar segments={[
              { value: d.taskDistribution.success, color: C.green },
              { value: d.taskDistribution.partial, color: C.blue },
              { value: d.taskDistribution.failed, color: C.red },
              { value: d.taskDistribution.humanTakeover, color: C.orange },
            ]} h={10} />
            <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
              {[
                { label: "成功", count: d.taskDistribution.success, color: C.green },
                { label: "部分成功", count: d.taskDistribution.partial, color: C.blue },
                { label: "失败", count: d.taskDistribution.failed, color: C.red },
                { label: "人工接管", count: d.taskDistribution.humanTakeover, color: C.orange },
              ].map(x => (
                <div key={x.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.text.sec }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: x.color }} />
                  {x.label} <span style={{ fontWeight: 600, color: C.text.pri }}>{x.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* === Row 3: 系统可靠性 + 协作效能 === */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {/* 系统可靠性 */}
          <Card>
            <Title>系统可靠性</Title>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
                  <span style={{ fontSize: 11, color: C.text.tri }}>服务可用率</span>
                </div>
                <N size={32}>{d.reliability.availability}</N>
              </div>
              <div style={{ textAlign: "right" }}>
                <Tag text={`连续无故障 ${d.reliability.uptimeDays}`} color={C.green} />
                <div style={{ fontSize: 11, color: C.text.tri, marginTop: 6 }}>上次故障: {d.reliability.lastIncident}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "错误率", value: `${d.reliability.errorRate}%`, color: C.red, pct: d.reliability.errorRate, max: 5 },
                { label: "超时率", value: `${d.reliability.timeoutRate}%`, color: C.orange, pct: d.reliability.timeoutRate, max: 5 },
                { label: "平均恢复时间", value: d.reliability.meanRecovery, color: C.teal, pct: 47, max: 120 },
              ].map((m, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: C.text.tri, marginBottom: 4 }}>{m.label}</div>
                  <N size={18} color={m.color}>{m.value}</N>
                  <div style={{ marginTop: 4 }}><Bar value={m.pct} max={m.max} color={m.color} h={3} /></div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              <div style={{ fontSize: 11, color: C.text.tri, marginBottom: 6 }}>错误类型分布</div>
              <StackedBar segments={d.reliability.errorTypes.map(e => ({ value: e.pct, color: e.color }))} h={8} />
              <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                {d.reliability.errorTypes.map(e => (
                  <span key={e.name} style={{ fontSize: 11, color: C.text.sec }}>
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: e.color, marginRight: 4 }} />
                    {e.name} {e.pct}%
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* 协作效能 */}
          <Card>
            <Title>协作效能</Title>

            {/* Health bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: C.text.sec }}>协作健康度</span>
                <N size={16} color={C.green}>{d.collaboration.health}%</N>
              </div>
              <Bar value={d.collaboration.health} color={C.green} h={8} />
            </div>

            {/* Sub-metrics */}
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              {[
                { label: "任务完成率", value: `${d.collaboration.taskCompletion}%`, color: C.green },
                { label: "消息送达率", value: `${d.collaboration.messageDelivery}%`, color: C.blue },
                { label: "目标对齐度", value: `${d.collaboration.goalAlignment}%`, color: d.collaboration.goalAlignment < 85 ? C.orange : C.green },
              ].map(m => (
                <div key={m.label} style={{ flex: 1, padding: "8px 12px", background: C.bg, borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: C.text.tri, marginBottom: 3 }}>{m.label}</div>
                  <N size={14} color={m.color}>{m.value}</N>
                </div>
              ))}
            </div>

            {/* Funnel */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: C.text.tri, marginBottom: 8 }}>工作流转化漏斗</div>
              <Funnel steps={d.collaboration.funnel} />
            </div>

            {/* Bottlenecks */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              <div style={{ fontSize: 12, color: C.text.tri, marginBottom: 8 }}>瓶颈智能体</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {d.collaboration.bottlenecks.map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: C.bg, borderRadius: 6 }}>
                    <span style={{ fontSize: 12, color: C.text.pri }}>{b.name}</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <N size={14}>{b.latency}</N>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.red }}>{b.delta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* === Row 4: 智能体执行排行 + 任务执行流水 === */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 14 }}>
          {/* Agent Ranking */}
          <Card>
            <Title extra={<Tabs items={["成功率", "效率", "质量"]} value={rankBy} onChange={setRankBy} />}>
              智能体执行排行
            </Title>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {d.agentRanking.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: i < 2 ? "#fff" : C.text.sec,
                    background: i < 2 ? C.accent : "#eef0f4",
                  }}>{i + 1}</span>
                  <span style={{
                    width: 22, height: 22, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "#fff", background: C.teal,
                  }}>{a.tag}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{a.name}</div>
                    <Bar value={a.rate} color={C.green} h={4} />
                  </div>
                  <N size={14} color={C.green}>{a.rate}%</N>
                  <span style={{ fontSize: 11, color: C.text.tri, minWidth: 56, textAlign: "right" }}>{a.tasks} 任务</span>
                  {trendArrow(a.trend)}
                </div>
              ))}
            </div>
          </Card>

          {/* Task Feed */}
          <Card>
            <Title extra={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Tabs items={["全部", "成功", "失败", "进行中"]} value={feedFilter} onChange={setFeedFilter} />
                <span style={{ fontSize: 12, color: C.text.tri }}>今日 <N size={13}>{d.taskFeed.length > 900 ? 922 : d.taskFeed.length}</N> 任务</span>
              </div>
            }>
              任务执行流水
            </Title>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {d.taskFeed.map((t, i) => {
                const isVisible = feedFilter === "全部" ||
                  (feedFilter === "成功" && t.status === "success") ||
                  (feedFilter === "失败" && t.status === "failed") ||
                  (feedFilter === "进行中" && t.status === "running");
                return (
                  <div key={i} style={{
                    maxHeight: isVisible ? 80 : 0,
                    opacity: isVisible ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.25s ease, opacity 0.2s ease",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "12px 0",
                      borderBottom: `1px solid ${C.border}`,
                    }}>
                      <div style={{ marginTop: 2 }}>{statusIcon(t.status)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</span>
                          <span style={{ fontSize: 11, color: C.text.tri }}>#{t.id}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, color: C.text.sec }}>{t.agent}</span>
                          {t.tags.map(tag => (
                            <span key={tag} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "#eef0f4", color: C.text.sec }}>{tag}</span>
                          ))}
                          {t.error && <Tag text={t.error} color={C.red} />}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: C.text.sec, whiteSpace: "nowrap" }}>
                        <span style={{ width: 40, textAlign: "right", fontWeight: 500, color: C.text.pri }}>{t.latency}</span>
                        <span style={{ width: 40, textAlign: "right" }}>{t.tokens}</span>
                        <span style={{ width: 56, textAlign: "right", color: C.text.tri }}>{t.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
      `}</style>
    </div>
  );
}
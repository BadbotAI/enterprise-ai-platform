import { useState, useRef, useEffect } from "react";

// === Mock Data ===
const MOCK_DATA = {
  globalStatus: "运行中",
  weakestLayer: "L2",
  primaryThreat: "消息篡改",
  agentStats: { total: 40, online: 32, offline: 4, abnormal: 4 },
  alertStats: { total: 47, info: 23, warning: 18, critical: 6 },
  alertRate: 2.3,
  layers: {
    L1: {
      label: "单智能体风险",
      summary: "8 类风险监控中",
      activeRisks: 3,
      totalRisks: 8,
      topRisks: [
        { name: "提示词注入", count: 12, severity: "严重" },
        { name: "敏感信息泄露", count: 5, severity: "警告" },
        { name: "过度代理", count: 3, severity: "提示" },
      ],
      attackPattern: "注入攻击",
      intensity: "激进",
      defenseRate: 91,
      blocked: 142,
      total: 156,
    },
    L2: {
      label: "多智能体交互风险",
      summary: "6 类风险监控中",
      activeRisks: 4,
      totalRisks: 6,
      topRisks: [
        { name: "消息篡改", count: 8, severity: "严重" },
        { name: "恶意传播", count: 6, severity: "警告" },
        { name: "目标漂移", count: 4, severity: "警告" },
        { name: "身份伪造", count: 2, severity: "提示" },
      ],
      attackPattern: "传播攻击",
      intensity: "探测",
      defenseRate: 73,
      blocked: 89,
      total: 122,
    },
    L3: {
      label: "系统级风险",
      summary: "6 类风险监控中",
      activeRisks: 1,
      totalRisks: 6,
      topRisks: [
        { name: "监控不足", count: 1, severity: "提示" },
      ],
      attackPattern: "无",
      intensity: "无",
      defenseRate: 95,
      blocked: 201,
      total: 212,
    },
  },
  attackPhase: {
    current: 2,
    phases: ["空闲", "探测", "初始入侵", "建立据点", "权限提升", "达成目标"],
  },
  attackTempo: "间歇性",
  riskTrend: {
    velocity: 2.3,
    forecast: "上升中",
    data: [42, 38, 45, 40, 48, 52, 55, 50, 58, 62, 65, 60, 68, 72, 75, 70, 65, 68, 72, 78],
  },
  alertDensity: {
    current: [0.8, 1.0, 0.9, 1.2, 0.8, 0.7, 1.5, 2.0, 1.8, 3.2, 2.8, 2.3],
  },
  vulnerabilityRanking: [
    { name: "学术影响力评估", score: 78, trend: "rising", risk: "提示词注入" },
    { name: "跨领域专家发现", score: 65, trend: "rising", risk: "恶意传播" },
    { name: "论文专家匹配", score: 52, trend: "stable", risk: "消息篡改" },
    { name: "学者画像分析", score: 41, trend: "falling", risk: "数据外传" },
    { name: "合作网络构建", score: 33, trend: "stable", risk: "过度代理" },
  ],
  problemAgents: [
    { name: "学术影响力评估智能体", status: "已入侵", alerts: 12, desc: "检测到异常数据外传模式，近1小时内产生大量敏感查询" },
    { name: "评审专家推荐智能体", status: "失控", alerts: 8, desc: "行为偏离预设策略阈值，自主发起未授权任务" },
    { name: "学者合作网络分析智能体", status: "异常", alerts: 5, desc: "响应延迟异常波动，通信模式偏离基线" },
    { name: "机构人才图谱智能体", status: "高风险", alerts: 3, desc: "权限配置存在提权漏洞，需紧急修复" },
  ],
  trustDistribution: [
    { x: 72, y: 80, size: 18, level: "可信" },
    { x: 85, y: 65, size: 14, level: "可信" },
    { x: 60, y: 75, size: 22, level: "可信" },
    { x: 90, y: 50, size: 10, level: "可信" },
    { x: 45, y: 55, size: 16, level: "可疑" },
    { x: 35, y: 40, size: 20, level: "可疑" },
    { x: 50, y: 30, size: 12, level: "可疑" },
    { x: 20, y: 25, size: 24, level: "不可信" },
    { x: 15, y: 60, size: 15, level: "不可信" },
    { x: 78, y: 42, size: 11, level: "可信" },
    { x: 65, y: 88, size: 13, level: "可信" },
    { x: 55, y: 68, size: 17, level: "可疑" },
    { x: 82, y: 78, size: 9, level: "可信" },
    { x: 30, y: 15, size: 19, level: "不可信" },
    { x: 42, y: 70, size: 15, level: "可疑" },
    { x: 88, y: 85, size: 12, level: "可信" },
    { x: 70, y: 55, size: 16, level: "可信" },
    { x: 25, y: 48, size: 14, level: "不可信" },
    { x: 48, y: 82, size: 11, level: "可疑" },
    { x: 92, y: 72, size: 8, level: "可信" },
  ],
  propagationChains: [
    { from: "提示词注入", via: "恶意传播", to: "级联失败", probability: 0.35 },
    { from: "越狱攻击", via: "身份伪造", to: "叛逆智能体", probability: 0.22 },
    { from: "幻觉生成", via: "错误信息放大", to: "群体幻觉", probability: 0.18 },
  ],
  alerts: [
    { level: "L1", title: "高危注入攻击检测", tag: "提示词注入", severity: "严重", time: "1分钟前", desc: "学术影响力评估智能体 检测到持续性提示词注入攻击序列" },
    { level: "L2", title: "消息篡改告警", tag: "消息篡改", severity: "警告", time: "3分钟前", desc: "跨领域专家发现智能体 与 论文专家匹配智能体 间通信内容完整性校验失败" },
    { level: "L1", title: "数据外传风险", tag: "数据外传", severity: "警告", time: "5分钟前", desc: "学术影响力评估智能体 查询频率异常升高，疑似数据采集行为" },
    { level: "L3", title: "系统健康检查完成", tag: "系统监控", severity: "提示", time: "8分钟前", desc: "全部沙箱环境运行正常，资源利用率在合理范围" },
    { level: "L2", title: "协作目标偏移检测", tag: "目标漂移", severity: "警告", time: "12分钟前", desc: "评审专家推荐智能体 协作输出与预设目标偏离度超过阈值" },
    { level: "L1", title: "工具调用异常", tag: "工具滥用", severity: "提示", time: "15分钟前", desc: "学者画像分析智能体 在非授权时段调用外部API" },
  ],
  executionMetrics: {
    throughput: 142,
    p95Latency: 8.7,
    queueWait: 0.8,
    concurrency: 67,
  },
};

// === Color System ===
const C = {
  bg: "#f5f6f8",
  card: "#ffffff",
  border: "#e8eaef",
  text: { pri: "#1c1f26", sec: "#6c7489", tri: "#a0a7b8" },
  layer: {
    L1: { main: "#5e8fb8", light: "#edf3f9", border: "#cddcea" },
    L2: { main: "#8b72b0", light: "#f1edf8", border: "#d8cfe8" },
    L3: { main: "#b8706e", light: "#f9edec", border: "#e8d0cf" },
  },
  sev: { info: "#6e96b8", warning: "#b89a6e", critical: "#b86e6e" },
  status: { safe: "#6eaa7c", medium: "#b8a86e", high: "#b88a6e", critical: "#b86e6e" },
  trust: { trusted: "#4a5568", suspicious: "#6e96b8", untrusted: "#b87070" },
  accent: "#4e6e96",
};

// === Primitives ===
const Card = ({ children, style = {} }) => (
  <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, ...style }}>{children}</div>
);
const CardTitle = ({ children, extra }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
    <span style={{ fontSize: 13, fontWeight: 600, color: C.text.pri, letterSpacing: "0.01em" }}>{children}</span>
    {extra}
  </div>
);
const LayerBadge = ({ layer }) => {
  const lc = C.layer[layer];
  return <span style={{ display: "inline-flex", padding: "2px 7px", borderRadius: 4, fontSize: 11, fontWeight: 600, color: lc.main, background: lc.light, border: `1px solid ${lc.border}` }}>{layer}</span>;
};
const Tag = ({ text, color }) => (
  <span style={{ display: "inline-flex", padding: "2px 9px", borderRadius: 4, fontSize: 11, fontWeight: 600, color, background: `${color}0e`, border: `1px solid ${color}1e` }}>{text}</span>
);
const Trend = ({ d }) => {
  if (d === "rising") return <span style={{ color: C.sev.critical, fontSize: 12 }}>↗</span>;
  if (d === "falling") return <span style={{ color: C.status.safe, fontSize: 12 }}>↘</span>;
  return <span style={{ color: C.text.tri, fontSize: 12 }}>—</span>;
};
const Bar = ({ value, max = 100, color, h = 5 }) => (
  <div style={{ flex: 1, height: h, background: "#eef0f4", borderRadius: h / 2, overflow: "hidden" }}>
    <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color, borderRadius: h / 2, transition: "width 0.5s ease" }} />
  </div>
);
const Num = ({ children, size = 28 }) => (
  <span style={{ fontSize: size, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", lineHeight: 1, color: C.text.pri }}>{children}</span>
);
const Spark = ({ data, w = 120, h = 28, color = C.accent, fill = false }) => {
  const mx = Math.max(...data), mn = Math.min(...data), r = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / r) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      {fill && <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`${color}12`} />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
};

// === Date Picker ===
const DatePicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("preset");
  const [startDate, setStartDate] = useState("2025-03-11");
  const [endDate, setEndDate] = useState("2025-03-11");
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const presets = [
    { label: "实时", value: "实时" },
    { label: "近30分钟", value: "近30分钟" },
    { label: "近1小时", value: "近1小时" },
    { label: "近6小时", value: "近6小时" },
    { label: "今日", value: "今日" },
    { label: "昨日", value: "昨日" },
    { label: "近7天", value: "近7天" },
    { label: "近30天", value: "近30天" },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8,
        border: `1px solid ${open ? C.accent : C.border}`, background: open ? `${C.accent}08` : "#fff",
        cursor: "pointer", fontSize: 13, color: C.text.pri, fontFamily: "inherit",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text.sec} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span style={{ fontWeight: 500 }}>{value}</span>
        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 4L5 7L8 4" stroke={C.text.tri} strokeWidth="1.5" fill="none"/></svg>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 200,
          background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)", width: 340, overflow: "hidden",
        }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
            {[["preset", "快捷选择"], ["custom", "自定义日期"]].map(([m, label]) => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: 10, fontSize: 12, fontWeight: mode === m ? 600 : 400,
                color: mode === m ? C.accent : C.text.sec, background: "transparent", border: "none",
                cursor: "pointer", borderBottom: mode === m ? `2px solid ${C.accent}` : "2px solid transparent",
                fontFamily: "inherit",
              }}>{label}</button>
            ))}
          </div>
          {mode === "preset" ? (
            <div style={{ padding: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {presets.map(p => (
                <button key={p.value} onClick={() => { onChange(p.value); setOpen(false); }} style={{
                  padding: "6px 16px", borderRadius: 6, fontSize: 12, fontFamily: "inherit",
                  border: `1px solid ${value === p.value ? C.accent : C.border}`,
                  background: value === p.value ? `${C.accent}0c` : "transparent",
                  color: value === p.value ? C.accent : C.text.sec,
                  fontWeight: value === p.value ? 600 : 400, cursor: "pointer",
                }}>{p.label}</button>
              ))}
            </div>
          ) : (
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.text.tri, marginBottom: 4 }}>开始日期</div>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{
                    width: "100%", padding: "7px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
                    fontSize: 12, fontFamily: "inherit", color: C.text.pri, outline: "none",
                  }} />
                </div>
                <span style={{ color: C.text.tri, marginTop: 16 }}>至</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.text.tri, marginBottom: 4 }}>结束日期</div>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{
                    width: "100%", padding: "7px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
                    fontSize: 12, fontFamily: "inherit", color: C.text.pri, outline: "none",
                  }} />
                </div>
              </div>
              <button onClick={() => { onChange(`${startDate} 至 ${endDate}`); setOpen(false); }} style={{
                width: "100%", padding: 8, borderRadius: 6, background: C.accent, color: "#fff",
                border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>确认</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// === Phase Stepper ===
const PhaseStepper = ({ phases, current }) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    {phases.map((p, i) => {
      const isActive = i === current, isPast = i < current;
      return (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            padding: "5px 12px", borderRadius: 5, fontSize: 12,
            fontWeight: isActive ? 700 : 500,
            color: isActive ? "#fff" : isPast ? C.accent : C.text.tri,
            background: isActive ? C.accent : isPast ? `${C.accent}10` : "transparent",
            border: `1px solid ${isActive ? C.accent : isPast ? `${C.accent}22` : "#e3e5ea"}`,
            whiteSpace: "nowrap",
          }}>{p}</div>
          {i < phases.length - 1 && <div style={{ width: 14, height: 1, background: isPast ? `${C.accent}60` : "#e3e5ea" }} />}
        </div>
      );
    })}
  </div>
);

// === Layer Overview (system-level, no score ring) ===
const LayerOverview = ({ layer, data }) => {
  const lc = C.layer[layer];
  const sevColor = (s) => s === "严重" ? C.sev.critical : s === "警告" ? C.sev.warning : C.sev.info;
  return (
    <div style={{ borderTop: `3px solid ${lc.main}`, padding: 20, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LayerBadge layer={layer} />
          <span style={{ fontSize: 12, fontWeight: 500, color: C.text.sec }}>{data.label}</span>
        </div>
        <span style={{ fontSize: 11, color: C.text.tri }}>{data.summary}</span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
        <Num size={22}>{data.activeRisks}</Num>
        <span style={{ fontSize: 11, color: C.text.tri }}>/ {data.totalRisks} 类风险活跃</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
        {data.topRisks.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: sevColor(r.severity), flexShrink: 0 }} />
            <span style={{ color: C.text.pri, flex: 1 }}>{r.name}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.text.sec }}>{r.count}</span>
            <Tag text={r.severity} color={sevColor(r.severity)} />
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: C.text.tri }}>攻击模式 <span style={{ fontWeight: 600, color: lc.main }}>{data.attackPattern}</span></span>
          <span style={{ fontSize: 11, color: C.text.tri }}>强度 <span style={{ fontWeight: 600, color: C.text.pri }}>{data.intensity}</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: C.text.tri, whiteSpace: "nowrap" }}>防御率</span>
          <Bar value={data.defenseRate} color={lc.main} />
          <span style={{ fontSize: 12, fontWeight: 600, color: lc.main, whiteSpace: "nowrap" }}>{data.defenseRate}%</span>
        </div>
        <div style={{ fontSize: 10, color: C.text.tri, marginTop: 2, textAlign: "right" }}>拦截 {data.blocked} / 总计 {data.total}</div>
      </div>
    </div>
  );
};

// === Trust Scatter ===
const TrustScatter = ({ data }) => {
  const w = 240, h = 150;
  return (
    <div>
      <svg width={w} height={h} style={{ display: "block" }}>
        {data.map((d, i) => (
          <circle key={i} cx={(d.x / 100) * w} cy={h - (d.y / 100) * h} r={d.size / 3.5}
            fill={C.trust[d.level === "可信" ? "trusted" : d.level === "可疑" ? "suspicious" : "untrusted"]} opacity={0.55} />
        ))}
      </svg>
      <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
        {[{ l: "可信", n: 26, c: C.trust.trusted }, { l: "可疑", n: 10, c: C.trust.suspicious }, { l: "不可信", n: 4, c: C.trust.untrusted }].map(i => (
          <div key={i.l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.text.sec }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: i.c, opacity: 0.6 }} />
            {i.l} <span style={{ fontWeight: 600, color: C.text.pri }}>{i.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// === Propagation Flow ===
const PropagationFlow = ({ chains }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {chains.map((ch, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: C.bg, borderRadius: 8 }}>
        <LayerBadge layer="L1" />
        <span style={{ fontSize: 12, fontWeight: 600, color: C.layer.L1.main }}>{ch.from}</span>
        <span style={{ color: C.text.tri }}>→</span>
        <LayerBadge layer="L2" />
        <span style={{ fontSize: 12, fontWeight: 600, color: C.layer.L2.main }}>{ch.via}</span>
        <span style={{ color: C.text.tri }}>→</span>
        <LayerBadge layer="L3" />
        <span style={{ fontSize: 12, fontWeight: 600, color: C.layer.L3.main }}>{ch.to}</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: C.text.tri, background: "#fff", padding: "2px 8px", borderRadius: 4, border: `1px solid ${C.border}` }}>
          {Math.round(ch.probability * 100)}%
        </span>
      </div>
    ))}
  </div>
);

// ====== MAIN ======
export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("实时");
  const [alertLayerFilter, setAlertLayerFilter] = useState("全部");
  const [alertSevFilter, setAlertSevFilter] = useState("全部");
  const d = MOCK_DATA;

  const filteredAlerts = d.alerts.filter(a => {
    if (alertLayerFilter !== "全部" && a.level !== alertLayerFilter) return false;
    if (alertSevFilter !== "全部" && a.severity !== alertSevFilter) return false;
    return true;
  });

  const sevColor = (s) => s === "严重" ? C.sev.critical : s === "警告" ? C.sev.warning : C.sev.info;
  const probColor = (s) => s === "已入侵" ? C.sev.critical : s === "失控" ? "#a05252" : s === "异常" ? C.sev.warning : C.status.high;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'PingFang SC','Noto Sans SC','Helvetica Neue',sans-serif", color: C.text.pri }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 28px", background: "#fff", borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.status.safe, boxShadow: `0 0 6px ${C.status.safe}50` }} />
          <span style={{ fontSize: 15, fontWeight: 700 }}>智能体运行监控中心</span>
          <span style={{ fontSize: 11, color: C.text.tri, marginLeft: 4 }}>{d.globalStatus}</span>
        </div>
        <DatePicker value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Agent Summary Strip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 24, padding: "10px 28px",
        background: "#fff", borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: C.text.tri }}>智能体总数</span>
          <Num size={18}>{d.agentStats.total}</Num>
        </div>
        <div style={{ width: 1, height: 16, background: C.border }} />
        {[
          { label: "在线", count: d.agentStats.online, color: C.status.safe },
          { label: "离线", count: d.agentStats.offline, color: C.text.tri },
          { label: "异常", count: d.agentStats.abnormal, color: C.sev.critical },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color }} />
            <span style={{ fontSize: 12, color: C.text.sec }}>{item.label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text.pri }}>{item.count}</span>
          </div>
        ))}
        <div style={{ width: 1, height: 16, background: C.border }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 12, color: C.text.tri }}>在线率</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.status.safe }}>
            {Math.round((d.agentStats.online / d.agentStats.total) * 100)}%
          </span>
        </div>
      </div>

      <div style={{ padding: "18px 28px", maxWidth: 1440, margin: "0 auto" }}>
        {/* Row 1: L1/L2/L3 + Alert Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 14, marginBottom: 14 }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", height: "100%" }}>
              {["L1", "L2", "L3"].map((layer, idx) => (
                <div key={layer} style={{ borderRight: idx < 2 ? `1px solid ${C.border}` : "none" }}>
                  <LayerOverview layer={layer} data={d.layers[layer]} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>报警统计</CardTitle>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
              <Num size={34}>{d.alertStats.total}</Num>
              <span style={{ fontSize: 12, color: C.text.tri }}>报警总数</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "提示", count: d.alertStats.info, color: C.sev.info },
                { label: "警告", count: d.alertStats.warning, color: C.sev.warning },
                { label: "严重", count: d.alertStats.critical, color: C.sev.critical },
              ].map(i => (
                <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: i.color }} />
                  <span style={{ fontSize: 12, color: C.text.sec, width: 28 }}>{i.label}</span>
                  <Bar value={i.count} max={d.alertStats.total} color={i.color} />
                  <span style={{ fontSize: 13, fontWeight: 600, width: 22, textAlign: "right" }}>{i.count}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <Num size={20}>{d.alertRate}</Num>
              <span style={{ fontSize: 11, color: C.text.tri }}>条/分钟</span>
              <Spark data={[1.2, 1.4, 1.1, 1.8, 2.0, 1.6, 2.3, 2.1, 2.5, 2.3]} w={60} h={18} color={C.sev.warning} />
            </div>
          </Card>
        </div>

        {/* Row 2: Attack Phase + Risk Trend */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <Card>
            <CardTitle>攻击生命周期</CardTitle>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: C.text.sec, marginBottom: 8 }}>当前阶段</div>
              <PhaseStepper phases={d.attackPhase.phases} current={d.attackPhase.current} />
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <div style={{ fontSize: 11, color: C.text.tri, marginBottom: 3 }}>攻击节奏</div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{d.attackTempo}</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.text.tri, marginBottom: 3 }}>节奏可视化</div>
                <svg width={130} height={22}>
                  {[0,1,0,1,1,0,0,1,0,1,0,0,0,1,1,0,1,0,0,1].map((v, i) => (
                    <rect key={i} x={i * 6.5} y={v ? 3 : 9} width={4.5} height={v ? 16 : 4} rx={2}
                      fill={v ? C.accent : "#dfe1e6"} opacity={v ? 0.65 : 0.35} />
                  ))}
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <CardTitle>风险趋势</CardTitle>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: C.sev.critical, fontSize: 12 }}>↗</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.sev.critical }}>+{d.riskTrend.velocity}/分钟</span>
                <span style={{ fontSize: 11, color: C.text.tri }}>{d.riskTrend.forecast}</span>
              </div>
            </div>
            <Spark data={d.riskTrend.data} w={560} h={70} color={C.accent} fill={true} />
            <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
              <div style={{ fontSize: 11, color: C.text.tri, marginBottom: 4 }}>报警密度 对比 基线</div>
              <div style={{ position: "relative" }}>
                <Spark data={d.alertDensity.current} w={560} h={36} color={C.sev.warning} />
                <svg width={560} height={36} style={{ position: "absolute", top: 0, left: 0 }}>
                  <line x1={0} y1={24} x2={560} y2={24} stroke={C.sev.critical} strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Row 3: Vulnerability + Problem Agents + Trust */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: 14, marginBottom: 14 }}>
          <Card>
            <CardTitle>脆弱性排行</CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {d.vulnerabilityRanking.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 600, color: i < 2 ? "#fff" : C.text.sec,
                    background: i < 2 ? C.accent : "#eef0f4",
                  }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                    <div style={{ marginTop: 3 }}><Bar value={a.score} color={a.score >= 70 ? C.sev.critical : a.score >= 50 ? C.sev.warning : C.sev.info} /></div>
                  </div>
                  <Num size={14}>{a.score}</Num>
                  <Trend d={a.trend} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>问题智能体检测</CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {d.problemAgents.map((a, i) => (
                <div key={i} style={{ padding: "11px 12px", background: C.bg, borderRadius: 8, borderLeft: `3px solid ${probColor(a.status)}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Tag text={a.status} color={probColor(a.status)} />
                      <span style={{ fontSize: 11, color: C.text.tri }}>{a.alerts} 报警</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.text.sec, lineHeight: 1.5 }}>{a.desc}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>信任度分布</CardTitle>
            <TrustScatter data={d.trustDistribution} />
          </Card>
        </div>

        {/* Row 4: Propagation + Execution */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 14 }}>
          <Card>
            <CardTitle>风险传播链</CardTitle>
            <PropagationFlow chains={d.propagationChains} />
            <div style={{ marginTop: 12, padding: "10px 12px", background: C.bg, borderRadius: 8, display: "flex", gap: 24 }}>
              {[
                { l: "L1→L2 升级概率", v: "35%" },
                { l: "L2→L3 升级概率", v: "18%" },
                { l: "L1→L3 跳级概率", v: "8%" },
              ].map(i => (
                <div key={i.l}>
                  <div style={{ fontSize: 10, color: C.text.tri, marginBottom: 2 }}>{i.l}</div>
                  <Num size={16}>{i.v}</Num>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>执行效率</CardTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { l: "吞吐量", v: d.executionMetrics.throughput, u: "任务/小时", t: "rising" },
                { l: "P95 延迟", v: d.executionMetrics.p95Latency, u: "秒", t: "stable" },
                { l: "队列等待", v: d.executionMetrics.queueWait, u: "秒", t: "falling" },
                { l: "并发利用率", v: d.executionMetrics.concurrency, u: "%", t: "stable" },
              ].map(m => (
                <div key={m.l} style={{ padding: "12px", background: C.bg, borderRadius: 8, borderLeft: `3px solid ${C.accent}` }}>
                  <div style={{ fontSize: 11, color: C.text.tri, marginBottom: 5 }}>{m.l}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <Num size={20}>{m.v}</Num>
                    <span style={{ fontSize: 11, color: C.text.tri }}>{m.u}</span>
                    <Trend d={m.t} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Row 5: Alerts */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>实时报警</span>
              <div style={{ display: "flex", gap: 4 }}>
                {["全部", "L1", "L2", "L3"].map(f => (
                  <button key={f} onClick={() => setAlertLayerFilter(f)} style={{
                    padding: "3px 10px", borderRadius: 4, fontSize: 12, fontFamily: "inherit",
                    border: `1px solid ${alertLayerFilter === f ? C.accent : "#e3e5ea"}`,
                    background: alertLayerFilter === f ? `${C.accent}0a` : "transparent",
                    color: alertLayerFilter === f ? C.accent : C.text.sec,
                    fontWeight: alertLayerFilter === f ? 600 : 400, cursor: "pointer",
                  }}>{f}</button>
                ))}
              </div>
              <div style={{ width: 1, height: 14, background: "#e3e5ea" }} />
              <div style={{ display: "flex", gap: 4 }}>
                {["全部", "提示", "警告", "严重"].map(f => (
                  <button key={f} onClick={() => setAlertSevFilter(f)} style={{
                    padding: "3px 10px", borderRadius: 4, fontSize: 12, fontFamily: "inherit",
                    border: `1px solid ${alertSevFilter === f ? C.accent : "#e3e5ea"}`,
                    background: alertSevFilter === f ? `${C.accent}0a` : "transparent",
                    color: alertSevFilter === f ? C.accent : C.text.sec,
                    fontWeight: alertSevFilter === f ? 600 : 400, cursor: "pointer",
                  }}>{f}</button>
                ))}
              </div>
            </div>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              minWidth: 22, height: 22, borderRadius: 11, padding: "0 6px",
              background: `${C.sev.critical}10`, color: C.sev.critical, fontSize: 11, fontWeight: 700,
            }}>{filteredAlerts.length}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {d.alerts.map((a, i) => {
              const isVisible = (alertLayerFilter === "全部" || a.level === alertLayerFilter) &&
                                (alertSevFilter === "全部" || a.severity === alertSevFilter);
              return (
                <div key={i} style={{
                  maxHeight: isVisible ? 100 : 0,
                  opacity: isVisible ? 1 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.25s ease, opacity 0.2s ease, margin 0.25s ease",
                  marginBottom: isVisible ? 6 : 0,
                }}>
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "12px 14px", background: C.bg, borderRadius: 8,
                    borderLeft: `3px solid ${C.layer[a.level]?.main || C.text.tri}`,
                  }}>
                    <LayerBadge layer={a.level} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</span>
                        <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: "#eef0f4", color: C.text.sec }}>{a.tag}</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.text.sec, lineHeight: 1.5 }}>{a.desc}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, whiteSpace: "nowrap" }}>
                      <Tag text={a.severity} color={sevColor(a.severity)} />
                      <span style={{ fontSize: 11, color: C.text.tri }}>{a.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredAlerts.length === 0 && (
              <div style={{ padding: "24px 0", textAlign: "center", fontSize: 12, color: C.text.tri }}>
                当前筛选条件下无报警记录
              </div>
            )}
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
      `}</style>
    </div>
  );
}
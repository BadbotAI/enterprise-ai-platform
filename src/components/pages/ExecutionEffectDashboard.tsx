import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, RotateCcw, Info, Database, HardDrive, Layers, Target, CheckCircle2, Clock } from 'lucide-react';
import { TimeRangePicker, type TimeRangePreset } from '../TimeRangePicker';

// ═══════════════════════════════════════════════════════════════
// Color System
// ═══════════════════════════════════════════════════════════════
const C = {
  bg: '#f0f2f5',
  card: 'rgba(255,255,255,0.72)',
  border: '#e2e8f0',
  text: { pri: '#0d1b2a', sec: '#4a5b73', tri: '#7d8da1', qua: '#a3b1c6' },
  blue: '#2563eb',
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
};

// ═══════════════════════════════════════════════════════════════
// Dataset Categories
// ═══════════════════════════════════════════════════════════════
const DATASET_CATEGORIES = [
  { name: '采销服务专识数据集', count: 5, color: C.blue },
  { name: '采销服务通识数据集', count: 6, color: '#3b82f6' },
  { name: '仓储服务专识数据集', count: 3, color: C.green },
  { name: '仓储服务通识数据集', count: 5, color: '#34d399' },
  { name: '运输服务专识数据集', count: 3, color: C.purple },
  { name: '运输服务通识数据集', count: 4, color: '#a78bfa' },
  { name: '风险控制专识数据集', count: 4, color: C.yellow },
  { name: '风险控制通识数据集', count: 3, color: '#fbbf24' },
  { name: '生态服务专识数据集', count: 3, color: C.teal },
  { name: '生态服务通识数据集', count: 3, color: C.red },
  { name: '评测数据集', count: 2, color: '#6366f1' },
];

// ═══════════════════════════════════════════════════════════════
// Agents list (from 我的智能体 — published + installed)
// ═══════════════════════════════════════════════════════════════
const AGENTS = [
  { name: '信用智能体', color: C.blue },
  { name: '舆情智能体', color: '#3b82f6' },
  { name: '粮食产量预测智能体', color: C.green },
  { name: '粮食价格预测智能体', color: '#34d399' },
  { name: '国际干散货海运运价研报智能体', color: C.purple },
  { name: '库存智能分析智能体', color: '#a78bfa' },
  { name: '进口大豆装港风险预警智能体', color: C.yellow },
  { name: '价格预测智能体', color: C.red },
  { name: '供应分析智能体', color: '#f87171' },
  { name: '供需平衡智能体', color: '#fbbf24' },
  { name: '公路段货找车智能体', color: C.teal },
  { name: '公路段车找货智能体', color: '#2dd4bf' },
  { name: '全球气象智能体', color: '#6366f1' },
  { name: '信息监测智能体', color: '#818cf8' },
  { name: '粮食气象智能体', color: '#06b6d4' },
  { name: '港口气象智能体', color: '#22d3ee' },
  { name: '信息分析智能体', color: '#f472b6' },
  { name: '信息报告智能体', color: '#e879f9' },
];

const CHANNELS = [
  { name: '智能体调试', color: C.blue },
  { name: 'API调用', color: C.green },
  { name: '网页访问', color: C.purple },
];

// ═══════════════════════════════════════════════════════════════
// Mock Data: time series (14 points for charts)
// ═══════════════════════════════════════════════════════════════
const LABELS_14 = ['03/10', '03/11', '03/12', '03/13', '03/14', '03/15', '03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22', '03/23'];
const TIME_LABELS_14: Record<string, string[]> = {
  today: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '17:00', '18:00', '20:00', '22:00', '23:00'],
  '7d': LABELS_14,
  '30d': ['02/22', '02/24', '02/26', '02/28', '03/02', '03/05', '03/08', '03/10', '03/13', '03/15', '03/17', '03/19', '03/21', '03/23'],
  custom: LABELS_14,
};

const DATA = {
  // Tokens total trend: Total / Input / Output (K)
  tokensTotalTrend: {
    total:  [128, 135, 142, 138, 151, 147, 156, 162, 158, 171, 168, 175, 182, 178],
    input:  [82, 86, 91, 88, 97, 94, 100, 104, 101, 110, 108, 112, 117, 114],
    output: [46, 49, 51, 50, 54, 53, 56, 58, 57, 61, 60, 63, 65, 64],
  },
  // Tokens by model type (K)
  tokensByModel: {
    llm:      [95, 101, 106, 103, 113, 110, 117, 121, 118, 128, 126, 131, 136, 133],
    vector:   [18, 19, 20, 19, 21, 20, 22, 23, 22, 24, 23, 25, 26, 25],
    ranking:  [10, 10, 11, 11, 12, 11, 12, 13, 12, 13, 13, 14, 14, 14],
    vision:   [5, 5, 5, 5, 5, 6, 5, 5, 6, 6, 6, 5, 6, 6],
  },
  // Tokens by agent (K) — all 19 agents from 我的智能体
  tokensByAgent: Object.fromEntries(AGENTS.map((a, i) => [
    a.name,
    Array.from({ length: 14 }, (_, j) => Math.round((28 - i * 1.2) + Math.sin(j * 0.7 + i) * 3 + j * 0.6)),
  ])),
  // Agent message counts — 分日单日消息量（离散、非累加，多频波动）
  agentMessages: Object.fromEntries(AGENTS.map((a, i) => [
    a.name,
    Array.from({ length: 14 }, (_, j) => {
      const base = 300 - i * 11;
      const wobble =
        Math.sin(j * 0.88 + i * 0.52) * 46 +
        Math.sin(j * 0.38 + i * 1.15) * 32 +
        Math.cos(j * 1.12 + i * 0.41) * 26 +
        Math.sin((j * 2.7 + i) * 0.67) * 20;
      return Math.round(Math.max(48, base + wobble));
    }),
  ])),
  // Agent message distribution (donut) — top 5 + 其他
  agentDistribution: [
    ...AGENTS.slice(0, 5).map(a => ({ name: a.name, value: Math.round(200 + Math.random() * 300), color: a.color })),
    { name: '其他', value: 124, color: C.text.qua },
  ],
  // Channel message counts
  channelMessages: {
    '智能体调试': [180, 192, 205, 198, 221, 212, 232, 245, 238, 258, 251, 267, 278, 271],
    'API调用':    [420, 448, 475, 461, 512, 496, 538, 562, 548, 592, 578, 608, 634, 619],
    '网页访问':   [310, 332, 351, 340, 378, 365, 396, 414, 405, 438, 426, 451, 470, 458],
  },
  // Channel distribution (donut)
  channelDistribution: [
    { name: '智能体调试', value: 271, color: C.blue },
    { name: 'API调用', value: 619, color: C.green },
    { name: '网页访问', value: 458, color: C.purple },
  ],
};

// ═══════════════════════════════════════════════════════════════
// Time-range helpers
// ═══════════════════════════════════════════════════════════════
const RANGE_SEEDS: Record<string, number> = { today: 1, '7d': 1.35, '30d': 2.1, custom: 1.7 };
function vary(base: number, seed: number, spread = 0.15): number {
  const hash = Math.sin(base * 9301 + seed * 49297) * 0.5 + 0.5;
  return +(base * (1 + (hash - 0.5) * 2 * spread * seed)).toFixed(1);
}
function varyInt(base: number, seed: number, spread = 0.2): number {
  return Math.round(vary(base, seed, spread));
}
function varyArr(arr: number[], seed: number, spread = 0.12): number[] {
  return arr.map((v, i) => {
    const h = Math.sin(v * 9301 + (seed + i) * 49297) * 0.5 + 0.5;
    return Math.round(v * (1 + (h - 0.5) * 2 * spread * seed));
  });
}

// ═══════════════════════════════════════════════════════════════
// SVG Line Chart Component
// ═══════════════════════════════════════════════════════════════
interface LineData {
  label: string;
  data: number[];
  color: string;
}

function SVGLineChart({
  lines,
  labels,
  width = 600,
  height = 240,
  yUnit = '',
  showDots = false,
}: {
  lines: LineData[];
  labels: string[];
  width?: number;
  height?: number;
  yUnit?: string;
  showDots?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(width);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setCw(e.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const padL = 48, padR = 16, padT = 16, padB = 36;
  const chartW = cw - padL - padR;
  const chartH = height - padT - padB;

  // Compute global min/max
  const allVals = lines.flatMap(l => l.data);
  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  const range = rawMax - rawMin || 1;
  const yMin = Math.max(0, rawMin - range * 0.1);
  const yMax = rawMax + range * 0.1;
  const yRange = yMax - yMin || 1;

  // Generate Y axis ticks (5 ticks)
  const yTicks: number[] = [];
  for (let i = 0; i <= 4; i++) {
    yTicks.push(Math.round(yMin + (yRange / 4) * i));
  }

  const xStep = labels.length > 1 ? chartW / (labels.length - 1) : chartW;
  const getX = (i: number) => padL + i * xStep;
  const getY = (v: number) => padT + chartH - ((v - yMin) / yRange) * chartH;

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg width={cw} height={height} viewBox={`0 0 ${cw} ${height}`} style={{ display: 'block' }}>
        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={cw - padR} y1={getY(t)} y2={getY(t)} stroke="#eef0f4" strokeWidth={1} />
            <text x={padL - 6} y={getY(t) + 4} textAnchor="end" fill={C.text.qua} fontSize={10} fontFamily="'DM Sans', sans-serif">
              {t}{yUnit}
            </text>
          </g>
        ))}

        {/* X labels */}
        {labels.map((l, i) => {
          // Show every other label if too many
          if (labels.length > 10 && i % 2 !== 0 && i !== labels.length - 1) return null;
          return (
            <text key={i} x={getX(i)} y={height - 6} textAnchor="middle" fill={C.text.qua} fontSize={10} fontFamily="'DM Sans', sans-serif">
              {l}
            </text>
          );
        })}

        {/* Lines */}
        {lines.map((line, li) => {
          const points = line.data.map((v, i) => `${getX(i)},${getY(v)}`).join(' ');
          // Area gradient
          const areaId = `area-${li}`;
          const areaPoints = [
            ...line.data.map((v, i) => `${getX(i)},${getY(v)}`),
            `${getX(line.data.length - 1)},${padT + chartH}`,
            `${getX(0)},${padT + chartH}`,
          ].join(' ');
          return (
            <g key={li}>
              <defs>
                <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={line.color} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={line.color} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              {lines.length <= 3 && (
                <polygon points={areaPoints} fill={`url(#${areaId})`} />
              )}
              <polyline points={points} fill="none" stroke={line.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {showDots && line.data.map((v, i) => (
                <circle key={i} cx={getX(i)} cy={getY(v)} r={2.5} fill="#fff" stroke={line.color} strokeWidth={1.5} />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 8, paddingLeft: padL }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 12, height: 3, borderRadius: 2, background: line.color }} />
            <span style={{ fontSize: 11, color: C.text.tri }}>{line.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SVG Donut Chart Component
// ═══════════════════════════════════════════════════════════════
function SVGDonutChart({
  segments,
  size = 180,
  thickness = 28,
  centerLabel,
  centerValue,
}: {
  segments: { name: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  let accumulated = 0;
  const arcs = segments.map(seg => {
    const pct = seg.value / total;
    const dashLen = pct * circumference;
    const dashGap = circumference - dashLen;
    const offset = -(accumulated * circumference) + circumference * 0.25; // Start from top
    accumulated += pct;
    return { ...seg, pct, dashLen, dashGap, offset };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eef0f4" strokeWidth={thickness} />
          {/* Segments */}
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth={thickness}
              strokeDasharray={`${arc.dashLen} ${arc.dashGap}`}
              strokeDashoffset={arc.offset}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
            />
          ))}
        </svg>
        {/* Center text */}
        {(centerLabel || centerValue) && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            {centerValue && <div style={{ fontSize: 20, fontWeight: 700, color: C.text.pri, lineHeight: 1.2 }}>{centerValue}</div>}
            {centerLabel && <div style={{ fontSize: 11, color: C.text.tri, marginTop: 2 }}>{centerLabel}</div>}
          </div>
        )}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14, width: '100%' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: C.text.sec }}>{seg.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text.pri, fontVariantNumeric: 'tabular-nums' }}>{seg.value.toLocaleString()}</span>
              <span style={{ fontSize: 11, color: C.text.qua, fontVariantNumeric: 'tabular-nums', minWidth: 36, textAlign: 'right' }}>
                {((seg.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Progress Bar
// ═══════════════════════════════════════════════════════════════
function ProgressBar({ value, max = 100, color, h = 6 }: { value: number; max?: number; color: string; h?: number }) {
  return (
    <div style={{ height: h, background: '#eef0f4', borderRadius: h, overflow: 'hidden', width: '100%' }}>
      <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: '100%', background: color, borderRadius: h, transition: 'width 0.5s ease' }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
export function ExecutionEffectDashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('7d');
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [contentOpacity, setContentOpacity] = useState(1);
  // Agent toggle: default show first 5
  const [showAverage, setShowAverage] = useState(false);
  const [enabledAgents, setEnabledAgents] = useState<Set<string>>(() => new Set(AGENTS.slice(0, 5).map(a => a.name)));
  const toggleAgent = (name: string) => {
    setShowAverage(false);
    setEnabledAgents(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  // Animation
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  // Auto-collapse data overview on scroll
  const [overviewCollapsed, setOverviewCollapsed] = useState(false);
  useEffect(() => {
    const h = () => setOverviewCollapsed(prev => {
      const y = window.scrollY;
      if (!prev && y > 60) return true;
      if (prev && y < 10) return false;
      return prev;
    });
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Fade-refresh on time range change
  useEffect(() => {
    setContentOpacity(0);
    const t = setTimeout(() => setContentOpacity(1), 180);
    return () => clearTimeout(t);
  }, [timeRange, customFrom, customTo]);

  const seed = useMemo(() => {
    if (timeRange === 'custom' && customFrom && customTo) {
      const days = Math.round((customTo.getTime() - customFrom.getTime()) / 86400000) + 1;
      return 1 + days * 0.012;
    }
    return RANGE_SEEDS[timeRange] ?? 1;
  }, [timeRange, customFrom, customTo]);

  const timeLabels = TIME_LABELS_14[timeRange] || TIME_LABELS_14['7d'];

  // Compute varied data based on seed
  const D = useMemo(() => {
    if (seed === 1) return DATA;
    const s = seed;
    return {
      tokensTotalTrend: {
        total: varyArr(DATA.tokensTotalTrend.total, s),
        input: varyArr(DATA.tokensTotalTrend.input, s),
        output: varyArr(DATA.tokensTotalTrend.output, s),
      },
      tokensByModel: {
        llm: varyArr(DATA.tokensByModel.llm, s),
        vector: varyArr(DATA.tokensByModel.vector, s),
        ranking: varyArr(DATA.tokensByModel.ranking, s),
        vision: varyArr(DATA.tokensByModel.vision, s),
      },
      tokensByAgent: Object.fromEntries(
        Object.entries(DATA.tokensByAgent).map(([k, v]) => [k, varyArr(v, s)])
      ) as typeof DATA.tokensByAgent,
      agentMessages: Object.fromEntries(
        Object.entries(DATA.agentMessages).map(([k, v]) => [k, varyArr(v, s)])
      ) as typeof DATA.agentMessages,
      agentDistribution: DATA.agentDistribution.map(d => ({ ...d, value: varyInt(d.value, s, 0.12) })),
      channelMessages: Object.fromEntries(
        Object.entries(DATA.channelMessages).map(([k, v]) => [k, varyArr(v, s)])
      ) as typeof DATA.channelMessages,
      channelDistribution: DATA.channelDistribution.map(d => ({ ...d, value: varyInt(d.value, s, 0.12) })),
    };
  }, [seed]);

  // Summary stats
  const totalDatasets = DATASET_CATEGORIES.reduce((s, c) => s + c.count, 0);
  const latestTotalTokens = D.tokensTotalTrend.total[D.tokensTotalTrend.total.length - 1];
  const totalAgentMessages = D.agentDistribution.reduce((s, d) => s + d.value, 0);

  // Filtered agent distribution for donut (respects enabledAgents)
  const filteredAgentDistribution = useMemo(() => {
    const list = showAverage ? AGENTS : AGENTS.filter(a => enabledAgents.has(a.name));
    return list.map(a => ({
      name: a.name.replace('智能体', ''),
      value: Math.round((D.agentMessages[a.name] || []).reduce((s: number, v: number) => s + v, 0) / 14),
      color: a.color,
    }));
  }, [enabledAgents, showAverage, D]);
  const filteredTotalMessages = filteredAgentDistribution.reduce((s, d) => s + d.value, 0);

  // Helper: build agent lines (individual or average)
  const agentLines = (dataMap: Record<string, number[]>) => {
    if (showAverage) {
      const allData = AGENTS.map(a => dataMap[a.name] || []);
      const len = allData[0]?.length || 0;
      const avg = Array.from({ length: len }, (_, i) => {
        const sum = allData.reduce((s, d) => s + (d[i] || 0), 0);
        return Math.round(sum / AGENTS.length);
      });
      return [{ label: '全部平均', data: avg, color: C.blue }];
    }
    return AGENTS.filter(a => enabledAgents.has(a.name)).map(a => ({
      label: a.name.replace('智能体', ''),
      data: dataMap[a.name] || [],
      color: a.color,
    }));
  };
  const totalChannelMessages = D.channelDistribution.reduce((s, d) => s + d.value, 0);

  const cs: React.CSSProperties = {
    background: C.card, backdropFilter: 'blur(16px)',
    borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden',
  };

  const stagger = (i: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 0.4s ease ${i * 50}ms, transform 0.4s ease ${i * 50}ms`,
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #eef0f6 0%, #f3f4f9 45%, #eaedf4 100%)',
      fontFamily: "'Noto Sans SC','DM Sans','PingFang SC',sans-serif",
      color: C.text.pri,
    }}>
      {/* ══ Sticky Header + Data Overview ══ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(240,242,248,0.92)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        {/* ── Header bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: `1px solid rgba(226,232,240,0.5)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/galaxy')} style={{
              width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
            }}>
              <ArrowLeft size={16} color="#4a5b73" />
            </button>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.text.pri }}>效果监测看板</span>
          </div>
        </div>

        {/* ── Data Resources Overview (auto-collapse on scroll) ── */}
        <div style={{
          maxHeight: overviewCollapsed ? 0 : 600,
          opacity: overviewCollapsed ? 0 : 1,
          overflow: 'hidden',
          transition: 'max-height 0.35s ease, opacity 0.2s ease, padding 0.3s ease',
          padding: overviewCollapsed ? '0 24px' : '16px 24px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Database size={16} color={C.blue} />
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text.pri }}>数据资源概览</span>
          </div>

          {/* Top row: 3 stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
            {/* Card 1: 2026年目标 */}
            <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 14, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: C.text.tri, fontWeight: 500 }}>2026年目标</span>
                <Target size={14} color={C.blue} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: C.text.pri, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>109</span>
                <span style={{ fontSize: 12, color: C.text.tri }}>个数据集</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: C.text.sec }}>
                已完成 <span style={{ fontWeight: 600, color: C.blue }}>{totalDatasets}个</span> <span style={{ color: C.text.qua }}>({((totalDatasets / 109) * 100).toFixed(1)}%)</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <ProgressBar value={totalDatasets} max={109} color={C.blue} h={5} />
              </div>
            </div>

            {/* Card 2: 数据容量 */}
            <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 14, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: C.text.tri, fontWeight: 500 }}>数据容量</span>
                <HardDrive size={14} color={C.green} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: C.text.pri, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>110</span>
                <span style={{ fontSize: 12, color: C.text.tri }}>/ 500 TB</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: C.text.sec }}>
                已使用 <span style={{ fontWeight: 600, color: C.green }}>22.0%</span> <span style={{ color: C.text.qua }}>容量</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <ProgressBar value={110} max={500} color={C.green} h={5} />
              </div>
            </div>

            {/* Card 3: 数据类别 */}
            <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 14, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: C.text.tri, fontWeight: 500 }}>数据类别</span>
                <Layers size={14} color={C.text.qua} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: C.text.pri, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>11</span>
                <span style={{ fontSize: 12, color: C.text.tri }}>类</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: C.text.qua }}>
                涵盖采销、仓储、运输、风险控制、生态服务等
              </div>
            </div>
          </div>

          {/* Dataset list — always visible */}
          <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 18px',
            }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.text.sec }}>数据集分类明细</span>
              <span style={{ fontSize: 11, color: C.text.qua }}>{totalDatasets}个数据集 / {DATASET_CATEGORIES.length}个分类</span>
            </div>
            <div style={{
              padding: '4px 18px 14px',
              display: 'flex', flexWrap: 'wrap', gap: 8,
              borderTop: `1px solid ${C.border}`,
              paddingTop: 12,
            }}>
              {DATASET_CATEGORIES.map((cat, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 8,
                  background: `${cat.color}08`,
                  border: `1px solid ${cat.color}20`,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: C.text.sec }}>{cat.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: cat.color,
                    background: `${cat.color}12`,
                    padding: '1px 6px', borderRadius: 4,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ Scrollable Content: Operations Metrics ══ */}
      <div style={{
        padding: '20px 24px 40px',
        opacity: contentOpacity,
        transition: 'opacity 0.3s ease',
      }}>

        {/* ════════════════════════════════════════════════════════
            Section 1: 业务指标达成
            ════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 28, ...stagger(1) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <CheckCircle2 size={16} color={C.green} />
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text.pri }}>业务指标达成</span>
              <span style={{ fontSize: 12, color: C.text.qua, marginLeft: 10 }}>各智能体核心业务指标完成情况</span>
            </div>
          </div>

          <div style={{ ...cs, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8f9fc' }}>
                  {['领域', '智能体', '核心指标', '目标值', '达成状态'].map((header) => (
                    <th
                      key={header}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        color: '#4a5b73',
                        fontWeight: 500,
                        fontSize: 13,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { domain: 'L1通用', agent: '信用智能体', kpi: '问答回复相关性', target: '≥80%', status: '达成' as const },
                  { domain: 'L1通用', agent: '舆情智能体', kpi: '问答回复准确性', target: '≥80%', status: '达成' as const },
                  { domain: '农产品', agent: '粮食产量预测智能体', kpi: '产量预测误差率', target: '≤8%', status: '达成' as const },
                  { domain: '农产品', agent: '粮食价格预测智能体', kpi: '价格波动预测MAPE', target: '≤5%', status: '达成' as const },
                  { domain: '农产品', agent: '库存智能分析智能体', kpi: '巡库识别误差率', target: '≤5%', status: '达成' as const },
                  { domain: '农产品', agent: '进口大豆装港风险预警', kpi: '滞期预测准确率', target: '≥70%', status: '达成' as const },
                  { domain: '铁矿石', agent: '价格预测智能体', kpi: '周度价格趋势准确率', target: '≥70%', status: '达成' as const },
                  { domain: '铁矿石', agent: '价格预测智能体', kpi: '价格误差率', target: '≤5%', status: '进行中' as const },
                  { domain: '多式联运', agent: '公路段货找车智能体', kpi: 'AI成单率', target: '>50%', status: '达成' as const },
                  { domain: '多式联运', agent: '公路段货找车智能体', kpi: 'AI推荐满意度', target: '>70%', status: '进行中' as const },
                  { domain: '多式联运', agent: '国际干散货海运运价研报智能体', kpi: '短期运价预测MAPE', target: '≤5%', status: '达成' as const },
                  { domain: '气象大模型', agent: '全球气象智能体', kpi: 'RMSE改进幅度', target: '≥5%', status: '达成' as const },
                ].map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      background: i % 2 === 0 ? '#ffffff' : '#fafbfd',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '11px 16px', color: C.text.sec, borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                      {row.domain}
                    </td>
                    <td style={{ padding: '11px 16px', color: C.text.pri, fontWeight: 500, borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                      {row.agent}
                    </td>
                    <td style={{ padding: '11px 16px', color: C.text.sec, borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                      {row.kpi}
                    </td>
                    <td style={{ padding: '11px 16px', color: C.text.pri, fontWeight: 500, borderBottom: `1px solid ${C.border}`, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                      {row.target}
                    </td>
                    <td style={{ padding: '11px 16px', borderBottom: `1px solid ${C.border}` }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 12px',
                        borderRadius: 9999,
                        fontSize: 12,
                        fontWeight: 500,
                        background: row.status === '达成' ? 'rgba(5,150,105,0.1)' : 'rgba(217,119,6,0.1)',
                        color: row.status === '达成' ? '#059669' : '#d97706',
                      }}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            Section 2: Operations Metrics (7 charts)
            ════════════════════════════════════════════════════════ */}
        <div style={{ ...stagger(2) }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="9" width="3" height="6" rx="1" fill={C.blue} opacity="0.7" />
                <rect x="6" y="5" width="3" height="10" rx="1" fill={C.blue} opacity="0.85" />
                <rect x="11" y="1" width="3" height="14" rx="1" fill={C.blue} />
              </svg>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.text.pri }}>运营效果监测</span>
            </div>
            <TimeRangePicker
              value={timeRange} onChange={setTimeRange}
              customFrom={customFrom} customTo={customTo}
              onCustomChange={(from, to) => { setCustomFrom(from); setCustomTo(to); }}
            />
          </div>

          {/* ── Row 1: Full-width — Tokens Total Trend ── */}
          <div style={{ ...cs, padding: '18px 20px 14px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text.pri }}>Tokens总量趋势</div>
                <div style={{ fontSize: 11, color: C.text.qua, marginTop: 2 }}>Total / Input / Output (K)</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: C.text.qua }}>最新总量</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.text.pri, fontVariantNumeric: 'tabular-nums' }}>{latestTotalTokens}K</div>
                </div>
              </div>
            </div>
            <SVGLineChart
              lines={[
                { label: 'Total', data: D.tokensTotalTrend.total, color: C.blue },
                { label: 'Input', data: D.tokensTotalTrend.input, color: C.green },
                { label: 'Output', data: D.tokensTotalTrend.output, color: C.yellow },
              ]}
              labels={timeLabels}
              height={220}
              yUnit="K"
            />
          </div>

          {/* ── Shared Agent Filter (applies to Tokens按智能体, Agent消息数, Agent分布) ── */}
          <div style={{ ...cs, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.text.sec }}>智能体筛选</span>
              <button onClick={() => {
                setShowAverage(prev => !prev);
                if (!showAverage) setEnabledAgents(new Set());
              }} style={{
                padding: '4px 14px', borderRadius: 999, fontSize: 11, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.18s ease',
                border: showAverage ? `1.5px solid ${C.text.pri}` : '1px solid rgba(226,232,240,0.5)',
                background: showAverage ? `${C.text.pri}` : 'rgba(237,241,248,0.45)',
                color: showAverage ? '#fff' : '#a3b1c6',
                fontWeight: 500, letterSpacing: '0.02em',
              }}>所有智能体</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 8px' }}>
              {AGENTS.map(a => {
                const on = enabledAgents.has(a.name);
                return (
                  <button key={a.name} onClick={() => toggleAgent(a.name)} style={{
                    padding: '4px 12px', borderRadius: 999, cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.18s ease', fontSize: 11,
                    border: '1px solid',
                    borderColor: on ? `${a.color}40` : 'rgba(226,232,240,0.5)',
                    background: on ? `${a.color}18` : 'rgba(237,241,248,0.45)',
                    color: on ? a.color : '#a3b1c6',
                    fontWeight: on ? 500 : 400,
                  }}>
                    {a.name.replace('智能体', '')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Row 2: Two columns — Tokens by Model / Tokens by Agent ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {/* Tokens by Model Type */}
            <div style={{ ...cs, padding: '18px 20px 14px' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text.pri }}>Tokens按模型类型</div>
                <div style={{ fontSize: 11, color: C.text.qua, marginTop: 2 }}>单位: K</div>
              </div>
              <SVGLineChart
                lines={[
                  { label: '大语言模型', data: D.tokensByModel.llm, color: C.blue },
                  { label: '向量模型', data: D.tokensByModel.vector, color: C.green },
                  { label: '排序模型', data: D.tokensByModel.ranking, color: C.yellow },
                  { label: '视觉模型', data: D.tokensByModel.vision, color: C.purple },
                ]}
                labels={timeLabels}
                height={210}
                yUnit="K"
              />
            </div>

            {/* Tokens by Agent */}
            <div style={{ ...cs, padding: '18px 20px 14px' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text.pri }}>Tokens按智能体</div>
                <div style={{ fontSize: 11, color: C.text.qua, marginTop: 2 }}>各智能体 Token 消耗趋势 (K)</div>
              </div>
              <SVGLineChart
                lines={agentLines(D.tokensByAgent)}
                labels={timeLabels}
                height={210}
                yUnit="K"
              />
            </div>
          </div>

          {/* ── Row 3: Two columns — Agent Messages / Agent Distribution ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {/* Agent Messages Trend */}
            <div style={{ ...cs, padding: '18px 20px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text.pri }}>Agent消息数</div>
                  <div style={{ fontSize: 11, color: C.text.qua, marginTop: 2 }}>按智能体的消息数趋势</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: C.text.qua }}>总消息</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text.pri, fontVariantNumeric: 'tabular-nums' }}>{totalAgentMessages.toLocaleString()}</div>
                </div>
              </div>
              <SVGLineChart
                lines={agentLines(D.agentMessages)}
                labels={timeLabels}
                height={210}
              />
            </div>

            {/* Agent Distribution Donut */}
            <div style={{ ...cs, padding: '18px 20px 14px' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text.pri }}>消息数-Agent分布</div>
                <div style={{ fontSize: 11, color: C.text.qua, marginTop: 2 }}>各智能体消息占比</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                <SVGDonutChart
                  segments={filteredAgentDistribution}
                  size={170}
                  thickness={26}
                  centerValue={filteredTotalMessages.toLocaleString()}
                  centerLabel="总消息数"
                />
              </div>
            </div>
          </div>

          {/* ── Row 4: Two columns — Channel Messages / Channel Distribution ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Channel Messages Trend */}
            <div style={{ ...cs, padding: '18px 20px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text.pri }}>各渠道消息数</div>
                  <div style={{ fontSize: 11, color: C.text.qua, marginTop: 2 }}>智能体调试 / API调用 / 网页访问</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: C.text.qua }}>总消息</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text.pri, fontVariantNumeric: 'tabular-nums' }}>{totalChannelMessages.toLocaleString()}</div>
                </div>
              </div>
              <SVGLineChart
                lines={Object.entries(D.channelMessages).map(([name, data], i) => ({
                  label: name,
                  data,
                  color: CHANNELS[i]?.color || C.text.qua,
                }))}
                labels={timeLabels}
                height={210}
              />
            </div>

            {/* Channel Distribution Donut */}
            <div style={{ ...cs, padding: '18px 20px 14px' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text.pri }}>消息数-渠道分布</div>
                <div style={{ fontSize: 11, color: C.text.qua, marginTop: 2 }}>各渠道消息占比</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                <SVGDonutChart
                  segments={D.channelDistribution}
                  size={170}
                  thickness={26}
                  centerValue={totalChannelMessages.toLocaleString()}
                  centerLabel="总消息数"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

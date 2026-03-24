import { useState, useMemo, useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { ArrowLeft, Server, Cpu, Zap, Activity, BarChart3, Database, Clock, Filter, X, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { TimeRangePicker, type TimeRangePreset } from '../TimeRangePicker';
import { SingleDatePicker } from '../SingleDatePicker';
import { mockAgents } from '../../data/mockData';

// ══════════════════════════════════════════════════════════════════
// Color tokens
// ══════════════════════════════════════════════════════════════════
/** 轻量云控制台 / 数据平台风格色板（偏阿里系中性灰 + 单点品牌蓝） */
const C = {
  text: { pri: '#1d2129', sec: '#4e5969', tri: '#86909c', qua: '#c9cdd4' },
  blue: '#1677ff', green: '#00b578', purple: '#722ed1', yellow: '#d97706',
  red: '#f53f3f', teal: '#13c2c2',
};
const S = {
  bg: '#f5f7fa',
  surface: '#ffffff',
  line: '#ebeef2',
  lineStrong: '#e5e6eb',
  radius: 8,
  shadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
};

/** 资产看板排版：13px 正文基准，数字统一 DM Sans + tabular-nums */
const T = {
  family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
  num: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
  fz: {
    cap: 10,
    xs: 11,
    sm: 12,
    body: 13,
    md: 14,
    lg: 15,
    xl: 16,
    h2: 15,
    page: 18,
    kpi: 24,
    kpiL: 26,
    donut: 28,
  },
  w: { normal: 400, medium: 500, semibold: 600, bold: 700 } as const,
};

// ══════════════════════════════════════════════════════════════════
// Agents (与 mockAgents 已发布列表一致)
// ══════════════════════════════════════════════════════════════════
const AGENTS = [
  { name: '信用智能体', color: '#2563eb' },
  { name: '舆情智能体', color: '#3b82f6' },
  { name: '粮食产量预测智能体', color: '#10b981' },
  { name: '粮食价格预测智能体', color: '#34d399' },
  { name: '国际干散货海运运价研报智能体', color: '#7c3aed' },
  { name: '库存智能分析智能体', color: '#a78bfa' },
  { name: '进口大豆装港风险预警智能体', color: '#f59e0b' },
  { name: '价格预测智能体', color: '#ef4444' },
  { name: '供应分析智能体', color: '#f87171' },
  { name: '供需平衡智能体', color: '#fbbf24' },
  { name: '公路段货找车智能体', color: '#14b8a6' },
  { name: '公路段车找货智能体', color: '#2dd4bf' },
  { name: '全球气象智能体', color: '#6366f1' },
  { name: '信息监测智能体', color: '#818cf8' },
  { name: '粮食气象智能体', color: '#06b6d4' },
  { name: '港口气象智能体', color: '#22d3ee' },
  { name: '信息分析智能体', color: '#f472b6' },
  { name: '信息报告智能体', color: '#e879f9' },
  { name: '算力调度智能体', color: '#0ea5e9' },
  { name: '数据资产治理智能体', color: '#8b5cf6' },
  { name: '应用运营分析智能体', color: '#f97316' },
  { name: '智能体评测智能体', color: '#84cc16' },
  { name: '知识图谱构建智能体', color: '#ec4899' },
];

/** 智能体效果监测（mock，与「我的智能体」列表一一对应） */
const AGENT_EFFECTIVENESS_KPIS = [
  '综合评分 ≥ 85 分',
  'P95 响应延迟 ≤ 2.0s',
  '周均调用成功率 ≥ 99%',
  '用户满意度 ≥ 4.5',
  '业务准确率 ≥ 92%',
  '元数据完整率 ≥ 95%',
  'SLA 可用性 ≥ 99.9%',
  '风险预警覆盖率 ≥ 95%',
  '报告一次通过率 ≥ 90%',
  '需求预测 MAPE ≤ 8%',
  '异常检出率 ≥ 95%',
  '知识召回率 ≥ 88%',
  '调度满足率 ≥ 95%',
  '模型漂移率 ≤ 3%',
  '数据新鲜度 ≤ 15min',
  '多端一致性 ≥ 98%',
  '合规校验通过率 100%',
  '根因定位准确率 ≥ 90%',
  '容量预测误差 ≤ 5%',
  '舆情响应时效 ≤ 30min',
  '价格预测准确率 ≥ 93%',
  '供需平衡偏差 ≤ 6%',
  '知识图谱完整度 ≥ 90%',
] as const;

/** 每个智能体的实际 mockup 数据，全部达标 */
const AGENT_EFFECTIVENESS_ACTUAL: string[] = [
  '88.6 分',    // 综合评分 ≥ 85
  '1.72s',      // P95 响应延迟 ≤ 2.0s
  '99.3%',      // 周均调用成功率 ≥ 99%
  '4.7',        // 用户满意度 ≥ 4.5
  '93.8%',      // 业务准确率 ≥ 92%
  '97.2%',      // 元数据完整率 ≥ 95%
  '99.95%',     // SLA 可用性 ≥ 99.9%
  '96.4%',      // 风险预警覆盖率 ≥ 95%
  '92.1%',      // 报告一次通过率 ≥ 90%
  '6.5%',       // 需求预测 MAPE ≤ 8%
  '96.8%',      // 异常检出率 ≥ 95%
  '91.3%',      // 知识召回率 ≥ 88%
  '97.1%',      // 调度满足率 ≥ 95%
  '2.1%',       // 模型漂移率 ≤ 3%
  '8min',       // 数据新鲜度 ≤ 15min
  '99.2%',      // 多端一致性 ≥ 98%
  '100%',       // 合规校验通过率 100%
  '92.5%',      // 根因定位准确率 ≥ 90%
  '3.8%',       // 容量预测误差 ≤ 5%
  '18min',      // 舆情响应时效 ≤ 30min
  '94.2%',      // 价格预测准确率 ≥ 93%
  '4.8%',       // 供需平衡偏差 ≤ 6%
  '93.1%',      // 知识图谱完整度 ≥ 90%
];

const AGENT_EFFECTIVENESS_ROWS: { name: string; kpi: string; actual: string; status: '达标' }[] = AGENTS.map((a, i) => ({
  name: a.name,
  kpi: AGENT_EFFECTIVENESS_KPIS[i % AGENT_EFFECTIVENESS_KPIS.length],
  actual: AGENT_EFFECTIVENESS_ACTUAL[i % AGENT_EFFECTIVENESS_ACTUAL.length],
  status: '达标' as const,
}));

type TokenSeriesKind = 'total' | 'input' | 'output';

/** 总 Token / Input / Output 口径切换（趋势图与构成图共用同一状态） */
function TokenSeriesKindToggle({
  value,
  onChange,
  ariaLabel,
}: {
  value: TokenSeriesKind;
  onChange: (v: TokenSeriesKind) => void;
  ariaLabel: string;
}) {
  const opts: { id: TokenSeriesKind; label: string }[] = [
    { id: 'total', label: '总 Token' },
    { id: 'input', label: 'Input' },
    { id: 'output', label: 'Output' },
  ];
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{ display: 'inline-flex', flexShrink: 0, border: `1px solid ${S.lineStrong}`, borderRadius: 6, overflow: 'hidden', background: S.surface }}
    >
      {opts.map((o, i) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            style={{
              padding: '5px 10px',
              fontSize: T.fz.xs,
              fontFamily: T.family,
              border: 'none',
              borderLeft: i > 0 ? `1px solid ${S.lineStrong}` : 'none',
              cursor: 'pointer',
              background: active ? 'rgba(22,119,255,0.1)' : 'transparent',
              color: active ? C.blue : C.text.sec,
              fontWeight: active ? T.w.semibold : T.w.normal,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** 按模型趋势折线配色（与智能体解耦，仅作序列区分） */
const MODEL_TREND_LINE_COLORS = [
  C.blue, C.green, C.yellow, C.purple, '#0ea5e9', '#f97316', '#84cc16', '#ec4899',
  '#6366f1', '#14b8a6', '#f472b6', '#22d3ee', '#8b5cf6', '#34d399', '#f59e0b',
  '#ef4444', '#06b6d4', '#a78bfa', '#eab308',
];

/**
 * 将各智能体序列按「我的智能体」已发布配置中的 models[] 拆分到各业务模型（均分）；
 * 未配置 models 的计入「未配置业务模型」。
 */
function aggregateAgentSeriesToModels(tokensByAgent: Record<string, number[]>): Record<string, number[]> {
  const len = 14;
  const publishedByName = new Map(
    mockAgents.filter(a => a.publishStatus === 'published').map(a => [a.name, a])
  );

  const modelNames = new Set<string>();
  for (const a of publishedByName.values()) {
    const ms = (a.models || []).map(m => m.trim()).filter(Boolean);
    if (ms.length === 0) modelNames.add('未配置业务模型');
    else ms.forEach(m => modelNames.add(m));
  }

  const sorted = [...modelNames].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const out: Record<string, number[]> = Object.fromEntries(sorted.map(k => [k, Array(len).fill(0)]));

  for (const row of AGENTS) {
    const series = tokensByAgent[row.name];
    if (!series) continue;
    const meta = publishedByName.get(row.name);
    if (!meta) continue;
    const ms = (meta.models || []).map(m => m.trim()).filter(Boolean);
    const targets = ms.length > 0 ? ms : ['未配置业务模型'];
    for (let j = 0; j < len; j++) {
      const v = series[j] ?? 0;
      const share = v / targets.length;
      for (const m of targets) {
        if (!out[m]) out[m] = Array(len).fill(0);
        out[m][j] += share;
      }
    }
  }

  for (const k of Object.keys(out)) {
    out[k] = out[k].map(x => Math.round(x));
  }
  return out;
}

/** 将平台 Input/Output 按智能体 Token 权重拆分（Input/Output 使用不同偏置，便于模型维度占比有差异） */
function splitAgentTokensToInputOutput(
  tokensByAgent: Record<string, number[]>,
  inputSeries: number[],
  outputSeries: number[],
  totalSeries: number[],
): { inputByAgent: Record<string, number[]>; outputByAgent: Record<string, number[]> } {
  const len = inputSeries.length;
  const inputByAgent: Record<string, number[]> = {};
  const outputByAgent: Record<string, number[]> = {};
  AGENTS.forEach(a => {
    inputByAgent[a.name] = Array(len).fill(0);
    outputByAgent[a.name] = Array(len).fill(0);
  });
  const biasIn = AGENTS.map((_, i) => 0.55 + 0.2 * Math.sin(i * 1.7));
  const biasOut = AGENTS.map((_, i) => 0.75 + 0.25 * Math.cos(i * 1.3));

  const distribute = (target: number, weights: number[]) => {
    const wSum = weights.reduce((s, x) => s + x, 0);
    if (target <= 0 || wSum <= 0) return weights.map(() => 0);
    const raw = weights.map(w => (target * w) / wSum);
    const ints = raw.map(x => Math.round(x));
    let diff = target - ints.reduce((s, x) => s + x, 0);
    const order = [...ints.keys()].sort((a, b) => raw[b] - raw[a]);
    let k = 0;
    while (diff !== 0 && k < 2000) {
      const idx = order[k % order.length];
      if (diff > 0) { ints[idx]++; diff--; }
      else if (diff < 0 && ints[idx] > 0) { ints[idx]--; diff++; }
      k++;
    }
    return ints;
  };

  for (let j = 0; j < len; j++) {
    const inp = inputSeries[j] ?? 0;
    const outT = outputSeries[j] ?? 0;
    const wIn = AGENTS.map((a, i) => (tokensByAgent[a.name]?.[j] ?? 0) * biasIn[i]);
    const wOut = AGENTS.map((a, i) => (tokensByAgent[a.name]?.[j] ?? 0) * biasOut[i]);
    const inParts = distribute(inp, wIn);
    const outParts = distribute(outT, wOut);
    AGENTS.forEach((a, i) => {
      inputByAgent[a.name][j] = inParts[i];
      outputByAgent[a.name][j] = outParts[i];
    });
  }

  return { inputByAgent, outputByAgent };
}

function computeModelTokenBreakdown(
  tokensByAgent: Record<string, number[]>,
  trend: { input: number[]; output: number[]; total: number[] },
): {
  tokensByModel: Record<string, number[]>;
  tokensByModelInput: Record<string, number[]>;
  tokensByModelOutput: Record<string, number[]>;
  tokensByAgentInput: Record<string, number[]>;
  tokensByAgentOutput: Record<string, number[]>;
} {
  const { inputByAgent, outputByAgent } = splitAgentTokensToInputOutput(
    tokensByAgent,
    trend.input,
    trend.output,
    trend.total,
  );
  return {
    tokensByModel: aggregateAgentSeriesToModels(tokensByAgent),
    tokensByModelInput: aggregateAgentSeriesToModels(inputByAgent),
    tokensByModelOutput: aggregateAgentSeriesToModels(outputByAgent),
    tokensByAgentInput: inputByAgent,
    tokensByAgentOutput: outputByAgent,
  };
}

const CHANNELS = [
  { name: '智能体调试', color: C.blue },
  { name: 'API调用', color: C.green },
  { name: '网页访问', color: C.purple },
];

// ══════════════════════════════════════════════════════════════════
// Dataset Categories
// ══════════════════════════════════════════════════════════════════
const DATASET_CATEGORIES = [
  { name: '采销服务专识数据集', color: C.blue },
  { name: '采销服务通识数据集', color: '#3b82f6' },
  { name: '仓储服务专识数据集', color: '#10b981' },
  { name: '仓储服务通识数据集', color: '#34d399' },
  { name: '运输服务专识数据集', color: C.purple },
  { name: '运输服务通识数据集', color: '#a78bfa' },
  { name: '风险控制专识数据集', color: C.yellow },
  { name: '风险控制通识数据集', color: '#fbbf24' },
  { name: '生态服务专识数据集', color: C.teal },
  { name: '生态服务通识数据集', color: '#ef4444' },
  { name: '评测数据集', color: '#6366f1' },
];

/** 各类数据规模（TB），与 DATA_ASSET.scaleTb 一致，合计 110 */
const DATASET_ROW_SCALE_TB = [14, 12, 11, 11, 10, 10, 9, 9, 8, 8, 8] as const;

// ══════════════════════════════════════════════════════════════════
// 数据集区块 — 概览常量 & 清单 mock（展示用）
// ══════════════════════════════════════════════════════════════════
const DATA_ASSET = {
  categoryCount: 11,
  datasetTotal: 11,
  scaleTb: 110,
  monthNewCategories: 2,
  monthNewCapacityTb: 8.5,
  annualTarget: 109,
  annualCompleted: 49,
  annualPct: 45.0,
  capacityTargetTb: 500,
  completedTb: 110,
  completedPct: 22.0,
};

type DatasetRow = {
  category: string;
  categoryDot: string;
  scale: string;
  status: '已完成' | '进行中' | '待更新';
  date: string;
};

function buildMockDatasetList(): DatasetRow[] {
  return DATASET_CATEGORIES.map((cat, i) => {
    const globalIdx = i + 1;
    const tb = DATASET_ROW_SCALE_TB[i] ?? 0;
    return {
      category: cat.name,
      categoryDot: cat.color,
      scale: `${tb.toFixed(1)} TB`,
      status: '已完成' as const,
      date: `2026-03-${String(10 + (globalIdx % 13)).padStart(2, '0')}`,
    };
  });
}

const MOCK_DATASET_LIST: DatasetRow[] = buildMockDatasetList();

const DATASET_TABLE_HEADERS = ['分类名称', '数据规模', '当前状态', '最后更新'] as const;

// ══════════════════════════════════════════════════════════════════
// Time-range helpers & seeded pseudo-random
// ══════════════════════════════════════════════════════════════════
const RANGE_SEEDS: Record<string, number> = { today: 1, '7d': 1.35, '30d': 2.1, custom: 1.7 };

function vary(base: number, seed: number, spread = 0.15): number {
  const hash = Math.sin(base * 9301 + seed * 49297) * 0.5 + 0.5;
  return +(base * (1 + (hash - 0.5) * 2 * spread * seed)).toFixed(1);
}
function varyInt(base: number, seed: number, spread = 0.2): number {
  return Math.round(vary(base, seed, spread));
}
function varySpark(arr: number[], seed: number): number[] {
  return arr.map((v, i) => +(v * (0.85 + Math.sin(i * seed * 3.7) * 0.15 * seed)).toFixed(1));
}
function varyArr(arr: number[], seed: number, spread = 0.12): number[] {
  return arr.map((v, i) => {
    const h = Math.sin(v * 9301 + (seed + i) * 49297) * 0.5 + 0.5;
    return Math.round(v * (1 + (h - 0.5) * 2 * spread * seed));
  });
}

// ══════════════════════════════════════════════════════════════════
// Time labels
// ══════════════════════════════════════════════════════════════════
const TIME_LABELS_7: Record<string, string[]> = {
  today: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:00'],
  '7d': ['03-17', '03-18', '03-19', '03-20', '03-21', '03-22', '03-23'],
  '30d': ['02-22', '02-27', '03-04', '03-09', '03-14', '03-18', '03-23'],
  custom: ['03-15', '03-17', '03-18', '03-19', '03-20', '03-22', '03-23'],
};

/** NPU/CPU 实时使用率：横轴为最近 7 个整分钟（HH:mm） */
function computeRealtimeMinuteLabels(now = Date.now()): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 60_000);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
}

function formatDataUpdateTime(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** 本地日历日，格式 YYYY-MM-DD */
function formatLocalYmd(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function getYesterdayLocalYmd(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatLocalYmd(d);
}

const LABELS_14 = ['03/10', '03/11', '03/12', '03/13', '03/14', '03/15', '03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22', '03/23'];
const TIME_LABELS_14: Record<string, string[]> = {
  today: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '17:00', '18:00', '20:00', '22:00', '23:00'],
  '7d': LABELS_14,
  '30d': ['02/22', '02/24', '02/26', '02/28', '03/02', '03/05', '03/08', '03/10', '03/13', '03/15', '03/17', '03/19', '03/21', '03/23'],
  custom: LABELS_14,
};

// ══════════════════════════════════════════════════════════════════
// Mock Data — 算力
// ══════════════════════════════════════════════════════════════════
const MOCK_COMPUTE = {
  servers: 48, vcpu: 1200, memory: 1500, fp16: 120,
  cardTotal: 384, cardIdle: 89, cardFault: 12, cardServiceRate: 96.8,
  npuCompute: [65, 72, 68, 75, 70, 73, 71],
  npuMemory: [58, 63, 61, 67, 64, 66, 62],
  cpuCompute: [55, 60, 58, 62, 59, 61, 57],
  cpuMemory: [68, 72, 70, 74, 71, 73, 69],
};

// ══════════════════════════════════════════════════════════════════
// Mock Data — 应用 (performance)
// ══════════════════════════════════════════════════════════════════
const MOCK_APP = {
  activeApps: 20, totalCalls: 12847, llmTokens: 2.8,
};

// Per-agent performance mock data (seeded)
const AGENT_PERF = Object.fromEntries(AGENTS.map((a, idx) => {
  const s = idx + 1;
  return [a.name, {
    tokenRate: Array.from({ length: 7 }, (_, i) => +(8 + Math.sin(i * s * 0.7) * 3 + s * 0.4).toFixed(1)),
    latency: Array.from({ length: 7 }, (_, i) => Math.round(200 + Math.sin(i * s * 0.9 + 0.5) * 80 + s * 15)),
    qps: Array.from({ length: 7 }, (_, i) => +(25 + Math.sin(i * s * 0.5 + 1) * 8 + s * 1.2).toFixed(1)),
    successRate: Array.from({ length: 7 }, (_, i) => +(96.5 + Math.sin(i * s * 0.6 + 2) * 1 + Math.cos(s * 0.3) * 0.8).toFixed(1)),
  }];
}));

// ══════════════════════════════════════════════════════════════════
// Mock Data — 应用 (operations, 14-point)
// ══════════════════════════════════════════════════════════════════
const TOKENS_TREND_14 = {
  total:  [128, 135, 142, 138, 151, 147, 156, 162, 158, 171, 168, 175, 182, 178],
  input:  [82, 86, 91, 88, 97, 94, 100, 104, 101, 110, 108, 112, 117, 114],
  output: [46, 49, 51, 50, 54, 53, 56, 58, 57, 61, 60, 63, 65, 64],
};

const TOKENS_BY_AGENT_14: Record<string, number[]> = Object.fromEntries(AGENTS.map((a, i) => [
  a.name,
  Array.from({ length: 14 }, (_, j) => Math.round((28 - i * 1.2) + Math.sin(j * 0.7 + i) * 3 + j * 0.6)),
]));

const MODEL_TOKEN_BREAKDOWN_BASE = computeModelTokenBreakdown(TOKENS_BY_AGENT_14, TOKENS_TREND_14);

const DATA_OPS = {
  tokensTotalTrend: TOKENS_TREND_14,
  tokensByAgent: TOKENS_BY_AGENT_14,
  tokensByAgentInput: MODEL_TOKEN_BREAKDOWN_BASE.tokensByAgentInput,
  tokensByAgentOutput: MODEL_TOKEN_BREAKDOWN_BASE.tokensByAgentOutput,
  tokensByModel: MODEL_TOKEN_BREAKDOWN_BASE.tokensByModel,
  tokensByModelInput: MODEL_TOKEN_BREAKDOWN_BASE.tokensByModelInput,
  tokensByModelOutput: MODEL_TOKEN_BREAKDOWN_BASE.tokensByModelOutput,
  /** 各日单日消息量（离散点）；无逐日累加项，多频正弦叠加使曲线起伏、非单调 */
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
  agentDistribution: [
    ...AGENTS.slice(0, 5).map(a => ({ name: a.name, value: Math.round(200 + Math.abs(Math.sin(AGENTS.indexOf(a) * 1.7)) * 300), color: a.color })),
    { name: '其他', value: 124, color: C.text.qua },
  ],
  channelMessages: {
    '智能体调试': [180, 192, 205, 198, 221, 212, 232, 245, 238, 258, 251, 267, 278, 271],
    'API调用':    [420, 448, 475, 461, 512, 496, 538, 562, 548, 592, 578, 608, 634, 619],
    '网页访问':   [310, 332, 351, 340, 378, 365, 396, 414, 405, 438, 426, 451, 470, 458],
  },
  channelDistribution: [
    { name: '智能体调试', value: 271, color: C.blue },
    { name: 'API调用', value: 619, color: C.green },
    { name: '网页访问', value: 458, color: C.purple },
  ],
};

// ══════════════════════════════════════════════════════════════════
// Chart: MultiLineChart (performance, 7-point, responsive width)
// ══════════════════════════════════════════════════════════════════
function MultiLineChart({ lines, labels, height = 150, yUnit = '' }: {
  lines: { label: string; data: number[]; color: string }[];
  labels: string[]; height?: number; yUnit?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(400);
  const [hover, setHover] = useState<number | null>(null);
  const [hiddenLine, setHiddenLine] = useState<Set<number>>(() => new Set());
  const linesKey = lines.map(l => l.label).join('\u0001');
  useEffect(() => {
    setHiddenLine(new Set());
  }, [linesKey]);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(es => { for (const e of es) setCw(e.contentRect.width); });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const pL = 44, pR = 12, pT = 12, pB = 28;
  const w = cw - pL - pR, h = height - pT - pB;
  const visibleLines = lines.filter((_, i) => !hiddenLine.has(i));
  const allV = visibleLines.flatMap(l => l.data);
  if (!lines.length) return <div ref={ref} style={{ width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text.qua, fontSize: T.fz.sm }}>请选择智能体</div>;
  if (!allV.length) {
    return (
      <div ref={ref} style={{ width: '100%' }}>
        <div style={{ padding: 20, textAlign: 'center', color: C.text.qua, fontSize: T.fz.sm }}>图例已全部关闭 · 点击下方图例恢复</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', paddingLeft: pL }}>
          {lines.map((l, i) => (
            <button
              key={i}
              type="button"
              title="点击显示/隐藏"
              onClick={() => setHiddenLine(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', border: 'none', background: 'transparent',
                padding: '4px 6px', borderRadius: 6, opacity: hiddenLine.has(i) ? 0.4 : 1,
              }}
            >
              <div style={{ width: 10, height: 3, borderRadius: 2, background: l.color }} />
              <span style={{ fontSize: T.fz.xs, color: hiddenLine.has(i) ? C.text.qua : C.text.tri, textDecoration: hiddenLine.has(i) ? 'line-through' : 'none' }}>{l.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const mn = Math.min(...allV), mx = Math.max(...allV), rng = mx - mn || 1;
  const yMn = Math.max(0, mn - rng * 0.1), yMx = mx + rng * 0.1, yR = yMx - yMn || 1;
  const ticks: number[] = []; for (let i = 0; i <= 4; i++) ticks.push(+(yMn + (yR / 4) * i).toFixed(1));
  const n = labels.length;
  const xS = n > 1 ? w / (n - 1) : w;
  const gX = (i: number) => pL + i * xS;
  const gY = (v: number) => pT + h - ((v - yMn) / yR) * h;

  const onSvgMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (n < 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * cw;
    if (n === 1) {
      setHover(0);
      return;
    }
    let idx = Math.round((sx - pL) / xS);
    idx = Math.max(0, Math.min(n - 1, idx));
    setHover(idx);
  };
  const onSvgLeave = () => setHover(null);

  const fmtTip = (v: number | undefined) => {
    if (v === undefined || Number.isNaN(v)) return '—';
    return Number.isInteger(v) ? v.toLocaleString() : (+v).toFixed(1);
  };

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <svg
          width={cw}
          height={height}
          viewBox={`0 0 ${cw} ${height}`}
          style={{ display: 'block', width: '100%', height: 'auto' }}
          onMouseMove={onSvgMove}
          onMouseLeave={onSvgLeave}
        >
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={pL} x2={cw - pR} y1={gY(t)} y2={gY(t)} stroke="#f0f1f3" strokeWidth={0.5} />
              <text x={pL - 4} y={gY(t) + 3} textAnchor="end" fill={C.text.qua} fontSize={10} fontFamily={T.num}>
                {Number.isInteger(t) ? t : t.toFixed(1)}{yUnit}
              </text>
            </g>
          ))}
          {labels.map((l, i) => (
            <text key={i} x={gX(i)} y={height - 4} textAnchor="middle" fill={C.text.qua} fontSize={10} fontFamily={T.num}>{l}</text>
          ))}
          {lines.map((line, li) => {
            if (hiddenLine.has(li)) return null;
            const pts = line.data.map((v, i) => `${gX(i)},${gY(v)}`).join(' ');
            return (
              <g key={li}>
                {lines.length <= 3 && (
                  <polygon
                    points={[...line.data.map((v, i) => `${gX(i)},${gY(v)}`), `${gX(line.data.length - 1)},${pT + h}`, `${gX(0)},${pT + h}`].join(' ')}
                    fill={line.color} opacity={0.06}
                  />
                )}
                <polyline points={pts} fill="none" stroke={line.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                {line.data.map((v, i) => (
                  <circle key={i} cx={gX(i)} cy={gY(v)} r={2.5} fill="#fff" stroke={line.color} strokeWidth={1.5} />
                ))}
              </g>
            );
          })}
          {hover !== null && n > 0 && (
            <line x1={gX(hover)} x2={gX(hover)} y1={pT} y2={pT + h} stroke="#d9dce0" strokeWidth={1} />
          )}
          {hover !== null && lines.map((line, li) => {
            if (hiddenLine.has(li)) return null;
            const v = line.data[hover];
            if (v === undefined) return null;
            return (
              <circle key={li} cx={gX(hover)} cy={gY(v)} r={4} fill="#fff" stroke={line.color} strokeWidth={2} />
            );
          })}
        </svg>
        {hover !== null && labels[hover] !== undefined && (
          <div
            style={{
              position: 'absolute',
              left: `${(gX(hover) / cw) * 100}%`,
              top: 6,
              transform: 'translateX(-50%)',
              background: S.surface,
              border: `1px solid ${S.line}`,
              borderRadius: 6,
              padding: '8px 12px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              pointerEvents: 'none',
              zIndex: 2,
              minWidth: 100,
              maxWidth: 240,
            }}
          >
            <div style={{ fontSize: T.fz.sm, fontWeight: T.w.semibold, color: C.text.pri, marginBottom: 6, fontFamily: T.num }}>{labels[hover]}</div>
            {lines.map((line, i) => (
              hiddenLine.has(i) ? null : (
                <div key={i} style={{ fontSize: T.fz.sm, color: line.color, marginBottom: 2, fontFamily: T.num, fontVariantNumeric: 'tabular-nums' }}>
                  {line.label}: {fmtTip(line.data[hover])}{yUnit}
                </div>
              )
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6, paddingLeft: pL, alignItems: 'center' }}>
        {lines.map((l, i) => (
          <button
            key={i}
            type="button"
            title="点击显示/隐藏该曲线"
            aria-pressed={!hiddenLine.has(i)}
            onClick={() => setHiddenLine(prev => {
              const n = new Set(prev);
              if (n.has(i)) n.delete(i);
              else n.add(i);
              return n;
            })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', border: 'none', background: 'transparent',
              padding: '4px 6px', borderRadius: 6, opacity: hiddenLine.has(i) ? 0.4 : 1,
            }}
          >
            <div style={{ width: 10, height: 3, borderRadius: 2, background: l.color }} />
            <span style={{ fontSize: T.fz.xs, color: hiddenLine.has(i) ? C.text.qua : C.text.tri, textDecoration: hiddenLine.has(i) ? 'line-through' : 'none' }}>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Chart: 资源使用趋势（NPU / CPU / 内存三线，0–100%，分钟横轴）
// ══════════════════════════════════════════════════════════════════
function ResourceUsageTrendChart({
  labels,
  series,
  height = 220,
}: {
  labels: string[];
  series: { label: string; data: number[]; color: string; areaFill?: boolean }[];
  height?: number;
}) {
  const gradId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(640);
  const [hover, setHover] = useState<number | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Set<number>>(() => new Set());
  const seriesKey = series.map(s => s.label).join('\u0001');
  useEffect(() => {
    setHiddenSeries(new Set());
  }, [seriesKey]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setCw(Math.max(200, e.contentRect.width));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const padL = 44, padR = 14, padT = 14, padB = 28;
  const chartW = Math.max(0, cw - padL - padR);
  const chartH = height - padT - padB;
  const yMin = 0, yMax = 100;
  const clamp = (v: number) => Math.min(100, Math.max(0, v));
  const gY = (v: number) => padT + chartH - ((clamp(v) - yMin) / (yMax - yMin)) * chartH;
  const n = labels.length;
  const xStep = n > 1 ? chartW / (n - 1) : 0;
  const gX = (i: number) => padL + i * xStep;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (n < 2 || xStep <= 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * cw;
    let idx = Math.round((sx - padL) / xStep);
    idx = Math.max(0, Math.min(n - 1, idx));
    setHover(idx);
  };

  const onLeave = () => setHover(null);

  const yTicks = [0, 25, 50, 75, 100];
  const areaSeries = series.find((s, si) => s.areaFill === true && !hiddenSeries.has(si));
  const allHidden = series.length > 0 && series.every((_, si) => hiddenSeries.has(si));

  if (allHidden) {
    return (
      <div ref={containerRef} style={{ width: '100%' }}>
        <div style={{ padding: 20, textAlign: 'center', color: C.text.qua, fontSize: T.fz.sm }}>图例已全部关闭 · 点击下方图例恢复</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', paddingLeft: 44 }}>
          {series.map((s, si) => (
            <button
              key={si}
              type="button"
              title="点击显示/隐藏"
              onClick={() => setHiddenSeries(prev => { const n = new Set(prev); if (n.has(si)) n.delete(si); else n.add(si); return n; })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: 'none', background: 'transparent',
                padding: '4px 8px', borderRadius: 6, opacity: hiddenSeries.has(si) ? 0.4 : 1,
              }}
            >
              <div style={{ width: 12, height: 3, borderRadius: 2, background: s.color }} />
              <span style={{ fontSize: T.fz.xs, color: hiddenSeries.has(si) ? C.text.qua : C.text.tri, textDecoration: hiddenSeries.has(si) ? 'line-through' : 'none' }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      <svg
        width={cw}
        height={height}
        viewBox={`0 0 ${cw} ${height}`}
        style={{ display: 'block', width: '100%', height: 'auto' }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <defs>
          <linearGradient id={`${gradId}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={areaSeries?.color ?? C.blue} stopOpacity="0.16" />
            <stop offset="100%" stopColor={areaSeries?.color ?? C.blue} stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map(t => (
          <g key={t}>
            <line x1={padL} x2={cw - padR} y1={gY(t)} y2={gY(t)} stroke="#f0f1f3" strokeWidth={0.5} />
            <text x={padL - 8} y={gY(t) + 4} textAnchor="end" fill={C.text.qua} fontSize={11} fontFamily={T.num}>{t}%</text>
          </g>
        ))}
        {labels.map((l, i) => (
          <text key={i} x={gX(i)} y={height - 6} textAnchor="middle" fill={C.text.qua} fontSize={11} fontFamily={T.num}>{l}</text>
        ))}
        {areaSeries && (
          <polygon
            fill={`url(#${gradId}-area)`}
            points={[
              ...areaSeries.data.map((v, i) => `${gX(i)},${gY(v)}`),
              `${gX(n - 1)},${padT + chartH}`,
              `${gX(0)},${padT + chartH}`,
            ].join(' ')}
          />
        )}
        {series.map((s, si) => {
          if (hiddenSeries.has(si)) return null;
          const d = s.data.map((v, i) => `${i === 0 ? 'M' : 'L'}${gX(i)},${gY(v)}`).join(' ');
          return (
            <path key={si} d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          );
        })}
        {hover !== null && n > 0 && (
          <line x1={gX(hover)} x2={gX(hover)} y1={padT} y2={padT + chartH} stroke="#d9dce0" strokeWidth={1} />
        )}
        {hover !== null && series.map((s, si) => {
          if (hiddenSeries.has(si)) return null;
          const v = s.data[hover];
          if (v === undefined) return null;
          return (
            <circle key={si} cx={gX(hover)} cy={gY(v)} r={4} fill="#fff" stroke={s.color} strokeWidth={2} />
          );
        })}
      </svg>
      {hover !== null && labels[hover] !== undefined && (
        <div
          style={{
            position: 'absolute',
            left: `${(gX(hover) / cw) * 100}%`,
            top: 8,
            transform: 'translateX(-50%)',
            background: S.surface,
            border: `1px solid ${S.line}`,
            borderRadius: 6,
            padding: '8px 12px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            pointerEvents: 'none',
            zIndex: 2,
            minWidth: 120,
          }}
        >
          <div style={{ fontSize: T.fz.sm, fontWeight: T.w.semibold, color: C.text.pri, marginBottom: 6, fontFamily: T.num }}>{labels[hover]}</div>
          {series.map((s, i) => (
            hiddenSeries.has(i) ? null : (
              <div key={i} style={{ fontSize: T.fz.sm, color: s.color, marginBottom: 2, fontFamily: T.num, fontVariantNumeric: 'tabular-nums' }}>
                {s.label}: {s.data[hover]?.toFixed(0)}%
              </div>
            )
          ))}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, paddingLeft: padL, alignItems: 'center' }}>
        {series.map((s, si) => (
          <button
            key={si}
            type="button"
            title="点击显示/隐藏该曲线"
            aria-pressed={!hiddenSeries.has(si)}
            onClick={() => setHiddenSeries(prev => {
              const n = new Set(prev);
              if (n.has(si)) n.delete(si);
              else n.add(si);
              return n;
            })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: 'none', background: 'transparent',
              padding: '4px 8px', borderRadius: 6, opacity: hiddenSeries.has(si) ? 0.4 : 1,
            }}
          >
            <div style={{ width: 12, height: 3, borderRadius: 2, background: s.color }} />
            <span style={{ fontSize: T.fz.xs, color: hiddenSeries.has(si) ? C.text.qua : C.text.tri, textDecoration: hiddenSeries.has(si) ? 'line-through' : 'none' }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Chart: DonutChart (card asset status — 算力 tab)
// ══════════════════════════════════════════════════════════════════
function DonutChart({ total, segments, centerLabel, centerValue, size = 160, valueFontSize = T.fz.kpi, labelFontSize = T.fz.sm }: {
  total: number; segments: { value: number; color: string; label: string }[]; centerLabel: string; centerValue: string; size?: number;
  valueFontSize?: number; labelFontSize?: number;
}) {
  const radius = size / 2 - 16, strokeWidth = 20, circumference = 2 * Math.PI * radius;
  let accumulated = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f0f1f3" strokeWidth={strokeWidth} />
      {segments.map((seg, i) => {
        const frac = seg.value / total, dashLen = frac * circumference, dashGap = circumference - dashLen;
        const offset = -accumulated * circumference + circumference * 0.25;
        accumulated += frac;
        return <circle key={i} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={seg.color} strokeWidth={strokeWidth} strokeDasharray={`${dashLen} ${dashGap}`} strokeDashoffset={offset} strokeLinecap="butt" style={{ transition: 'stroke-dasharray 0.5s ease' }} />;
      })}
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" dominantBaseline="middle" fontSize={valueFontSize} fontWeight={700} fill={C.text.pri} fontFamily={T.num}>{centerValue}</text>
      <text x={size / 2} y={size / 2 + valueFontSize * 0.45 + 8} textAnchor="middle" fontSize={labelFontSize} fill={C.text.tri}>{centerLabel}</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
// Chart: SVGLineChart (operations section, 14-point, gradient fill)
// ══════════════════════════════════════════════════════════════════
interface LineData { label: string; data: number[]; color: string; }

function SVGLineChart({ lines, labels, width = 600, height = 240, yUnit = '', showDots = false }: {
  lines: LineData[]; labels: string[]; width?: number; height?: number; yUnit?: string; showDots?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(width);
  const [hover, setHover] = useState<number | null>(null);
  const [hiddenLine, setHiddenLine] = useState<Set<number>>(() => new Set());
  const linesKey = lines.map(l => l.label).join('\u0001');
  useEffect(() => {
    setHiddenLine(new Set());
  }, [linesKey]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => { for (const e of entries) setCw(e.contentRect.width); });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const padL = 48, padR = 16, padT = 16, padB = 36;
  const chartW = cw - padL - padR, chartH = height - padT - padB;
  const visibleLines = lines.filter((_, i) => !hiddenLine.has(i));
  const allVals = visibleLines.flatMap(l => l.data);
  const rawMin = allVals.length ? Math.min(...allVals) : 0;
  const rawMax = allVals.length ? Math.max(...allVals) : 1;
  const range = rawMax - rawMin || 1;
  const yMin = Math.max(0, rawMin - range * 0.1), yMax = rawMax + range * 0.1, yRange = yMax - yMin || 1;
  const yTicks: number[] = [];
  for (let i = 0; i <= 4; i++) yTicks.push(Math.round(yMin + (yRange / 4) * i));
  const n = labels.length;
  const xStep = n > 1 ? chartW / (n - 1) : chartW;
  const getX = (i: number) => padL + i * xStep;
  const getY = (v: number) => padT + chartH - ((v - yMin) / yRange) * chartH;

  const onSvgMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (n < 1 || visibleLines.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * cw;
    if (n === 1) {
      setHover(0);
      return;
    }
    let idx = Math.round((sx - padL) / xStep);
    idx = Math.max(0, Math.min(n - 1, idx));
    setHover(idx);
  };
  const onSvgLeave = () => setHover(null);

  const fmtTip = (v: number | undefined) => {
    if (v === undefined || Number.isNaN(v)) return '—';
    return Number.isInteger(v) ? v.toLocaleString() : (+v).toFixed(1);
  };

  if (!lines.length) {
    return (
      <div ref={containerRef} style={{ width: '100%', padding: 32, textAlign: 'center', color: C.text.qua, fontSize: T.fz.sm }}>暂无数据</div>
    );
  }

  if (!visibleLines.length) {
    return (
      <div ref={containerRef} style={{ width: '100%' }}>
        <div style={{ padding: 24, textAlign: 'center', color: C.text.qua, fontSize: T.fz.sm }}>图例已全部关闭 · 点击下方图例恢复</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 8, paddingLeft: padL }}>
          {lines.map((line, i) => (
            <button
              key={i}
              type="button"
              title="点击显示/隐藏该曲线"
              onClick={() => setHiddenLine(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer', border: 'none', background: 'transparent',
                padding: '4px 6px', borderRadius: 6, opacity: hiddenLine.has(i) ? 0.4 : 1,
              }}
            >
              <div style={{ width: 12, height: 3, borderRadius: 2, background: line.color }} />
              <span style={{ fontSize: T.fz.xs, color: hiddenLine.has(i) ? C.text.qua : C.text.tri, textDecoration: hiddenLine.has(i) ? 'line-through' : 'none' }}>{line.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <svg
          width={cw}
          height={height}
          viewBox={`0 0 ${cw} ${height}`}
          style={{ display: 'block', width: '100%', height: 'auto' }}
          onMouseMove={onSvgMove}
          onMouseLeave={onSvgLeave}
        >
          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={padL} x2={cw - padR} y1={getY(t)} y2={getY(t)} stroke="#f0f1f3" strokeWidth={1} />
              <text x={padL - 6} y={getY(t) + 4} textAnchor="end" fill={C.text.qua} fontSize={11} fontFamily={T.num}>{t}{yUnit}</text>
            </g>
          ))}
          {labels.map((l, i) => {
            if (labels.length > 10 && i % 2 !== 0 && i !== labels.length - 1) return null;
            return <text key={i} x={getX(i)} y={height - 6} textAnchor="middle" fill={C.text.qua} fontSize={10} fontFamily={T.num}>{l}</text>;
          })}
          {lines.map((line, li) => {
            if (hiddenLine.has(li)) return null;
            const points = line.data.map((v, i) => `${getX(i)},${getY(v)}`).join(' ');
            const areaId = `area-${li}-${line.label.replace(/\s/g, '')}`;
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
                {lines.length <= 3 && <polygon points={areaPoints} fill={`url(#${areaId})`} />}
                <polyline points={points} fill="none" stroke={line.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                {showDots && line.data.map((v, i) => (
                  <circle key={i} cx={getX(i)} cy={getY(v)} r={2.5} fill="#fff" stroke={line.color} strokeWidth={1.5} />
                ))}
              </g>
            );
          })}
          {hover !== null && n > 0 && (
            <line x1={getX(hover)} x2={getX(hover)} y1={padT} y2={padT + chartH} stroke="#d9dce0" strokeWidth={1} />
          )}
          {hover !== null && lines.map((line, li) => {
            if (hiddenLine.has(li)) return null;
            const v = line.data[hover];
            if (v === undefined) return null;
            return (
              <circle key={li} cx={getX(hover)} cy={getY(v)} r={4} fill="#fff" stroke={line.color} strokeWidth={2} />
            );
          })}
        </svg>
        {hover !== null && labels[hover] !== undefined && visibleLines.length > 0 && (
          <div
            style={{
              position: 'absolute',
              left: `${(getX(hover) / cw) * 100}%`,
              top: 8,
              transform: 'translateX(-50%)',
              background: S.surface,
              border: `1px solid ${S.line}`,
              borderRadius: 6,
              padding: '8px 12px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              pointerEvents: 'none',
              zIndex: 2,
              minWidth: 120,
              maxWidth: 280,
            }}
          >
            <div style={{ fontSize: T.fz.sm, fontWeight: T.w.semibold, color: C.text.pri, marginBottom: 6, fontFamily: T.num }}>{labels[hover]}</div>
            {lines.map((line, i) => (
              hiddenLine.has(i) ? null : (
                <div key={i} style={{ fontSize: T.fz.sm, color: line.color, marginBottom: 2, fontFamily: T.num, fontVariantNumeric: 'tabular-nums' }}>
                  {line.label}: {fmtTip(line.data[hover])}{yUnit}
                </div>
              )
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 8, paddingLeft: padL, alignItems: 'center' }}>
        {lines.map((line, i) => (
          <button
            key={i}
            type="button"
            title="点击显示/隐藏该曲线"
            aria-pressed={!hiddenLine.has(i)}
            onClick={() => setHiddenLine(prev => {
              const n = new Set(prev);
              if (n.has(i)) n.delete(i);
              else n.add(i);
              return n;
            })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer', border: 'none', background: 'transparent',
              padding: '4px 6px', borderRadius: 6, opacity: hiddenLine.has(i) ? 0.4 : 1,
            }}
          >
            <div style={{ width: 12, height: 3, borderRadius: 2, background: line.color }} />
            <span style={{ fontSize: T.fz.xs, color: hiddenLine.has(i) ? C.text.qua : C.text.tri, textDecoration: hiddenLine.has(i) ? 'line-through' : 'none' }}>{line.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Chart: SVGDonutChart (message distribution donuts)
// ══════════════════════════════════════════════════════════════════
function SVGDonutChart({ segments, size = 180, thickness = 28, centerLabel, centerValue, legendPosition = 'below' }: {
  segments: { name: string; value: number; color: string }[];
  size?: number; thickness?: number; centerLabel?: string; centerValue?: string;
  legendPosition?: 'below' | 'right';
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  let accumulated = 0;
  const arcs = segments.map(seg => {
    const pct = total > 0 ? seg.value / total : 0;
    const dashLen = pct * circumference, dashGap = circumference - dashLen;
    const offset = -(accumulated * circumference) + circumference * 0.25;
    accumulated += pct;
    return { ...seg, pct, dashLen, dashGap, offset };
  });

  const legendItem = (seg: (typeof segments)[0], i: number) => (
    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, minWidth: 0, flex: '1 1 auto' }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, flexShrink: 0, marginTop: 3 }} />
        <span style={{
          fontSize: 12,
          color: C.text.sec,
          lineHeight: 1.35,
          ...(legendPosition === 'right'
            ? { wordBreak: 'break-all' as const }
            : { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
        }}>{seg.name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.text.pri, fontVariantNumeric: 'tabular-nums' }}>{seg.value.toLocaleString()}</span>
        <span style={{ fontSize: 11, color: C.text.qua, fontVariantNumeric: 'tabular-nums', minWidth: 34, textAlign: 'right' }}>
          {total > 0 ? ((seg.value / total) * 100).toFixed(1) : 0}%
        </span>
      </div>
    </div>
  );

  const legend = legendPosition === 'right' ? (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '8px 14px',
      flex: '1 1 0',
      minWidth: 0,
      alignContent: 'start',
    }}>
      {segments.map((seg, i) => legendItem(seg, i))}
    </div>
  ) : (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginTop: 14,
      width: '100%',
    }}>
      {segments.map((seg, i) => legendItem(seg, i))}
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: legendPosition === 'right' ? 'row' : 'column',
      alignItems: legendPosition === 'right' ? 'flex-start' : 'center',
      gap: legendPosition === 'right' ? 14 : 0,
      width: '100%',
    }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f1f3" strokeWidth={thickness} />
          {arcs.map((arc, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color} strokeWidth={thickness}
              strokeDasharray={`${arc.dashLen} ${arc.dashGap}`} strokeDashoffset={arc.offset}
              strokeLinecap="butt" style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
            />
          ))}
        </svg>
        {(centerLabel || centerValue) && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            {centerValue && <div style={{ fontSize: 20, fontWeight: 700, color: C.text.pri, lineHeight: 1.2 }}>{centerValue}</div>}
            {centerLabel && <div style={{ fontSize: 11, color: C.text.tri, marginTop: 2 }}>{centerLabel}</div>}
          </div>
        )}
      </div>
      {legend}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ProgressBar
// ══════════════════════════════════════════════════════════════════
function ProgressBar({ value, max = 100, color, h = 6 }: { value: number; max?: number; color: string; h?: number }) {
  return (
    <div style={{ height: h, background: '#f2f3f5', borderRadius: h, overflow: 'hidden', width: '100%' }}>
      <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: '100%', background: color, borderRadius: h, transition: 'width 0.5s ease' }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Main Dashboard Component
// ══════════════════════════════════════════════════════════════════
export function AgentMonitorDashboard() {
  const navigate = useNavigate();

  // ── Time range (performance + operations) ──
  const [range, setRange] = useState<TimeRangePreset>('7d');
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

  // ── Agent filter — default: showAverage=true (智能体全览) ──
  const [showAverage, setShowAverage] = useState(true);
  const [enabledAgents, setEnabledAgents] = useState<Set<string>>(() => new Set<string>());
  const [agentFilterOpen, setAgentFilterOpen] = useState(false);
  const [tokenTrendTab, setTokenTrendTab] = useState<'total' | 'model' | 'agent'>('total');
  /** 消息数：与 Token 一致 — total / channel(分渠道) / agent(分智能体) */
  const [messageTrendTab, setMessageTrendTab] = useState<'total' | 'channel' | 'agent'>('total');
  /** Token 趋势图与下方「按模型/按智能体构成」环形图共用：总 Token / Input / Output 口径 */
  const [tokenModelSeriesKind, setTokenModelSeriesKind] = useState<TokenSeriesKind>('total');
  const assetOverviewRef = useRef<HTMLDivElement>(null);
  const [datasetPanelHeight, setDatasetPanelHeight] = useState<number | undefined>(undefined);
  const [datasetAsOfDate, setDatasetAsOfDate] = useState(() => getYesterdayLocalYmd());
  const datasetDateMaxYmd = getYesterdayLocalYmd();
  useEffect(() => {
    const el = assetOverviewRef.current;
    if (!el) return;
    const sync = () => setDatasetPanelHeight(el.offsetHeight);
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, []);

  const onAgentFilterAvgChange = (checked: boolean) => {
    if (checked) {
      setShowAverage(true);
      setEnabledAgents(new Set());
    } else {
      setShowAverage(false);
      setEnabledAgents(new Set(AGENTS[0] ? [AGENTS[0].name] : []));
    }
  };

  const onAgentFilterToggleAgent = (name: string, checked: boolean) => {
    if (checked) {
      setShowAverage(false);
      setEnabledAgents(prev => new Set(prev).add(name));
      return;
    }
    setEnabledAgents(prev => {
      const n = new Set(prev);
      n.delete(name);
      if (n.size === 0) {
        setShowAverage(true);
        return new Set();
      }
      return n;
    });
  };

  useEffect(() => {
    if (!agentFilterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAgentFilterOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [agentFilterOpen]);

  // ── Seed computation ──
  const seed = useMemo(() => {
    if (range === 'custom' && customFrom && customTo) {
      const days = Math.round((customTo.getTime() - customFrom.getTime()) / 86400000) + 1;
      return 1 + days * 0.012;
    }
    return RANGE_SEEDS[range] ?? 1;
  }, [range, customFrom, customTo]);

  // ── Fixed compute values ──
  const fixed = {
    servers: MOCK_COMPUTE.servers,
    vcpu: MOCK_COMPUTE.vcpu, memory: MOCK_COMPUTE.memory, fp16: MOCK_COMPUTE.fp16,
    cardTotal: MOCK_COMPUTE.cardTotal, cardIdle: MOCK_COMPUTE.cardIdle, cardFault: MOCK_COMPUTE.cardFault,
    cardInUse: MOCK_COMPUTE.cardTotal - MOCK_COMPUTE.cardIdle - MOCK_COMPUTE.cardFault,
    cardServiceRate: MOCK_COMPUTE.cardServiceRate,
  };

  // ── NPU/CPU 实时曲线横轴：按分钟刷新 ──
  const [realtimeMinuteTick, setRealtimeMinuteTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setRealtimeMinuteTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  const realtimeMinuteLabels = useMemo(() => computeRealtimeMinuteLabels(), [realtimeMinuteTick]);
  const computeDataUpdateTime = useMemo(() => formatDataUpdateTime(), [realtimeMinuteTick]);

  // ── 算力 spark 数据（7 点）与 timeLabels：随全局时间范围 seed/range；资源使用趋势横轴为 realtimeMinuteLabels（分钟） ──
  const computeData = useMemo(() => ({
    npuCompute: varySpark(MOCK_COMPUTE.npuCompute, seed),
    npuMemory: varySpark(MOCK_COMPUTE.npuMemory, seed),
    cpuCompute: varySpark(MOCK_COMPUTE.cpuCompute, seed),
    cpuMemory: varySpark(MOCK_COMPUTE.cpuMemory, seed),
    timeLabels: TIME_LABELS_7[range] || TIME_LABELS_7['7d'],
  }), [seed, range]);

  const resourceUsageMem = useMemo(
    () => computeData.npuMemory.map((v, i) => Math.round((v + computeData.cpuMemory[i]) / 2)),
    [computeData],
  );

  // ── Per-agent performance data (time-varied, 7-point) ──
  const agentPerf = useMemo(() => Object.fromEntries(
    Object.entries(AGENT_PERF).map(([name, data]) => [name, {
      tokenRate: varySpark(data.tokenRate, seed),
      latency: varySpark(data.latency, seed).map(v => Math.round(v)),
      qps: varySpark(data.qps, seed),
      successRate: data.successRate.map((v, i) => +(v + Math.sin(i * seed * 2.3) * 0.3).toFixed(1)),
    }])
  ), [seed]);

  // ── Operations data (time-varied, 14-point) ──
  const timeLabels14 = TIME_LABELS_14[range] || TIME_LABELS_14['7d'];
  const D = useMemo(() => {
    if (seed === 1) return DATA_OPS;
    const s = seed;
    const trend = {
      total: varyArr(DATA_OPS.tokensTotalTrend.total, s),
      input: varyArr(DATA_OPS.tokensTotalTrend.input, s),
      output: varyArr(DATA_OPS.tokensTotalTrend.output, s),
    };
    const variedAgent = Object.fromEntries(
      Object.entries(DATA_OPS.tokensByAgent).map(([k, v]) => [k, varyArr(v, s)])
    ) as Record<string, number[]>;
    const mb = computeModelTokenBreakdown(variedAgent, trend);
    return {
      tokensTotalTrend: trend,
      tokensByAgent: variedAgent as typeof DATA_OPS.tokensByAgent,
      tokensByAgentInput: mb.tokensByAgentInput,
      tokensByAgentOutput: mb.tokensByAgentOutput,
      tokensByModel: mb.tokensByModel,
      tokensByModelInput: mb.tokensByModelInput,
      tokensByModelOutput: mb.tokensByModelOutput,
      agentMessages: Object.fromEntries(
        Object.entries(DATA_OPS.agentMessages).map(([k, v]) => [k, varyArr(v, s)])
      ) as typeof DATA_OPS.agentMessages,
      agentDistribution: DATA_OPS.agentDistribution.map(d => ({ ...d, value: varyInt(d.value, s, 0.12) })),
      channelMessages: Object.fromEntries(
        Object.entries(DATA_OPS.channelMessages).map(([k, v]) => [k, varyArr(v, s)])
      ) as typeof DATA_OPS.channelMessages,
      channelDistribution: DATA_OPS.channelDistribution.map(d => ({ ...d, value: varyInt(d.value, s, 0.12) })),
    };
  }, [seed]);

  // ── Filtered performance lines (7-point charts) ──
  const enabledList = AGENTS.filter(a => enabledAgents.has(a.name));
  const perfLines = (metric: 'tokenRate' | 'latency' | 'qps' | 'successRate') => {
    if (showAverage) {
      const allData = AGENTS.map(a => agentPerf[a.name]?.[metric] || []);
      const len = allData[0]?.length || 0;
      const avg = Array.from({ length: len }, (_, i) => {
        const sum = allData.reduce((s, d) => s + (d[i] || 0), 0);
        return +(sum / AGENTS.length).toFixed(1);
      });
      return [{ label: '全部平均', data: avg, color: C.blue }];
    }
    return enabledList.map(a => ({ label: a.name.replace('智能体', ''), data: agentPerf[a.name]?.[metric] || [], color: a.color }));
  };

  /** 性能卡片：与折线图同一口径的最新值与环比（相对上一时点） */
  const perfCardStats = useMemo(() => {
    type PerfM = 'tokenRate' | 'latency' | 'qps' | 'successRate';
    const round = (metric: PerfM, v: number) => {
      if (metric === 'latency') return Math.round(v);
      return +v.toFixed(1);
    };
    const take = (metric: PerfM) => {
      if (showAverage) {
        const allData = AGENTS.map(a => agentPerf[a.name]?.[metric] || []);
        const len = allData[0]?.length || 0;
        if (!len) return { cur: null as number | null, delta: null as number | null };
        const avg = Array.from({ length: len }, (_, i) => {
          const sum = allData.reduce((s, d) => s + (d[i] || 0), 0);
          return +(sum / AGENTS.length).toFixed(1);
        });
        const cur = avg[len - 1] ?? 0;
        const prev = len > 1 ? avg[len - 2] : cur;
        return { cur: round(metric, cur), delta: round(metric, cur - prev) };
      }
      const list = AGENTS.filter(a => enabledAgents.has(a.name));
      if (!list.length) return { cur: null as number | null, delta: null as number | null };
      const len = list[0] ? (agentPerf[list[0].name]?.[metric]?.length || 0) : 0;
      if (!len) return { cur: null, delta: null };
      const lastIdx = len - 1;
      const curAvg = list.reduce((s, a) => s + (agentPerf[a.name]?.[metric]?.[lastIdx] ?? 0), 0) / list.length;
      const prevAvg = lastIdx > 0
        ? list.reduce((s, a) => s + (agentPerf[a.name]?.[metric]?.[lastIdx - 1] ?? 0), 0) / list.length
        : curAvg;
      return { cur: round(metric, curAvg), delta: round(metric, curAvg - prevAvg) };
    };
    return {
      qps: take('qps'),
      tokenRate: take('tokenRate'),
      latency: take('latency'),
      successRate: take('successRate'),
    };
  }, [agentPerf, showAverage, enabledAgents]);

  /** 分 Agent 消息趋势：固定为「我的智能体」中的全部 Agent（与 AGENTS 一致），不受顶部筛选影响 */
  const messageTrendByAllAgentsLines = useMemo(
    () =>
      AGENTS.map(a => ({
        label: a.name.replace('智能体', ''),
        data: D.agentMessages[a.name] || [],
        color: a.color,
      })),
    [D],
  );
  const allAgentsMessagesIntervalSum = useMemo(
    () =>
      AGENTS.reduce(
        (s, a) => s + (D.agentMessages[a.name] || []).reduce((s2, v) => s2 + v, 0),
        0,
      ),
    [D],
  );

  /** Tokens 按智能体：与「按模型」共用 tokenModelSeriesKind，切换总/Input/Output */
  const tokenAgentTrendLines = useMemo(() => {
    const map =
      tokenModelSeriesKind === 'total' ? D.tokensByAgent
      : tokenModelSeriesKind === 'input' ? D.tokensByAgentInput
        : D.tokensByAgentOutput;
    const list = showAverage ? AGENTS : AGENTS.filter(a => enabledAgents.has(a.name));
    return list.map(a => ({
      label: a.name.replace('智能体', ''),
      data: map[a.name] || [],
      color: a.color,
    }));
  }, [D, showAverage, enabledAgents, tokenModelSeriesKind]);

  // ── Agent distribution donut (filtered) ──
  const filteredAgentDistribution = useMemo(() => {
    const list = showAverage ? AGENTS : AGENTS.filter(a => enabledAgents.has(a.name));
    return list.map(a => ({
      name: a.name.replace('智能体', ''),
      value: Math.round((D.agentMessages[a.name] || []).reduce((s: number, v: number) => s + v, 0) / 14),
      color: a.color,
    }));
  }, [enabledAgents, showAverage, D]);
  const filteredTotalMessages = filteredAgentDistribution.reduce((s, d) => s + d.value, 0);

  /** 按「我的智能体」业务模型名的折线序列（随 tokenModelSeriesKind 切换总/Input/Output） */
  const tokenModelLines = useMemo(() => {
    const map =
      tokenModelSeriesKind === 'total' ? D.tokensByModel
      : tokenModelSeriesKind === 'input' ? D.tokensByModelInput
        : D.tokensByModelOutput;
    const entries = Object.entries(map).sort(([a], [b]) => a.localeCompare(b, 'zh-CN'));
    return entries.map(([label, data], i) => ({
      label,
      data,
      color: MODEL_TREND_LINE_COLORS[i % MODEL_TREND_LINE_COLORS.length],
    }));
  }, [D, tokenModelSeriesKind]);

  /** 最新时点 Token 按业务模型构成（K）— 环形图；口径与 tokenModelSeriesKind 一致 */
  const tokenModelDonutSegments = useMemo(() => {
    const last = (arr: number[]) => arr[arr.length - 1] ?? 0;
    const map =
      tokenModelSeriesKind === 'total' ? D.tokensByModel
      : tokenModelSeriesKind === 'input' ? D.tokensByModelInput
        : D.tokensByModelOutput;
    const sortedKeys = Object.keys(map).sort((a, b) => a.localeCompare(b, 'zh-CN'));
    const colorByName = new Map(
      sortedKeys.map((k, i) => [k, MODEL_TREND_LINE_COLORS[i % MODEL_TREND_LINE_COLORS.length]]),
    );
    const rows = Object.entries(map)
      .map(([name, arr]) => ({
        name,
        value: Math.max(0, last(arr)),
        color: colorByName.get(name) || C.text.qua,
      }))
      .filter(r => r.value > 0)
      .sort((a, b) => b.value - a.value);
    if (rows.length === 0) return [] as { name: string; value: number; color: string }[];
    const top = rows.slice(0, 8);
    const restSum = rows.slice(8).reduce((s, r) => s + r.value, 0);
    if (restSum > 0) top.push({ name: '其他', value: restSum, color: C.text.qua });
    return top;
  }, [D, tokenModelSeriesKind]);

  /** 最新时点 Token 按智能体构成（K）；口径与筛选、tokenModelSeriesKind 一致 */
  const tokenAgentDonutSegments = useMemo(() => {
    const last = (arr: number[]) => arr[arr.length - 1] ?? 0;
    const agentMap =
      tokenModelSeriesKind === 'total' ? D.tokensByAgent
      : tokenModelSeriesKind === 'input' ? D.tokensByAgentInput
        : D.tokensByAgentOutput;
    const list = showAverage ? AGENTS : AGENTS.filter(a => enabledAgents.has(a.name));
    const rows = list
      .map(a => ({ name: a.name.replace('智能体', ''), value: Math.max(0, last(agentMap[a.name] || [])), color: a.color }))
      .filter(r => r.value > 0)
      .sort((a, b) => b.value - a.value);
    if (rows.length === 0) return [] as { name: string; value: number; color: string }[];
    const top = rows.slice(0, 8);
    const restSum = rows.slice(8).reduce((s, r) => s + r.value, 0);
    if (restSum > 0) top.push({ name: '其他', value: restSum, color: C.text.qua });
    return top;
  }, [D, showAverage, enabledAgents, tokenModelSeriesKind]);

  // ── Summary stats ──
  const datasetRowsSplit = useMemo(() => {
    const rows = MOCK_DATASET_LIST;
    const mid = Math.ceil(rows.length / 2);
    return [rows.slice(0, mid), rows.slice(mid)] as const;
  }, []);
  const latestTotalTokens = D.tokensTotalTrend.total[D.tokensTotalTrend.total.length - 1];
  const totalChannelMessages = D.channelDistribution.reduce((s, d) => s + d.value, 0);

  /** 与智能体筛选一致：每点为「当日」单日消息量（各智能体相加）；日与日独立、非累加，故呈起伏 */
  const totalMessagesTimeSeries = useMemo(() => {
    const agents = showAverage ? AGENTS : AGENTS.filter(a => enabledAgents.has(a.name));
    if (!agents.length) return [] as number[];
    const n = D.agentMessages[agents[0].name]?.length ?? 0;
    return Array.from({ length: n }, (_, i) =>
      agents.reduce((s, a) => s + (D.agentMessages[a.name]?.[i] ?? 0), 0),
    );
  }, [D, showAverage, enabledAgents]);

  const cs: React.CSSProperties = {
    background: S.surface,
    border: `1px solid ${S.line}`,
    borderRadius: S.radius,
    padding: 16,
    boxShadow: S.shadow,
  };

  const csPanel: React.CSSProperties = {
    background: S.surface,
    border: `1px solid ${S.line}`,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
  };

  /** 算力 / 数据集 / 应用区块共用：标签与时间为灰色 */
  const dataUpdateTimeFooter = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: T.fz.sm, color: C.text.qua }}>
        <span>数据更新时间</span>
        <span style={{ fontFamily: T.num, fontVariantNumeric: 'tabular-nums' }}>{computeDataUpdateTime}</span>
      </div>
    </div>
  );

  const sectionHeader = (title: string, icon: React.ReactNode, right?: React.ReactNode, footer?: React.ReactNode) => (
    <div style={{ marginBottom: footer ? 16 : 12, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ width: 3, height: 14, borderRadius: 1, background: C.blue, flexShrink: 0 }} />
        <span style={{ color: C.text.tri, display: 'flex', flexShrink: 0 }}>{icon}</span>
        <h2 style={{ fontSize: T.fz.h2, fontWeight: T.w.semibold, color: C.text.pri, margin: 0, letterSpacing: '-0.02em' }}>{title}</h2>
        <div style={{ flex: 1, minWidth: 8, height: 1, background: S.line, alignSelf: 'center' }} />
        {right}
      </div>
      {footer}
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // Render
  // ══════════════════════════════════════════════════════════════
  const agentFilterModal = agentFilterOpen && createPortal(
    <>
      <div
        role="presentation"
        onClick={() => setAgentFilterOpen(false)}
        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15, 23, 42, 0.35)' }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-filter-title"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 201,
          width: 'min(440px, calc(100vw - 32px))',
          maxHeight: 'min(72vh, 640px)',
          display: 'flex',
          flexDirection: 'column',
          background: S.surface,
          borderRadius: 12,
          border: `1px solid ${S.line}`,
          boxShadow: '0 16px 48px rgba(15, 23, 42, 0.14)',
          overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 16px',
          borderBottom: `1px solid ${S.line}`,
          flexShrink: 0,
        }}>
          <h2 id="agent-filter-title" style={{ margin: 0, fontSize: T.fz.body, fontWeight: T.w.semibold, color: C.text.sec }}>
            智能体筛选
          </h2>
          <button
            type="button"
            onClick={() => setAgentFilterOpen(false)}
            aria-label="关闭"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              padding: 0,
              border: 'none',
              borderRadius: 8,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <X size={18} strokeWidth={1.75} color={C.text.tri} />
          </button>
        </div>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${S.line}`, flexShrink: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: T.fz.sm, color: C.text.pri }}>
            <input
              type="checkbox"
              checked={showAverage}
              onChange={e => onAgentFilterAvgChange(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: C.blue, cursor: 'pointer' }}
            />
            <span style={{ fontWeight: T.w.medium }}>智能体全览（全部平均）</span>
          </label>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '8px 16px 16px' }}>
          <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginBottom: 8, letterSpacing: '0.02em' }}>多选对比各智能体曲线</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {AGENTS.map(a => (
              <label
                key={a.name}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: 8,
                  fontSize: T.fz.sm,
                  color: C.text.sec,
                }}
              >
                <input
                  type="checkbox"
                  checked={!showAverage && enabledAgents.has(a.name)}
                  onChange={e => {
                    const checked = e.target.checked;
                    if (showAverage && checked) {
                      setShowAverage(false);
                      setEnabledAgents(new Set([a.name]));
                      return;
                    }
                    if (!showAverage) onAgentFilterToggleAgent(a.name, checked);
                  }}
                  style={{ width: 16, height: 16, marginTop: 2, accentColor: C.blue, cursor: 'pointer', flexShrink: 0 }}
                />
                <span style={{ lineHeight: 1.45 }}>{a.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );

  return (
    <>
    <div style={{
      minHeight: '100vh',
      background: S.bg,
      fontFamily: T.family,
      fontSize: T.fz.body,
      lineHeight: 1.5,
      WebkitFontSmoothing: 'antialiased',
    }}>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px',
        background: S.surface,
        borderBottom: `1px solid ${S.line}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => navigate('/galaxy')} style={{
            width: 32, height: 32, borderRadius: S.radius, border: `1px solid ${S.lineStrong}`,
            background: S.surface, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
          }}>
            <ArrowLeft size={16} color={C.text.tri} />
          </button>
          <div>
            <h1 style={{ fontSize: T.fz.page, fontWeight: T.w.semibold, color: C.text.pri, margin: 0, lineHeight: 1.35, letterSpacing: '-0.02em' }}>资产看板</h1>
            <p style={{ margin: '4px 0 0', fontSize: T.fz.sm, color: C.text.tri, fontWeight: T.w.normal, lineHeight: 1.4 }}>资源与运营概览</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px 40px', maxWidth: 1440, margin: '0 auto' }}>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Section 1: 算力 (static)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {sectionHeader('算力', <Server size={14} strokeWidth={1.75} color={C.text.tri} />, (
          <TimeRangePicker
            value={range}
            onChange={setRange}
            customFrom={customFrom}
            customTo={customTo}
            onCustomChange={(from, to) => { setCustomFrom(from); setCustomTo(to); }}
          />
        ), dataUpdateTimeFooter)}

        <div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(248px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}>
          <div style={{ ...cs, display: 'flex', flexDirection: 'column', minHeight: 132 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f7f8fa', border: `1px solid ${S.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Server size={16} strokeWidth={1.75} color={C.text.sec} />
              </div>
              <div style={{ fontSize: T.fz.body, color: C.text.tri, fontWeight: T.w.medium }}>智算服务器</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 'auto', paddingTop: 14 }}>
              <span style={{ fontSize: T.fz.kpiL, fontWeight: T.w.semibold, color: C.text.pri, fontFamily: T.num, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{fixed.servers}</span>
              <span style={{ fontSize: T.fz.sm, color: C.text.qua }}>台</span>
            </div>
          </div>

          <div style={{ ...cs, display: 'flex', flexDirection: 'column', minHeight: 132 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f7f8fa', border: `1px solid ${S.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Cpu size={16} strokeWidth={1.75} color={C.text.sec} />
              </div>
              <div style={{ fontSize: T.fz.body, color: C.text.tri, fontWeight: T.w.medium }}>通算资源</div>
            </div>
            <div style={{
              marginTop: 'auto',
              paddingTop: 14,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px 20px',
              alignItems: 'end',
            }}>
              <div>
                <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginBottom: 4, letterSpacing: '0.02em' }}>vCPU</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: T.fz.kpi, fontWeight: T.w.semibold, color: C.text.pri, fontFamily: T.num, fontVariantNumeric: 'tabular-nums' }}>{fixed.vcpu.toLocaleString()}</span>
                  <span style={{ fontSize: T.fz.sm, color: C.text.qua }}>Core</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginBottom: 4, letterSpacing: '0.02em' }}>内存</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: T.fz.kpi, fontWeight: T.w.semibold, color: C.text.pri, fontFamily: T.num, fontVariantNumeric: 'tabular-nums' }}>{fixed.memory.toLocaleString()}</span>
                  <span style={{ fontSize: T.fz.sm, color: C.text.qua }}>G</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...cs, display: 'flex', flexDirection: 'column', minHeight: 132 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f7f8fa', border: `1px solid ${S.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={16} strokeWidth={1.75} color={C.text.sec} />
              </div>
              <div style={{ fontSize: T.fz.body, color: C.text.tri, fontWeight: T.w.medium }}>FP16 峰值算力</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 'auto', paddingTop: 14 }}>
              <span style={{ fontSize: T.fz.kpiL, fontWeight: T.w.semibold, color: C.text.pri, fontFamily: T.num, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{fixed.fp16}</span>
              <span style={{ fontSize: T.fz.sm, color: C.text.qua }}>PFLOPS</span>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 32,
          alignItems: 'stretch',
        }}>
          {/* 左：资源使用趋势（主区域） */}
          <div style={{ ...csPanel, flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: T.fz.body, fontWeight: T.w.semibold, color: C.text.sec }}>资源使用趋势</div>
                <div style={{ fontSize: T.fz.sm, color: C.text.tri, marginTop: 4, lineHeight: 1.45 }}>实时监测 NPU、CPU、内存利用率（最近 7 分钟）</div>
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { label: 'NPU', color: C.blue },
                  { label: 'CPU', color: C.green },
                  { label: '内存', color: '#fa8c16' },
                ].map(x => (
                  <div key={x.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: x.color, flexShrink: 0 }} />
                    <span style={{ fontSize: T.fz.sm, color: C.text.tri }}>{x.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ width: '100%', flex: 1, minHeight: 0 }}>
              <ResourceUsageTrendChart
                labels={realtimeMinuteLabels}
                series={[
                  { label: 'NPU', data: computeData.npuCompute, color: C.blue, areaFill: true },
                  { label: 'CPU', data: computeData.cpuCompute, color: C.green },
                  { label: '内存', data: resourceUsageMem, color: '#fa8c16' },
                ]}
                height={228}
              />
            </div>
          </div>

          {/* 右：算力卡状态（标题区与「资源使用趋势」同一套层级与字色） */}
          <div style={{
            ...csPanel,
            flex: '0 1 320px',
            minWidth: 280,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: T.fz.body, fontWeight: T.w.semibold, color: C.text.sec }}>算力卡状态</div>
                <div style={{ fontSize: T.fz.sm, color: C.text.tri, marginTop: 4, lineHeight: 1.45 }}>各卡服役、空闲与故障分布</div>
              </div>
              <span style={{
                fontSize: T.fz.sm,
                fontWeight: T.w.semibold,
                color: C.green,
                background: 'rgba(0, 181, 120, 0.12)',
                padding: '4px 10px',
                borderRadius: 6,
                whiteSpace: 'nowrap',
                fontVariantNumeric: 'tabular-nums',
                alignSelf: 'flex-start',
              }}>
                服役率 {fixed.cardServiceRate}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flex: 1, minHeight: 0 }}>
              <DonutChart
                total={fixed.cardTotal}
                segments={[
                  { value: fixed.cardInUse, color: C.blue, label: '服役中' },
                  { value: fixed.cardIdle, color: '#c9cdd4', label: '空闲' },
                  { value: fixed.cardFault, color: C.red, label: '故障' },
                ]}
                centerLabel="总卡数"
                centerValue={`${fixed.cardTotal}`}
                size={176}
                valueFontSize={T.fz.donut}
                labelFontSize={T.fz.sm}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {[
                { label: '服役中', value: fixed.cardInUse, dot: C.blue },
                { label: '空闲', value: fixed.cardIdle, dot: '#c9cdd4' },
                { label: '故障', value: fixed.cardFault, dot: C.red },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: row.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: T.fz.sm, color: C.text.tri }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize: T.fz.body, fontWeight: T.w.semibold, color: C.text.pri, fontFamily: T.num, fontVariantNumeric: 'tabular-nums' }}>
                    {row.value.toLocaleString()} 张
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Section 2: 数据集 (static)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {sectionHeader('数据集', <Database size={14} strokeWidth={1.75} color={C.text.tri} />, (
          <SingleDatePicker
            valueYmd={datasetAsOfDate}
            onChangeYmd={v => setDatasetAsOfDate(v > datasetDateMaxYmd ? datasetDateMaxYmd : v)}
            maxYmd={datasetDateMaxYmd}
          />
        ), dataUpdateTimeFooter)}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 32, alignItems: 'flex-start' }}>
          {/* 左：资产概览（与右侧「数据集」面板同一套标题层级与 csPanel 内边距） */}
          <div ref={assetOverviewRef} style={{ ...csPanel, flex: '0 1 300px', minWidth: 260, maxWidth: 340 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: T.fz.body, fontWeight: T.w.semibold, color: C.text.sec }}>资产概览</div>
              <div style={{ fontSize: T.fz.sm, color: C.text.tri, marginTop: 4, lineHeight: 1.45 }}>分类、规模与年度目标</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: '数据集分类', value: `${DATA_ASSET.categoryCount}`, unit: '类' },
                { label: '数据总规模', value: `${DATA_ASSET.scaleTb}`, unit: 'TB' },
                { label: '本月新增 · 数据集', value: `+${DATA_ASSET.monthNewCategories}`, unit: '类', green: true },
                { label: '本月新增 · 数据容量', value: `+${DATA_ASSET.monthNewCapacityTb}`, unit: 'TB', green: true },
              ].map((cell, i) => (
                <div key={i} style={{
                  padding: '12px 12px',
                  background: '#f7f8fa',
                  borderRadius: 8,
                  border: `1px solid ${S.line}`,
                }}>
                  <div style={{ fontSize: T.fz.xs, color: C.text.tri, marginBottom: 6, letterSpacing: '0.02em' }}>{cell.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: T.fz.kpi,
                      fontWeight: T.w.bold,
                      fontFamily: T.num,
                      color: cell.green ? C.green : C.text.pri,
                      fontVariantNumeric: 'tabular-nums',
                    }}>{cell.value}</span>
                    <span style={{ fontSize: T.fz.sm, color: cell.green ? C.green : C.text.tri }}>{cell.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: T.fz.sm, color: C.text.sec }}>年度目标完成率</span>
                <span style={{ fontSize: T.fz.sm, color: C.blue, fontFamily: T.num, fontWeight: T.w.semibold }}>{DATA_ASSET.annualPct}%</span>
              </div>
              <ProgressBar value={DATA_ASSET.annualCompleted} max={DATA_ASSET.annualTarget} color={C.blue} h={6} />
              <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginTop: 4 }}>
                已完成 {DATA_ASSET.annualCompleted} 个，年度总目标 {DATA_ASSET.annualTarget} 个数据集
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: T.fz.sm, color: C.text.sec }}>目标容量完成率</span>
                <span style={{ fontSize: T.fz.sm, color: C.green, fontFamily: T.num, fontWeight: T.w.semibold }}>{DATA_ASSET.completedPct}%</span>
              </div>
              <ProgressBar value={DATA_ASSET.completedTb} max={DATA_ASSET.capacityTargetTb} color={C.green} h={6} />
              <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginTop: 4 }}>
                已完成 {DATA_ASSET.completedTb} TB，总目标容量 {DATA_ASSET.capacityTargetTb} TB
              </div>
            </div>
          </div>

          {/* 右：数据集 */}
          <div style={{
            ...csPanel,
            flex: '1 1 0',
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: datasetPanelHeight !== undefined ? datasetPanelHeight : undefined,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              flexShrink: 0,
              marginBottom: 12,
            }}>
              <div>
                <div style={{ fontSize: T.fz.body, fontWeight: T.w.semibold, color: C.text.sec }}>数据集</div>
                <div style={{ fontSize: T.fz.sm, color: C.text.tri, marginTop: 4, lineHeight: 1.45 }}>各业务域清单与规模</div>
              </div>
              <span style={{
                fontSize: T.fz.sm,
                fontWeight: T.w.semibold,
                color: C.text.sec,
                background: '#f0f1f3',
                padding: '4px 10px',
                borderRadius: 6,
                whiteSpace: 'nowrap',
                fontVariantNumeric: 'tabular-nums',
                alignSelf: 'flex-start',
              }}>{DATA_ASSET.datasetTotal} Total</span>
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {MOCK_DATASET_LIST.length === 0 ? (
                <div style={{
                  margin: '8px 0 0',
                  padding: 28,
                  textAlign: 'center',
                  color: C.text.tri,
                  fontSize: T.fz.sm,
                  background: '#f7f8fa',
                  borderRadius: 8,
                  border: `1px dashed ${S.line}`,
                }}>暂无数据</div>
              ) : (
                <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', paddingTop: 4 }}>
                  {datasetRowsSplit.map((colRows, colIdx) => (
                    <div
                      key={colIdx}
                      style={{
                        flex: '1 1 0',
                        minWidth: 0,
                        border: `1px solid ${S.line}`,
                        borderRadius: 8,
                        overflow: 'hidden',
                        background: S.surface,
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                      }}
                    >
                      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                        <colgroup>
                          <col style={{ width: '40%' }} />
                          <col style={{ width: '15%' }} />
                          <col style={{ width: '17%' }} />
                          <col style={{ width: '28%' }} />
                        </colgroup>
                        <thead>
                          <tr>
                            {DATASET_TABLE_HEADERS.map(h => (
                              <th key={h} style={{
                                padding: '9px 12px',
                                textAlign: 'left',
                                fontSize: T.fz.xs,
                                fontWeight: T.w.semibold,
                                color: C.text.sec,
                                letterSpacing: '0.02em',
                                borderBottom: `1px solid ${S.line}`,
                                whiteSpace: 'nowrap',
                                position: 'sticky',
                                top: 0,
                                zIndex: 1,
                                background: '#f7f8fa',
                                boxShadow: `inset 0 -1px 0 ${S.line}`,
                              }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {colRows.map((row, i) => {
                            const isLast = i === colRows.length - 1;
                            const st = row.status === '已完成'
                              ? { bg: 'rgba(0,181,120,0.1)', c: C.green }
                              : row.status === '进行中'
                                ? { bg: 'rgba(22,119,255,0.1)', c: C.blue }
                                : { bg: 'rgba(250,140,22,0.12)', c: '#d97706' };
                            const rowBg = i % 2 === 0 ? S.surface : '#fafbfd';
                            const cellB = isLast ? 'none' : `1px solid ${S.line}`;
                            return (
                              <tr key={`${row.category}-${row.date}-${row.scale}-${colIdx}-${i}`} style={{ background: rowBg }}>
                                <td style={{ padding: '10px 12px', borderBottom: cellB, overflow: 'hidden', verticalAlign: 'middle' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: 999, background: row.categoryDot, flexShrink: 0 }} />
                                    <span
                                      title={row.category}
                                      style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontSize: T.fz.sm,
                                        fontWeight: T.w.medium,
                                        color: C.text.pri,
                                      }}
                                    >
                                      {row.category}
                                    </span>
                                  </div>
                                </td>
                                <td style={{
                                  padding: '10px 12px',
                                  borderBottom: cellB,
                                  fontSize: T.fz.sm,
                                  fontWeight: T.w.semibold,
                                  fontFamily: T.num,
                                  fontVariantNumeric: 'tabular-nums',
                                  color: C.text.pri,
                                  verticalAlign: 'middle',
                                }}>{row.scale}</td>
                                <td style={{ padding: '10px 12px', borderBottom: cellB, verticalAlign: 'middle' }}>
                                  <span style={{ fontSize: T.fz.cap, fontWeight: T.w.semibold, padding: '3px 8px', borderRadius: 999, background: st.bg, color: st.c }}>{row.status}</span>
                                </td>
                                <td style={{
                                  padding: '10px 12px',
                                  borderBottom: cellB,
                                  fontSize: T.fz.sm,
                                  color: C.text.sec,
                                  whiteSpace: 'nowrap',
                                  fontFamily: T.num,
                                  fontVariantNumeric: 'tabular-nums',
                                  verticalAlign: 'middle',
                                }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <Clock size={13} strokeWidth={1.75} color={C.text.qua} />
                                    {row.date}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }} />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Section 3: 应用 (time-dependent)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{ marginTop: 24 }}>
          {sectionHeader('应用', <BarChart3 size={14} strokeWidth={1.75} color={C.text.tri} />, (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <TimeRangePicker
                value={range}
                onChange={setRange}
                customFrom={customFrom}
                customTo={customTo}
                onCustomChange={(from, to) => { setCustomFrom(from); setCustomTo(to); }}
              />
              <button
                type="button"
                onClick={() => setAgentFilterOpen(true)}
                aria-label="打开智能体筛选"
                aria-expanded={agentFilterOpen}
                aria-haspopup="dialog"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  padding: 0,
                  borderRadius: 8,
                  border: `1px solid ${S.lineStrong}`,
                  background: S.surface,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Filter size={16} strokeWidth={1.75} color={C.text.tri} />
              </button>
            </div>
          ), dataUpdateTimeFooter)}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { icon: <BarChart3 size={15} strokeWidth={1.75} color={C.text.sec} />, label: '活跃应用', value: `${MOCK_APP.activeApps}`, unit: '个' },
              { icon: <Activity size={15} strokeWidth={1.75} color={C.text.sec} />, label: '总调用次数', value: MOCK_APP.totalCalls.toLocaleString(), unit: '次' },
              { icon: <Zap size={15} strokeWidth={1.75} color={C.text.sec} />, label: 'LLM Token消耗', value: `${MOCK_APP.llmTokens}M`, unit: '' },
            ].map((card, i) => (
              <div key={i} style={{ ...cs, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: '#f7f8fa', border: `1px solid ${S.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
                  <span style={{ fontSize: T.fz.sm, color: C.text.tri, fontWeight: T.w.normal }}>{card.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontSize: T.fz.kpi, fontWeight: T.w.semibold, color: C.text.pri, fontFamily: T.num, letterSpacing: '-0.02em' }}>{card.value}</span>
                  {card.unit && <span style={{ fontSize: T.fz.sm, color: C.text.qua }}>{card.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...csPanel, marginBottom: 24, padding: '18px 20px 20px' }}>
            <div style={{ marginBottom: 14, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: T.fz.body, fontWeight: T.w.semibold, color: C.text.sec }}>性能</div>
              <span style={{ fontSize: T.fz.xs, color: C.text.qua }}>最新时点 · 环比上一时点</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 268px), 1fr))', gap: 14 }}>
              {([
                { metric: 'qps' as const, title: 'QPS', yUnit: '' as const, group: 'throughput' as const },
                { metric: 'tokenRate' as const, title: 'Token 输出速率', sub: 'TPM', yUnit: 'K' as const, group: 'throughput' as const },
                { metric: 'latency' as const, title: '耗时', yUnit: 'ms' as const, group: 'experience' as const },
                { metric: 'successRate' as const, title: '请求成功率', yUnit: '%' as const, group: 'experience' as const },
              ]).map(row => {
                const st = perfCardStats[row.metric];
                const cur = st.cur;
                const delta = st.delta;
                const eps = row.metric === 'latency' ? 0.5 : 0.05;
                const flat = delta !== null && Math.abs(delta) < eps;
                const good = delta !== null && !flat && (row.metric === 'latency' ? delta < 0 : delta > 0);
                const bad = delta !== null && !flat && (row.metric === 'latency' ? delta > 0 : delta < 0);
                const tone = good ? C.green : bad ? C.red : C.text.qua;
                const fmtCur = () => {
                  if (cur === null) return '—';
                  if (row.metric === 'qps') return cur.toLocaleString(undefined, { maximumFractionDigits: 1 });
                  if (row.metric === 'tokenRate') return `${cur.toFixed(1)}K`;
                  if (row.metric === 'latency') return `${cur}`;
                  return `${cur.toFixed(1)}`;
                };
                const fmtDelta = () => {
                  if (delta === null) return null;
                  if (flat) return '持平';
                  const sign = delta > 0 ? '+' : '';
                  if (row.metric === 'qps') return `${sign}${delta.toFixed(1)}`;
                  if (row.metric === 'tokenRate') return `${sign}${delta.toFixed(1)}K`;
                  if (row.metric === 'latency') return `${sign}${delta} ms`;
                  return `${sign}${delta.toFixed(1)}%`;
                };
                return (
                  <div
                    key={row.metric}
                    style={{
                      background: 'linear-gradient(180deg, #fafbfd 0%, #ffffff 100%)',
                      border: `1px solid ${S.line}`,
                      borderRadius: 10,
                      padding: '14px 14px 10px',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: T.fz.sm, fontWeight: T.w.semibold, color: C.text.sec }}>{row.title}</span>
                          {'sub' in row && row.sub && (
                            <span style={{ fontSize: T.fz.xs, color: C.text.qua, fontWeight: T.w.normal }}>{row.sub}</span>
                          )}
                        </div>
                      </div>
                      {delta !== null && (
                        <div
                          title="相对上一时点"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            flexShrink: 0,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: flat ? `${S.line}80` : good ? 'rgba(0, 181, 120, 0.09)' : bad ? 'rgba(245, 63, 63, 0.09)' : 'transparent',
                          }}
                        >
                          {!flat && good && (row.metric === 'latency'
                            ? <TrendingDown size={12} strokeWidth={2} color={tone} />
                            : <TrendingUp size={12} strokeWidth={2} color={tone} />)}
                          {!flat && bad && (row.metric === 'latency'
                            ? <TrendingUp size={12} strokeWidth={2} color={tone} />
                            : <TrendingDown size={12} strokeWidth={2} color={tone} />)}
                          {flat && <Minus size={12} strokeWidth={2} color={tone} />}
                          <span style={{ fontSize: T.fz.xs, fontWeight: T.w.medium, color: tone, fontFamily: T.num, fontVariantNumeric: 'tabular-nums' }}>{fmtDelta()}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: 22, fontWeight: T.w.semibold, color: C.text.pri, fontFamily: T.num, letterSpacing: '-0.03em', lineHeight: 1.15 }}>{fmtCur()}</span>
                      {row.metric === 'latency' && cur !== null && <span style={{ fontSize: T.fz.sm, color: C.text.qua }}>ms</span>}
                      {row.metric === 'successRate' && cur !== null && <span style={{ fontSize: T.fz.sm, color: C.text.qua }}>%</span>}
                    </div>
                    <div style={{ marginBottom: -4 }}>
                      <MultiLineChart lines={perfLines(row.metric)} labels={computeData.timeLabels} height={152} yUnit={row.yUnit} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Token：Tab 与趋势图同卡片连成一体；下方为最新时点构成 ── */}
          <div style={{ ...csPanel, marginBottom: 24, padding: '18px 20px 20px' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: T.fz.body, fontWeight: T.w.semibold, color: C.text.sec }}>Token</div>
              <div style={{ fontSize: T.fz.sm, color: C.text.tri, marginTop: 4, lineHeight: 1.5 }}>
                使用 Tab 切换总量 / 按模型 / 按智能体趋势；下方为最新时点构成（按模型 / 按智能体均为环形图，单位 K）。
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                width: '100%',
                minWidth: 0,
                background: '#fafbfd',
                border: `1px solid ${S.line}`,
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <div
                role="tablist"
                aria-label="Token 趋势维度"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0,
                  borderBottom: `1px solid ${S.line}`,
                  background: 'rgba(255,255,255,0.55)',
                }}
              >
                {([
                  { id: 'total' as const, label: 'Token 总量' },
                  { id: 'model' as const, label: 'Token 按模型' },
                  { id: 'agent' as const, label: 'Token 按智能体' },
                ]).map(t => {
                  const active = tokenTrendTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setTokenTrendTab(t.id)}
                      style={{
                        position: 'relative',
                        padding: '10px 16px',
                        marginBottom: -1,
                        fontSize: T.fz.sm,
                        fontFamily: T.family,
                        cursor: 'pointer',
                        border: 'none',
                        borderBottom: `2px solid ${active ? C.blue : 'transparent'}`,
                        background: 'transparent',
                        color: active ? C.blue : C.text.sec,
                        fontWeight: active ? T.w.semibold : T.w.normal,
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ padding: '12px 16px 16px' }}>
              {tokenTrendTab === 'total' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginTop: 2 }}>Total / Input / Output (K)</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: T.fz.xs, color: C.text.qua }}>最新总量</div>
                      <div style={{ fontSize: T.fz.xl, fontWeight: T.w.bold, color: C.text.pri, fontFamily: T.num, fontVariantNumeric: 'tabular-nums' }}>{latestTotalTokens}K</div>
                    </div>
                  </div>
                  <SVGLineChart
                    lines={[
                      { label: 'Total', data: D.tokensTotalTrend.total, color: C.blue },
                      { label: 'Input', data: D.tokensTotalTrend.input, color: C.green },
                      { label: 'Output', data: D.tokensTotalTrend.output, color: C.yellow },
                    ]}
                    labels={timeLabels14}
                    height={220}
                    yUnit="K"
                  />
                </>
              )}
              {tokenTrendTab === 'model' && (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                    marginBottom: 12,
                  }}>
                    <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginTop: 2, lineHeight: 1.5, flex: '1 1 200px' }}>
                      {tokenModelSeriesKind === 'total' && '已发布智能体所覆盖的业务模型 · 总 Token（K）'}
                      {tokenModelSeriesKind === 'input' && '各业务模型 Input Token（K）'}
                      {tokenModelSeriesKind === 'output' && '各业务模型 Output Token（K）'}
                    </div>
                    <TokenSeriesKindToggle
                      value={tokenModelSeriesKind}
                      onChange={setTokenModelSeriesKind}
                      ariaLabel="按模型趋势 Token 口径"
                    />
                  </div>
                  {tokenModelLines.length > 0 ? (
                    <SVGLineChart
                      lines={tokenModelLines}
                      labels={timeLabels14}
                      height={220}
                      yUnit="K"
                    />
                  ) : (
                    <div style={{ padding: 32, textAlign: 'center', color: C.text.qua, fontSize: T.fz.sm }}>暂无已发布业务模型数据</div>
                  )}
                </>
              )}
              {tokenTrendTab === 'agent' && (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                    marginBottom: 12,
                  }}>
                    <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginTop: 2, lineHeight: 1.5, flex: '1 1 200px' }}>
                      {tokenModelSeriesKind === 'total' && (showAverage ? '智能体全览：各智能体总 Token（K）' : '已选智能体 · 总 Token（K）')}
                      {tokenModelSeriesKind === 'input' && '各智能体 Input Token（K）'}
                      {tokenModelSeriesKind === 'output' && '各智能体 Output Token（K）'}
                    </div>
                    <TokenSeriesKindToggle
                      value={tokenModelSeriesKind}
                      onChange={setTokenModelSeriesKind}
                      ariaLabel="按智能体趋势 Token 口径"
                    />
                  </div>
                  {tokenAgentTrendLines.length > 0 ? (
                    <SVGLineChart
                      lines={tokenAgentTrendLines}
                      labels={timeLabels14}
                      height={220}
                      yUnit="K"
                    />
                  ) : (
                    <div style={{ padding: 32, textAlign: 'center', color: C.text.qua, fontSize: T.fz.sm }}>请在筛选中勾选智能体</div>
                  )}
                </>
              )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 12 }}>
              <div style={{ background: '#fafbfd', border: `1px solid ${S.line}`, borderRadius: 8, padding: '12px 14px 14px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: T.fz.sm, fontWeight: T.w.semibold, color: C.text.sec }}>Tokens按模型构成</div>
                  <TokenSeriesKindToggle
                    value={tokenModelSeriesKind}
                    onChange={setTokenModelSeriesKind}
                    ariaLabel="按模型构成 Token 口径"
                  />
                </div>
                <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginBottom: 10 }}>
                  最新时点 ·
                  {tokenModelSeriesKind === 'total' && ' 各业务模型总 Token 占比（K）'}
                  {tokenModelSeriesKind === 'input' && ' 各业务模型 Input 占比（K）'}
                  {tokenModelSeriesKind === 'output' && ' 各业务模型 Output 占比（K）'}
                </div>
                {tokenModelDonutSegments.length > 0 && tokenModelDonutSegments.reduce((s, x) => s + x.value, 0) > 0 ? (
                  <SVGDonutChart
                    segments={tokenModelDonutSegments}
                    size={168}
                    thickness={22}
                    centerValue={`${tokenModelDonutSegments.reduce((s, x) => s + x.value, 0)}K`}
                    centerLabel="合计"
                    legendPosition="right"
                  />
                ) : (
                  <div style={{ padding: 24, textAlign: 'center', color: C.text.qua, fontSize: T.fz.sm }}>暂无数据</div>
                )}
              </div>
              <div style={{ background: '#fafbfd', border: `1px solid ${S.line}`, borderRadius: 8, padding: '12px 14px 14px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: T.fz.sm, fontWeight: T.w.semibold, color: C.text.sec }}>Tokens按智能体构成</div>
                  <TokenSeriesKindToggle
                    value={tokenModelSeriesKind}
                    onChange={setTokenModelSeriesKind}
                    ariaLabel="按智能体构成 Token 口径"
                  />
                </div>
                <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginBottom: 10 }}>
                  与当前智能体筛选一致 · 最新时点 ·
                  {tokenModelSeriesKind === 'total' && ' 总 Token（K）'}
                  {tokenModelSeriesKind === 'input' && ' Input（K）'}
                  {tokenModelSeriesKind === 'output' && ' Output（K）'}
                </div>
                {tokenAgentDonutSegments.length > 0 && tokenAgentDonutSegments.reduce((s, x) => s + x.value, 0) > 0 ? (
                  <SVGDonutChart
                    segments={tokenAgentDonutSegments}
                    size={168}
                    thickness={22}
                    centerValue={`${tokenAgentDonutSegments.reduce((s, x) => s + x.value, 0)}K`}
                    centerLabel="合计"
                    legendPosition="right"
                  />
                ) : (
                  <div style={{ padding: 24, textAlign: 'center', color: C.text.qua, fontSize: T.fz.sm }}>暂无数据</div>
                )}
              </div>
            </div>
            </div>
          </div>

          {/* ── 消息数：结构同 Token（Tab 内嵌趋势卡 + 下方构成） ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ ...csPanel, marginBottom: 0, padding: '18px 20px 20px' }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: T.fz.body, fontWeight: T.w.semibold, color: C.text.sec }}>消息数</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div
                  style={{
                    width: '100%',
                    minWidth: 0,
                    background: '#fafbfd',
                    border: `1px solid ${S.line}`,
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    role="tablist"
                    aria-label="消息趋势维度"
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 0,
                      borderBottom: `1px solid ${S.line}`,
                      background: 'rgba(255,255,255,0.55)',
                    }}
                  >
                    {([
                      { id: 'total' as const, label: '消息趋势' },
                      { id: 'channel' as const, label: '分渠道消息' },
                      { id: 'agent' as const, label: '分 Agent 消息' },
                    ]).map(t => {
                      const active = messageTrendTab === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setMessageTrendTab(t.id)}
                          style={{
                            position: 'relative',
                            padding: '10px 16px',
                            marginBottom: -1,
                            fontSize: T.fz.sm,
                            fontFamily: T.family,
                            cursor: 'pointer',
                            border: 'none',
                            borderBottom: `2px solid ${active ? C.blue : 'transparent'}`,
                            background: 'transparent',
                            color: active ? C.blue : C.text.sec,
                            fontWeight: active ? T.w.semibold : T.w.normal,
                          }}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ padding: '12px 16px 16px' }}>
                    {messageTrendTab === 'total' && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginTop: 2, lineHeight: 1.5 }}>
                              分日离散：每点为当日消息量（已选智能体合计），日与日独立、非累加，曲线呈起伏波动
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: T.fz.xs, color: C.text.qua }}>最近一日</div>
                            <div style={{ fontSize: T.fz.xl, fontWeight: T.w.bold, color: C.text.pri, fontFamily: T.num, fontVariantNumeric: 'tabular-nums' }}>
                              {totalMessagesTimeSeries.length > 0
                                ? totalMessagesTimeSeries[totalMessagesTimeSeries.length - 1].toLocaleString()
                                : '—'}
                            </div>
                            <div style={{ fontSize: T.fz.cap, color: C.text.qua, marginTop: 6 }}>
                              区间总量（各日单日量之和）
                              <span style={{ color: C.text.tri, fontFamily: T.num, fontVariantNumeric: 'tabular-nums', marginLeft: 4 }}>
                                {totalMessagesTimeSeries.length > 0
                                  ? totalMessagesTimeSeries.reduce((s, v) => s + v, 0).toLocaleString()
                                  : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                        {totalMessagesTimeSeries.length > 0 ? (
                          <SVGLineChart
                            lines={[{ label: '日消息量', data: totalMessagesTimeSeries, color: C.blue }]}
                            labels={timeLabels14}
                            height={220}
                          />
                        ) : (
                          <div style={{ padding: 32, textAlign: 'center', color: C.text.qua, fontSize: T.fz.sm }}>请在筛选中勾选智能体</div>
                        )}
                      </>
                    )}
                    {messageTrendTab === 'channel' && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginTop: 2, lineHeight: 1.5, flex: '1 1 200px' }}>
                            智能体调试 / API 调用 / 网页访问 · 各渠道消息量时间序列
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: T.fz.xs, color: C.text.qua }}>区间总消息</div>
                            <div style={{ fontSize: T.fz.xl, fontWeight: T.w.bold, color: C.text.pri, fontFamily: T.num, fontVariantNumeric: 'tabular-nums' }}>{totalChannelMessages.toLocaleString()}</div>
                          </div>
                        </div>
                        <SVGLineChart
                          lines={Object.entries(D.channelMessages).map(([name, data], i) => ({
                            label: name, data, color: CHANNELS[i]?.color || C.text.qua,
                          }))}
                          labels={timeLabels14}
                          height={220}
                        />
                      </>
                    )}
                    {messageTrendTab === 'agent' && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                          <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginTop: 2, lineHeight: 1.5, flex: '1 1 200px' }}>
                            我的智能体全部（{AGENTS.length} 个）· 各智能体消息量时间序列
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: T.fz.xs, color: C.text.qua }}>区间总消息</div>
                            <div style={{ fontSize: T.fz.xl, fontWeight: T.w.bold, color: C.text.pri, fontFamily: T.num, fontVariantNumeric: 'tabular-nums' }}>{allAgentsMessagesIntervalSum.toLocaleString()}</div>
                          </div>
                        </div>
                        <SVGLineChart
                          lines={messageTrendByAllAgentsLines}
                          labels={timeLabels14}
                          height={220}
                        />
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 12 }}>
                  <div style={{ background: '#fafbfd', border: `1px solid ${S.line}`, borderRadius: 8, padding: '12px 14px 14px', minWidth: 0 }}>
                    <div style={{ fontSize: T.fz.sm, fontWeight: T.w.semibold, color: C.text.sec, marginBottom: 10 }}>消息数按渠道构成</div>
                    <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginBottom: 10 }}>最新时点 · 各渠道消息占比</div>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                      <SVGDonutChart
                        segments={D.channelDistribution}
                        size={168}
                        thickness={22}
                        centerValue={totalChannelMessages.toLocaleString()}
                        centerLabel="总消息数"
                        legendPosition="right"
                      />
                    </div>
                  </div>
                  <div style={{ background: '#fafbfd', border: `1px solid ${S.line}`, borderRadius: 8, padding: '12px 14px 14px', minWidth: 0 }}>
                    <div style={{ fontSize: T.fz.sm, fontWeight: T.w.semibold, color: C.text.sec, marginBottom: 10 }}>消息数按智能体构成</div>
                    <div style={{ fontSize: T.fz.xs, color: C.text.qua, marginBottom: 10 }}>与当前智能体筛选一致 · 最新时点 · 各智能体消息占比</div>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                      <div style={{ flexShrink: 0 }}>
                        {(() => {
                          const segs = filteredAgentDistribution;
                          const total = segs.reduce((s, x) => s + x.value, 0);
                          const sz = 150, tk = 24, r = (sz - tk) / 2, circ = 2 * Math.PI * r;
                          let acc = 0;
                          return (
                            <div style={{ position: 'relative', width: sz, height: sz }}>
                              <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
                                <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#f0f1f3" strokeWidth={tk} />
                                {segs.map((seg, i) => {
                                  const pct = total > 0 ? seg.value / total : 0;
                                  const dashLen = pct * circ, dashGap = circ - dashLen;
                                  const offset = -(acc * circ) + circ * 0.25;
                                  acc += pct;
                                  return <circle key={i} cx={sz/2} cy={sz/2} r={r} fill="none" stroke={seg.color} strokeWidth={tk} strokeDasharray={`${dashLen} ${dashGap}`} strokeDashoffset={offset} strokeLinecap="butt" />;
                                })}
                              </svg>
                              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                                <div style={{ fontSize: T.fz.page, fontWeight: T.w.bold, color: C.text.pri, lineHeight: 1.2, fontFamily: T.num }}>{filteredTotalMessages.toLocaleString()}</div>
                                <div style={{ fontSize: T.fz.cap, color: C.text.tri, marginTop: 2 }}>总消息数</div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <div style={{ flex: 1, maxHeight: 160, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', alignContent: 'start' }}>
                        {filteredAgentDistribution.map((seg, i) => {
                          const total = filteredTotalMessages;
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 0', minWidth: 0 }}>
                              <div style={{ width: 6, height: 6, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
                              <span style={{ fontSize: T.fz.xs, color: C.text.sec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{seg.name}</span>
                              <span style={{ fontSize: T.fz.cap, color: C.text.qua, flexShrink: 0, fontFamily: T.num, fontVariantNumeric: 'tabular-nums' }}>{total > 0 ? ((seg.value / total) * 100).toFixed(0) : 0}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...csPanel, marginTop: 24, padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 18px',
              borderBottom: `1px solid ${S.line}`,
              background: '#fafbfd',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: T.fz.body, fontWeight: T.w.semibold, color: C.text.sec }}>
                智能体效果监控
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: T.fz.sm, color: C.text.tri }}>
                  达标率：<span style={{ fontFamily: T.num, fontWeight: T.w.semibold, color: C.text.pri }}>{AGENT_EFFECTIVENESS_ROWS.length}/{AGENT_EFFECTIVENESS_ROWS.length}</span> 达标
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 10px', borderRadius: 4,
                  background: '#00b578', color: '#fff',
                  fontSize: T.fz.sm, fontWeight: T.w.semibold, letterSpacing: 1,
                }}>
                  优
                </span>
              </div>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', fontSize: T.fz.body }}>
              <thead>
                <tr style={{ background: '#f8f9fc' }}>
                  {[
                    { label: '序号', align: 'center' as const, width: 52 },
                    { label: '智能体名称', align: 'left' as const, width: undefined },
                    { label: '核心评估指标', align: 'left' as const, width: undefined },
                    { label: '实际值', align: 'center' as const, width: 100 },
                    { label: '当前状态', align: 'center' as const, width: 80 },
                  ].map(col => (
                    <th
                      key={col.label}
                      style={{
                        padding: '11px 16px',
                        textAlign: col.align,
                        color: C.text.tri,
                        fontWeight: T.w.medium,
                        fontSize: T.fz.sm,
                        borderBottom: `1px solid ${S.line}`,
                        whiteSpace: 'nowrap',
                        width: col.width,
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AGENT_EFFECTIVENESS_ROWS.map((row, i) => {
                  return (
                    <tr
                      key={`${row.name}-${i}`}
                      style={{ background: i % 2 === 0 ? S.surface : '#fafbfd' }}
                    >
                      <td
                        style={{
                          padding: '12px 16px',
                          textAlign: 'center',
                          color: C.text.tri,
                          fontWeight: T.w.medium,
                          fontSize: T.fz.sm,
                          borderBottom: `1px solid ${S.line}`,
                          verticalAlign: 'top',
                          fontFamily: T.num,
                        }}
                      >
                        {i + 1}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          color: C.text.pri,
                          fontWeight: T.w.medium,
                          borderBottom: `1px solid ${S.line}`,
                          verticalAlign: 'top',
                          maxWidth: 200,
                        }}
                      >
                        {row.name}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          color: C.text.sec,
                          borderBottom: `1px solid ${S.line}`,
                          verticalAlign: 'top',
                          lineHeight: 1.55,
                        }}
                      >
                        {row.kpi}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          textAlign: 'center',
                          borderBottom: `1px solid ${S.line}`,
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap',
                          fontFamily: T.num,
                          fontWeight: T.w.semibold,
                          color: C.text.pri,
                          fontSize: T.fz.body,
                        }}
                      >
                        {row.actual}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          textAlign: 'center',
                          borderBottom: `1px solid ${S.line}`,
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{ fontSize: T.fz.sm, fontWeight: T.w.medium, color: '#00b578' }}>{row.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
    {agentFilterModal}
    </>
  );
}

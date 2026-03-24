import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { mockAgents } from '../../data/mockData';
import {
  Play, ZoomIn, ZoomOut, Plus, Search, Pencil, RefreshCw, ArrowLeft,
  CheckCircle2, Loader2, LayoutGrid, Maximize2,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, X, AlertTriangle, Bot, Cpu, Wrench,
  BarChart3, ShieldCheck,
  FileText, Circle, Zap, Activity, Database, Clock,
  Layers, Share2, Send, Paperclip,
  Rocket, Copy, Check, MoreVertical, Trash2,
} from 'lucide-react';

function delayMs(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ==================== Types ====================
interface WorkflowStep {
  id: string;
  index: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed';
  color: string;
  model?: string;
  tools?: string[];
  subAgents?: {
    name: string;
    role: string;
    tags?: string[];
    icon?: 'chart' | 'shield' | 'file';
    /** 多智能体组内步骤说明，如「① 素材聚合」 */
    phase?: string;
  }[];
  group?: { name: string; description: string };
}

interface ThinkingStep {
  id: string;
  phase: string;
  label: string;
  duration: string;
  subSteps?: { text: string; duration: string }[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ExecutionStats {
  progress: number;
  stepsCompleted: number;
  totalSteps: number;
  successCount: number;
  expectedCount: number;
  errors: number;
  tokenUsage: { input: number; output: number; total: number; budget: number };
  cost: { current: number; budget: number };
  latency: number;
  avgPerStep: number;
}

type AgentLogBadge = 'ok' | 'neutral' | 'warn' | 'err';

interface AgentRunSubLine {
  text: string;
  ms: string;
  s1: AgentLogBadge;
  s2: AgentLogBadge;
}

/** 用于生成与该智能体/步骤相关的执行明细文案 */
interface AgentExecutionContext {
  title: string;
  description?: string;
  tools?: string[];
  model?: string;
}

interface AgentRunDetail {
  stepIndex: number;
  stepId: string;
  name: string;
  status: 'pending' | 'running' | 'success';
  timeLabel: string;
  durationSec?: number;
  lines: AgentRunSubLine[];
  execCtx: AgentExecutionContext;
}

/** 结束节点仅保留步骤卡，不挂智能体卡片 */
function shouldShowAgentCardBelowStep(step: WorkflowStep): boolean {
  return (step.subAgents?.length ?? 0) > 0 && step.title !== '结束';
}

function agentLine(
  text: string,
  baseMs: number,
  stepIndex: number,
  s1: AgentLogBadge,
  s2: AgentLogBadge
): AgentRunSubLine {
  const ms = baseMs + (stepIndex % 7) * 0.04 + (stepIndex % 3) * 0.02;
  return { text, ms: `${ms.toFixed(1)}s`, s1, s2 };
}

/** 运行中：两行占位，文案随步骤变化 */
const RUNNING_LINES_BY_TITLE: Record<string, [string, string]> = {
  查询智能体基础信息: ['连接资产目录服务…', '查询注册与版本元数据…'],
  查询运行日志: ['划定日志时间窗与 traceId…', '检索调用链与错误栈…'],
  技术架构评估: ['加载架构检查清单…', '解析依赖图谱与安全策略…'],
  效果能力评估: ['拉取任务成功率样本…', '计算准确率与鲁棒性指标…'],
  使用情况评估: ['聚合调用量与活跃用户…', '统计延迟与成本用量…'],
  业务指标评估: ['对接 BI 快照与 KPI 模板…', '对齐业务口径与转化数据…'],
  综合评分计算: ['加载四维权重配置…', '融合分项得分与雷达数据…'],
  问题归因与分级: ['构建归因树并定位短板…', '应用分级规则映射改进项…'],
  全球矿山产能追踪: ['连接矿山产能数据库…', '同步主要矿山发运与投产…'],
  发运量与在途量监测: ['拉取港口发运 API…', '关联 AIS 在途船舶轨迹…'],
  港口库存分析: ['读取港口库存接口…', '计算疏港节奏与库存趋势…'],
  供需平衡表构建: ['初始化平衡表模型…', '测算缺口与库存变动…'],
  价格预测与情景模拟: ['加载价格模型参数…', '跑基准/乐观/悲观情景…'],
  策略建议报告生成: ['汇总供需与价格结论…', '生成采购策略与风险提示…'],
  港口气象预报采集: ['请求装港/卸港气象 API…', '识别极端天气窗口…'],
  船舶动态追踪: ['订阅 AIS 航迹流…', '推算到港时间与偏航风险…'],
  装港作业评估: ['拉取港口作业与排队数据…', '评估装卸效率与拥堵…'],
  贸易对手信用评估: ['查询信用数据库…', '核对履约与评级变动…'],
  全链路风险汇总: ['融合气象/物流/信用信号…', '计算全链路风险评分…'],
  风险预警报告生成: ['渲染风险地图与清单…', '输出应对建议段落…'],
};

function getRunningSubLinesForStep(ctx: AgentExecutionContext): AgentRunSubLine[] {
  if (ctx.title === '生成评估报告') {
    return [
      { text: '[① 素材聚合] 汇总四维得分、日志与引用片段，写入素材包…', ms: '—', s1: 'neutral', s2: 'neutral' },
      { text: '[② 报告撰写] 按模板生成摘要、结论、问题清单与改进建议…', ms: '—', s1: 'neutral', s2: 'neutral' },
      { text: '[③ 审校定稿] 引用核对、敏感信息脱敏与版式一致性检查…', ms: '—', s1: 'neutral', s2: 'neutral' },
    ];
  }
  const pair = RUNNING_LINES_BY_TITLE[ctx.title];
  if (pair) {
    return [
      { text: pair[0], ms: '—', s1: 'neutral', s2: 'neutral' },
      { text: pair[1], ms: '—', s1: 'neutral', s2: 'neutral' },
    ];
  }
  const m = ctx.model ? `加载 ${ctx.model} 推理上下文…` : '加载模型与策略上下文…';
  return [
    { text: `进入「${ctx.title}」执行阶段…`, ms: '—', s1: 'neutral', s2: 'neutral' },
    { text: m, ms: '—', s1: 'neutral', s2: 'neutral' },
  ];
}

function getCompletedSubLinesForStep(ctx: AgentExecutionContext, stepIndex: number): AgentRunSubLine[] {
  const t = (base: number, s1: AgentLogBadge, s2: AgentLogBadge, text: string) =>
    agentLine(text, base, stepIndex, s1, s2);

  switch (ctx.title) {
    case '查询智能体基础信息':
      return [
        t(0.08, 'neutral', 'neutral', '鉴权资产目录只读配额'),
        t(0.28, 'ok', 'neutral', '拉取注册信息、版本与负责人'),
        t(0.42, 'ok', 'ok', '校验能力声明与元数据完整性'),
        t(0.1, 'ok', 'ok', '写入本步证据包供后续引用'),
      ];
    case '查询运行日志':
      return [
        t(0.09, 'neutral', 'neutral', '按评估任务对齐时间窗'),
        t(0.36, 'ok', 'neutral', '聚合调用日志与错误栈'),
        t(0.48, 'ok', 'ok', '关联 traceId 形成可分析数据集'),
        t(0.11, 'ok', 'ok', '脱敏后归档运行侧证据'),
      ];
    case '技术架构评估':
      return [
        t(0.1, 'neutral', 'neutral', '对照架构检查清单逐项扫描'),
        t(0.34, 'ok', 'neutral', '解析依赖图谱与模型选型'),
        t(0.52, 'ok', 'ok', '评估编排、工具链与安全合规'),
        t(0.12, 'ok', 'ok', '输出工程技术维度评分'),
      ];
    case '效果能力评估':
      return [
        t(0.09, 'neutral', 'neutral', '抽取任务样本与基线对照'),
        t(0.38, 'ok', 'neutral', '计算成功率、准确率与鲁棒性'),
        t(0.44, 'ok', 'ok', '标记异常 case 与复现路径'),
        t(0.1, 'ok', 'ok', '固化效果维度结论'),
      ];
    case '使用情况评估':
      return [
        t(0.08, 'neutral', 'neutral', '拉取调用量与活跃用户曲线'),
        t(0.32, 'ok', 'neutral', '统计 P95 延迟与错误率'),
        t(0.46, 'ok', 'ok', '核算 Token 与成本占用'),
        t(0.11, 'ok', 'ok', '生成使用侧运行画像'),
      ];
    case '业务指标评估':
      return [
        t(0.1, 'neutral', 'neutral', '对接 BI 与 KPI 模板'),
        t(0.35, 'ok', 'neutral', '对齐转化、满意度与人效口径'),
        t(0.5, 'ok', 'ok', '计算业务价值达成度'),
        t(0.12, 'ok', 'ok', '输出业务维度评分与注释'),
      ];
    case '综合评分计算':
      return [
        t(0.09, 'neutral', 'neutral', '读取四维权重与缺项策略'),
        t(0.33, 'ok', 'neutral', '加权融合分项得分'),
        t(0.41, 'ok', 'ok', '生成总分与雷达图数据'),
        t(0.1, 'ok', 'ok', '校验勾稽与证据引用占位'),
      ];
    case '问题归因与分级':
      return [
        t(0.1, 'neutral', 'neutral', '运行归因树定位主要短板'),
        t(0.37, 'ok', 'neutral', '映射严重等级与责任域'),
        t(0.45, 'ok', 'ok', '生成改进项与优先级列表'),
        t(0.11, 'ok', 'ok', '写入归因结果供报告引用'),
      ];
    case '生成评估报告':
      return [
        t(0.08, 'neutral', 'neutral', '[编排] 拉起多智能体组，锁定模板 formal_eval_v3 与输出格式'),
        t(0.26, 'ok', 'neutral', '[① 聚合] 得分/日志/引用已汇总，素材包 14 条证据索引就绪'),
        t(0.34, 'ok', 'neutral', '[② 撰写] 摘要、结论、问题清单与改进建议章节已落稿'),
        t(0.24, 'ok', 'ok', '[③ 审校] 引用勾稽、脱敏与版式检查通过'),
        t(0.08, 'ok', 'ok', '[交付] PDF / Markdown 已写入对象存储，返回下载链接'),
      ];
    case '全球矿山产能追踪':
      return [
        t(0.1, 'neutral', 'neutral', '连接全球矿山产能库'),
        t(0.36, 'ok', 'neutral', '同步产能变动与投产计划'),
        t(0.47, 'ok', 'ok', '校验数据时效与来源'),
        t(0.1, 'ok', 'ok', '输出产能追踪快照'),
      ];
    case '发运量与在途量监测':
      return [
        t(0.09, 'neutral', 'neutral', '拉取澳巴港口发运数据'),
        t(0.34, 'ok', 'neutral', '匹配 AIS 在途船舶批次'),
        t(0.49, 'ok', 'ok', '识别异常滞港与航线偏离'),
        t(0.11, 'ok', 'ok', '写入发运/在途监测结果'),
      ];
    case '港口库存分析':
      return [
        t(0.08, 'neutral', 'neutral', '读取主要港口库存 API'),
        t(0.35, 'ok', 'neutral', '分析到港节奏与疏港速度'),
        t(0.46, 'ok', 'ok', '计算库存趋势与警戒线'),
        t(0.1, 'ok', 'ok', '输出库存分析摘要'),
      ];
    case '供需平衡表构建':
      return [
        t(0.1, 'neutral', 'neutral', '初始化月度平衡表结构'),
        t(0.38, 'ok', 'neutral', '填入供应、需求与库存项'),
        t(0.44, 'ok', 'ok', '测算供需缺口与变动趋势'),
        t(0.11, 'ok', 'ok', '固化平衡表版本号'),
      ];
    case '价格预测与情景模拟':
      return [
        t(0.09, 'neutral', 'neutral', '加载价格模型与输入参数'),
        t(0.33, 'ok', 'neutral', '基准情景推理'),
        t(0.52, 'ok', 'ok', '乐观/悲观情景对比模拟'),
        t(0.12, 'ok', 'ok', '输出价格区间与敏感性说明'),
      ];
    case '策略建议报告生成':
      return [
        t(0.08, 'neutral', 'neutral', '汇总供需、价格与库存结论'),
        t(0.39, 'ok', 'neutral', '生成采购与库存策略建议'),
        t(0.47, 'ok', 'ok', '插入风险提示与附录数据'),
        t(0.11, 'ok', 'ok', '导出策略报告文档'),
      ];
    case '港口气象预报采集':
      return [
        t(0.09, 'neutral', 'neutral', '请求装港/卸港气象接口'),
        t(0.31, 'ok', 'neutral', '解析风力降水与能见度'),
        t(0.46, 'ok', 'ok', '标记极端天气影响窗口'),
        t(0.1, 'ok', 'ok', '归档气象证据包'),
      ];
    case '船舶动态追踪':
      return [
        t(0.08, 'neutral', 'neutral', '订阅 AIS 实时轨迹'),
        t(0.35, 'ok', 'neutral', '推算 ETA 与航线合规'),
        t(0.48, 'ok', 'ok', '评估偏航与滞航风险'),
        t(0.1, 'ok', 'ok', '输出船舶动态摘要'),
      ];
    case '装港作业评估':
      return [
        t(0.1, 'neutral', 'neutral', '拉取港口作业与排队数据'),
        t(0.34, 'ok', 'neutral', '计算泊位效率与等待时长'),
        t(0.49, 'ok', 'ok', '评估装卸延误概率'),
        t(0.11, 'ok', 'ok', '写入装港评估结论'),
      ];
    case '贸易对手信用评估':
      return [
        t(0.09, 'neutral', 'neutral', '查询对手授信与评级档案'),
        t(0.36, 'ok', 'neutral', '分析历史履约与逾期记录'),
        t(0.47, 'ok', 'ok', '对比财报与舆情信号'),
        t(0.11, 'ok', 'ok', '输出信用评估意见'),
      ];
    case '全链路风险汇总':
      return [
        t(0.1, 'neutral', 'neutral', '拉通气象/物流/信用子评分'),
        t(0.37, 'ok', 'neutral', '加权融合全链路风险'),
        t(0.45, 'ok', 'ok', '划定预警等级与触发条件'),
        t(0.11, 'ok', 'ok', '生成风险汇总表'),
      ];
    case '风险预警报告生成':
      return [
        t(0.08, 'neutral', 'neutral', '加载风险地图与清单模板'),
        t(0.4, 'ok', 'neutral', '渲染关键风险点与传导路径'),
        t(0.48, 'ok', 'ok', '生成应对建议与责任分工'),
        t(0.12, 'ok', 'ok', '导出预警报告'),
      ];
    default: {
      const tool0 = ctx.tools?.[0];
      const tool1 = ctx.tools?.[1];
      return [
        t(0.09, 'neutral', 'neutral', `初始化「${ctx.title}」`),
        t(
          0.3,
          'ok',
          'neutral',
          ctx.model ? `加载 ${ctx.model} 与提示词模板` : '加载模型与提示词模板'
        ),
        t(
          0.45,
          'ok',
          'ok',
          tool0 ? `调用 ${tool0}${tool1 ? `、${tool1}` : ''} 执行业务逻辑` : '执行业务工具链与校验'
        ),
        t(0.11, 'ok', 'ok', '校验输出并写入本步结果'),
      ];
    }
  }
}

function buildInitialAgentDetails(stepList: WorkflowStep[]): AgentRunDetail[] {
  return stepList
    .map((s, stepIndex) => ({ s, stepIndex }))
    .filter(({ s }) => shouldShowAgentCardBelowStep(s))
    .map(({ s, stepIndex }) => ({
      stepIndex,
      stepId: s.id,
      name: s.group?.name ?? s.subAgents?.[0]?.name ?? `${s.title}智能体`,
      status: 'pending' as const,
      timeLabel: '',
      lines: [] as AgentRunSubLine[],
      execCtx: {
        title: s.title,
        description: s.description,
        tools: s.tools,
        model: s.model,
      },
    }));
}

function patchAgentRunDetails(
  prev: AgentRunDetail[] | null,
  batchIndices: number[],
  phase: 'running' | 'done'
): AgentRunDetail[] {
  const base = prev?.length ? prev : [];
  return base.map(card => {
    if (!batchIndices.includes(card.stepIndex)) return card;
    if (phase === 'running') {
      return {
        ...card,
        status: 'running',
        timeLabel: new Date().toLocaleTimeString('zh-CN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        lines: getRunningSubLinesForStep(card.execCtx),
      };
    }
    const completedLines = getCompletedSubLinesForStep(card.execCtx, card.stepIndex);
    const durFromLines = completedLines.reduce((sum, row) => {
      const n = parseFloat(row.ms.replace('s', ''));
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
    const dur = durFromLines > 0 ? Number(durFromLines.toFixed(1)) : Number((0.6 + (card.stepIndex % 6) * 0.12 + 0.55).toFixed(1));
    return {
      ...card,
      status: 'success',
      durationSec: dur,
      lines: completedLines,
    };
  });
}

/** 等待调度时按步骤标题给出的提示（与 RUNNING_LINES 语义对齐） */
const PENDING_LOG_BY_TITLE: Partial<Record<string, string>> = {
  查询智能体基础信息: '待连接资产目录并拉取注册、版本与负责人元数据。',
  查询运行日志: '待按评估任务对齐时间窗并聚合调用链与错误栈。',
  技术架构评估: '待加载架构检查清单并解析依赖与安全策略。',
  效果能力评估: '待抽取任务样本并计算成功率与鲁棒性指标。',
  使用情况评估: '待聚合调用量、延迟与成本用量曲线。',
  业务指标评估: '待对接 BI 快照并对齐 KPI 与业务口径。',
  综合评分计算: '待读取四维权重并融合分项得分。',
  问题归因与分级: '待构建归因树并映射严重等级与改进项。',
  生成评估报告:
    '待执行「评估报告多智能体组」：① 聚合前序素材 → ② 按模板撰写 → ③ 审校后定稿（需上游评分与归因结果就绪）。',
  全球矿山产能追踪: '待连接矿山产能库并同步发运与投产数据。',
  发运量与在途量监测: '待发运 API 与 AIS 在途轨迹对齐。',
  港口库存分析: '待读取港口库存并计算疏港与库存趋势。',
  供需平衡表构建: '待初始化平衡表并测算供需缺口。',
  价格预测与情景模拟: '待加载价格模型并跑多情景推演。',
  策略建议报告生成: '待汇总供需与价格并生成策略段落。',
  港口气象预报采集: '待请求装港/卸港气象并识别极端窗口。',
  船舶动态追踪: '待订阅 AIS 并推算 ETA 与偏航风险。',
  装港作业评估: '待拉取泊位排队并评估装卸效率。',
  贸易对手信用评估: '待查询授信档案并对齐财报与舆情。',
  全链路风险汇总: '待融合气象/物流/信用子评分。',
  风险预警报告生成: '待渲染风险地图与应对建议清单。',
};

/** 侧栏「运行日志」展示用：按状态与节点解析，保证与运行结果同源步骤文案 */
function resolveAgentRunLogLines(d: AgentRunDetail): AgentRunSubLine[] {
  const title = d.execCtx.title;
  if (d.status === 'pending') {
    const hint = PENDING_LOG_BY_TITLE[title] ?? '工作流调度器尚未拉起本节点，请等待上游完成或点击顶部「运行」。';
    return [
      { text: `[调度] 智能体「${d.name}」已入队`, ms: '—', s1: 'neutral', s2: 'neutral' },
      { text: `[步骤] ${title}`, ms: '—', s1: 'neutral', s2: 'neutral' },
      { text: hint, ms: '—', s1: 'neutral', s2: 'neutral' },
    ];
  }
  if (d.status === 'running') {
    const sub = getRunningSubLinesForStep(d.execCtx);
    const desc = d.execCtx.description?.trim();
    const head: AgentRunSubLine[] = [
      {
        text: `[流水线] 已拉起「${title}」${d.timeLabel ? `，开始时刻 ${d.timeLabel}` : ''}`,
        ms: '—',
        s1: 'neutral',
        s2: 'neutral',
      },
    ];
    if (desc) {
      head.push({
        text: `[上下文] ${desc.length > 120 ? `${desc.slice(0, 120)}…` : desc}`,
        ms: '—',
        s1: 'neutral',
        s2: 'neutral',
      });
    }
    const tools = d.execCtx.tools;
    if (tools?.length) {
      head.push({
        text: `[工具] ${tools.join('、')}`,
        ms: '—',
        s1: 'neutral',
        s2: 'neutral',
      });
    }
    const subLines =
      title === '生成评估报告'
        ? sub.map((line, i) => {
            if (i === 0) return { ...line, text: `[进行中] ${line.text}` };
            if (i === 1) return { ...line, text: `[下一步] ${line.text}` };
            return { ...line, text: `[待执行] ${line.text}` };
          })
        : sub.map((line, i) => (i === 0 ? { ...line, text: `[进行中] ${line.text}` } : line));
    return [...head, ...subLines];
  }
  if (d.lines.length > 0) return d.lines;
  return getCompletedSubLinesForStep(d.execCtx, d.stepIndex);
}

function logBadgeFromLine(line: AgentRunSubLine): { tag: string; chip: string } {
  const p = line.s1;
  if (p === 'ok') return { tag: 'OK', chip: 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]/70' };
  if (p === 'warn') return { tag: 'WARN', chip: 'bg-amber-50 text-[#b45309] border border-amber-200/90' };
  if (p === 'err') return { tag: 'ERR', chip: 'bg-red-50 text-[#b91c1c] border border-red-200/90' };
  return { tag: 'INFO', chip: 'bg-[#eef2f7] text-[#64748b] border border-[#e2e8f0]' };
}

function logDotClass(line: AgentRunSubLine): string {
  if (line.s1 === 'ok') return 'bg-[#10B981] ring-2 ring-[#10B981]/25';
  if (line.s1 === 'warn') return 'bg-[#f59e0b] ring-2 ring-amber-200/50';
  if (line.s1 === 'err') return 'bg-[#ef4444] ring-2 ring-red-200/50';
  return 'bg-[#94a3b8] ring-2 ring-slate-200/60';
}

function AgentRunLogsTab({ detail }: { detail: AgentRunDetail }) {
  const lines = resolveAgentRunLogLines(detail);

  return (
    <div>
      <div className="rounded-lg border border-[#e2e8f0] bg-gradient-to-b from-[#fafbfc] to-white px-3 py-2.5 mb-3 shadow-sm shadow-[#0d1b2a]/[0.03]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-[#a3b1c6] tracking-wide uppercase">节点上下文</p>
            <p className="text-xs font-semibold text-[#0d1b2a] mt-0.5 break-words leading-snug">{detail.execCtx.title}</p>
            <p className="text-[10px] text-[#7d8da1] mt-1 break-words">{detail.name}</p>
          </div>
          <span className="text-[10px] text-[#a3b1c6] tabular-nums shrink-0">{detail.timeLabel || '—'}</span>
        </div>
        {detail.execCtx.model && (
          <p className="text-[10px] text-[#7d8da1] mt-2">
            模型{' '}
            <span className="text-[#4a5b73] font-mono text-[10px]">{detail.execCtx.model}</span>
          </p>
        )}
        {detail.execCtx.tools && detail.execCtx.tools.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {detail.execCtx.tools.map(t => (
              <span
                key={t}
                className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#6366F1]/[0.08] text-[#6366F1] border border-[#6366F1]/20"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#e2e8f0]" aria-hidden />
        <ul className="space-y-0">
          {lines.map((line, i) => {
            const b = logBadgeFromLine(line);
            return (
              <li key={`${line.text}-${i}`} className="relative flex items-center gap-2.5 pl-0.5 pb-4 last:pb-0">
                <div className={`relative z-[1] w-2 h-2 rounded-full shrink-0 ${logDotClass(line)}`} />
                <div className="flex-1 min-w-0 flex flex-nowrap items-center gap-2">
                  <p className="text-[11px] text-[#4a5b73] leading-snug flex-1 min-w-0 truncate" title={line.text}>
                    {line.text}
                  </p>
                  <span className="text-[10px] text-[#a3b1c6] tabular-nums shrink-0">{line.ms}</span>
                  <span className={`text-[9px] font-semibold px-1.5 py-px rounded shrink-0 ${b.chip}`}>{b.tag}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {detail.status === 'success' && detail.durationSec != null && (
        <p className="text-[10px] text-[#a3b1c6] mt-3 pt-2 border-t border-[#edf1f8]">
          本节点累计耗时 <span className="text-[#7d8da1] tabular-nums font-medium">{detail.durationSec}s</span>
        </p>
      )}
    </div>
  );
}

/** 右侧抽屉 / 执行卡片：与 PRD 3.1 及左侧思考面板对齐的字号与色阶 */
const panelText = {
  title: 'text-sm font-semibold text-[#0d1b2a]',
  subtitle: 'text-xs text-[#7d8da1]',
  label: 'text-xs font-medium text-[#7d8da1]',
  body: 'text-xs text-[#4a5b73]',
  meta: 'text-xs text-[#a3b1c6] tabular-nums',
} as const;

/** 画布页「添加 Task / Agent」等与顶栏、发布卡一致的圆角、边框与阴影 */
const studioCanvasModal = {
  backdrop:
    'fixed inset-0 z-[60] flex items-center justify-center bg-[#0d1b2a]/25 backdrop-blur-[2px]',
  panel:
    'bg-white rounded-xl border border-[#e2e8f0] shadow-xl shadow-[#0d1b2a]/10 w-[min(420px,calc(100vw-2rem))] max-h-[min(90vh,calc(100vh-2rem))] flex flex-col overflow-hidden',
  head: 'shrink-0 px-5 pt-5 pb-4 border-b border-[#f1f5f9]',
  title: 'text-[15px] font-medium text-[#0d1b2a]',
  subtitle: 'text-xs text-[#7d8da1] mt-1 leading-relaxed',
  body: 'px-5 py-4 overflow-y-auto flex-1 min-h-0 space-y-3',
  footer: 'shrink-0 px-5 py-4 border-t border-[#f1f5f9] flex gap-2 bg-[#fafbfc]/90',
  label: 'block text-[11px] text-[#7d8da1] mb-1.5',
  input:
    'w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-lg bg-white text-[#0d1b2a] focus:outline-none focus:border-[#6366F1]/50 focus:ring-2 focus:ring-[#6366F1]/10',
  select:
    'w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-lg bg-white text-[#0d1b2a] focus:outline-none focus:border-[#6366F1]/50 focus:ring-2 focus:ring-[#6366F1]/10',
  textarea:
    'w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-lg resize-none text-[#0d1b2a] focus:outline-none focus:border-[#6366F1]/50 focus:ring-2 focus:ring-[#6366F1]/10',
  btnGhost:
    'flex-1 py-2 border border-[#e2e8f0] text-[#7d8da1] rounded-lg text-xs font-medium hover:bg-[#f4f6fa] transition-colors',
  btnPrimary:
    'flex-1 py-2 bg-[#6366F1] text-white rounded-lg text-xs font-medium hover:bg-[#5558E6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
  closeBtn:
    'p-1.5 rounded-lg text-[#7d8da1] hover:bg-[#edf1f8] hover:text-[#0d1b2a] transition-colors shrink-0 -mr-1 -mt-0.5',
  listBox:
    'rounded-lg border border-[#e2e8f0] bg-[#fafbfc]/50 divide-y divide-[#f1f5f9] overflow-y-auto',
  link: 'text-[10px] font-medium text-[#6366F1] hover:underline',
  linkMuted: 'text-[10px] font-medium text-[#7d8da1] hover:underline',
} as const;

/** 右侧执行运行卡片：密集列表用小字号（较侧栏再收一档） */
const runCardText = {
  title: 'text-[10px] font-semibold text-[#0d1b2a]',
  meta: 'text-[9px] text-[#a3b1c6] tabular-nums',
  duration: 'text-[9px] text-[#7d8da1] tabular-nums',
  body: 'text-[9px] text-[#4a5b73]',
  hint: 'text-[9px] text-[#7d8da1]',
  badge: 'text-[9px] font-medium px-1 py-px rounded border leading-none',
} as const;

/** 右侧「执行指标」三栏：窄列专用小字号 */
const metricsPanelText = {
  sectionLabel: 'text-[11px] font-medium text-[#7d8da1]',
  cardLabel: 'text-[10px] font-normal text-[#7d8da1]',
  kpi: 'text-xs font-semibold text-[#0d1b2a] tabular-nums',
  foot: 'text-[10px] text-[#a3b1c6] tabular-nums font-normal',
} as const;

type AgentRunDetailTab = 'result' | 'logs' | 'prompt';

function hashStepId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function formatDurationCn(sec: number | undefined): string {
  if (sec == null || !Number.isFinite(sec)) return '—';
  return `${sec.toFixed(1)}秒`;
}

/** 将 HH:mm:ss 粗略加上秒数，失败则返回原串 */
function addSecondsToClockLabel(label: string, addSec: number): string {
  const m = label.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (!m) return label;
  let h = parseInt(m[1], 10);
  let mi = parseInt(m[2], 10);
  let s = parseInt(m[3], 10) + Math.round(addSec);
  mi += Math.floor(s / 60);
  s %= 60;
  h += Math.floor(mi / 60);
  mi %= 60;
  h %= 24;
  return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function tokenSplitForStep(d: AgentRunDetail): { in: number; out: number } {
  const h = hashStepId(`${d.stepId}-${d.execCtx.title}`);
  return { in: 1100 + (h % 900), out: 700 + (h % 650) };
}

/** 按节点步骤生成「运行结果」Tab 的输入/输出 JSON（演示数据，与业务步骤语义对齐） */
function getNodeResultJsonPair(d: AgentRunDetail): { input: Record<string, unknown>; output: Record<string, unknown> } {
  const ctx = d.execCtx;
  const t = ctx.title;

  if (d.status === 'pending') {
    return {
      input: {
        step: t,
        agent: d.name,
        state: 'queued',
        upstream: null,
      },
      output: {
        status: 'pending',
        message: '节点尚未开始执行，无输出数据。',
      },
    };
  }

  if (d.status === 'running') {
    const base = getNodeResultJsonPairForDetail(d);
    return {
      input: base.input,
      output: {
        status: 'running',
        progress: 0.62,
        message: '推理与工具调用进行中，完成后将写入完整结果。',
        partial: null,
      },
    };
  }

  return getNodeResultJsonPairForDetail(d);
}

/** 按节点生成「运行结果」输入/输出 JSON（演示数据，与 agent 职责对齐） */
function getNodeResultJsonPairForDetail(d: AgentRunDetail): { input: Record<string, unknown>; output: Record<string, unknown> } {
  const ctx = d.execCtx;
  const title = ctx.title;
  const stepIndex = d.stepIndex;
  const model = ctx.model ?? 'gpt-4o-mini';
  const tools = ctx.tools ?? [];
  const toolStr = tools[0] ?? 'default_tool';

  const baseInput = (extra: Record<string, unknown>) => ({
    agent: d.name,
    stepId: d.stepId,
    stepIndex: d.stepIndex,
    step: title,
    requestId: `req-${d.stepId}-${stepIndex}`,
    model,
    temperature: 0.2,
    maxTokens: 4096,
    tools: tools.length ? tools : ['workflow_default'],
    ...extra,
  });

  const okOut = (data: Record<string, unknown>) => ({
    status: 'success',
    step: title,
    agent: d.name,
    stepId: d.stepId,
    traceId: `tr-${d.stepId}`,
    execution: {
      startedAt: d.timeLabel ?? null,
      durationSec: d.durationSec ?? null,
      toolInvocations: tools.length ? tools.length : 1,
    },
    ...data,
  });

  switch (title) {
    case '查询智能体基础信息':
      return {
        input: baseInput({
          intent: 'registry_read',
          targetAgentKey: `eval-target-${stepIndex + 1}`,
          query: 'registry_snapshot',
          source: 'asset_catalog',
          depth: 'standard',
          fields: ['registration', 'version', 'owner', 'capabilities', 'compliance_flags'],
          auth: { mode: 'bearer', scope: 'catalog:read' },
        }),
        output: okOut({
          registry: {
            agentId: `ag-${1000 + stepIndex}`,
            displayName: d.name,
            version: '2.1.0',
            owner: 'platform-ops',
            namespace: 'prod/eval',
            lastDeployedAt: '2026-03-18T08:12:00Z',
          },
          capabilities: [
            { name: 'chat', enabled: true, endpoint: '/v1/chat' },
            { name: 'tools', enabled: true, allowedTools: 12 },
            { name: 'eval', enabled: true, hookVersion: '1.2' },
          ],
          integrity: { status: 'passed', checksumAlgo: 'sha256', driftDetected: false },
          redactions: ['api_key', 'internal_route'],
        }),
      };
    case '查询运行日志':
      return {
        input: baseInput({
          intent: 'observability_pull',
          timeWindow: { preset: '7d', tz: 'Asia/Shanghai' },
          traceId: `tr-${stepIndex}-eval`,
          includeErrors: true,
          includeSlowQueries: true,
          logLevels: ['ERROR', 'WARN', 'INFO'],
          maxRows: 50_000,
          piiMasking: true,
        }),
        output: okOut({
          aggregates: {
            totalLines: 12480,
            errorRate: 0.012,
            warnRate: 0.038,
            traceBundles: 42,
            p95LatencyMs: 920,
          },
          topErrors: [
            { code: 'DOWNSTREAM_TIMEOUT', count: 18, lastSeen: '2026-03-22T14:02:11Z' },
            { code: 'RATE_LIMIT', count: 7, lastSeen: '2026-03-21T09:41:00Z' },
          ],
          evidenceUri: `s3://obs/eval/${d.stepId}/bundle.jsonl`,
        }),
      };
    case '技术架构评估':
      return {
        input: baseInput({
          intent: 'architecture_audit',
          checklistVersion: 'v2025.03',
          scope: ['deps', 'security', 'orchestration'],
          evidenceRefs: stepIndex > 0 ? [`ctx://step/${stepIndex - 1}/registry`] : ['ctx://bootstrap/registry'],
          gradingRubric: 'enterprise_tech_v2',
        }),
        output: okOut({
          scores: { techScore: 86.5, security: 88, maintainability: 84 },
          findings: [
            { id: 'F-01', title: '编排清晰', severity: 'info', area: 'orchestration' },
            { id: 'F-02', title: '依赖可审计', severity: 'info', area: 'deps' },
          ],
          risks: [
            { id: 'R-01', title: '部分工具超时未熔断', severity: 'medium', slaBreaches7d: 3 },
          ],
          recommendations: ['为高频工具增加熔断与退避策略', '补齐依赖 SBOM 导出'],
        }),
      };
    case '效果能力评估':
      return {
        input: baseInput({
          intent: 'quality_eval',
          sampleSize: 200,
          baseline: 'v1.8',
          metrics: ['acc', 'robustness', 'task_success'],
          datasetId: `ds-eval-${stepIndex}`,
          split: { train: 0.7, valid: 0.15, test: 0.15 },
        }),
        output: okOut({
          metrics: {
            effectScore: 82.3,
            mape: 4.1,
            taskSuccessRate: 0.94,
            robustnessScore: 0.81,
          },
          anomalies: { count: 6, bucket: 'long_tail_queries' },
          comparisonToBaseline: { deltaMape: -1.6, deltaSuccess: 0.06 },
        }),
      };
    case '使用情况评估':
      return {
        input: baseInput({
          intent: 'usage_profile',
          period: '30d',
          dimensions: ['latency', 'cost', 'qps', 'tokens'],
          tenantId: 'tenant-eval-demo',
          aggregation: 'hourly',
        }),
        output: okOut({
          traffic: { peakQps: 42, avgQps: 11, errorRate: 0.009 },
          latency: { p50Ms: 640, p95Ms: 1850, p99Ms: 3120 },
          cost: { tokenMonthly: 1_850_000, estUsdMonthly: 118.4, currency: 'USD' },
          cohorts: { activeUsers: 128, returningRate: 0.62 },
        }),
      };
    case '业务指标评估':
      return {
        input: baseInput({
          intent: 'business_kpi_align',
          biSnapshot: 'kpi_weekly',
          kpiIds: ['conv', 'nps', 'efficiency'],
          attributionWindow: '14d',
          dataSources: ['crm', 'ticket', 'bi_warehouse'],
        }),
        output: okOut({
          businessScore: 79.0,
          kpiMatch: 0.91,
          kpis: [
            { id: 'conv', value: 0.182, target: 0.2, unit: 'ratio' },
            { id: 'nps', value: 38, target: 40, unit: 'score' },
            { id: 'efficiency', value: 0.77, target: 0.75, unit: 'ratio' },
          ],
          notes: '口径已与业务方确认',
          signOff: { owner: 'biz-ops', at: '2026-03-20T16:00:00Z' },
        }),
      };
    case '综合评分计算':
      return {
        input: baseInput({
          intent: 'composite_score',
          weights: { tech: 0.25, effect: 0.25, usage: 0.25, business: 0.25 },
          gapPolicy: 'strict',
          inputsRef: ['tech', 'effect', 'usage', 'business'],
          normalization: 'minmax_v1',
        }),
        output: okOut({
          composite: 84.2,
          radar: { tech: 86.5, effect: 82.3, usage: 81.0, business: 79.0 },
          breakdown: [
            { dim: 'tech', weighted: 21.625 },
            { dim: 'effect', weighted: 20.575 },
            { dim: 'usage', weighted: 20.25 },
            { dim: 'business', weighted: 19.75 },
          ],
          confidence: 0.87,
        }),
      };
    case '问题归因与分级':
      return {
        input: baseInput({
          intent: 'rca_and_triage',
          treeDepth: 4,
          severityMap: 'enterprise_default',
          priorScores: { composite: 84.2 },
          maxIssues: 10,
        }),
        output: okOut({
          issues: [
            { title: '效果样本不足', severity: 'P2', category: 'data', owner: 'ml-platform' },
            { title: '高峰延迟', severity: 'P3', category: 'infra', owner: 'sre' },
          ],
          rootCauses: [
            { node: 'sampling.coverage', contribution: 0.41 },
            { node: 'downstream.latency', contribution: 0.29 },
          ],
          nextActions: ['扩充长尾用例集', '对高峰窗口扩容推理副本'],
        }),
      };
    case '生成评估报告':
      return {
        input: baseInput({
          intent: 'report_render',
          template: 'formal_eval_v3',
          locale: 'zh-CN',
          sections: ['summary', 'scores', 'evidence', 'risks', 'appendix'],
          outputFormats: ['pdf', 'markdown'],
        }),
        output: okOut({
          artifacts: {
            reportUrl: `https://storage.example/reports/eval-${stepIndex}.pdf`,
            markdownUri: `https://storage.example/reports/eval-${stepIndex}.md`,
            checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          },
          pageCount: 24,
          embeddedEvidence: 14,
        }),
      };
    case '全球矿山产能追踪':
      return {
        input: baseInput({
          intent: 'capacity_sync',
          region: 'global',
          mines: ['BR', 'AU', 'ZA'],
          commodity: 'iron_ore',
          unit: 'Mt/y',
        }),
        output: okOut({
          capacity: { capacityMt: 1180.5, deltaPct: 1.2, asOf: '2026-03-22' },
          byRegion: [
            { code: 'BR', mt: 410, yoyPct: 0.8 },
            { code: 'AU', mt: 520, yoyPct: 1.5 },
            { code: 'ZA', mt: 250.5, yoyPct: 0.4 },
          ],
        }),
      };
    case '发运量与在途量监测':
      return {
        input: baseInput({
          intent: 'shipment_monitor',
          ports: ['PDM', 'Qingdao'],
          aisWindow: '48h',
          vesselStates: ['laden', 'ballast'],
        }),
        output: okOut({
          shipments: { dispatchedKt: 380, inTransitKt: 420, etaSlips: 2 },
          anomalies: [
            { type: 'route_deviation', vesselId: 'V-8821', severity: 'low' },
            { type: 'dwell_time', port: 'PDM', severity: 'low' },
          ],
        }),
      };
    case '港口库存分析':
      return {
        input: baseInput({
          intent: 'inventory_trend',
          ports: ['Rizhao', 'Tianjin'],
          horizon: '14d',
          granularity: 'daily',
        }),
        output: okOut({
          inventory: { stockTrend: 'down', daysCover: 18.2, momDeltaPct: -3.1 },
          alerts: [{ level: 'watch', reason: '疏港偏慢', port: 'Tianjin' }],
        }),
      };
    case '供需平衡表构建':
      return {
        input: baseInput({
          intent: 'balance_sheet',
          month: '2025-12',
          balanceVersion: 'm1',
          assumptions: { scrapRate: 0.02, inventoryPolicy: 'target_days_21' },
        }),
        output: okOut({
          balance: { gapMt: -2.3, confidence: 0.88, supplyMt: 98.2, demandMt: 100.5 },
          drivers: ['进口到港延后', '钢厂复产'],
        }),
      };
    case '价格预测与情景模拟':
      return {
        input: baseInput({
          intent: 'price_forecast',
          scenarios: ['base', 'bull', 'bear'],
          horizon: 'Q1',
          modelId: 'price-lstm-v4',
        }),
        output: okOut({
          forecast: { priceRange: [92, 108], unit: 'USD/t', scenario: 'base' },
          scenarios: [
            { name: 'bull', mid: 112, prob: 0.22 },
            { name: 'base', mid: 100, prob: 0.55 },
            { name: 'bear', mid: 88, prob: 0.23 },
          ],
        }),
      };
    case '策略建议报告生成':
      return {
        input: baseInput({
          intent: 'strategy_report',
          mergeFrom: ['balance', 'price', 'inventory'],
          audience: 'procurement',
          riskAppetite: 'medium',
        }),
        output: okOut({
          doc: { docId: `strat-${stepIndex}`, actions: 5, format: 'docx' },
          highlights: ['建议锁价窗口 3/25–4/02', '关注北方港口库存'],
        }),
      };
    case '港口气象预报采集':
      return {
        input: baseInput({
          intent: 'weather_pull',
          loadPorts: ['装港A', '卸港B'],
          hours: 72,
          providers: ['ecmwf', 'local_marine'],
        }),
        output: okOut({
          weather: { windMax: 12, unit: 'm/s', typhoonRisk: false },
          windows: [{ port: '装港A', risk: 'low', bestBerth: '48h' }],
        }),
      };
    case '船舶动态追踪':
      return {
        input: baseInput({
          intent: 'ais_track',
          mmsi: ['413000000'],
          refresh: 'realtime',
          geofence: 'route_alpha',
        }),
        output: okOut({
          track: { etaDriftHours: 0.5, routeOk: true, lastFix: '2026-03-22T11:20:00Z' },
          compliance: { speedAnomaly: false, geofenceBreach: false },
        }),
      };
    case '装港作业评估':
      return {
        input: baseInput({
          intent: 'terminal_ops',
          berthQueue: true,
          shiftCalendar: 'terminal_default',
        }),
        output: okOut({
          ops: { waitHours: 3.2, efficiency: 0.78, craneUtilization: 0.71 },
          bottlenecks: ['berth_3_queue', 'yard_handoff'],
        }),
      };
    case '贸易对手信用评估':
      return {
        input: baseInput({
          intent: 'credit_screen',
          counterpartyId: `cp-${stepIndex}`,
          sources: ['cb', 'news'],
          lookbackDays: 180,
        }),
        output: okOut({
          credit: { rating: 'AA-', watch: false, outlook: 'stable' },
          events: [{ type: 'payment_on_time', at: '2026-03-01' }],
        }),
      };
    case '全链路风险汇总':
      return {
        input: baseInput({
          intent: 'risk_fusion',
          layers: ['weather', 'logistics', 'credit'],
          weights: { weather: 0.2, logistics: 0.45, credit: 0.35 },
        }),
        output: okOut({
          risk: { compositeRisk: 0.34, level: 'medium', score100: 66 },
          layerScores: { weather: 22, logistics: 41, credit: 18 },
        }),
      };
    case '风险预警报告生成':
      return {
        input: baseInput({
          intent: 'risk_report',
          template: 'risk_alert_v2',
          channels: ['email', 'im'],
        }),
        output: okOut({
          alert: { alertId: `AL-${stepIndex}`, recipients: 4, severity: 'medium' },
          delivery: { sentAt: '2026-03-22T15:00:05Z', ackRequired: true },
        }),
      };
    default:
      return {
        input: baseInput({
          intent: 'generic_step',
          query: `分析「${title}」上下文`,
          source: 'workflow',
          limit: 100,
          contextKeys: [`step:${d.stepId}`, `agent:${d.name}`],
        }),
        output: okOut({
          result: { summary: `「${title}」步骤已完成`, confidence: 0.82 },
          toolCalls: tools.length ? tools.map((name, i) => ({ id: i + 1, name, status: 'ok' })) : [{ id: 1, name: toolStr, status: 'ok' }],
          evidence: { writtenTo: 'workflow_context', ref: `ctx://${d.stepId}` },
        }),
      };
  }
}

function NodeRunResultTab({ detail }: { detail: AgentRunDetail }) {
  const { input, output } = getNodeResultJsonPair(detail);
  const { in: tokIn, out: tokOut } = tokenSplitForStep(detail);
  const dur = formatDurationCn(detail.durationSec);
  const startT = detail.timeLabel || '—';
  const endT =
    detail.status === 'success' && detail.timeLabel && detail.durationSec != null
      ? addSecondsToClockLabel(detail.timeLabel, detail.durationSec)
      : detail.status === 'success'
        ? detail.timeLabel || '—'
        : '—';
  const statusMain =
    detail.status === 'success' ? '已完成' : detail.status === 'running' ? '运行中' : '等待调度';
  const jsonBox = 'rounded-lg bg-[#f4f6fa] border border-[#e8ecf2] px-3 py-2.5 overflow-x-auto';
  const jsonText = 'text-[11px] text-[#0d1b2a] leading-relaxed font-mono whitespace-pre-wrap break-all';

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] text-[#7d8da1] mb-1.5" style={{ fontWeight: 500 }}>
          输入参数 Input
        </p>
        <pre className={`${jsonBox} ${jsonText}`}>{JSON.stringify(input, null, 2)}</pre>
      </div>
      <div>
        <p className="text-[11px] text-[#7d8da1] mb-1.5" style={{ fontWeight: 500 }}>
          输出结果 Output
        </p>
        <pre className={`${jsonBox} ${jsonText}`}>{JSON.stringify(output, null, 2)}</pre>
      </div>

      <div className="flex gap-2 pt-1">
        <div className="flex-1 min-w-0 rounded-lg border border-[#e2e8f0] bg-white px-2 py-2 shadow-sm shadow-[#0d1b2a]/[0.03]">
          <div className="flex items-center gap-1 mb-1">
            <Database className="w-3 h-3 text-[#8B5CF6] shrink-0" strokeWidth={2} />
            <span className="text-[10px] text-[#7d8da1]">Token</span>
          </div>
          <p className="text-sm font-semibold text-[#0d1b2a] tabular-nums leading-tight">{(tokIn + tokOut).toLocaleString()}</p>
          <div className="text-[9px] text-[#a3b1c6] tabular-nums mt-0.5 flex flex-col gap-0.5 leading-tight">
            <span className="block">in: {tokIn.toLocaleString()}</span>
            <span className="block">out: {tokOut.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0 rounded-lg border border-[#e2e8f0] bg-white px-2 py-2 shadow-sm shadow-[#0d1b2a]/[0.03]">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-[#6366F1] shrink-0" strokeWidth={2} />
            <span className="text-[10px] text-[#7d8da1]">耗时</span>
          </div>
          <p className="text-sm font-semibold text-[#0d1b2a] tabular-nums leading-tight">{dur}</p>
          <p className="text-[9px] text-[#a3b1c6] tabular-nums mt-0.5 leading-tight">{startT}</p>
        </div>
        <div className="flex-1 min-w-0 rounded-lg border border-[#e2e8f0] bg-white px-2 py-2 shadow-sm shadow-[#0d1b2a]/[0.03]">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 rounded-full border border-[#10B981] bg-[#ecfdf5]/90 flex items-center justify-center shrink-0">
              <Check className="w-2 h-2 text-[#10B981]" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] text-[#7d8da1]">状态</span>
          </div>
          <p className="text-sm font-semibold text-[#0d1b2a] leading-tight truncate">{statusMain}</p>
          <p className="text-[9px] text-[#a3b1c6] tabular-nums mt-0.5 leading-tight">{detail.status === 'success' ? endT : startT}</p>
        </div>
      </div>
    </div>
  );
}

/** Prompt Tab：按步骤标题区分的 System（英文规范体）与 User（中文任务句） */
const PROMPT_BLOCKS: Record<string, { system: string; user: string }> = {
  查询智能体基础信息: {
    system: `You are a helpful AI assistant specialized in enterprise agent registry operations.

Your task is to:
1. Authenticate against the asset catalog with read-only quota
2. Retrieve registration, version, and owner metadata
3. Validate capability declarations and integrity flags

Guidelines:
- Never mutate registry state in this step
- Redact secrets and tokens from logs
- Return structured JSON consumable by downstream evaluation steps`,
    user: '拉取目标智能体在资产目录中的注册信息、版本与负责人，并校验能力声明与元数据是否完整。',
  },
  查询运行日志: {
    system: `You are an observability assistant for multi-agent workflows.

Your task is to:
1. Align time windows with the current evaluation task
2. Aggregate call logs, stacks, and error traces
3. Join traceIds into an analyzable dataset

Guidelines:
- Apply PII masking before persistence
- Preserve correlation keys for cross-step evidence`,
    user: '按评估任务对齐时间窗，聚合调用日志与错误栈，并关联 traceId 形成可分析数据集。',
  },
  技术架构评估: {
    system: `You are a technical architecture reviewer for production AI systems.

Your task is to:
1. Walk the architecture checklist item by item
2. Parse dependency graphs and model choices
3. Assess orchestration, toolchains, and security posture

Guidelines:
- Cite concrete findings with severity
- Prefer actionable remediation over generic advice`,
    user: '对照架构检查清单扫描依赖图谱与编排方式，评估工具链与安全合规并输出工程技术维度结论。',
  },
  效果能力评估: {
    system: `You are a data-driven quality analyst for agent effectiveness.

Your task is to:
1. Sample tasks and compare against baselines
2. Compute success rate, accuracy, and robustness metrics
3. Flag anomaly cases with reproduction hints

Guidelines:
- Keep metrics reproducible from cited evidence
- Highlight regressions vs prior versions`,
    user: '抽取任务样本与基线对照，计算成功率与鲁棒性，并标记异常 case 与复现路径。',
  },
  使用情况评估: {
    system: `You are an operations analyst focusing on runtime usage patterns.

Your task is to:
1. Pull traffic, MAU, and latency curves for the evaluation window
2. Summarize P95 latency and error budgets
3. Attribute token and cost consumption

Guidelines:
- Normalize by tenant and environment
- Surface saturation risks early`,
    user: '聚合调用量与活跃用户，统计 P95 延迟与错误率，并核算 Token 与成本占用形成使用侧画像。',
  },
  业务指标评估: {
    system: `You are a business KPI analyst aligned with BI definitions.

Your task is to:
1. Connect to approved BI snapshots and KPI templates
2. Align conversion, satisfaction, and productivity definitions
3. Compute business value attainment vs targets

Guidelines:
- Resolve definition conflicts explicitly in notes
- Never invent KPIs outside the approved catalog`,
    user: '对接 BI 与 KPI 模板，对齐转化与满意度口径，计算业务价值达成度并输出业务维度评分。',
  },
  综合评分计算: {
    system: `You are a scoring engine for composite agent evaluations.

Your task is to:
1. Load four-dimension weights and missing-value policy
2. Fuse sub-scores with auditability
3. Emit total score and radar-ready vectors

Guidelines:
- Keep weight configuration versioned
- Validate cross-checks before publishing totals`,
    user: '读取四维权重与缺项策略，加权融合分项得分并生成总分与雷达图数据，校验勾稽关系。',
  },
  问题归因与分级: {
    system: `You are a root-cause analyst for agent quality gaps.

Your task is to:
1. Build an attribution tree to locate dominant weaknesses
2. Map severities and ownership domains
3. Produce prioritized improvement items

Guidelines:
- Separate correlation from causation
- Tie each issue to measurable signals`,
    user: '运行归因树定位主要短板，映射严重等级与责任域，并生成改进项与优先级列表。',
  },
  生成评估报告: {
    system: `You are a document generator for formal evaluation reports.

Your task is to:
1. Lock template version and mandatory sections
2. Embed conclusions, evidence excerpts, and action items
3. Run consistency checks before export

Guidelines:
- Preserve traceability to upstream steps
- Use neutral, auditable language`,
    user: '锁定报告模板与必填项，嵌入结论、证据摘录与行动项，完成一致性检查后导出至对象存储。',
  },
  全球矿山产能追踪: {
    system: `You are a supply analyst for global iron ore mine capacity.

Your task is to:
1. Connect to authorized mine capacity databases
2. Sync production and ramp-up schedules
3. Validate freshness and provenance

Guidelines:
- Flag stale sources explicitly
- Use consistent units (Mt) in outputs`,
    user: '连接全球矿山产能数据，同步发运与投产变动，并校验数据时效与来源可靠性。',
  },
  发运量与在途量监测: {
    system: `You are a logistics analyst for port shipments and AIS in-transit flows.

Your task is to:
1. Ingest port dispatch APIs and vessel batches
2. Match AIS trajectories to shipment lots
3. Detect abnormal dwell or route deviation

Guidelines:
- Respect coastal data residency rules
- Annotate confidence for each linkage`,
    user: '拉取港口发运数据并匹配 AIS 在途船舶，识别滞港与航线偏离等异常。',
  },
  港口库存分析: {
    system: `You are an inventory analyst for major bulk ports.

Your task is to:
1. Read bonded and yard inventory APIs
2. Analyze unloading rhythm vs stock drawdown
3. Emit trend and threshold alerts

Guidelines:
- Distinguish in-port vs in-transit stock
- Surface seasonality where visible`,
    user: '读取港口库存并分析到港节奏与疏港速度，计算库存趋势与警戒线。',
  },
  供需平衡表构建: {
    system: `You are a commodity balance sheet modeler.

Your task is to:
1. Initialize the monthly balance skeleton
2. Fill supply, demand, and inventory lines
3. Compute gap and flow sensitivities

Guidelines:
- Version the balance table explicitly
- Document assumptions for each line item`,
    user: '初始化月度供需平衡表，填入供应与需求项，测算缺口与库存变动趋势。',
  },
  价格预测与情景模拟: {
    system: `You are a forecasting assistant for commodity price scenarios.

Your task is to:
1. Load model parameters and macro drivers
2. Run baseline, optimistic, and pessimistic scenarios
3. Summarize price bands and sensitivity drivers

Guidelines:
- Never present point estimates without ranges
- State model limitations clearly`,
    user: '加载价格模型参数，跑基准与多情景模拟，输出价格区间与敏感性说明。',
  },
  策略建议报告生成: {
    system: `You are a strategy author for procurement and inventory decisions.

Your task is to:
1. Consolidate supply, price, and inventory conclusions
2. Draft actionable procurement and hedging suggestions
3. Attach risk disclosures and appendices

Guidelines:
- Separate facts from recommendations
- Align tone with enterprise risk policy`,
    user: '汇总供需、价格与库存结论，生成采购与库存策略建议，并插入风险提示段落。',
  },
  港口气象预报采集: {
    system: `You are a meteorology data integrator for port operations.

Your task is to:
1. Call load/discharge port weather APIs
2. Parse wind, rain, and visibility fields
3. Flag extreme weather windows impacting berthing

Guidelines:
- Timestamp every observation
- Propagate API failures as structured errors`,
    user: '请求装港/卸港气象接口，解析风力降水与能见度，并标记极端天气影响窗口。',
  },
  船舶动态追踪: {
    system: `You are a vessel tracking specialist using AIS feeds.

Your task is to:
1. Subscribe to real-time AIS trajectory streams
2. Estimate ETA and route compliance
3. Assess deviation and anchoring risks

Guidelines:
- Respect MMSI privacy settings where applicable
- Downsample noisy tracks sensibly`,
    user: '订阅 AIS 航迹，推算到港时间与航线合规性，评估偏航与滞航风险。',
  },
  装港作业评估: {
    system: `You are a terminal operations analyst.

Your task is to:
1. Pull berth queueing and crane utilization data
2. Compute wait times and throughput
3. Estimate delay probabilities for loading

Guidelines:
- Normalize by terminal shift calendars
- Highlight congestion hotspots`,
    user: '拉取港口作业与排队数据，计算泊位效率与等待时长，评估装卸延误概率。',
  },
  贸易对手信用评估: {
    system: `You are a credit risk analyst for trade counterparties.

Your task is to:
1. Query credit bureau and internal rating archives
2. Analyze payment history and covenant breaches
3. Cross-check financials and news sentiment

Guidelines:
- Escalate material downgrades immediately
- Never disclose restricted identifiers`,
    user: '查询授信与评级档案，分析履约与逾期记录，并输出信用评估意见。',
  },
  全链路风险汇总: {
    system: `You are a holistic risk fusion engine across logistics chains.

Your task is to:
1. Harmonize weather, logistics, and credit sub-scores
2. Weight and fuse into a composite risk index
3. Define alert levels and escalation paths

Guidelines:
- Document weight rationale
- Avoid double-counting correlated hazards`,
    user: '融合气象、物流与信用子评分，加权得到全链路风险并划定预警等级。',
  },
  风险预警报告生成: {
    system: `You are an incident communications author for risk alerts.

Your task is to:
1. Load risk map and checklist templates
2. Render hotspots and propagation paths
3. Produce mitigation actions and RACI hints

Guidelines:
- Keep alerts concise for mobile readers
- Link to underlying evidence bundles`,
    user: '渲染风险地图与清单，生成应对建议与责任分工，并导出预警报告。',
  },
};

function defaultSystemPrompt(d: AgentRunDetail): string {
  const c = d.execCtx;
  const tools = c.tools?.length ? c.tools.join(', ') : 'workflow_default';
  return `You are a helpful AI assistant operating as node "${d.name}" in an enterprise multi-agent workflow.

Your task is to:
1. Consume validated upstream context for step "${c.title}"
2. Apply model ${c.model ?? 'platform_default'} with approved tools: ${tools}
3. Emit structured, machine-readable output for downstream nodes

Guidelines:
- Minimize hallucinations—ground claims in provided context
- Protect PII and secrets
- On tool failure, return actionable error codes`;
}

function defaultUserPrompt(d: AgentRunDetail): string {
  const c = d.execCtx;
  return (
    c.description?.trim() ||
    `根据上游节点输出，完成「${c.title}」所要求的分项任务，并输出可供下游消费的结构化结果。`
  );
}

function buildSystemPromptForNode(d: AgentRunDetail): string {
  const block = PROMPT_BLOCKS[d.execCtx.title];
  const body = block?.system ?? defaultSystemPrompt(d);
  const modelLine = `\n\n---\nModel: ${d.execCtx.model ?? 'platform_default'}\nTools: ${d.execCtx.tools?.join(', ') ?? 'workflow_default'}`;
  if (d.status === 'pending') {
    return `[Status: queued — not executed yet]\n\n${body}${modelLine}`;
  }
  if (d.status === 'running') {
    return `[Status: running]\n\n${body}${modelLine}`;
  }
  return `${body}${modelLine}`;
}

function buildUserPromptForNode(d: AgentRunDetail): string {
  const block = PROMPT_BLOCKS[d.execCtx.title];
  const base = block?.user ?? defaultUserPrompt(d);
  if (d.status === 'pending') return `（节点排队中，尚未下发执行）${base}`;
  if (d.status === 'running') return `（执行中）${base}`;
  return base;
}

function AgentRunPromptTab({ detail }: { detail: AgentRunDetail }) {
  const [copied, setCopied] = useState<'system' | 'user' | null>(null);
  const systemText = buildSystemPromptForNode(detail);
  const userText = buildUserPromptForNode(detail);

  const handleCopy = (kind: 'system' | 'user') => {
    const text = kind === 'system' ? systemText : userText;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    });
  };

  const cardCls = 'rounded-[10px] bg-[#f4f6fa] border border-[#e8ecf2] px-3 py-2.5';
  const mono = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' } as const;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[12px] font-medium text-[#4a5b73]">System Prompt</span>
          <button
            type="button"
            onClick={() => handleCopy('system')}
            className="text-[11px] text-[#6366F1] hover:text-[#5558E6] font-medium transition-colors"
          >
            {copied === 'system' ? '已复制' : '复制'}
          </button>
        </div>
        <pre
          className={`${cardCls} text-[11px] text-[#0d1b2a] whitespace-pre-wrap break-words leading-relaxed`}
          style={mono}
        >
          {systemText}
        </pre>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[12px] font-medium text-[#4a5b73]">User Prompt</span>
          <button
            type="button"
            onClick={() => handleCopy('user')}
            className="text-[11px] text-[#6366F1] hover:text-[#5558E6] font-medium transition-colors"
          >
            {copied === 'user' ? '已复制' : '复制'}
          </button>
        </div>
        <div className={`${cardCls} text-[12px] text-[#4a5b73] leading-relaxed`}>{userText}</div>
      </div>
    </div>
  );
}

function AgentRunDetailSidePanel({
  detail,
  tab,
  onTabChange,
  onClose,
}: {
  detail: AgentRunDetail;
  tab: AgentRunDetailTab;
  onTabChange: (t: AgentRunDetailTab) => void;
  onClose: () => void;
}) {
  const tabs: { id: AgentRunDetailTab; label: string }[] = [
    { id: 'result', label: '运行结果' },
    { id: 'logs', label: '运行日志' },
    { id: 'prompt', label: 'Prompt' },
  ];

  return (
    <div className="w-[380px] flex-shrink-0 border-l border-[#e2e8f0] flex flex-col bg-white/95 backdrop-blur-xl z-20 min-h-0 h-full self-stretch shadow-[-8px_0_24px_-8px_rgba(13,27,42,0.08)]">
      <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-start justify-between gap-2 flex-shrink-0 bg-[#fafbfc]/90">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`${panelText.title} leading-tight break-words min-w-0 flex-1`}>{detail.name}</h3>
            <span
              className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${
                detail.status === 'success'
                  ? 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]/80'
                  : detail.status === 'running'
                    ? 'bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/25'
                    : 'bg-[#f8f9fc] text-[#7d8da1] border-[#e2e8f0]'
              }`}
            >
              {detail.status === 'success' ? '成功' : detail.status === 'running' ? '运行中' : '等待'}
            </span>
          </div>
          <p className={`${panelText.subtitle} mt-0.5`}>{detail.execCtx.title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[#eef2f7] text-[#a3b1c6] hover:text-[#7d8da1] transition-colors shrink-0"
          title="关闭"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      <div className="flex gap-0.5 p-1.5 mx-3 mt-2 mb-0 rounded-lg bg-[#edf1f8]/80 border border-[#e2e8f0] flex-shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={`flex-1 py-1.5 px-1 rounded-md text-[11px] transition-colors ${
              tab === t.id
                ? 'bg-white text-[#6366F1] shadow-sm shadow-[#0d1b2a]/[0.04] font-medium'
                : 'text-[#7d8da1] hover:text-[#4a5b73]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-subtle min-h-0 p-4">
        {tab === 'result' && <NodeRunResultTab detail={detail} />}
        {tab === 'logs' && <AgentRunLogsTab detail={detail} />}
        {tab === 'prompt' && <AgentRunPromptTab detail={detail} />}
      </div>
    </div>
  );
}

function AgentRunStatusCard({
  detail,
  onOpen,
  selected,
}: {
  detail: AgentRunDetail;
  onOpen: () => void;
  selected: boolean;
}) {
  const { status, name, timeLabel, durationSec } = detail;

  return (
    <div
      className={`rounded-xl border bg-white overflow-hidden transition-shadow duration-200 ${
        selected
          ? 'border-[#6366F1]/35 shadow-sm shadow-[#6366F1]/[0.08] ring-1 ring-[#6366F1]/15'
          : 'border-[#e2e8f0] shadow-sm shadow-[#0d1b2a]/[0.03]'
      }`}
    >
      <button
        type="button"
        className="w-full text-left px-2.5 pt-2 pb-2 transition-colors cursor-pointer hover:bg-[#f8f9fc]/70"
        onClick={onOpen}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <div className="shrink-0 mt-px">
              {status === 'success' && (
                <div
                  className="w-[18px] h-[18px] rounded-full border border-[#10B981] bg-[#ecfdf5]/90 flex items-center justify-center shrink-0"
                  aria-hidden
                >
                  <Check className="w-2 h-2 text-[#10B981]" strokeWidth={2.5} />
                </div>
              )}
              {status === 'running' && (
                <div className="w-[18px] h-[18px] rounded-md border border-[#6366F1]/35 bg-[#6366F1]/[0.06] flex items-center justify-center shrink-0">
                  <Loader2 className="w-2.5 h-2.5 text-[#6366F1] animate-spin" />
                </div>
              )}
              {status === 'pending' && (
                <div className="w-[18px] h-[18px] rounded-md border border-[#e2e8f0] bg-[#edf1f8]/80 flex items-center justify-center shrink-0">
                  <span className={`${runCardText.meta} font-medium`}>···</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className={`${runCardText.title} leading-tight break-words`}>{name}</p>
              <div className={`flex flex-wrap items-baseline gap-x-0.5 mt-0.5 min-w-0 ${runCardText.meta}`}>
                {timeLabel ? (
                  <span className="tabular-nums">{timeLabel}</span>
                ) : (
                  <span>{status === 'pending' ? '等待调度' : '—'}</span>
                )}
                {status === 'success' && durationSec != null && (
                  <>
                    <span className="text-[#a3b1c6]/50 select-none" aria-hidden>
                      ·
                    </span>
                    <span className={`${runCardText.duration} font-normal`}>耗时 {durationSec}s</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`${runCardText.badge} ${
                status === 'success'
                  ? 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]/80'
                  : status === 'running'
                    ? 'bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/25'
                    : 'bg-[#f8f9fc] text-[#7d8da1] border-[#e2e8f0]'
              }`}
            >
              {status === 'success' ? '成功' : status === 'running' ? '运行中' : '等待'}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}

function ExecutionMetricsPanel({ stats }: { stats: ExecutionStats }) {
  const { progress, stepsCompleted, totalSteps, tokenUsage, latency, avgPerStep } = stats;
  const latencyMs = Math.round(latency * 1000);
  const avgMs = avgPerStep > 0 ? Math.round(avgPerStep * 1000) : null;

  const metricCardCls =
    'flex-1 min-w-0 rounded-[10px] border border-[#e2e8f0] bg-white p-2 flex flex-col shadow-sm shadow-[#0d1b2a]/[0.04] overflow-hidden';
  const metricValueCls = `${metricsPanelText.kpi} text-center leading-tight tracking-tight`;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Activity className="w-3 h-3 text-[#7d8da1] shrink-0" strokeWidth={2} />
        <span className={metricsPanelText.sectionLabel}>执行指标</span>
      </div>

      <div className="flex flex-row gap-2 items-stretch">
        <div className={metricCardCls}>
          <div className="flex items-center gap-1 mb-1.5 shrink-0 whitespace-nowrap">
            <Activity className="w-3 h-3 text-[#6366F1] shrink-0" strokeWidth={2} />
            <span className={metricsPanelText.cardLabel}>执行进度</span>
          </div>
          <p className={`${metricValueCls} whitespace-nowrap`}>{progress}%</p>
          <div className="h-0.5 bg-[#edf1f8] rounded-full overflow-hidden my-1.5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: progress === 100 ? '#10B981' : 'linear-gradient(90deg, #6366F1, #8B5CF6)',
              }}
            />
          </div>
          <p className={`${metricsPanelText.foot} text-center mt-auto leading-relaxed`}>
            {stepsCompleted} / {totalSteps} 步
          </p>
        </div>

        <div className={metricCardCls}>
          <div className="flex items-center gap-1 mb-1.5">
            <Database className="w-3 h-3 text-[#8B5CF6] shrink-0" strokeWidth={2} />
            <span className={metricsPanelText.cardLabel}>Token</span>
          </div>
          <p
            className={`${metricValueCls} flex-1 flex items-center justify-center min-h-[1.125rem] min-w-0 max-w-full px-0.5 truncate`}
          >
            {tokenUsage.total.toLocaleString()}
          </p>
          <div className={`${metricsPanelText.foot} text-center mt-auto pt-0.5 flex flex-col gap-0.5 leading-snug`}>
            <span className="block tabular-nums">in: {tokenUsage.input.toLocaleString()}</span>
            <span className="block tabular-nums">out: {tokenUsage.output.toLocaleString()}</span>
          </div>
        </div>

        <div className={metricCardCls}>
          <div className="flex items-center gap-1 mb-1.5">
            <Clock className="w-3 h-3 text-[#6366F1] shrink-0" strokeWidth={2} />
            <span className={metricsPanelText.cardLabel}>时间</span>
          </div>
          <p className={`${metricValueCls} flex-1 flex items-center justify-center min-h-[1.125rem] min-w-0`}>
            {latencyMs}ms
          </p>
          <p className={`${metricsPanelText.foot} text-center mt-auto pt-0.5 leading-snug`}>
            {avgMs != null ? `平均: ${avgMs}ms` : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

function getExecutionBatches(stepCount: number): { sub: number; indices: number[] }[] {
  if (stepCount === 7) {
    return [
      { sub: 1, indices: [0, 1, 2] },
      { sub: 2, indices: [3] },
      { sub: 3, indices: [4] },
      { sub: 4, indices: [5] },
      { sub: 5, indices: [6] },
    ];
  }
  if (stepCount === 10) {
    return [
      { sub: 1, indices: [0, 1] },
      { sub: 2, indices: [2, 3] },
      { sub: 3, indices: [4, 5] },
      { sub: 4, indices: [6] },
      { sub: 5, indices: [7] },
      { sub: 6, indices: [8] },
      { sub: 7, indices: [9] },
    ];
  }
  return Array.from({ length: stepCount }, (_, i) => ({ sub: i + 1, indices: [i] }));
}

function formatAgentBindLabel(s: WorkflowStep): string {
  if (s.title === '结束') return '（流程终止，无执行智能体）';
  const n = s.subAgents?.length ?? 0;
  if (n === 0) return '（待配置智能体）';
  if (n === 1) return ` → ${s.subAgents![0].name}`;
  return ` → ${s.subAgents!.map(a => a.name).join('、')} 等 ${n} 个`;
}

function buildT3SubsFromWorkflow(ws: WorkflowStep[]): { text: string; duration: string }[] {
  return ws.map(s => ({
    text: `节点${s.index} ${s.title}${formatAgentBindLabel(s)}`,
    duration: '2s',
  }));
}

function buildT4SubsFromWorkflow(ws: WorkflowStep[]): { text: string; duration: string }[] {
  const models = [...new Set(ws.map(s => s.model).filter(Boolean))] as string[];
  const tools = [...new Set(ws.flatMap(s => s.tools ?? []))];
  const lines: { text: string; duration: string }[] = [];
  if (models.length) lines.push({ text: `推理模型：${models.join('、')}`, duration: '2s' });
  if (tools.length) {
    lines.push({
      text: `工具（节选）：${tools.slice(0, 10).join('、')}${tools.length > 10 ? '…' : ''}`,
      duration: '2s',
    });
  }
  lines.push({ text: `按 ${ws.length} 个画布节点对齐数据权限、限流与审计策略`, duration: '2s' });
  if (lines.length < 3) lines.push({ text: '算力与队列随批次执行动态分配', duration: '2s' });
  return lines.slice(0, 8);
}

function buildT5SubsFromWorkflow(ws: WorkflowStep[]): { text: string; duration: string }[] {
  const batches = getExecutionBatches(ws.length);
  return batches.map((b, i) => {
    const titles = b.indices.map(j => ws[j]?.title ?? `步骤${j + 1}`).join(' → ');
    return { text: `第 ${i + 1} 批：${titles}`, duration: '3s' };
  });
}

function buildT6SubsFromWorkflow(ws: WorkflowStep[]): { text: string; duration: string }[] {
  const n = ws.length;
  const withAgents = ws.filter(shouldShowAgentCardBelowStep).length;
  const pending = ws.filter(s => s.title !== '结束' && (s.subAgents?.length ?? 0) === 0).length;
  const hasEnd = ws.some(s => s.title === '结束');
  const lines: { text: string; duration: string }[] = [
    { text: `节点覆盖：共 ${n} 步，其中 ${withAgents} 步已绑定可执行智能体`, duration: '2s' },
  ];
  if (pending > 0) {
    lines.push({
      text: `${pending} 个业务节点尚未挂载智能体（运行时可占位跳过或仅调度）`,
      duration: '2s',
    });
  }
  lines.push(
    {
      text: hasEnd ? '流程收尾：已包含「结束」节点' : '提示：画布上未检测到「结束」节点',
      duration: '2s',
    },
    { text: '执行顺序与画布链路、右侧批次划分一致', duration: '2s' },
    { text: '关键依赖与必填字段在画布侧已闭合，准予调度', duration: '2s' }
  );
  return lines;
}

/** 根据当前画布步骤生成左侧思考链（结构仍为 t1–t6，与动画 id 一致） */
function buildLeftThinkingFromSteps(
  workflowSteps: WorkflowStep[],
  template: ThinkingStep[],
  workflowName: string,
  initialQuery: string
): ThinkingStep[] {
  const pick = (id: string) => template.find(t => t.id === id);
  const t1b = pick('t1');
  const t2b = pick('t2');
  const t3b = pick('t3');
  const t4b = pick('t4');
  const t5b = pick('t5');
  const t6b = pick('t6');
  const n = workflowSteps.length;

  const t1: ThinkingStep = {
    ...(t1b ?? { id: 't1', phase: '意图识别', label: '识别任务', duration: '4s' }),
    subSteps: [
      { text: `目标：「${workflowName}」· 画布 ${n} 个节点`, duration: '2s' },
      ...(initialQuery.trim()
        ? [
            {
              text: `需求：${initialQuery.length > 96 ? `${initialQuery.slice(0, 93)}…` : initialQuery}`,
              duration: '3s',
            },
          ]
        : [{ text: '无额外文本说明，按画布节点与依赖执行', duration: '2s' }]),
      { text: '输出：节点状态与产出在右侧执行面板汇总', duration: '2s' },
    ],
  };

  const t2SubsBase = t2b?.subSteps ?? [];
  const t2: ThinkingStep = {
    ...(t2b ?? { id: 't2', phase: '策略规划', label: '规划执行', duration: '4s' }),
    label: `设计「${workflowName}」执行路径`,
    subSteps:
      t2SubsBase.length > 0
        ? t2SubsBase.map((sub, i) =>
            i === 0
              ? { ...sub, text: `阶段划分与画布上 ${n} 个节点及依赖关系对齐` }
              : sub
          )
        : [{ text: `阶段划分与画布上 ${n} 个节点及依赖关系对齐`, duration: '3s' }],
  };

  const t3: ThinkingStep = {
    ...(t3b ?? { id: 't3', phase: '节点拆解', label: '节点与智能体', duration: '8s' }),
    label: '画布节点与智能体绑定',
    subSteps: buildT3SubsFromWorkflow(workflowSteps),
  };

  const t4: ThinkingStep = {
    ...(t4b ?? { id: 't4', phase: '资源分配', label: '调度资源', duration: '6s' }),
    subSteps: buildT4SubsFromWorkflow(workflowSteps),
  };

  const t5: ThinkingStep = {
    ...(t5b ?? { id: 't5', phase: '执行计划', label: '执行顺序', duration: '6s' }),
    subSteps: buildT5SubsFromWorkflow(workflowSteps),
  };

  const t6: ThinkingStep = {
    ...(t6b ?? { id: 't6', phase: '质量检查', label: '校验编排', duration: '5s' }),
    label: '校验当前画布编排',
    subSteps: buildT6SubsFromWorkflow(workflowSteps),
  };

  return [t1, t2, t3, t4, t5, t6];
}

function defaultWorkflowIntentDescription(ws: WorkflowStep[]): string {
  if (ws.length === 0) return '在画布上搭建节点并配置智能体后运行工作流。';
  const titles = ws.filter(s => s.title !== '结束').slice(0, 5).map(s => s.title);
  if (titles.length === 0) return '工作流已配置结束节点，可按需补充上游步骤。';
  return `按画布顺序执行：${titles.join(' → ')}${ws.filter(s => s.title !== '结束').length > titles.length ? ' …' : ''}。`;
}

function buildQualityCheckSummaryFromSteps(workflowName: string, ws: WorkflowStep[]): string {
  const n = ws.length;
  const withAgents = ws.filter(shouldShowAgentCardBelowStep).length;
  const pending = ws.filter(s => s.title !== '结束' && (s.subAgents?.length ?? 0) === 0).length;
  const hasEnd = ws.some(s => s.title === '结束');
  const models = [...new Set(ws.map(s => s.model).filter(Boolean))] as string[];
  const modelPart = models.length ? `涉及模型：${models.join('、')}。` : '';
  const pendingPart = pending > 0 ? `${pending} 个节点尚未挂载智能体；` : '';
  return `质检结论：「${workflowName}」画布共 ${n} 个节点，${withAgents} 个已绑定可执行智能体；${pendingPart}${hasEnd ? '已包含结束节点。' : '未检测到结束节点，建议补充。'}${modelPart}执行批次与画布拓扑一致，准予进入工作流执行。`;
}

function emptyStats(totalSteps: number): ExecutionStats {
  const budgetTokens = Math.max(2000, 1800 * totalSteps);
  return {
    progress: 0,
    stepsCompleted: 0,
    totalSteps,
    successCount: 0,
    expectedCount: totalSteps,
    errors: 0,
    tokenUsage: { input: 0, output: 0, total: 0, budget: budgetTokens },
    cost: { current: 0, budget: Number((0.04 * totalSteps).toFixed(2)) },
    latency: 0,
    avgPerStep: 0,
  };
}

function buildPartialStats(completed: number, totalSteps: number): Pick<ExecutionStats, 'stepsCompleted' | 'successCount' | 'progress' | 'tokenUsage' | 'cost' | 'latency' | 'avgPerStep'> {
  const budgetTokens = Math.max(2000, 1800 * totalSteps);
  const total = Math.round((completed / totalSteps) * budgetTokens);
  return {
    stepsCompleted: completed,
    successCount: completed,
    progress: Math.round((completed / totalSteps) * 100),
    tokenUsage: {
      input: Math.round(total * 0.6),
      output: Math.round(total * 0.4),
      total,
      budget: budgetTokens,
    },
    cost: { current: Number((0.04 * completed).toFixed(2)), budget: Number((0.04 * totalSteps).toFixed(2)) },
    latency: Number((1.0 * completed).toFixed(1)),
    avgPerStep: 1.0,
  };
}

function buildFinalStats(totalSteps: number): ExecutionStats {
  const budgetTokens = Math.max(2000, 1800 * totalSteps);
  return {
    progress: 100,
    stepsCompleted: totalSteps,
    totalSteps,
    successCount: totalSteps,
    expectedCount: totalSteps,
    errors: 0,
    tokenUsage: {
      input: Math.round(budgetTokens * 0.6),
      output: Math.round(budgetTokens * 0.4),
      total: budgetTokens,
      budget: budgetTokens,
    },
    cost: { current: Number((0.04 * totalSteps).toFixed(2)), budget: Number((0.04 * totalSteps).toFixed(2)) },
    latency: Number((1.0 * totalSteps).toFixed(1)),
    avgPerStep: 1.0,
  };
}

/** 右侧抽屉仅查看某一智能体时，执行指标按该步聚合 */
function statsForSingleAgent(d: AgentRunDetail): ExecutionStats {
  const budgetTokens = Math.max(2000, 1800);
  const { in: tokIn, out: tokOut } = tokenSplitForStep(d);
  const totalTok = tokIn + tokOut;
  const stepBudget = Number((0.04 * 1).toFixed(2));
  if (d.status === 'pending') {
    return {
      progress: 0,
      stepsCompleted: 0,
      totalSteps: 1,
      successCount: 0,
      expectedCount: 1,
      errors: 0,
      tokenUsage: { input: 0, output: 0, total: 0, budget: budgetTokens },
      cost: { current: 0, budget: stepBudget },
      latency: 0,
      avgPerStep: 0,
    };
  }
  if (d.status === 'running') {
    const partial = Math.round(totalTok * 0.55);
    return {
      progress: 62,
      stepsCompleted: 0,
      totalSteps: 1,
      successCount: 0,
      expectedCount: 1,
      errors: 0,
      tokenUsage: {
        input: Math.round(partial * 0.58),
        output: Math.round(partial * 0.42),
        total: partial,
        budget: budgetTokens,
      },
      cost: { current: 0, budget: stepBudget },
      latency: 0.62,
      avgPerStep: 0.62,
    };
  }
  const dur = d.durationSec ?? 1;
  return {
    progress: 100,
    stepsCompleted: 1,
    totalSteps: 1,
    successCount: 1,
    expectedCount: 1,
    errors: 0,
    tokenUsage: {
      input: tokIn,
      output: tokOut,
      total: tokIn + tokOut,
      budget: budgetTokens,
    },
    cost: { current: stepBudget, budget: stepBudget },
    latency: dur,
    avgPerStep: dur,
  };
}

// ==================== Data ====================
const initialSteps: WorkflowStep[] = [
  { id: 's1', index: 1, title: '查询智能体基础信息', description: '读取智能体注册信息、版本、负责人与能力声明等元数据', color: '#6366F1', model: 'GLM-4', tools: ['资产目录', '元数据服务'], subAgents: [{ name: '获取智能体基础信息的智能体', role: '查询并整理智能体基础信息' }] },
  { id: 's2', index: 2, title: '查询运行日志', description: '聚合调用日志、错误栈与链路追踪信息，形成可分析的运行侧数据集', color: '#8B5CF6', model: 'Qwen-72B', tools: ['日志检索', '链路追踪'], subAgents: [{ name: '运行日志查询智能体', role: '检索并汇总运行日志与错误信息' }] },
  { id: 's3', index: 3, title: '技术架构评估', description: '评估模型选型、工具链、编排与安全合规等工程技术维度', color: '#EC4899', model: 'Qwen-72B', tools: ['架构检查清单', '依赖图谱'], subAgents: [{ name: '技术架构评估智能体', role: '评估架构设计与工程规范' }] },
  { id: 's4', index: 4, title: '效果能力评估', description: '基于任务成功率、准确率、鲁棒性等指标评估任务完成质量', color: '#10B981', model: 'GLM-4', tools: ['指标计算', '对比基线'], subAgents: [{ name: '效果能力评估智能体', role: '计算准确率与任务完成质量' }] },
  { id: 's5', index: 5, title: '使用情况评估', description: '分析调用量、活跃用户、延迟与成本等运行侧使用情况', color: '#F97316', model: 'GLM-4', tools: ['用量统计', '成本核算'], subAgents: [{ name: '使用情况评估智能体', role: '分析调用与成本使用情况' }] },
  { id: 's6', index: 6, title: '业务指标评估', description: '对照业务 KPI（转化、满意度、人效等）衡量智能体业务价值', color: '#0EA5E9', model: 'Qwen-72B', tools: ['BI 对接', 'KPI 模板'], subAgents: [{ name: '业务指标评估智能体', role: '评估业务 KPI 达成情况' }] },
  { id: 's7', index: 7, title: '综合评分计算', description: '按权重融合各维度得分，输出总分与分项雷达', color: '#14B8A6', model: 'GLM-4', tools: ['加权模型', '可视化'], subAgents: [{ name: '综合评分计算智能体', role: '融合分项得分输出综合评分' }] },
  { id: 's8', index: 8, title: '问题归因与分级', description: '定位主要短板，划分严重等级并映射到改进项', color: '#A855F7', model: 'Qwen-72B', tools: ['归因树', '分级规则'], subAgents: [{ name: '问题归因分级智能体', role: '定位问题根因并进行等级划分' }] },
  {
    id: 's9',
    index: 9,
    title: '生成评估报告',
    description: '生成结构化评估报告，含结论、证据摘录与改进行动清单',
    color: '#64748B',
    model: 'GLM-4',
    tools: ['报告模板', '文档生成'],
    group: {
      name: '评估报告多智能体组',
      description: '三步流水线：先把前面各步结果整理成「能写进报告」的素材，再按模板生成正文，最后审校合规后定稿。',
    },
    subAgents: [
      {
        phase: '① 素材聚合',
        name: '证据与数据聚合',
        role: '汇总四维得分、关键日志与引用片段，输出带索引的素材包，供下一步直接引用。',
        icon: 'chart',
      },
      {
        phase: '② 报告撰写',
        name: '结构化报告撰写',
        role: '按评估模板生成：执行摘要、结论、问题清单、改进建议与章节结构。',
        icon: 'file',
      },
      {
        phase: '③ 审校定稿',
        name: '合规与审校',
        role: '核对引用与事实、敏感信息脱敏、术语与版式统一，通过后输出终稿。',
        icon: 'shield',
      },
    ],
  },
  { id: 's10', index: 10, title: '结束', description: '', color: '#22C55E' },
];

// Example 1: 铁矿石供需平衡分析
const stepsExample1: WorkflowStep[] = [
  { id: 's1', index: 1, title: '全球矿山产能追踪', description: '追踪全球主要铁矿石矿山产能变动与新增投产计划', color: '#F59E0B', model: 'GLM-4', tools: ['矿山数据库', '产能追踪'], subAgents: [{ name: '矿山产能智能体', role: '采集全球矿山产能数据' }] },
  { id: 's2', index: 2, title: '发运量与在途量监测', description: '监测澳洲与巴西主要港口铁矿石发运量及在途船舶数据', color: '#6366F1', model: 'Qwen-72B', tools: ['AIS船舶追踪', '港口发运API'], subAgents: [{ name: '发运监测智能体', role: '监测主要港口发运量' }] },
  { id: 's3', index: 3, title: '港口库存分析', description: '分析国内主要港口铁矿石库存水平、到港节奏与疏港速度', color: '#8B5CF6', model: 'GLM-4', tools: ['港口库存API', '库存趋势分析'], subAgents: [{ name: '库存采集智能体', role: '采集港口库存数据并分析库存变动趋势' }] },
  { id: 's4', index: 4, title: '钢铁需求端评估', description: '评估钢铁行业产量、开工率与下游需求变化对铁矿石消费的影响', color: '#EC4899', model: 'Qwen-72B', tools: ['钢铁产量数据', '需求模型'] },
  { id: 's5', index: 5, title: '供需平衡表构建', description: '构建铁矿石月度供需平衡表，测算供需缺口与库存变动趋势', color: '#10B981', model: 'GLM-4', tools: ['平衡表模型', '缺口计算'], subAgents: [{ name: '供需平衡智能体', role: '构建供需平衡表' }] },
  { id: 's6', index: 6, title: '价格预测与情景模拟', description: '基于供需平衡结果进行价格预测，模拟不同情景下的价格走势', color: '#F97316', model: 'Qwen-72B', tools: ['价格模型', '情景模拟引擎'], subAgents: [{ name: '价格预测智能体', role: '预测价格走势并模拟多种供需情景' }] },
  { id: 's7', index: 7, title: '策略建议报告生成', description: '生成铁矿石供需平衡分析报告，含价格展望、采购策略建议与风险提示', color: '#0EA5E9', model: 'GLM-4', tools: ['报告模板', '文档生成引擎'], subAgents: [{ name: '报告撰写智能体', role: '生成策略建议报告' }] },
];

// Example 2: 进口大豆全链路风险监控
const stepsExample2: WorkflowStep[] = [
  { id: 's1', index: 1, title: '港口气象预报采集', description: '采集装港与卸港气象预报数据，识别极端天气对港口作业的影响', color: '#F59E0B', model: 'GLM-4', tools: ['气象API', '港口数据库'], subAgents: [{ name: '港口气象智能体', role: '采集港口气象预报' }] },
  { id: 's2', index: 2, title: '船舶动态追踪', description: '追踪在途大豆船舶的AIS动态，预估到港时间与偏航风险', color: '#6366F1', model: 'Qwen-72B', tools: ['AIS追踪', '航线分析'], subAgents: [{ name: '船舶追踪智能体', role: '追踪在途船舶动态' }] },
  { id: 's3', index: 3, title: '装港作业评估', description: '评估装港国港口作业效率、排队船舶数量与装卸延误风险', color: '#8B5CF6', model: 'GLM-4', tools: ['港口作业数据', '效率模型'], subAgents: [{ name: '装港评估智能体', role: '评估装港作业状态与港口拥堵程度' }] },
  { id: 's4', index: 4, title: '延误风险概率计算', description: '综合气象、船舶、港口数据计算各环节延误概率与预计延误天数', color: '#EC4899', model: 'Qwen-72B', tools: ['风险概率模型', '延误预测'] },
  { id: 's5', index: 5, title: '贸易对手信用评估', description: '评估贸易对手的履约记录、财务状况与信用评级变动', color: '#10B981', model: 'GLM-4', tools: ['信用数据库', '评级模型'], subAgents: [{ name: '信用评估智能体', role: '评估对手信用状况与历史履约记录' }] },
  { id: 's6', index: 6, title: '全链路风险汇总', description: '汇总物流、气象、信用等多维风险，生成全链路风险评分与预警等级', color: '#F97316', model: 'Qwen-72B', tools: ['风险汇总模型', '预警等级算法'], subAgents: [{ name: '风险汇总智能体', role: '融合多维风险评分并划定预警等级' }] },
  { id: 's7', index: 7, title: '风险预警报告生成', description: '生成进口大豆全链路风险预警报告，含风险地图、预警清单与应对建议', color: '#0EA5E9', model: 'GLM-4', tools: ['报告模板', '风险地图引擎'], subAgents: [{ name: '报告撰写智能体', role: '生成风险预警报告' }] },
];

const thinkingSteps: ThinkingStep[] = [
  { id: 't1', phase: '意图识别', label: '识别智能体评估任务', duration: '4s', subSteps: [
    { text: '任务类型：智能体全链路评估与报告输出', duration: '2s' },
    { text: '评估维度：技术架构、效果能力、使用情况及业务指标', duration: '3s' },
    { text: '数据来源：资产目录 + 运行日志 + 业务看板', duration: '3s' },
    { text: '交付物：综合评分、归因分级、结构化评估报告与归档回执', duration: '3s' },
  ]},
  { id: 't2', phase: '策略规划', label: '设计评估路径', duration: '4s', subSteps: [
    { text: '阶段划分：采集与取证 → 四维分项评估 → 融合打分 → 报告与归档', duration: '4s' },
    { text: '先查询智能体基础信息，再聚合运行日志形成证据集', duration: '4s' },
    { text: '权重策略：四维权重可配置；缺数据项标记为「证据不足」不参与该项满分', duration: '4s' },
    { text: '证据链：分项结论须可回溯至日志片段、配置字段或指标口径说明', duration: '4s' },
  ]},
  { id: 't3', phase: '节点拆解', label: '规划节点与执行智能体', duration: '8s', subSteps: [
    { text: '节点1 查询智能体基础信息 → 获取智能体基础信息的智能体', duration: '2s' },
    { text: '节点2 查询运行日志 → 运行日志查询智能体', duration: '2s' },
    { text: '节点3 技术架构评估 → 技术架构评估智能体', duration: '2s' },
    { text: '节点4 效果能力评估 → 效果能力评估智能体', duration: '2s' },
    { text: '节点5 使用情况评估 → 使用情况评估智能体', duration: '2s' },
    { text: '节点6 业务指标评估 → 业务指标评估智能体', duration: '2s' },
    { text: '节点7 综合评分计算 → 综合评分计算智能体', duration: '2s' },
    { text: '节点8 问题归因与分级 → 问题归因分级智能体', duration: '2s' },
    { text: '节点9 生成评估报告 → 评估报告多智能体组（素材聚合 → 报告撰写 → 审校定稿）', duration: '2s' },
    { text: '节点10 结束：归档与回写，完成流程（无执行智能体）', duration: '2s' },
  ]},
  { id: 't4', phase: '资源分配', label: '调度数据与算力', duration: '6s', subSteps: [
    { text: '资产目录服务：只读查询配额 + 请求限流', duration: '2s' },
    { text: '日志检索与日志存储：按评估时间窗与 traceId 范围授权', duration: '3s' },
    { text: '推理资源：分项评估用 Qwen-72B，汇总与报告用 GLM-4', duration: '3s' },
    { text: 'BI / 成本接口：脱敏字段白名单，禁止回写生产配置', duration: '3s' },
    { text: '报告引擎：模板版本锁定，导出对象存储桶与保留周期', duration: '3s' },
    { text: '归档与通知：工单回调 URL、重试策略与幂等键', duration: '2s' },
    { text: '审计：关键拉数与打分步骤写入操作留痕', duration: '2s' },
  ]},
  { id: 't5', phase: '执行计划', label: '确定执行顺序', duration: '6s', subSteps: [
    { text: '第一批（1–2）：基础信息 → 运行日志，产出统一证据包', duration: '3s' },
    { text: '第二批（3–4）：技术架构 + 效果能力，依赖证据包与模型元数据', duration: '3s' },
    { text: '第三批（5–6）：使用情况 + 业务指标，依赖用量与 BI 快照', duration: '3s' },
    { text: '第四批（7）：综合评分，融合 3–6 分项与权重', duration: '2s' },
    { text: '第五批（8）：问题归因与分级，对齐改进项与优先级', duration: '2s' },
    { text: '第六批（9）：生成评估报告，嵌入关键证据与行动项', duration: '2s' },
    { text: '最终（10）：归档、回写任务状态，可选通知干系人', duration: '2s' },
  ]},
  { id: 't6', phase: '质量检查', label: '校验评估完整性', duration: '5s', subSteps: [
    { text: '节点覆盖：前 9 步绑定执行智能体；结束节点仅作流程终止', duration: '2s' },
    { text: '数据窗口：日志检索起止时间与评估任务范围一致', duration: '2s' },
    { text: '评分口径：四维权重配置合法且分项与总分勾稽一致', duration: '2s' },
    { text: '报告质量：模板必填项、证据引用占位与结论一致性检查通过', duration: '2s' },
    { text: '收尾：归档路径可写，状态回写与通知策略已启用或显式跳过', duration: '2s' },
  ]},
];

const thinkingStepsExample1: ThinkingStep[] = [
  { id: 't1', phase: '意图识别', label: '检测到供需分析任务', duration: '3s', subSteps: [
    { text: '任务类型：铁矿石供需平衡分析与价格预测', duration: '2s' },
    { text: '涉及维度：矿山产能、发运量、港口库存、钢铁需求', duration: '3s' },
    { text: '数据来源：矿山数据库 + AIS船舶追踪 + 港口库存API', duration: '4s' },
  ]},
  { id: 't2', phase: '策略规划', label: '设计供需分析策略', duration: '3s', subSteps: [
    { text: '采用供需双轨策略：供应端追踪 → 需求端评估 → 平衡表构建', duration: '4s' },
    { text: '配置情景模拟模型：基准情景 × 乐观情景 × 悲观情景', duration: '5s' },
    { text: '建立数据交叉验证：发运量与到港量对照校验', duration: '3s' },
  ]},
  { id: 't3', phase: '节点拆解', label: '规划智能体编排', duration: '7s', subSteps: [
    { text: '节点1：MineCapacityTracker – 追踪全球矿山产能变动', duration: '2s' },
    { text: '节点2：ShipmentMonitor – 监测主要港口发运量与在途量', duration: '3s' },
    { text: '节点3：PortInventoryAnalyzer – 分析港口库存与疏港速度', duration: '4s' },
    { text: '节点4：SteelDemandEvaluator – 评估钢铁行业需求变化', duration: '4s' },
    { text: '节点5：BalanceSheetBuilder – 构建供需平衡表', duration: '4s' },
    { text: '节点6：PricePredictor – 价格预测与情景模拟', duration: '4s' },
    { text: '节点7：StrategyReportWriter – 生成策略建议报告', duration: '4s' },
  ]},
  { id: 't4', phase: '资源分配', label: '调度计算资源', duration: '5s', subSteps: [
    { text: '为MineCapacityTracker分配矿山数据库访问权限', duration: '2s' },
    { text: '为ShipmentMonitor分配AIS船舶追踪API配额', duration: '4s' },
    { text: '为PortInventoryAnalyzer分配港口库存实时数据权限', duration: '3s' },
    { text: '为PricePredictor分配情景模拟引擎计算资源', duration: '4s' },
    { text: '为StrategyReportWriter分配GLM-4文档生成权限', duration: '4s' },
  ]},
  { id: 't5', phase: '执行计划', label: '确定执行顺序', duration: '5s', subSteps: [
    { text: '第一批：MineCapacityTracker + ShipmentMonitor（1-2节点并行）', duration: '2s' },
    { text: '第二批：PortInventoryAnalyzer + SteelDemandEvaluator（并行）', duration: '3s' },
    { text: '第三批：BalanceSheetBuilder（依赖供需双轨数据）', duration: '4s' },
    { text: '第四批：PricePredictor（基于平衡表结果预测）', duration: '4s' },
    { text: '最终节点：StrategyReportWriter（整合分析生成报告）', duration: '4s' },
  ]},
  { id: 't6', phase: '质量检查', label: '设置供需数据校验规则', duration: '4s', subSteps: [
    { text: '校验矿山/发运/库存等关键输入字段完整性', duration: '2s' },
    { text: '对照发运量与到港量做交叉验证', duration: '2s' },
    { text: '情景参数与平衡表输出边界检查通过', duration: '2s' },
  ]},
];

const thinkingStepsExample2: ThinkingStep[] = [
  { id: 't1', phase: '意图识别', label: '检测到风险监控任务', duration: '3s', subSteps: [
    { text: '任务类型：进口大豆全链路风险监控与预警', duration: '2s' },
    { text: '监控维度：港口气象、船舶动态、装港效率、信用风险', duration: '3s' },
    { text: '数据来源：气象API + AIS追踪 + 港口作业数据 + 信用数据库', duration: '4s' },
  ]},
  { id: 't2', phase: '策略规划', label: '设计风险监控策略', duration: '3s', subSteps: [
    { text: '采用多层预警策略：数据采集 → 风险计算 → 预警分级', duration: '4s' },
    { text: '配置双链路监控：物流链路风险 + 贸易信用风险', duration: '5s' },
    { text: '建立阈值预警机制：延误概率与信用评级联动触发', duration: '3s' },
  ]},
  { id: 't3', phase: '节点拆解', label: '规划智能体编排', duration: '7s', subSteps: [
    { text: '节点1：WeatherCollector – 采集装港与卸港气象预报', duration: '2s' },
    { text: '节点2：VesselTracker – 追踪在途大豆船舶AIS动态', duration: '3s' },
    { text: '节点3：LoadingPortAssessor – 评估装港作业效率与拥堵', duration: '4s' },
    { text: '节点4：DelayRiskCalculator – 计算各环节延误风险概率', duration: '4s' },
    { text: '节点5：CreditEvaluator – 评估贸易对手信用与履约风险', duration: '4s' },
    { text: '节点6：RiskAggregator – 汇总多维风险生成预警等级', duration: '4s' },
    { text: '节点7：AlertReportWriter – 生成风险预警报告', duration: '4s' },
  ]},
  { id: 't4', phase: '资源分配', label: '调度计算资源', duration: '5s', subSteps: [
    { text: '为WeatherCollector分配气象API实时数据权限', duration: '2s' },
    { text: '为VesselTracker分配AIS船舶追踪API配额', duration: '4s' },
    { text: '为LoadingPortAssessor分配港口作业数据访问权限', duration: '3s' },
    { text: '为CreditEvaluator分配信用数据库与评级模型资源', duration: '4s' },
    { text: '为AlertReportWriter分配风险地图引擎与GLM-4权限', duration: '4s' },
  ]},
  { id: 't5', phase: '执行计划', label: '确定执行顺序', duration: '5s', subSteps: [
    { text: '第一批并行：WeatherCollector + VesselTracker（1-2节点）', duration: '2s' },
    { text: '第二批：LoadingPortAssessor（依赖气象与船舶数据）', duration: '3s' },
    { text: '第三批并行：DelayRiskCalculator + CreditEvaluator', duration: '4s' },
    { text: '第四批：RiskAggregator（汇总所有风险维度）', duration: '4s' },
    { text: '最终节点：AlertReportWriter（生成预警报告）', duration: '4s' },
  ]},
  { id: 't6', phase: '质量检查', label: '设置风险阈值校验规则', duration: '4s', subSteps: [
    { text: '气象/AIS/港口数据时间戳对齐检查', duration: '2s' },
    { text: '延误概率与信用阈值在合理区间', duration: '2s' },
    { text: '预警等级与报告字段映射完整', duration: '2s' },
  ]},
];

// ==================== Accent Colors ====================
const accentColors = ['#F59E0B', '#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F97316', '#0EA5E9', '#14B8A6', '#A855F7', '#64748B', '#22C55E'];

// ==================== Per-example lookup maps ====================
const exampleStepsMap: Record<number, WorkflowStep[]> = {
  0: initialSteps,
  1: stepsExample1,
  2: stepsExample2,
};
const exampleThinkingMap: Record<number, ThinkingStep[]> = {
  0: thinkingSteps,
  1: thinkingStepsExample1,
  2: thinkingStepsExample2,
};
const exampleNameMap: Record<number, string> = {
  0: '智能体评估',
  1: '铁矿石供需平衡分析',
  2: '进口大豆全链路风险监控',
};

// ==================== Component ====================
export function StudioCanvasPage() {
  const { workflowId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const workflowNameRef = useRef('');
  const animationThinkingRef = useRef<ThinkingStep[]>([]);
  const initialQuery = location.state?.initialQuery || '';
  const exampleId: number = location.state?.exampleId ?? -1;

  // Resolve per-example datasets (fallback to example-0 defaults)
  const activeStepsData = exampleStepsMap[exampleId] ?? initialSteps;
  const activeThinkingData = exampleThinkingMap[exampleId] ?? thinkingSteps;
  const resolvedDefaultName = exampleNameMap[exampleId] ?? '智能体评估';

  // UI state
  const [workflowName, setWorkflowName] = useState(resolvedDefaultName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [scale, setScale] = useState(0.8);
  const [position, setPosition] = useState({ x: 80, y: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);
  const [isPublished, setIsPublished] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [apiCopied, setApiCopied] = useState(false);

  // Search overlay
  const [showSearch, setShowSearch] = useState(false);
  const [canvasSearch, setCanvasSearch] = useState('');

  // 添加 Task（居中弹窗，与添加 Agent 共用 studioCanvasModal 样式）
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [draftInsertAfter, setDraftInsertAfter] = useState(-1);

  /** 底部「添加节点」展开：选择添加任务节点或向步骤追加智能体 */
  const [showAddNodePanel, setShowAddNodePanel] = useState(false);
  const addNodePanelRef = useRef<HTMLDivElement>(null);

  /** 画布任务卡「编辑」弹层 */
  const [editStepModal, setEditStepModal] = useState<{ id: string; title: string; description: string } | null>(null);

  /** 添加 Agent：选择所属步骤与目录中的智能体 */
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [addAgentStepId, setAddAgentStepId] = useState('');
  const [addAgentPickIds, setAddAgentPickIds] = useState<string[]>([]);

  const addAgentCatalog = useMemo(() => {
    const published = mockAgents.filter(a => a.publishStatus === 'published');
    return published.length > 0 ? published : mockAgents;
  }, []);

  // Data state
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  const animationThinking = useMemo(
    () => buildLeftThinkingFromSteps(activeStepsData, activeThinkingData, resolvedDefaultName, initialQuery),
    [activeStepsData, activeThinkingData, resolvedDefaultName, initialQuery]
  );
  const displayThinking = useMemo(() => {
    const src = steps.length > 0 ? steps : activeStepsData;
    return buildLeftThinkingFromSteps(src, activeThinkingData, workflowName, initialQuery);
  }, [steps, activeStepsData, activeThinkingData, workflowName, initialQuery]);

  workflowNameRef.current = workflowName;
  animationThinkingRef.current = animationThinking;

  const [stats, setStats] = useState<ExecutionStats>(() => emptyStats(initialSteps.length));
  const [agentRunDetails, setAgentRunDetails] = useState<AgentRunDetail[] | null>(null);
  const [selectedAgentRunStepId, setSelectedAgentRunStepId] = useState<string | null>(null);
  const [agentRunDetailTab, setAgentRunDetailTab] = useState<AgentRunDetailTab>('result');
  /** 从画布点击智能体后，右侧抽屉仅展示该步骤对应的执行卡片 */
  const [rightPanelFocusStepId, setRightPanelFocusStepId] = useState<string | null>(null);

  const visibleAgentRunDetails = useMemo(() => {
    if (!agentRunDetails) return null;
    if (!rightPanelFocusStepId) return agentRunDetails;
    return agentRunDetails.filter(d => d.stepId === rightPanelFocusStepId);
  }, [agentRunDetails, rightPanelFocusStepId]);

  const rightPanelStats = useMemo(() => {
    if (!rightPanelFocusStepId || !agentRunDetails) return stats;
    const d = agentRunDetails.find(x => x.stepId === rightPanelFocusStepId);
    return d ? statsForSingleAgent(d) : stats;
  }, [stats, rightPanelFocusStepId, agentRunDetails]);

  const selectedAgentRunDetail =
    agentRunDetails && selectedAgentRunStepId
      ? (agentRunDetails.find(d => d.stepId === selectedAgentRunStepId) ?? null)
      : null;

  useEffect(() => {
    if (agentRunDetails === null) setSelectedAgentRunStepId(null);
  }, [agentRunDetails]);

  useEffect(() => {
    if (!selectedAgentRunStepId || !agentRunDetails) return;
    if (!agentRunDetails.some(d => d.stepId === selectedAgentRunStepId)) {
      setSelectedAgentRunStepId(null);
    }
  }, [agentRunDetails, selectedAgentRunStepId]);

  useEffect(() => {
    if (!rightPanelFocusStepId) return;
    if (!steps.some(s => s.id === rightPanelFocusStepId)) {
      setRightPanelFocusStepId(null);
    }
  }, [steps, rightPanelFocusStepId]);

  useEffect(() => {
    if (!rightPanelFocusStepId || !agentRunDetails) return;
    if (!agentRunDetails.some(d => d.stepId === rightPanelFocusStepId)) {
      setRightPanelFocusStepId(null);
    }
  }, [agentRunDetails, rightPanelFocusStepId]);

  useEffect(() => {
    if (!showAddNodePanel) return;
    const onDoc = (e: MouseEvent) => {
      if (addNodePanelRef.current && !addNodePanelRef.current.contains(e.target as Node)) {
        setShowAddNodePanel(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [showAddNodePanel]);

  // Synchronized thinking state
  const [revealedThinkingCount, setRevealedThinkingCount] = useState(0);
  const [revealedSubSteps, setRevealedSubSteps] = useState<Record<string, number>>({});
  const [activeThinkingStep, setActiveThinkingStep] = useState<string | null>(null);
  const [manualExpanded, setManualExpanded] = useState<Record<string, boolean>>({});
  /** 质量检查阶段结束后，左侧展示的唯一条结论文案 */
  const [qualityCheckSummary, setQualityCheckSummary] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'sys-1',
      role: 'assistant',
      content: '工作流已就绪。你可以随时提出修改需求，例如调整节点顺序、新增审查步骤或修改模型配置。',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const spacePanRef = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatTyping]);

  // 按住空格可在节点上拖动画布（避免仅空白处才能拖）
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, [contenteditable="true"]')) return;
      e.preventDefault();
      spacePanRef.current = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') spacePanRef.current = false;
    };
    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const now = new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: chatInput, timestamp: now };
    setChatMessages(prev => [...prev, userMsg]);
    const userInput = chatInput;
    setChatInput('');
    setIsChatTyping(true);

    setTimeout(() => {
      setIsChatTyping(false);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: userInput.includes('添加') || userInput.includes('新增')
          ? '已理解你的需求。正在评估新节点的最佳插入位置...分析完成，建议在现有流程的第4步后插入新节点，以确保数据依赖链完整。'
          : userInput.includes('修改') || userInput.includes('调整')
            ? '已分析修改请求。涉及的节点配置已标记高亮，修改方案不会影响下游数据依赖。确认后即可应用更改。'
            : '已收到指令，正在分析对工作流的影响...分析完成。当前变更涉及 2 个节点的参数调整，预计不会影响整体执行时间。',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    }, 1600);
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  const scrollToBottom = useCallback(() => {
    if (leftPanelRef.current) {
      leftPanelRef.current.scrollTo({ top: leftPanelRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  // Canvas interactions
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setScale(prev => Math.max(0.3, Math.min(2, prev + (e.deltaY > 0 ? -0.05 : 0.05))));
      return;
    }
    const horizontalDominant = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (horizontalDominant && Math.abs(e.deltaX) > 0.5) {
      e.preventDefault();
      setPosition(p => ({ ...p, x: p.x - e.deltaX }));
      return;
    }
    if (e.shiftKey && Math.abs(e.deltaY) > 0.5) {
      e.preventDefault();
      setPosition(p => ({ ...p, x: p.x - e.deltaY }));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const panFromNode =
      e.button === 1 ||
      e.altKey ||
      spacePanRef.current;
    if (!panFromNode && (e.target as HTMLElement).closest('.node-card')) return;
    if (e.button === 1) e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, dragStart]);

  /** 与顶部「运行」同源：用显式快照执行，避免搭建动画闭包读到空的 steps */
  const runWorkflowFromSnapshot = useCallback(async (snapshot: WorkflowStep[]) => {
    if (isRunningRef.current || snapshot.length === 0) return;
    setIsRunning(true);
    setShowRightPanel(true);

    const runStepCount = snapshot.length;
    setAgentRunDetails(buildInitialAgentDetails(snapshot));
    setSteps(snapshot.map(s => ({ ...s, status: 'pending' as const })));
    setStats(emptyStats(runStepCount));

    setActiveThinkingStep('t5');
    setRevealedSubSteps(prev => ({ ...prev, t5: 0 }));
    await delayMs(500);

    const batches = getExecutionBatches(runStepCount);

    for (const batch of batches) {
      setRevealedSubSteps(prev => ({ ...prev, t5: batch.sub }));
      setAgentRunDetails(prev => patchAgentRunDetails(prev, batch.indices, 'running'));
      setSteps(prev => prev.map((s, i) => (batch.indices.includes(i) ? { ...s, status: 'running' } : s)));
      await delayMs(1000);
      setAgentRunDetails(prev => patchAgentRunDetails(prev, batch.indices, 'done'));
      setSteps(prev => prev.map((s, i) => (batch.indices.includes(i) ? { ...s, status: 'completed' } : s)));
      const completed = Math.max(...batch.indices) + 1;
      setStats(prev => ({ ...prev, ...buildPartialStats(completed, runStepCount), totalSteps: runStepCount, expectedCount: runStepCount }));
    }
    setStats(buildFinalStats(runStepCount));

    await delayMs(300);
    setActiveThinkingStep(null);
    setIsRunning(false);
  }, []);

  // ==================== Synchronized Animation ====================
  useEffect(() => {
    let cancelled = false;
    const runSyncAnimation = async () => {
      // Reset steps to prevent duplicates on re-mount (e.g. Strict Mode)
      setSteps([]);
      setAgentRunDetails(null);
      setStats(emptyStats(activeStepsData.length));
      setRevealedSubSteps({});
      setQualityCheckSummary(null);
      await delayMs(500);
      if (cancelled) return;

      const thinkAnim = animationThinkingRef.current;
      setRevealedThinkingCount(1);
      setActiveThinkingStep('t1');
      scrollToBottom();
      const t1SubCount = thinkAnim.find(t => t.id === 't1')?.subSteps?.length ?? 3;
      for (let i = 0; i < t1SubCount; i++) {
        await delayMs(280);
        setRevealedSubSteps(prev => ({ ...prev, t1: i + 1 }));
        scrollToBottom();
      }
      await delayMs(350);

      setRevealedThinkingCount(2);
      setActiveThinkingStep('t2');
      scrollToBottom();
      const t2SubCount = thinkAnim.find(t => t.id === 't2')?.subSteps?.length ?? 3;
      for (let i = 0; i < t2SubCount; i++) {
        await delayMs(280);
        setRevealedSubSteps(prev => ({ ...prev, t2: i + 1 }));
        scrollToBottom();
      }
      await delayMs(350);

      setRevealedThinkingCount(3);
      setActiveThinkingStep('t3');
      scrollToBottom();
      await delayMs(300);

      const stepCount = activeStepsData.length;

      for (let i = 0; i < stepCount; i++) {
        setRevealedSubSteps(prev => ({ ...prev, t3: i + 1 }));
        setSteps(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const newStep = { ...activeStepsData[i], status: 'pending' as const };
          if (existingIds.has(newStep.id)) return prev;
          return [...prev, newStep];
        });
        scrollToBottom();
        await delayMs(400);
      }
      await delayMs(350);

      setRevealedThinkingCount(4);
      setActiveThinkingStep('t4');
      scrollToBottom();
      const t4SubCount = thinkAnim.find(t => t.id === 't4')?.subSteps?.length ?? 5;
      for (let i = 0; i < t4SubCount; i++) {
        await delayMs(250);
        setRevealedSubSteps(prev => ({ ...prev, t4: i + 1 }));
        scrollToBottom();
      }
      await delayMs(350);

      setRevealedThinkingCount(5);
      setActiveThinkingStep('t5');
      scrollToBottom();
      await delayMs(300);

      // 左侧「执行计划」思考动画（演示）；真实执行在搭建完成后由 runWorkflowFromSnapshot 触发
      const execBatches = getExecutionBatches(stepCount);
      for (const batch of execBatches) {
        setRevealedSubSteps(prev => ({ ...prev, t5: batch.sub }));
        scrollToBottom();
        await delayMs(900);
        await delayMs(300);
      }
      await delayMs(350);

      setRevealedThinkingCount(6);
      setActiveThinkingStep('t6');
      scrollToBottom();
      const t6SubCount = thinkAnim.find(t => t.id === 't6')?.subSteps?.length ?? 0;
      for (let i = 0; i < t6SubCount; i++) {
        await delayMs(280);
        setRevealedSubSteps(prev => ({ ...prev, t6: i + 1 }));
        scrollToBottom();
      }
      await delayMs(400);

      const builtSnapshot = activeStepsData.map(s => ({ ...s, status: 'pending' as const }));
      setActiveThinkingStep(null);
      setQualityCheckSummary(buildQualityCheckSummaryFromSteps(workflowNameRef.current, builtSnapshot));
      scrollToBottom();
      await delayMs(500);

      if (cancelled) return;
      await runWorkflowFromSnapshot(builtSnapshot);
    };

    runSyncAnimation();
    return () => { cancelled = true; };
  // activeStepsData / activeThinkingData 由 exampleId 派生，与 exampleId 同步变化
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅随 exampleId 重置搭建动画
  }, [exampleId, runWorkflowFromSnapshot, scrollToBottom]);

  const openAddTaskModal = () => {
    setShowAddNodePanel(false);
    setDraftTitle('');
    setDraftDesc('');
    setDraftInsertAfter(steps.length > 0 ? steps.length - 1 : -1);
    setShowAddTaskModal(true);
  };

  /** 计算添加 Agent 时的默认步骤：优先右侧聚焦的非结束步骤，否则最后一个已有智能体的非结束步骤，再否则最后一个非结束步骤 */
  const resolveDefaultAgentStepId = useCallback((prev: WorkflowStep[]) => {
    if (prev.length === 0) return null;
    let targetId: string | null = rightPanelFocusStepId;
    if (targetId) {
      const focused = prev.find(s => s.id === targetId);
      if (!focused || focused.title === '结束') targetId = null;
    }
    if (!targetId) {
      const nonEnd = prev.filter(s => s.title !== '结束');
      const lastWithAgents = [...nonEnd].reverse().find(s => (s.subAgents?.length ?? 0) > 0);
      targetId = lastWithAgents?.id ?? nonEnd[nonEnd.length - 1]?.id ?? null;
    }
    return targetId;
  }, [rightPanelFocusStepId]);

  const appendSubAgentsToStep = useCallback((targetId: string, subs: { name: string; role: string }[]) => {
    if (subs.length === 0) return;
    setSteps(p =>
      p.map(s => {
        if (s.id !== targetId) return s;
        const nextSub = [...(s.subAgents ?? []), ...subs];
        const group =
          nextSub.length > 1
            ? (s.group ?? { name: `${s.title}·智能体组`, description: s.description })
            : s.group;
        return { ...s, subAgents: nextSub, group };
      })
    );
    setRightPanelFocusStepId(targetId);
  }, []);

  const openAddAgentModal = () => {
    setShowAddNodePanel(false);
    if (steps.length === 0) return;
    const targetId = resolveDefaultAgentStepId(steps);
    const stepOptions = steps.filter(s => s.title !== '结束');
    const sid = targetId && stepOptions.some(s => s.id === targetId) ? targetId : stepOptions[0]?.id ?? '';
    setAddAgentStepId(sid);
    const firstAgent = addAgentCatalog[0];
    setAddAgentPickIds(firstAgent?.id ? [firstAgent.id] : []);
    setShowAddAgentModal(true);
  };

  const toggleAddAgentPick = (id: string) => {
    setAddAgentPickIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleConfirmAddAgent = () => {
    if (!addAgentStepId || addAgentPickIds.length === 0) return;
    const subs = addAgentPickIds
      .map(id => addAgentCatalog.find(a => a.id === id))
      .filter((a): a is NonNullable<typeof a> => Boolean(a))
      .map(agent => ({
        name: agent.name,
        role:
          agent.description.length > 160
            ? `${agent.description.slice(0, 157)}…`
            : agent.description,
      }));
    if (subs.length === 0) return;
    appendSubAgentsToStep(addAgentStepId, subs);
    setShowAddAgentModal(false);
  };

  const handleInsertDraft = () => {
    if (!draftTitle.trim()) return;
    const colors = accentColors;
    const insertAt = draftInsertAfter + 1; // 0 = before first step
    const newStep: WorkflowStep = {
      id: `s-new-${Date.now()}`,
      index: insertAt + 1,
      title: draftTitle.trim(),
      description: draftDesc.trim() || '新建节点',
      status: 'pending',
      color: colors[insertAt % colors.length],
      model: 'GLM-4',
      tools: [],
    };
    setSteps(prev => {
      const next = [...prev];
      next.splice(insertAt, 0, newStep);
      return next.map((s, i) => ({ ...s, index: i + 1 }));
    });
    setShowAddTaskModal(false);
    setDraftTitle('');
    setDraftDesc('');
  };

  const handleDeleteStep = (stepId: string) => {
    setSteps(prev => {
      const next = prev.filter(s => s.id !== stepId);
      return next.map((s, i) => ({ ...s, index: i + 1 }));
    });
    if (rightPanelFocusStepId === stepId) setRightPanelFocusStepId(null);
    if (selectedAgentRunStepId === stepId) setSelectedAgentRunStepId(null);
  };

  const handleSaveEditStep = () => {
    if (!editStepModal) return;
    const title = editStepModal.title.trim();
    if (!title) return;
    const description = editStepModal.description.trim() || '新建节点';
    setSteps(prev =>
      prev.map(s => (s.id === editStepModal.id ? { ...s, title, description } : s))
    );
    setEditStepModal(null);
  };

  const handleRun = async () => {
    await runWorkflowFromSnapshot(steps);
  };

  /** 仅执行当前画布上某一智能体对应步骤（右侧抽屉与顶部「运行」一致的数据源） */
  const handleRunSingleAgent = async (stepId: string) => {
    if (isRunning) return;
    const snapshot = steps;
    const idx = snapshot.findIndex(s => s.id === stepId);
    if (idx < 0 || !shouldShowAgentCardBelowStep(snapshot[idx])) return;

    setIsRunning(true);
    setShowRightPanel(true);
    setRightPanelFocusStepId(stepId);
    setSelectedAgentRunStepId(stepId);
    setAgentRunDetailTab('result');

    const runStepCount = snapshot.length;
    setAgentRunDetails(buildInitialAgentDetails(snapshot));
    setSteps(snapshot.map(s => ({ ...s, status: 'pending' as const })));
    setStats(emptyStats(runStepCount));

    setActiveThinkingStep('t5');
    setRevealedSubSteps(prev => ({ ...prev, t5: Math.min(idx + 1, runStepCount) }));
    await delayMs(500);

    setAgentRunDetails(prev => patchAgentRunDetails(prev, [idx], 'running'));
    setSteps(prev => prev.map((s, i) => (i === idx ? { ...s, status: 'running' } : s)));
    await delayMs(1000);
    setAgentRunDetails(prev => patchAgentRunDetails(prev, [idx], 'done'));
    setSteps(prev => prev.map((s, i) => (i === idx ? { ...s, status: 'completed' } : s)));
    setStats(prev => ({
      ...prev,
      ...buildPartialStats(1, runStepCount),
      totalSteps: runStepCount,
      expectedCount: runStepCount,
    }));

    await delayMs(300);
    setActiveThinkingStep(null);
    setIsRunning(false);
  };

  const isStepExpanded = (stepId: string) => {
    if (manualExpanded[stepId] !== undefined) return manualExpanded[stepId];
    return activeThinkingStep === stepId;
  };

  const toggleStepExpand = (stepId: string) => {
    setManualExpanded(prev => ({ ...prev, [stepId]: !isStepExpanded(stepId) }));
  };

  useEffect(() => {
    if (activeThinkingStep) setManualExpanded({});
  }, [activeThinkingStep]);

  const visibleThinkingSteps = displayThinking.slice(0, revealedThinkingCount);

  const workflowSourceForLeft = steps.length > 0 ? steps : activeStepsData;

  useEffect(() => {
    if (!qualityCheckSummary) return;
    setRevealedSubSteps(prev => ({
      ...prev,
      t3: Math.max(prev.t3 ?? 0, steps.length),
    }));
  }, [steps.length, qualityCheckSummary]);

  useEffect(() => {
    if (!qualityCheckSummary) return;
    const src = steps.length > 0 ? steps : activeStepsData;
    setQualityCheckSummary(buildQualityCheckSummaryFromSteps(workflowName, src));
  }, [steps, activeStepsData, workflowName, qualityCheckSummary]);

  // Phase icons for thinking steps
  const phaseIcons: Record<string, React.ReactNode> = {
    t1: <Search className="w-2.5 h-2.5" />,
    t2: <Zap className="w-2.5 h-2.5" />,
    t3: <Layers className="w-2.5 h-2.5" />,
    t4: <Cpu className="w-2.5 h-2.5" />,
    t5: <Play className="w-2.5 h-2.5" />,
    t6: <CheckCircle2 className="w-2.5 h-2.5" />,
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#cfd6e4] via-[#d6dce8] to-[#c8d0e0] select-none">
      {/* ===== Top Bar ===== */}
      <header className="min-h-12 border-b border-[#e2e8f0] flex items-center justify-between px-6 py-2.5 flex-shrink-0 bg-white/70 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(workflowId === 'new' ? '/studio' : '/galaxy')}
            className="w-8 h-8 rounded-lg bg-[#edf1f8]/80 hover:bg-[#d8e0ec] flex items-center justify-center transition-colors"
            title={workflowId === 'new' ? '返回 Studio' : '返回首页'}
          >
            <ArrowLeft className="w-4 h-4 text-[#4a5b73]" />
          </button>
          <div className="w-px h-5 bg-[#e2e8f0]" />
          {isEditingName ? (
            <input
              autoFocus
              value={workflowName}
              onChange={e => setWorkflowName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
              className="text-sm text-[#0d1b2a] bg-transparent border-b border-[#6366F1] outline-none px-1 py-0.5"
            />
          ) : (
            <button onClick={() => setIsEditingName(true)} className="flex items-center gap-1.5 text-sm text-[#0d1b2a] hover:text-[#1b2d45] group">
              {workflowName}
              <Pencil className="w-3 h-3 text-[#a3b1c6] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
          <span className="text-[11px] text-[#a3b1c6] bg-[#edf1f8] px-2 py-0.5 rounded">v1.0</span>
          <span className="text-[11px] text-[#a3b1c6]">自动保存 · {new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-[#edf1f8]/80 hover:bg-[#d8e0ec] flex items-center justify-center transition-colors text-[#4a5b73] hover:text-[#0d1b2a]"
            title="重置"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            title={steps.length === 0 ? '请先完成工作流搭建' : undefined}
            disabled={isRunning || steps.length === 0}
            onClick={() => {
              if (isRunning || steps.length === 0) return;
              handleRun();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-all border ${
              isRunning
                ? 'border-[#0d1b2a] bg-[#0d1b2a] text-white cursor-default shadow-sm shadow-[#0d1b2a]/15'
                : steps.length === 0
                  ? 'border-[#e2e8f0] bg-white/50 text-[#a3b1c6] cursor-not-allowed opacity-75'
                  : 'border-[#e2e8f0] bg-white/70 text-[#4a5b73] hover:bg-[#edf1f8] hover:border-[#d8e0ec] hover:text-[#0d1b2a]'
            }`}
            style={{ fontWeight: 500 }}
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" strokeWidth={2} />
            ) : (
              <Play className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            )}
            {isRunning ? '运行中' : '运行'}
          </button>
          <button
            type="button"
            onClick={() => { setIsPublished(true); setShowPublishModal(true); }}
            disabled={isPublished}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all border ${
              isPublished
                ? 'border-[#e2e8f0] bg-[#f4f6fa] text-[#7d8da1] cursor-default'
                : 'border-[#0d1b2a] bg-[#0d1b2a] text-white hover:bg-[#1b2d45] shadow-sm shadow-[#0d1b2a]/12'
            }`}
            style={{ fontWeight: 500 }}
          >
            <Rocket className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            {isPublished ? '已发布' : '发布'}
          </button>
        </div>
      </header>

      {/* ===== Publish Popover ===== */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50" onClick={() => setShowPublishModal(false)}>
          <div className="fixed right-4 top-[56px] bg-white rounded-xl border border-[#e2e8f0] shadow-xl shadow-[#0d1b2a]/[0.08] w-[340px] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              </div>
              <h3 className="text-[15px] text-[#0d1b2a] mb-1" style={{ fontWeight: 500 }}>工作流已发布</h3>
              <p className="text-xs text-[#7d8da1]">{`「${workflowName}」已成功发布，可通过 API 调用`}</p>
            </div>
            <div className="px-5 pb-3">
              <label className="text-[11px] text-[#7d8da1] mb-1.5 block">API Endpoint</label>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 bg-[#f4f6fa] rounded-lg px-3 py-2 overflow-x-auto border border-[#e2e8f0]">
                  <code className="text-[11px] text-[#0d1b2a] whitespace-nowrap" style={{ fontFamily: 'ui-monospace, monospace' }}>
                    {`POST /api/v1/workflows/${workflowName.replace(/\s+/g, '-').toLowerCase()}/run`}
                  </code>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`POST /api/v1/workflows/${workflowName.replace(/\s+/g, '-').toLowerCase()}/run`);
                    setApiCopied(true);
                    setTimeout(() => setApiCopied(false), 2000);
                  }}
                  className="flex-shrink-0 p-2 bg-[#edf1f8] hover:bg-[#e2e8f0] rounded-lg transition-colors"
                >
                  {apiCopied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 text-[#4a5b73]" />}
                </button>
              </div>
            </div>
            <div className="px-5 pb-4 flex items-center justify-end">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-1.5 bg-[#0d1b2a] text-white rounded-lg text-xs hover:bg-[#1b2d45] transition-colors"
                style={{ fontWeight: 500 }}
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Main Content ===== */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ===== Left Panel: Thinking Process ===== */}
        {showLeftPanel && (
          <div className="w-[320px] border-r border-[#e2e8f0] flex flex-col bg-white/70 backdrop-blur-xl flex-shrink-0 overflow-hidden z-10">
            <div className="flex-1 overflow-y-auto" ref={leftPanelRef}>
              {/* User Request */}
              <div className="px-4 pt-4 pb-3">
                <div className="bg-[#eef2f7]/80 rounded-xl p-3.5 border border-[#e2e8f0]">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-2.5 h-2.5 text-[#7d8da1]" />
                    <span className="text-[9px] text-[#7d8da1]" style={{ fontWeight: 500 }}>用户请求</span>
                    <span className="text-[8px] text-[#a3b1c6] ml-auto">{new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[8px] text-[#a3b1c6] leading-snug mb-1.5 break-words">
                    当前画布：<span className="text-[#4a5b73] font-medium">「{workflowName}」</span>
                    <span className="text-[#a3b1c6]"> · {workflowSourceForLeft.length} 个节点</span>
                  </p>
                  <p className="text-[10px] text-[#4a5b73] leading-[1.6] whitespace-pre-wrap break-words">
                    {initialQuery.trim()
                      ? initialQuery
                      : defaultWorkflowIntentDescription(workflowSourceForLeft)}
                  </p>
                </div>
              </div>

              {/* Thinking Steps */}
              <div className="px-4 pb-4">
                <div className="space-y-0.5">
                  {visibleThinkingSteps.map((step, idx) => {
                    const expanded = isStepExpanded(step.id);
                    const hasSubSteps = step.subSteps && step.subSteps.length > 0;
                    const visibleSubCount = revealedSubSteps[step.id] || 0;
                    const isActive = activeThinkingStep === step.id;
                    const subTotal = step.subSteps?.length ?? 0;
                    const t6SubsComplete = step.id === 't6' && subTotal > 0 && visibleSubCount >= subTotal;
                    const isCompleted =
                      !isActive &&
                      (step.id === 't6' ? t6SubsComplete : revealedThinkingCount > idx + 1);

                    return (
                      <div key={step.id} className="relative">
                        {/* Timeline connector */}
                        {idx < visibleThinkingSteps.length - 1 && (
                          <div
                            className={`absolute left-[13px] top-[32px] w-px transition-colors duration-300 ${isCompleted ? 'bg-[#10B981]/30' : 'bg-[#e2e8f0]'}`}
                            style={{ height: expanded && visibleSubCount > 0 ? 'calc(100% - 16px)' : '16px' }}
                          />
                        )}

                        {/* Step card */}
                        <button
                          onClick={() => hasSubSteps && visibleSubCount > 0 && toggleStepExpand(step.id)}
                          className={`flex items-center gap-2.5 py-2 px-2 w-full text-left rounded-lg transition-colors ${
                            isActive ? 'bg-[#6366F1]/[0.06]' : 'hover:bg-[#eef2f7]/60'
                          }`}
                        >
                          {/* Phase icon */}
                          <div className={`w-[26px] h-[26px] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                            isActive
                              ? 'bg-[#6366F1] text-white'
                              : isCompleted
                                ? 'bg-[#10B981] text-white'
                                : 'bg-[#edf1f8] text-[#7d8da1]'
                          }`}>
                            {phaseIcons[step.id] || <Circle className="w-2.5 h-2.5" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] ${isActive ? 'text-[#6366F1]' : isCompleted ? 'text-[#10B981]' : 'text-[#4a5b73]'}`} style={{ fontWeight: 500 }}>
                                {step.phase}
                              </span>
                              <span className="text-[9px] text-[#7d8da1]">· {step.label}</span>
                            </div>
                          </div>

                          {isActive && <Loader2 className="w-2.5 h-2.5 text-[#6366F1] animate-spin flex-shrink-0" />}
                          <span className="text-[8px] text-[#a3b1c6] tabular-nums flex-shrink-0">{step.duration}</span>
                          {hasSubSteps && visibleSubCount > 0 && (
                            <ChevronRight className={`w-2.5 h-2.5 text-[#a3b1c6] transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
                          )}
                        </button>

                        {/* Sub-steps */}
                        {expanded && hasSubSteps && visibleSubCount > 0 && (
                          <div className="ml-[38px] mr-2 mb-1 space-y-0">
                            {step.subSteps!.slice(0, visibleSubCount).map((sub, si) => (
                              <div key={si} className="flex items-start gap-2 py-1.5 px-2 rounded-md">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#d8e0ec] mt-[5px] flex-shrink-0" />
                                <span className="text-[9px] text-[#7d8da1] leading-[1.5] flex-1">{sub.text}</span>
                                <span className="text-[8px] text-[#a3b1c6] tabular-nums flex-shrink-0 ml-1">{sub.duration}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {qualityCheckSummary && (
                <div className="px-4 pb-4">
                  <div className="rounded-xl border border-[#a7f3d0]/70 bg-[#ecfdf5]/85 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#047857] shrink-0" strokeWidth={2.25} />
                      <span className="text-[9px] font-medium text-[#047857]">质量检查结果</span>
                    </div>
                    <p className="text-[9px] text-[#166534] leading-relaxed whitespace-pre-wrap break-words">
                      {qualityCheckSummary}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom status */}
            {activeThinkingStep && (
              <div className="px-4 py-2.5 border-t border-[#e2e8f0] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-pulse" />
                  <span className="text-[9px] text-[#7d8da1]">正在分析中...</span>
                </div>
              </div>
            )}

            {/* ===== Chat Section ===== */}
            <div className="flex flex-col flex-shrink-0 border-t border-[#e2e8f0]">
              {/* Chat input */}
              <div className="px-3 py-2.5 flex-shrink-0">
                <div className="bg-[#f8f9fc] border border-[#e2e8f0] rounded-xl p-2.5 focus-within:border-[#6366F1]/40 transition-colors">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    placeholder="输入修改指令..."
                    className="w-full bg-transparent text-[#0d1b2a] placeholder-[#a3b1c6] text-[10px] resize-none outline-none min-h-[28px] max-h-[52px] leading-relaxed"
                  />
                  <div className="flex items-center justify-end gap-1.5 mt-1.5 pt-1.5 border-t border-[#edf1f8]">
                    <button className="p-1.5 hover:bg-[#edf1f8] rounded-md transition-colors">
                      <Paperclip className="w-2.5 h-2.5 text-[#a3b1c6]" />
                    </button>
                    <button
                      onClick={handleChatSend}
                      disabled={!chatInput.trim()}
                      className="px-2.5 py-1.5 bg-[#0d1b2a] hover:bg-[#1b2d45] rounded-lg transition-all flex items-center gap-1 text-white text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Send className="w-2.5 h-2.5" />
                      发送
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Left panel toggle */}
        <button
          onClick={() => setShowLeftPanel(!showLeftPanel)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/70 backdrop-blur-xl border border-[#e2e8f0] rounded-r-lg px-1 py-3 hover:bg-[#eef2f7] transition-colors shadow-sm"
          style={{ left: showLeftPanel ? '320px' : '0' }}
        >
          <ChevronRight className={`w-3 h-3 text-[#7d8da1] transition-transform ${showLeftPanel ? 'rotate-180' : ''}`} />
        </button>

        {/* ===== Canvas ===== */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-[#b8c2d4]/[0.55]"
          title="拖动画布：空白处按住拖动；节点上需按住 Alt 或 空格，或 Shift+滚轮横向移动"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          {showGrid && (
            <div className="absolute inset-0 opacity-[0.55]" style={{
              backgroundImage: 'radial-gradient(circle, #64748b 0.55px, transparent 0.55px)',
              backgroundSize: '20px 20px',
            }} />
          )}

          {/* Canvas content */}
          <div
            className="absolute origin-top-left transition-transform duration-75"
            style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
          >
            <div className="flex items-start gap-0 p-12">
              {/* User Instruction Node */}
              <div className="node-card flex-shrink-0 flex flex-col items-center" style={{ width: 260 }}>
                <div className="bg-white/92 backdrop-blur-xl rounded-xl border border-[#94a3b8] shadow-md shadow-slate-900/10 overflow-hidden hover:shadow-lg transition-shadow w-full">
                  <div className="h-[3px] bg-[#0d1b2a]" />
                  <div className="p-4">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#0d1b2a]/[0.06] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#0d1b2a]" />
                      </div>
                      <div>
                        <span className="text-xs text-[#0d1b2a]" style={{ fontWeight: 500 }}>用户指令</span>
                        <p className="text-[10px] text-[#a3b1c6]">输入节点</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#4a5b73] leading-[1.7] whitespace-pre-wrap break-words">
                      {initialQuery.trim()
                        ? initialQuery
                        : '对目标智能体执行全链路评估：查询智能体基础信息与运行日志，完成技术/效果/使用/业务四维打分，输出综合评分、问题归因与正式评估报告。'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Arrow from user instruction to first step */}
              <div className="self-start flex items-center flex-shrink-0" style={{ width: 50, marginTop: 78 }}>
                <div className="w-full h-px bg-[#64748b] relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-[#64748b] border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent" />
                </div>
              </div>

              {/* Workflow Steps — task card + agent group card（参考设计稿纵向串联） */}
              {steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  {/* Step column；结束节点较矮，与横向连线 marginTop:96 对齐，避免与步骤 9 的连线脱节 */}
                  <div
                    className="node-card flex-shrink-0 flex flex-col items-center"
                    style={{
                      width: 300,
                      ...(step.title === '结束' && idx > 0 ? { paddingTop: 68 } : {}),
                    }}
                  >
                    <StepNode
                      step={step}
                      onDeleteStep={handleDeleteStep}
                      onEditStep={s =>
                        setEditStepModal({ id: s.id, title: s.title, description: s.description })
                      }
                    />
                    {shouldShowAgentCardBelowStep(step) && (
                      <>
                        <div className="flex flex-col items-center w-full py-1">
                          <div className="w-px h-5 bg-[#64748b]" />
                          <div
                            className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#64748b]"
                            style={{ marginTop: -1 }}
                          />
                        </div>
                        <AgentGroupCard
                          step={step}
                          focused={rightPanelFocusStepId === step.id}
                          onOpenExecutionPanel={() => {
                            setRightPanelFocusStepId(step.id);
                            setShowRightPanel(true);
                            setSelectedAgentRunStepId(step.id);
                            setAgentRunDetailTab('result');
                          }}
                          onRunAgent={() => handleRunSingleAgent(step.id)}
                          onEditStep={s => setEditStepModal({ id: s.id, title: s.title, description: s.description })}
                          onDeleteStep={handleDeleteStep}
                        />
                      </>
                    )}
                  </div>
                  {/* Horizontal arrow to next step */}
                  {idx < steps.length - 1 && (
                    <div className="self-start flex items-center flex-shrink-0" style={{ width: 40, marginTop: 96 }}>
                      <div className={`w-full h-px relative transition-colors duration-500 ${
                        step.status === 'completed' ? 'bg-[#059669]' : 'bg-[#64748b]'
                      }`}>
                        <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent transition-colors duration-500 ${
                          step.status === 'completed' ? 'border-l-[#059669]' : 'border-l-[#64748b]'
                        }`} />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Search overlay */}
          {showSearch && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-xl rounded-xl border border-[#e2e8f0] shadow-lg px-3 py-2 flex items-center gap-2" style={{ minWidth: 260 }}>
              <Search className="w-4 h-4 text-[#a3b1c6] flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={canvasSearch}
                onChange={e => setCanvasSearch(e.target.value)}
                placeholder="搜索节点..."
                className="flex-1 text-xs text-[#0d1b2a] placeholder-[#a3b1c6] bg-transparent outline-none"
              />
              {canvasSearch && (
                <span className="text-[11px] text-[#6366F1]">
                  {steps.filter(s => s.title.includes(canvasSearch) || s.description.includes(canvasSearch)).length} 个匹配
                </span>
              )}
              <button onClick={() => { setShowSearch(false); setCanvasSearch(''); }} className="p-1 rounded hover:bg-[#eef2f7] transition-colors">
                <X className="w-3.5 h-3.5 text-[#a3b1c6]" />
              </button>
            </div>
          )}

          {/* Bottom Toolbar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] shadow-sm shadow-[#0d1b2a]/[0.04] px-2 py-1.5 z-10">
            <button
              type="button"
              onClick={() => setShowSearch(s => !s)}
              className={`p-1.5 rounded-lg transition-colors ${showSearch ? 'bg-[#edf1f8] text-[#0d1b2a]' : 'hover:bg-[#edf1f8] text-[#7d8da1] hover:text-[#4a5b73]'}`}
              title="搜索节点"
            >
              <Search className="w-4 h-4" strokeWidth={2} />
            </button>
            <div className="w-px h-4 bg-[#e2e8f0] mx-0.5" />
            <button
              type="button"
              onClick={() => setPosition(p => ({ ...p, x: p.x - 240 }))}
              className="p-1.5 rounded-lg hover:bg-[#eef2f7] transition-colors"
              title="查看右侧步骤（画布左移）"
            >
              <ChevronLeft className="w-4 h-4 text-[#7d8da1]" />
            </button>
            <button
              type="button"
              onClick={() => setPosition(p => ({ ...p, x: p.x + 240 }))}
              className="p-1.5 rounded-lg hover:bg-[#eef2f7] transition-colors"
              title="查看左侧步骤（画布右移）"
            >
              <ChevronRight className="w-4 h-4 text-[#7d8da1]" />
            </button>
            <div className="w-px h-4 bg-[#e2e8f0] mx-0.5" />
            <button onClick={() => setScale(prev => Math.max(0.3, prev - 0.1))} className="p-1.5 rounded-lg hover:bg-[#eef2f7] transition-colors" title="缩小">
              <ZoomOut className="w-4 h-4 text-[#7d8da1]" />
            </button>
            <span className="text-[11px] text-[#7d8da1] px-1.5 tabular-nums min-w-[36px] text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(prev => Math.min(2, prev + 0.1))} className="p-1.5 rounded-lg hover:bg-[#eef2f7] transition-colors" title="放大">
              <ZoomIn className="w-4 h-4 text-[#7d8da1]" />
            </button>
            <button
              onClick={() => { setScale(0.8); setPosition({ x: 80, y: 60 }); }}
              className="p-1.5 rounded-lg hover:bg-[#eef2f7] transition-colors"
              title="适应画布"
            >
              <Maximize2 className="w-4 h-4 text-[#7d8da1]" />
            </button>
            <div className="w-px h-4 bg-[#e2e8f0] mx-0.5" />
            <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded-lg transition-colors ${showGrid ? 'bg-[#eef2f7] text-[#0d1b2a]' : 'hover:bg-[#eef2f7] text-[#7d8da1]'}`} title="显示/隐藏网格">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/studio/canvas/${workflowName.replace(/\s+/g, '-').toLowerCase()}`;
                navigator.clipboard.writeText(url);
              }}
              className="p-1.5 rounded-lg hover:bg-[#eef2f7] transition-colors text-[#7d8da1]"
              title="复制分享链接"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[#e2e8f0] mx-0.5" />
            <div className="relative" ref={addNodePanelRef}>
              <button
                type="button"
                onClick={() => setShowAddNodePanel(p => !p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border ${
                  showAddNodePanel
                    ? 'border-[#0d1b2a] bg-[#0d1b2a] text-white shadow-sm shadow-[#0d1b2a]/12'
                    : 'border-[#0d1b2a] bg-[#0d1b2a] text-white hover:bg-[#1b2d45] shadow-sm shadow-[#0d1b2a]/10'
                }`}
                style={{ fontWeight: 500 }}
              >
                <Plus className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                添加节点
              </button>
              {showAddNodePanel && (
                <div
                  role="menu"
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 flex flex-col gap-0.5 min-w-[180px] py-1.5 px-1.5 rounded-xl border border-[#e2e8f0] bg-white/95 backdrop-blur-xl shadow-lg shadow-[#0d1b2a]/10"
                  onMouseDown={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-left text-[#0d1b2a] hover:bg-[#eef2f7] transition-colors"
                    onClick={() => openAddTaskModal()}
                  >
                    <Layers className="w-3.5 h-3.5 text-[#6366F1] shrink-0" strokeWidth={2} />
                    添加 task
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-left text-[#0d1b2a] hover:bg-[#eef2f7] transition-colors"
                    onClick={openAddAgentModal}
                  >
                    <Bot className="w-3.5 h-3.5 text-[#6366F1] shrink-0" strokeWidth={2} />
                    添加 agent
                  </button>
                </div>
              )}
            </div>
          </div>

          {showAddTaskModal && (
            <div
              className={studioCanvasModal.backdrop}
              onClick={() => setShowAddTaskModal(false)}
            >
              <div
                className={studioCanvasModal.panel}
                onClick={e => e.stopPropagation()}
              >
                <div className={studioCanvasModal.head}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 pr-2">
                      <h3 className={studioCanvasModal.title}>添加 Task</h3>
                      <p className={studioCanvasModal.subtitle}>
                        填写任务节点信息并选择在工作流中的插入位置
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddTaskModal(false)}
                      className={studioCanvasModal.closeBtn}
                      aria-label="关闭"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className={studioCanvasModal.body}>
                  <div>
                    <label className={studioCanvasModal.label}>节点名称 *</label>
                    <input
                      autoFocus
                      type="text"
                      value={draftTitle}
                      onChange={e => setDraftTitle(e.target.value)}
                      placeholder="输入节点名称..."
                      className={studioCanvasModal.input}
                    />
                  </div>
                  <div>
                    <label className={studioCanvasModal.label}>节点描述</label>
                    <textarea
                      value={draftDesc}
                      onChange={e => setDraftDesc(e.target.value)}
                      placeholder="描述该节点的功能..."
                      rows={3}
                      className={studioCanvasModal.textarea}
                    />
                  </div>
                  <div>
                    <label className={studioCanvasModal.label}>插入位置</label>
                    <select
                      value={draftInsertAfter}
                      onChange={e => setDraftInsertAfter(Number(e.target.value))}
                      className={studioCanvasModal.select}
                    >
                      <option value={-1}>置于最前</option>
                      {steps.map((s, i) => (
                        <option key={s.id} value={i}>{`步骤 ${i + 1}「${s.title}」之后`}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={studioCanvasModal.footer}>
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModal(false)}
                    className={studioCanvasModal.btnGhost}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertDraft}
                    disabled={!draftTitle.trim()}
                    className={studioCanvasModal.btnPrimary}
                  >
                    插入工作流
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 任务卡「编辑」 */}
          {editStepModal && (
            <div
              className={studioCanvasModal.backdrop}
              onClick={() => setEditStepModal(null)}
            >
              <div
                className={studioCanvasModal.panel}
                onClick={e => e.stopPropagation()}
              >
                <div className={studioCanvasModal.head}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 pr-2">
                      <h3 className={studioCanvasModal.title}>编辑节点</h3>
                      <p className={studioCanvasModal.subtitle}>修改画布上该任务节点的名称与描述</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditStepModal(null)}
                      className={studioCanvasModal.closeBtn}
                      aria-label="关闭"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className={studioCanvasModal.body}>
                  <div>
                    <label className={studioCanvasModal.label}>节点名称 *</label>
                    <input
                      type="text"
                      value={editStepModal.title}
                      onChange={e => setEditStepModal(m => (m ? { ...m, title: e.target.value } : m))}
                      className={studioCanvasModal.input}
                    />
                  </div>
                  <div>
                    <label className={studioCanvasModal.label}>节点描述</label>
                    <textarea
                      value={editStepModal.description}
                      onChange={e => setEditStepModal(m => (m ? { ...m, description: e.target.value } : m))}
                      rows={3}
                      className={studioCanvasModal.textarea}
                    />
                  </div>
                </div>
                <div className={studioCanvasModal.footer}>
                  <button
                    type="button"
                    onClick={() => setEditStepModal(null)}
                    className={studioCanvasModal.btnGhost}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditStep}
                    disabled={!editStepModal.title.trim()}
                    className={studioCanvasModal.btnPrimary}
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAddAgentModal && (
            <div
              className={studioCanvasModal.backdrop}
              onClick={() => setShowAddAgentModal(false)}
            >
              <div
                className={studioCanvasModal.panel}
                onClick={e => e.stopPropagation()}
              >
                <div className={studioCanvasModal.head}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 pr-2">
                      <h3 className={studioCanvasModal.title}>添加 Agent</h3>
                      <p className={studioCanvasModal.subtitle}>
                        选择目标步骤，并从智能体目录中挂载一个或多个 Agent
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddAgentModal(false)}
                      className={studioCanvasModal.closeBtn}
                      aria-label="关闭"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className={`${studioCanvasModal.body} min-h-0 flex flex-col`}>
                  <div className="shrink-0">
                    <label className={studioCanvasModal.label}>所属步骤</label>
                    <select
                      value={addAgentStepId}
                      onChange={e => setAddAgentStepId(e.target.value)}
                      className={studioCanvasModal.select}
                    >
                      {steps
                        .filter(s => s.title !== '结束')
                        .map(s => (
                          <option key={s.id} value={s.id}>
                            步骤 {s.index} · {s.title}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="min-h-0 flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 shrink-0">
                      <span className="text-[11px] text-[#7d8da1] font-normal">
                        选择 Agent（可多选）
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setAddAgentPickIds(addAgentCatalog.map(a => a.id))}
                          className={studioCanvasModal.link}
                        >
                          全选
                        </button>
                        <span className="text-[#e2e8f0] text-[10px]">|</span>
                        <button
                          type="button"
                          onClick={() => setAddAgentPickIds([])}
                          className={studioCanvasModal.linkMuted}
                        >
                          清空
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#94a3b8] shrink-0">
                      已选 {addAgentPickIds.length} 个
                    </p>
                    <div
                      className={`${studioCanvasModal.listBox} min-h-[140px] max-h-[min(240px,40vh)]`}
                    >
                      {addAgentCatalog.map(a => {
                        const checked = addAgentPickIds.includes(a.id);
                        return (
                          <label
                            key={a.id}
                            className={`flex items-start gap-2.5 px-3 py-2.5 cursor-pointer text-xs transition-colors ${
                              checked ? 'bg-[#6366F1]/[0.06]' : 'hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAddAgentPick(a.id)}
                              className="mt-0.5 rounded border-[#cbd5e1] text-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="font-medium text-[#0d1b2a] block leading-snug">
                                {a.name}
                                {a.version ? (
                                  <span className="font-normal text-[#94a3b8]"> {a.version}</span>
                                ) : null}
                              </span>
                              {a.tags?.length ? (
                                <span className="text-[10px] text-[#94a3b8] line-clamp-1 mt-0.5">
                                  {a.tags.join(' · ')}
                                </span>
                              ) : null}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className={studioCanvasModal.footer}>
                  <button
                    type="button"
                    onClick={() => setShowAddAgentModal(false)}
                    className={studioCanvasModal.btnGhost}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAddAgent}
                    disabled={!addAgentStepId || addAgentPickIds.length === 0}
                    className={studioCanvasModal.btnPrimary}
                  >
                    确定{addAgentPickIds.length > 0 ? `（${addAgentPickIds.length}）` : ''}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedAgentRunDetail && (
          <AgentRunDetailSidePanel
            detail={selectedAgentRunDetail}
            tab={agentRunDetailTab}
            onTabChange={setAgentRunDetailTab}
            onClose={() => setSelectedAgentRunStepId(null)}
          />
        )}

        {/* ===== Right Panel ===== */}
        {showRightPanel && (
          <div className="w-[320px] border-l border-[#e2e8f0] flex flex-col bg-white/70 backdrop-blur-xl flex-shrink-0 overflow-hidden z-10 shadow-[inset_1px_0_0_0_rgba(226,232,240,0.9)]">
            <div className="flex items-start justify-between gap-3 px-4 py-3.5 border-b border-[#e2e8f0] flex-shrink-0 bg-[#fafbfc]/90">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-4 h-4 text-[#6366F1]" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h2 className={`${panelText.title} leading-tight`}>执行状态</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowRightPanel(false);
                  setSelectedAgentRunStepId(null);
                  setRightPanelFocusStepId(null);
                }}
                className="p-1.5 rounded-lg hover:bg-[#eef2f7] text-[#a3b1c6] hover:text-[#7d8da1] transition-colors shrink-0"
                title="关闭"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-subtle min-h-0">
              <div className="px-4 pt-4 pb-6 min-h-0 flex flex-col gap-5">
                {agentRunDetails !== null && <ExecutionMetricsPanel stats={rightPanelStats} />}
                {agentRunDetails !== null && agentRunDetails.length === 0 ? (
                  <div className="rounded-xl border border-[#e2e8f0] bg-[#eef2f7]/80 p-4 text-center">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center mx-auto mb-3 shadow-sm shadow-[#0d1b2a]/[0.04]">
                      <Layers className="w-4 h-4 text-[#a3b1c6]" />
                    </div>
                    <p className={`${panelText.body} leading-[1.65] px-0.5`}>
                      当前流程无挂接智能体节点（如仅含结束节点），无需展示运行卡片。
                    </p>
                  </div>
                ) : agentRunDetails !== null && visibleAgentRunDetails && visibleAgentRunDetails.length === 0 ? (
                  <div className="rounded-xl border border-[#e2e8f0] bg-[#eef2f7]/80 p-4 text-center">
                    <p className={`${panelText.body} leading-[1.65] px-0.5`}>
                      {rightPanelFocusStepId
                        ? '未找到该智能体的执行明细，请先运行工作流。'
                        : '未找到该智能体的执行明细，请确认已运行工作流或返回全部列表。'}
                    </p>
                  </div>
                ) : agentRunDetails !== null && visibleAgentRunDetails && visibleAgentRunDetails.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 px-0.5">
                      <Bot className="w-3.5 h-3.5 text-[#7d8da1] shrink-0" strokeWidth={2} />
                      <span className={panelText.label}>
                        {rightPanelFocusStepId ? '该智能体执行' : '智能体执行'}
                      </span>
                    </div>
                    {visibleAgentRunDetails.map(d => (
                      <AgentRunStatusCard
                        key={d.stepId}
                        detail={d}
                        selected={selectedAgentRunStepId === d.stepId}
                        onOpen={() => {
                          setSelectedAgentRunStepId(d.stepId);
                          setAgentRunDetailTab('result');
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== Task / Agent cards（单智能体 + 模型/工具） ====================
function StepNodeStatusBadge({ status }: { status: WorkflowStep['status'] }) {
  if (status === 'completed') {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border shrink-0 bg-emerald-50 text-emerald-800 border-emerald-200/90">
        已完成
      </span>
    );
  }
  if (status === 'running') {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border shrink-0 bg-sky-50 text-sky-800 border-sky-200/90">
        运行中
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border shrink-0 bg-slate-100 text-slate-600 border-slate-200/90">
      等待
    </span>
  );
}

function StepNode({
  step,
  onDeleteStep,
  onEditStep,
}: {
  step: WorkflowStep;
  onDeleteStep?: (id: string) => void;
  onEditStep?: (step: WorkflowStep) => void;
}) {
  const running = step.status === 'running';
  const isEndStep = step.title === '结束';
  const [moreOpen, setMoreOpen] = useState(false);
  const moreWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (moreWrapRef.current && !moreWrapRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [moreOpen]);

  const shellClass = `rounded-2xl border bg-white overflow-hidden transition-all duration-300 shadow-md shadow-slate-900/12 ${
    running ? 'border-sky-400 ring-2 ring-sky-200/90' : 'border-slate-400/90'
  }`;

  const moreButton = (
    <div ref={moreWrapRef} className="relative flex items-center gap-0.5 shrink-0 -mr-1 -mt-0.5">
      <button
        type="button"
        title="更多"
        onMouseDown={e => e.stopPropagation()}
        onClick={e => {
          e.stopPropagation();
          setMoreOpen(o => !o);
        }}
        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {moreOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 z-[100] min-w-[128px] rounded-lg border border-slate-200/90 bg-white py-1 shadow-lg shadow-slate-900/10"
          onMouseDown={e => e.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => {
              onEditStep?.(step);
              setMoreOpen(false);
            }}
          >
            <Pencil className="w-3.5 h-3.5 shrink-0 text-slate-500" />
            编辑
          </button>
          <button
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => {
              onDeleteStep?.(step.id);
              setMoreOpen(false);
            }}
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            删除
          </button>
        </div>
      )}
    </div>
  );

  if (isEndStep) {
    return (
      <div className="node-card flex-shrink-0 w-full max-w-[300px]">
        <div className={shellClass}>
          <div className="px-4 py-3.5 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 shrink-0 ring-1 ring-sky-300/80">
              <Layers className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sky-200/90 text-sky-900 text-xs font-medium shrink-0">
              步骤 {step.index}
            </span>
            <StepNodeStatusBadge status={step.status} />
            <div className="flex-1 min-w-[8px]" />
            <span className="text-[15px] text-slate-900 leading-snug shrink-0" style={{ fontWeight: 600 }}>
              结束
            </span>
            {running && <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin shrink-0" />}
            {moreButton}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="node-card flex-shrink-0 w-full max-w-[300px]">
      <div className={shellClass}>
        <div className="px-4 pt-4 pb-2 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 shrink-0 ring-1 ring-sky-300/80">
            <Layers className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <span className="px-2.5 py-1 rounded-full bg-sky-200/90 text-sky-900 text-xs font-medium">
            步骤 {step.index}
          </span>
          <StepNodeStatusBadge status={step.status} />
          <div className="flex-1 min-w-[8px]" />
          {running && <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin shrink-0" />}
          {moreButton}
        </div>
        <div className="px-4 pb-3">
          <h3 className="text-[15px] text-slate-900 leading-snug" style={{ fontWeight: 600 }}>
            {step.title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mt-2.5">{step.description}</p>
        </div>
      </div>
    </div>
  );
}

function SubAgentKindIcon({ kind }: { kind?: 'chart' | 'shield' | 'file' }) {
  const cls = 'w-4 h-4 text-sky-600';
  if (kind === 'chart') return <BarChart3 className={cls} strokeWidth={1.75} />;
  if (kind === 'shield') return <ShieldCheck className={cls} strokeWidth={1.75} />;
  if (kind === 'file') return <FileText className={cls} strokeWidth={1.75} />;
  return <Bot className={cls} strokeWidth={1.75} />;
}

function AgentGroupCard({
  step,
  focused,
  onOpenExecutionPanel,
  onRunAgent,
  onEditStep,
  onDeleteStep,
}: {
  step: WorkflowStep;
  focused?: boolean;
  onOpenExecutionPanel?: () => void;
  /** 试运行：触发执行并写入右侧「执行状态」（与顶部「运行」同源） */
  onRunAgent?: () => void;
  onEditStep?: (step: WorkflowStep) => void;
  onDeleteStep?: (id: string) => void;
}) {
  const subList = step.subAgents ?? [];
  const isMultiGroup = subList.length > 1;
  const first = subList[0];
  const agentName = first?.name ?? `${step.title}智能体`;
  const agentRole = first?.role ?? step.description;
  const tools = step.tools ?? [];

  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMultiGroup || !moreOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (moreWrapRef.current && !moreWrapRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [isMultiGroup, moreOpen]);

  if (isMultiGroup) {
    const groupName = step.group?.name ?? '智能体组';
    const groupDesc = step.group?.description ?? step.description;

    return (
      <div
        className={`node-card w-full max-w-[320px] rounded-2xl border bg-white shadow-md shadow-slate-900/12 overflow-hidden flex flex-col transition-shadow ${
          focused ? 'ring-2 ring-[#6366F1]/40 border-[#6366F1]/45' : 'border-slate-400/85'
        }`}
      >
        <div className="px-3.5 pt-3.5 pb-3 border-b border-slate-200/90 bg-gradient-to-b from-slate-100/95 to-white">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0 ring-1 ring-sky-300/70">
              <Layers className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </div>
            <div
              className={`flex-1 min-w-0 pt-0.5 ${onOpenExecutionPanel ? 'cursor-pointer' : ''}`}
              role={onOpenExecutionPanel ? 'button' : undefined}
              tabIndex={onOpenExecutionPanel ? 0 : undefined}
              onClick={e => {
                e.stopPropagation();
                onOpenExecutionPanel?.();
              }}
              onKeyDown={
                onOpenExecutionPanel
                  ? e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpenExecutionPanel();
                      }
                    }
                  : undefined
              }
            >
              <h3 className="text-[14px] font-semibold text-slate-900 leading-snug break-words">{groupName}</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5 line-clamp-3">{groupDesc}</p>
            </div>
            <div className="flex items-center gap-0.5 shrink-0 -mr-1 -mt-0.5">
              <button
                type="button"
                title="试运行"
                onMouseDown={e => e.stopPropagation()}
                onClick={e => {
                  e.stopPropagation();
                  onRunAgent?.();
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
              <div ref={moreWrapRef} className="relative">
                <button
                  type="button"
                  title="更多"
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => {
                    e.stopPropagation();
                    setMoreOpen(o => !o);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
                {moreOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1 z-[100] min-w-[128px] rounded-lg border border-slate-200/90 bg-white py-1 shadow-lg shadow-slate-900/10"
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-slate-700 hover:bg-slate-100 transition-colors"
                      onClick={() => {
                        onEditStep?.(step);
                        setMoreOpen(false);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                      编辑
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => {
                        onDeleteStep?.(step.id);
                        setMoreOpen(false);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      删除
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {!collapsed && (
          <div className="px-3.5 pt-3 pb-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 mb-2.5">
              <Layers className="w-3.5 h-3.5 text-sky-600" strokeWidth={2} />
              子智能体（按顺序执行）
            </div>
            <div>
              {subList.map((sa, i) => (
                <React.Fragment key={`${step.id}-sub-${i}`}>
                  <div
                    className="rounded-lg border border-slate-200/90 bg-slate-50/95 px-2.5 py-2.5 flex gap-2.5 shadow-sm"
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/85 flex items-center justify-center shrink-0 shadow-sm">
                      <SubAgentKindIcon kind={sa.icon} />
                    </div>
                    <div className="min-w-0 flex-1">
                      {sa.phase && (
                        <div className="text-[10px] font-semibold text-sky-700 tracking-wide mb-0.5">{sa.phase}</div>
                      )}
                      <div className="text-[12px] font-semibold text-slate-900 leading-snug">{sa.name}</div>
                      <p className="text-[10px] text-slate-600 leading-relaxed mt-0.5">{sa.role}</p>
                    </div>
                  </div>
                  {i < subList.length - 1 && (
                    <div className="flex flex-col items-center py-0.5 gap-0.5">
                      <span className="text-[9px] text-slate-400">下一步</span>
                      <ChevronDown className="w-4 h-4 text-sky-500 stroke-[2.5]" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-slate-200/85 text-[11px] font-medium text-sky-600 hover:bg-slate-50/90 transition-colors"
          onMouseDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            setCollapsed(c => !c);
          }}
        >
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          {collapsed ? '展开子智能体' : '收起子智能体'}
        </button>

        <div className="px-3.5 py-2.5 border-t border-slate-200/80 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-slate-600">
          {step.model && (
            <span className="inline-flex items-center gap-1 min-w-0">
              <Cpu className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{step.model}</span>
            </span>
          )}
          {tools.length > 0 && (
            <span className="inline-flex items-center gap-1 min-w-0">
              <Wrench className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="break-words">{tools.join('、')}</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      role={onOpenExecutionPanel ? 'button' : undefined}
      tabIndex={onOpenExecutionPanel ? 0 : undefined}
      onClick={onOpenExecutionPanel}
      onKeyDown={
        onOpenExecutionPanel
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenExecutionPanel();
              }
            }
          : undefined
      }
      className={`node-card w-full max-w-[300px] rounded-2xl border bg-white shadow-md shadow-slate-900/12 overflow-hidden flex flex-col transition-shadow ${
        onOpenExecutionPanel ? 'cursor-pointer hover:shadow-lg hover:border-slate-400' : ''
      } ${focused ? 'ring-2 ring-[#6366F1]/40 border-[#6366F1]/45' : 'border-slate-400/85'}`}
    >
      <div className="px-3.5 pt-3.5 pb-3 border-b border-slate-200/90 bg-gradient-to-b from-slate-100/95 to-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0 ring-1 ring-sky-300/70">
            <Bot className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <span className="inline-flex px-2 py-0.5 rounded-md bg-sky-200/90 text-sky-900 text-[10px] font-semibold tracking-wide">
              智能体
            </span>
            <h3 className="text-[13px] font-semibold text-slate-900 leading-snug mt-1.5 break-words">{agentName}</h3>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 -mr-1 -mt-0.5">
            <button
              type="button"
              title="试运行"
              onMouseDown={e => e.stopPropagation()}
              onClick={e => {
                e.stopPropagation();
                onRunAgent?.();
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              type="button"
              title="更多"
              onMouseDown={e => e.stopPropagation()}
              onClick={e => e.stopPropagation()}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed mt-2.5 pl-[52px] pr-0.5 line-clamp-3">{agentRole}</p>
      </div>

      <div className="px-3.5 py-2.5 border-b border-slate-200/80 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-slate-600">
        {step.model && (
          <span className="inline-flex items-center gap-1 min-w-0">
            <Cpu className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{step.model}</span>
          </span>
        )}
        {tools.length > 0 && (
          <span className="inline-flex items-center gap-1 min-w-0">
            <Wrench className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="break-words">{tools.join('、')}</span>
          </span>
        )}
      </div>
    </div>
  );
}
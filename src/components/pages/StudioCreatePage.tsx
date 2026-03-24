import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Loader2, GitBranch, Bot, Search, X } from 'lucide-react';

function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  if (lower.includes(q)) return true;
  let qi = 0;
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

const EVAL_EXAMPLE_PROMPT = '请输入，请评估信用智能体，并给到评估报告。';

export function StudioCreatePage() {
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyInputValue, setHistoryInputValue] = useState('');
  const [showHistorySearch, setShowHistorySearch] = useState(false);

  const examples = [
    {
      id: 0,
      name: '智能体评估',
      description: '查询资产与运行日志，四维打分后输出综合评分与正式评估报告（共 10 节点）',
      agents: ['资产目录', '运行日志', '多维评估', '报告生成'],
      nodes: 10,
      prompt: EVAL_EXAMPLE_PROMPT,
      tags: ['评估智能体', '质量'],
    },
    {
      id: 1,
      name: '铁矿石供需平衡分析',
      description: '综合全球矿山供应与钢铁需求数据，输出供需平衡研判',
      agents: ['供应分析智能体', '需求分析智能体', '供需平衡智能体'],
      nodes: 10,
      prompt: '创建铁矿石供需平衡分析流程：分析全球矿山产能与发运量，评估钢铁行业需求变化，构建供需平衡表并输出策略建议',
      tags: ['供需分析', '铁矿石'],
    },
    {
      id: 2,
      name: '进口大豆全链路风险监控',
      description: '从港口气象到装港风险再到信用评估，构建全链路风险预警',
      agents: ['港口气象智能体', '进口大豆装港风险预警智能体', '信用智能体', '信息报告智能体'],
      nodes: 12,
      prompt: '创建进口大豆风险监控工作流：监测港口气象与船舶动态，预警装港延误风险，评估贸易对手信用，生成风险预警报告',
      tags: ['风险管控', '港口'],
    },
  ];

  const workflowHistory = [
    { id: 'wf-eval-001', name: '智能体评估', description: '资产与运行日志、四维评估、综合分与评估报告', agents: ['资产目录', '运行日志', '多维评估', '报告生成'], nodes: 10, createdAt: '2026-03-20', tags: ['评估智能体', '质量'] },
    { id: 'wf-001', name: '大豆价格周度研判', description: '每周自动生成大豆价格趋势研判报告，含期货、现货、基差分析', agents: ['粮食价格预测智能体', '国际干散货海运运价研报智能体', '信息报告智能体'], nodes: 8, createdAt: '2026-03-18', tags: ['价格分析', '大豆'] },
    { id: 'wf-002', name: '铁矿石月度供需报告', description: '月度更新全球铁矿石供需平衡表与价格展望', agents: ['供应分析智能体', '价格预测智能体', '供需平衡智能体'], nodes: 10, createdAt: '2026-03-15', tags: ['铁矿石', '供需分析'] },
    { id: 'wf-003', name: '玉米物流预警日报', description: '监控内贸玉米物流关键节点，每日输出滞期与通航预警', agents: ['内贸玉米三峡修闸预警智能体', '内贸玉米装卸港滞期预警智能体', '公路段货找车智能体'], nodes: 7, createdAt: '2026-03-12', tags: ['物流', '风险预警'] },
    { id: 'wf-004', name: '多式联运调度优化', description: '公路段货找车与车找货联动，结合海运运价与气象优化调度', agents: ['公路段货找车智能体', '公路段车找货智能体', '国际干散货海运运价研报智能体'], nodes: 9, createdAt: '2026-03-10', tags: ['多式联运', '调度'] },
    { id: 'wf-005', name: '粮食产量季度预测', description: '融合气象与遥感数据预测主要粮食作物季度产量', agents: ['粮食气象智能体', '粮食产量预测智能体', '库存智能分析智能体', '信息报告智能体'], nodes: 11, createdAt: '2026-03-08', tags: ['产量预测', '农业'] },
    { id: 'wf-006', name: '政策舆情影响分析', description: '监测供应链政策变动并分析对各品种的影响程度', agents: ['信息监测智能体', '信息分析智能体', '信息报告智能体'], nodes: 6, createdAt: '2026-03-05', tags: ['政策', '舆情分析'] },
  ];

  const handleCreate = async () => {
    if (!input.trim()) return;
    setIsCreating(true);
    setTimeout(() => {
      navigate('/studio/canvas/new', { state: { initialQuery: input } });
    }, 2000);
  };

  const fillInputFromPrompt = (prompt: string) => {
    setInput(prompt);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const filteredHistory = workflowHistory.filter((wf) =>
    fuzzyMatch(wf.name, historySearch) || fuzzyMatch(wf.description, historySearch)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      {/* Top Bar */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-[#e2e8f0] sticky top-0 z-50">
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/galaxy')} className="w-8 h-8 rounded-lg bg-[#edf1f8]/80 hover:bg-[#d8e0ec] flex items-center justify-center transition-colors" title="返回首页">
              <ArrowLeft className="w-4 h-4 text-[#4a5b73]" />
            </button>
            <h2 className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>任务工作流 Studio</h2>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[22px] text-[#0d1b2a] mb-2" style={{ fontWeight: 500 }}>创建你的工作流</h1>
          <p className="text-sm text-[#7d8da1]">用自然语言描述你的任务，AI自动编排智能体协同完成。</p>
        </div>

        {/* Main Input */}
        <div className="mb-12">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="例如：创建智能体评估工作流，对目标智能体做技术/效果/使用/业务四维评估并生成报告…"
              className="w-full h-40 px-6 py-4 pr-40 border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d1b2a]/20 focus:border-[#0d1b2a]/30 resize-none bg-white/70 backdrop-blur-xl text-sm text-[#0d1b2a] placeholder-[#a3b1c6] leading-relaxed"
            />
            <button
              onClick={handleCreate}
              disabled={!input.trim() || isCreating}
              className="absolute right-4 bottom-4 px-6 py-2.5 bg-[#0d1b2a] text-white rounded-md hover:bg-[#1b2d45] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
            >
              {isCreating ? (<><Loader2 className="w-4 h-4 animate-spin" />正在创建...</>) : (<>创建工作流<ArrowRight className="w-4 h-4" /></>)}
            </button>
          </div>
        </div>

        {/* Example Workflows */}
        <div className="mb-12">
          <div className="mb-4">
            <h3 className="text-[15px] text-[#0d1b2a]" style={{ fontWeight: 400 }}>示例工作流</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {examples.map((example) => (
              <WorkflowCard
                key={example.name}
                name={example.name}
                description={example.description}
                agents={example.agents}
                nodes={example.nodes}
                tags={example.tags}
                featured={example.id === 0}
                onClick={() => fillInputFromPrompt(example.prompt)}
              />
            ))}
          </div>
        </div>

        {/* Workflow History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] text-[#0d1b2a]" style={{ fontWeight: 400 }}>历史工作流</h3>
            <div className="flex items-center gap-2">
              {showHistorySearch && (
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={historyInputValue}
                      onChange={(e) => setHistoryInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && historyInputValue.trim()) {
                          setHistorySearch(historyInputValue);
                        }
                        if (e.key === 'Escape') {
                          setShowHistorySearch(false);
                          setHistoryInputValue('');
                          setHistorySearch('');
                        }
                      }}
                      placeholder="搜索历史工作流..."
                      className="pl-3 pr-7 py-1.5 w-48 text-xs border border-[#e2e8f0] rounded-lg bg-white/70 backdrop-blur-xl text-[#0d1b2a] placeholder-[#a3b1c6] focus:outline-none focus:ring-1 focus:ring-[#0d1b2a]/20 focus:border-[#0d1b2a]/30 transition-all"
                    />
                    {historyInputValue && (
                      <button onClick={() => { setHistoryInputValue(''); setHistorySearch(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a3b1c6] hover:text-[#4a5b73]">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => historyInputValue.trim() && setHistorySearch(historyInputValue)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-all border ${
                      historyInputValue.trim()
                        ? 'bg-[#0d1b2a] text-white border-[#0d1b2a] cursor-pointer'
                        : 'bg-[#edf1f8] text-[#a3b1c6] border-[#e2e8f0] cursor-not-allowed'
                    }`}
                    disabled={!historyInputValue.trim()}
                  >
                    搜索
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  if (showHistorySearch) {
                    setShowHistorySearch(false);
                    setHistoryInputValue('');
                    setHistorySearch('');
                  } else {
                    setShowHistorySearch(true);
                  }
                }}
                className={`p-1.5 rounded-lg transition-colors ${showHistorySearch ? 'bg-[#0d1b2a] text-white' : 'hover:bg-[#edf1f8] text-[#7d8da1]'}`}
                title="搜索历史工作流"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] py-16 flex flex-col items-center justify-center">
              <Search className="w-8 h-8 text-[#a3b1c6] mb-3" />
              <p className="text-sm text-[#7d8da1]">未找到匹配的工作流</p>
              <p className="text-xs text-[#a3b1c6] mt-1">尝试使用其他关键词搜索</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredHistory.map((wf) => (
                <WorkflowCard
                  key={wf.id}
                  name={wf.name}
                  description={wf.description}
                  agents={wf.agents}
                  nodes={wf.nodes}
                  tags={wf.tags}
                  createdAt={wf.createdAt}
                  onClick={() =>
                    wf.id === 'wf-eval-001'
                      ? fillInputFromPrompt(EVAL_EXAMPLE_PROMPT)
                      : navigate(`/studio/canvas/${wf.id}`)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== WorkflowCard Component ====================
function WorkflowCard({
  name, description, agents, nodes, tags, createdAt, featured, onClick,
}: {
  name: string;
  description: string;
  agents: string[];
  nodes: number;
  tags: string[];
  createdAt?: string;
  featured?: boolean;
  onClick: () => void;
}) {
  const visibleTags = tags.slice(0, 2);
  const hiddenCount = tags.length - 2;

  return (
    <button
      onClick={onClick}
      className={`group bg-white/70 backdrop-blur-xl rounded-xl p-4 border hover:shadow-lg hover:shadow-[#0d1b2a]/[0.04] transition-all duration-200 text-left flex flex-col ${
        featured ? 'border-[#6366F1]/40 ring-1 ring-[#6366F1]/15' : 'border-[#e2e8f0] hover:border-[#cbd5e1]'
      }`}
    >
      {/* Title */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-sm text-[#0d1b2a] group-hover:text-[#1b2d45] transition-colors" style={{ fontWeight: 500 }}>
          {name}
        </h4>
      </div>

      {/* Description */}
      <p className="text-xs text-[#7d8da1] line-clamp-2 mb-3 leading-relaxed flex-1">{description}</p>

      {/* Tags — max 2, then +N */}
      <div className="flex items-center gap-1.5 mb-3">
        {visibleTags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 bg-[#edf1f8] text-[#5a6b7f] text-[11px] rounded-md">
            {tag}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span className="px-2 py-0.5 bg-[#f4f6fa] text-[#a3b1c6] text-[11px] rounded-md">
            +{hiddenCount}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-[#a3b1c6]" />
            <span className="text-[11px] text-[#a3b1c6]">{nodes} 节点</span>
          </div>
          <div className="flex items-center gap-1">
            <Bot className="w-3 h-3 text-[#a3b1c6]" />
            <span className="text-[11px] text-[#a3b1c6]">{agents.length} 智能体</span>
          </div>
        </div>
        {createdAt ? <span className="text-[11px] text-[#c5cfe0] shrink-0">{createdAt}</span> : null}
      </div>
    </button>
  );
}
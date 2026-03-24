import { FactorySidebar } from '../../FactorySidebar';
import { useState, useRef, useEffect } from 'react';
import { Search, Edit3, Trash2, X, TrendingUp, Package, Clock, Plus, Sparkles, Bot, Cpu, Wrench, Users, FileText, BarChart3, Brain, Globe, Database, Shield, ChevronDown, Activity, ArrowUp } from 'lucide-react';
import { mockAgents, mockScenes } from '../../../data/mockData';
import { useNavigate } from 'react-router';

type MainTab = 'published' | 'drafts';
type SortFilter = 'all' | 'recent' | 'popular';

/** 通用服务类智能体（含评估类）排在列表最后 */
function isGeneralServiceAgent(agent: { tags?: string[] }) {
  return agent.tags?.includes('通用服务') ?? false;
}

const agentIconMap: Record<string, any> = {
  '基础信息': Database, '运行日志': Activity, '技术架构': Cpu, '效果能力': BarChart3,
  '使用情况': Users, '业务指标': BarChart3, '综合评分': Sparkles, '问题归因': Brain, '评估报告': FileText,
  '信用': Shield, '舆情': Activity, '价格': TrendingUp, '产量': BarChart3,
  '研报': FileText, '库存': Database, '装港': Globe, '滞期': Clock,
  '三峡': Globe, '供应': Brain, '供需': Brain, '需求': Brain,
  '货速': Search, '车必': Search, '干散': Globe, '气象': Sparkles,
  '监测': Search, '分析': Brain, '报告': FileText, '匹配': Users,
};

function getAgentIcon(name: string) {
  for (const [key, Icon] of Object.entries(agentIconMap)) {
    if (name.includes(key)) return Icon;
  }
  return Bot;
}

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

/** 智能体列表搜索：圆角、焦点环、联想下拉，减少误触关闭 */
function AgentSearchField({
  value,
  onChange,
  placeholder,
  agents,
  'aria-label': ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  agents: { id: string; name: string; description?: string }[];
  'aria-label'?: string;
}) {
  const [showSuggest, setShowSuggest] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setShowSuggest(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const suggestions = value.trim()
    ? agents
        .filter(
          (a) => fuzzyMatch(a.name, value) || (!!a.description && fuzzyMatch(a.description, value))
        )
        .slice(0, 6)
    : [];

  const inputClass =
    'w-full h-10 pl-9 pr-10 text-sm bg-white/85 backdrop-blur-xl border border-[#e2e8f0] rounded-xl shadow-sm ' +
    'placeholder:text-[#a3b1c6] text-[#0d1b2a] transition-[box-shadow,border-color] ' +
    'focus:outline-none focus:border-[#0d1b2a]/40 focus:ring-2 focus:ring-[#0d1b2a]/[0.09]';

  return (
    <div ref={wrapRef} className="flex-1 relative min-w-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3b1c6] pointer-events-none z-[1]" />
      <input
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        role="searchbox"
        aria-label={ariaLabel ?? '搜索'}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggest(e.target.value.trim().length > 0);
        }}
        onFocus={() => {
          if (value.trim()) setShowSuggest(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onChange('');
            setShowSuggest(false);
          }
        }}
        placeholder={placeholder}
        className={inputClass}
      />
      {value ? (
        <button
          type="button"
          aria-label="清空搜索"
          onClick={() => {
            onChange('');
            setShowSuggest(false);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[#edf1f8] transition-colors"
        >
          <X className="w-3.5 h-3.5 text-[#a3b1c6] hover:text-[#4a5b73]" />
        </button>
      ) : null}

      {showSuggest && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-[#e2e8f0] shadow-lg shadow-[#0d1b2a]/[0.07] z-30 overflow-hidden">
          {suggestions.map((a) => (
            <button
              key={a.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(a.name);
                setShowSuggest(false);
              }}
              className="w-full text-left px-3 py-2.5 hover:bg-[#f4f6fa] transition-colors flex items-start gap-2 border-b border-[#edf1f8] last:border-b-0"
            >
              <Search className="w-3.5 h-3.5 text-[#a3b1c6] flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm text-[#0d1b2a] truncate">{a.name}</p>
                {a.description ? (
                  <p className="text-[11px] text-[#a3b1c6] line-clamp-1">{a.description}</p>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function WarehousePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MainTab>('published');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortFilter, setSortFilter] = useState<SortFilter>('all');
  const [statsFilter, setStatsFilter] = useState<string | null>(null);
  const [selectedScenes, setSelectedScenes] = useState<string[]>(['全部']);

  const [draftSearchQuery, setDraftSearchQuery] = useState('');
  const [draftTimeFilter, setDraftTimeFilter] = useState('all');

  const publishedAgents = mockAgents
    .filter((a) => a.publishStatus === 'published')
    .sort((a, b) => {
      const ag = isGeneralServiceAgent(a) ? 1 : 0;
      const bg = isGeneralServiceAgent(b) ? 1 : 0;
      return ag - bg;
    });
  const draftAgents = mockAgents.filter((a) => a.publishStatus === 'draft');

  const newlyPublished = (() => {
    try { return JSON.parse(localStorage.getItem('newlyPublishedAgents') || '[]'); }
    catch { return []; }
  })();
  const allPublishedAgents = [...publishedAgents, ...newlyPublished.filter((a: any) => a.publishStatus === 'published')];

  const tabs: { id: MainTab; label: string; count: number }[] = [
    { id: 'published', label: '已发布', count: allPublishedAgents.length },
    { id: 'drafts', label: '草稿箱', count: draftAgents.length },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      <FactorySidebar />
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Non-scrolling top section ── */}
        <div className="flex-shrink-0 px-8 pt-6">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="text-[22px] text-[#0d1b2a] mb-1" style={{ fontWeight: 500 }}>我的智能体</h1>
              <p className="text-xs text-[#7d8da1]" style={{ fontWeight: 400 }}>智能体资产管理、升级与草稿编辑</p>
            </div>
            <button onClick={() => navigate('/factory/workshop/editor/new')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0d1b2a] text-white rounded-lg text-xs hover:bg-[#1b2d45] transition-colors">
              <Plus className="w-4 h-4" />新建智能体
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-[#e2e8f0]">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(''); setStatsFilter(null); setDraftSearchQuery(''); setDraftTimeFilter('all'); }}
                className={`pb-3 px-1 text-sm transition-all relative flex items-center gap-2 ${activeTab === tab.id ? 'text-[#0d1b2a]' : 'text-[#7d8da1] hover:text-[#4a5b73]'}`}
                style={{ fontWeight: activeTab === tab.id ? 500 : 400 }}>
                {tab.label}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${activeTab === tab.id ? 'bg-[#0d1b2a] text-white' : 'bg-[#edf1f8] text-[#7d8da1]'}`}>{tab.count}</span>
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0d1b2a]" />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content: search bar pinned, body scrolls ── */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'published' && (
            <PublishedContent
              agents={allPublishedAgents}
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              newlyPublished={newlyPublished}
              sortFilter={sortFilter} setSortFilter={setSortFilter}
              navigate={navigate}
              statsFilter={statsFilter}
              selectedScenes={selectedScenes} setSelectedScenes={setSelectedScenes}
            />
          )}
          {activeTab === 'drafts' && (
            <DraftsContent
              agents={draftAgents}
              navigate={navigate}
              searchQuery={draftSearchQuery} setSearchQuery={setDraftSearchQuery}
              timeFilter={draftTimeFilter} setTimeFilter={setDraftTimeFilter}
            />
          )}
        </div>

      </div>
    </div>
  );
}

// ============================
// Shared Agent Card Component
// ============================
function AgentCard({ agent, navigate, isNewlyPublished, extra }: { agent: any; navigate: any; isNewlyPublished?: boolean; extra?: React.ReactNode }) {
  const Icon = getAgentIcon(agent.name);
  const needsUpgrade = agent.status === 'upgrade';

  return (
    <div className="group bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] overflow-hidden transition-all duration-200 relative hover:border-[#cbd5e1] hover:shadow-lg hover:shadow-[#0d1b2a]/[0.04] flex flex-col">
      {isNewlyPublished && (
        <div className="absolute top-[8px] right-3 z-10">
          <span className="px-2 py-0.5 bg-[#0d1b2a] text-white text-[10px] rounded-md" style={{ fontWeight: 500 }}>最新发布</span>
        </div>
      )}

      <div className="cursor-pointer flex-1" onClick={() => navigate(`/factory/warehouse/${agent.id}`)}>
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#0d1b2a]/[0.06] flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-[#0d1b2a]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] text-[#0d1b2a] truncate" style={{ fontWeight: 500 }}>{agent.name}</h3>
                <span className="text-xs text-[#a3b1c6] bg-[#edf1f8] px-1.5 py-0.5 rounded flex-shrink-0">{agent.version}</span>
              </div>
            </div>
            {needsUpgrade && <span className="flex items-center gap-1 px-2 py-1 bg-[#edf1f8] border border-[#e2e8f0] rounded-lg text-[11px] text-[#7d8da1] flex-shrink-0"><ArrowUp className="w-2.5 h-2.5" />待升级</span>}
          </div>

          <p className="text-sm text-[#7d8da1] leading-relaxed line-clamp-2 mb-3 min-h-[40px]" style={{ fontWeight: 400 }}>{agent.description}</p>

          <div className="flex flex-wrap gap-1.5 mb-4 min-h-[28px]">
            {agent.tags?.slice(0, 3).map((tag: string) => <span key={tag} className="px-2.5 py-1 bg-[#f4f6fa] text-[#4a5b73] text-xs rounded-md border border-[#edf1f8]">{tag}</span>)}
          </div>

          <div className="border-t border-[#edf1f8] pt-3 space-y-2.5">
            {agent.models?.length > 0 && (
              <div className="flex items-start gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#a3b1c6] flex-shrink-0 mt-0.5" />
                <span className="text-xs text-[#a3b1c6] flex-shrink-0 pt-0.5">行业模型</span>
                <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                  {agent.models.map((m: string) => (
                    <span key={m} className="px-2 py-0.5 bg-[#edf1f8] text-[#4a5b73] text-xs rounded">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {agent.tools?.length > 0 && (
              <div className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-[#a3b1c6] flex-shrink-0" />
                <span className="text-xs text-[#a3b1c6] flex-shrink-0">工具</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {agent.tools.slice(0, 3).map((t: string) => <span key={t} className="px-2 py-0.5 bg-[#edf1f8] text-[#4a5b73] text-xs rounded">{t}</span>)}
                  {agent.tools.length > 3 && <span className="text-xs text-[#a3b1c6]">+{agent.tools.length - 3}</span>}
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 min-h-[20px]">
              {agent.successRate !== undefined && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#a3b1c6]">成功率</span>
                  <span className={`text-xs tabular-nums ${agent.successRate < 95 ? 'text-[#c7000b]' : 'text-[#0d1b2a]'}`} style={{ fontWeight: 500 }}>{agent.successRate}%</span>
                </div>
              )}
              {agent.callCount !== undefined && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#a3b1c6]">调用</span>
                  <span className="text-xs text-[#0d1b2a] tabular-nums" style={{ fontWeight: 500 }}>{agent.callCount.toLocaleString()}</span>
                </div>
              )}
              {agent.subAgentCount !== undefined && agent.subAgentCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[#a3b1c6]" />
                  <span className="text-xs text-[#a3b1c6]">子智能体</span>
                  <span className="text-xs text-[#0d1b2a] tabular-nums" style={{ fontWeight: 500 }}>{agent.subAgentCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {extra && (
        <div className="px-5 pb-4 pt-3 flex items-center justify-end gap-2 border-t border-[#edf1f8] mt-auto">
          {extra}
        </div>
      )}
    </div>
  );
}

// ============================
// Published Tab
// ============================
function PublishedContent({ agents, searchQuery, setSearchQuery, newlyPublished, sortFilter, setSortFilter, navigate, statsFilter, selectedScenes, setSelectedScenes }: any) {
  const toggleScene = (scene: string) => {
    if (scene === '全部') {
      setSelectedScenes(['全部']);
    } else {
      const newScenes = selectedScenes.includes(scene)
        ? selectedScenes.filter((s: string) => s !== scene && s !== '全部')
        : [...selectedScenes.filter((s: string) => s !== '全部'), scene];
      setSelectedScenes(newScenes.length === 0 ? ['全部'] : newScenes);
    }
  };

  let filteredAgents = agents.filter((agent: any) => {
    const matchesSearch = !searchQuery || fuzzyMatch(agent.name, searchQuery) || agent.tags?.some((t: string) => fuzzyMatch(t, searchQuery)) || fuzzyMatch(agent.description || '', searchQuery);
    const matchesScene = selectedScenes.includes('全部') || agent.tags?.some((t: string) => selectedScenes.includes(t));
    return matchesSearch && matchesScene;
  });

  if (sortFilter === 'recent') {
    filteredAgents = [...filteredAgents].sort((a: any, b: any) => {
      const aIsNew = newlyPublished.some((np: any) => np.id === a.id);
      const bIsNew = newlyPublished.some((np: any) => np.id === b.id);
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;
      return (b.publishDate || '').localeCompare(a.publishDate || '');
    });
  } else if (sortFilter === 'popular') {
    filteredAgents = [...filteredAgents].sort((a: any, b: any) => (b.callCount || 0) - (a.callCount || 0));
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Search bar — pinned, never scrolls ── */}
      <div className="flex-shrink-0 px-8 pt-4 pb-3 bg-gradient-to-b from-[#eef0f6] to-[#eef0f6]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <AgentSearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="搜索名称、标签、描述…"
            agents={agents}
            aria-label="搜索已发布智能体"
          />
          <div className="relative flex-shrink-0">
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value as SortFilter)}
              className="appearance-none h-10 pl-3 pr-8 text-xs bg-white/85 backdrop-blur-xl border border-[#e2e8f0] rounded-xl shadow-sm focus:outline-none focus:border-[#0d1b2a]/40 focus:ring-2 focus:ring-[#0d1b2a]/[0.09] transition-[box-shadow,border-color] text-[#4a5b73] cursor-pointer"
            >
              <option value="all">全部</option>
              <option value="recent">最近发布</option>
              <option value="popular">最多调用</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a3b1c6] pointer-events-none" />
          </div>
          <span className="text-xs text-[#a3b1c6] flex-shrink-0">{filteredAgents.length} 个结果</span>
        </div>
      </div>

      {/* ── Body: fixed sidebar + scrollable grid ── */}
      <div className="flex gap-5 px-8 pb-8 flex-1 min-h-0">
        {/* Left: Scene Filter Sidebar — fixed, does not scroll */}
        <aside className="w-36 flex-shrink-0 pt-1">
          <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4 border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs text-[#0d1b2a]">应用场景</h3>
              <button onClick={() => setSelectedScenes(['全部'])} className="text-[11px] text-[#7d8da1] hover:text-[#4a5b73]">重置</button>
            </div>
            <div className="space-y-0">
              {mockScenes.map((scene: string) => (
                <button key={scene} onClick={() => toggleScene(scene)} className="flex items-center gap-2 py-1.5 w-full text-left group">
                  <div className={`w-3.5 h-3.5 rounded border-[1.5px] flex items-center justify-center transition-colors flex-shrink-0 ${
                    selectedScenes.includes(scene) ? 'bg-[#0d1b2a] border-[#0d1b2a]' : 'border-[#cbd5e1] group-hover:border-[#7d8da1]'
                  }`}>
                    {selectedScenes.includes(scene) && (
                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm transition-colors ${
                    selectedScenes.includes(scene) ? 'text-[#0d1b2a]' : 'text-[#7d8da1] group-hover:text-[#4a5b73]'
                  }`}>
                    {scene}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right: Agent Grid — single vertical scroll, subtle scrollbar */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain scrollbar-subtle">
          {filteredAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-14 h-14 rounded-full bg-[#edf1f8] flex items-center justify-center mb-4"><Package className="w-6 h-6 text-[#a3b1c6]" /></div>
              <p className="text-sm text-[#7d8da1] mb-1">暂无匹配的智能体</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 min-w-0">
              {filteredAgents.map((agent: any) => {
                const isNewlyPublished = newlyPublished.some((np: any) => np.id === agent.id);
                return <AgentCard key={agent.id} agent={agent} navigate={navigate} isNewlyPublished={isNewlyPublished} />;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================
// Drafts Tab
// ============================
function DraftsContent({ agents, navigate, searchQuery, setSearchQuery, timeFilter, setTimeFilter }: any) {
  const completionMap: Record<string, number> = { 'draft-1': 85, 'draft-2': 42, 'draft-3': 68 };
  const lastEditedMap: Record<string, string> = { 'draft-1': '10 分钟前', 'draft-2': '2 小时前', 'draft-3': '昨天 16:30' };

  const filteredDrafts = agents.filter((a: any) =>
    !searchQuery || fuzzyMatch(a.name, searchQuery) || fuzzyMatch(a.description || '', searchQuery)
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search + time filter bar */}
      <div className="flex-shrink-0 px-8 pt-4 pb-3 bg-gradient-to-b from-[#eef0f6] to-[#eef0f6]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] max-w-xl">
            <AgentSearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="搜索草稿名称、描述…"
              agents={agents}
              aria-label="搜索草稿"
            />
          </div>
          <div className="relative flex-shrink-0">
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none h-10 pl-3 pr-8 text-xs bg-white/85 backdrop-blur-xl border border-[#e2e8f0] rounded-xl shadow-sm focus:outline-none focus:border-[#0d1b2a]/40 focus:ring-2 focus:ring-[#0d1b2a]/[0.09] transition-[box-shadow,border-color] text-[#4a5b73] cursor-pointer">
              <option value="all">全部时间</option>
              <option value="today">今天</option>
              <option value="week">最近7天</option>
              <option value="month">最近30天</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a3b1c6] pointer-events-none" />
          </div>
          <span className="text-xs text-[#a3b1c6] flex-shrink-0">{filteredDrafts.length} 个结果</span>
        </div>
      </div>

      <div className="px-8 pb-8 flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain scrollbar-subtle">
        {filteredDrafts.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-full bg-[#edf1f8] flex items-center justify-center mb-4"><Sparkles className="w-6 h-6 text-[#a3b1c6]" /></div>
            <p className="text-sm text-[#7d8da1] mb-1">暂无草稿</p>
            <p className="text-xs text-[#a3b1c6] mb-4">开始创建你的第一个智能体</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 min-w-0">
            {filteredDrafts.map((agent: any) => {
              const Icon = getAgentIcon(agent.name);
              const completion = completionMap[agent.id] || 0;
              const lastEdited = lastEditedMap[agent.id] || '未知';
              return (
                <div key={agent.id} className="group bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] overflow-hidden transition-all duration-200 relative hover:border-[#cbd5e1] hover:shadow-lg hover:shadow-[#0d1b2a]/[0.04]">
                  <div className="cursor-pointer" onClick={() => navigate(`/factory/warehouse/${agent.id}`)}>
                    <div className="px-5 pt-4 pb-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0d1b2a]/[0.06] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-[#0d1b2a]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[15px] text-[#0d1b2a] truncate" style={{ fontWeight: 500 }}>{agent.name}</h3>
                            <span className="text-xs text-[#a3b1c6] bg-[#edf1f8] px-1.5 py-0.5 rounded flex-shrink-0">{agent.version}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-[#7d8da1] leading-relaxed line-clamp-2 mb-3 min-h-[40px]" style={{ fontWeight: 400 }}>{agent.description}</p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {agent.tags?.slice(0, 3).map((tag: string) => <span key={tag} className="px-2.5 py-1 bg-[#f4f6fa] text-[#4a5b73] text-xs rounded-md border border-[#edf1f8]">{tag}</span>)}
                      </div>

                      <div className="border-t border-[#edf1f8] pt-3 space-y-2.5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#a3b1c6] flex-shrink-0">完成度</span>
                          <div className="flex-1 h-1.5 bg-[#edf1f8] rounded-full overflow-hidden max-w-[120px]">
                            <div className="h-full bg-[#0d1b2a] rounded-full transition-all" style={{ width: `${completion}%` }} />
                          </div>
                          <span className="text-xs text-[#0d1b2a] tabular-nums" style={{ fontWeight: 500 }}>{completion}%</span>
                        </div>
                        {agent.models?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Cpu className="w-3.5 h-3.5 text-[#a3b1c6] flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-[#a3b1c6] flex-shrink-0 pt-0.5">行业模型</span>
                            <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                              {agent.models.map((m: string) => (
                                <span key={m} className="px-2 py-0.5 bg-[#edf1f8] text-[#4a5b73] text-xs rounded">
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-[#7d8da1]">
                          <Clock className="w-3 h-3 text-[#a3b1c6]" />
                          最近编辑: {lastEdited}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Buttons — right-aligned, matching published card style */}
                  <div className="px-5 pb-4 pt-3 flex items-center justify-end gap-2 border-t border-[#edf1f8]">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/factory/workshop/editor/${agent.id}`); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#4a5b73] hover:bg-[#edf1f8] rounded-lg transition-colors border border-[#e2e8f0]">
                      <Edit3 className="w-3 h-3" />编辑
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#7d8da1] hover:bg-[#edf1f8] rounded-lg transition-colors border border-[#e2e8f0]">
                      <Trash2 className="w-3 h-3" />删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
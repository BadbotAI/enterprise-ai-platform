import { useState, useRef, useEffect } from 'react';
import { FactorySidebar } from '../../FactorySidebar';
import { 
  Box, Wrench, Search, Plus, Edit3, Trash2, 
  Sparkles, X, AlertCircle
} from 'lucide-react';
import { ModelConfigModal, ToolEditModal } from '../DeveloperManagementModalComponents';
import { mockAgents } from '../../../data/mockData';

type TabType = 'models' | 'tools';

type ModelResource = {
  id: string;
  name: string;
  apiKey: string;
  provider: string;
  usedBy: number;
  status: 'active' | 'unavailable';
};

/** 平台预置模型（与「我的智能体」仓库中的引用合并展示） */
const BASE_PLATFORM_MODELS: ModelResource[] = [
  { id: 'model-1', name: 'GLM-4', apiKey: 'sk-glm-*********************', provider: '智谱AI', usedBy: 12, status: 'active' },
  { id: 'model-2', name: 'Qwen-72B', apiKey: 'sk-qw-*********************', provider: '通义千问', usedBy: 7, status: 'active' },
  { id: 'model-3', name: '气象大模型V3', apiKey: 'sk-wx-*********************', provider: '气象院', usedBy: 4, status: 'active' },
  { id: 'model-4', name: 'DeepSeek-V3', apiKey: '', provider: 'DeepSeek', usedBy: 0, status: 'unavailable' },
];

/** 根据模型名称推断提供商（与 mockAgents 中业务模型名对应） */
function inferProviderForAgentModel(modelName: string): string {
  if (modelName.includes('气象')) return '气象院';
  if (modelName.includes('舆情')) return '舆情分析';
  if (modelName.includes('智链')) return '智链';
  if (modelName.includes('海运') || modelName.includes('干散货')) return '航运研究';
  if (modelName.includes('公路') || modelName.includes('匹配')) return '物流调度';
  if (modelName.includes('大豆') || modelName.includes('CBOT') || modelName.includes('玉米')) return '农产品';
  if (modelName.includes('铁矿石')) return '大宗交易';
  if (modelName.includes('巴西') || modelName.includes('美国') || modelName.includes('产量')) return '产量预测';
  if (modelName.includes('库存') || modelName.includes('无人机') || modelName.includes('装港')) return '供应链';
  return '业务域模型';
}

/**
 * 统计「我的智能体」仓库中已发布智能体引用的模型次数，并与平台预置列表合并。
 * 与 WarehousePage 一致：仅 publishStatus === 'published'。
 */
function mergeMyAgentModels(): ModelResource[] {
  const usage = new Map<string, number>();
  for (const a of mockAgents) {
    if (a.publishStatus !== 'published') continue;
    for (const m of a.models || []) {
      const key = m.trim();
      if (!key) continue;
      usage.set(key, (usage.get(key) || 0) + 1);
    }
  }

  const baseNames = new Set(BASE_PLATFORM_MODELS.map((m) => m.name));
  const merged: ModelResource[] = BASE_PLATFORM_MODELS.map((m) => {
    const u = usage.get(m.name);
    if (u === undefined) return m;
    return { ...m, usedBy: Math.max(m.usedBy, u) };
  });

  let idSeq = 500;
  const extras = [...usage.entries()]
    .filter(([name]) => !baseNames.has(name))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));

  for (const [name, count] of extras) {
    merged.push({
      id: `agent-model-${idSeq++}`,
      name,
      apiKey: 'sk-*********************',
      provider: inferProviderForAgentModel(name),
      usedBy: count,
      status: 'active',
    });
  }

  return merged;
}

type ToolResource = {
  id: string;
  name: string;
  category: string;
  description: string;
  endpoint: string;
  usedBy: number;
  status: 'active' | 'unavailable';
};

/** 平台预置工具（与「我的智能体」仓库中的引用合并展示） */
const BASE_PLATFORM_TOOLS: ToolResource[] = [
  { id: 'tool-1', name: '天气查询API', category: 'MCP', description: '实时天气数据查询服务', endpoint: 'api.weather.com/v1', usedBy: 5, status: 'active' },
  { id: 'tool-2', name: '数据库连接器', category: '数据库', description: 'MySQL/PostgreSQL数据库连接', endpoint: 'db.service.com/connect', usedBy: 8, status: 'active' },
  { id: 'tool-3', name: '邮件通知插件', category: '插件', description: '企业级邮件发送和通知服务', endpoint: 'mail.service.com/api', usedBy: 12, status: 'active' },
  { id: 'tool-4', name: '知识图谱检索', category: 'MCP', description: '基于Neo4j的知识图谱查询接口', endpoint: 'kg.service.com/query', usedBy: 0, status: 'unavailable' },
];

function inferToolCategory(toolName: string): string {
  if (/数据库|数据池|存储库|计划库/.test(toolName)) return '数据库';
  if (/插件|PDF|模板|导出|渲染|邮件/.test(toolName)) return '插件';
  return 'MCP';
}

function describeAgentTool(toolName: string): string {
  return `已发布智能体工作流中引用的 ${toolName} 能力。`;
}

function slugToolEndpoint(toolName: string): string {
  const s = toolName.replace(/[\s/]+/g, '-').replace(/[^\w\u4e00-\u9fff-]/gi, '').toLowerCase();
  return `platform.tools/${s || 'tool'}`;
}

/**
 * 统计已发布智能体引用的工具次数，并与平台预置列表合并。
 */
function mergeMyAgentTools(): ToolResource[] {
  const usage = new Map<string, number>();
  for (const a of mockAgents) {
    if (a.publishStatus !== 'published') continue;
    for (const t of a.tools || []) {
      const key = t.trim();
      if (!key) continue;
      usage.set(key, (usage.get(key) || 0) + 1);
    }
  }

  const baseNames = new Set(BASE_PLATFORM_TOOLS.map((t) => t.name));
  const merged: ToolResource[] = BASE_PLATFORM_TOOLS.map((t) => {
    const u = usage.get(t.name);
    if (u === undefined) return t;
    return { ...t, usedBy: Math.max(t.usedBy, u) };
  });

  let idSeq = 500;
  const extras = [...usage.entries()]
    .filter(([name]) => !baseNames.has(name))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));

  for (const [name, count] of extras) {
    merged.push({
      id: `agent-tool-${idSeq++}`,
      name,
      category: inferToolCategory(name),
      description: describeAgentTool(name),
      endpoint: slugToolEndpoint(name),
      usedBy: count,
      status: 'active',
    });
  }

  return merged;
}

// ===== Fuzzy match helper =====
function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  // Substring match
  if (lower.includes(q)) return true;
  // Character-by-character fuzzy
  let qi = 0;
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

// Shared checkbox component
function FilterCheckbox({ checked, label, onClick }: { checked: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 py-1.5 w-full text-left group">
      <div className={`w-3.5 h-3.5 rounded border-[1.5px] flex items-center justify-center transition-colors flex-shrink-0 ${
        checked ? 'bg-[#0d1b2a] border-[#0d1b2a]' : 'border-[#b8c4d6] group-hover:border-[#7d8da1]'
      }`}>
        {checked && (
          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm transition-colors ${checked ? 'text-[#0d1b2a]' : 'text-[#7d8da1] group-hover:text-[#4a5b73]'}`}>
        {label}
      </span>
    </button>
  );
}

// Shared filter sidebar
function FilterSidebar({ title, categories, selectedCategories, onToggle, onReset }: {
  title: string;
  categories: string[];
  selectedCategories: string[];
  onToggle: (cat: string) => void;
  onReset: () => void;
}) {
  return (
    <aside className="w-36 flex-shrink-0">
      <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4 border border-[#e2e8f0] sticky top-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs text-[#0d1b2a]">{title}</h3>
          <button onClick={onReset} className="text-[11px] text-[#7d8da1] hover:text-[#4a5b73]">重置</button>
        </div>
        <div className="space-y-0">
          {categories.map((cat) => (
            <FilterCheckbox
              key={cat}
              checked={selectedCategories.includes(cat)}
              label={cat}
              onClick={() => onToggle(cat)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

// ===== Enhanced Search Bar with button + suggestions =====
function SmartSearchBar({ value, onChange, placeholder, allItems, nameKey = 'name' }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  allItems: any[];
  nameKey?: string;
}) {
  const [typingValue, setTypingValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTypingValue(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const suggestions = typingValue.trim()
    ? allItems.filter(item => fuzzyMatch(item[nameKey], typingValue) || (item.description && fuzzyMatch(item.description, typingValue))).slice(0, 5)
    : [];

  const handleSearch = () => {
    onChange(typingValue);
    setShowSuggestions(false);
  };

  const handleSelect = (name: string) => {
    setTypingValue(name);
    onChange(name);
    setShowSuggestions(false);
  };

  return (
    <div className="relative max-w-sm" ref={wrapperRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3b1c6]" />
      <input
        type="text"
        placeholder={placeholder}
        value={typingValue}
        onChange={(e) => {
          setTypingValue(e.target.value);
          setShowSuggestions(e.target.value.trim().length > 0);
          if (!e.target.value.trim()) onChange('');
        }}
        onFocus={() => {
          setIsFocused(true);
          if (typingValue.trim()) setShowSuggestions(true);
        }}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
        className="w-full pl-9 pr-20 py-2 text-sm bg-white/70 backdrop-blur-xl border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0d1b2a]/30 transition-colors"
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {typingValue && (
          <button onClick={() => { setTypingValue(''); onChange(''); setShowSuggestions(false); }} className="p-1">
            <X className="w-3.5 h-3.5 text-[#a3b1c6] hover:text-[#4a5b73]" />
          </button>
        )}
        <button
          onClick={handleSearch}
          className="px-2.5 py-1 bg-[#0d1b2a] text-white text-xs rounded-md hover:bg-[#1b2d45] transition-colors"
        >
          搜索
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[#e2e8f0] shadow-lg shadow-[#0d1b2a]/[0.06] z-20 overflow-hidden">
          {suggestions.map((item, i) => (
            <button
              key={item.id || i}
              onMouseDown={() => handleSelect(item[nameKey])}
              className="w-full text-left px-4 py-2.5 hover:bg-[#f4f6fa] transition-colors flex items-center gap-3 border-b border-[#edf1f8] last:border-b-0"
            >
              <Search className="w-3 h-3 text-[#a3b1c6] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-[#0d1b2a] truncate">{item[nameKey]}</p>
                {item.description && <p className="text-[11px] text-[#a3b1c6] truncate">{item.description}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MaterialsResourcesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('models');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolCategories, setSelectedToolCategories] = useState<string[]>(['全部']);

  const [models, setModels] = useState<ModelResource[]>(() => mergeMyAgentModels());

  const handleAddModel = (modelData: any) => { setModels([...models, modelData]); };

  const tabs = [
    { id: 'models' as TabType, label: '模型', icon: Box },
    { id: 'tools' as TabType, label: '工具', icon: Wrench },
  ];

  const [mockTools, setMockTools] = useState<ToolResource[]>(() => mergeMyAgentTools());

  const toolCategories = ['全部', 'MCP', '数据库', '插件'];

  // Reset search when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'models': return <ModelsContent searchQuery={searchQuery} setSearchQuery={setSearchQuery} models={models} onAddModel={handleAddModel} />;
      case 'tools': return <ToolsContent searchQuery={searchQuery} setSearchQuery={setSearchQuery} tools={mockTools} categories={toolCategories} selectedCategories={selectedToolCategories} setSelectedCategories={setSelectedToolCategories} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      <FactorySidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="px-8 pt-6 pb-8">
          <div className="mb-6">
            <h1 className="text-[22px] text-[#0d1b2a] mb-1" style={{ fontWeight: 500 }}>开发资源管理</h1>
            <p className="text-xs text-[#7d8da1]" style={{ fontWeight: 400 }}>统一管理平台基础能力资源</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mb-6 border-b border-[#e2e8f0]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`pb-3 px-1 text-sm transition-all relative flex items-center gap-2 ${
                    isActive ? 'text-[#0d1b2a]' : 'text-[#7d8da1] hover:text-[#4a5b73]'
                  }`}
                  style={{ fontWeight: isActive ? 500 : 400 }}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0d1b2a]' : 'text-[#a3b1c6]'}`} />
                  <span>{tab.label}</span>
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0d1b2a]" />}
                </button>
              );
            })}
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ==========================
// Models Content
// ==========================
function ModelsContent({ searchQuery, setSearchQuery, models, onAddModel }: any) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  const filtered = models.filter((m: any) => fuzzyMatch(m.name, searchQuery) || fuzzyMatch(m.provider, searchQuery));

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <SmartSearchBar value={searchQuery} onChange={setSearchQuery} placeholder="搜索模型..." allItems={models} />
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-[#0d1b2a] text-white rounded-lg text-xs hover:bg-[#1b2d45] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          新增模型
        </button>
      </div>

      {/* Model List */}
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-12 px-5 py-2 text-[11px] text-[#a3b1c6] uppercase tracking-wider">
          <div className="col-span-3">模型名称</div>
          <div className="col-span-2">提供商</div>
          <div className="col-span-3">API 密钥</div>
          <div className="col-span-1">状态</div>
          <div className="col-span-1">引用</div>
          <div className="col-span-2 text-center">操作</div>
        </div>

        {filtered.map((model: any) => {
          const isUnavailable = model.status === 'unavailable';
          return (
            <div key={model.id} className={`group bg-white/70 backdrop-blur-xl rounded-xl border transition-all ${isUnavailable ? 'border-[#fecaca]/60 bg-[#fef2f2]/30' : 'border-[#e2e8f0] hover:border-[#cbd5e1]'}`}>
              <div className="grid grid-cols-12 items-center px-5 py-4">
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isUnavailable ? 'bg-[#fef2f2]' : 'bg-[#edf1f8]'}`}>
                      <Sparkles className={`w-4 h-4 ${isUnavailable ? 'text-[#c7000b]/50' : 'text-[#7d8da1]'}`} />
                    </div>
                    <span className={`text-sm ${isUnavailable ? 'text-[#7d8da1]' : 'text-[#0d1b2a]'}`}>{model.name}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-[#7d8da1]">{model.provider}</span>
                </div>
                <div className="col-span-3">
                  {model.apiKey ? (
                    <code className="text-[11px] text-[#7d8da1] bg-[#edf1f8] px-2 py-1 rounded">{model.apiKey.substring(0, 18)}...</code>
                  ) : (
                    <span className="text-[11px] text-[#a3b1c6]">未配置</span>
                  )}
                </div>
                <div className="col-span-1">
                  <span className={`inline-flex items-center gap-1 text-xs ${
                    isUnavailable ? 'text-[#c7000b]' : 'text-[#0d1b2a]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isUnavailable ? 'bg-[#c7000b]' : 'bg-[#10B981]'}`} />
                    {isUnavailable ? '不可用' : '可用'}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-xs text-[#7d8da1]">{model.usedBy} 个</span>
                </div>
                <div className="col-span-2 flex items-center justify-center gap-1">
                  <button 
                    onClick={() => { setSelectedModel(model); setShowEditModal(true); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#4a5b73] hover:bg-[#edf1f8] rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    编辑
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-[#fef2f2]">
                    <Trash2 className="w-3.5 h-3.5 text-[#a3b1c6] hover:text-[#c7000b]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-[#7d8da1]">无匹配结果</p>
          </div>
        )}
      </div>

      {showAddModal && <ModelConfigModal onClose={() => setShowAddModal(false)} onSave={(d: any) => { onAddModel(d); setShowAddModal(false); }} />}
      {showEditModal && selectedModel && <ModelConfigModal model={selectedModel} onClose={() => { setShowEditModal(false); setSelectedModel(null); }} onSave={onAddModel} />}
    </>
  );
}

// ==========================
// Tools Content
// ==========================
function ToolsContent({ searchQuery, setSearchQuery, tools, categories, selectedCategories, setSelectedCategories }: any) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any>(null);

  const toggleCategory = (cat: string) => {
    if (cat === '全部') { setSelectedCategories(['全部']); return; }
    let next = selectedCategories.filter((c: string) => c !== '全部');
    next = next.includes(cat) ? next.filter((c: string) => c !== cat) : [...next, cat];
    setSelectedCategories(next.length === 0 ? ['全部'] : next);
  };

  const filtered = tools.filter((t: any) => {
    const s = fuzzyMatch(t.name, searchQuery) || fuzzyMatch(t.description, searchQuery);
    const c = selectedCategories.includes('全部') || selectedCategories.includes(t.category);
    return s && c;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <SmartSearchBar value={searchQuery} onChange={setSearchQuery} placeholder="搜索工具..." allItems={tools} />
        <button className="flex items-center gap-2 px-3 py-2 bg-[#0d1b2a] text-white rounded-lg text-xs hover:bg-[#1b2d45] transition-colors">
          <Plus className="w-3.5 h-3.5" />
          新增工具
        </button>
      </div>
      <div className="flex gap-5">
        <FilterSidebar title="工具分类" categories={categories} selectedCategories={selectedCategories} onToggle={toggleCategory} onReset={() => setSelectedCategories(['全部'])} />
        <div className="flex-1">
          <p className="text-xs text-[#a3b1c6] mb-4">{filtered.length} 个结果</p>
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((tool: any) => {
              const isUnavailable = tool.status === 'unavailable';
              return (
                <div key={tool.id} className={`group bg-white/70 backdrop-blur-xl rounded-xl border transition-all p-5 ${
                  isUnavailable ? 'border-[#fecaca]/60 bg-[#fef2f2]/20' : 'border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm hover:shadow-[#0d1b2a]/[0.03]'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block px-2 py-0.5 bg-[#edf1f8] text-[#4a5b73] text-[11px] rounded-md">{tool.category}</span>
                    {isUnavailable && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#fef2f2] text-[#c7000b] text-[10px] rounded-md border border-[#fecaca]/60">
                        <AlertCircle className="w-2.5 h-2.5" />不可用
                      </span>
                    )}
                  </div>
                  
                  <h3 className={`text-[15px] mb-1.5 ${isUnavailable ? 'text-[#7d8da1]' : 'text-[#0d1b2a]'}`}>{tool.name}</h3>
                  <p className="text-sm text-[#7d8da1] leading-relaxed mb-3 min-h-[40px]">{tool.description}</p>
                  
                  <div className="mb-3">
                    <code className="text-[11px] text-[#7d8da1] bg-[#edf1f8] px-2 py-1 rounded block truncate">{tool.endpoint}</code>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#edf1f8]">
                    <span className="text-[11px] text-[#a3b1c6]">{tool.usedBy} 个智能体在用</span>
                    <div className="flex gap-1">
                      <button onClick={() => { setSelectedTool(tool); setShowEditModal(true); }} className="p-1.5 rounded-lg hover:bg-[#edf1f8]"><Edit3 className="w-3.5 h-3.5 text-[#7d8da1]" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-[#fef2f2]"><Trash2 className="w-3.5 h-3.5 text-[#a3b1c6] hover:text-[#c7000b]" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-[#7d8da1]">无匹配结果</p>
            </div>
          )}
        </div>
      </div>
      {showEditModal && selectedTool && <ToolEditModal tool={selectedTool} onClose={() => { setShowEditModal(false); setSelectedTool(null); }} />}
    </>
  );
}
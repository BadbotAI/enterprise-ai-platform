import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Search,
  SlidersHorizontal,
  Bot,
  Wrench,
  FileCode,
  Plus,
  Eye,
  Power,
  Trash2,
  Plug,
  Workflow,
  Users,
  GitBranch,
  Download,
  Edit3,
  Link as LinkIcon,
  Database,
  MessageSquare,
  Code2,
  BookOpen,
  Zap
} from 'lucide-react';
import { AgentCard } from '../AgentCard';
import { mockAgents, mockScenes } from '../../data/mockData';

type MarketplaceTab = 'agents' | 'tools' | 'skills';

interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: string;
  endpoint: string; // 连接链接
  usedBy: number;
  icon: string;
}

interface SkillItem {
  id: string;
  name: string;
  description: string;
  category: string;
  markdownContent: string; // Markdown开发文本
  editor: string; // 编辑器类型
  iconName: 'Database' | 'MessageSquare' | 'Code2' | 'BookOpen';
  iconColor: string; // 图标渐变色
}

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  scenes: string[]; // 改为数组形式
  creator: string;
  nodeCount: number;
  agentCount: number;
  usedBy: number;
  updatedAt: string;
}

export function MarketplacePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('agents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScenes, setSelectedScenes] = useState<string[]>(['全部']);
  const [sortBy, setSortBy] = useState('updated');

  // Tools filters
  const [selectedToolCategories, setSelectedToolCategories] = useState<string[]>(['全部']);

  // Skills filters
  const [selectedSkillCategories, setSelectedSkillCategories] = useState<string[]>(['全部']);

  // Workflow filters
  const [selectedWorkflowScenes, setSelectedWorkflowScenes] = useState<string[]>(['全部']);

  // Modal states
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [showSkillDetailModal, setShowSkillDetailModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);

  // Tool form states
  const [toolForm, setToolForm] = useState({
    name: '',
    description: '',
    category: '插件',
    endpoint: ''
  });

  const toggleScene = (scene: string) => {
    if (scene === '全部') {
      setSelectedScenes(['全部']);
    } else {
      const newScenes = selectedScenes.includes(scene)
        ? selectedScenes.filter((s) => s !== scene && s !== '全部')
        : [...selectedScenes.filter((s) => s !== '全部'), scene];

      setSelectedScenes(newScenes.length === 0 ? ['全部'] : newScenes);
    }
  };

  const toggleToolCategory = (category: string) => {
    if (category === '全部') {
      setSelectedToolCategories(['全部']);
    } else {
      const newCategories = selectedToolCategories.includes(category)
        ? selectedToolCategories.filter((c) => c !== category && c !== '全部')
        : [...selectedToolCategories.filter((c) => c !== '全部'), category];

      setSelectedToolCategories(newCategories.length === 0 ? ['全部'] : newCategories);
    }
  };

  const toggleSkillCategory = (category: string) => {
    if (category === '全部') {
      setSelectedSkillCategories(['全部']);
    } else {
      const newCategories = selectedSkillCategories.includes(category)
        ? selectedSkillCategories.filter((c) => c !== category && c !== '全部')
        : [...selectedSkillCategories.filter((c) => c !== '全部'), category];

      setSelectedSkillCategories(newCategories.length === 0 ? ['全部'] : newCategories);
    }
  };

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesScene =
      selectedScenes.includes('全部') ||
      agent.tags.some((tag) => selectedScenes.includes(tag));

    return matchesSearch && matchesScene;
  });



  // Mock data for tools
  const mockTools: ToolItem[] = [
    {
      id: '1',
      name: '企业征信API',
      description: '接入工商、司法、财务多维企业信息，支持信用评估与风险扫描',
      category: '数据接口',
      endpoint: 'https://api.credit.supply/v1/query',
      usedBy: 22,
      icon: '🏢'
    },
    {
      id: '2',
      name: '期货行情API',
      description: '实时获取大豆、玉米、铁矿石等大宗商品期货行情数据',
      category: '数据接口',
      endpoint: 'https://api.futures.supply/v2/quotes',
      usedBy: 18,
      icon: '📈'
    },
    {
      id: '3',
      name: 'AIS船舶追踪',
      description: '全球船舶实时定位与航行轨迹追踪，支持港口到港预估',
      category: '物流工具',
      endpoint: 'https://api.ais-tracking.com/v1',
      usedBy: 15,
      icon: '🚢'
    },
    {
      id: '4',
      name: '气象数据MCP',
      description: 'Model Context Protocol连接气象大模型，获取全球气象预测数据',
      category: 'MCP',
      endpoint: 'mcp://weather-model.supply/v3',
      usedBy: 20,
      icon: '🌤'
    },
    {
      id: '5',
      name: '供应链数据库',
      description: '供需、库存、产能等供应链核心数据的统一存储与查询',
      category: '数据库',
      endpoint: 'postgresql://supply-chain.db:5432',
      usedBy: 25,
      icon: '🗄'
    },
    {
      id: '6',
      name: '遥感数据API',
      description: '卫星遥感影像获取与解析，支持作物长势监测与产量评估',
      category: '数据接口',
      endpoint: 'https://api.remote-sensing.com/v1',
      usedBy: 10,
      icon: '🛰'
    },
  ];

  const toolCategories = ['全部', '数据接口', '物流工具', 'MCP', '数据库'];

  const filteredTools = mockTools.filter(tool => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedToolCategories.includes('全部') ||
      selectedToolCategories.includes(tool.category);

    return matchesSearch && matchesCategory;
  });

  // Mock data for skills
  const mockSkills: SkillItem[] = [
    {
      id: '1',
      name: '价格预测技能',
      description: '基于多因子模型对大宗商品价格进行趋势预测，支持大豆、玉米、铁矿石等品种',
      category: '预测分析',
      editor: 'Markdown',
      iconName: 'Database',
      iconColor: 'from-blue-500 to-cyan-600',
      markdownContent: `# 价格预测技能\n\n## 功能说明\n基于供需、库存、期货、政策等多因子分析预测价格走势\n\n## 支持品种\n- 大豆/玉米价格预测\n- 铁矿石价格预测\n- 干散货运价预测\n\n## 核心能力\n- 多因子回归分析\n- 时间序列预测\n- 情景模拟与敏感性分析`
    },
    {
      id: '2',
      name: '舆情分析技能',
      description: '供应链领域政策、新闻与市场情绪的实时监测与情感分析',
      category: '监测分析',
      editor: 'Markdown',
      iconName: 'MessageSquare',
      iconColor: 'from-purple-500 to-pink-600',
      markdownContent: `# 舆情分析技能\n\n## 核心功能\n- 政策文件解读\n- 新闻情感分析\n- 行业事件检测\n- 预警信号生成`
    },
    {
      id: '3',
      name: '供需平衡分析技能',
      description: '构建大宗商品供需平衡表，输出供需格局研判与策略建议',
      category: '预测分析',
      editor: 'Markdown',
      iconName: 'Code2',
      iconColor: 'from-green-500 to-emerald-600',
      markdownContent: `# 供需平衡分析技能\n\n## 分析维度\n- 供应端：产能、发运、在途\n- 需求端：消费、开工率、订单\n- 库存端：港口、工厂、社会库存\n- 平衡表：月度/季度供需平衡预测`
    },
    {
      id: '4',
      name: '研报生成技能',
      description: '自动生成供应链产业研究报告，涵盖数据图表与投研观点',
      category: '报告生成',
      editor: 'Markdown',
      iconName: 'BookOpen',
      iconColor: 'from-orange-500 to-red-600',
      markdownContent: `# 研报生成技能\n\n## 报告类型\n- 日报/周报/月报\n- 品种专题研报\n- 供需平衡分析报告\n- 风险预警简报`
    },
  ];

  const skillCategories = ['全部', '预测分析', '监测分析', '报告生成'];

  // Mock Workflows Data
  const mockWorkflows: WorkflowItem[] = [
    {
      id: 'wf1',
      name: '智能体评估工作流',
      description: '从基础信息与运行日志取证起，依次完成技术、效果、使用、业务四维评估，并输出综合评分与评估报告',
      scenes: ['智能体评估', '质量治理'],
      creator: '评测团队',
      nodeCount: 10,
      agentCount: 4,
      usedBy: 256,
      updatedAt: '2026-03-15'
    },
    {
      id: 'wf2',
      name: '铁矿石供需平衡分析',
      description: '从供应分析、需求分析到价格预测与供需平衡，全链路铁矿石供需研判',
      scenes: ['供需分析', '价格分析'],
      creator: '铁矿石团队',
      nodeCount: 10,
      agentCount: 4,
      usedBy: 189,
      updatedAt: '2026-03-12'
    },
    {
      id: 'wf3',
      name: '进口大豆全链路风险监控',
      description: '港口气象→装港风险预警→信用评估→信息报告，构建进口大豆全链路风险监控体系',
      scenes: ['风险管控'],
      creator: '物流团队',
      nodeCount: 12,
      agentCount: 4,
      usedBy: 312,
      updatedAt: '2026-03-10'
    },
    {
      id: 'wf4',
      name: '内贸玉米物流预警',
      description: '三峡修闸预警→滞期预警→公路段货找车→库存分析，保障内贸玉米物流通畅',
      scenes: ['物流调度', '风险管控'],
      creator: '物流团队',
      nodeCount: 8,
      agentCount: 4,
      usedBy: 178,
      updatedAt: '2026-03-08'
    },
    {
      id: 'wf5',
      name: '多式联运智能调度',
      description: '公路段货找车→公路段车找货→国际干散货海运运价研报→全球气象，实现多式联运最优路径与运力调度',
      scenes: ['物流调度'],
      creator: '物流团队',
      nodeCount: 9,
      agentCount: 4,
      usedBy: 234,
      updatedAt: '2026-03-05'
    },
    {
      id: 'wf6',
      name: '粮食产量预测与库存管理',
      description: '粮食气象→粮食产量预测→库存智能分析→信息报告，从气象到库存的全流程管理',
      scenes: ['供需分析', '产业研报'],
      creator: '农产品团队',
      nodeCount: 11,
      agentCount: 4,
      usedBy: 198,
      updatedAt: '2026-03-01'
    },
  ];

  const workflowScenes = ['全部', '价格分析', '风险管控', '物流调度', '供需分析', '产业研报'];

  const toggleWorkflowScene = (scene: string) => {
    if (scene === '全部') {
      setSelectedWorkflowScenes(['全部']);
    } else {
      setSelectedWorkflowScenes(prev => {
        const filtered = prev.filter(s => s !== '全部');
        if (filtered.includes(scene)) {
          const newScenes = filtered.filter(s => s !== scene);
          return newScenes.length === 0 ? ['全部'] : newScenes;
        } else {
          return [...filtered, scene];
        }
      });
    }
  };

  const filteredWorkflows = mockWorkflows.filter(workflow => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.scenes.some(scene => scene.toLowerCase().includes(searchQuery.toLowerCase())) ||
      workflow.creator.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesScene =
      selectedWorkflowScenes.includes('全部') ||
      workflow.scenes.some(scene => selectedWorkflowScenes.includes(scene));

    return matchesSearch && matchesScene;
  });

  const filteredSkills = mockSkills.filter(skill => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedSkillCategories.includes('全部') ||
      selectedSkillCategories.includes(skill.category);

    return matchesSearch && matchesCategory;
  });

  const tabs = [
    { value: 'agents' as MarketplaceTab, label: '智能体', icon: Bot },
    { value: 'tools' as MarketplaceTab, label: '工具', icon: Wrench },
    { value: 'skills' as MarketplaceTab, label: '技能', icon: FileCode },
  ];

  return (
    <div className="p-8">
      {/* Tabs */}
      <div className="mb-6 border-b border-[#e2e8f0]">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-6 py-3 transition-all relative ${
                  activeTab === tab.value
                    ? 'text-[#191919]'
                    : 'text-[#999] hover:text-[#666]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.value && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#191919]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workflows Tab - Removed */}
      {false && (
        <>
          {/* Search Box */}
          <div className="mb-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索工作流名称、场景、创建者..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-20 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors">
                  搜索
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <aside className="w-40 flex-shrink-0">
              <div className="bg-white rounded-lg p-4 border border-gray-200/60 sticky top-6 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm text-gray-900">业务场景</h3>
                    <button
                      onClick={() => setSelectedWorkflowScenes(['全部'])}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      重置
                    </button>
                  </div>
                  <div className="space-y-1">
                    {workflowScenes.map((scene) => (
                      <label
                        key={scene}
                        className={`flex items-center gap-2 cursor-pointer group px-2 py-1.5 rounded-md transition-all ${
                          selectedWorkflowScenes.includes(scene)
                            ? 'bg-blue-50 border border-blue-200/60'
                            : 'border border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedWorkflowScenes.includes(scene)}
                            onChange={() => toggleWorkflowScene(scene)}
                            className="sr-only peer"
                          />
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            selectedWorkflowScenes.includes(scene)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 bg-white group-hover:border-gray-400'
                          }`}>
                            {selectedWorkflowScenes.includes(scene) && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className={`text-sm transition-colors ${
                          selectedWorkflowScenes.includes(scene)
                            ? 'text-blue-700 font-medium'
                            : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {scene}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Workflow Grid */}
            <div className="flex-1">
              {filteredWorkflows.length > 0 ? (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    共找到 <span className="font-semibold text-gray-900">{filteredWorkflows.length}</span> 个工作流
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {filteredWorkflows.map((workflow) => (
                      <div
                        key={workflow.id}
                        onClick={() => navigate(`/workflow/${workflow.id}`)}
                        className="bg-white rounded-[10px] p-5 border border-[rgba(229,231,235,0.8)] hover:border-gray-300 hover:shadow-md transition-all group flex flex-col h-full cursor-pointer"
                      >
                        {/* Header */}
                        <div className="flex items-start mb-3">
                          <h4 className="font-medium text-lg text-[#101828] group-hover:text-blue-600 transition-colors flex-1 line-clamp-1">
                            {workflow.name}
                          </h4>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-[#6a7282] line-clamp-2 mb-3 flex-1">
                          {workflow.description}
                        </p>

                        {/* Scene Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {workflow.scenes.slice(0, 3).map((scene) => (
                            <span
                              key={scene}
                              className="px-3 py-1 bg-[#f3f4f6] text-[#4a5565] text-sm rounded"
                            >
                              {scene}
                            </span>
                          ))}
                          {workflow.scenes.length > 3 && (
                            <span className="px-3 py-1 bg-[#f3f4f6] text-[#99a1af] text-sm rounded">
                              +{workflow.scenes.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100/80 mt-auto">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                {workflow.creator[0]}
                              </div>
                              <span className="text-xs text-gray-500">{workflow.creator}</span>
                            </div>
                            <span className="text-xs text-gray-400">{workflow.updatedAt}</span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/studio/canvas/${workflow.id}`);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            体验
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">未找到相关工作流</h3>
                  <p className="text-gray-600 mb-4">
                    尝试调整搜索关键词或筛选条件
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedWorkflowScenes(['全部']);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    清空筛选
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <>
          {/* Search & Sort */}
          <div className="mb-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ccc]" />
                <input
                  type="text"
                  placeholder="搜索智能体名称、场景、创建者..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-20 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0d1b2a]/20 focus:border-[#0d1b2a]/30"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#191919] text-white rounded-md hover:bg-[#333] text-sm transition-colors">
                  搜索
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[#999]">排序:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0d1b2a]/20 text-sm bg-white/70"
                >
                  <option value="updated">最近更新</option>
                  <option value="newest">最新发布</option>
                  <option value="popular">使用热度</option>
                  <option value="success">成功率</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <aside className="w-48 flex-shrink-0">
              <div className="bg-white rounded-lg p-4 border border-gray-200/60 sticky top-6 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm text-gray-900" style={{ fontWeight: 500 }}>业务场景</h3>
                    <button
                      onClick={() => setSelectedScenes(['全部'])}
                      className="text-xs text-blue-600 hover:text-blue-700"
                      style={{ fontWeight: 500 }}
                    >
                      重置
                    </button>
                  </div>
                  <div className="space-y-1">
                    {mockScenes.map((scene) => (
                      <label
                        key={scene}
                        className={`flex items-center gap-2.5 cursor-pointer group px-2.5 py-2 rounded-md transition-all ${
                          selectedScenes.includes(scene)
                            ? 'bg-blue-50 border border-blue-200/60'
                            : 'border border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedScenes.includes(scene)}
                            onChange={() => toggleScene(scene)}
                            className="sr-only peer"
                          />
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            selectedScenes.includes(scene)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 bg-white group-hover:border-gray-400'
                          }`}>
                            {selectedScenes.includes(scene) && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className={`text-sm transition-colors ${
                          selectedScenes.includes(scene)
                            ? 'text-blue-700'
                            : 'text-gray-700 group-hover:text-gray-900'
                        }`} style={{ fontWeight: selectedScenes.includes(scene) ? 500 : 400 }}>
                          {scene}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Agent Grid */}
            <div className="flex-1">
              {filteredAgents.length > 0 ? (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    共找到 <span className="text-gray-900" style={{ fontWeight: 500 }}>{filteredAgents.length}</span> 个智能体
                  </div>

                  <div className="grid grid-cols-3 gap-5">
                    {filteredAgents.map((agent) => (
                      <AgentCard key={agent.id} agent={agent} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">未找到相关智能体</h3>
                  <p className="text-gray-600 mb-4">
                    尝试调整搜索关键词或筛选条件
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedScenes(['全部']);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    清空筛选
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}



      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <>
          {/* Search Box */}
          <div className="mb-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索工具名称、描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors">
                搜索
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Tools Filters Sidebar */}
            <aside className="w-40 flex-shrink-0">
              <div className="bg-white rounded-lg p-4 border border-gray-200/60 sticky top-6 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm text-gray-900">工具分类</h3>
                    <button
                      onClick={() => setSelectedToolCategories(['全部'])}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      重置
                    </button>
                  </div>
                  <div className="space-y-1">
                    {toolCategories.map((category) => (
                      <label
                        key={category}
                        className={`flex items-center gap-2 cursor-pointer group px-2 py-1.5 rounded-md transition-all ${
                          selectedToolCategories.includes(category)
                            ? 'bg-blue-50 border border-blue-200/60'
                            : 'border border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedToolCategories.includes(category)}
                            onChange={() => toggleToolCategory(category)}
                            className="sr-only peer"
                          />
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            selectedToolCategories.includes(category)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 bg-white group-hover:border-gray-400'
                          }`}>
                            {selectedToolCategories.includes(category) && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className={`text-sm transition-colors ${
                          selectedToolCategories.includes(category)
                            ? 'text-blue-700 font-medium'
                            : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Tools Grid */}
            <div className="flex-1">
              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  共找到 <span className="font-semibold text-gray-900">{filteredTools.length}</span> 个工具
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:border-orange-200 hover:shadow-lg transition-all group relative overflow-hidden"
                  >
                    {/* Background Gradient Decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -z-0" />

                    <div className="relative z-10">
                      {/* Type Label (Top Left) */}
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold rounded-lg shadow-sm">
                          {tool.category}
                        </span>
                      </div>

                      {/* Header */}
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
                        {tool.name}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                        {tool.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Users className="w-4 h-4" />
                        <span>{tool.usedBy} 个智能体在用</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button className="flex-1 px-4 py-2.5 bg-white text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-all flex items-center justify-center gap-2 font-medium">
                          <Download className="w-4 h-4" />
                          安装工具
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <>
          {/* Search Box */}
          <div className="mb-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索技能名称、描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors">
                搜索
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Skills Filters Sidebar */}
            <aside className="w-40 flex-shrink-0">
              <div className="bg-white rounded-lg p-4 border border-gray-200/60 sticky top-6 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm text-gray-900">技能分类</h3>
                    <button
                      onClick={() => setSelectedSkillCategories(['全部'])}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      重置
                    </button>
                  </div>
                  <div className="space-y-1">
                    {skillCategories.map((category) => (
                      <label
                        key={category}
                        className={`flex items-center gap-2 cursor-pointer group px-2 py-1.5 rounded-md transition-all ${
                          selectedSkillCategories.includes(category)
                            ? 'bg-blue-50 border border-blue-200/60'
                            : 'border border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedSkillCategories.includes(category)}
                            onChange={() => toggleSkillCategory(category)}
                            className="sr-only peer"
                          />
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            selectedSkillCategories.includes(category)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 bg-white group-hover:border-gray-400'
                          }`}>
                            {selectedSkillCategories.includes(category) && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className={`text-sm transition-colors ${
                          selectedSkillCategories.includes(category)
                            ? 'text-blue-700 font-medium'
                            : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Skills Grid */}
            <div className="flex-1">
              <div className="mb-4 text-sm text-gray-600">
                共找到 <span className="font-semibold text-gray-900">{filteredSkills.length}</span> 个技能
              </div>

              <div className="grid grid-cols-3 gap-6">
                {filteredSkills.map((skill) => {
                  const iconMap = {
                    Database,
                    MessageSquare,
                    Code2,
                    BookOpen
                  };
                  const SkillIcon = iconMap[skill.iconName];

                  return (
                    <div
                      key={skill.id}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:border-cyan-200 hover:shadow-lg transition-all group relative overflow-hidden"
                    >
                      {/* Background Gradient Decoration */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -z-0" />

                      <div className="relative z-10">
                        {/* Icon */}
                        <div className="mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${skill.iconColor} rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30`}>
                            <Zap className="w-6 h-6 text-white" />
                          </div>
                        </div>

                        {/* Header */}
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-cyan-600 transition-colors mb-2">
                          {skill.name}
                        </h3>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                          {skill.description}
                        </p>

                        {/* Type Label */}
                        <div className="mb-4">
                          <span className="inline-flex items-center px-2.5 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded">
                            {skill.category}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="flex-1 px-4 py-2.5 bg-white text-cyan-600 border border-cyan-200 rounded-lg hover:bg-cyan-50 transition-all flex items-center justify-center gap-2 font-medium"
                          >
                            <Download className="w-4 h-4" />
                            安装技能
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}



      {/* Add Tool Modal */}
      {showAddToolModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">新增工具</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  工具名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={toolForm.name}
                  onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                  placeholder="请输入工具名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  工具分类 <span className="text-red-500">*</span>
                </label>
                <select
                  value={toolForm.category}
                  onChange={(e) => setToolForm({ ...toolForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="插件">插件</option>
                  <option value="MCP">MCP</option>
                  <option value="数据库">数据库</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  连接链接 <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={toolForm.endpoint}
                  onChange={(e) => setToolForm({ ...toolForm, endpoint: e.target.value })}
                  placeholder="https://api.example.com/endpoint"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  工具描述 <span className="text-gray-400 text-xs">(选填)</span>
                </label>
                <textarea
                  value={toolForm.description}
                  onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })}
                  placeholder="请输入工具描述"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowAddToolModal(false);
                  setToolForm({ name: '', description: '', category: '插件', endpoint: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!toolForm.name || !toolForm.category || !toolForm.endpoint) {
                    alert('请填写所有必填信息（工具名称、工具分类、连接链接）');
                    return;
                  }

                  alert('工具已成功添加到工具列表！');
                  setShowAddToolModal(false);
                  setToolForm({ name: '', description: '', category: '插件', endpoint: '' });
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skill Detail Modal */}
      {showSkillDetailModal && selectedSkill && (() => {
        const iconMap = {
          Database,
          MessageSquare,
          Code2,
          BookOpen
        };
        const SkillIcon = iconMap[selectedSkill.iconName];

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${selectedSkill.iconColor} rounded-lg flex items-center justify-center`}>
                    <SkillIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedSkill.name}</h2>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSkillDetailModal(false);
                    setSelectedSkill(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 flex-1 overflow-auto">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">技能描述</h3>
                  <p className="text-sm text-gray-600">{selectedSkill.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    Markdown开发文本
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {selectedSkill.markdownContent}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowSkillDetailModal(false);
                    setSelectedSkill(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    alert('技能已安装！');
                    setShowSkillDetailModal(false);
                    setSelectedSkill(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  安装技能
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tool Edit Modal */}
      {selectedTool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">编辑工具</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  工具名称
                </label>
                <input
                  type="text"
                  defaultValue={selectedTool.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  工具描述
                </label>
                <textarea
                  defaultValue={selectedTool.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  连接链接
                </label>
                <input
                  type="url"
                  defaultValue={selectedTool.endpoint}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setSelectedTool(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  alert('工具信息已更新！');
                  setSelectedTool(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
import { Bot, Plus, Search, Wrench, FileCode, Database, MessageSquare, Code2, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { FactorySidebar } from '../../FactorySidebar';
import { AgentCard } from '../../AgentCard';
import type { Agent } from '../../../data/mockData';

// Fuzzy match helper
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

type MarketplaceTab = 'agents' | 'tools' | 'skills';

interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: string;
  endpoint: string;
  usedBy: number;
  icon: string;
}

interface SkillItem {
  id: string;
  name: string;
  description: string;
  category: string;
  markdownContent: string;
  editor: string;
  iconName: 'Database' | 'MessageSquare' | 'Code2' | 'BookOpen';
}

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  scenes: string[];
  creator: string;
  nodeCount: number;
  agentCount: number;
  usedBy: number;
  updatedAt: string;
}

// ── Explore-only agents (non-overlapping with "我的智能体") ──
const EXPLORE_AGENTS: Agent[] = [
  { id: 'explore-1', name: '碳排放分析智能体', version: 'v1.2.0', type: 'single', description: '基于供应链全链路碳足迹追踪，计算产品碳排放量并生成碳中和建议报告', tags: ['可持续发展', '碳排放'], creator: { name: '绿色供应链实验室', avatar: '' }, status: 'normal', publishStatus: 'published', successRate: 95.2, callCount: 1280, avgLatency: 3200, publishDate: '2025-09-10' },
  { id: 'explore-2', name: '贸易合规审查智能体', version: 'v2.0.1', type: 'multi', description: '自动审查供应链贸易合规性，覆盖进出口法规、制裁名单筛查和原产地认证', tags: ['合规审查', '风险管控'], creator: { name: '合规科技团队', avatar: '' }, status: 'normal', publishStatus: 'published', successRate: 98.1, callCount: 2150, avgLatency: 2400, publishDate: '2025-08-22' },
  { id: 'explore-3', name: '供应商画像智能体', version: 'v1.5.0', type: 'multi', description: '多维度供应商评估画像，整合交货表现、质量指标、财务健康度和ESG评分', tags: ['供应商管理', '信用风控'], creator: { name: '采购智能团队', avatar: '' }, status: 'normal', publishStatus: 'published', successRate: 96.8, callCount: 1890, avgLatency: 2800, publishDate: '2025-07-18' },
  { id: 'explore-4', name: '航线优化智能体', version: 'v1.3.2', type: 'single', description: '基于实时航运数据和历史航线分析，为货物运输提供最优航线和船期推荐', tags: ['多式联运', '路径优化'], creator: { name: '智慧物流研究院', avatar: '' }, status: 'normal', publishStatus: 'published', successRate: 94.5, callCount: 2340, avgLatency: 3500, publishDate: '2025-10-05' },
  { id: 'explore-5', name: '关税计算智能体', version: 'v1.1.0', type: 'single', description: '自动计算跨境贸易关税、增值税及附加费，支持多国关税规则和FTA优惠适用', tags: ['关税计算', '进出口'], creator: { name: '跨境贸易团队', avatar: '' }, status: 'normal', publishStatus: 'published', successRate: 97.3, callCount: 3120, avgLatency: 1800, publishDate: '2025-06-28' },
  { id: 'explore-6', name: '产品溯源智能体', version: 'v2.1.0', type: 'multi', description: '基于区块链和IoT数据实现农产品从产地到终端的全链路品质溯源', tags: ['品质追溯', '农产品'], creator: { name: '食品安全实验室', avatar: '' }, status: 'normal', publishStatus: 'published', successRate: 99.1, callCount: 1560, avgLatency: 2100, publishDate: '2025-11-12' },
  { id: 'explore-7', name: '供应链金融智能体', version: 'v1.4.0', type: 'multi', description: '基于交易流水和信用数据进行供应链金融风险评估，支持应收账款融资和订单融资', tags: ['供应链金融', '信用风控'], creator: { name: '金融科技团队', avatar: '' }, status: 'normal', publishStatus: 'published', successRate: 96.5, callCount: 2780, avgLatency: 3100, publishDate: '2025-08-15' },
  { id: 'explore-8', name: '智能排产智能体', version: 'v1.0.3', type: 'single', description: '根据订单需求、产能约束和物料库存自动生成最优生产排程方案', tags: ['生产排程', '供需分析'], creator: { name: '工业智能团队', avatar: '' }, status: 'normal', publishStatus: 'published', successRate: 93.8, callCount: 980, avgLatency: 4200, publishDate: '2025-12-01' },
  { id: 'explore-9', name: '冷链监控智能体', version: 'v1.6.0', type: 'single', description: '实时监控冷链运输温湿度，自动识别异常并触发预警和应急调度', tags: ['冷链物流', '温控监测'], creator: { name: '冷链科技中心', avatar: '' }, status: 'normal', publishStatus: 'published', successRate: 98.7, callCount: 4520, avgLatency: 1500, publishDate: '2025-05-20' },
  { id: 'explore-10', name: '原材料价格监测智能体', version: 'v1.2.1', type: 'single', description: '实时追踪全球大宗商品和原材料价格波动，结合宏观指标预测短期价格走势', tags: ['价格预测', '原材料'], creator: { name: '大宗商品研究所', avatar: '' }, status: 'normal', publishStatus: 'published', successRate: 95.9, callCount: 3650, avgLatency: 2600, publishDate: '2025-07-30' },
  { id: 'explore-11', name: '港口拥堵预测智能体', version: 'v1.3.0', type: 'single', description: '基于AIS船舶数据和港口作业信息预测港口拥堵程度，优化靠泊计划', tags: ['港口调度', '多式联运'], creator: { name: '港口智能研究所', avatar: '' }, status: 'normal', publishStatus: 'published', successRate: 91.2, callCount: 1820, avgLatency: 3800, publishDate: '2025-09-25' },
  { id: 'explore-12', name: '供应链可视化智能体', version: 'v2.0.0', type: 'multi', description: '将复杂供应链网络转化为可交互的可视化图谱，支持风险节点识别和路径分析', tags: ['可视化', '全链路'], creator: { name: '数据可视化团队', avatar: '' }, status: 'normal', publishStatus: 'published', successRate: 97.0, callCount: 2210, avgLatency: 2900, publishDate: '2025-10-18' },
];

const EXPLORE_SCENES = ['全部', '信用风控', '多式联运', '价格预测', '供需分析', '农产品', '可持续发展', '合规审查', '供应链金融', '品质追溯', '冷链物流', '进出口'];

export function MaterialsExplorePage() {
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

  const toggleWorkflowScene = (scene: string) => {
    if (scene === '全部') {
      setSelectedWorkflowScenes(['全部']);
    } else {
      const newScenes = selectedWorkflowScenes.includes(scene)
        ? selectedWorkflowScenes.filter((s) => s !== scene && s !== '全部')
        : [...selectedWorkflowScenes.filter((s) => s !== '全部'), scene];
      
      setSelectedWorkflowScenes(newScenes.length === 0 ? ['全部'] : newScenes);
    }
  };

  const filteredAgents = EXPLORE_AGENTS.filter((agent) => {
    const matchesSearch = 
      fuzzyMatch(agent.name, searchQuery) ||
      fuzzyMatch(agent.description, searchQuery) ||
      agent.tags.some((tag) => fuzzyMatch(tag, searchQuery));
    
    const matchesScene = 
      selectedScenes.includes('全部') ||
      agent.tags.some((tag) => selectedScenes.includes(tag));
    
    return matchesSearch && matchesScene;
  });

  // Mock data for tools
  const mockTools: ToolItem[] = [
    {
      id: '1',
      name: '文档解析插件',
      description: '支持PDF、Word、Excel等多种格式的文档解析和提取',
      category: '插件',
      endpoint: 'https://api.docparser.com/v1/parse',
      usedBy: 15,
      icon: '📄'
    },
    {
      id: '2',
      name: '数据分析插件',
      description: '提供数据清洗、统计分析和可视化能力',
      category: '插件',
      endpoint: 'https://api.datatools.com/v2/analyze',
      usedBy: 12,
      icon: '📊'
    },
    {
      id: '3',
      name: 'Slack MCP',
      description: 'Model Context Protocol连接，支持Slack消息读取和发送',
      category: 'MCP',
      endpoint: 'mcp://slack.com/v1',
      usedBy: 20,
      icon: '💬'
    },
    {
      id: '4',
      name: 'GitHub MCP',
      description: '连接GitHub仓库，支持代码搜索、PR管理和Issue跟踪',
      category: 'MCP',
      endpoint: 'mcp://github.com/v1',
      usedBy: 18,
      icon: '🔗'
    },
    {
      id: '5',
      name: 'PostgreSQL数据库',
      description: '关系型数据库连接，支持SQL查询和数据管理',
      category: '数据库',
      endpoint: 'postgresql://db.example.com:5432',
      usedBy: 10,
      icon: '🐘'
    },
    {
      id: '6',
      name: 'MongoDB数据库',
      description: 'NoSQL数据库连接，支持文档存储和查询',
      category: '数据库',
      endpoint: 'mongodb://db.example.com:27017',
      usedBy: 8,
      icon: '🍃'
    },
  ];

  const toolCategories = ['全部', '插件', 'MCP', '数据库'];

  const filteredTools = mockTools.filter(tool => {
    const matchesSearch = 
      fuzzyMatch(tool.name, searchQuery) ||
      fuzzyMatch(tool.description, searchQuery);
    
    const matchesCategory = 
      selectedToolCategories.includes('全部') ||
      selectedToolCategories.includes(tool.category);
    
    return matchesSearch && matchesCategory;
  });

  // Mock data for skills
  const mockSkills: SkillItem[] = [
    {
      id: '1',
      name: '数据分析技能',
      description: '专业的数据处理、统计分析和可视化能力，支持多种数据格式和分析方法',
      category: '数据技能',
      editor: 'Markdown',
      iconName: 'Database',
      markdownContent: `# 数据分析技能\n\n## 功能说明\n提供专业的数据处理、统计分析和可视化能力`
    },
    {
      id: '2',
      name: '文本处理技能',
      description: '文本分类、情感分析、关键词提取等NLP核心功能',
      category: 'NLP技能',
      editor: 'Markdown',
      iconName: 'MessageSquare',
      markdownContent: `# 文本处理技能\n\n## 核心功能\n- 文本分类\n- 情感分析`
    },
    {
      id: '3',
      name: '代码生成技能',
      description: '多语言代码生成、代码优化和错误修复能力',
      category: '编程技能',
      editor: 'Markdown',
      iconName: 'Code2',
      markdownContent: `# 代码生成技能\n\n## 支持语言\n- Python\n- JavaScript`
    },
    {
      id: '4',
      name: '知识问答技能',
      description: '基于知识库的智能问答和推理能力',
      category: '知识技能',
      editor: 'Markdown',
      iconName: 'BookOpen',
      markdownContent: `# 知识问答技能\n\n## 能力特点\n- 知识检索\n- 逻辑推理`
    },
  ];

  const skillCategories = ['全部', '数据技能', 'NLP技能', '编程技能', '知识技能'];

  const filteredSkills = mockSkills.filter(skill => {
    const matchesSearch = 
      fuzzyMatch(skill.name, searchQuery) ||
      fuzzyMatch(skill.description, searchQuery);
    
    const matchesCategory = 
      selectedSkillCategories.includes('全部') ||
      selectedSkillCategories.includes(skill.category);
    
    return matchesSearch && matchesCategory;
  });

  // Mock Workflows Data (supply chain themed)
  const mockWorkflows: WorkflowItem[] = [
    {
      id: 'wf1',
      name: '原材料采购风险评估流程',
      description: '从供应商画像到合规审查到关税计算的全链路采购风险评估',
      scenes: ['风险管控', '合规审查'],
      creator: '张工',
      nodeCount: 8,
      agentCount: 3,
      usedBy: 156,
      updatedAt: '2025-11-28'
    },
    {
      id: 'wf2',
      name: '冷链运输全程监控流程',
      description: '冷链温控监测、异常预警与航线优化联动的运输监控流程',
      scenes: ['冷链物流', '路径优化'],
      creator: '李经理',
      nodeCount: 6,
      agentCount: 2,
      usedBy: 232,
      updatedAt: '2025-11-27'
    },
    {
      id: 'wf3',
      name: '跨境贸易合规与关税计算',
      description: '自动完成贸易合规审查、关税预估和FTA优惠适用性判断',
      scenes: ['合规审查', '进出口'],
      creator: '王工',
      nodeCount: 10,
      agentCount: 4,
      usedBy: 189,
      updatedAt: '2025-11-26'
    },
    {
      id: 'wf4',
      name: '供应链金融授信评估',
      description: '基于交易数据和供应商画像进行供应链金融授信额度评估',
      scenes: ['供应链金融', '信用风控'],
      creator: '赵经理',
      nodeCount: 7,
      agentCount: 3,
      usedBy: 321,
      updatedAt: '2025-11-25'
    },
    {
      id: 'wf5',
      name: '全链路碳足迹追踪',
      description: '从原材料采购到成品交付的全供应链碳排放计算与优化建议',
      scenes: ['可持续发展', '碳排放'],
      creator: '陈博士',
      nodeCount: 9,
      agentCount: 2,
      usedBy: 98,
      updatedAt: '2025-11-24'
    },
    {
      id: 'wf6',
      name: '港口调度与排产协同',
      description: '港口拥堵预测与生产排程联动，优化到港时间窗口和生产节奏',
      scenes: ['港口调度', '生产排程'],
      creator: '刘工',
      nodeCount: 12,
      agentCount: 5,
      usedBy: 267,
      updatedAt: '2025-11-23'
    }
  ];

  const workflowScenes = ['全部', '风险管控', '合规审查', '冷链物流', '路径优化', '进出口', '供应链金融', '信用风控', '可持续发展', '港口调度', '生产排程'];

  const filteredWorkflows = mockWorkflows.filter(workflow => {
    const matchesSearch = 
      fuzzyMatch(workflow.name, searchQuery) ||
      fuzzyMatch(workflow.description, searchQuery);
    
    const matchesScene = 
      selectedWorkflowScenes.includes('全部') ||
      workflow.scenes.some(scene => selectedWorkflowScenes.includes(scene));
    
    return matchesSearch && matchesScene;
  });

  const getIconForSkill = (iconName: string) => {
    const iconMap: { [key: string]: React.ElementType } = {
      'Database': Database,
      'MessageSquare': MessageSquare,
      'Code2': Code2,
      'BookOpen': BookOpen
    };
    return iconMap[iconName] || Database;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'agents':
        return (
          <div className="flex gap-5">
            {/* Filters Sidebar */}
            <aside className="w-40 flex-shrink-0">
              <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4 border border-[#e2e8f0] sticky top-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs text-[#0d1b2a]">应用场景</h3>
                    <button
                      onClick={() => setSelectedScenes(['全部'])}
                      className="text-[11px] text-[#7d8da1] hover:text-[#4a5b73]"
                    >
                      重置
                    </button>
                  </div>
                  <div className="space-y-0">
                    {EXPLORE_SCENES.map((scene) => (
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
              </div>
            </aside>

            {/* Agents Grid */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#a3b1c6] mb-4">{filteredAgents.length} 个结果</p>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {filteredAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'tools':
        return (
          <div className="flex gap-5">
            <aside className="w-40 flex-shrink-0">
              <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4 border border-[#e2e8f0] sticky top-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs text-[#0d1b2a]">工具分类</h3>
                  <button onClick={() => setSelectedToolCategories(['全部'])} className="text-[11px] text-[#7d8da1] hover:text-[#4a5b73]">重置</button>
                </div>
                <div className="space-y-0">
                  {toolCategories.map((cat) => (
                    <button key={cat} onClick={() => toggleToolCategory(cat)} className="flex items-center gap-2 py-1.5 w-full text-left group">
                      <div className={`w-3.5 h-3.5 rounded border-[1.5px] flex items-center justify-center transition-colors flex-shrink-0 ${
                        selectedToolCategories.includes(cat) ? 'bg-[#0d1b2a] border-[#0d1b2a]' : 'border-[#cbd5e1] group-hover:border-[#7d8da1]'
                      }`}>
                        {selectedToolCategories.includes(cat) && (
                          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm transition-colors ${selectedToolCategories.includes(cat) ? 'text-[#0d1b2a]' : 'text-[#7d8da1] group-hover:text-[#4a5b73]'}`}>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#a3b1c6] mb-4">{filteredTools.length} 个结果</p>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {filteredTools.map((tool) => (
                  <div key={tool.id} className="group bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm hover:shadow-[#0d1b2a]/[0.03] transition-all p-5">
                    <span className="inline-block px-2 py-0.5 bg-[#edf1f8] text-[#4a5b73] text-[11px] rounded-md mb-3">{tool.category}</span>
                    <h3 className="text-[15px] text-[#0d1b2a] mb-1.5">{tool.name}</h3>
                    <p className="text-xs text-[#7d8da1] leading-relaxed mb-3 min-h-[32px] line-clamp-2">{tool.description}</p>
                    <code className="text-[11px] text-[#7d8da1] bg-[#edf1f8] px-2 py-1 rounded block truncate mb-3">{tool.endpoint}</code>
                    <div className="flex items-center justify-between pt-3 border-t border-[#edf1f8]">
                      <span className="text-[11px] text-[#a3b1c6]">{tool.usedBy} 个智能体在用</span>
                      <button className="px-3 py-1.5 bg-[#0d1b2a] text-white rounded-lg text-xs hover:bg-[#1b2d45] transition-colors flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        添加
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="flex gap-5">
            <aside className="w-40 flex-shrink-0">
              <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4 border border-[#e2e8f0] sticky top-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs text-[#0d1b2a]">技能分类</h3>
                  <button onClick={() => setSelectedSkillCategories(['全部'])} className="text-[11px] text-[#7d8da1] hover:text-[#4a5b73]">重置</button>
                </div>
                <div className="space-y-0">
                  {skillCategories.map((cat) => (
                    <button key={cat} onClick={() => toggleSkillCategory(cat)} className="flex items-center gap-2 py-1.5 w-full text-left group">
                      <div className={`w-3.5 h-3.5 rounded border-[1.5px] flex items-center justify-center transition-colors flex-shrink-0 ${
                        selectedSkillCategories.includes(cat) ? 'bg-[#0d1b2a] border-[#0d1b2a]' : 'border-[#cbd5e1] group-hover:border-[#7d8da1]'
                      }`}>
                        {selectedSkillCategories.includes(cat) && (
                          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm transition-colors ${selectedSkillCategories.includes(cat) ? 'text-[#0d1b2a]' : 'text-[#7d8da1] group-hover:text-[#4a5b73]'}`}>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#a3b1c6] mb-4">{filteredSkills.length} 个结果</p>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {filteredSkills.map((skill) => {
                  const IconComponent = getIconForSkill(skill.iconName);
                  return (
                    <div key={skill.id} className="group bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm hover:shadow-[#0d1b2a]/[0.03] transition-all p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 bg-[#edf1f8] rounded-xl flex items-center justify-center">
                          <IconComponent className="w-4.5 h-4.5 text-[#4a5b73]" />
                        </div>
                        <span className="px-2 py-0.5 bg-[#edf1f8] text-[#7d8da1] text-[11px] rounded-md">{skill.category}</span>
                      </div>
                      <h3 className="text-[15px] text-[#0d1b2a] mb-1.5">{skill.name}</h3>
                      <p className="text-xs text-[#7d8da1] leading-relaxed mb-3 min-h-[32px] line-clamp-2">{skill.description}</p>
                      <div className="pt-3 border-t border-[#edf1f8] flex justify-end">
                        <button className="px-3 py-1.5 bg-[#0d1b2a] text-white rounded-lg text-xs hover:bg-[#1b2d45] transition-colors flex items-center gap-1">
                          <Plus className="w-3 h-3" />
                          添加
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      <FactorySidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="px-8 pt-6 pb-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[22px] text-[#0d1b2a] mb-1" style={{ fontWeight: 500 }}>探索更多</h1>
            <p className="text-xs text-[#7d8da1]" style={{ fontWeight: 400 }}>发现和添加新的资源到你的工厂</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mb-6 border-b border-[#e2e8f0]">
            <button
              onClick={() => setActiveTab('agents')}
              className={`pb-3 px-1 text-sm transition-all relative flex items-center gap-2 ${
                activeTab === 'agents'
                  ? 'text-[#0d1b2a]'
                  : 'text-[#7d8da1] hover:text-[#4a5b73]'
              }`}
              style={{ fontWeight: activeTab === 'agents' ? 500 : 400 }}
            >
              <Bot className={`w-4 h-4 ${activeTab === 'agents' ? 'text-[#0d1b2a]' : 'text-[#a3b1c6]'}`} />
              <span>智能体</span>
              {activeTab === 'agents' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0d1b2a]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`pb-3 px-1 text-sm transition-all relative flex items-center gap-2 ${
                activeTab === 'tools'
                  ? 'text-[#0d1b2a]'
                  : 'text-[#7d8da1] hover:text-[#4a5b73]'
              }`}
              style={{ fontWeight: activeTab === 'tools' ? 500 : 400 }}
            >
              <Wrench className={`w-4 h-4 ${activeTab === 'tools' ? 'text-[#0d1b2a]' : 'text-[#a3b1c6]'}`} />
              <span>工具</span>
              {activeTab === 'tools' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0d1b2a]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`pb-3 px-1 text-sm transition-all relative flex items-center gap-2 ${
                activeTab === 'skills'
                  ? 'text-[#0d1b2a]'
                  : 'text-[#7d8da1] hover:text-[#4a5b73]'
              }`}
              style={{ fontWeight: activeTab === 'skills' ? 500 : 400 }}
            >
              <FileCode className={`w-4 h-4 ${activeTab === 'skills' ? 'text-[#0d1b2a]' : 'text-[#a3b1c6]'}`} />
              <span>技能</span>
              {activeTab === 'skills' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0d1b2a]" />
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3b1c6]" />
              <input
                type="text"
                placeholder="搜索资源..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white/70 backdrop-blur-xl border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0d1b2a]/30 transition-colors"
              />
            </div>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Link } from 'react-router';
import { 
  Bot, 
  Box, 
  Wrench, 
  BookOpen, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Database,
  MessageSquare,
  Code2,
  Sparkles,
  Zap,
  Users,
  Link as LinkIcon,
  FileCode,
  Workflow
} from 'lucide-react';
import { ModelConfigModal, ToolEditModal, SkillPreviewModal, SkillEditModal } from './DeveloperManagementModalComponents';

type TabType = 'agents' | 'models' | 'tools' | 'skills';

export function DeveloperManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('agents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentCategories, setSelectedAgentCategories] = useState<string[]>(['全部']);
  const [selectedToolCategories, setSelectedToolCategories] = useState<string[]>(['全部']);
  const [selectedSkillCategories, setSelectedSkillCategories] = useState<string[]>(['全部']);
  
  // Modal states
  const [showModelConfigModal, setShowModelConfigModal] = useState(false);
  const [showToolEditModal, setShowToolEditModal] = useState(false);
  const [showSkillPreviewModal, setShowSkillPreviewModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);

  // Mock data for models with state
  const [models, setModels] = useState([
    {
      id: 'model-1',
      name: 'GLM-4',
      apiKey: 'sk-glm-*********************',
      provider: '智谱AI',
      usedBy: 12,
      status: 'active'
    },
    {
      id: 'model-2',
      name: 'Qwen-72B',
      apiKey: 'sk-qw-*********************',
      provider: '通义千问',
      usedBy: 7,
      status: 'active'
    },
  ]);

  const handleAddModel = (modelData: any) => {
    setModels([...models, modelData]);
  };

  const tabs = [
    { id: 'agents' as TabType, label: '智能体', icon: Bot },
    { id: 'models' as TabType, label: '模型', icon: Box },
    { id: 'tools' as TabType, label: '工具', icon: Wrench },
    { id: 'skills' as TabType, label: '技能', icon: BookOpen },
  ];

  // Mock data for agents
  const mockAgents = [
    {
      id: 'agent-1',
      name: '智能客服助手',
      category: '客户服务',
      description: '提供24/7全天候智能客服支持，支持多轮对话和情感识别，可自动处理常见问题并智能转接人工客服',
      icon: '🤖',
      usedBy: 15,
      status: 'active',
      version: 'v2.1.0',
      scenes: ['电商客服', '金融咨询', '技术支持', '售后服务']
    },
    {
      id: 'agent-2',
      name: '数据分析专家',
      category: '数据分析',
      description: '专业的数据分析和可视化服务，支持多种数据源接入，提供智能洞察和预测分析功能，生成精美图表报告',
      icon: '📊',
      usedBy: 8,
      status: 'active',
      version: 'v1.5.3',
      scenes: ['财务分析', '运营数据', '市场研究']
    },
  ];

  // Mock data for tools
  const mockTools = [
    {
      id: 'tool-1',
      name: '天气查询API',
      icon: '🌤️',
      category: 'MCP',
      description: '实时天气数据查询服务',
      endpoint: 'https://api.weather.com/v1',
      usedBy: 5
    },
    {
      id: 'tool-2',
      name: '数据库连接器',
      icon: '🗄️',
      category: '数据库',
      description: 'MySQL/PostgreSQL数据库连接工具',
      endpoint: 'https://db.service.com/connect',
      usedBy: 8
    },
    {
      id: 'tool-3',
      name: '邮件通知插件',
      icon: '📧',
      category: '插件',
      description: '企业级邮件发送和通知服务',
      endpoint: 'https://mail.service.com/api',
      usedBy: 12
    },
  ];

  // Mock data for skills
  const mockSkills = [
    {
      id: 'skill-1',
      name: 'SQL查询技能',
      iconName: 'Database',
      iconColor: 'from-blue-500 to-cyan-600',
      category: '数据处理',
      description: '执行复杂的SQL查询和数据操作',
      markdownContent: '# SQL查询技能\n\n支持复杂的SQL查询操作...'
    },
    {
      id: 'skill-2',
      name: '自然语言处理',
      iconName: 'MessageSquare',
      iconColor: 'from-green-500 to-emerald-600',
      category: '文本处理',
      description: '高级的NLP文本分析能力',
      markdownContent: '# NLP技能\n\n提供文本分析、情感识别...'
    },
  ];

  const agentCategories = ['全部', '客户服务', '数据分析', '内容创作', '开发辅助'];
  const toolCategories = ['全部', 'MCP', '数据库', '插件'];
  const skillCategories = ['全部', '数据处理', '文本处理', '图像处理', '音频处理'];

  const renderContent = () => {
    switch (activeTab) {
      case 'agents':
        return <AgentsContent 
          searchQuery={searchQuery}
          agents={mockAgents}
          categories={agentCategories}
          selectedCategories={selectedAgentCategories}
          setSelectedCategories={setSelectedAgentCategories}
        />;
      case 'models':
        return <ModelsContent 
          searchQuery={searchQuery}
          models={models}
          onAddModel={handleAddModel}
        />;
      case 'tools':
        return <ToolsContent 
          searchQuery={searchQuery}
          tools={mockTools}
          categories={toolCategories}
          selectedCategories={selectedToolCategories}
          setSelectedCategories={setSelectedToolCategories}
        />;
      case 'skills':
        return <SkillsContent 
          searchQuery={searchQuery}
          skills={mockSkills}
          categories={skillCategories}
          selectedCategories={selectedSkillCategories}
          setSelectedCategories={setSelectedSkillCategories}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-[#e2e8f0]">
        <div className="px-8 py-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-[28px] mb-2 text-[#191919]" style={{ fontWeight: 300 }}>开发资源管理</h1>
              <p className="text-[#999] text-sm">统一管理平台基础能力资源</p>
            </div>
            <Link
              to="/docs"
              className="flex items-center gap-2 px-4 py-2 text-[#4a5b73] hover:text-[#0d1b2a] hover:bg-[#edf1f8] rounded-lg transition-colors border border-[#e2e8f0]"
            >
              <BookOpen className="w-4 h-4" />
              <span>开发者文档</span>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-[#e2e8f0]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    isActive
                      ? 'border-[#191919] text-[#191919]'
                      : 'border-transparent text-[#999] hover:text-[#666] hover:border-[#ccc]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#191919]' : 'text-[#ccc]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {renderContent()}
      </div>

      {/* Model Config Modal */}
      {showModelConfigModal && (
        <ModelConfigModal 
          model={selectedModel} 
          onClose={() => setShowModelConfigModal(false)}
        />
      )}

      {/* Tool Edit Modal */}
      {showToolEditModal && (
        <ToolEditModal 
          tool={selectedTool} 
          onClose={() => setShowToolEditModal(false)}
        />
      )}

      {/* Skill Preview Modal */}
      {showSkillPreviewModal && (
        <SkillPreviewModal 
          skill={selectedSkill} 
          onClose={() => setShowSkillPreviewModal(false)}
        />
      )}
    </div>
  );
}

// Agents Content Component
function AgentsContent({ searchQuery, agents, categories, selectedCategories, setSelectedCategories }: any) {
  const toggleCategory = (category: string) => {
    if (category === '全部') {
      setSelectedCategories(['全部']);
    } else {
      let newCategories = selectedCategories.filter((c: string) => c !== '全部');
      if (newCategories.includes(category)) {
        newCategories = newCategories.filter((c: string) => c !== category);
      } else {
        newCategories.push(category);
      }
      setSelectedCategories(newCategories.length === 0 ? ['全部'] : newCategories);
    }
  };

  const filteredAgents = agents.filter((agent: any) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.includes('全部') || selectedCategories.includes(agent.category);
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Search Box */}
      <div className="mb-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索智体名称、描述..."
            value={searchQuery}
            onChange={(e) => {}}
            className="w-full pl-10 pr-20 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors">
            搜索
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className="w-40 flex-shrink-0">
          <div className="bg-white rounded-lg p-4 border border-gray-200/60 sticky top-6 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm text-gray-900">智能体分类</h3>
                <button
                  onClick={() => setSelectedCategories(['全部'])}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  重置
                </button>
              </div>
              <div className="space-y-1">
                {categories.map((category: string) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer group py-1">
                    <div className="flex-shrink-0">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        selectedCategories.includes(category)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 bg-white group-hover:border-gray-400'
                      }`}>
                        {selectedCategories.includes(category) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm transition-colors ${
                      selectedCategories.includes(category)
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

        {/* Agents Grid */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-gray-600">
            共找到 <span className="font-semibold text-gray-900">{filteredAgents.length}</span> 个智能体
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {filteredAgents.map((agent: any) => (
              <Link
                key={agent.id}
                to={`/marketplace/${agent.id}`}
                className="group bg-white rounded-lg border border-gray-200/60 hover:border-gray-300 hover:shadow-md transition-all duration-200 flex flex-col h-full relative p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-end gap-2 min-w-0 flex-1">
                    <h3 className="font-medium text-base text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {agent.name}
                    </h3>
                    <span className="text-xs text-gray-400 pb-0.5 flex-shrink-0">{agent.version}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-2 flex-1">
                  {agent.scenes?.map((scene: string) => (
                    <span
                      key={scene}
                      className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded border border-gray-200/50 h-fit"
                    >
                      {scene}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100/80 mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                        A
                      </div>
                      <span className="text-xs text-gray-500">管理员</span>
                    </div>
                    <span className="text-xs text-gray-400">2024/01/20</span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // 移除逻辑
                    }}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    移除
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Models Content Component
function ModelsContent({ searchQuery, models, onAddModel }: any) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  const handleAddModel = (modelData: any) => {
    if (onAddModel) {
      onAddModel(modelData);
    }
    setShowAddModal(false);
  };

  return (
    <>
      {/* Header with search and button */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          共找到 <span className="font-semibold text-gray-900">{models.length}</span> 个模型
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          新增模型
        </button>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-3 gap-6">
        {models.map((model: any) => (
          <div
            key={model.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-200 hover:shadow-lg transition-all group relative overflow-hidden"
          >
            {/* Background Gradient Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -z-0" />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Header */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">{model.name}</h3>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      model.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {model.status === 'active' ? '可用' : '异常'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">AI 语言模型</p>
              </div>

              {/* API Key */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-600 mb-2">API密钥</div>
                <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg px-3 py-2.5 font-mono text-xs text-gray-700 border border-gray-200 truncate">
                  {model.apiKey.substring(0, 20)}...
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Users className="w-4 h-4" />
                <span>{model.usedBy} 个智能体在用</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setSelectedModel(model);
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-4 py-2.5 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all flex items-center justify-center gap-2 font-medium border border-purple-200"
                >
                  <Edit3 className="w-4 h-4" />
                  编辑配置
                </button>
                <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Model Modal */}
      {showAddModal && (
        <ModelConfigModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleAddModel}
        />
      )}

      {/* Edit Model Modal */}
      {showEditModal && selectedModel && (
        <ModelConfigModal 
          model={selectedModel}
          onClose={() => {
            setShowEditModal(false);
            setSelectedModel(null);
          }}
          onSave={handleAddModel}
        />
      )}
    </>
  );
}

// Tools Content Component
function ToolsContent({ searchQuery, tools, categories, selectedCategories, setSelectedCategories }: any) {
  const toggleCategory = (category: string) => {
    if (category === '全部') {
      setSelectedCategories(['全部']);
    } else {
      let newCategories = selectedCategories.filter((c: string) => c !== '全部');
      if (newCategories.includes(category)) {
        newCategories = newCategories.filter((c: string) => c !== category);
      } else {
        newCategories.push(category);
      }
      setSelectedCategories(newCategories.length === 0 ? ['全部'] : newCategories);
    }
  };

  const filteredTools = tools.filter((tool: any) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.includes('全部') || selectedCategories.includes(tool.category);
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Search Box */}
      <div className="mb-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索工具名称、描述..."
            value={searchQuery}
            onChange={(e) => {}}
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
                  onClick={() => setSelectedCategories(['全部'])}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  重置
                </button>
              </div>
              <div className="space-y-1">
                {categories.map((category: string) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer group py-1">
                    <div className="flex-shrink-0">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        selectedCategories.includes(category)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 bg-white group-hover:border-gray-400'
                      }`}>
                        {selectedCategories.includes(category) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm transition-colors ${
                      selectedCategories.includes(category)
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
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              共找到 <span className="font-semibold text-gray-900">{filteredTools.length}</span> 个工具
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              新增工具
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {filteredTools.map((tool: any) => (
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
                  
                  {/* Endpoint */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>连接链接</span>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg px-3 py-2 font-mono text-xs text-gray-700 border border-gray-200 truncate">
                      {tool.endpoint}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Users className="w-4 h-4" />
                    <span>{tool.usedBy} 个智能体在用</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="flex-1 px-4 py-2.5 text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all flex items-center justify-center gap-2 font-medium border border-orange-200">
                      <Edit3 className="w-4 h-4" />
                      编辑
                    </button>
                    <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Skills Content Component
function SkillsContent({ searchQuery, skills, categories, selectedCategories, setSelectedCategories }: any) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    if (category === '全部') {
      setSelectedCategories(['全部']);
    } else {
      let newCategories = selectedCategories.filter((c: string) => c !== '全部');
      if (newCategories.includes(category)) {
        newCategories = newCategories.filter((c: string) => c !== category);
      } else {
        newCategories.push(category);
      }
      setSelectedCategories(newCategories.length === 0 ? ['全部'] : newCategories);
    }
  };

  const filteredSkills = skills.filter((skill: any) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.includes('全部') || selectedCategories.includes(skill.category);
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Search Box */}
      <div className="mb-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索技能名称、描述..."
            value={searchQuery}
            onChange={(e) => {}}
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
                  onClick={() => setSelectedCategories(['全部'])}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  重置
                </button>
              </div>
              <div className="space-y-1">
                {categories.map((category: string) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer group py-1">
                    <div className="flex-shrink-0">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        selectedCategories.includes(category)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 bg-white group-hover:border-gray-400'
                      }`}>
                        {selectedCategories.includes(category) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm transition-colors ${
                      selectedCategories.includes(category)
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
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              共找到 <span className="font-semibold text-gray-900">{filteredSkills.length}</span> 个技能
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              新增技能
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {filteredSkills.map((skill: any) => {
              const iconMap = {
                Database,
                MessageSquare,
                Code2,
                BookOpen
              };
              const SkillIcon = iconMap[skill.iconName as keyof typeof iconMap];
              
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
                    
                    {/* Markdown Preview */}
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
                        <FileCode className="w-3.5 h-3.5" />
                        <span>代码内容预览</span>
                      </div>
                      <div 
                        onClick={() => setExpandedSkillId(expandedSkillId === skill.id ? null : skill.id)}
                        className="bg-gradient-to-r from-gray-50 to-cyan-50 rounded-lg px-3 py-2.5 border border-gray-200 cursor-pointer hover:border-cyan-300 transition-all"
                      >
                        <pre className={`text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed ${
                          expandedSkillId === skill.id ? '' : 'line-clamp-3'
                        }`}>
                          {skill.markdownContent}
                        </pre>
                        {expandedSkillId !== skill.id && (
                          <div className="text-xs text-cyan-600 mt-1 font-medium">点击展开...</div>
                        )}
                        {expandedSkillId === skill.id && (
                          <div className="text-xs text-cyan-600 mt-1 font-medium">点击收起</div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedSkill(skill);
                          setShowEditModal(true);
                        }}
                        className="flex-1 px-4 py-2.5 text-cyan-700 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-all flex items-center justify-center gap-2 font-medium border border-cyan-200"
                      >
                        <Edit3 className="w-4 h-4" />
                        编辑
                      </button>
                      <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5">
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Skill Modal */}
      {showEditModal && selectedSkill && (
        <SkillEditModal 
          skill={selectedSkill}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSkill(null);
          }}
        />
      )}
    </>
  );
}
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Search,
  BookOpen,
  ChevronDown,
  Sparkles,
  MessageSquare,
  Terminal,
  X,
  Loader2,
} from 'lucide-react';
import { mockAgents } from '../../data/mockData';
import { AgentCard } from '../AgentCard';

type AgentStatus = 'all' | 'normal' | 'error' | 'upgrade';
type PublishStatus = 'published' | 'draft' | 'installed';
type SearchType = 'agent' | 'model' | 'skill' | 'tool';

// 词库数据
const searchDictionary = {
  agent: ['信用智能体', '舆情智能体', '粮食产量预测', '粮食价格预测', '国际干散货海运运价研报', '库存智能分析', '装港风险预警', '价格预测', '供应分析', '供需平衡', '公路段货找车', '公路段车找货', '全球气象', '信息监测'],
  model: ['智链大模型', '气象大模型', '舆情大模型', '美国粮食产量预测模型', '巴西粮食产量预测模型', 'CBOT大豆价格预测模型', '铁矿石期货价格预测模型', '铁矿石供应预测模型', '铁矿石需求预测模型', '公路段智能匹配模型', '国际干散货海运运价预测模型'],
  skill: ['价格预测', '供需分析', '风险预警', '研报生成', '舆情分析', '库存管理', '物流匹配', '气象预测'],
  tool: ['企业征信API', '期货行情API', 'AIS船舶追踪', '气象数据接口', '供应链数据库', '遥感数据API', 'USDA报告解析', '港口作业系统', '无人机数据接口'],
};

const searchTypeLabels = {
  agent: '智能体',
  model: '模型',
  skill: '技能',
  tool: '工具',
};

export function MonitoringCenterPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<AgentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('published');
  const [searchType, setSearchType] = useState<SearchType>('agent');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCLIDialog, setShowCLIDialog] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理搜索输入变化，自动匹配建议
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (value.trim()) {
      const matches = searchDictionary[searchType].filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 选择建议项
  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  // 根据publishStatus、statusFilter和搜索条件筛选智能体
  const filteredAgents = mockAgents.filter(agent => {
    // 首先按发布状态筛选
    if (agent.publishStatus !== publishStatus) return false;
    
    // 然后按状态筛选器筛选（仅对已上线和已安装的智能体）
    if (publishStatus !== 'draft') {
      if (statusFilter === 'error') {
        return agent.successRate !== undefined && agent.successRate < 95;
      }
      if (statusFilter === 'upgrade') {
        return agent.status === 'upgrade';
      }
    }
    
    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      switch (searchType) {
        case 'agent':
          return agent.name.toLowerCase().includes(query);
        case 'model':
          return agent.models?.some(model => model.toLowerCase().includes(query)) || false;
        case 'skill':
          return agent.tags.some(tag => tag.toLowerCase().includes(query));
        case 'tool':
          return agent.tools?.some(tool => tool.toLowerCase().includes(query)) || false;
        default:
          return true;
      }
    }
    
    return true;
  });

  const globalMetrics = [
    { label: '智能体总数', value: '15', icon: Activity, color: 'blue', onClick: null },
    { label: '活跃智能体', value: '13', icon: TrendingUp, color: 'green', onClick: null },
    { label: '任务成功率', value: '95.2%', icon: CheckCircle2, color: 'emerald', onClick: null },
    { label: '调用异常', value: '2', icon: AlertTriangle, color: 'red', onClick: () => {
      setPublishStatus('published');
      setStatusFilter('error');
    }},
    { label: '待升级', value: '2', icon: AlertTriangle, color: 'amber', onClick: () => {
      setPublishStatus('published');
      setStatusFilter('upgrade');
    }},
  ];

  const getStatusBadge = (agent: any) => {
    // 草稿箱状态
    if (agent.publishStatus === 'draft') {
      return { bg: 'bg-gray-100', text: 'text-gray-700', label: '未上架' };
    }
    // 其他状态
    if (agent.status === 'upgrade') {
      return { bg: 'bg-amber-100', text: 'text-amber-700', label: '待升级' };
    }
    if (!agent.successRate || agent.successRate >= 95) {
      return { bg: 'bg-green-100', text: 'text-green-700', label: '正常' };
    }
    return { bg: 'bg-red-100', text: 'text-red-700', label: '异常' };
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] mb-2 text-[#191919]" style={{ fontWeight: 300 }}>智能体管理</h1>
          <p className="text-[#999] text-sm">实时掌控智能体整体运行健康度</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/docs"
            className="p-2.5 text-[#4a5b73] hover:text-[#0d1b2a] hover:bg-[#edf1f8] rounded-lg transition-colors border border-[#e2e8f0]"
            title="开发者文档"
          >
            <BookOpen className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0d1b2a] text-white rounded-lg hover:bg-[#1b2d45] transition-all font-medium"
          >
            <Sparkles className="w-4 h-4" />
            <span>新建智能体</span>
          </button>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {globalMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              onClick={metric.onClick || undefined}
              className={`bg-white rounded-lg p-6 border border-gray-200/60 hover:shadow-md transition-all shadow-sm ${
                metric.onClick ? 'cursor-pointer hover:border-gray-300' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-md bg-${metric.color}-50 border border-${metric.color}-100/50`}>
                  <Icon className={`w-5 h-5 text-${metric.color}-600`} />
                </div>
              </div>
              <p className="text-base font-medium text-gray-600 mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="flex items-center w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            
            {/* 类型选择器 - 固定宽度，作为输入框的一部分 */}
            <div className="absolute left-11 top-1/2 -translate-y-1/2 z-10" ref={typeDropdownRef}>
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded transition-colors w-[95px] justify-between"
              >
                <span className="text-sm">{searchTypeLabels[searchType]}</span>
                <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
              </button>
              
              {showTypeDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-[115px] py-1 z-50">
                  {(Object.keys(searchTypeLabels) as SearchType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSearchType(type);
                        setShowTypeDropdown(false);
                        setSearchQuery('');
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        searchType === type ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {searchTypeLabels[type]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* 垂直分割线 */}
            <div className="absolute left-[130px] top-1/2 -translate-y-1/2 h-5 w-px bg-gray-300 pointer-events-none z-10" />
            
            <input
              type="text"
              placeholder={`搜索${searchTypeLabels[searchType]}...`}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim() && suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className="w-full pl-[148px] pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            />
          </div>
          
          {/* 自动建议下拉 */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-900">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setPublishStatus('published')}
            className={`pb-4 text-base transition-all relative ${
              publishStatus === 'published'
                ? 'text-[#191919]'
                : 'text-[#999] hover:text-[#666]'
            }`}
          >
            已上线
            {publishStatus === 'published' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#191919]" />
            )}
          </button>
          <button
            onClick={() => setPublishStatus('draft')}
            className={`pb-4 text-base transition-all relative ${
              publishStatus === 'draft'
                ? 'text-[#191919]'
                : 'text-[#999] hover:text-[#666]'
            }`}
          >
            草稿箱
            {publishStatus === 'draft' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#191919]" />
            )}
          </button>
          <button
            onClick={() => setPublishStatus('installed')}
            className={`pb-4 text-base transition-all relative ${
              publishStatus === 'installed'
                ? 'text-[#191919]'
                : 'text-[#999] hover:text-[#666]'
            }`}
          >
            我安装的
            {publishStatus === 'installed' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#191919]" />
            )}
          </button>
        </div>
      </div>

      {/* Status Filter Tags - Below tabs, only show for 'published' and 'installed' tabs */}
      {publishStatus !== 'draft' && (
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setStatusFilter(statusFilter === 'error' ? 'all' : 'error')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm ${
              statusFilter === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            调用异常
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 'upgrade' ? 'all' : 'upgrade')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm ${
              statusFilter === 'upgrade'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            待升级
          </button>
        </div>
      )}

      {/* Agent Monitoring - Card View */}
      <div className="grid grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <AgentCard 
            key={agent.id} 
            agent={agent} 
            showMonitoringMetrics={true}
            showSuccessRate={publishStatus !== 'installed'}
          />
        ))}
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">创建智能体</h2>
              </div>
              <p className="text-gray-500 mt-2">选择您喜欢的方式来创建智能体</p>
            </div>

            {/* Options */}
            <div className="p-8 space-y-4">
              {/* Natural Language Option */}
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  navigate('/super-factory');
                }}
                className="w-full group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-blue-500 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 p-6 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      通过自然语言生成
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      使用对话式交互，通过自然语言描述您的需求，AI将自动为您构建智能体工作流。适合快速原型设计和探索性开发。
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 font-medium">
                      <span>推荐使用</span>
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>

              {/* CLI Tool Option */}
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowCLIDialog(true);
                }}
                className="w-full group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-purple-500 bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 p-6 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <Terminal className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      通过CLI工具生成
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      使用命令行界面工具，通过代码和配置文件精确定义智能体。适合有开发经验的用户和需要版本控制的场景。
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-purple-600 font-medium">
                      <span>适合开发者</span>
                      <Terminal className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                💡 提示：创建后可随时在智能体管理页面中查看和编辑
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CLI Dialog */}
      {showCLIDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowCLIDialog(false);
            }}
          />
          
          {/* Dialog Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg animate-pulse">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">正在打开CLI工具...</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-slate-900 rounded-lg p-4 mb-4 font-mono text-sm">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Initializing CLI environment...</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span>Loading agent templates...</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span>Connecting to workspace...</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                CLI工具正在启动中，请稍候。完成后将自动打开终端窗口。
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowCLIDialog(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-medium shadow-lg shadow-purple-500/30"
                  disabled
                >
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>启动中</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                💡 首次启动可能需要较长时间
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { Search, Plus, Eye, Edit3, Upload, Trash2, Filter, AlertTriangle, Activity, Users, X, TrendingUp, CheckCircle2 } from 'lucide-react';
import svgPaths from '../imports/svg-6oflhgsgne';
import { mockAgents } from '../../data/mockData';

type AgentStatus = 'published' | 'draft' | 'installed';

export function AgentManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AgentStatus>('published');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState('7'); // 新增：时间范围状态

  const statusTabs = [
    { value: 'published' as AgentStatus, label: '已上线' },
    { value: 'draft' as AgentStatus, label: '草稿箱' },
    { value: 'installed' as AgentStatus, label: '我安装的' },
  ];

  const toggleAgentSelection = (id: string) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: string, publishStatus: string, successRate?: number) => {
    // 草稿箱状态优先级最高
    if (publishStatus === 'draft') {
      return (
        <span className="px-2 py-1 rounded text-xs bg-gray-50 text-gray-700 border border-gray-300 font-medium">
          未上架
        </span>
      );
    }
    if (status === 'upgrade') {
      return (
        <span className="px-2 py-1 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200/50 font-medium">
          待升级
        </span>
      );
    }
    if (successRate !== undefined && successRate < 95) {
      return (
        <span className="px-2 py-1 rounded text-xs bg-red-50 text-red-700 border border-red-200/50 font-medium">
          调用异常
        </span>
      );
    }
    // 不显示正常标签
    return null;
  };

  return (
    <div className="p-8">
      {/* 事件提醒提示条和时间范围筛选器 */}
      <div className="mb-4 flex items-center justify-between bg-amber-50/70 border border-amber-200/60 rounded-lg px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-800">
            有 <span className="font-semibold">2</span> 个智能体需要升级
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">时间范围：</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1">最近1天</option>
            <option value="7">最近7天</option>
            <option value="30">最近30天</option>
            <option value="90">最近90天</option>
            <option value="all">全部</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-semibold mb-2 text-gray-900">智能体管理</h1>
        <p className="text-gray-500">统一管理企业内所有智能体资产</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-6 mb-6 border-b border-gray-200">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedStatus(tab.value)}
            className={`pb-3 px-1 text-sm font-medium transition-all relative ${
              selectedStatus === tab.value
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {selectedStatus === tab.value && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* Data Dashboard - Only for published tab - POSITIONED AFTER TABS */}
      {selectedStatus === 'published' && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          {/* 智能体总数 */}
          <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">智能体总数</p>
            <p className="text-3xl font-semibold text-gray-900">15</p>
          </div>
          
          {/* 活跃智能体 */}
          <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">活跃智能体</p>
            <p className="text-3xl font-semibold text-gray-900">13</p>
          </div>
          
          {/* 任务成功率 */}
          <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">任务成功率</p>
            <p className="text-3xl font-semibold text-gray-900">95.2%</p>
          </div>
          
          {/* 调用异常 */}
          <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">调用异常</p>
            <p className="text-3xl font-semibold text-gray-900">2</p>
          </div>
          
          {/* 待升级 */}
          <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">待升级</p>
            <p className="text-3xl font-semibold text-gray-900">2</p>
          </div>
        </div>
      )}

      {/* Top Actions */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索智能体名称、ID、标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors"
              title="清空搜索"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-sm transition-colors">
          <Plus className="w-4.5 h-4.5" />
          新建智能体
        </button>
        {selectedAgents.length > 0 && (
          <div className="flex gap-2">
            <button className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
              批量发布
            </button>
            <button className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
              批量下架
            </button>
            <button className="px-4 py-2.5 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 font-medium transition-colors">
              批量删除
            </button>
          </div>
        )}
      </div>

      {/* Agent Grid */}
      <div>
        {(() => {
          const filteredAgents = mockAgents.filter((agent) => {
            // 根据selectedStatus筛选
            if (selectedStatus === 'published') return agent.publishStatus === 'published';
            if (selectedStatus === 'draft') return agent.publishStatus === 'draft';
            if (selectedStatus === 'installed') return agent.creator.name !== '第三方开发者' && agent.creator.name !== '效率工具团队';
            return true;
          });

          if (filteredAgents.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-1">未找到相关智能体</p>
                <p className="text-sm text-gray-500">请尝试调整筛选条件</p>
              </div>
            );
          }

          return (
            <>
              <div className="grid grid-cols-4 gap-6">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`bg-white rounded-[10px] p-4 border transition-all hover:shadow-md flex flex-col ${
                      selectedAgents.includes(agent.id)
                        ? 'border-blue-400 bg-blue-50/30 shadow-sm'
                        : agent.status === 'upgrade'
                        ? 'border-amber-200/80 bg-amber-50/10'
                        : (agent.successRate !== undefined && agent.successRate < 95)
                        ? 'border-red-200/80 bg-red-50/10'
                        : 'border-[rgba(229,231,235,0.8)] hover:border-gray-300'
                    }`}
                  >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <input
                    type="checkbox"
                    checked={selectedAgents.includes(agent.id)}
                    onChange={() => toggleAgentSelection(agent.id)}
                    className="w-4.5 h-4.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-gray-50 rounded-md transition-colors">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-50 rounded-md transition-colors">
                      <Edit3 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1.5 hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-col gap-3 flex-1">
                  {/* Title and Version Row */}
                  <div className="flex items-end gap-2">
                    <h3 className="font-medium text-lg text-[#101828]">{agent.name}</h3>
                    <span className="text-sm text-[#99a1af] pb-0.5">{agent.version}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {agent.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-[#f3f4f6] text-[#4a5565] text-sm rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {agent.tags.length > 2 && (
                      <span className="px-3 py-1 bg-[#f3f4f6] text-[#99a1af] text-sm rounded">
                        +{agent.tags.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#6a7282] line-clamp-2">
                    {agent.description}
                  </p>
                </div>

                {/* Models and Tools */}
                {(agent.models || agent.tools) && (
                  <div className="flex flex-col gap-3 mt-3">
                    {agent.models && agent.models.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-[#99a1af]">行业模型</p>
                        <div className="flex flex-wrap gap-2">
                          {agent.models.map((model) => (
                            <span key={model} className="px-3 py-1 bg-[#eff6ff] text-[#1447e6] text-sm rounded font-medium">
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {agent.tools && agent.tools.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-[#99a1af]">工具</p>
                        <div className="flex flex-wrap gap-2">
                          {agent.tools.map((tool) => (
                            <span key={tool} className="px-3 py-1 bg-[#f3f4f6] text-[#4a5565] text-sm rounded">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Badge */}
                <div className="mt-3">
                  {getStatusBadge(agent.status, agent.publishStatus, agent.successRate)}
                </div>
              </div>
            ))}
          </div>

            {/* Pagination */}
            {filteredAgents.length > 0 && (
              <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                显示 <span className="font-medium text-gray-900">1-9</span> 共{' '}
                <span className="font-medium text-gray-900">15</span> 个智能体
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors">
                  上一页
                </button>
                <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium shadow-sm">1</button>
                <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors">
                  2
                </button>
                <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors">
                  下一页
                </button>
              </div>
            </div>
            )}
          </>
          );
        })()}
    </div>
  );
}
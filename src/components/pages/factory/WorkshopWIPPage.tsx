import { FactorySidebar } from '../../FactorySidebar';
import { Sparkles, Plus, Activity, Zap, ArrowRight, Clock, MoreHorizontal, Edit3, Trash2, Copy } from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockAgents } from '../../../data/mockData';
import { useState } from 'react';

export function WorkshopWIPPage() {
  const navigate = useNavigate();
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const draftAgents = mockAgents.filter(agent => agent.publishStatus === 'draft');

  // Mock last edited times
  const lastEditedMap: Record<string, string> = {
    'draft-1': '10 分钟前',
    'draft-2': '2 小时前',
    'draft-3': '昨天 16:30',
  };

  // Mock completion percentages
  const completionMap: Record<string, number> = {
    'draft-1': 85,
    'draft-2': 42,
    'draft-3': 68,
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      <FactorySidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="px-8 pt-6 pb-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-[22px] text-[#191919] mb-1" style={{ fontWeight: 300 }}>制造车间</h1>
              <p className="text-xs text-[#999]">制造中的智能体与草稿管理</p>
            </div>
            <button
              onClick={() => navigate('/factory/workshop/editor/new')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0d1b2a] text-white rounded-md text-sm hover:bg-[#1b2d45] transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建智能体
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: '草稿总数', value: draftAgents.length.toString() },
              { label: '今日编辑', value: '2' },
              { label: '待发布', value: '1' },
              { label: '平均完成度', value: Math.round(Object.values(completionMap).reduce((a, b) => a + b, 0) / Object.values(completionMap).length) + '%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] px-4 py-4 hover:border-[#cbd5e1] transition-colors">
                <p className="text-xs text-[#999] mb-2">{stat.label}</p>
                <span className="text-2xl text-[#191919] tracking-tight" style={{ fontWeight: 300 }}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Draft Agents */}
          {draftAgents.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] flex flex-col items-center justify-center py-20">
              <div className="w-14 h-14 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#ccc]" />
              </div>
              <p className="text-sm text-[#999] mb-1">暂无草稿</p>
              <p className="text-xs text-[#ccc] mb-4">开始创建你的第一个智能体</p>
              <button
                onClick={() => navigate('/factory/workshop/editor/new')}
                className="flex items-center gap-2 px-4 py-2 bg-[#191919] text-white rounded-md text-sm hover:bg-[#333] transition-colors"
              >
                <Plus className="w-4 h-4" />
                新建智能体
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* List Header */}
              <div className="grid grid-cols-12 px-5 py-2 text-[11px] text-[#ccc] uppercase tracking-wider">
                <div className="col-span-4">名称</div>
                <div className="col-span-2">完成度</div>
                <div className="col-span-2">模型 / 工具</div>
                <div className="col-span-2">最近编辑</div>
                <div className="col-span-2 text-right">操作</div>
              </div>

              {draftAgents.map((agent) => {
                const isHovered = hoveredAgent === agent.id;
                const completion = completionMap[agent.id] || 0;
                const lastEdited = lastEditedMap[agent.id] || '未知';

                return (
                  <div
                    key={agent.id}
                    className="group bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm hover:shadow-[#0d1b2a]/[0.03] transition-all duration-200"
                    onMouseEnter={() => setHoveredAgent(agent.id)}
                    onMouseLeave={() => { setHoveredAgent(null); setMenuOpen(null); }}
                  >
                    <div className="grid grid-cols-12 items-center px-5 py-4">
                      {/* Name & Description */}
                      <div className="col-span-4 min-w-0 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#f5f5f5] rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                            {agent.icon || '🤖'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-baseline gap-2">
                              <h3 className="text-sm text-[#191919] truncate">{agent.name}</h3>
                              <span className="text-[11px] text-[#ccc] flex-shrink-0">{agent.version}</span>
                            </div>
                            <p className="text-[11px] text-[#999] truncate mt-0.5">{agent.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Completion */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 max-w-[80px] h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#191919] rounded-full transition-all"
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#999] tabular-nums">{completion}%</span>
                        </div>
                      </div>

                      {/* Model / Tools */}
                      <div className="col-span-2">
                        <div className="flex flex-wrap gap-1">
                          {agent.models?.slice(0, 1).map((m) => (
                            <span key={m} className="px-1.5 py-0.5 bg-[#f5f5f5] text-[#666] text-[11px] rounded">{m}</span>
                          ))}
                          {agent.tools && agent.tools.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-[#f5f5f5] text-[#999] text-[11px] rounded">
                              {agent.tools.length} 工具
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Last Edited */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-1.5 text-xs text-[#999]">
                          <Clock className="w-3 h-3 text-[#ccc]" />
                          {lastEdited}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/factory/workshop/editor/${agent.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#191919] text-white rounded text-xs hover:bg-[#333] transition-colors"
                        >
                          继续编辑
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        
                        {/* More menu */}
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpen(menuOpen === agent.id ? null : agent.id)}
                            className={`p-1.5 rounded transition-all ${isHovered ? 'opacity-100' : 'opacity-0'} hover:bg-[#f5f5f5]`}
                          >
                            <MoreHorizontal className="w-4 h-4 text-[#999]" />
                          </button>
                          
                          {menuOpen === agent.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white/90 backdrop-blur-xl rounded-xl border border-[#e2e8f0] shadow-lg shadow-[#0d1b2a]/[0.06] py-1 z-10 min-w-[120px]">
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#666] hover:bg-[#f5f5f5] transition-colors">
                                <Copy className="w-3.5 h-3.5" />
                                复制
                              </button>
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#c7000b] hover:bg-[#fef2f2] transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                                删除
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
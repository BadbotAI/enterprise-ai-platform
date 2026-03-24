import { FactorySidebar } from '../../FactorySidebar';
import { useState } from 'react';
import { Search, TrendingUp, Eye, Edit3, X, CheckCircle2, ArrowUp, Loader2, Clock, Zap, RotateCcw } from 'lucide-react';
import { mockAgents } from '../../../data/mockData';

type UpgradeStatus = 'pending' | 'upgrading' | 'completed';

interface AgentWithUpgradeStatus {
  id: string;
  upgradeStatus: UpgradeStatus;
  upgradeProgress?: number;
}

export function UpgradePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<UpgradeStatus>('pending');
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  
  const [agentUpgradeStates, setAgentUpgradeStates] = useState<AgentWithUpgradeStatus[]>([
    { id: '1', upgradeStatus: 'pending' },
    { id: '2', upgradeStatus: 'pending' },
    { id: '3', upgradeStatus: 'pending' },
    { id: '4', upgradeStatus: 'pending' },
    { id: '5', upgradeStatus: 'upgrading', upgradeProgress: 45 },
    { id: '6', upgradeStatus: 'upgrading', upgradeProgress: 78 },
    { id: '7', upgradeStatus: 'completed' },
    { id: '8', upgradeStatus: 'completed' },
    { id: '9', upgradeStatus: 'completed' },
  ]);

  const handleUpgrade = (agentId: string) => {
    setAgentUpgradeStates(prev => {
      const existing = prev.find(a => a.id === agentId);
      if (existing) {
        return prev.map(a => a.id === agentId ? { ...a, upgradeStatus: 'upgrading' as UpgradeStatus, upgradeProgress: 0 } : a);
      }
      return [...prev, { id: agentId, upgradeStatus: 'upgrading' as UpgradeStatus, upgradeProgress: 0 }];
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setAgentUpgradeStates(prev => prev.map(a => a.id === agentId ? { ...a, upgradeProgress: progress } : a));
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setAgentUpgradeStates(prev => prev.map(a => a.id === agentId ? { ...a, upgradeStatus: 'completed' as UpgradeStatus } : a));
        }, 500);
      }
    }, 300);
  };

  const getAgentUpgradeStatus = (agentId: string): UpgradeStatus | undefined => {
    return agentUpgradeStates.find(a => a.id === agentId)?.upgradeStatus;
  };

  const getAgentUpgradeProgress = (agentId: string): number => {
    return agentUpgradeStates.find(a => a.id === agentId)?.upgradeProgress || 0;
  };

  const pendingCount = agentUpgradeStates.filter(a => a.upgradeStatus === 'pending').length;
  const upgradingCount = agentUpgradeStates.filter(a => a.upgradeStatus === 'upgrading').length;
  const completedCount = agentUpgradeStates.filter(a => a.upgradeStatus === 'completed').length;

  const statusTabs = [
    { value: 'pending' as UpgradeStatus, label: '待升级', count: pendingCount, icon: Clock },
    { value: 'upgrading' as UpgradeStatus, label: '升级中', count: upgradingCount, icon: Zap },
    { value: 'completed' as UpgradeStatus, label: '已完成', count: completedCount, icon: CheckCircle2 },
  ];

  const filteredAgents = mockAgents.filter((agent) => {
    if (agent.publishStatus !== 'published') return false;
    const upgradeStatus = getAgentUpgradeStatus(agent.id);
    if (selectedStatus === 'pending') return !upgradeStatus || upgradeStatus === 'pending';
    if (selectedStatus === 'upgrading') return upgradeStatus === 'upgrading';
    if (selectedStatus === 'completed') return upgradeStatus === 'completed';
    return false;
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      <FactorySidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="px-8 pt-6 pb-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[22px] text-[#191919] mb-1" style={{ fontWeight: 300 }}>升级车间</h1>
            <p className="text-xs text-[#999]">智能体版本升级与能力优化</p>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {statusTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedStatus === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedStatus(tab.value)}
                  className={`text-left bg-white rounded-lg border px-5 py-4 transition-all duration-200 ${
                    isActive
                      ? 'border-[#0d1b2a] ring-1 ring-[#0d1b2a]/5'
                      : 'border-[#e2e8f0] hover:border-[#cbd5e1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs transition-colors ${isActive ? 'text-[#0d1b2a]' : 'text-[#7d8da1]'}`}>{tab.label}</p>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isActive ? 'bg-[#0d1b2a]' : 'bg-[#f5f5f5]'
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#bbb]'}`} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-[32px] tracking-tight ${
                      isActive && tab.value === 'pending' ? 'text-[#c7000b]' : 'text-[#191919]'
                    }`} style={{ fontWeight: 300 }}>
                      {tab.count}
                    </span>
                    <span className="text-xs text-[#ccc]">个</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc]" />
              <input
                type="text"
                placeholder="搜索智能体..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-white/70 backdrop-blur-xl border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0d1b2a]/30 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-[#ccc] hover:text-[#666]" />
                </button>
              )}
            </div>
            <span className="text-xs text-[#ccc]">{filteredAgents.length} 个结果</span>
          </div>

          {/* Agent Cards */}
          {filteredAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-14 h-14 rounded-full bg-[#f0f0f0] flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-[#ccc]" />
              </div>
              <p className="text-sm text-[#999] mb-1">暂无智能体</p>
              <p className="text-xs text-[#ccc]">
                {selectedStatus === 'pending' && '当前没有需要升级的智能体'}
                {selectedStatus === 'upgrading' && '当前没有正在升级的智能体'}
                {selectedStatus === 'completed' && '暂无已完成升级的智能体'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredAgents.map((agent) => {
                const upgradeStatus = getAgentUpgradeStatus(agent.id);
                const upgradeProgress = getAgentUpgradeProgress(agent.id);
                const isHovered = hoveredAgent === agent.id;

                return (
                  <div
                    key={agent.id}
                    className="group bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm hover:shadow-[#0d1b2a]/[0.03] transition-all duration-200 overflow-hidden"
                    onMouseEnter={() => setHoveredAgent(agent.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                  >
                    {/* Progress bar for upgrading state */}
                    {upgradeStatus === 'upgrading' && (
                      <div className="h-0.5 bg-[#f0f0f0]">
                        <div 
                          className="h-full bg-[#191919] transition-all duration-300"
                          style={{ width: `${upgradeProgress}%` }}
                        />
                      </div>
                    )}
                    {upgradeStatus !== 'upgrading' && <div className="h-0.5" />}

                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-baseline gap-2 min-w-0 flex-1">
                          <h3 className="text-[15px] text-[#191919] truncate">{agent.name}</h3>
                          <span className="text-xs text-[#ccc] flex-shrink-0">{agent.version}</span>
                        </div>
                        
                        <div className={`flex items-center gap-0.5 transition-opacity duration-150 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                          <button className="p-1.5 rounded hover:bg-[#f5f5f5] transition-colors">
                            <Eye className="w-3.5 h-3.5 text-[#999]" />
                          </button>
                          <button className="p-1.5 rounded hover:bg-[#f5f5f5] transition-colors">
                            <Edit3 className="w-3.5 h-3.5 text-[#999]" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#999] leading-relaxed line-clamp-2 mb-3 min-h-[32px]">
                        {agent.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {agent.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-[#f5f5f5] text-[#999] text-[11px] rounded">{tag}</span>
                        ))}
                      </div>

                      {/* Models */}
                      {agent.models && agent.models.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] mb-4">
                          <span className="text-[#ccc]">行业模型</span>
                          {agent.models.map((m) => (
                            <span key={m} className="px-1.5 py-0.5 bg-[#f5f5f5] text-[#666] rounded">{m}</span>
                          ))}
                        </div>
                      )}

                      {/* Bottom action area */}
                      <div className="border-t border-[#edf1f8] pt-3">
                        {upgradeStatus === 'upgrading' ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-3.5 h-3.5 text-[#191919] animate-spin" />
                              <span className="text-xs text-[#666]">正在升级</span>
                            </div>
                            <span className="text-xs text-[#191919] tabular-nums">{upgradeProgress}%</span>
                          </div>
                        ) : upgradeStatus === 'completed' ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#191919]" />
                              <span className="text-xs text-[#666]">升级完成</span>
                            </div>
                            <button className="flex items-center gap-1 text-xs text-[#999] hover:text-[#666] transition-colors">
                              <RotateCcw className="w-3 h-3" />
                              回滚
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpgrade(agent.id)}
                            className="w-full py-2 bg-[#191919] text-white rounded text-xs hover:bg-[#333] transition-colors flex items-center justify-center gap-1.5"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                            开始升级
                          </button>
                        )}
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
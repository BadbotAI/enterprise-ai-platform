import { Link, useNavigate } from 'react-router';
import { Agent } from '../data/mockData';
import { Sparkles, Users, Download, AlertCircle, Activity, CheckCircle2, Zap, Brain, Cpu, Bot } from 'lucide-react';
import { useState, useRef } from 'react';
import { SubAgentsPopover } from './SubAgentsPopover';

interface AgentCardProps {
  agent: Agent;
  showUpgradeStatus?: boolean;
  showMonitoringMetrics?: boolean;
  toggleFavorite?: (agentId: string) => void;
  isFavorite?: boolean;
  showSuccessRate?: boolean;
}

// 模型图标映射 - 为不同模型提供独特图标
const getModelIcon = (modelName: string) => {
  const lowerModel = modelName.toLowerCase();
  
  if (lowerModel.includes('gpt-4')) {
    return <Sparkles className="w-3.5 h-3.5 text-[#4a5b73]" />;
  } else if (lowerModel.includes('gpt-3.5')) {
    return <Sparkles className="w-3.5 h-3.5 text-[#5a6b7f]" />;
  } else if (lowerModel.includes('gpt')) {
    return <Sparkles className="w-3.5 h-3.5 text-[#4a5b73]" />;
  }
  
  else if (lowerModel.includes('claude-3')) {
    return <Zap className="w-3.5 h-3.5 text-[#4a5b73]" />;
  } else if (lowerModel.includes('claude-2')) {
    return <Zap className="w-3.5 h-3.5 text-[#5a6b7f]" />;
  } else if (lowerModel.includes('claude')) {
    return <Zap className="w-3.5 h-3.5 text-[#4a5b73]" />;
  }
  
  else if (lowerModel.includes('gemini')) {
    return <Brain className="w-3.5 h-3.5 text-[#4a5b73]" />;
  } else if (lowerModel.includes('palm')) {
    return <Brain className="w-3.5 h-3.5 text-[#5a6b7f]" />;
  }
  
  else if (lowerModel.includes('llama')) {
    return <Cpu className="w-3.5 h-3.5 text-[#5a6b7f]" />;
  }
  
  else if (lowerModel.includes('mistral')) {
    return <Bot className="w-3.5 h-3.5 text-[#5a6b7f]" />;
  }

  if (modelName.includes('智链')) {
    return <Brain className="w-3.5 h-3.5 text-[#4a5b73]" />;
  }
  if (modelName.includes('舆情大模型')) {
    return <Zap className="w-3.5 h-3.5 text-[#4a5b73]" />;
  }
  if (modelName.includes('气象大模型')) {
    return <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />;
  }
  if (modelName.includes('铁矿石') || modelName.includes('CBOT') || modelName.includes('大豆')) {
    return <Cpu className="w-3.5 h-3.5 text-[#4a5b73]" />;
  }

  else {
    return <Sparkles className="w-3.5 h-3.5 text-[#7d8da1]" />;
  }
};

export function AgentCard({ agent, showUpgradeStatus = false, showMonitoringMetrics = false, toggleFavorite, isFavorite = false, showSuccessRate = true }: AgentCardProps) {
  const navigate = useNavigate();
  const [showSubAgents, setShowSubAgents] = useState(false);
  const [installed, setInstalled] = useState(false);
  const subAgentsButtonRef = useRef<HTMLButtonElement>(null);

  const handleExperience = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to detail page from monitoring mode
    if (showMonitoringMetrics) {
      navigate(`/marketplace/${agent.id}`, { 
        state: { 
          from: 'monitoring'
        } 
      });
    }
  };

  const handleInstall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (installed) return;
    setInstalled(true);
  };

  const getStatusBadge = (status: string, publishStatus: string, successRate?: number) => {
    if (publishStatus === 'draft') {
      return { bg: 'bg-[#edf1f8]', text: 'text-[#4a5b73]', label: '未上架', border: 'border border-[#e2e8f0]' };
    }
    if (status === 'upgrade') {
      return { bg: 'bg-[#fef8ee]', text: 'text-[#a87020]', label: '待升级', border: 'border border-[#f0dfc0]' };
    }
    if (successRate !== undefined && successRate < 95) {
      return { bg: 'bg-[#fef2f2]', text: 'text-[#c7000b]', label: '调用异常', border: 'border border-[#fde0e0]' };
    }
    return null;
  };

  const formatPublishDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const statusBadge = getStatusBadge(agent.status, agent.publishStatus, agent.successRate);

  return (
    <>
      <Link
        to={`/marketplace/${agent.id}`}
        state={showMonitoringMetrics ? { from: 'monitoring' } : undefined}
        className={`group bg-white/70 backdrop-blur-xl rounded-xl border hover:border-[#cbd5e1] hover:shadow-lg hover:shadow-[#0d1b2a]/[0.04] transition-all duration-200 flex flex-col h-full relative ${
          showMonitoringMetrics ? 'p-4 border-[#e2e8f0]' : 'p-6 border-[#e2e8f0]'
        }`}
      >
        {/* Success Rate - Top Right Corner (only in monitoring mode) */}
        {showMonitoringMetrics && showSuccessRate && (
          <div className="absolute top-4 right-4 text-center">
            <div className="text-xs text-gray-400 mb-0.5">任务成功率</div>
            <div className={`text-sm font-semibold ${(agent.successRate || 0) >= 95 ? 'text-[#0d1b2a]' : 'text-[#c7000b]'}`} style={{ fontWeight: 500 }}>
              {agent.successRate?.toFixed(1)}%
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`flex items-start justify-between ${showMonitoringMetrics ? 'mb-2' : 'mb-3'}`}>
          <div className="flex items-end gap-2 min-w-0 flex-1">
            <h3 className="text-base text-[#0d1b2a] group-hover:text-[#1b2d45] transition-colors truncate" style={{ fontWeight: 500 }}>
              {agent.name}
            </h3>
            <span className="text-xs text-[#a3b1c6] pb-0.5 flex-shrink-0">{agent.version}</span>
          </div>
        </div>

        {/* Labels */}
        <div className={`flex items-center gap-2 ${showMonitoringMetrics ? 'mb-2' : 'mb-3'}`}>
          {showUpgradeStatus && agent.status === 'upgrade' && (
            <span className="px-2.5 py-0.5 rounded-md text-xs bg-[#fef8ee] text-[#a87020] border border-[#f0dfc0] flex items-center gap-1" style={{ fontWeight: 500 }}>
              <AlertCircle className="w-3 h-3" />
              待升级
            </span>
          )}
          {agent.publishStatus === 'draft' && (
            <span className="px-2.5 py-0.5 rounded-md text-xs bg-[#edf1f8] text-[#4a5b73] border border-[#e2e8f0]" style={{ fontWeight: 500 }}>
              未上架
            </span>
          )}
          {showMonitoringMetrics && statusBadge && statusBadge.label !== '未上架' && (
            <span className={`px-2.5 py-0.5 rounded-md text-xs ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} font-medium`}>
              {statusBadge.label}
            </span>
          )}
        </div>

        {/* Description */}
        {!showMonitoringMetrics && (
          <p className="text-sm text-[#5a6b7f] mb-3 line-clamp-2 leading-relaxed">
            {agent.description}
          </p>
        )}

        {showMonitoringMetrics && (
          <p className="text-sm text-[#5a6b7f] mb-2 line-clamp-2 leading-relaxed">
            {agent.description}
          </p>
        )}

        {/* 行业模型（与公共服务能力—行业模型映射一致） */}
        {!showMonitoringMetrics && agent.models && agent.models.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-[#a3b1c6] mb-1.5">行业模型</div>
            <div className="flex flex-wrap gap-1.5">
              {agent.models.map((model) => (
                <span
                  key={model}
                  className="px-2 py-1 bg-[#edf1f8] text-[#4a5b73] text-xs rounded-md border border-[#e2e8f0] flex items-center gap-1 max-w-full"
                  style={{ fontWeight: 400 }}
                >
                  {getModelIcon(model)}
                  <span className="truncate">{model}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Monitoring Metrics */}
        {showMonitoringMetrics && (
          <div className="space-y-2 mb-2 flex-1 flex flex-col">
            {/* Models, Skills, and Tools - Reordered */}
            {(agent.models || agent.tags || agent.tools) && (
              <div className="space-y-2">
                {/* Models - First */}
                {agent.models && agent.models.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">行业模型</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.models.map((model) => (
                        <span key={model} className="px-2 py-0.5 bg-[#edf1f8] text-[#4a5b73] text-xs rounded-md border border-[#e2e8f0] flex items-center gap-1" style={{ fontWeight: 400 }}>
                          {getModelIcon(model)}
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Skills (Tags) - Second */}
                {agent.tags && agent.tags.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">技能</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-[#edf1f8] text-[#5a6b7f] text-xs rounded-md border border-[#e2e8f0]">
                          {tag}
                        </span>
                      ))}
                      {agent.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-[#edf1f8] text-[#7d8da1] text-xs rounded-md border border-[#e2e8f0]">
                          +{agent.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Tools - Third */}
                {agent.tools && agent.tools.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">工具</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.tools.map((tool) => (
                        <span key={tool} className="px-2 py-0.5 bg-[#edf1f8] text-[#5a6b7f] text-xs rounded-md border border-[#e2e8f0]">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Node Count and Agent Count - At the bottom */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#edf1f8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#edf1f8] flex items-center justify-center border border-[#e2e8f0]">
                  <Activity className="w-4 h-4 text-[#4a5b73]" />
                </div>
                <div>
                  <div className="text-xs text-[#7d8da1]">节点数量</div>
                  <div className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>{agent.nodeCount || 0}</div>
                </div>
              </div>
              {agent.subAgents && agent.subAgents.length > 0 && (
                <button
                  ref={subAgentsButtonRef}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSubAgents(!showSubAgents);
                  }}
                  className="flex items-center gap-2 hover:bg-[#edf1f8]/50 rounded-lg transition-colors px-1"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#edf1f8] flex items-center justify-center border border-[#e2e8f0]">
                    <Users className="w-4 h-4 text-[#4a5b73]" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs text-[#7d8da1]">智能体数量</div>
                    <div className="text-sm text-[#4a5b73]" style={{ fontWeight: 500 }}>
                      {agent.subAgentCount || agent.subAgents.length}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Monitoring Mode: Experience Button - Removed */}

        {/* Tags - Non-Monitoring Mode */}
        {!showMonitoringMetrics && (() => {
          const visibleTags = agent.tags.slice(0, 3);
          const hiddenTags = agent.tags.slice(3);
          return (
            <div className="flex flex-wrap gap-2 mb-2 flex-1 items-start">
              {visibleTags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-[#edf1f8] text-[#5a6b7f] text-xs rounded-md border border-[#e2e8f0] h-fit">{tag}</span>
              ))}
              {hiddenTags.length > 0 && (
                <div className="relative group/tags">
                  <span className="px-2 py-1 bg-[#edf1f8] text-[#7d8da1] text-xs rounded-md border border-[#e2e8f0] h-fit cursor-default select-none">
                    +{hiddenTags.length}
                  </span>
                  {/* Hover tooltip showing all hidden tags */}
                  <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/tags:flex flex-wrap gap-1.5 bg-white/95 backdrop-blur-xl border border-[#e2e8f0] rounded-lg p-2.5 shadow-lg shadow-[#0d1b2a]/[0.08] z-20 min-w-[140px] max-w-[240px]">
                    {hiddenTags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-[#edf1f8] text-[#5a6b7f] text-xs rounded-md border border-[#e2e8f0]">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Footer - Non-Monitoring Mode — no top border */}
        {!showMonitoringMetrics && (
          <div className="flex items-center justify-between pt-2 mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#0d1b2a] flex items-center justify-center text-white text-xs" style={{ fontWeight: 500 }}>
                  {agent.creator.name[0]}
                </div>
                <span className="text-xs text-[#5a6b7f]">{agent.creator.name}</span>
              </div>
              <span className="text-xs text-[#a3b1c6]">{formatPublishDate(agent.publishDate)}</span>
            </div>
            
            <button
              onClick={handleInstall}
              disabled={installed}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 shadow-sm ${
                installed
                  ? 'bg-[#edf1f8] text-[#7d8da1] cursor-default shadow-none'
                  : 'bg-[#0d1b2a] text-white hover:bg-[#1b2d45]'
              }`}
              style={{ fontWeight: 500 }}
            >
              {installed ? (
                <><CheckCircle2 className="w-3.5 h-3.5" />已安装</>
              ) : (
                <><Download className="w-3.5 h-3.5" />安装</>
              )}
            </button>
          </div>
        )}
      </Link>

      {showSubAgents && (
        <SubAgentsPopover
          agent={agent}
          onClose={() => setShowSubAgents(false)}
          buttonRef={subAgentsButtonRef.current}
        />
      )}
    </>
  );
}
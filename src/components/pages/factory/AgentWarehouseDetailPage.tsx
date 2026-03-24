import { useParams, useNavigate } from 'react-router';
import { FactorySidebar } from '../../FactorySidebar';
import { mockAgents } from '../../../data/mockData';
import { AGENT_DETAILS } from '../AgentDetailPage';
import {
  Cpu, Wrench, Users, Play, Bot,
  Search, FileText, BarChart3, Brain, Microscope, BookOpen,
  Globe, Database, Shield, X, Send, Sparkles, Loader2,
  CheckCircle2, Code2, Copy, Download, AlertCircle,
  Activity, ArrowLeft,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const agentIcons: Record<string, any> = {
  '基础信息': Database, '运行日志': Activity, '技术架构': Cpu, '效果能力': BarChart3,
  '使用情况': Users, '业务指标': BarChart3, '综合评分': Sparkles, '问题归因': Brain, '评估报告': FileText,
  '信用': Shield, '舆情': Globe, '价格': BarChart3, '产量': Database,
  '研报': FileText, '库存': BookOpen, '装港': Search, '滞期': Brain,
  '供应': BarChart3, '供需': Brain, '需求': Users, '货速': Search,
  '车必': Microscope, '气象': Globe, '监测': Shield, '分析': Brain,
  '报告': FileText, '匹配': Users,
};

function getAgentIcon(name: string) {
  for (const [key, Icon] of Object.entries(agentIcons)) {
    if (name.includes(key)) return Icon;
  }
  return Bot;
}

export function AgentWarehouseDetailPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();

  let agent = mockAgents.find((a) => a.id === agentId);
  if (!agent) {
    try {
      const newlyPublished = JSON.parse(localStorage.getItem('newlyPublishedAgents') || '[]');
      agent = newlyPublished.find((a: any) => a.id === agentId);
    } catch {}
  }

  const detail = agentId ? AGENT_DETAILS[agentId] : undefined;

  // 智能体 web 服务地址
  const TRIAL_URLS: Record<string, string> = {
    '3':  'https://hiagent.xmschain.com/product/llm/chat/d6gm8rcl59d9ouc7earg',
    '4':  'https://hiagent.xmschain.com/product/llm/chat/d63i0bsl59d9ouc74jv0',
    '6':  'https://hiagent.xmschain.com/product/llm/chat/d66im48svobk8pp4irng',
    '9':  'https://ironstone.app.xmschain.com/web/agent-app/chat/1925',
    '10': 'https://ironstone.app.xmschain.com/web/agent-app/chat/1886',
    '11': 'https://ironstone.app.xmschain.com/web/agent-app/chat/1884',
    'draft-3': 'https://ironstone.app.xmschain.com/web/agent-app/chat/1697',
  };
  const trialUrl = agentId ? TRIAL_URLS[agentId] : undefined;
  const hasTrialUrl = !!trialUrl;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  if (!agent) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
        <FactorySidebar />
        <div className="flex-1 overflow-auto">
          <div className="px-8 pt-6 pb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-[#7d8da1] hover:text-[#0d1b2a] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              返回上一页
            </button>
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-16 h-16 rounded-2xl bg-[#edf1f8] flex items-center justify-center mb-4">
                <Bot className="w-7 h-7 text-[#a3b1c6]" />
              </div>
              <p className="text-sm text-[#7d8da1] mb-4">智能体不存在或已被删除</p>
              <button
                type="button"
                onClick={() => navigate('/factory/warehouse')}
                className="px-4 py-2 bg-[#0d1b2a] text-white rounded-lg text-sm hover:bg-[#1b2d45] transition-colors"
              >
                返回我的智能体
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const Icon = getAgentIcon(agent.name);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      <FactorySidebar />
      <div className="flex-1 overflow-auto">
        <div className="px-8 pt-6 pb-8">
          <div className="max-w-[1000px] mx-auto">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-[#7d8da1] hover:text-[#0d1b2a] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              返回上一页
            </button>
            {/* Header card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-[#0d1b2a]/[0.06] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#0d1b2a]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-[22px] text-[#0d1b2a]" style={{ fontWeight: 500 }}>{agent.name}</h1>
                        <span className="text-xs text-[#a3b1c6] bg-[#edf1f8] px-2 py-0.5 rounded">{agent.version}</span>
                        {agent.publishStatus === 'published' && (
                          <span className="px-2 py-0.5 bg-[#0d1b2a] text-white text-[10px] rounded-md" style={{ fontWeight: 500 }}>已发布</span>
                        )}
                        {agent.publishStatus === 'draft' && (
                          <span className="px-2 py-0.5 bg-[#edf1f8] text-[#7d8da1] text-[10px] rounded-md" style={{ fontWeight: 500 }}>草稿</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#7d8da1] ml-14">
                    <div className="w-6 h-6 rounded-full bg-[#0d1b2a]/10 flex items-center justify-center text-[#0d1b2a] text-xs">
                      {agent.creator?.name?.[0] || '?'}
                    </div>
                    <span className="text-sm">创建者: {agent.creator?.name || '未知'}</span>
                    {agent.publishDate && (
                      <span className="text-xs text-[#a3b1c6]">· 发布于 {agent.publishDate}</span>
                    )}
                  </div>
                </div>

                {/* Action button: 试用 */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { if (hasTrialUrl) window.open(trialUrl, '_blank', 'noopener'); }}
                    disabled={!hasTrialUrl}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm transition-all border ${
                      !hasTrialUrl
                        ? 'border-[#e2e8f0] text-[#c9cdd4] bg-[#f8f9fa] cursor-not-allowed'
                        : 'border-[#e2e8f0] text-[#4a5b73] hover:bg-[#f4f6fa]'
                    }`}
                    style={{ fontWeight: 500 }}
                    title={!hasTrialUrl ? '暂无试用地址' : '打开试用页面'}
                  >
                    <Play className="w-3.5 h-3.5" />试用
                  </button>
                </div>
              </div>

              {/* Tags */}
              {agent.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 ml-14">
                  {agent.tags.map((tag: string) => (
                    <span key={tag} className="px-2.5 py-1 bg-[#f4f6fa] text-[#4a5b73] text-xs rounded-md border border-[#edf1f8]">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Body: 2-col layout */}
            <div className="grid grid-cols-3 gap-5">
              {/* Left: rich content */}
              <div className="col-span-2 space-y-5">
                {/* 功能介绍 */}
                <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-6">
                  <h2 className="text-[15px] text-[#0d1b2a] mb-4" style={{ fontWeight: 500 }}>功能介绍</h2>
                  <p className="text-sm text-[#7d8da1] mb-4 leading-relaxed">{agent.description}</p>
                  <div className="bg-[#0d1b2a]/[0.03] border border-[#e2e8f0] rounded-lg p-4">
                    <h3 className="text-sm text-[#0d1b2a] mb-2" style={{ fontWeight: 500 }}>能力范围</h3>
                    <ul className="text-sm text-[#4a5b73] space-y-1.5">
                      {(detail?.capabilities || ['智能数据分析与处理', '多维度业务指标监测', '自动生成分析报告']).map((cap, i) => (
                        <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />{cap}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 使用场景 */}
                <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-6">
                  <h2 className="text-[15px] text-[#0d1b2a] mb-4" style={{ fontWeight: 500 }}>使用场景</h2>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {agent.tags?.map((tag: string) => (
                      <span key={tag} className="px-2.5 py-1 bg-[#f4f6fa] text-[#4a5b73] text-xs rounded-md border border-[#edf1f8]">{tag}</span>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {(detail?.scenarios || [
                      { title: '业务数据分析', desc: '对业务数据进行多维度分析和洞察' },
                      { title: '智能决策支持', desc: '基于数据分析提供决策建议和风险提示' },
                    ]).map((s, i) => (
                      <div key={i} className="p-4 bg-[#f8f9fc] rounded-lg border border-[#edf1f8]">
                        <h3 className="text-sm text-[#0d1b2a] mb-1" style={{ fontWeight: 500 }}>{s.title}</h3>
                        <p className="text-sm text-[#7d8da1]">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 输入/输出 */}
                <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-6">
                  <h2 className="text-[15px] text-[#0d1b2a] mb-4" style={{ fontWeight: 500 }}>输入/输出说明</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-[#0d1b2a] mb-2" style={{ fontWeight: 500 }}>输入示例</h3>
                      <div className="bg-[#f8f9fc] rounded-lg p-4 border border-[#edf1f8]">
                        <p className="text-sm text-[#4a5b73] mb-2">文本输入：</p>
                        <code className="text-xs text-[#7d8da1]">"{detail?.inputExample || '请分析相关业务数据并生成报告'}"</code>
                        <p className="text-sm text-[#4a5b73] mt-3 mb-2">支持文件：</p>
                        <span className="text-xs text-[#7d8da1]">{detail?.inputFormats || 'PDF, Word, Excel'}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm text-[#0d1b2a] mb-2" style={{ fontWeight: 500 }}>输出示例</h3>
                      <div className="bg-[#f8f9fc] rounded-lg p-4 border border-[#edf1f8]">
                        <p className="text-sm text-[#4a5b73]">生成结构化分析报告，包括：</p>
                        <ul className="text-xs text-[#7d8da1] mt-2 space-y-1">
                          {(detail?.outputItems || ['分析结果与关键指标', '风险评估与预警', '优化建议与决策参考']).map((item, i) => (
                            <li key={i}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 子智能体 */}
                {agent.subAgents && agent.subAgents.length > 0 && (
                  <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-[#7d8da1]" />
                      <span className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>子智能体</span>
                    </div>
                    <div className="space-y-3">
                      {agent.subAgents.map((sub: any) => (
                        <div key={sub.id} className="flex items-center gap-3 px-4 py-3 bg-[#f8f9fc] rounded-lg border border-[#edf1f8]">
                          <div className="w-8 h-8 rounded-lg bg-[#0d1b2a]/[0.06] flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-[#0d1b2a]" />
                          </div>
                          <div>
                            <span className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>{sub.name}</span>
                            {sub.deprecated && <span className="ml-2 text-[10px] text-[#c7000b] bg-[#fef2f2] px-1.5 py-0.5 rounded">已弃用</span>}
                            <p className="text-xs text-[#7d8da1] mt-0.5">{sub.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 版本历史 */}
                <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-6">
                  <h2 className="text-[15px] text-[#0d1b2a] mb-4" style={{ fontWeight: 500 }}>版本历史</h2>
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <span className="px-2 py-0.5 bg-[#0d1b2a] text-white rounded-md text-xs h-fit" style={{ fontWeight: 500 }}>{agent.version || 'v1.2.0'}</span>
                      <div className="flex-1">
                        <p className="text-sm text-[#4a5b73] mb-1">优化模型准确率，提升响应速度与稳定性</p>
                        <span className="text-xs text-[#a3b1c6]">{agent.publishDate || '2025-01-15'}</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="px-2 py-0.5 bg-[#edf1f8] text-[#4a5b73] rounded-md text-xs h-fit" style={{ fontWeight: 500 }}>v1.1.0</span>
                      <div className="flex-1">
                        <p className="text-sm text-[#4a5b73] mb-1">新增多维度数据分析能力，扩展业务场景覆盖</p>
                        <span className="text-xs text-[#a3b1c6]">2024-12-20</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: sidebar */}
              <div className="space-y-5">
                {/* 模型 */}
                {agent.models?.length > 0 && (
                  <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] px-5 py-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Cpu className="w-4 h-4 text-[#7d8da1]" />
                      <span className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>行业模型</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {agent.models.map((m: string) => (
                        <span key={m} className="px-3 py-1.5 bg-[#edf1f8] text-[#4a5b73] text-xs rounded-lg">{m}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 工具 */}
                {agent.tools?.length > 0 && (
                  <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] px-5 py-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Wrench className="w-4 h-4 text-[#7d8da1]" />
                      <span className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>工具</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {agent.tools.map((t: string) => (
                        <span key={t} className="px-3 py-1.5 bg-[#edf1f8] text-[#4a5b73] text-xs rounded-lg">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 运行指标 */}
                {(agent.successRate !== undefined || agent.callCount !== undefined) && (
                  <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] px-5 py-5">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-[#7d8da1]" />
                      <span className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>运行指标</span>
                    </div>
                    <div className="space-y-2.5">
                      {agent.successRate !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#7d8da1]">成功率</span>
                          <span className={`text-sm tabular-nums ${agent.successRate < 95 ? 'text-[#c7000b]' : 'text-[#0d1b2a]'}`} style={{ fontWeight: 500 }}>{agent.successRate}%</span>
                        </div>
                      )}
                      {agent.callCount !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#7d8da1]">调用次数</span>
                          <span className="text-sm text-[#0d1b2a] tabular-nums" style={{ fontWeight: 500 }}>{agent.callCount.toLocaleString()}</span>
                        </div>
                      )}
                      {agent.subAgentCount !== undefined && agent.subAgentCount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#7d8da1]">子智能体</span>
                          <span className="text-sm text-[#0d1b2a] tabular-nums" style={{ fontWeight: 500 }}>{agent.subAgentCount}</span>
                        </div>
                      )}
                      {agent.nodeCount && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#7d8da1]">节点数</span>
                          <span className="text-sm text-[#0d1b2a] tabular-nums" style={{ fontWeight: 500 }}>{agent.nodeCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 基本信息 */}
                <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] px-5 py-5">
                  <h3 className="text-sm text-[#0d1b2a] mb-3" style={{ fontWeight: 500 }}>基本信息</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#a3b1c6]">类型</span>
                      <span className="text-xs text-[#4a5b73]">{agent.type === 'multi' ? '多智能体' : '单智能体'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#a3b1c6]">创建者</span>
                      <span className="text-xs text-[#4a5b73]">{agent.creator?.name || '未知'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#a3b1c6]">发布日期</span>
                      <span className="text-xs text-[#4a5b73]">{agent.publishDate || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* 开发者接入 */}
                <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[15px] text-[#0d1b2a]" style={{ fontWeight: 500 }}>开发者接入</h2>
                    <Code2 className="w-4 h-4 text-[#a3b1c6]" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-[#0d1b2a] mb-2" style={{ fontWeight: 500 }}>API 调用示例</h3>
                      <div className="relative">
                        <pre className="bg-[#0d1b2a] text-[#e2e8f0] p-3.5 rounded-lg text-[11px] overflow-x-auto scrollbar-subtle">
{`POST /api/v1/agents/${agent.id}/run
{
  "input": "${detail?.inputExample ? detail.inputExample.slice(0, 20) + '...' : '请输入分析内容...'}",
  "params": { "temperature": 0.7 }
}`}
                        </pre>
                        <button onClick={() => copyCode(`POST /api/v1/agents/${agent.id}/run`)}
                          className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded transition-colors">
                          <Copy className="w-3 h-3 text-[#7d8da1]" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2.5 bg-[#0d1b2a]/[0.04] text-[#0d1b2a] rounded-lg hover:bg-[#0d1b2a]/[0.08] flex items-center justify-center gap-2 text-sm transition-colors border border-[#e2e8f0]">
                        <BookOpen className="w-4 h-4" />查看完整开发者文档
                      </button>
                      <button className="w-full px-4 py-2.5 bg-[#f8f9fc] text-[#4a5b73] rounded-lg hover:bg-[#edf1f8] flex items-center justify-center gap-2 text-sm transition-colors border border-[#edf1f8]">
                        <Download className="w-4 h-4" />下载 SDK
                      </button>
                    </div>
                  </div>
                </div>

                {agent.status === 'upgrade' && (
                  <div className="bg-[#f59e0b]/[0.06] border border-[#f59e0b]/20 rounded-xl p-5">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm text-[#0d1b2a] mb-1" style={{ fontWeight: 500 }}>待升级提示</h3>
                        <p className="text-sm text-[#7d8da1]">该智能体的模型版本相对落后，建议升级以获得更好的性能表现。</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
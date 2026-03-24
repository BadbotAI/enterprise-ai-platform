import { FactorySidebar } from '../../FactorySidebar';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Clock, ArrowRight, Eye, RotateCcw } from 'lucide-react';
import { useState } from 'react';

type QAStatus = 'queued' | 'testing' | 'passed' | 'failed';

interface QAItem {
  id: string;
  agentName: string;
  version: string;
  status: QAStatus;
  score?: number;
  tests?: { total: number; passed: number; failed: number };
  submittedAt: string;
  duration?: string;
}

const statusConfig: Record<QAStatus, { label: string; color: string; bgColor: string }> = {
  queued: { label: '排队中', color: 'text-[#7d8da1]', bgColor: 'bg-[#edf1f8]' },
  testing: { label: '测试中', color: 'text-[#0d1b2a]', bgColor: 'bg-[#edf1f8]' },
  passed: { label: '已通过', color: 'text-[#0d1b2a]', bgColor: 'bg-[#edf1f8]' },
  failed: { label: '未通过', color: 'text-[#c7000b]', bgColor: 'bg-[#fef2f2]' },
};

export function QualityPage() {
  const [activeTab, setActiveTab] = useState<'all' | QAStatus>('all');

  const qaItems: QAItem[] = [
    { id: '1', agentName: '客服助手', version: 'v2.1.0', status: 'passed', score: 96.8, tests: { total: 120, passed: 116, failed: 4 }, submittedAt: '今天 14:23', duration: '3分12秒' },
    { id: '2', agentName: '数据分析专家', version: 'v1.6.0', status: 'testing', submittedAt: '今天 14:45', tests: { total: 80, passed: 52, failed: 0 } },
    { id: '3', agentName: '合规审查助手', version: 'v1.3.0', status: 'failed', score: 72.3, tests: { total: 95, passed: 69, failed: 26 }, submittedAt: '今天 13:10', duration: '5分08秒' },
    { id: '4', agentName: '翻译助手', version: 'v3.0.0', status: 'queued', submittedAt: '今天 15:02' },
    { id: '5', agentName: '邮件分类器', version: 'v2.3.0', status: 'passed', score: 99.1, tests: { total: 60, passed: 60, failed: 0 }, submittedAt: '昨天 17:30', duration: '1分45秒' },
    { id: '6', agentName: '财报分析师', version: 'v1.5.1', status: 'passed', score: 94.2, tests: { total: 110, passed: 104, failed: 6 }, submittedAt: '昨天 15:12', duration: '4分22秒' },
    { id: '7', agentName: '舆情监测', version: 'v1.7.0', status: 'failed', score: 68.5, tests: { total: 85, passed: 58, failed: 27 }, submittedAt: '昨天 11:45', duration: '6分15秒' },
  ];

  const tabs = [
    { id: 'all' as const, label: '全部', count: qaItems.length },
    { id: 'queued' as const, label: '排队中', count: qaItems.filter(i => i.status === 'queued').length },
    { id: 'testing' as const, label: '测试中', count: qaItems.filter(i => i.status === 'testing').length },
    { id: 'passed' as const, label: '已通过', count: qaItems.filter(i => i.status === 'passed').length },
    { id: 'failed' as const, label: '未通过', count: qaItems.filter(i => i.status === 'failed').length },
  ];

  const filteredItems = activeTab === 'all' ? qaItems : qaItems.filter(i => i.status === activeTab);

  const passRate = qaItems.filter(i => i.status === 'passed').length / qaItems.filter(i => i.status === 'passed' || i.status === 'failed').length * 100;

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      <FactorySidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 pt-6 pb-8">
          <div className="mb-6">
            <h1 className="text-[22px] text-[#0d1b2a] mb-1" style={{ fontWeight: 500 }}>质检车间</h1>
            <p className="text-xs text-[#7d8da1]" style={{ fontWeight: 400 }}>智能体发布前的自动化质量检测与验证</p>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] px-4 py-4 hover:border-[#cbd5e1] transition-colors">
              <p className="text-xs text-[#7d8da1] mb-2" style={{ fontWeight: 400 }}>待检测</p>
              <span className="text-2xl text-[#0d1b2a] tracking-tight" style={{ fontWeight: 400 }}>
                {qaItems.filter(i => i.status === 'queued' || i.status === 'testing').length}
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] px-4 py-4 hover:border-[#cbd5e1] transition-colors">
              <p className="text-xs text-[#7d8da1] mb-2" style={{ fontWeight: 400 }}>通过率</p>
              <span className="text-2xl text-[#0d1b2a] tracking-tight" style={{ fontWeight: 400 }}>
                {passRate.toFixed(1)}%
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] px-4 py-4 hover:border-[#cbd5e1] transition-colors">
              <p className="text-xs text-[#7d8da1] mb-2" style={{ fontWeight: 400 }}>平均分数</p>
              <span className="text-2xl text-[#0d1b2a] tracking-tight" style={{ fontWeight: 400 }}>
                {(qaItems.filter(i => i.score).reduce((a, i) => a + (i.score || 0), 0) / qaItems.filter(i => i.score).length).toFixed(1)}
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] px-4 py-4 hover:border-[#cbd5e1] transition-colors">
              <p className="text-xs text-[#7d8da1] mb-2" style={{ fontWeight: 400 }}>本周检测</p>
              <span className="text-2xl text-[#0d1b2a] tracking-tight" style={{ fontWeight: 400 }}>
                {qaItems.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white/70 backdrop-blur-xl rounded-lg border border-[#e2e8f0] p-0.5 w-fit mb-5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0d1b2a] text-white'
                    : 'text-[#7d8da1] hover:text-[#4a5b73]'
                }`}
              >
                {tab.label}
                <span className="ml-1.5">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 px-5 py-2 text-[11px] text-[#a3b1c6] uppercase tracking-wider">
              <div className="col-span-3">智能体</div>
              <div className="col-span-2">状态</div>
              <div className="col-span-2">测试用例</div>
              <div className="col-span-2">质检分数</div>
              <div className="col-span-1">耗时</div>
              <div className="col-span-2 text-right">操作</div>
            </div>

            {filteredItems.map((item) => {
              const config = statusConfig[item.status];
              return (
                <div
                  key={item.id}
                  className="group bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm hover:shadow-[#0d1b2a]/[0.03] transition-all"
                >
                  <div className="grid grid-cols-12 items-center px-5 py-4">
                    <div className="col-span-3">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>{item.agentName}</h3>
                        <span className="text-[11px] text-[#a3b1c6]">{item.version}</span>
                      </div>
                      <p className="text-[11px] text-[#a3b1c6] mt-0.5">{item.submittedAt}</p>
                    </div>

                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${config.bgColor} ${config.color}`}>
                        {item.status === 'testing' && <Loader className="w-3 h-3" />}
                        {item.status === 'passed' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'failed' && <XCircle className="w-3 h-3" />}
                        {item.status === 'queued' && <Clock className="w-3 h-3" />}
                        {config.label}
                      </span>
                    </div>

                    <div className="col-span-2">
                      {item.tests ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[60px] h-1.5 bg-[#edf1f8] rounded-full overflow-hidden">
                            <div className="h-full flex">
                              <div
                                className="h-full bg-[#0d1b2a] rounded-l-full"
                                style={{ width: `${(item.tests.passed / item.tests.total) * 100}%` }}
                              />
                              {item.tests.failed > 0 && (
                                <div
                                  className="h-full bg-[#c7000b]"
                                  style={{ width: `${(item.tests.failed / item.tests.total) * 100}%` }}
                                />
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-[#7d8da1] tabular-nums">
                            {item.tests.passed}/{item.tests.total}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#a3b1c6]">—</span>
                      )}
                    </div>

                    <div className="col-span-2">
                      {item.score !== undefined ? (
                        <span className={`text-sm tabular-nums ${item.score >= 90 ? 'text-[#0d1b2a]' : item.score >= 80 ? 'text-[#4a5b73]' : 'text-[#c7000b]'}`} style={{ fontWeight: 400 }}>
                          {item.score}
                        </span>
                      ) : (
                        <span className="text-xs text-[#a3b1c6]">—</span>
                      )}
                    </div>

                    <div className="col-span-1">
                      <span className="text-xs text-[#7d8da1]">{item.duration || '—'}</span>
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#4a5b73] hover:bg-[#edf1f8] rounded-lg transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                        详情
                      </button>
                      {item.status === 'failed' && (
                        <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#0d1b2a] bg-[#edf1f8] hover:bg-[#e2e8f0] rounded-lg transition-colors">
                          <RotateCcw className="w-3.5 h-3.5" />
                          重测
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Loader({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
    </svg>
  );
}
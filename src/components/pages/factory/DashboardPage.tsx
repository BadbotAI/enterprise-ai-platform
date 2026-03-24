import { FactorySidebar } from '../../FactorySidebar';
import { useState } from 'react';
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  Sparkles,
  Save,
  ArrowUpRight,
  Package,
} from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  change: string;
  trend: 'up' | 'down';
  accent?: boolean;
}

function MetricCard({ label, value, unit, change, trend, accent }: MetricCardProps) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-5 hover:border-[#cbd5e1] transition-colors">
      <p className="text-xs text-[#7d8da1] mb-3" style={{ fontWeight: 400 }}>{label}</p>
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          <span className={`text-[28px] tracking-tight ${accent ? 'text-[#c7000b]' : 'text-[#0d1b2a]'}`} style={{ fontWeight: 400 }}>
            {value}
          </span>
          <span className="text-xs text-[#a3b1c6]">{unit}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[11px] tabular-nums ${trend === 'up' ? 'text-[#0d1b2a]' : 'text-[#c7000b]'}`}>
            {trend === 'up' ? '+' : ''}{change}
          </span>
          <svg width="40" height="16" viewBox="0 0 40 16" className="ml-1">
            <path
              d={trend === 'up'
                ? 'M2 14 Q10 12 16 9 T28 5 T38 2'
                : 'M2 2 Q10 4 16 7 T28 11 T38 14'
              }
              fill="none"
              stroke={trend === 'up' ? '#0d1b2a' : '#c7000b'}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

interface ActivityItem {
  id: string;
  type: 'create' | 'upgrade' | 'approve' | 'save';
  agentName: string;
  time: string;
}

const activityIcons = {
  create: Sparkles,
  upgrade: TrendingUp,
  approve: CheckCircle2,
  save: Save,
};

const activityLabels = {
  create: '新建',
  upgrade: '升级',
  approve: '通过',
  save: '保存',
};

export function DashboardPage() {
  const [activeTimeRange, setActiveTimeRange] = useState<'today' | 'week' | 'month'>('today');

  const metrics: MetricCardProps[] = [
    { label: '成品总数', value: '156', unit: '个', change: '12', trend: 'up' },
    { label: '草稿数量', value: '23', unit: '个', change: '5', trend: 'up' },
    { label: '升级中', value: '8', unit: '个', change: '2', trend: 'up', accent: true },
    { label: '质检通过率', value: '98.5', unit: '%', change: '0.5', trend: 'up' },
    { label: '今日活跃', value: '42', unit: '次', change: '18', trend: 'up' },
    { label: '平均响应', value: '125', unit: 'ms', change: '10', trend: 'down' },
  ];

  const recentActivities: ActivityItem[] = [
    { id: '1', type: 'create', agentName: '需求分析智能体 v0.9', time: '2分钟前' },
    { id: '2', type: 'upgrade', agentName: '粮食价格预测智能体', time: '10分钟前' },
    { id: '3', type: 'approve', agentName: '公路段货找车智能体', time: '1小时前' },
    { id: '4', type: 'save', agentName: '供需平衡智能体', time: '2小时前' },
    { id: '5', type: 'create', agentName: '内贸玉米滞期预警 v0.8', time: '3小时前' },
    { id: '6', type: 'approve', agentName: '全球气象智能体', time: '4小时前' },
    { id: '7', type: 'upgrade', agentName: '进口大豆装港风险预警 v1.3', time: '5小时前' },
    { id: '8', type: 'save', agentName: '信息监测智能体', time: '6小时前' },
  ];

  const topAgents = [
    { name: '全球气象智能体', calls: 15680, change: '+8.2%', up: true },
    { name: '公路段货找车智能体', calls: 12340, change: '+12.5%', up: true },
    { name: '信用智能体', calls: 9876, change: '+3.1%', up: true },
    { name: '粮食价格预测智能体', calls: 7654, change: '-2.4%', up: false },
    { name: '价格预测智能体', calls: 6543, change: '+5.7%', up: true },
  ];

  const resources = [
    { name: '工具', count: 18, total: 30 },
    { name: '模型', count: 6, total: 10 },
    { name: '技能', count: 24, total: 40 },
    { name: '知识库', count: 12, total: 20 },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      <FactorySidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 pt-6 pb-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-[22px] text-[#0d1b2a] mb-1" style={{ fontWeight: 500 }}>智能体看板</h1>
              <p className="text-xs text-[#7d8da1]" style={{ fontWeight: 400 }}>实时监控智能体运行状态</p>
            </div>
            <div className="flex items-center gap-1 bg-white/70 backdrop-blur-xl rounded-lg border border-[#e2e8f0] p-0.5">
              {[
                { id: 'today' as const, label: '今日' },
                { id: 'week' as const, label: '本周' },
                { id: 'month' as const, label: '本月' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTimeRange(t.id)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                    activeTimeRange === t.id ? 'bg-[#0d1b2a] text-white' : 'text-[#7d8da1] hover:text-[#4a5b73]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-3 gap-4">
            {/* Recent Activity */}
            <div className="col-span-2 bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0]">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#edf1f8]">
                <h2 className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>最近活动</h2>
                <button className="text-[11px] text-[#7d8da1] hover:text-[#4a5b73] transition-colors">查看全部</button>
              </div>
              <div>
                {recentActivities.map((activity) => {
                  const IconComp = activityIcons[activity.type];
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-[#edf1f8]/40 transition-colors border-b border-[#edf1f8] last:border-b-0"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#edf1f8] flex items-center justify-center flex-shrink-0">
                        <IconComp className="w-3 h-3 text-[#7d8da1]" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-[11px] text-[#a3b1c6] flex-shrink-0">{activityLabels[activity.type]}</span>
                        <span className="text-sm text-[#0d1b2a] truncate" style={{ fontWeight: 400 }}>{activity.agentName}</span>
                      </div>
                      <span className="text-[11px] text-[#a3b1c6] flex-shrink-0">{activity.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Top Agents */}
              <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0]">
                <div className="px-5 py-3.5 border-b border-[#edf1f8]">
                  <h2 className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>热门智能体</h2>
                </div>
                <div>
                  {topAgents.map((agent, index) => (
                    <div key={agent.name} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#edf1f8]/40 transition-colors border-b border-[#edf1f8] last:border-b-0">
                      <span className="text-[11px] text-[#a3b1c6] w-4 text-center tabular-nums">{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0d1b2a] truncate" style={{ fontWeight: 400 }}>{agent.name}</p>
                        <p className="text-[11px] text-[#a3b1c6]">{agent.calls.toLocaleString()} 次</p>
                      </div>
                      <span className={`text-[11px] tabular-nums ${agent.up ? 'text-[#0d1b2a]' : 'text-[#c7000b]'}`}>{agent.change}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0]">
                <div className="px-5 py-3.5 border-b border-[#edf1f8]">
                  <h2 className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>原料库用量</h2>
                </div>
                <div className="p-5 space-y-4">
                  {resources.map((r) => {
                    const pct = Math.round((r.count / r.total) * 100);
                    return (
                      <div key={r.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-[#4a5b73]" style={{ fontWeight: 400 }}>{r.name}</span>
                          <span className="text-[11px] text-[#a3b1c6] tabular-nums">{r.count}/{r.total}</span>
                        </div>
                        <div className="h-1 bg-[#edf1f8] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0d1b2a] rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
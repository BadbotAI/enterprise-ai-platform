import { Shield, Activity, AlertTriangle, CheckCircle2, TrendingUp, Users, Zap, Eye, AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function SecurityMonitoringDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      label: '实时监控任务',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: Activity,
      iconBg: 'bg-[#1b2d45]/10',
      iconColor: 'text-[#1b2d45]'
    },
    {
      label: '安全风险事件',
      value: '23',
      change: '-8.3%',
      trend: 'down',
      icon: AlertTriangle,
      iconBg: 'bg-[#F97316]/10',
      iconColor: 'text-[#F97316]'
    },
    {
      label: '通过率',
      value: '98.7%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle2,
      iconBg: 'bg-[#10B981]/10',
      iconColor: 'text-[#10B981]'
    },
    {
      label: '活跃智能体',
      value: '456',
      change: '+18.2%',
      trend: 'up',
      icon: Users,
      iconBg: 'bg-[#6366F1]/10',
      iconColor: 'text-[#6366F1]'
    }
  ];

  const recentAlerts = [
    {
      id: 1,
      type: 'warning',
      title: '价格预测智能体延迟升高',
      message: '价格预测智能体响应延迟达到5.2s，超出阈值',
      time: '2分钟前',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      title: '大豆价格研判工作流完成',
      message: '工作流"大豆价格趋势研判"已成功完成全部4个节点',
      time: '5分钟前',
      severity: 'low'
    },
    {
      id: 3,
      type: 'critical',
      title: '气象数据接口异常',
      message: '全球气象智能体数据源连接超时，影响港口气象预报',
      time: '8分钟前',
      severity: 'high'
    },
    {
      id: 4,
      type: 'success',
      title: '信用评估模型更新',
      message: '信用智能体模型版本已更新至v2.1.0并通过验证',
      time: '15分钟前',
      severity: 'low'
    },
    {
      id: 5,
      type: 'warning',
      title: 'NPU算力使用告警',
      message: 'NPU资源使用率达到85%，建议扩容或调整调度策略',
      time: '23分钟前',
      severity: 'medium'
    }
  ];

  const monitoringMetrics = [
    { label: 'API调用成功率', value: '99.2%', status: 'good' },
    { label: '平均响应时间', value: '124ms', status: 'good' },
    { label: '数据加密率', value: '100%', status: 'good' },
    { label: '异常拦截数', value: '1,284', status: 'normal' },
    { label: '权限验证通过', value: '98.9%', status: 'good' },
    { label: '活跃会话数', value: '3,421', status: 'normal' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-[#c7000b]/5 border-[#c7000b]/20';
      case 'medium':
        return 'bg-[#F97316]/5 border-[#F97316]/20';
      case 'low':
        return 'bg-[#eef2f7] border-[#e2e8f0]';
      default:
        return 'bg-[#eef2f7] border-[#e2e8f0]';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-[#c7000b]" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#F97316]" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[#10B981]" />;
      default:
        return <Activity className="w-5 h-5 text-[#6366F1]" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      {/* Content */}
      <div className="p-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/galaxy', { replace: true })}
            className="w-8 h-8 rounded-lg bg-[#edf1f8]/80 hover:bg-[#d8e0ec] flex items-center justify-center transition-colors"
            title="返回首页"
          >
            <ArrowLeft className="w-4 h-4 text-[#4a5b73]" />
          </button>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-[22px] text-[#0d1b2a] mb-1" style={{ fontWeight: 500 }}>安全监控中心</h1>
          <p className="text-xs text-[#7d8da1]" style={{ fontWeight: 400 }}>实时监控智能体运行状态与安全风险</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white/70 backdrop-blur-xl border border-[#e2e8f0] rounded-2xl p-6 transition-all hover:shadow-md">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-[#10B981]' : 'text-[#c7000b]'
                  }`} style={{ fontWeight: 500 }}>
                    <TrendingUp className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[#7d8da1] mb-1" style={{ fontWeight: 400 }}>{stat.label}</p>
                  <p className="text-3xl text-[#0d1b2a]" style={{ fontWeight: 500 }}>{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Recent Alerts */}
          <div className="col-span-2 bg-white/70 backdrop-blur-xl border border-[#e2e8f0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#edf1f8]">
              <h2 className="text-[15px] text-[#0d1b2a]" style={{ fontWeight: 500 }}>实时告警</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-xl p-4 ${getSeverityColor(alert.severity)} transition-all hover:shadow-sm`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>{alert.title}</h3>
                          <span className="text-xs text-[#a3b1c6] whitespace-nowrap">{alert.time}</span>
                        </div>
                        <p className="text-sm text-[#7d8da1] mt-1" style={{ fontWeight: 400 }}>{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monitoring Metrics */}
          <div className="bg-white/70 backdrop-blur-xl border border-[#e2e8f0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#edf1f8]">
              <h2 className="text-[15px] text-[#0d1b2a]" style={{ fontWeight: 500 }}>监控指标</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {monitoringMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between pb-3 border-b border-[#edf1f8] last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        metric.status === 'good' ? 'bg-[#10B981]' : 'bg-[#6366F1]'
                      }`} />
                      <span className="text-sm text-[#7d8da1]" style={{ fontWeight: 400 }}>{metric.label}</span>
                    </div>
                    <span className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security Status Grid */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="bg-white/70 backdrop-blur-xl border border-[#e2e8f0] rounded-2xl p-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#1b2d45]/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#1b2d45]" />
              </div>
              <h3 className="text-[15px] text-[#0d1b2a]" style={{ fontWeight: 500 }}>实时监控</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#7d8da1]" style={{ fontWeight: 400 }}>监控节点</span>
                <span className="text-[#0d1b2a]" style={{ fontWeight: 500 }}>128</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#7d8da1]" style={{ fontWeight: 400 }}>在线率</span>
                <span className="text-[#10B981]" style={{ fontWeight: 500 }}>99.8%</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-[#e2e8f0] rounded-2xl p-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#6366F1]" />
              </div>
              <h3 className="text-[15px] text-[#0d1b2a]" style={{ fontWeight: 500 }}>性能优化</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#7d8da1]" style={{ fontWeight: 400 }}>优化建议</span>
                <span className="text-[#0d1b2a]" style={{ fontWeight: 500 }}>12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#7d8da1]" style={{ fontWeight: 400 }}>已应用</span>
                <span className="text-[#10B981]" style={{ fontWeight: 500 }}>8</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-[#e2e8f0] rounded-2xl p-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#10B981]" />
              </div>
              <h3 className="text-[15px] text-[#0d1b2a]" style={{ fontWeight: 500 }}>安全防护</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#7d8da1]" style={{ fontWeight: 400 }}>拦截攻击</span>
                <span className="text-[#0d1b2a]" style={{ fontWeight: 500 }}>1,284</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#7d8da1]" style={{ fontWeight: 400 }}>防护等级</span>
                <span className="text-[#10B981]" style={{ fontWeight: 500 }}>高</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
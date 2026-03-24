import { useParams, useNavigate, Link } from 'react-router';
import { 
  Home, 
  ArrowLeft,
  Star, 
  Users, 
  GitBranch, 
  Calendar, 
  Play,
  Download,
  Share2,
  Eye
} from 'lucide-react';
import { useState } from 'react';

// Mock workflow data
const mockWorkflow = {
  id: 'wf1',
  name: '智能体评估工作流',
  description: '覆盖基础信息与运行日志取证、四维评估、综合打分与报告生成的全链路智能体评估流程',
  scene: '智能体评估',
  creator: '评测团队',
  nodeCount: 10,
  agentCount: 4,
  usedBy: 256,
  updatedAt: '2026-03-15',
  detailedDescription: `这是一个面向生产智能体的标准化评估工作流，能够自动完成从基础信息与运行日志取证到评估报告输出的全流程操作。

工作流包含以下主要步骤：
1. 查询智能体基础信息与运行日志
2. 技术架构、效果能力、使用情况、业务指标四维评估
3. 综合评分计算与问题归因分级
4. 生成结构化评估报告并归档

适用场景：
- 智能体上线前质量验收
- 智能体周期性健康巡检
- 多版本效果对比评测
- 问题定位与改进闭环`,
  agents: [
    { name: '资产目录智能体', description: '查询智能体注册与能力元数据' },
    { name: '运行日志智能体', description: '聚合调用日志与错误栈形成运行侧证据集' },
    { name: '多维评估智能体', description: '执行技术、效果、使用、业务四维评估与打分' },
    { name: '报告生成智能体', description: '生成结构化评估报告与改进建议' },
  ],
  stats: {
    views: 1560,
    installs: 256,
    avgRating: 4.7,
    totalRatings: 112
  }
};

export function WorkflowDetailPage() {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleExperience = () => {
    // Navigate to canvas page
    navigate(`/studio/canvas/${workflowId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <button
            onClick={() => navigate('/galaxy')}
            className="w-8 h-8 rounded-lg bg-[#edf1f8]/80 hover:bg-[#d8e0ec] flex items-center justify-center transition-colors mb-4"
            title="返回首页"
          >
            <ArrowLeft className="w-4 h-4 text-[#4a5b73]" />
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{mockWorkflow.name}</h1>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 hover:bg-amber-50 rounded-md transition-colors"
                >
                  <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}`} />
                </button>
              </div>
              
              <p className="text-lg text-gray-600 mb-4">{mockWorkflow.description}</p>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                    {mockWorkflow.creator[0]}
                  </div>
                  <span>{mockWorkflow.creator}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>更新于 {mockWorkflow.updatedAt}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>{mockWorkflow.stats.views} 次查看</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleExperience}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 font-medium shadow-lg"
              >
                <Play className="w-5 h-5" />
                体验工作流
              </button>
              <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 font-medium">
                <Download className="w-5 h-5" />
                安装到我的空间
              </button>
              <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 font-medium">
                <Share2 className="w-5 h-5" />
                分享
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <GitBranch className="w-4 h-4" />
                  <span className="text-sm">节点数量</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{mockWorkflow.nodeCount}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">智能体数量</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{mockWorkflow.agentCount}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">安装次数</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{mockWorkflow.stats.installs}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">工作流详情</h2>
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {mockWorkflow.detailedDescription}
                </div>
              </div>
            </div>

            {/* Agents */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">包含的智能体</h2>
              <div className="space-y-3">
                {mockWorkflow.agents.map((agent, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{agent.name}</h3>
                      <p className="text-sm text-gray-600">{agent.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Info Card */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-900">基本信息</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">业务场景</div>
                  <div className="font-medium text-gray-900">{mockWorkflow.scene}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">创建者</div>
                  <div className="font-medium text-gray-900">{mockWorkflow.creator}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">更新时间</div>
                  <div className="font-medium text-gray-900">{mockWorkflow.updatedAt}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">使用次数</div>
                  <div className="font-medium text-gray-900">{mockWorkflow.usedBy} 次</div>
                </div>
              </div>
            </div>

            {/* Rating Card */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-900">用户评价</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">{mockWorkflow.stats.avgRating}</span>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(mockWorkflow.stats.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">{mockWorkflow.stats.totalRatings} 个评价</div>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-5 border border-blue-100">
              <h3 className="font-semibold mb-2 text-gray-900">快速开始</h3>
              <p className="text-sm text-gray-600 mb-4">
                点击体验按钮，立即在画布编辑器中试用此工作流
              </p>
              <button
                onClick={handleExperience}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Play className="w-4 h-4" />
                立即体验
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
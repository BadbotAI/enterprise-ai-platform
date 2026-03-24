import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { 
  Home,
  ArrowLeft,
  Send,
  Paperclip,
  GitBranch,
  Users,
  ChevronRight
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'chat' | 'log';
}

interface WorkflowNode {
  id: string;
  type: 'agent';
  name: string;
}

const EVALUATION_WORKFLOW_NODES = [
  '查询智能体基础信息',
  '查询运行日志',
  '技术架构评估',
  '效果能力评估',
  '使用情况评估',
  '业务指标评估',
  '综合评分计算',
  '问题归因与分级',
  '生成评估报告',
  '结束',
] as const;

export function WorkflowFactoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const workflowId = location.state?.workflowId;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '欢迎来到工作流智能工厂！这里已经为你加载了「智能体评估工作流」。你可以直接体验，也可以向我描述需要调整的部分。',
      type: 'chat'
    },
    {
      role: 'assistant',
      content: '已加载工作流：智能体评估工作流',
      type: 'log'
    },
    ...EVALUATION_WORKFLOW_NODES.slice(0, 3).map((name) => ({
      role: 'assistant' as const,
      content: `已就绪节点：${name}`,
      type: 'log' as const,
    })),
  ]);
  const [input, setInput] = useState('');

  const nodes = useMemo<WorkflowNode[]>(() =>
    EVALUATION_WORKFLOW_NODES.map((name, i) => ({
      id: `node-${i + 1}`,
      type: 'agent',
      name,
    })),
    []
  );

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input, type: 'chat' }]);
    setInput('');
    
    // 模拟AI回复
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '我理解了你的需求。我将为你调整工作流配置。',
        type: 'chat'
      }]);
    }, 500);
    
    // 模拟日志消息
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '正在更新工作流配置...',
        type: 'log'
      }]);
    }, 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header with back button */}
      <div className="bg-slate-900/50 border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/galaxy')}
            className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 flex items-center justify-center transition-all"
            title="返回首页"
          >
            <ArrowLeft className="w-4 h-4 text-white/70" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 via-pink-600 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">工作流智能工厂</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Chat */}
        <div className="w-[400px] border-r border-slate-700/50 flex flex-col bg-slate-900/50">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => {
              // 日志消息样式
              if (message.type === 'log') {
                return (
                  <div key={index} className="flex justify-center">
                    <div className="px-4 py-2 rounded-md bg-slate-800/40 border border-slate-600/30 text-slate-400 text-xs font-mono flex items-center gap-2 backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-sm shadow-green-400/50 animate-pulse" />
                      {message.content}
                    </div>
                  </div>
                );
              }
              
              // 普通对话消息样式
              return (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-lg backdrop-blur-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-slate-800/80 border border-slate-700/50 text-gray-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-6 bg-slate-900/80 border-t border-slate-700/50 flex-shrink-0">
            <div className="relative bg-slate-800/50 border-2 border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="描述你想要调整的部分..."
                className="w-full px-0 py-0 bg-transparent border-none focus:outline-none resize-none text-gray-100 placeholder-slate-500"
                rows={6}
              />
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-700/50">
                <button className="p-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg hover:bg-slate-700 transition-colors shadow-sm text-slate-300 hover:text-white">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-purple-500/30"
                >
                  <Send className="w-4 h-4" />
                  <span className="text-sm font-medium">发送</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Full Height Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Agent Visualization - Full Height */}
          <div className="flex-1 bg-slate-900/30 p-6 overflow-hidden flex flex-col min-h-0">
            {/* Title */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">工作流节点编排</h2>
              <p className="text-xs text-slate-500 mt-1">智能体评估 · 共 {nodes.length} 个节点 · 横向滚动查看</p>
            </div>
            
            <div className="flex-1 bg-slate-900/50 rounded-lg border border-slate-700/50 relative overflow-hidden backdrop-blur-sm min-h-0">
              {/* Grid Background - Cyber Style */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />

              <div className="relative w-full h-full overflow-x-auto overflow-y-hidden flex items-center">
                <div className="flex items-center px-8 py-10 min-h-min mx-auto">
                  {nodes.map((node, index) => (
                    <div key={node.id} className="flex items-center flex-shrink-0">
                      <div className="group">
                        <div className="bg-gradient-to-br from-purple-500 via-pink-600 to-orange-600 rounded-xl min-w-[140px] max-w-[200px] min-h-[88px] px-3 py-3 shadow-2xl shadow-purple-500/50 group-hover:shadow-purple-500/70 flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-all border-2 border-purple-400/50">
                          <span className="text-sm font-semibold text-white text-center leading-snug">{node.name}</span>
                        </div>
                      </div>
                      {index < nodes.length - 1 && (
                        <div className="flex items-center justify-center w-10 flex-shrink-0 px-1">
                          <ChevronRight className="w-6 h-6 text-purple-400/80" strokeWidth={2} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

                {/* Legend - Simplified */}
                <div className="absolute bottom-4 right-4 bg-slate-800/90 border border-slate-700/50 rounded-lg p-3 shadow-xl backdrop-blur-sm">
                  <div className="text-xs font-semibold text-purple-400 mb-2">图例</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-sm shadow-purple-500/50" />
                      <span className="text-xs text-gray-300">工作流节点</span>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

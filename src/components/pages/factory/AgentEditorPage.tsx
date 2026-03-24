import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { FactorySidebar } from '../../FactorySidebar';
import { BackButton } from '../../BackButton';
import { 
  Send, 
  Paperclip,
  Terminal,
  Settings,
  Layers,
  Wrench,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'chat' | 'log';
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export function AgentEditorPage() {
  const navigate = useNavigate();
  const { agentId } = useParams<{ agentId: string }>();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '欢迎来到智能体编辑器！我可以帮助你配置智能体的能力、工具和工作流。请告诉我你想要实现什么功能？',
      type: 'chat'
    }
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      timestamp: '14:23:05',
      message: '智能体初始化成功',
      level: 'success'
    },
    {
      id: 'log-2',
      timestamp: '14:23:06',
      message: '加载默认配置',
      level: 'info'
    },
    {
      id: 'log-3',
      timestamp: '14:23:08',
      message: '等待用户输入...',
      level: 'info'
    }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input, type: 'chat' }]);
    const userInput = input;
    setInput('');
    setIsProcessing(true);
    
    // 模拟AI回复
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '我理解了你的需求。让我为你配置智能体...',
        type: 'chat'
      }]);
      
      // 添加日志
      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        message: `处理用户请求: ${userInput.substring(0, 30)}...`,
        level: 'info'
      };
      setLogs(prev => [...prev, newLog]);
      setIsProcessing(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-amber-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-green-400/10 border-green-400/30';
      case 'warning':
        return 'bg-amber-400/10 border-amber-400/30';
      case 'error':
        return 'bg-red-400/10 border-red-400/30';
      default:
        return 'bg-slate-400/10 border-slate-400/30';
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      <FactorySidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton defaultPath="/factory/workshop/wip" />
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="text-lg font-semibold text-gray-900">
              {agentId === 'new' ? '新建智能体' : `编辑智能体 #${agentId}`}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              配置
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              保存草稿
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Chat */}
          <div className="w-[420px] border-r border-gray-200 flex flex-col bg-white">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => {
                // 日志消息样式
                if (message.type === 'log') {
                  return (
                    <div key={index} className="flex justify-center">
                      <div className="px-4 py-2 rounded-md bg-gray-100 border border-gray-200 text-gray-600 text-xs font-mono flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
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
                      className={`max-w-[80%] px-4 py-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white'
                          : 'bg-gray-100 border border-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                );
              })}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">思考中...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="relative bg-white border-2 border-gray-200 rounded-xl p-4 focus-within:border-blue-500 transition-colors">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="描述你想要的智能体能力..."
                  className="w-full px-0 py-0 bg-transparent border-none focus:outline-none resize-none text-gray-900 placeholder-gray-400"
                  rows={4}
                />
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-sm font-medium">发送</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Canvas and Logs */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {/* 2.5D Factory Canvas - 2/3 Height */}
            <div className="flex-[2] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 overflow-hidden relative">
              {/* Factory Background Grid */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px',
                  transform: 'perspective(500px) rotateX(60deg)',
                  transformOrigin: 'center top'
                }}
              />

              {/* Factory Title */}
              <div className="relative z-10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">智能体工厂</h2>
                    <p className="text-sm text-slate-400">2.5D 可视化构建</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <button className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors text-emerald-400">
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors text-amber-400">
                      <Pause className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors text-slate-400">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Factory Production Line - 2.5D Isometric View */}
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="relative" style={{ transform: 'perspective(1000px) rotateX(15deg) rotateY(-5deg)' }}>
                  {/* Main Factory Building */}
                  <div className="relative">
                    {/* Building Base */}
                    <div className="w-96 h-64 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl border-4 border-slate-600 shadow-2xl relative overflow-hidden">
                      {/* Windows Pattern */}
                      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-4 p-6">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div 
                            key={i} 
                            className="bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded border border-cyan-400/50 shadow-inner animate-pulse"
                            style={{ animationDelay: `${i * 100}ms`, animationDuration: '3s' }}
                          />
                        ))}
                      </div>

                      {/* Factory Sign */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-lg">
                        <span className="text-white font-bold text-sm">AI Agent Factory</span>
                      </div>

                      {/* Processing Indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-slate-900/80 rounded-lg border border-slate-600">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                        <span className="text-xs text-emerald-400 font-semibold">生产中</span>
                      </div>
                    </div>

                    {/* Conveyor Belt */}
                    <div className="absolute -bottom-8 left-0 right-0 h-16 bg-gradient-to-r from-slate-600 via-slate-700 to-slate-600 rounded-lg border-2 border-slate-500 shadow-xl">
                      {/* Belt Movement Lines */}
                      <div className="absolute inset-0 flex items-center overflow-hidden">
                        <div className="flex gap-8 animate-scroll">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="w-2 h-8 bg-slate-500/50 rounded-full flex-shrink-0" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Robotic Arms */}
                    <div className="absolute -top-12 left-16 w-24 h-32">
                      <div className="w-4 h-24 bg-gradient-to-b from-slate-600 to-slate-700 rounded-t-lg border-2 border-slate-500 shadow-lg" />
                      <div className="w-16 h-4 bg-gradient-to-r from-slate-700 to-slate-800 rounded border-2 border-slate-500 shadow-lg animate-pulse" style={{ marginTop: '-4px', marginLeft: '-6px' }} />
                    </div>
                    <div className="absolute -top-12 right-16 w-24 h-32">
                      <div className="w-4 h-24 bg-gradient-to-b from-slate-600 to-slate-700 rounded-t-lg border-2 border-slate-500 shadow-lg ml-auto" />
                      <div className="w-16 h-4 bg-gradient-to-r from-slate-700 to-slate-800 rounded border-2 border-slate-500 shadow-lg animate-pulse" style={{ marginTop: '-4px', marginLeft: 'auto', marginRight: '-6px' }} />
                    </div>
                  </div>

                  {/* Floating Components */}
                  <div className="absolute -left-32 top-20 flex flex-col gap-3">
                    <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg border border-purple-400/50 text-white text-xs font-semibold flex items-center gap-2 animate-bounce" style={{ animationDuration: '2s' }}>
                      <Wrench className="w-4 h-4" />
                      工具模块
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg shadow-lg border border-emerald-400/50 text-white text-xs font-semibold flex items-center gap-2 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                      <Layers className="w-4 h-4" />
                      技能模块
                    </div>
                  </div>
                </div>
              </div>

              <style>{`
                @keyframes scroll {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                  animation: scroll 3s linear infinite;
                  width: max-content;
                }
              `}</style>
            </div>

            {/* Log Panel - 1/3 Height */}
            <div className="flex-[1] bg-white p-6 overflow-hidden flex flex-col border-t border-gray-200">
              {/* Log Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    执行日志
                  </h2>
                </div>
                <button
                  onClick={() => setLogs([])}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  清空日志
                </button>
              </div>

              {/* Log Content */}
              <div className="flex-1 overflow-y-auto space-y-2 font-mono text-sm">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${getLevelBg(log.level)}`}
                  >
                    <span className="text-xs text-gray-500 flex-shrink-0 w-20">
                      {log.timestamp}
                    </span>
                    <span className={`flex-1 ${getLevelColor(log.level)}`}>
                      {log.message}
                    </span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无日志</p>
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
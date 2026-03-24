import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip,
  Terminal,
  Plus,
  MessageSquare,
  Zap,
  Settings,
  Code,
  FileText,
  Database,
  Layers,
  Wrench,
  Sparkles,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'chat' | 'log';
}

interface AgentNode {
  id: string;
  type: 'agent' | 'sub-agent';
  name: string;
  x: number;
  y: number;
  parentId?: string;
  children?: string[];
}

interface LogEntry {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

interface SlashCommand {
  id: string;
  command: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

export function SuperFactoryPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '欢迎来到智能体超级工厂！我可以帮助你构建和配置智能体。请告诉我你想创建什么样的智能体？',
      type: 'chat'
    },
    {
      role: 'assistant',
      content: '已创建主智能体',
      type: 'log'
    },
    {
      role: 'assistant',
      content: '已创建数据采集智能体',
      type: 'log'
    },
    {
      role: 'assistant',
      content: '已创建分析预测智能体',
      type: 'log'
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(true);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [slashPosition, setSlashPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock skills and tools data
  const skills = [
    { id: 'skill-1', name: '价格预测', description: '基于多因子模型预测大宗商品价格走势', color: 'from-emerald-500 to-teal-600' },
    { id: 'skill-2', name: '供需分析', description: '构建供需平衡表与库存分析', color: 'from-blue-500 to-cyan-600' },
    { id: 'skill-3', name: '风险预警', description: '多维度风险识别与预警信号生成', color: 'from-purple-500 to-pink-600' },
    { id: 'skill-4', name: '研报生成', description: '自动生成产业链研究报告', color: 'from-orange-500 to-amber-600' },
  ];

  const tools = [
    { id: 'tool-1', name: '期货行情API', description: '大宗商品实时行情数据', icon: '📈', status: 'active' },
    { id: 'tool-2', name: 'AIS船舶追踪', description: '全球船舶实时定位追踪', icon: '🚢', status: 'active' },
    { id: 'tool-3', name: '供应链数据库', description: '供需库存产能数据查询', icon: '🗄', status: 'active' },
    { id: 'tool-4', name: '气象数据接口', description: '全球气象预测数据服务', icon: '🌤', status: 'inactive' },
  ];

  // Slash commands
  const slashCommands: SlashCommand[] = [
    {
      id: 'new-agent',
      command: '/new',
      description: '创建新智能体',
      icon: <Plus className="w-4 h-4" />,
      category: '创建'
    },
    {
      id: 'chat',
      command: '/chat',
      description: '切换到对话模式',
      icon: <MessageSquare className="w-4 h-4" />,
      category: '模式'
    },
    {
      id: 'optimize',
      command: '/optimize',
      description: '优化当前工作流',
      icon: <Zap className="w-4 h-4" />,
      category: '优化'
    },
    {
      id: 'config',
      command: '/config',
      description: '配置智能体参数',
      icon: <Settings className="w-4 h-4" />,
      category: '设置'
    },
    {
      id: 'code',
      command: '/code',
      description: '生成代码片段',
      icon: <Code className="w-4 h-4" />,
      category: '生成'
    },
    {
      id: 'template',
      command: '/template',
      description: '使用预设模板',
      icon: <FileText className="w-4 h-4" />,
      category: '模板'
    },
    {
      id: 'data',
      command: '/data',
      description: '导入数据源',
      icon: <Database className="w-4 h-4" />,
      category: '数据'
    }
  ];

  // 示例节点数据 - 智能体及其子节点，线性排开
  const [nodes] = useState<AgentNode[]>([
    // 主智能体
    { 
      id: 'agent-1', 
      type: 'agent', 
      name: '主智能体', 
      x: 200, 
      y: 250,
      children: ['sub-1', 'sub-2']
    },
    
    // 子智能体 - 线性排列
    { 
      id: 'sub-1', 
      type: 'sub-agent', 
      name: '数据采集智能体',
      x: 500,
      y: 250,
      parentId: 'agent-1'
    },
    { 
      id: 'sub-2', 
      type: 'sub-agent', 
      name: '分析预测智能体',
      x: 800,
      y: 250,
      parentId: 'agent-1'
    }
  ]);

  // Mock log data
  const [logs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      agentId: 'agent-1',
      agentName: '主智能体',
      timestamp: '14:23:01',
      message: '智能体初始化完成',
      level: 'success'
    },
    {
      id: 'log-2',
      agentId: 'agent-1',
      agentName: '主智能体',
      timestamp: '14:23:02',
      message: '加载配置文件: config.json',
      level: 'info'
    },
    {
      id: 'log-3',
      agentId: 'sub-1',
      agentName: '数据采集智能体',
      timestamp: '14:23:05',
      message: '开始数据采集流程',
      level: 'info'
    },
    {
      id: 'log-4',
      agentId: 'sub-1',
      agentName: '数据采集智能体',
      timestamp: '14:23:08',
      message: '数据源接入完成: 3个数据通道',
      level: 'success'
    },
    {
      id: 'log-5',
      agentId: 'sub-2',
      agentName: '分析预测智能体',
      timestamp: '14:23:10',
      message: '接收分析预测请求',
      level: 'info'
    },
    {
      id: 'log-6',
      agentId: 'sub-2',
      agentName: '分析预测智能体',
      timestamp: '14:23:12',
      message: '预测模型加载 1/3',
      level: 'info'
    },
    {
      id: 'log-7',
      agentId: 'agent-1',
      agentName: '主智能体',
      timestamp: '14:23:15',
      message: '监控所有子智能体运行状态',
      level: 'info'
    },
    {
      id: 'log-8',
      agentId: 'sub-2',
      agentName: '分析预测智能体',
      timestamp: '14:23:18',
      message: '预测模型加载 2/3',
      level: 'info'
    },
    {
      id: 'log-9',
      agentId: 'sub-2',
      agentName: '分析预测智能体',
      timestamp: '14:23:21',
      message: '警告: 处理时间超过预期',
      level: 'warning'
    },
    {
      id: 'log-10',
      agentId: 'sub-2',
      agentName: '分析预测智能体',
      timestamp: '14:23:25',
      message: '预测模型加载 3/3',
      level: 'info'
    },
    {
      id: 'log-11',
      agentId: 'sub-2',
      agentName: '分析预测智能体',
      timestamp: '14:23:28',
      message: '所有分析预测任务完成',
      level: 'success'
    },
    {
      id: 'log-12',
      agentId: 'agent-1',
      agentName: '主智能体',
      timestamp: '14:23:30',
      message: '工作流执行成功',
      level: 'success'
    }
  ]);

  // Handle input change and detect slash
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setInput(value);
    
    // Check if user typed "/" at cursor position
    if (value[cursorPosition - 1] === '/' && (cursorPosition === 1 || value[cursorPosition - 2] === ' ' || value[cursorPosition - 2] === '\n')) {
      setShowSlashMenu(true);
      setSlashPosition(cursorPosition - 1);
      setSelectedCommandIndex(0);
    } else if (showSlashMenu) {
      // Check if we should close the menu
      const textAfterSlash = value.substring(slashPosition);
      if (!textAfterSlash.startsWith('/') || textAfterSlash.includes(' ') || textAfterSlash.includes('\n')) {
        setShowSlashMenu(false);
      }
    }
  };

  // Handle command selection
  const selectCommand = (command: SlashCommand) => {
    const beforeSlash = input.substring(0, slashPosition);
    const afterSlash = input.substring(slashPosition + 1);
    const afterSpace = afterSlash.substring(afterSlash.indexOf(' ') >= 0 ? afterSlash.indexOf(' ') : afterSlash.length);
    
    const newInput = beforeSlash + command.command + ' ' + afterSpace;
    setInput(newInput);
    setShowSlashMenu(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPosition = beforeSlash.length + command.command.length + 1;
      textareaRef.current?.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Handle keyboard navigation in slash menu
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSlashMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex((prev) => (prev + 1) % slashCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex((prev) => (prev - 1 + slashCommands.length) % slashCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectCommand(slashCommands[selectedCommandIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
      }
      return;
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Close slash menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showSlashMenu) {
        setShowSlashMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSlashMenu]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input, type: 'chat' }]);
    setInput('');
    
    // 模拟AI回复
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '我理解了你的需求。我将为你创建一个智能体，包含以下能力：数据采集、分析预测和风险预警。',
        type: 'chat'
      }]);
    }, 500);
    
    // 模拟日志消息
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '正在创建智能体...',
        type: 'log'
      }]);
    }, 1000);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '已创建分析智能体',
        type: 'log'
      }]);
    }, 1500);
  };

  const handleAgentClick = (agentId: string) => {
    setSelectedAgentId(agentId);
    setShowAllLogs(false);
  };

  const filteredLogs = showAllLogs 
    ? logs 
    : logs.filter(log => log.agentId === selectedAgentId);

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
    <div className="h-screen flex flex-col bg-slate-950">
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
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-800/80 border border-slate-700/50 text-gray-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input - Full Width Textarea */}
          <div className="p-6 bg-slate-900/80 border-t border-slate-700/50 flex-shrink-0">
            <div className="relative">
              {/* Slash Command Menu */}
              {showSlashMenu && (
                <div 
                  className="absolute bottom-full left-0 mb-2 w-80 bg-slate-800/95 border border-slate-700/50 rounded-lg shadow-2xl backdrop-blur-md overflow-hidden z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="px-4 py-2 border-b border-slate-700/50 bg-slate-900/50">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-semibold text-cyan-400">快捷命令</span>
                      <span className="text-xs text-slate-500 ml-auto">↑↓ 选择 · Enter 确认 · Esc 关闭</span>
                    </div>
                  </div>
                  
                  {/* Commands List */}
                  <div className="max-h-64 overflow-y-auto">
                    {slashCommands.map((cmd, index) => (
                      <button
                        key={cmd.id}
                        onClick={() => selectCommand(cmd)}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${
                          index === selectedCommandIndex
                            ? 'bg-cyan-500/20 border-l-2 border-cyan-400'
                            : 'hover:bg-slate-700/50 border-l-2 border-transparent'
                        }`}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                          index === selectedCommandIndex
                            ? 'bg-cyan-500/30 text-cyan-400'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}>
                          {cmd.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold font-mono ${
                              index === selectedCommandIndex ? 'text-cyan-300' : 'text-slate-300'
                            }`}>
                              {cmd.command}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                              {cmd.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{cmd.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Footer Tip */}
                  <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-900/50">
                    <p className="text-xs text-slate-500">
                      💡 输入 <span className="font-mono text-cyan-400">/</span> 可随时调出命令面板
                    </p>
                  </div>
                </div>
              )}

              <div className="relative bg-slate-800/50 border-2 border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="描述你想创建的智能体...（输入 / 查看快捷命令）"
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
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-sm font-medium">发送</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Canvas and Logs */}
        <div className="flex-1 flex flex-col">
          {/* Agent Visualization - 2/3 Height */}
          <div className="flex-[2] bg-slate-900/30 p-6 overflow-hidden flex flex-col border-b border-slate-700/50">
            {/* Title */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">智能体节点工作流</h2>
            </div>
            
            <div className="flex-1 bg-slate-900/50 rounded-lg border border-slate-700/50 relative overflow-hidden backdrop-blur-sm">
              {/* Grid Background - Cyber Style */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Agent Nodes - Linear Layout */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Connection Lines - Linear */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Main agent to first sub-agent */}
                  <line x1="200" y1="250" x2="500" y2="250" stroke="url(#gradient1)" strokeWidth="3" markerEnd="url(#arrowcyan)" opacity="0.8" />
                  
                  {/* First sub-agent to second sub-agent */}
                  <line x1="500" y1="250" x2="800" y2="250" stroke="url(#gradient1)" strokeWidth="3" markerEnd="url(#arrowcyan)" opacity="0.8" />
                  
                  {/* Gradients and markers */}
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <marker id="arrowcyan" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                      <path d="M0,0 L0,6 L9,3 z" fill="#06b6d4" />
                    </marker>
                  </defs>
                </svg>

                {/* Main Agent */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: 200, top: 250 }}
                  onClick={() => handleAgentClick('agent-1')}
                >
                  <div className={`bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-xl w-48 h-28 shadow-2xl group-hover:shadow-cyan-500/70 flex items-center justify-center cursor-pointer hover:scale-105 transition-all border-2 ${
                    selectedAgentId === 'agent-1' ? 'border-cyan-300 shadow-cyan-300/50 ring-2 ring-cyan-400/50' : 'border-cyan-400/50 shadow-cyan-500/50'
                  }`}>
                    <span className="text-lg font-bold text-white">主智能体</span>
                  </div>
                </div>

                {/* Sub Agent 1 */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: 500, top: 250 }}
                  onClick={() => handleAgentClick('sub-1')}
                >
                  <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-48 h-28 shadow-2xl group-hover:shadow-blue-500/70 flex items-center justify-center cursor-pointer hover:scale-105 transition-all border-2 ${
                    selectedAgentId === 'sub-1' ? 'border-blue-300 shadow-blue-300/50 ring-2 ring-blue-400/50' : 'border-blue-400/50 shadow-blue-500/50'
                  }`}>
                    <span className="text-base font-semibold text-white text-center px-2">数据采集智能体</span>
                  </div>
                </div>

                {/* Sub Agent 2 */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: 800, top: 250 }}
                  onClick={() => handleAgentClick('sub-2')}
                >
                  <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-48 h-28 shadow-2xl group-hover:shadow-blue-500/70 flex items-center justify-center cursor-pointer hover:scale-105 transition-all border-2 ${
                    selectedAgentId === 'sub-2' ? 'border-blue-300 shadow-blue-300/50 ring-2 ring-blue-400/50' : 'border-blue-400/50 shadow-blue-500/50'
                  }`}>
                    <span className="text-base font-semibold text-white text-center px-2">分析预测智能体</span>
                  </div>
                </div>

                {/* Legend - Simplified */}
                <div className="absolute bottom-4 right-4 bg-slate-800/90 border border-slate-700/50 rounded-lg p-3 shadow-xl backdrop-blur-sm">
                  <div className="text-xs font-semibold text-cyan-400 mb-2">图例</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg shadow-sm shadow-cyan-500/50" />
                      <span className="text-xs text-gray-300">主智能体</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm shadow-blue-500/50" />
                      <span className="text-xs text-gray-300">子智能体</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills and Tools Section */}
              <div className="mt-6 space-y-4 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                {/* Skills Cards */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-slate-300">技能集合</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-700/50 to-transparent" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="group relative bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all cursor-pointer backdrop-blur-sm"
                      >
                        {/* Gradient Accent */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${skill.color} rounded-t-lg opacity-60 group-hover:opacity-100 transition-opacity`} />
                        
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${skill.color} rounded-lg flex items-center justify-center shadow-lg`}>
                            <Layers className="w-5 h-5 text-white" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-200 mb-1 group-hover:text-white transition-colors">
                              {skill.name}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {skill.description}
                            </p>
                          </div>
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tools Cards */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-slate-300">工具集成</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-700/50 to-transparent" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {tools.map((tool) => (
                      <div
                        key={tool.id}
                        className="group relative bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all cursor-pointer backdrop-blur-sm"
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center shadow-lg border border-slate-600/50 group-hover:from-slate-600 group-hover:to-slate-700 transition-all">
                            <span className="text-xl">{tool.icon}</span>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors font-mono">
                                {tool.name}
                              </h4>
                              {/* Status Badge */}
                              <div className={`flex items-center gap-1 ${
                                tool.status === 'active' ? 'text-emerald-400' : 'text-slate-500'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  tool.status === 'active' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse' : 'bg-slate-500'
                                }`} />
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {tool.description}
                            </p>
                          </div>
                        </div>

                        {/* Corner Decoration */}
                        <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-slate-600/30 group-hover:border-cyan-500/50 transition-colors" />
                        <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-slate-600/30 group-hover:border-cyan-500/50 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Log Panel - 1/3 Height */}
          <div className="flex-[1] bg-slate-900/30 p-6 overflow-hidden flex flex-col">
            {/* Log Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  执行日志
                </h2>
                {!showAllLogs && selectedAgentId && (
                  <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
                    {nodes.find(n => n.id === selectedAgentId)?.name}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowAllLogs(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  showAllLogs
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                全部
              </button>
            </div>

            {/* Log Content */}
            <div className="flex-1 bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-y-auto backdrop-blur-sm">
              <div className="p-4 space-y-2 font-mono text-xs">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`flex items-start gap-3 p-2 rounded border ${getLevelBg(log.level)} backdrop-blur-sm`}
                    >
                      <span className="text-slate-500 flex-shrink-0">[{log.timestamp}]</span>
                      <span className={`${getLevelColor(log.level)} font-semibold flex-shrink-0`}>
                        {log.agentName}
                      </span>
                      <span className="text-slate-300 flex-1">{log.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-8">
                    <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>暂无日志</p>
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

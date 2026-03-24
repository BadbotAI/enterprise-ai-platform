import { useState, useRef, useEffect } from 'react';
import { Agent } from '../data/mockData';
import { X, Send, Paperclip, Settings, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router';

interface AgentExperienceDrawerProps {
  agent: Agent;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
}

export function AgentExperienceDrawer({ agent, onClose }: AgentExperienceDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: `欢迎体验「${agent.name}」！请输入你的问题或上传相关文档。`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const agentMessage: Message = {
        role: 'agent',
        content: `这是${agent.name}的模拟回复。在实际使用中，我会根据您的输入进行专业分析和处理。\n\n基于您的问题，我建议：\n1. 首先进行初步评估\n2. 识别关键风险点\n3. 提供具体改进建议`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-[600px] h-full bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">{agent.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{agent.version}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/marketplace/${agent.id}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                查看详情
              </Link>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'system' ? (
                <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-lg max-w-[80%]">
                  {message.content}
                </div>
              ) : (
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <span className={`text-xs mt-2 block ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                <span className="text-sm text-gray-600">思考中...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-200">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你的问题..."
              className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            按 Enter 发送，Shift+Enter 换行
          </p>
        </div>
      </div>
    </div>
  );
}
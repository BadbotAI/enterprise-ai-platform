import { FactorySidebar } from '../../FactorySidebar';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Bot, ChevronRight, Sparkles, Play, Rocket, X, Cpu, Layers, CheckCircle2, Factory } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { mockAgents } from '../../../data/mockData';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface CanvasState {
  showTools: boolean;
  showSkills: boolean;
  toolItems: string[];
  skillItems: string[];
  connected: boolean;
}

// ===== Streaming text hook =====
function useStreamText() {
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const cancelRef = useRef(false);

  const stream = useCallback((text: string, speed = 30): Promise<string> => {
    return new Promise((resolve) => {
      cancelRef.current = false;
      setIsStreaming(true);
      setStreamingText('');
      let i = 0;
      const tick = () => {
        if (cancelRef.current) { resolve(text); return; }
        if (i < text.length) {
          setStreamingText(text.slice(0, i + 1));
          i++;
          setTimeout(tick, speed);
        } else {
          setIsStreaming(false);
          resolve(text);
        }
      };
      tick();
    });
  }, []);

  return { streamingText, isStreaming, stream, setStreamingText, setIsStreaming };
}

// ===== Trial Chat Panel (right-side slide-in) =====
function TrialChatPanel({ onClose, agentName }: { onClose: () => void; agentName: string }) {
  const agentDesc = agentName.includes('价格')
    ? `基于多因子模型的大宗商品价格预测引擎`
    : agentName.includes('供需')
    ? `供需平衡分析与库存监测助手`
    : `AI 驱动的供应链智能分析引擎`;

  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: `你好！我是${agentName}，请输入商品品种或供应链关键词，我将为你提供相关分析与预测。` },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const mockResponses: Record<string, string> = {
    default: '根据你的查询，已完成该品种近30日价格走势分析。当前现货价格较上周上涨2.3%，期货升水收窄至15元/吨。主要港口库存环比下降8%，供需偏紧格局延续。需要查看详细的供需平衡表和价格预测报告吗？',
    '铁矿石': '铁矿石方面：普氏62%指数报108.5美元/吨，较上周涨3.2%。澳巴发货量环比增加5%，但到港量偏低。45港铁矿库存1.28亿吨，连续3周去库。预计短期价格偏强运行，关注钢厂补库节奏。',
    '大豆': '大豆方面：CBOT大豆期货收于1285美分/蒲式耳。巴西收割进度达65%，产量预估上调至1.55亿吨。国内港口大豆库存720万吨，油厂开机率偏低。预计进口到港成本维持在4200元/吨左右。',
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const key = Object.keys(mockResponses).find(k => userMsg.includes(k)) || 'default';
      setMessages(prev => [...prev, { role: 'assistant', content: mockResponses[key] }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="w-[380px] flex flex-col bg-white/80 backdrop-blur-xl flex-shrink-0 overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#edf1f8] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#0d1b2a] rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>{agentName}</h3>
            <p className="text-[11px] text-[#a3b1c6]">{agentDesc}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f4f6fa] transition-colors">
          <X className="w-4 h-4 text-[#7d8da1]" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[90%]">
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 bg-[#0d1b2a] rounded flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[11px] text-[#a3b1c6]">{agentName}</span>
                </div>
              )}
              <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#0d1b2a] text-white rounded-br-md'
                  : 'bg-[#f4f6fa] text-[#4a5b73] border border-[#edf1f8] rounded-bl-md'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#f4f6fa] border border-[#edf1f8] rounded-xl px-4 py-3 rounded-bl-md">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#0d1b2a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#0d1b2a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#0d1b2a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] text-[#7d8da1]">分析中...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#edf1f8] flex-shrink-0">
        <div className="flex items-center gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入商品品种或供应链关键词..."
            className="flex-1 px-4 py-2.5 bg-[#f8f9fc] border border-[#e2e8f0] rounded-xl text-sm text-[#0d1b2a] placeholder-[#a3b1c6] outline-none focus:border-[#0d1b2a]/30 transition-colors" />
          <button onClick={handleSend} disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 bg-[#0d1b2a] hover:bg-[#1b2d45] text-white rounded-xl text-sm transition-colors disabled:opacity-30">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Main Page =====
export function WorkshopCreatePage() {
  const navigate = useNavigate();
  const { agentId } = useParams<{ agentId: string }>();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    showTools: false,
    showSkills: false,
    toolItems: [],
    skillItems: [],
    connected: false,
  });
  const [isTyping, setIsTyping] = useState(false);
  const [showTrialChat, setShowTrialChat] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [version, setVersion] = useState('');
  const [hasStartedFlow, setHasStartedFlow] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [showPublishedCard, setShowPublishedCard] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { streamingText, isStreaming, stream, setStreamingText, setIsStreaming } = useStreamText();
  const streamingMsgIdRef = useRef<string | null>(null);

  const PRE_FILLED_PROMPT = '我需要一个价格预测智能体，能根据供需数据、船运信息和宏观指标预测铁矿石价格走势';
  const [agentName, setAgentName] = useState('新建智能体');

  // Load existing agent data when editing
  const editingAgent = agentId ? mockAgents.find(a => a.id === agentId) : null;

  useEffect(() => {
    if (editingAgent && !hasStartedFlow) {
      setAgentName(editingAgent.name);
      setCanvasState({
        showTools: true,
        showSkills: true,
        toolItems: editingAgent.tools || [],
        skillItems: editingAgent.tags?.slice(0, 3) || [],
        connected: true,
      });
      setHasStartedFlow(true);
      setOnboardingDone(true);
      setMessages([
        { id: 'edit-open', role: 'assistant', content: `已加载智能体「${editingAgent.name}」的配置。\n\n当前配置：\n  • 模型：${editingAgent.models?.join(', ') || '未配置'}\n  • 工具：${editingAgent.tools?.join(', ') || '未配置'}\n  • 版本：${editingAgent.version}\n\n你可以继续调整配置，或直接点击「试用」测试效果。`, timestamp: now(), isStreaming: false },
      ]);
    }
  }, [editingAgent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, streamingText]);

  const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    if (onboardingDone) return;
    const openingText = '你好！我是智能体生产助手。请描述你需要的智能体类型和核心功能，我将为你自动规划架构、配置工具与技能模块，并生成可运行的智能体。';
    const msgId = `a-opening`;
    streamingMsgIdRef.current = msgId;

    const runOpening = async () => {
      setMessages([{ id: msgId, role: 'assistant', content: '', timestamp: now(), isStreaming: true }]);
      await stream(openingText, 35);
      setMessages([{ id: msgId, role: 'assistant', content: openingText, timestamp: now(), isStreaming: false }]);
      streamingMsgIdRef.current = null;
      setOnboardingDone(true);
      setInput(PRE_FILLED_PROMPT);
    };
    runOpening();
  }, []);

  useEffect(() => {
    if (streamingMsgIdRef.current && isStreaming) {
      setMessages(prev => prev.map(m =>
        m.id === streamingMsgIdRef.current ? { ...m, content: streamingText } : m
      ));
    }
  }, [streamingText, isStreaming]);

  // ===== Production flow - sequential tool/skill loading =====
  const runProductionFlow = useCallback(async () => {
    const toolNames = ['期货行情API', 'AIS船舶追踪', '供应链数据库'];
    const skillNames = ['价格预测模型', '供需平衡分析', '风险预警评估'];

    // Step 1: Analysis
    const msg1Id = `a-step-1-${Date.now()}`;
    streamingMsgIdRef.current = msg1Id;
    setMessages(prev => [...prev, { id: msg1Id, role: 'assistant', content: '', timestamp: now(), isStreaming: true }]);
    const step1Text = '正在分析你的需求...\n\n已识别核心场景：大宗商品价格预测与供需分析\n目标：构建一个能根据供需数据、船运信息和宏观指标预测铁矿石价格走势的智能体。';
    await stream(step1Text, 25);
    setMessages(prev => prev.map(m => m.id === msg1Id ? { ...m, content: step1Text, isStreaming: false } : m));
    streamingMsgIdRef.current = null;

    await new Promise(r => setTimeout(r, 600));

    // Step 2: System msg + Tool items one by one
    const sys1Id = `sys-tool-${Date.now()}`;
    setMessages(prev => [...prev, { id: sys1Id, role: 'system', content: '正在配置工具模块...', timestamp: now() }]);
    setCanvasState(prev => ({ ...prev, showTools: true }));

    await new Promise(r => setTimeout(r, 400));

    for (let i = 0; i < toolNames.length; i++) {
      setCanvasState(prev => ({ ...prev, toolItems: [...prev.toolItems, toolNames[i]] }));
      await new Promise(r => setTimeout(r, 500));
    }

    await new Promise(r => setTimeout(r, 300));

    const msg2Id = `a-step-2-${Date.now()}`;
    streamingMsgIdRef.current = msg2Id;
    setMessages(prev => [...prev, { id: msg2Id, role: 'assistant', content: '', timestamp: now(), isStreaming: true }]);
    const step2Text = '为该智能体配置了以下工具：\n\n  • 期货行情API — 对接大商所、上期所等大宗商品实时行情数据\n  • AIS船舶追踪 — 全球铁矿石运输船舶实时定位与到港预测\n  • 供应链数据库 — 矿山产能、港口库存、钢厂需求等供需数据查询';
    await stream(step2Text, 22);
    setMessages(prev => prev.map(m => m.id === msg2Id ? { ...m, content: step2Text, isStreaming: false } : m));
    streamingMsgIdRef.current = null;

    await new Promise(r => setTimeout(r, 600));

    // Step 3: System msg + Skill items one by one
    const sys2Id = `sys-skill-${Date.now()}`;
    setMessages(prev => [...prev, { id: sys2Id, role: 'system', content: '正在加载技能模块...', timestamp: now() }]);
    setCanvasState(prev => ({ ...prev, showSkills: true }));

    await new Promise(r => setTimeout(r, 400));

    for (let i = 0; i < skillNames.length; i++) {
      setCanvasState(prev => ({ ...prev, skillItems: [...prev.skillItems, skillNames[i]] }));
      await new Promise(r => setTimeout(r, 500));
    }

    await new Promise(r => setTimeout(r, 300));

    const msg3Id = `a-step-3-${Date.now()}`;
    streamingMsgIdRef.current = msg3Id;
    setMessages(prev => [...prev, { id: msg3Id, role: 'assistant', content: '', timestamp: now(), isStreaming: true }]);
    const step3Text = '为该智能体配置了以下技能：\n\n  • 价格预测模型 — 基于多因子回归与机器学习的价格走势预测\n  • 供需平衡分析 — 自动构建供需平衡表并识别拐点信号\n  • 风险预警评估 — 多维度风险指标监控与预警信号生成';
    await stream(step3Text, 22);
    setMessages(prev => prev.map(m => m.id === msg3Id ? { ...m, content: step3Text, isStreaming: false } : m));
    streamingMsgIdRef.current = null;

    await new Promise(r => setTimeout(r, 500));

    setCanvasState(prev => ({ ...prev, connected: true }));

    await new Promise(r => setTimeout(r, 400));

    const msg4Id = `a-step-4-${Date.now()}`;
    streamingMsgIdRef.current = msg4Id;
    setMessages(prev => [...prev, { id: msg4Id, role: 'assistant', content: '', timestamp: now(), isStreaming: true }]);
    const step4Text = '智能体架构生成完成！\n\n价格预测智能体 已完成全部模块配置：\n  • 3 个工具模块就绪\n  • 3 个技能模块就绪\n  • 核心调度引擎已初始化\n\n你可以点击右上角「试用」按钮体验智能体，或点击「发布」将其部署上线。';
    await stream(step4Text, 22);
    setMessages(prev => prev.map(m => m.id === msg4Id ? { ...m, content: step4Text, isStreaming: false } : m));
    streamingMsgIdRef.current = null;

    setIsTyping(false);
    setHasStartedFlow(true);
  }, [stream]);

  const extractAgentName = (text: string): string => {
    const patterns = [
      /(?:一个|一款)(.{2,12}智能体)/,
      /(?:一个|一款)(.{2,12}助手)/,
      /(?:创建|构建|生成|开发)(.{2,12}智能体)/,
      /(?:创建|构建|生成|开发)(.{2,12}助手)/,
    ];
    for (const p of patterns) {
      const match = text.match(p);
      if (match) return match[1];
    }
    return text.length > 10 ? text.slice(0, 10) + '...' : text;
  };

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: input, timestamp: now() };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');

    if (!hasStartedFlow) {
      const name = extractAgentName(userInput);
      setAgentName(name);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        runProductionFlow();
      }, 800);
    } else {
      setIsTyping(true);
      const msgId = `a-reply-${Date.now()}`;
      setTimeout(async () => {
        setIsTyping(false);
        streamingMsgIdRef.current = msgId;
        const replyText = `收到。正在根据你的补充需求调整智能体配置...调整完成，「${agentName}」已更新。`;
        setMessages(prev => [...prev, { id: msgId, role: 'assistant', content: '', timestamp: now(), isStreaming: true }]);
        await stream(replyText, 30);
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: replyText, isStreaming: false } : m));
        streamingMsgIdRef.current = null;
      }, 1200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handlePublish = () => {
    setIsPublished(true);
    setVersion('v1.0.0');
    const newAgent = {
      id: `new-${Date.now()}`,
      name: agentName,
      version: 'v1.0.0',
      type: 'single',
      description: `基于用户需求自动生成的智能体：${agentName}`,
      tags: ['最新发布', '价格预测'],
      publishDate: new Date().toISOString().split('T')[0],
      successRate: 100, callCount: 0, models: [] as string[],
      tools: canvasState.toolItems,
      publishStatus: 'published', status: 'normal',
      creator: { name: '当前用户', avatar: '' },
    };
    const existing = JSON.parse(localStorage.getItem('newlyPublishedAgents') || '[]');
    existing.push(newAgent);
    localStorage.setItem('newlyPublishedAgents', JSON.stringify(existing));
    setShowPublishedCard(true);
  };

  // Auto-dismiss published card after 6s
  useEffect(() => {
    if (!showPublishedCard) return;
    const timer = setTimeout(() => setShowPublishedCard(false), 6000);
    return () => clearTimeout(timer);
  }, [showPublishedCard]);

  const handleFileUpload = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const sysMsg: ChatMessage = { id: `s-${Date.now()}`, role: 'system', content: `已上传文件: ${files[0].name}`, timestamp: now() };
      setMessages(prev => [...prev, sysMsg]);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      <FactorySidebar />

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 flex overflow-hidden p-6 pt-6 gap-5">
          {/* Left: Chat Panel */}
          <div className="w-[400px] flex-shrink-0 bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#edf1f8] flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#0d1b2a] rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>智能体生产助手</h3>
                <p className="text-[11px] text-[#a3b1c6]">描述需求，自动生成智能体</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((msg) => {
                if (msg.role === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center my-1">
                      <span className="text-[11px] text-[#a3b1c6] tracking-wide">{msg.content}</span>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[85%]">
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="w-5 h-5 bg-[#0d1b2a] rounded flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-[11px] text-[#a3b1c6]">{msg.timestamp}</span>
                        </div>
                      )}
                      <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-[#0d1b2a] text-white rounded-br-md'
                          : 'bg-[#f4f6fa] text-[#4a5b73] border border-[#edf1f8] rounded-bl-md'
                      }`}>
                        {msg.content}
                        {msg.isStreaming && (
                          <span className="inline-block w-0.5 h-4 bg-[#0d1b2a] ml-0.5 animate-pulse align-middle" />
                        )}
                      </div>
                      {/* Subtle gradient shimmer after completed generation */}
                      {msg.role === 'assistant' && !msg.isStreaming && msg.content.includes('架构生成完成') && (
                        <div className="relative h-1 mt-1.5 rounded-full overflow-hidden">
                          <div className="absolute inset-0 rounded-full" style={{
                            background: 'linear-gradient(90deg, transparent, rgba(13,27,42,0.08), rgba(99,102,241,0.12), rgba(13,27,42,0.08), transparent)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 2.5s ease-in-out infinite',
                          }} />
                        </div>
                      )}
                      {msg.role === 'user' && (
                        <div className="text-right mt-1">
                          <span className="text-[11px] text-[#a3b1c6]">{msg.timestamp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#f4f6fa] border border-[#edf1f8] rounded-xl px-4 py-3 rounded-bl-md">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-[#0d1b2a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-[#0d1b2a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-[#0d1b2a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[11px] text-[#7d8da1]">正在规划...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-[#edf1f8]">
              <div className="bg-[#f8f9fc] border border-[#e2e8f0] rounded-xl p-3 focus-within:border-[#0d1b2a]/30 transition-colors">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="描述你想创建的智能体..."
                  className="w-full bg-transparent text-[#0d1b2a] placeholder-[#a3b1c6] text-sm resize-none outline-none min-h-[72px] leading-relaxed"
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button onClick={handleFileUpload} className="p-2 hover:bg-[#edf1f8] rounded-lg transition-colors" title="上传文件">
                    <Paperclip className="w-4 h-4 text-[#a3b1c6]" />
                  </button>
                  <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isStreaming}
                    className="px-4 py-2 bg-[#0d1b2a] hover:bg-[#1b2d45] rounded-lg transition-all flex items-center gap-1.5 text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                    发送
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Canvas Area */}
          <div className="flex-1 min-w-0 bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] flex flex-col overflow-hidden" style={{ transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <div className="px-5 py-3.5 border-b border-[#edf1f8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-[#7d8da1]" />
                <h3 className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>智能体架构预览</h3>
                {isPublished && (
                  <span className="ml-2 px-2 py-0.5 bg-[#edf1f8] text-[#4a5b73] text-[11px] rounded-md" style={{ fontWeight: 500 }}>
                    {version}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTrialChat(!showTrialChat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    showTrialChat
                      ? 'text-white shadow-md'
                      : 'border border-[#e2e8f0] text-[#4a5b73] hover:bg-[#f4f6fa]'
                  }`}
                  style={{
                    fontWeight: 500,
                    ...(showTrialChat ? { background: 'linear-gradient(135deg, #3b82f6, #0d1b2a)' } : {}),
                  }}
                >
                  {showTrialChat ? (
                    <span className="relative w-3.5 h-3.5 flex items-center justify-center">
                      <span className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  {showTrialChat ? '试用中' : '试用'}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublished}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isPublished
                      ? 'bg-[#edf1f8] text-[#7d8da1] cursor-default'
                      : 'bg-[#0d1b2a] text-white hover:bg-[#1b2d45]'
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  <Rocket className="w-3.5 h-3.5" />
                  {isPublished ? '已发布' : '发布'}
                </button>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
              {/* Published floating notification card inside canvas */}
              {showPublishedCard && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20" style={{
                  animation: 'fadeInDown 0.3s ease-out',
                }}>
                  <div className="bg-white/95 backdrop-blur-xl border border-[#e2e8f0] rounded-xl px-5 py-3.5 shadow-lg shadow-[#0d1b2a]/[0.06] flex items-center gap-3 max-w-[340px]">
                    <div className="w-9 h-9 rounded-lg bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm text-[#0d1b2a] truncate" style={{ fontWeight: 500 }}>已发布 {agentName}</span>
                      </div>
                      <p className="text-xs text-[#7d8da1]">{version} · 刚刚</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/factory/warehouse'); }}
                      className="flex-shrink-0 px-3 py-1.5 bg-[#0d1b2a] text-white text-xs rounded-lg hover:bg-[#1b2d45] transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      去查看
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowPublishedCard(false); }}
                      className="flex-shrink-0 p-1 rounded hover:bg-[#f4f6fa] transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-[#a3b1c6]" />
                    </button>
                  </div>
                </div>
              )}

              {/* White bg + light blue grid */}
              <div className="absolute inset-0 bg-white" />
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)
                `,
                backgroundSize: '32px 32px',
              }} />
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(59,130,246,0.12) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59,130,246,0.12) 1px, transparent 1px)
                `,
                backgroundSize: '160px 160px',
              }} />

              {/* 2.5D Factory Visualization */}
              <div className="relative z-10 h-full flex items-center justify-center">
                <svg viewBox="0 0 900 520" className="w-full h-full max-w-[850px] max-h-[500px]" style={{ filter: 'drop-shadow(0 4px 24px rgba(13,27,42,0.08))' }}>
                  <defs>
                    <linearGradient id="mainTop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1b2d45" />
                      <stop offset="100%" stopColor="#162840" />
                    </linearGradient>
                    <linearGradient id="mainLeft" x1="0" y1="0" x2="1" y2="0.5">
                      <stop offset="0%" stopColor="#0d1b2a" />
                      <stop offset="100%" stopColor="#142436" />
                    </linearGradient>
                    <linearGradient id="mainRight" x1="0" y1="0" x2="1" y2="0.5">
                      <stop offset="0%" stopColor="#243b56" />
                      <stop offset="100%" stopColor="#1b2d45" />
                    </linearGradient>
                    <linearGradient id="modTop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b5998" />
                      <stop offset="100%" stopColor="#2d4373" />
                    </linearGradient>
                    <linearGradient id="modLeft" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1e3a5f" />
                      <stop offset="100%" stopColor="#264a6e" />
                    </linearGradient>
                    <linearGradient id="modRight" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3a5a80" />
                      <stop offset="100%" stopColor="#1e3a5f" />
                    </linearGradient>
                    <linearGradient id="skillModTop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4a6fa5" />
                      <stop offset="100%" stopColor="#3b5998" />
                    </linearGradient>
                    <linearGradient id="skillModLeft" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2d4a6f" />
                      <stop offset="100%" stopColor="#385d8a" />
                    </linearGradient>
                    <linearGradient id="skillModRight" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4a7ab5" />
                      <stop offset="100%" stopColor="#2d4a6f" />
                    </linearGradient>
                    <linearGradient id="convGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4a5b73" />
                      <stop offset="100%" stopColor="#7d8da1" />
                    </linearGradient>
                    <filter id="glow2">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>

                  {/* Ground shadow */}
                  <ellipse cx="450" cy="420" rx="340" ry="35" fill="#0d1b2a" opacity="0.04" />

                  {/* ===== TOOL MODULE (Left) ===== */}
                  {canvasState.showTools && (
                    <g style={{ opacity: 1, transition: 'opacity 1s ease' }}>
                    <g transform="translate(100, 200)">
                      <polygon points="70,0 140,32 70,64 0,32" fill="url(#modTop)" opacity="0.95" />
                      <polygon points="0,32 70,64 70,120 0,88" fill="url(#modLeft)" opacity="0.95" />
                      <polygon points="140,32 70,64 70,120 140,88" fill="url(#modRight)" opacity="0.95" />
                      <g opacity="0.25">
                        <polygon points="18,52 46,66 46,78 18,64" fill="#7EB8DA" />
                        <polygon points="94,66 122,52 122,64 94,78" fill="#7EB8DA" />
                      </g>
                      <line x1="70" y1="0" x2="70" y2="-14" stroke="#4a6fa5" strokeWidth="2" opacity="0.6" />
                      <circle cx="70" cy="-16" r="3" fill="#7EB8DA" opacity="0.7">
                        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <g transform="translate(-10, 72)">
                        <polygon points="16,0 32,8 16,16 0,8" fill="#3b5998" opacity="0.4" />
                        <polygon points="0,8 16,16 16,28 0,20" fill="#1e3a5f" opacity="0.4" />
                        <polygon points="32,8 16,16 16,28 32,20" fill="#2d4a6e" opacity="0.4" />
                      </g>
                    </g>

                    {/* Tool module label */}
                    <g transform="translate(105, 340)">
                      <rect x="0" y="0" width="130" height="30" rx="8" fill="white" stroke="#d0dbe8" strokeWidth="1" />
                      <text x="65" y="20" textAnchor="middle" fill="#1b2d45" fontSize="13" fontWeight="600">工具模块</text>
                    </g>

                    {/* Tool items - vertical list */}
                    <g transform="translate(105, 378)">
                      {canvasState.toolItems.map((name, i) => (
                        <g key={i} transform={`translate(0, ${i * 30})`}
                          style={{ opacity: 1, transition: 'opacity 0.5s ease' }}>
                          <rect x="0" y="0" width="130" height="26" rx="6" fill="#e8f0fa" stroke="#b8cce4" strokeWidth="0.8" />
                          <text x="65" y="17" textAnchor="middle" fill="#1e3a5f" fontSize="12">{name}</text>
                        </g>
                      ))}
                    </g>
                  </g>
                  )}

                  {/* ===== MAIN FACTORY (Center) ===== */}
                  <g transform="translate(310, 100)">
                    <polygon points="140,0 280,65 140,130 0,65" fill="url(#mainTop)" opacity="0.97" />
                    <polygon points="0,65 140,130 140,260 0,195" fill="url(#mainLeft)" opacity="0.97" />
                    <polygon points="280,65 140,130 140,260 280,195" fill="url(#mainRight)" opacity="0.97" />

                    <line x1="140" y1="0" x2="140" y2="130" stroke="#4a6fa5" strokeWidth="0.5" opacity="0.3" />

                    {[0, 1, 2].map((row) => (
                      <g key={`wl-${row}`}>
                        {[0, 1].map((col) => (
                          <g key={`wl-${row}-${col}`} transform={`translate(${18 + col * 38 - row * 10}, ${92 + row * 36 + col * 18})`}>
                            <polygon points="0,0 26,13 26,24 0,11" fill="#4a6fa5" opacity="0.15" />
                            <polygon points="0,0 26,13 26,24 0,11" fill="none" stroke="#4a6fa5" strokeWidth="0.5" opacity="0.3" />
                          </g>
                        ))}
                      </g>
                    ))}
                    {[0, 1, 2].map((row) => (
                      <g key={`wr-${row}`}>
                        {[0, 1].map((col) => (
                          <g key={`wr-${row}-${col}`} transform={`translate(${176 + col * 38 + row * 10}, ${92 + row * 36 - col * 18 + 22})`}>
                            <polygon points="0,13 26,0 26,11 0,24" fill="#4a6fa5" opacity="0.15" />
                            <polygon points="0,13 26,0 26,11 0,24" fill="none" stroke="#4a6fa5" strokeWidth="0.5" opacity="0.3" />
                          </g>
                        ))}
                      </g>
                    ))}

                    {/* Roof turret */}
                    <g transform="translate(110, -28)">
                      <polygon points="30,0 60,14 30,28 0,14" fill="#1b2d45" />
                      <polygon points="0,14 30,28 30,48 0,34" fill="#0d1b2a" />
                      <polygon points="60,14 30,28 30,48 60,34" fill="#162840" />
                      <circle cx="30" cy="-6" r="4" fill="#7EB8DA" opacity="0.6">
                        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="30" cy="-6" r="7" fill="none" stroke="#7EB8DA" strokeWidth="0.5" opacity="0.3">
                        <animate attributeName="r" values="7;14" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </g>

                    {/* Central gear */}
                    <g transform="translate(140, 50)" filter="url(#glow2)">
                      <circle cx="0" cy="0" r="14" fill="none" stroke="#7EB8DA" strokeWidth="1" opacity="0.5">
                        <animateTransform attributeName="transform" type="rotate" values="0;360" dur="10s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="0" cy="0" r="5" fill="#4a6fa5" opacity="0.35" />
                      {[0, 60, 120, 180, 240, 300].map((angle) => (
                        <line key={angle}
                          x1={Math.cos((angle * Math.PI) / 180) * 10}
                          y1={Math.sin((angle * Math.PI) / 180) * 10}
                          x2={Math.cos((angle * Math.PI) / 180) * 17}
                          y2={Math.sin((angle * Math.PI) / 180) * 17}
                          stroke="#7EB8DA" strokeWidth="2" strokeLinecap="round" opacity="0.4"
                        >
                          <animateTransform attributeName="transform" type="rotate" values="0;360" dur="10s" repeatCount="indefinite" />
                        </line>
                      ))}
                    </g>

                    {/* Door */}
                    <g transform="translate(112, 218)">
                      <polygon points="0,0 28,-13 56,0 28,13" fill="#4a6fa5" opacity="0.12" />
                      <polygon points="0,0 28,13 28,42 0,29" fill="#4a6fa5" opacity="0.08" />
                      <polygon points="56,0 28,13 28,42 56,29" fill="#4a6fa5" opacity="0.06" />
                    </g>

                    {/* Pulse ring */}
                    <circle cx="140" cy="50" r="20" fill="none" stroke="#7EB8DA" strokeWidth="0.6" opacity="0.2">
                      <animate attributeName="r" values="20;35" dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.2;0" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                  </g>

                  {/* Factory label */}
                  <g transform="translate(365, 390)">
                    <rect x="0" y="0" width="170" height="32" rx="8" fill="white" stroke="#d0dbe8" strokeWidth="1" />
                    <text x="85" y="21" textAnchor="middle" fill="#0d1b2a" fontSize="14" fontWeight="600">智能体生产工厂</text>
                  </g>

                  {/* ===== SKILL MODULE (Right) ===== */}
                  {canvasState.showSkills && (
                    <g style={{ opacity: 1, transition: 'opacity 1s ease' }}>
                    <g transform="translate(660, 180)">
                      <polygon points="70,0 140,32 70,64 0,32" fill="url(#skillModTop)" opacity="0.95" />
                      <polygon points="0,32 70,64 70,130 0,98" fill="url(#skillModLeft)" opacity="0.95" />
                      <polygon points="140,32 70,64 70,130 140,98" fill="url(#skillModRight)" opacity="0.95" />
                      <g opacity="0.25">
                        <polygon points="18,50 46,64 46,76 18,62" fill="#7EB8DA" />
                        <polygon points="94,64 122,50 122,62 94,76" fill="#7EB8DA" />
                      </g>
                      <line x1="70" y1="0" x2="70" y2="-14" stroke="#4a7ab5" strokeWidth="2" opacity="0.6" />
                      <circle cx="70" cy="-16" r="3" fill="#7EB8DA" opacity="0.7">
                        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.2s" repeatCount="indefinite" begin="0.5s" />
                      </circle>
                      <g transform="translate(100, 78)">
                        <polygon points="16,0 32,8 16,16 0,8" fill="#4a7ab5" opacity="0.4" />
                        <polygon points="0,8 16,16 16,28 0,20" fill="#2d4a6f" opacity="0.4" />
                        <polygon points="32,8 16,16 16,28 32,20" fill="#385d8a" opacity="0.4" />
                      </g>
                    </g>

                    {/* Skill module label */}
                    <g transform="translate(665, 328)">
                      <rect x="0" y="0" width="130" height="30" rx="8" fill="white" stroke="#d0dbe8" strokeWidth="1" />
                      <text x="65" y="20" textAnchor="middle" fill="#1b2d45" fontSize="13" fontWeight="600">技能模块</text>
                    </g>

                    {/* Skill items - vertical list */}
                    <g transform="translate(665, 366)">
                      {canvasState.skillItems.map((name, i) => (
                        <g key={i} transform={`translate(0, ${i * 30})`}
                          style={{ opacity: 1, transition: 'opacity 0.5s ease' }}>
                          <rect x="0" y="0" width="130" height="26" rx="6" fill="#e8f0fa" stroke="#b8cce4" strokeWidth="0.8" />
                          <text x="65" y="17" textAnchor="middle" fill="#1e3a5f" fontSize="12">{name}</text>
                        </g>
                      ))}
                    </g>
                  </g>
                  )}

                  {/* ===== Conveyor belts ===== */}
                  {canvasState.showTools && (
                  <g style={{ opacity: canvasState.connected ? 0.8 : 0.3, transition: 'opacity 0.8s ease' }}>
                    <line x1="240" y1="290" x2="340" y2="240" stroke="url(#convGrad)" strokeWidth="2" strokeDasharray="6,4" opacity="0.4">
                      <animate attributeName="stroke-dashoffset" values="0;-20" dur="1.5s" repeatCount="indefinite" />
                    </line>
                    {canvasState.connected && (
                      <>
                        <circle r="3" fill="#1b2d45" opacity="0.6">
                          <animateMotion dur="1.5s" repeatCount="indefinite" path="M240,290 L340,240" />
                        </circle>
                        <circle r="3" fill="#1b2d45" opacity="0.3">
                          <animateMotion dur="1.5s" repeatCount="indefinite" begin="0.75s" path="M240,290 L340,240" />
                        </circle>
                      </>
                    )}
                  </g>
                  )}

                  {canvasState.showSkills && (
                  <g style={{ opacity: canvasState.connected ? 0.8 : 0.3, transition: 'opacity 0.8s ease' }}>
                    <line x1="560" y1="240" x2="660" y2="260" stroke="url(#convGrad)" strokeWidth="2" strokeDasharray="6,4" opacity="0.4">
                      <animate attributeName="stroke-dashoffset" values="0;-20" dur="1.5s" repeatCount="indefinite" />
                    </line>
                    {canvasState.connected && (
                      <>
                        <circle r="3" fill="#1b2d45" opacity="0.6">
                          <animateMotion dur="1.5s" repeatCount="indefinite" path="M560,240 L660,260" />
                        </circle>
                        <circle r="3" fill="#1b2d45" opacity="0.3">
                          <animateMotion dur="1.5s" repeatCount="indefinite" begin="0.75s" path="M560,240 L660,260" />
                        </circle>
                      </>
                    )}
                  </g>
                  )}

                  {/* Platform base */}
                  <polygon points="100,400 450,235 800,400 450,460" fill="#0d1b2a" opacity="0.02" />
                </svg>
              </div>
            </div>

            {/* Execution log strip - height matches chat input area */}
            <div className="border-t border-[#edf1f8] bg-[#f8f9fc] flex flex-col" style={{ height: 168 }}>
              <div className="px-5 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#a3b1c6]" />
                  <span className="text-sm text-[#7d8da1]">执行日志</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#a3b1c6]" />
              </div>
              <div className="px-5 pb-4 space-y-2 overflow-y-auto font-mono flex-1">
                {[
                  { t: '14:23:01', agent: '主智能体', msg: '智能体初始化完成' },
                  { t: '14:23:02', agent: '主智能体', msg: '加载默认工具: config.json' },
                  { t: '14:23:03', agent: '任务规划智能体', msg: '升级任务规划能力' },
                  { t: '14:23:04', agent: '任务执行智能体', msg: '注册执行工具: 3个工具' },
                ].map((log, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span className="text-[#bbb] flex-shrink-0 tabular-nums">{log.t}</span>
                    <span className="flex-shrink-0 text-[#4a5b73]">{log.agent}</span>
                    <span className="text-[#7d8da1]">{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Trial Chat Panel (slide-in with smooth transition) */}
          <div
            className="flex-shrink-0 overflow-hidden bg-white/80 backdrop-blur-xl rounded-xl border border-[#e2e8f0]"
            style={{
              width: showTrialChat ? 380 : 0,
              opacity: showTrialChat ? 1 : 0,
              borderWidth: showTrialChat ? 1 : 0,
              transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
            }}
          >
            {showTrialChat && (
              <div className="w-[380px] h-full">
                <TrialChatPanel onClose={() => setShowTrialChat(false)} agentName={agentName} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
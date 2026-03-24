import { useState, useRef, useEffect } from 'react';
import { X, Loader2, CheckCircle2, Upload, FileText } from 'lucide-react';

// Model Config Modal (用于新增模型)
export function ModelConfigModal({ model, onClose, onSave }: { model?: any; onClose: () => void; onSave?: (data: any) => void }) {
  const [selectedModelType, setSelectedModelType] = useState(model?.name || 'GPT-5');
  const [temperature, setTemperature] = useState(model?.temperature?.toString() || '0.7');
  const [maxTokens, setMaxTokens] = useState(model?.maxTokens?.toString() || '4096');
  const [apiKey, setApiKey] = useState(model?.apiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [errors, setErrors] = useState<any>({});
  
  const originalApiKey = model?.apiKey || '';

  const modelOptions = [
    'GLM-4',
    'GLM-4-Plus',
    'Qwen-72B',
    'Qwen-14B',
    '气象大模型V3',
    'DeepSeek-V3',
    'DeepSeek-R1',
    'Baichuan-4',
  ];

  const validateForm = () => {
    const newErrors: any = {};
    if (!selectedModelType) newErrors.model = '请选择模型';
    if (!temperature || parseFloat(temperature) < 0 || parseFloat(temperature) > 2) newErrors.temperature = 'Temperature必须在0-2之间';
    if (!maxTokens || parseInt(maxTokens) < 1) newErrors.maxTokens = 'Max Tokens必须大于0';
    if (!apiKey || apiKey.length < 10) newErrors.apiKey = '请输入有效的API Key';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const isEditMode = !!model;
    const apiKeyChanged = isEditMode && apiKey !== originalApiKey;
    
    if (!isEditMode || apiKeyChanged) {
      setIsValidating(true);
      setValidationSuccess(false);
      setTimeout(() => {
        setIsValidating(false);
        setValidationSuccess(true);
        setTimeout(() => {
          const modelData = {
            id: model?.id || `model-${Date.now()}`,
            name: selectedModelType,
            temperature: parseFloat(temperature),
            maxTokens: parseInt(maxTokens),
            apiKey: apiKey,
            provider: selectedModelType.includes('GPT') ? 'OpenAI' : selectedModelType.includes('Claude') ? 'Anthropic' : 'Google',
            status: 'active',
            usedBy: model?.usedBy || 0
          };
          if (onSave) onSave(modelData);
          onClose();
        }, 1500);
      }, 2000);
    } else {
      const modelData = {
        id: model?.id || `model-${Date.now()}`,
        name: selectedModelType,
        temperature: parseFloat(temperature),
        maxTokens: parseInt(maxTokens),
        apiKey: apiKey,
        provider: model?.provider || 'OpenAI',
        status: 'active',
        usedBy: model?.usedBy || 0
      };
      if (onSave) onSave(modelData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 border border-[#e2e8f0]" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-[#edf1f8]">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] text-[#0d1b2a]" style={{ fontWeight: 500 }}>
              {model ? '编辑模型配置' : '新增模型'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-[#edf1f8] rounded-lg transition-colors">
              <X className="w-5 h-5 text-[#7d8da1]" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm text-[#4a5b73] mb-2">
              选择模型 <span className="text-[#c7000b]">*</span>
            </label>
            <select
              value={selectedModelType}
              onChange={(e) => { setSelectedModelType(e.target.value); setErrors({ ...errors, model: '' }); }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#0d1b2a]/30 transition-colors text-sm ${
                errors.model ? 'border-[#fecaca] bg-[#fef2f2]' : 'border-[#e2e8f0]'
              }`}
            >
              {modelOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.model && <p className="mt-1 text-xs text-[#c7000b]">{errors.model}</p>}
          </div>

          <div>
            <label className="block text-sm text-[#4a5b73] mb-2">
              Temperature <span className="text-[#c7000b]">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input type="number" value={temperature} onChange={(e) => { setTemperature(e.target.value); setErrors({ ...errors, temperature: '' }); }}
                step="0.1" min="0" max="2"
                className={`flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#0d1b2a]/30 text-sm ${errors.temperature ? 'border-[#fecaca] bg-[#fef2f2]' : 'border-[#e2e8f0]'}`}
                placeholder="0.7" />
              <input type="range" value={temperature} onChange={(e) => setTemperature(e.target.value)} step="0.1" min="0" max="2"
                className="flex-1 h-2 bg-[#edf1f8] rounded-lg appearance-none cursor-pointer accent-[#0d1b2a]" />
            </div>
            <p className="mt-1 text-[11px] text-[#a3b1c6]">控制输出的随机性，范围 0-2</p>
            {errors.temperature && <p className="mt-1 text-xs text-[#c7000b]">{errors.temperature}</p>}
          </div>

          <div>
            <label className="block text-sm text-[#4a5b73] mb-2">
              Max Tokens <span className="text-[#c7000b]">*</span>
            </label>
            <input type="number" value={maxTokens} onChange={(e) => { setMaxTokens(e.target.value); setErrors({ ...errors, maxTokens: '' }); }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#0d1b2a]/30 text-sm ${errors.maxTokens ? 'border-[#fecaca] bg-[#fef2f2]' : 'border-[#e2e8f0]'}`}
              placeholder="4096" />
            <p className="mt-1 text-[11px] text-[#a3b1c6]">生成的最大token数量</p>
            {errors.maxTokens && <p className="mt-1 text-xs text-[#c7000b]">{errors.maxTokens}</p>}
          </div>

          <div>
            <label className="block text-sm text-[#4a5b73] mb-2">
              API Key <span className="text-[#c7000b]">*</span>
            </label>
            <input type="password" value={apiKey} onChange={(e) => { setApiKey(e.target.value); setErrors({ ...errors, apiKey: '' }); }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#0d1b2a]/30 font-mono text-sm ${errors.apiKey ? 'border-[#fecaca] bg-[#fef2f2]' : 'border-[#e2e8f0]'}`}
              placeholder="sk-proj-*********************" />
            {errors.apiKey && <p className="mt-1 text-xs text-[#c7000b]">{errors.apiKey}</p>}
          </div>

          {model && apiKey !== originalApiKey && !isValidating && !validationSuccess && (
            <div className="flex items-center gap-3 p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg">
              <div className="w-5 h-5 rounded-full bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                <span className="text-[#D97706] text-xs" style={{ fontWeight: 700 }}>!</span>
              </div>
              <div>
                <p className="text-sm text-[#92400E]">检测到API Key已修改</p>
                <p className="text-[11px] text-[#D97706] mt-0.5">提交时将重新验证连接</p>
              </div>
            </div>
          )}

          {isValidating && (
            <div className="flex items-center gap-3 p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
              <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
              <div>
                <p className="text-sm text-[#1E40AF]">正在验证连接...</p>
                <p className="text-[11px] text-[#3B82F6] mt-0.5">测试API连接是否正常</p>
              </div>
            </div>
          )}

          {validationSuccess && (
            <div className="flex items-center gap-3 p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-[#059669]" />
              <div>
                <p className="text-sm text-[#065F46]">连接验证成功！</p>
                <p className="text-[11px] text-[#10B981] mt-0.5">模型配置正确，正在保存...</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#edf1f8] flex gap-3 justify-end">
          <button onClick={onClose} disabled={isValidating || validationSuccess}
            className="px-5 py-2.5 border border-[#e2e8f0] text-[#4a5b73] rounded-lg hover:bg-[#f4f6fa] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            取消
          </button>
          <button onClick={handleSubmit} disabled={isValidating || validationSuccess}
            className="px-5 py-2.5 bg-[#0d1b2a] text-white rounded-lg hover:bg-[#1b2d45] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {isValidating && <Loader2 className="w-4 h-4 animate-spin" />}
            {model ? (apiKey !== originalApiKey ? '保存并验证' : '保存配置') : '提交并验证'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Tool Edit Modal
export function ToolEditModal({ tool, onClose }: { tool: any; onClose: () => void }) {
  const [endpoint, setEndpoint] = useState(tool?.endpoint || '');
  const [name, setName] = useState(tool?.name || '');
  const [description, setDescription] = useState(tool?.description || '');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 border border-[#e2e8f0]" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-[#edf1f8]">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] text-[#0d1b2a]" style={{ fontWeight: 500 }}>编辑工具</h2>
            <button onClick={onClose} className="p-2 hover:bg-[#edf1f8] rounded-lg transition-colors">
              <X className="w-5 h-5 text-[#7d8da1]" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm text-[#4a5b73] mb-2">工具名称</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0d1b2a]/30 text-sm" placeholder="输入工具名称" />
          </div>
          <div>
            <label className="block text-sm text-[#4a5b73] mb-2">工具描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0d1b2a]/30 resize-none text-sm" placeholder="输入工具描述" />
          </div>
          <div>
            <label className="block text-sm text-[#4a5b73] mb-2">连接链接</label>
            <input type="text" value={endpoint} onChange={(e) => setEndpoint(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0d1b2a]/30 font-mono text-sm" placeholder="https://api.example.com/v1" />
          </div>
        </div>

        <div className="p-6 border-t border-[#edf1f8] flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 border border-[#e2e8f0] text-[#4a5b73] rounded-lg hover:bg-[#f4f6fa] transition-colors text-sm">取消</button>
          <button onClick={onClose} className="px-5 py-2.5 bg-[#0d1b2a] text-white rounded-lg hover:bg-[#1b2d45] transition-colors text-sm">保存修改</button>
        </div>
      </div>
    </div>
  );
}

// Skill Preview Modal
export function SkillPreviewModal({ skill, onClose }: { skill: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col border border-[#e2e8f0]" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-[#edf1f8] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] text-[#0d1b2a]" style={{ fontWeight: 500 }}>{skill?.name}</h2>
              <p className="text-xs text-[#7d8da1] mt-1">{skill?.description}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#edf1f8] rounded-lg transition-colors">
              <X className="w-5 h-5 text-[#7d8da1]" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-[#0d1b2a] rounded-lg p-6">
            <pre className="text-sm text-[#e2e8f0] whitespace-pre-wrap font-mono leading-relaxed">
              {skill?.content || skill?.markdownContent || '暂无内容'}
            </pre>
          </div>
        </div>

        <div className="p-6 border-t border-[#edf1f8] flex gap-3 justify-end flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 bg-[#0d1b2a] text-white rounded-lg hover:bg-[#1b2d45] transition-colors text-sm">关闭</button>
        </div>
      </div>
    </div>
  );
}

// ===== Skill Edit Modal (enhanced with paste + upload) =====
export function SkillEditModal({ skill, onClose, onSave }: { skill: any; onClose: () => void; onSave?: (data: any) => void }) {
  const isAddMode = !skill;
  const [name, setName] = useState(skill?.name || '');
  const [description, setDescription] = useState(skill?.description || '');
  const [content, setContent] = useState(skill?.content || skill?.markdownContent || '');
  const [tags, setTags] = useState<string[]>(skill?.category ? [skill.category] : []);
  const [isDisabled, setIsDisabled] = useState(skill?.status === 'unavailable');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate tags from name + description
  useEffect(() => {
    if (!isAddMode) return;
    const text = (name + ' ' + description).toLowerCase();
    const generated: string[] = [];
    const tagMap: Record<string, string[]> = {
      '数据处理': ['数据', 'sql', '查询', '数据库', '分析', '统计'],
      '文本处理': ['文本', 'nlp', '语义', '自然语言', '翻译', '摘要', '文献'],
      '开发辅助': ['代码', '编程', '开发', '调试', '生成代码', '脚本'],
      'API调用': ['api', '接口', '请求', '服务', '调用', '对接'],
      '知识检索': ['知识', '检索', '搜索', '问答', '图谱'],
      '供应链分析': ['供应链', '物流', '价格', '供需', '风险', '预警', '铁矿石', '大豆'],
    };
    for (const [tag, keywords] of Object.entries(tagMap)) {
      if (keywords.some(kw => text.includes(kw))) {
        generated.push(tag);
      }
    }
    if (generated.length === 0 && text.trim().length > 2) {
      generated.push('通用技能');
    }
    setTags(generated);
  }, [name, description, isAddMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validExtensions = ['.md', '.txt', '.json', '.yaml', '.yml'];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (validExtensions.includes(ext)) {
        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileContent = event.target?.result as string;
          setTimeout(() => {
            setContent(fileContent);
            setUploadedFileName(file.name);
            setIsUploading(false);
            if (!name) {
              setName(file.name.replace(/\.[^/.]+$/, ''));
            }
          }, 600);
        };
        reader.readAsText(file);
      }
    }
  };

  const canSave = name.trim().length > 0 && content.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const data = {
      id: skill?.id,
      name: name.trim(),
      description: description.trim(),
      category: tags[0] || '通用技能',
      content: content.trim(),
      tags,
      status: isDisabled ? 'unavailable' : 'active',
    };
    if (onSave) onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col border border-[#e2e8f0]" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-[#edf1f8] flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] text-[#0d1b2a]" style={{ fontWeight: 500 }}>
              {isAddMode ? '新增技能' : '编辑技能'}
            </h2>
            <div className="flex items-center gap-3">
              {/* Disable toggle — shown always, useful in both add & edit */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7d8da1]">停用</span>
                <button
                  type="button"
                  onClick={() => setIsDisabled(v => !v)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${
                    isDisabled ? 'bg-[#d8e0ec]' : 'bg-[#0d1b2a]'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    isDisabled ? 'translate-x-0.5' : 'translate-x-4'
                  }`} />
                </button>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[#edf1f8] rounded-lg transition-colors">
                <X className="w-5 h-5 text-[#7d8da1]" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Skill Name */}
          <div>
            <label className="block text-sm text-[#4a5b73] mb-2">
              技能名称 <span className="text-[#c7000b]">*</span>
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0d1b2a]/30 text-sm"
              placeholder="输入技能名称" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-[#4a5b73] mb-2">
              技能描述
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0d1b2a]/30 resize-none text-sm"
              placeholder="输入技能描述" />
          </div>

          {/* Auto-generated tags */}
          {tags.length > 0 && (
            <div>
              <label className="block text-sm text-[#4a5b73] mb-2">自动标签</label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#edf1f8] text-[#4a5b73] text-xs rounded-md">
                    {tag}
                    <button onClick={() => setTags(tags.filter(t => t !== tag))} className="text-[#a3b1c6] hover:text-[#4a5b73]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skill Content */}
          <div>
            <label className="block text-sm text-[#4a5b73] mb-2">
              技能内容 <span className="text-[#c7000b]">*</span>
            </label>

            <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
              {uploadedFileName && (
                <div className="px-4 py-2 bg-[#edf1f8] border-b border-[#e2e8f0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#4a5b73]" />
                    <span className="text-xs text-[#4a5b73]">{uploadedFileName}</span>
                  </div>
                  <button onClick={() => { setUploadedFileName(''); setContent(''); }} className="text-[#a3b1c6] hover:text-[#4a5b73]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {isUploading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#0d1b2a]/20 border-t-[#0d1b2a] rounded-full animate-spin mr-3" />
                  <span className="text-sm text-[#4a5b73]">正在解析文件...</span>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 font-mono text-sm focus:outline-none resize-none bg-[#f8f9fc] text-[#0d1b2a]"
                  placeholder="在此粘贴或输入技能内容..."
                />
              )}
            </div>

            {/* File upload button */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#4a5b73] hover:bg-[#edf1f8] rounded-lg transition-colors border border-[#e2e8f0]"
              >
                <Upload className="w-3.5 h-3.5" />
                文件上传
              </button>
              <span className="text-[11px] text-[#a3b1c6]">支持 .md, .txt, .json, .yaml 格式</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt,.json,.yaml,.yml"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="p-6 border-t border-[#edf1f8] flex gap-3 justify-end flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 border border-[#e2e8f0] text-[#4a5b73] rounded-lg hover:bg-[#f4f6fa] transition-colors text-sm">
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2.5 bg-[#0d1b2a] text-white rounded-lg hover:bg-[#1b2d45] transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isAddMode ? '创建技能' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  );
}
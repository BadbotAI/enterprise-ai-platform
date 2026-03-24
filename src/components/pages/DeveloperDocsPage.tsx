import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, Search, Code2, Key, Zap, Database, FileText, ChevronRight, Copy, Check, Home, ArrowLeft } from 'lucide-react';

export function DeveloperDocsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('getting-started');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const sections = [
    { id: 'getting-started', label: '快速开始', icon: Zap },
    { id: 'api-reference', label: 'API 参考', icon: Code2 },
    { id: 'authentication', label: '身份认证', icon: Key },
    { id: 'mcp-integration', label: 'MCP 集成', icon: Database },
    { id: 'examples', label: '示例代码', icon: FileText },
  ];

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'getting-started':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">快速开始</h1>
              <p className="text-gray-600">欢迎使用 AI 智能体平台开发者文档，本指南将帮助您快速上手平台开发。</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📖 文档概览</h3>
              <p className="text-sm text-blue-800">本文档涵盖平台核心功能、API 接口、MCP 集成以及最佳实践，帮助您构建强大的智能体应用。</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">前置条件</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span>拥有平台开发者账号</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span>了解基本的 RESTful API 概念</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span>熟悉 JSON 数据格式</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">第一步：获取 API Key</h2>
              <p className="text-gray-700 mb-4">在开发者管理页面创建并获取您的 API Key：</p>
              <ol className="space-y-3 text-gray-700">
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600">1.</span>
                  <span>进入「开发者管理」→「Key 管理」</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600">2.</span>
                  <span>点击「新建 Key」按钮</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600">3.</span>
                  <span>填写 Key 名称并选择权限范围</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600">4.</span>
                  <span>保存并复制生成的 API Key（请妥善保管，不会再次显示）</span>
                </li>
              </ol>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">第二步：发起第一个 API 请求</h2>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <button
                  onClick={() => handleCopyCode('curl -X GET https://api.aiagent.com/v1/agents \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json"', 'example-1')}
                  className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                  title="复制代码"
                >
                  {copiedCode === 'example-1' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <pre className="text-sm text-gray-100 overflow-x-auto">
{`curl -X GET https://api.aiagent.com/v1/agents \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ 成功！</h3>
              <p className="text-sm text-green-800">如果请求成功，您将收到智能体列表的 JSON 响应。接下来可以探索更多 API 功能。</p>
            </div>
          </div>
        );

      case 'api-reference':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">API 参考</h1>
              <p className="text-gray-600">完整的 API 接口文档，包括请求参数、响应格式和错误码说明。</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Base URL</h2>
              <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                https://api.aiagent.com/v1
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">智能体管理</h2>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">GET</span>
                    <span className="font-mono text-sm">/agents</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-gray-700">获取智能体列表</p>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">查询参数：</h4>
                    <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                      <div><code className="text-purple-600">page</code> - 页码（默认：1）</div>
                      <div><code className="text-purple-600">limit</code> - 每页数量（默认：20）</div>
                      <div><code className="text-purple-600">status</code> - 状态筛选（active/inactive）</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">响应示例：</h4>
                    <div className="bg-gray-900 rounded p-4">
                      <pre className="text-xs text-gray-100 overflow-x-auto">
{`{
  "data": [
    {
      "id": "agent_123",
      "name": "客服智能体",
      "status": "active",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">POST</span>
                    <span className="font-mono text-sm">/agents</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-gray-700">创建新智能体</p>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">请求体：</h4>
                    <div className="bg-gray-900 rounded p-4">
                      <pre className="text-xs text-gray-100 overflow-x-auto">
{`{
  "name": "智能体名称",
  "description": "智能体描述",
  "model": "gpt-4",
  "tools": ["tool_id_1", "tool_id_2"]
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">错误码</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left font-semibold">状态码</th>
                      <th className="border border-gray-200 px-4 py-2 text-left font-semibold">说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2 font-mono text-sm">200</td>
                      <td className="border border-gray-200 px-4 py-2">请求成功</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2 font-mono text-sm">401</td>
                      <td className="border border-gray-200 px-4 py-2">未授权（API Key 无效）</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2 font-mono text-sm">403</td>
                      <td className="border border-gray-200 px-4 py-2">禁止访问（权限不足）</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2 font-mono text-sm">429</td>
                      <td className="border border-gray-200 px-4 py-2">请求过多（超出限流）</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2 font-mono text-sm">500</td>
                      <td className="border border-gray-200 px-4 py-2">服务器错误</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'authentication':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">身份认证</h1>
              <p className="text-gray-600">了解如何安全地使用 API Key 进行身份认证。</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ 安全提示</h3>
              <p className="text-sm text-yellow-800">请妥善保管您的 API Key，不要在公开代码仓库或客户端代码中暴露。</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">认证方式</h2>
              <p className="text-gray-700 mb-4">平台使用 Bearer Token 方式进行认证，在每个请求的 Header 中包含您的 API Key：</p>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-sm text-gray-100">
Authorization: Bearer YOUR_API_KEY
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Key 权限管理</h2>
              <p className="text-gray-700 mb-4">创建 API Key 时，可以设置不同的权限范围：</p>
              
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">只读权限</h4>
                  <p className="text-sm text-gray-600">只能读取资源信息，无法创建或修改</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">读写权限</h4>
                  <p className="text-sm text-gray-600">可以读取、创建和修改资源</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">管理员权限</h4>
                  <p className="text-sm text-gray-600">拥有所有权限，包括删除资源</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">最佳实践</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span>为不同环境（开发、测试、生产）创建独立的 API Key</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span>定期轮换 API Key，提高安全性</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span>使用环境变量存储 API Key，不要硬编码</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span>发现 Key 泄露时立即停用并重新生成</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'mcp-integration':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">MCP 集成</h1>
              <p className="text-gray-600">Model Context Protocol（MCP）集成指南，为智能体添加强大的工具能力。</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">什么是 MCP？</h2>
              <p className="text-gray-700 mb-4">MCP 是一个标准化协议，用于将外部工具和服务集成到智能体中，让智能体能够调用各种 API、数据库查询、文件操作等功能。</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">注册 MCP 服务</h2>
              <ol className="space-y-3 text-gray-700">
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600">1.</span>
                  <div>
                    <p className="font-medium">进入 MCP 管理页面</p>
                    <p className="text-sm text-gray-600">开发者管理 → MCP 管理</p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600">2.</span>
                  <div>
                    <p className="font-medium">点击「注册 MCP」</p>
                    <p className="text-sm text-gray-600">填写 MCP 名称、接口地址和认证信息</p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600">3.</span>
                  <div>
                    <p className="font-medium">校验连通性</p>
                    <p className="text-sm text-gray-600">系统会自动测试 MCP 服务是否可用</p>
                  </div>
                </li>
              </ol>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">MCP 配置示例</h2>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-xs text-gray-100 overflow-x-auto">
{`{
  "name": "天气查询服务",
  "endpoint": "https://api.weather.com/mcp",
  "protocol": "REST",
  "authentication": {
    "type": "bearer",
    "key_id": "key_123"
  },
  "capabilities": [
    {
      "name": "get_weather",
      "description": "获取指定城市的天气信息",
      "parameters": {
        "city": "string",
        "unit": "celsius|fahrenheit"
      }
    }
  ]
}`}
                </pre>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 提示</h3>
              <p className="text-sm text-blue-800">注册成功后，智能体就可以在配置时选择该 MCP 服务，调用其提供的工具能力。</p>
            </div>
          </div>
        );

      case 'examples':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">示例代码</h1>
              <p className="text-gray-600">常见场景的代码示例，帮助您快速上手。</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Python 示例</h2>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <button
                  onClick={() => handleCopyCode(`import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://api.aiagent.com/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# 获取智能体列表
response = requests.get(f"{BASE_URL}/agents", headers=headers)
agents = response.json()

print(f"找到 {agents['total']} 个智能体")

# 创建新智能体
new_agent = {
    "name": "客服助手",
    "description": "帮助用户解答问题",
    "model": "gpt-4",
    "tools": ["mcp_123"]
}

response = requests.post(f"{BASE_URL}/agents", headers=headers, json=new_agent)
created_agent = response.json()

print(f"成功创建智能体: {created_agent['id']}")`, 'python-example')}
                  className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                >
                  {copiedCode === 'python-example' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <pre className="text-xs text-gray-100 overflow-x-auto">
{`import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://api.aiagent.com/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# 获取智能体列表
response = requests.get(f"{BASE_URL}/agents", headers=headers)
agents = response.json()

print(f"找到 {agents['total']} 个智能体")

# 创建新智能体
new_agent = {
    "name": "客服助手",
    "description": "帮助用户解答问题",
    "model": "gpt-4",
    "tools": ["mcp_123"]
}

response = requests.post(f"{BASE_URL}/agents", headers=headers, json=new_agent)
created_agent = response.json()

print(f"成功创建智能体: {created_agent['id']}")`}
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">JavaScript 示例</h2>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <button
                  onClick={() => handleCopyCode(`const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://api.aiagent.com/v1';

// 获取智能体列表
async function getAgents() {
  const response = await fetch(\`\${BASE_URL}/agents\`, {
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log(\`找到 \${data.total} 个智能体\`);
  return data;
}

// 创建新智能体
async function createAgent() {
  const newAgent = {
    name: '客服助手',
    description: '帮助用户解答问题',
    model: 'gpt-4',
    tools: ['mcp_123']
  };
  
  const response = await fetch(\`\${BASE_URL}/agents\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newAgent)
  });
  
  const data = await response.json();
  console.log(\`成功创建智能体: \${data.id}\`);
  return data;
}`, 'js-example')}
                  className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                >
                  {copiedCode === 'js-example' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <pre className="text-xs text-gray-100 overflow-x-auto">
{`const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://api.aiagent.com/v1';

// 获取智能体列表
async function getAgents() {
  const response = await fetch(\`\${BASE_URL}/agents\`, {
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log(\`找到 \${data.total} 个智能体\`);
  return data;
}

// 创建新智能体
async function createAgent() {
  const newAgent = {
    name: '客服助手',
    description: '帮助用户解答问题',
    model: 'gpt-4',
    tools: ['mcp_123']
  };
  
  const response = await fetch(\`\${BASE_URL}/agents\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newAgent)
  });
  
  const data = await response.json();
  console.log(\`成功创建智能体: \${data.id}\`);
  return data;
}`}
                </pre>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/galaxy')}
            className="w-8 h-8 rounded-lg bg-[#edf1f8]/80 hover:bg-[#d8e0ec] flex items-center justify-center transition-colors mb-4"
            title="返回首页"
          >
            <ArrowLeft className="w-4 h-4 text-[#4a5b73]" />
          </button>

          <div>
            <h1 className="text-3xl font-semibold mb-2">开发者文档</h1>
            <p className="text-gray-600">API 参考、集成指南和最佳实践</p>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文档..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = selectedSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                      <span className="font-medium">{section.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white rounded-lg border border-gray-200 p-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
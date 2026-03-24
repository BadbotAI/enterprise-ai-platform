import { useState } from 'react';
import { Plus, Key, Plug, Brain, Eye, EyeOff, Power, Trash2, AlertCircle } from 'lucide-react';

type TabType = 'keys' | 'mcp' | 'models';

interface KeyItem {
  id: string;
  name: string;
  type: string;
  service: string;
  status: 'active' | 'inactive';
  createdAt: string;
  usedBy: number;
}

interface MCPItem {
  id: string;
  name: string;
  endpoint: string;
  protocol: string;
  status: 'active' | 'inactive';
  usedBy: number;
}

interface ModelItem {
  id: string;
  name: string;
  provider: string;
  endpoint: string;
  status: 'active' | 'inactive';
  callLimit: string;
  usedBy: number;
}

export function KeyManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('keys');
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);

  const mockKeys: KeyItem[] = [
    {
      id: '1',
      name: '智谱AI API Key',
      type: 'LLM',
      service: '智谱 GLM-4',
      status: 'active',
      createdAt: '2024-01-10',
      usedBy: 5,
    },
    {
      id: '2',
      name: 'Database Access Key',
      type: 'Database',
      service: 'PostgreSQL',
      status: 'active',
      createdAt: '2024-01-05',
      usedBy: 3,
    },
  ];

  const mockMCPs: MCPItem[] = [
    {
      id: '1',
      name: '文档解析工具',
      endpoint: 'https://api.example.com/parse',
      protocol: 'REST',
      status: 'active',
      usedBy: 8,
    },
    {
      id: '2',
      name: '数据分析工具',
      endpoint: 'https://api.example.com/analyze',
      protocol: 'gRPC',
      status: 'active',
      usedBy: 4,
    },
  ];

  const mockModels: ModelItem[] = [
    {
      id: '1',
      name: 'GLM-4',
      provider: '智谱AI',
      endpoint: 'https://open.bigmodel.cn/api/v4',
      status: 'active',
      callLimit: '10000/天',
      usedBy: 12,
    },
    {
      id: '2',
      name: 'Qwen-72B',
      provider: '通义千问',
      endpoint: 'https://dashscope.aliyuncs.com/api/v1',
      status: 'active',
      callLimit: '5000/天',
      usedBy: 6,
    },
  ];

  const tabs = [
    { value: 'keys' as TabType, label: 'Key 管理', icon: Key },
    { value: 'mcp' as TabType, label: 'MCP 管理', icon: Plug },
    { value: 'models' as TabType, label: '模型 API 管理', icon: Brain },
  ];

  return (
    <div className="p-8">
      {/* Keys Tab */}
      {activeTab === 'keys' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">API Key 管理</h2>
              <p className="text-sm text-gray-600">
                管理第三方或内部服务的访问密钥
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              新建 Key
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Key 名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    绑定服务
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    使用智能体
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{key.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {key.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {key.service}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          key.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {key.status === 'active' ? '启用' : '停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {key.usedBy} 个智能体
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {key.createdAt}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <EyeOff className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Power className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MCP Tab */}
      {activeTab === 'mcp' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">MCP 工具管理</h2>
              <p className="text-sm text-gray-600">
                统一管理智能体可调用的工具能力与插件
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              注册 MCP
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/4">
                    MCP 名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">
                    协议类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-2/5">
                    接口地址
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    使用智能体
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockMCPs.map((mcp) => (
                  <tr key={mcp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Plug className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{mcp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {mcp.protocol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {mcp.endpoint}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                          mcp.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {mcp.status === 'active' ? '启用' : '停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {mcp.usedBy} 个智能体
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Power className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Models Tab */}
      {activeTab === 'models' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">模型 API 管理</h2>
              <p className="text-sm text-gray-600">
                管理平台可用的大模型能力池
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              接入新模型
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    模型名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    供应商
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    接口地址
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    调用限制
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    使用智能体
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockModels.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{model.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {model.provider}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {model.endpoint}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          model.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {model.status === 'active' ? '可用' : '停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {model.callLimit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {model.usedBy} 个智能体
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Power className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
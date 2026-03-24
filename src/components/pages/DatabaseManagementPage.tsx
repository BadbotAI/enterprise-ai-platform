import { useState } from 'react';
import { Plus, Database, FileText, Table, Code, Upload, RefreshCw, Trash2, Link as LinkIcon, Search } from 'lucide-react';

interface KnowledgeBase {
  id: string;
  name: string;
  type: 'document' | 'table' | 'vector';
  dataCount: number;
  lastUpdated: string;
  boundAgents: number;
  status: 'normal' | 'building' | 'error';
}

export function DatabaseManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const mockDatabases: KnowledgeBase[] = [
    {
      id: 'db-001',
      name: '企业法规文档库',
      type: 'document',
      dataCount: 1247,
      lastUpdated: '2024-01-18',
      boundAgents: 8,
      status: 'normal',
    },
    {
      id: 'db-002',
      name: '财务数据表格库',
      type: 'table',
      dataCount: 356,
      lastUpdated: '2024-01-17',
      boundAgents: 4,
      status: 'normal',
    },
    {
      id: 'db-003',
      name: '知识向量索引库',
      type: 'vector',
      dataCount: 89234,
      lastUpdated: '2024-01-19',
      boundAgents: 12,
      status: 'building',
    },
  ];

  const getTypeIcon = (type: string) => {
    const icons = {
      document: FileText,
      table: Table,
      vector: Code,
    };
    return icons[type as keyof typeof icons] || Database;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      document: '文档库',
      table: '表格库',
      vector: '向量库',
    };
    return labels[type as keyof typeof labels] || '未知';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      normal: { bg: 'bg-green-100', text: 'text-green-700', label: '正常' },
      building: { bg: 'bg-blue-100', text: 'text-blue-700', label: '重建中' },
      error: { bg: 'bg-red-100', text: 'text-red-700', label: '异常' },
    };
    return badges[status as keyof typeof badges] || badges.normal;
  };

  return (
    <div className="p-8">
      {/* Top Actions */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="搜索数据库名称或类型..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新建知识库
        </button>
      </div>

      {/* Database Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[200px]">数据库名称</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[120px]">类型</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[120px]">状态</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[120px]">数据量</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[110px]">绑定智能体</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[140px]">最近更新</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[200px]">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockDatabases.map((db) => {
              const Icon = getTypeIcon(db.type);
              const statusBadge = getStatusBadge(db.status);
              
              return (
                <tr key={db.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{db.name}</div>
                        <div className="text-xs text-gray-500 truncate">{db.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 truncate">{getTypeLabel(db.type)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusBadge.bg} ${statusBadge.text}`}
                    >
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      {db.dataCount.toLocaleString()} {db.type === 'vector' ? '条' : '个'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 whitespace-nowrap">{db.boundAgents} 个</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{db.lastUpdated}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap">
                        查看
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 text-sm font-medium whitespace-nowrap">
                        编辑
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium whitespace-nowrap">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {mockDatabases.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无数据库</h3>
          <p className="text-gray-600 mb-4">请创建您的第一个知识库</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            新建知识库
          </button>
        </div>
      )}
    </div>
  );
}

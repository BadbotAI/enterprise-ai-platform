import { Link } from 'react-router';
import { Star, GitBranch, Users, Download } from 'lucide-react';

interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description: string;
    scene: string;
    creator: string;
    nodeCount: number;
    agentCount: number;
    usedBy: number;
    updatedAt: string;
  };
  toggleFavorite?: (workflowId: string) => void;
  isFavorite?: boolean;
}

export function WorkflowCard({ workflow, toggleFavorite, isFavorite = false }: WorkflowCardProps) {
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleFavorite) {
      toggleFavorite(workflow.id);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  return (
    <Link
      to={`/workflow/${workflow.id}`}
      className="group bg-white rounded-lg border border-gray-200/60 hover:border-gray-300 hover:shadow-md transition-all duration-200 flex flex-col h-full relative p-6"
    >
      {/* Favorite Icon - Top Right Corner */}
      <button
        onClick={handleFavorite}
        className="absolute top-6 right-6 p-1.5 rounded-md hover:bg-gray-50 transition-colors z-10"
        title={isFavorite ? '已收藏' : '收藏'}
      >
        <Star 
          className={`w-4.5 h-4.5 transition-colors ${
            isFavorite 
              ? 'fill-amber-400 text-amber-400' 
              : 'text-gray-300 hover:text-amber-400'
          }`}
        />
      </button>

      {/* Header */}
      <div className="flex items-start justify-between pr-8 mb-3">
        <div className="flex items-end gap-2 min-w-0 flex-1">
          <h3 className="font-medium text-base text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {workflow.name}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
        {workflow.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-2 flex-1">
        <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded border border-gray-200/50 h-fit">
          {workflow.scene}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100/80 mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
              {workflow.creator[0]}
            </div>
            <span className="text-xs text-gray-500">{workflow.creator}</span>
          </div>
          <span className="text-xs text-gray-400">{formatDate(workflow.updatedAt)}</span>
        </div>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // 处理安装逻辑
          }}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          安装
        </button>
      </div>
    </Link>
  );
}

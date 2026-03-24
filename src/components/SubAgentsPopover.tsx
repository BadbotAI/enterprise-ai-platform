import { Sparkles, Clock } from 'lucide-react';
import { Agent } from '../data/mockData';
import { useEffect, useRef } from 'react';

interface SubAgentsPopoverProps {
  agent: Agent;
  onClose: () => void;
  buttonRef: HTMLElement | null;
}

export function SubAgentsPopover({ agent, onClose, buttonRef }: SubAgentsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef &&
        !buttonRef.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, buttonRef]);

  if (!agent.subAgents || agent.subAgents.length === 0) {
    return null;
  }

  // Calculate position
  const position = buttonRef?.getBoundingClientRect();
  const popoverTop = position ? position.bottom + 8 : 0;
  const popoverLeft = position ? position.left : 0;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 w-[280px] bg-white rounded-lg shadow-lg border border-gray-200/80 overflow-hidden"
      style={{
        top: `${popoverTop}px`,
        left: `${popoverLeft}px`,
      }}
    >
      {/* Header - Simple text */}
      <div className="px-3 py-2 border-b border-gray-100/80">
        <p className="text-xs text-gray-400">
          共有 {agent.subAgents.length} 个子智能体
        </p>
      </div>

      {/* Sub-agents List - Maximum 4 items with scroll */}
      <div className="max-h-[140px] overflow-y-auto p-1.5">
        {agent.subAgents.map((subAgent) => (
          <div
            key={subAgent.id}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-md transition-colors cursor-pointer group"
          >
            {/* Icon */}
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            
            {/* Name */}
            <span className="text-xs text-gray-900 font-medium flex-1 truncate group-hover:text-purple-600 transition-colors">
              {subAgent.name}
            </span>
            
            {/* Pending Icon for deprecated */}
            {subAgent.deprecated && (
              <div className="flex-shrink-0" title="即将停用">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

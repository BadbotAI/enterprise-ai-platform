import { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Plus, Package, Boxes, ArrowLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';

const FACTORY_SIDEBAR_COLLAPSED_KEY = 'factory-sidebar-collapsed';

interface NavItem {
  id: string;
  icon: typeof Plus;
  label: string;
  path: string;
}

interface NavGroup {
  category: string;
  items: NavItem[];
}

export function FactorySidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(FACTORY_SIDEBAR_COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(FACTORY_SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const navGroups: NavGroup[] = [
    {
      category: '',
      items: [
        {
          id: 'create',
          icon: Plus,
          label: '新建智能体',
          path: '/factory/workshop/create',
        },
        {
          id: 'warehouse',
          icon: Package,
          label: '我的智能体',
          path: '/factory/warehouse',
        },
        {
          id: 'materials',
          icon: Boxes,
          label: '开发资源管理',
          path: '/factory/materials/resources',
        },
      ],
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div
      className={`bg-white/60 backdrop-blur-xl border-r border-[#e2e8f0] h-screen flex flex-col transition-[width] duration-200 ease-out overflow-hidden ${
        collapsed ? 'w-[52px]' : 'w-60'
      }`}
      aria-label="智能体工厂导航"
    >
      {/* Header */}
      <div
        className={`border-b border-[#e2e8f0] flex items-center gap-2 flex-shrink-0 ${
          collapsed ? 'flex-col px-2 py-3 gap-2' : 'px-4 py-4 justify-between'
        }`}
      >
        <div className={`flex items-center gap-2.5 min-w-0 ${collapsed ? 'flex-col' : 'flex-1'}`}>
          <button
            type="button"
            onClick={() => navigate('/galaxy')}
            className="w-8 h-8 rounded-lg bg-[#edf1f8]/80 hover:bg-[#d8e0ec] flex items-center justify-center transition-colors flex-shrink-0"
            title="返回首页"
          >
            <ArrowLeft className="w-4 h-4 text-[#4a5b73]" />
          </button>
          {!collapsed && (
            <span
              className="text-[15px] text-[#0d1b2a] truncate flex-1 min-w-0"
              style={{ fontWeight: 500 }}
            >
              智能体工厂
            </span>
          )}
          {collapsed && <span className="sr-only">智能体工厂</span>}
        </div>
        <button
          type="button"
          onClick={toggleCollapsed}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7d8da1] hover:bg-[#edf1f8] hover:text-[#0d1b2a] transition-colors flex-shrink-0"
          title={collapsed ? '展开导航' : '收起导航'}
          aria-expanded={!collapsed}
          aria-label={collapsed ? '展开导航' : '收起导航'}
        >
          {collapsed ? (
            <ChevronsRight className="w-[18px] h-[18px]" />
          ) : (
            <ChevronsLeft className="w-[18px] h-[18px]" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {groupIndex > 0 && (
              <div className={`my-3 border-t border-[#e2e8f0] ${collapsed ? 'mx-2' : 'mx-4'}`} />
            )}
            <ul className={`space-y-0.5 ${collapsed ? 'px-1.5' : 'px-2'}`}>
              {group.items.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);

                return (
                  <li key={item.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      title={item.label}
                      className={`w-full flex items-center rounded-xl transition-all duration-200 cursor-pointer ${
                        collapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2.5'
                      } ${
                        active
                          ? 'bg-[#0d1b2a] text-white shadow-md shadow-[#0d1b2a]/15'
                          : 'text-[#4a5b73] hover:bg-[#edf1f8] hover:text-[#1b2d45]'
                      }`}
                      onClick={() => navigate(item.path)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(item.path);
                        }
                      }}
                    >
                      <IconComponent className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-white/90' : ''}`} />
                      {!collapsed && (
                        <span className="text-sm truncate" style={{ fontWeight: active ? 500 : 400 }}>
                          {item.label}
                        </span>
                      )}
                      {collapsed && <span className="sr-only">{item.label}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`py-3 border-t border-[#e2e8f0] flex-shrink-0 ${collapsed ? 'px-2 flex justify-center' : 'px-5'}`}>
        {!collapsed ? (
          <p className="text-xs text-[#a3b1c6]" style={{ fontWeight: 400 }}>
            v2.1.0
          </p>
        ) : (
          <p className="sr-only">版本 v2.1.0</p>
        )}
      </div>
    </div>
  );
}
import { ReactNode, useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { UserMode } from '../App';
import {
  Compass,
  Home,
  Sparkles,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
  Factory,
  LayoutDashboard,
  Wrench,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';

const SIDEBAR_COLLAPSED_KEY = 'layout-sidebar-collapsed';

interface LayoutProps {
  children: ReactNode;
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
}

export function Layout({ children, userMode, setUserMode }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const hideSidebarPaths = ['/marketplace/', '/docs', '/super-factory', '/factory', '/galaxy'];
  const shouldHideSidebar = hideSidebarPaths.some(path => location.pathname.includes(path));
  
  const isDocsPage = location.pathname === '/docs';
  const isSuperFactoryPage = location.pathname === '/super-factory';
  const isGalaxyPage = location.pathname === '/galaxy';
  const isFactoryPage = location.pathname.startsWith('/factory');

  const navItems = [
    { path: '/galaxy', icon: Home, label: '初始页面' },
    { path: '/', icon: LayoutDashboard, label: '工作台' },
    { path: '/marketplace', icon: Compass, label: '探索市场' },
    { path: '/factory/warehouse', icon: Factory, label: '智能体工厂' },
  ];

  const managementNavItems = [
    { path: '/monitoring', icon: LayoutDashboard, label: '智能体管理' },
    { path: '/management/agents', icon: Wrench, label: '开发资源管理' },
    { path: '/monitor', icon: BarChart3, label: 'Monitor' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      {/* Top Bar */}
      {!isGalaxyPage && !isFactoryPage && (isSuperFactoryPage ? (
        <div className="bg-[#0d1b2a] border-b border-[#1b2d45] sticky top-0 z-50">
          <div className="px-6 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/galaxy')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#7d8da1] hover:text-white"
                  title="返回首页"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#c7000b] rounded-lg flex items-center justify-center">
                    <Factory className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base text-white tracking-wide" style={{ fontWeight: 500 }}>智能体超级工厂</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-[#1b2d45] flex items-center justify-center text-white flex-shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-[#8e9fb5]" style={{ fontWeight: 400 }}>张伟</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-xl border-b border-[#e2e8f0] sticky top-0 z-50">
          <div className="px-6 py-3.5">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#0d1b2a] rounded-lg flex items-center justify-center shadow-md shadow-[#0d1b2a]/15">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-base text-[#0d1b2a] tracking-wide" style={{ fontWeight: 500 }}>企业智能平台</span>
              </Link>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#edf1f8] rounded-lg transition-colors cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-[#0d1b2a] flex items-center justify-center text-white flex-shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-[#4a5b73]" style={{ fontWeight: 400 }}>张伟</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex">
        {/* Sidebar */}
        {!shouldHideSidebar && (
          <aside
            className={`bg-white/60 backdrop-blur-xl border-r border-[#e2e8f0] flex-shrink-0 flex flex-col transition-[width] duration-200 ease-out overflow-hidden ${
              sidebarCollapsed ? 'w-[52px]' : 'w-60'
            } ${isGalaxyPage || isFactoryPage ? 'h-screen sticky top-0' : 'h-[calc(100vh-57px)] sticky top-[57px]'}`}
          >
            <div className={`flex items-center p-2 border-b border-[#e2e8f0]/80 ${sidebarCollapsed ? 'justify-center' : 'justify-end'}`}>
              <button
                type="button"
                onClick={toggleSidebar}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#7d8da1] hover:bg-[#edf1f8] hover:text-[#0d1b2a] transition-colors"
                title={sidebarCollapsed ? '展开导航' : '收起导航'}
                aria-expanded={!sidebarCollapsed}
                aria-label={sidebarCollapsed ? '展开导航' : '收起导航'}
              >
                {sidebarCollapsed ? (
                  <ChevronsRight className="w-[18px] h-[18px]" />
                ) : (
                  <ChevronsLeft className="w-[18px] h-[18px]" />
                )}
              </button>
            </div>
            <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto overflow-x-hidden">
              <div className="space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      className={`flex items-center rounded-xl transition-all group ${
                        sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-[#0d1b2a] text-white shadow-md shadow-[#0d1b2a]/15'
                          : 'text-[#4a5b73] hover:bg-[#edf1f8] hover:text-[#1b2d45]'
                      }`}
                    >
                      <Icon
                        className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white/90' : 'text-[#7d8da1] group-hover:text-[#4a5b73]'}`}
                      />
                      {!sidebarCollapsed && (
                        <span className="text-sm truncate" style={{ fontWeight: isActive ? 500 : 400 }}>
                          {item.label}
                        </span>
                      )}
                      {!sidebarCollapsed && isActive && (
                        <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-white/50" />
                      )}
                      {sidebarCollapsed && <span className="sr-only">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>

              <div className={`!my-3 border-t border-[#e2e8f0] ${sidebarCollapsed ? 'mx-1.5' : 'mx-2'}`} />

              <div className="space-y-0.5">
                {managementNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      className={`flex items-center rounded-xl transition-all group ${
                        sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-[#0d1b2a] text-white shadow-md shadow-[#0d1b2a]/15'
                          : 'text-[#4a5b73] hover:bg-[#edf1f8] hover:text-[#1b2d45]'
                      }`}
                    >
                      <Icon
                        className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white/90' : 'text-[#7d8da1] group-hover:text-[#4a5b73]'}`}
                      />
                      {!sidebarCollapsed && (
                        <span className="text-sm truncate" style={{ fontWeight: isActive ? 500 : 400 }}>
                          {item.label}
                        </span>
                      )}
                      {!sidebarCollapsed && isActive && (
                        <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-white/50" />
                      )}
                      {sidebarCollapsed && <span className="sr-only">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${isGalaxyPage || isFactoryPage ? 'min-h-screen' : 'min-h-[calc(100vh-57px)]'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
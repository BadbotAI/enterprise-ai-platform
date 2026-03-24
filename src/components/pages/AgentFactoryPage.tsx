import { Wrench, Package, LayoutDashboard, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import imgHome from "figma:asset/5c0702819e6e0f5b0f3f49fe7ef0ebac13d9684d.png";

export function AgentFactoryPage() {
  const navigate = useNavigate();

  const factoryModules = [
    {
      id: 'create',
      icon: Wrench,
      title: '新建智能体',
      description: 'Agent 可视化与人工搭建',
      path: '/factory/workshop/create',
    },
    {
      id: 'warehouse',
      icon: Package,
      title: '我的智能体',
      description: 'Agent 资产查看与管理',
      path: '/factory/warehouse',
    },
    {
      id: 'materials',
      icon: LayoutDashboard,
      title: '开发资源管理',
      description: '工具、模型、知识库管理',
      path: '/factory/materials/resources',
    },
  ];

  const handleModuleClick = (path: string) => {
    if (path !== '#') {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={imgHome} 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div 
          className="absolute inset-0 bg-black/50" 
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/galaxy')}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 hover:opacity-80 transition-opacity"
        title="返回首页"
      >
        <ArrowLeft className="w-[18px] h-[18px] text-white/70" />
        <span className="text-[14px] text-white/70 tracking-wide">智能体工厂</span>
      </button>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1200px] px-6 py-16 flex flex-col items-center gap-16">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <h1 className="text-[48px] text-white tracking-wide" style={{ fontWeight: 300 }}>
            智能体工厂
          </h1>
          <p className="text-sm text-white/40 tracking-wider">
            AI Agent 全生命周期管理平台
          </p>
        </div>

        {/* Module Cards Grid - 2 Rows x 3 Columns */}
        <div className="w-full grid grid-cols-2 gap-4">
          {factoryModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.path)}
                className="group bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-lg p-6 transition-all duration-300 hover:bg-white/[0.1] hover:border-white/[0.15] text-left"
              >
                <div className="flex flex-col gap-4">
                  {/* Icon */}
                  <div className="w-11 h-11 bg-white/[0.08] border border-white/[0.08] rounded-md flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-white/70" />
                  </div>

                  {/* Content */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[15px] text-white/90 mb-1">
                        {module.title}
                      </h3>
                      <p className="text-xs text-white/35">
                        {module.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-white/20 tracking-wide">
            v2.1.0 · © 2026 Supply Chain Agent Platform
          </p>
        </div>
      </div>
    </div>
  );
}
import { FactorySidebar } from '../../FactorySidebar';
import { Boxes, Wrench, Compass, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

export function MaterialsPage() {
  const navigate = useNavigate();

  const stats = [
    { label: '工具', value: '48' },
    { label: '模型', value: '12' },
    { label: '技能', value: '27' },
    { label: '知识库', value: '18' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      <FactorySidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="px-8 pt-6 pb-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[22px] text-[#0d1b2a] mb-1" style={{ fontWeight: 500 }}>开发资源管理</h1>
            <p className="text-xs text-[#7d8da1]" style={{ fontWeight: 400 }}>工具、模型、技能与知识库的统一管理</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] px-4 py-4 hover:border-[#cbd5e1] transition-colors">
                <p className="text-xs text-[#7d8da1] mb-2" style={{ fontWeight: 400 }}>{stat.label}</p>
                <span className="text-2xl text-[#0d1b2a] tracking-tight" style={{ fontWeight: 400 }}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/factory/materials/resources')}
              className="group bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-lg hover:shadow-[#0d1b2a]/[0.04] transition-all text-left p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#edf1f8] rounded-xl flex items-center justify-center group-hover:bg-[#0d1b2a] transition-colors">
                  <Wrench className="w-5 h-5 text-[#4a5b73] group-hover:text-white transition-colors" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#a3b1c6] group-hover:text-[#0d1b2a] transition-colors" />
              </div>
              <h3 className="text-[15px] text-[#0d1b2a] mb-1" style={{ fontWeight: 500 }}>资源管理</h3>
              <p className="text-xs text-[#7d8da1]" style={{ fontWeight: 400 }}>管理智能体、模型、工具和技能资源</p>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
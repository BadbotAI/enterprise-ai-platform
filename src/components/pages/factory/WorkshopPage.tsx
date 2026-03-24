import { FactorySidebar } from '../../FactorySidebar';
import { Wrench, Plus, List, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

export function WorkshopPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#eef0f6] via-[#f3f4f9] to-[#eaedf4]">
      <FactorySidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="px-8 pt-6 pb-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[22px] text-[#191919] mb-1" style={{ fontWeight: 300 }}>制造车间</h1>
            <p className="text-xs text-[#999]">智能体可视化搭建与编辑</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: '进行中', value: '23' },
              { label: '已完成', value: '156' },
              { label: '待审核', value: '8' },
              { label: '成功率', value: '92%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] px-4 py-4 hover:border-[#cbd5e1] transition-colors">
                <p className="text-xs text-[#999] mb-2">{stat.label}</p>
                <span className="text-2xl text-[#191919] tracking-tight" style={{ fontWeight: 300 }}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/factory/workshop/wip')}
              className="group bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm hover:shadow-[#0d1b2a]/[0.03] transition-all text-left p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#f5f5f5] rounded-lg flex items-center justify-center group-hover:bg-[#191919] transition-colors">
                  <List className="w-5 h-5 text-[#666] group-hover:text-white transition-colors" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#ccc] group-hover:text-[#191919] transition-colors" />
              </div>
              <h3 className="text-[15px] text-[#191919] mb-1">工作台</h3>
              <p className="text-xs text-[#999]">查看正在制造中的智能体</p>
            </button>

            <button
              onClick={() => navigate('/factory/workshop/create')}
              className="group bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm hover:shadow-[#0d1b2a]/[0.03] transition-all text-left p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#f5f5f5] rounded-lg flex items-center justify-center group-hover:bg-[#191919] transition-colors">
                  <Plus className="w-5 h-5 text-[#666] group-hover:text-white transition-colors" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#ccc] group-hover:text-[#191919] transition-colors" />
              </div>
              <h3 className="text-[15px] text-[#191919] mb-1">新建智能体</h3>
              <p className="text-xs text-[#999]">开始创建新的智能体</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
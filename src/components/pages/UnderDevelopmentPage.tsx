import { Construction, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

export function UnderDevelopmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const fromGalaxy = location.state?.from === 'galaxy';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-73px)] p-8 relative">
      {/* Back Button - only show if from galaxy page */}
      {fromGalaxy && (
        <button
          onClick={() => navigate('/galaxy')}
          className="absolute top-8 left-8 w-8 h-8 rounded-lg bg-[#edf1f8]/80 hover:bg-[#d8e0ec] flex items-center justify-center transition-colors"
          title="返回首页"
        >
          <ArrowLeft className="w-4 h-4 text-[#4a5b73]" />
        </button>
      )}

      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Construction className="w-12 h-12 text-amber-600" />
        </div>
        <h1 className="text-3xl mb-3 text-[#0d1b2a]" style={{ fontWeight: 500 }}>功能开发中</h1>
        <p className="text-[#7d8da1] text-lg mb-6">
          该功能正在紧急开发中，敬请期待...
        </p>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#edf1f8] rounded-lg">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm text-[#4a5b73]" style={{ fontWeight: 400 }}>开发进行中</span>
        </div>
      </div>
    </div>
  );
}
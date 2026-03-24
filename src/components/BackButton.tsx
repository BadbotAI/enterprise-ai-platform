import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface BackButtonProps {
  defaultPath?: string;
  className?: string;
}

export function BackButton({ defaultPath, className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (defaultPath) {
      navigate(defaultPath);
    } else {
      navigate('/galaxy');
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`w-8 h-8 rounded-lg bg-[#edf1f8]/80 hover:bg-[#d8e0ec] flex items-center justify-center transition-colors ${className}`}
      title="返回首页"
    >
      <ArrowLeft className="w-4 h-4 text-[#4a5b73]" />
    </button>
  );
}
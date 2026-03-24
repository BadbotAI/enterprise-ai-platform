import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

// ── Card data ─────────────────────────────────────────────────
const CARDS = [
  {
    id: 'factory',
    title: '智能体工厂',
    subtitle: 'Agent Factory',
    description: '全生命周期智能体搭建、配置与管理',
    path: '/factory/warehouse',
    accentColor: '#2563eb',
    icon: (color: string) => (
      <svg viewBox="0 0 64 64" width="44" height="44" fill="none">
        <circle cx="32" cy="32" r="14" stroke={color} strokeWidth="1.5" opacity="0.5" />
        <circle cx="32" cy="32" r="7" fill={color} opacity="0.6" />
        <circle cx="32" cy="12" r="3.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
        <circle cx="32" cy="52" r="3.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
        <circle cx="12" cy="32" r="3.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
        <circle cx="52" cy="32" r="3.5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
        <line x1="32" y1="15.5" x2="32" y2="18" stroke={color} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
        <line x1="32" y1="46" x2="32" y2="48.5" stroke={color} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
        <line x1="15.5" y1="32" x2="18" y2="32" stroke={color} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
        <line x1="46" y1="32" x2="48.5" y2="32" stroke={color} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'studio',
    title: 'Studio 工作流',
    subtitle: 'Workflow Studio',
    description: '可视化编排多智能体协作工作流',
    path: '/studio',
    accentColor: '#7c3aed',
    icon: (color: string) => (
      <svg viewBox="0 0 64 64" width="44" height="44" fill="none">
        <rect x="8" y="24" width="16" height="16" rx="4" stroke={color} strokeWidth="1.3" opacity="0.6" />
        <rect x="40" y="12" width="16" height="16" rx="4" stroke={color} strokeWidth="1.3" opacity="0.6" />
        <rect x="40" y="36" width="16" height="16" rx="4" stroke={color} strokeWidth="1.3" opacity="0.6" />
        <line x1="24" y1="30" x2="40" y2="22" stroke={color} strokeWidth="1.2" opacity="0.45" strokeLinecap="round" />
        <line x1="24" y1="34" x2="40" y2="42" stroke={color} strokeWidth="1.2" opacity="0.45" strokeLinecap="round" />
        <circle cx="16" cy="32" r="3" fill={color} opacity="0.5" />
        <circle cx="48" cy="20" r="3" fill={color} opacity="0.5" />
        <circle cx="48" cy="44" r="3" fill={color} opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'asset-dashboard',
    title: '资产看板',
    subtitle: 'Asset Dashboard',
    description: '算力、数据、应用资产全景监控',
    path: '/dashboard/agent-monitor',
    accentColor: '#059669',
    icon: (color: string) => (
      <svg viewBox="0 0 64 64" width="44" height="44" fill="none">
        <circle cx="32" cy="32" r="24" stroke={color} strokeWidth="0.8" opacity="0.25" />
        <circle cx="32" cy="32" r="16" stroke={color} strokeWidth="1" opacity="0.4" />
        <circle cx="32" cy="32" r="5" fill={color} opacity="0.6" />
        <polyline points="10,42 18,32 26,36 34,24 42,30 52,18" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M32 8 L32 14M32 50 L32 56M8 32 L14 32M50 32 L56 32" stroke={color} strokeWidth="1" opacity="0.35" strokeLinecap="round" />
      </svg>
    ),
  },
];

// ── Icon Card (white glassmorphism style, horizontal layout) ───────────────────
function IconCard({ card, delay }: { card: typeof CARDS[0]; delay: number }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <button
      onClick={() => navigate(card.path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', cursor: 'pointer',
        borderRadius: 20,
        border: 'none',
        outline: `1px solid ${hovered ? 'rgba(255,255,255,0.95)' : 'rgba(226,232,240,0.7)'}`,
        outlineOffset: '-1px',
        background: hovered ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        gap: 28,
        padding: '36px 36px',
        overflow: 'hidden',
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? (hovered ? 'translateY(-4px)' : 'translateY(0)')
          : 'translateY(20px)',
        boxShadow: hovered
          ? `0 20px 40px rgba(0,0,0,0.07), 0 0 0 1px rgba(255,255,255,0.5)`
          : `0 2px 12px rgba(0,0,0,0.03)`,
        transition: 'all 0.35s cubic-bezier(0.34,1.2,0.64,1)',
        fontFamily: 'inherit',
        textAlign: 'left',
        width: '100%',
      }}
    >
      {/* Accent glow on hover */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none',
        background: `radial-gradient(circle at 15% 50%, ${card.accentColor}0a 0%, transparent 60%)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.35s ease',
      }} />

      {/* Left accent line */}
      <div style={{
        position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 3, borderRadius: '0 2px 2px 0',
        background: `linear-gradient(180deg, transparent, ${card.accentColor}${hovered ? '80' : '35'}, transparent)`,
        transition: 'background 0.3s ease',
      }} />

      {/* Icon container */}
      <div style={{
        position: 'relative', zIndex: 1, flexShrink: 0,
        width: 72, height: 72,
        borderRadius: 18,
        background: `linear-gradient(145deg, ${card.accentColor}0c, ${card.accentColor}05)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: hovered ? 'scale(1.06)' : 'scale(1)',
        transition: 'transform 0.35s ease',
      }}>
        {card.icon(card.accentColor)}
      </div>

      {/* Text content */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 19, fontWeight: 600, color: '#0d1b2a', marginBottom: 4, lineHeight: 1.3 }}>
          {card.title}
        </div>
        <div style={{ fontSize: 12, color: '#a3b1c6', letterSpacing: '0.04em', marginBottom: 8 }}>
          {card.subtitle}
        </div>
        <div style={{ fontSize: 13, color: '#7d8da1', lineHeight: 1.6 }}>
          {card.description}
        </div>
      </div>

      {/* Arrow indicator */}
      <div style={{
        position: 'relative', zIndex: 1, flexShrink: 0,
        width: 32, height: 32, borderRadius: 10,
        background: hovered ? `${card.accentColor}12` : 'rgba(0,0,0,0.03)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s ease',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 3.5L10.5 8L6 12.5"
            stroke={hovered ? card.accentColor : '#a3b1c6'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export function GalaxyGuardianPage() {
  return (
    <div
      style={{
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        background: '#f0f2f8',
        fontFamily: "'PingFang SC','Noto Sans SC','Helvetica Neue',sans-serif",
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* ── Rich background layers ── */}

      {/* Base gradient mesh */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 80% 60% at 20% 20%, rgba(59,130,246,0.07) 0%, transparent 50%),
          radial-gradient(ellipse 70% 50% at 80% 30%, rgba(139,92,246,0.06) 0%, transparent 50%),
          radial-gradient(ellipse 60% 70% at 50% 80%, rgba(16,185,129,0.05) 0%, transparent 50%),
          radial-gradient(ellipse 50% 40% at 90% 80%, rgba(245,158,11,0.05) 0%, transparent 50%),
          linear-gradient(145deg, #eef0f6 0%, #f3f4f9 30%, #eef2fa 60%, #eaedf4 100%)
        `,
      }} />

      {/* Geometric grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(100,130,200,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(100,130,200,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 10%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 10%, transparent 70%)',
      }} />

      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(100,130,200,0.12) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        maskImage: 'radial-gradient(ellipse 70% 50% at 50% 45%, black 15%, transparent 65%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 45%, black 15%, transparent 65%)',
      }} />

      {/* Large ambient orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-15%', left: '5%', width: 800, height: 800, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.065) 0%, rgba(59,130,246,0.02) 40%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', top: '10%', right: '-10%', width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, rgba(139,92,246,0.015) 40%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '0%', left: '20%', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.01) 40%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, rgba(245,158,11,0.01) 40%, transparent 65%)',
        }} />
      </div>

      {/* Decorative concentric rings behind title */}
      <div style={{
        position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 700, pointerEvents: 'none', opacity: 0.04,
      }}>
        <svg width="700" height="700" viewBox="0 0 700 700" fill="none">
          <circle cx="350" cy="350" r="340" stroke="rgba(100,130,200,1)" strokeWidth="0.5" />
          <circle cx="350" cy="350" r="260" stroke="rgba(100,130,200,1)" strokeWidth="0.5" strokeDasharray="6 12" />
          <circle cx="350" cy="350" r="180" stroke="rgba(100,130,200,1)" strokeWidth="0.7" />
          <circle cx="350" cy="350" r="100" stroke="rgba(100,130,200,1)" strokeWidth="0.5" strokeDasharray="3 8" />
          <line x1="350" y1="10" x2="350" y2="690" stroke="rgba(100,130,200,0.3)" strokeWidth="0.5" />
          <line x1="10" y1="350" x2="690" y2="350" stroke="rgba(100,130,200,0.3)" strokeWidth="0.5" />
          <line x1="100" y1="100" x2="600" y2="600" stroke="rgba(100,130,200,0.15)" strokeWidth="0.5" strokeDasharray="4 10" />
          <line x1="600" y1="100" x2="100" y2="600" stroke="rgba(100,130,200,0.15)" strokeWidth="0.5" strokeDasharray="4 10" />
        </svg>
      </div>

      {/* ── Main content ── */}
      <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px' }}>

        {/* Title section */}
        <div style={{ textAlign: 'center', marginBottom: 64, position: 'relative' }}>
          {/* Flanking decorations */}
          <div style={{ position: 'absolute', left: -64, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 5, opacity: 0.28 }}>
            <div style={{ width: 36, height: 1, background: 'linear-gradient(90deg, transparent, #4a7bc8)' }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', boxShadow: 'inset 0 0 0 1px #4a7bc8' }} />
          </div>
          <div style={{ position: 'absolute', right: -64, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 5, opacity: 0.28 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', boxShadow: 'inset 0 0 0 1px #4a7bc8' }} />
            <div style={{ width: 36, height: 1, background: 'linear-gradient(90deg, #4a7bc8, transparent)' }} />
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 300, lineHeight: 1.2, color: '#0d1b2a', letterSpacing: '-0.02em', marginBottom: 18 }}>
            企业智能平台
          </h1>
          <p style={{ fontSize: 15, color: '#7d8da1', letterSpacing: '0.02em', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            智能体协同驱动的全流程智能化解决方案，<br />覆盖构建、编排、监控与分析全链路
          </p>
        </div>

        {/* Icon cards — single horizontal row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 24,
          width: '100%', maxWidth: 1200, padding: '0 20px',
        }}>
          {CARDS.map((card, i) => (
            <IconCard key={card.id} card={card} delay={i * 100} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: inherit; background: none; }
      `}</style>
    </div>
  );
}
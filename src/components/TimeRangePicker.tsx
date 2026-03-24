import { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────
function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function fmt(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function fmtShort(d: Date) { return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`; }
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function inRange(d: Date, from: Date, to: Date) {
  const t = d.getTime();
  return t >= from.getTime() && t <= to.getTime();
}
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function startOfDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export type TimeRangePreset = 'today' | '7d' | '30d' | 'custom';

interface TimeRangePickerProps {
  value: TimeRangePreset;
  onChange: (preset: TimeRangePreset) => void;
  customFrom?: Date;
  customTo?: Date;
  onCustomChange?: (from: Date, to: Date) => void;
}

export function TimeRangePicker({ value, onChange, customFrom, customTo, onCustomChange }: TimeRangePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calendar state — show two months side by side
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // left panel month

  // Selection state inside popover
  const [selFrom, setSelFrom] = useState<Date | null>(customFrom || null);
  const [selTo, setSelTo] = useState<Date | null>(customTo || null);
  const [hovered, setHovered] = useState<Date | null>(null);

  // Sync external custom dates into local selection when opening
  useEffect(() => {
    if (open) {
      setSelFrom(customFrom || null);
      setSelTo(customTo || null);
      if (customFrom) {
        setViewYear(customFrom.getFullYear());
        setViewMonth(customFrom.getMonth());
      } else {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth() - 1 < 0 ? 0 : today.getMonth() - 1);
      }
    }
  }, [open]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleDayClick = useCallback((d: Date) => {
    if (!selFrom || (selFrom && selTo)) {
      // Start new selection
      setSelFrom(d);
      setSelTo(null);
    } else {
      // Complete selection
      if (d.getTime() < selFrom.getTime()) {
        setSelTo(selFrom);
        setSelFrom(d);
      } else {
        setSelTo(d);
      }
    }
  }, [selFrom, selTo]);

  const handleApply = () => {
    if (selFrom && selTo) {
      onCustomChange?.(selFrom, selTo);
      onChange('custom');
      setOpen(false);
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const presets: { key: TimeRangePreset; label: string }[] = [
    { key: 'today', label: '今日' },
    { key: '7d', label: '近7天' },
    { key: '30d', label: '近30天' },
  ];

  // Display label for the button
  const displayLabel = value === 'custom' && customFrom && customTo
    ? `${fmtShort(customFrom)} - ${fmtShort(customTo)}`
    : null;

  // Effective range for hover highlighting
  const effectiveFrom = selFrom;
  const effectiveTo = selTo || (selFrom && hovered && hovered.getTime() >= selFrom.getTime() ? hovered : null);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#edf1f8', borderRadius: 8, padding: 2, gap: 0 }}>
        {presets.map(p => {
          const active = value === p.key;
          return (
            <button key={p.key} onClick={() => { onChange(p.key); setOpen(false); }} style={{
              padding: '5px 12px', borderRadius: 6, fontSize: 12, fontFamily: 'inherit',
              border: 'none', cursor: 'pointer', fontWeight: active ? 500 : 400,
              background: active ? '#fff' : 'transparent',
              color: active ? '#0d1b2a' : '#7d8da1',
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}>
              {p.label}
            </button>
          );
        })}

        {/* Custom range trigger */}
        <button onClick={() => setOpen(!open)} style={{
          padding: displayLabel ? '5px 10px' : '5px 8px', borderRadius: 6, fontSize: 12, fontFamily: 'inherit',
          border: 'none', cursor: 'pointer', fontWeight: value === 'custom' ? 500 : 400,
          background: value === 'custom' ? '#fff' : 'transparent',
          color: value === 'custom' ? '#0d1b2a' : '#7d8da1',
          boxShadow: value === 'custom' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.15s ease',
          display: 'flex', alignItems: 'center', gap: displayLabel ? 5 : 0,
          whiteSpace: 'nowrap',
        }}>
          <Calendar size={13} style={{ opacity: value === 'custom' ? 1 : 0.55, flexShrink: 0 }} />
          {displayLabel && <span>{displayLabel}</span>}
        </button>
      </div>

      {/* ── Calendar Popover ── */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 999,
          background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
          padding: 0, overflow: 'hidden',
          minWidth: 520,
        }}>
          {/* Popover header */}
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #edf1f8',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#0d1b2a' }}>选择日期范围</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {selFrom && (
                <span style={{ fontSize: 12, color: '#4a5b73', fontFamily: "'DM Sans', sans-serif" }}>
                  {fmt(selFrom)}{selTo ? ` → ${fmt(selTo)}` : ' → ...'}
                </span>
              )}
            </div>
          </div>

          {/* Calendar body — two months */}
          <div style={{ display: 'flex', padding: '12px 8px 8px' }}>
            {[0, 1].map(offset => {
              const m = (viewMonth + offset) % 12;
              const y = viewMonth + offset > 11 ? viewYear + 1 : viewYear;
              const firstDay = new Date(y, m, 1).getDay(); // 0=Sun
              const mondayOffset = firstDay === 0 ? 6 : firstDay - 1;
              const totalDays = daysInMonth(y, m);
              const cells: (Date | null)[] = [];
              for (let i = 0; i < mondayOffset; i++) cells.push(null);
              for (let d = 1; d <= totalDays; d++) cells.push(new Date(y, m, d));

              return (
                <div key={offset} style={{ flex: 1, padding: '0 8px' }}>
                  {/* Month nav */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    {offset === 0 ? (
                      <button onClick={prevMonth} style={{
                        width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0',
                        background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'inherit',
                      }}>
                        <ChevronLeft size={14} color="#7d8da1" />
                      </button>
                    ) : <div style={{ width: 28 }} />}
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#0d1b2a' }}>
                      {y}年{m + 1}月
                    </span>
                    {offset === 1 ? (
                      <button onClick={nextMonth} style={{
                        width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0',
                        background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'inherit',
                      }}>
                        <ChevronRight size={14} color="#7d8da1" />
                      </button>
                    ) : <div style={{ width: 28 }} />}
                  </div>

                  {/* Weekday header */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, marginBottom: 4 }}>
                    {WEEKDAYS.map(w => (
                      <div key={w} style={{ textAlign: 'center', fontSize: 11, color: '#a3b1c6', padding: '2px 0' }}>{w}</div>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
                    {cells.map((day, i) => {
                      if (!day) return <div key={`e-${i}`} style={{ height: 32 }} />;

                      const isToday = isSameDay(day, today);
                      const isFuture = day.getTime() > today.getTime();
                      const isStart = effectiveFrom && isSameDay(day, effectiveFrom);
                      const isEnd = effectiveTo && isSameDay(day, effectiveTo);
                      const isInRange = effectiveFrom && effectiveTo && inRange(day, effectiveFrom, effectiveTo);
                      const isSelected = isStart || isEnd;

                      return (
                        <button
                          key={fmt(day)}
                          disabled={isFuture}
                          onClick={() => !isFuture && handleDayClick(day)}
                          onMouseEnter={() => !isFuture && setHovered(day)}
                          onMouseLeave={() => setHovered(null)}
                          style={{
                            height: 32, border: 'none', cursor: isFuture ? 'default' : 'pointer',
                            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: isSelected ? 600 : 400,
                            borderRadius: isStart ? '6px 0 0 6px' : isEnd ? '0 6px 6px 0' : (isSelected ? 6 : 0),
                            background: isSelected ? '#1e40af' : isInRange ? '#eff6ff' : 'transparent',
                            color: isFuture ? '#d1d5db' : isSelected ? '#fff' : isToday ? '#1e40af' : '#0d1b2a',
                            position: 'relative',
                            transition: 'background 0.1s, color 0.1s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {day.getDate()}
                          {isToday && !isSelected && (
                            <div style={{
                              position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
                              width: 3, height: 3, borderRadius: '50%', background: '#1e40af',
                            }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick presets inside popover */}
          <div style={{
            padding: '10px 16px', borderTop: '1px solid #edf1f8',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { label: '今日', from: startOfDay(today), to: today },
                { label: '近7天', from: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6), to: today },
                { label: '近30天', from: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29), to: today },
                { label: '近90天', from: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 89), to: today },
              ].map(q => (
                <button key={q.label} onClick={() => {
                  setSelFrom(q.from);
                  setSelTo(q.to);
                }} style={{
                  padding: '4px 10px', borderRadius: 5, fontSize: 11, fontFamily: 'inherit',
                  border: '1px solid #e2e8f0', background: '#f8f9fc', cursor: 'pointer',
                  color: '#4a5b73', fontWeight: 400,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#edf1f8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8f9fc'; }}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setSelFrom(null); setSelTo(null); }} style={{
                padding: '5px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'inherit',
                border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer',
                color: '#7d8da1',
              }}>
                清除
              </button>
              <button onClick={handleApply} disabled={!selFrom || !selTo} style={{
                padding: '5px 16px', borderRadius: 6, fontSize: 12, fontFamily: 'inherit',
                border: 'none', cursor: selFrom && selTo ? 'pointer' : 'default',
                background: selFrom && selTo ? '#1e40af' : '#e2e8f0',
                color: selFrom && selTo ? '#fff' : '#a3b1c6',
                fontWeight: 500, transition: 'all 0.15s',
              }}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
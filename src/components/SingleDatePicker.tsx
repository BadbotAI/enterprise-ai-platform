import { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function fmt(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function parseYmdLocal(s: string): Date {
  const p = s.split('-').map(Number);
  const [y, m, d] = p;
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export interface SingleDatePickerProps {
  valueYmd: string;
  onChangeYmd: (ymd: string) => void;
  /** 含当日：晚于此日的格子不可选（如「最晚昨日」则传昨日 ymd） */
  maxYmd: string;
  /** 左侧文案，默认「截止至」 */
  label?: string;
}

/**
 * 单选日期：点击触发器展开月历弹层（与 TimeRangePicker 弹层风格一致），不依赖原生 date 控件展示。
 */
export function SingleDatePicker({ valueYmd, onChangeYmd, maxYmd, label = '截止至' }: SingleDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  const maxDay = startOfDay(parseYmdLocal(maxYmd));

  const [viewYear, setViewYear] = useState(() => parseYmdLocal(valueYmd).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parseYmdLocal(valueYmd).getMonth());

  useEffect(() => {
    if (!open) return;
    const d = parseYmdLocal(valueYmd);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [open, valueYmd]);

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

  const displayShort = (() => {
    const p = valueYmd.split('-');
    if (p.length !== 3) return valueYmd;
    const [, mm, dd] = p;
    return `${mm.padStart(2, '0')}/${dd.padStart(2, '0')}`;
  })();

  const handleDayClick = useCallback(
    (day: Date) => {
      const t = startOfDay(day);
      if (t.getTime() > maxDay.getTime()) return;
      onChangeYmd(fmt(day));
      setOpen(false);
    },
    [maxDay, onChangeYmd],
  );

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else setViewMonth(m => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const mondayOffset = firstDay === 0 ? 6 : firstDay - 1;
  const totalDays = daysInMonth(viewYear, viewMonth);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < mondayOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(viewYear, viewMonth, d));

  const selected = parseYmdLocal(valueYmd);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#edf1f8', borderRadius: 8, padding: 2, gap: 0 }}>
        <span
          style={{
            padding: '5px 10px',
            fontSize: 12,
            fontFamily: 'inherit',
            color: '#7d8da1',
            fontWeight: 400,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="选择数据截止日期"
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'inherit',
            fontWeight: 500,
            background: '#fff',
            color: '#0d1b2a',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Calendar size={13} style={{ opacity: 0.85, flexShrink: 0 }} />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{displayShort}</span>
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="日历"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 999,
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
            padding: 0,
            overflow: 'hidden',
            minWidth: 280,
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #edf1f8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: '#0d1b2a' }}>选择日期</span>
            <span style={{ fontSize: 12, color: '#7d8da1', fontFamily: "'DM Sans', sans-serif", fontVariantNumeric: 'tabular-nums' }}>
              最晚 {maxYmd}
            </span>
          </div>

          <div style={{ padding: '12px 12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <button
                type="button"
                onClick={prevMonth}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'inherit',
                }}
              >
                <ChevronLeft size={14} color="#7d8da1" />
              </button>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#0d1b2a' }}>
                {viewYear}年{viewMonth + 1}月
              </span>
              <button
                type="button"
                onClick={nextMonth}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'inherit',
                }}
              >
                <ChevronRight size={14} color="#7d8da1" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, marginBottom: 4 }}>
              {WEEKDAYS.map(w => (
                <div key={w} style={{ textAlign: 'center', fontSize: 11, color: '#a3b1c6', padding: '2px 0' }}>
                  {w}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} style={{ height: 32 }} />;

                const t = startOfDay(day);
                const disabled = t.getTime() > maxDay.getTime();
                const isSel = isSameDay(day, selected);
                const isToday = isSameDay(day, today);

                return (
                  <button
                    key={fmt(day)}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && handleDayClick(day)}
                    style={{
                      height: 32,
                      border: 'none',
                      cursor: disabled ? 'default' : 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      fontWeight: isSel ? 600 : 400,
                      borderRadius: 6,
                      background: isSel ? '#1e40af' : 'transparent',
                      color: disabled ? '#d1d5db' : isSel ? '#fff' : isToday ? '#1e40af' : '#0d1b2a',
                      position: 'relative',
                      transition: 'background 0.1s, color 0.1s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {day.getDate()}
                    {isToday && !isSel && !disabled && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 3,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 3,
                          height: 3,
                          borderRadius: '50%',
                          background: '#1e40af',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths, isToday, isSameDay, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useLanguage } from '../../contexts/LanguageContext';

interface DatePickerProps {
  value: string;           // 'yyyy-MM-dd'
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const DAYS_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
const DAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DatePicker({ value, onChange, label, placeholder, className = '' }: DatePickerProps) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => value ? parseISO(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const locale = language === 'es' ? es : enUS;
  const days = language === 'es' ? DAYS_ES : DAYS_EN;
  const defaultPlaceholder = placeholder || (language === 'es' ? 'dd/mm/aaaa' : 'mm/dd/yyyy');

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const selected = value ? parseISO(value) : null;

  const buildCalendar = () => {
    const firstDay = startOfMonth(viewDate);
    const dayOfWeek = getDay(firstDay); // 0=Sunday
    const daysInMonth = getDaysInMonth(viewDate);
    const cells: (number | null)[] = Array(dayOfWeek).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(format(date, 'yyyy-MM-dd'));
    setOpen(false);
  };

  const displayValue = selected ? format(selected, 'dd/MM/yyyy') : '';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-slate-50 dark:bg-black/20 border-none rounded-2xl p-3 text-sm font-bold text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary/20 flex items-center justify-between gap-2 transition-all hover:bg-slate-100 dark:hover:bg-white/10"
      >
        <span className={displayValue ? 'text-secondary dark:text-white' : 'text-slate-400'}>
          {displayValue || defaultPlaceholder}
        </span>
        <Calendar size={16} className="text-slate-400 flex-shrink-0" />
      </button>

      {open && (
        <div
          key={language}  // Force full re-render when language changes
          className="absolute top-full left-0 mt-2 z-[300] bg-white dark:bg-surface-dark rounded-[1.5rem] shadow-2xl border border-slate-100 dark:border-white/10 p-4 w-72 animate-in zoom-in-95 fade-in duration-150"
        >

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all text-slate-500"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-black text-secondary dark:text-white capitalize text-sm">
              {format(viewDate, 'MMMM yyyy', { locale })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all text-slate-500"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {days.map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {buildCalendar().map((day, i) => {
              if (!day) return <div key={i} />;
              const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              const isSelected = selected ? isSameDay(cellDate, selected) : false;
              const todayCell = isToday(cellDate);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`
                    w-full aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all
                    ${isSelected
                      ? 'bg-primary text-white shadow-primary shadow-sm'
                      : todayCell
                        ? 'bg-primary/10 text-primary font-black'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer: Today button */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 flex justify-between items-center">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="text-xs font-black text-slate-400 hover:text-red-500 transition-colors"
            >
              {language === 'es' ? 'Borrar' : 'Clear'}
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setViewDate(today);
                onChange(format(today, 'yyyy-MM-dd'));
                setOpen(false);
              }}
              className="text-xs font-black text-primary hover:text-primary-dark transition-colors"
            >
              {language === 'es' ? 'Hoy' : 'Today'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

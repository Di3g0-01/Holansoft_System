import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function CustomSelect({ label, options, value, onChange, className = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-3 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 block">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between
            bg-slate-100/50 dark:bg-black/20 
            border-2 transition-all duration-300
            rounded-[1.5rem] p-4 text-sm font-bold
            ${isOpen 
              ? 'border-primary bg-white dark:bg-black/40 shadow-lg shadow-primary/5 ring-4 ring-primary/5' 
              : 'border-transparent hover:bg-slate-100 dark:hover:bg-white/5'}
            text-secondary dark:text-white
          `}
        >
          <span className="truncate">{selectedOption?.label}</span>
          <ChevronDown 
            className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} 
          />
        </button>

        {isOpen && (
          <div className="
            absolute z-[100] mt-3 w-full 
            bg-white dark:bg-surface-dark 
            rounded-[2rem] shadow-2xl 
            border border-slate-100 dark:border-white/5 
            overflow-hidden animate-in zoom-in-95 fade-in duration-200
            backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90
          ">
            <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between
                    p-4 rounded-2xl text-sm font-bold transition-all
                    ${option.value === value 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-secondary dark:hover:text-white'}
                  `}
                >
                  {option.label}
                  {option.value === value && <Check size={16} className="animate-in zoom-in duration-300" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

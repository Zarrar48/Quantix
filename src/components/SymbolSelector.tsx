'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, Check } from 'lucide-react';
import { useSymbols } from '@/hooks/useSymbols'; 

interface SymbolSelectorProps {
  selected: string;
  onSelect: (symbol: string) => void;
}

const SymbolSelector = ({ selected, onSelect }: SymbolSelectorProps) => {
  const { symbols, loading } = useSymbols();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all min-w-[160px] justify-between group"
      >
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
          <Filter size={16} className="text-slate-400 group-hover:text-purple-500 transition-colors" />
          {loading ? 'Loading...' : (selected === 'ALL' ? 'All Symbols' : selected)}
        </div>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
            {symbols.map((sym) => (
              <button
                key={sym}
                onClick={() => {
                  onSelect(sym);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                  selected === sym 
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {sym === 'ALL' ? 'All Symbols' : sym}
                {selected === sym && <Check size={14} className="text-purple-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SymbolSelector;
import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { ChevronDown, Check, Coins } from 'lucide-react';

export const CurrencySelector = ({ compact = false }) => {
  const { currencies, activeCurrency, changeCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-2xl border border-stone-200/90 bg-white/90 hover:bg-stone-100/80 text-stone-800 transition duration-200 font-medium focus:outline-none shadow-sm hover:shadow-md ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
        }`}
        title="Select Display Currency"
      >
        <span className="min-w-5 h-5 px-1 rounded-md bg-amber-500/10 text-amber-700 font-bold text-xs flex items-center justify-center border border-amber-500/20">
          {activeCurrency?.symbol || '₹'}
        </span>
        <span className="font-bold tracking-tight text-stone-900">{activeCurrency?.code || 'INR'}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-600' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200/90 z-50 animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                Display Currency
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 border border-amber-200 px-2 py-0.5 rounded-full shadow-2xs">
              Base: INR (₹)
            </span>
          </div>

          {/* Scrollable Items List */}
          <div className="p-1.5 max-h-60 overflow-y-auto space-y-0.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-stone-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            {currencies.map((curr) => {
              const isSelected = curr.code === activeCurrency?.code;
              return (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => {
                    changeCurrency(curr.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-150 text-left ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-950 font-bold border border-amber-500/30'
                      : 'text-stone-700 hover:bg-stone-100/70 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="min-w-7 h-6 px-1.5 rounded-lg bg-stone-100 border border-stone-200/80 text-stone-800 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {curr.symbol}
                    </span>
                    <div className="truncate">
                      <span className="font-bold text-stone-900 mr-1.5 font-mono">{curr.code}</span>
                      <span className="text-stone-500 text-[11px] font-normal truncate">{curr.name}</span>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;

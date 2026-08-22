import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { Coins, ChevronDown, Check } from 'lucide-react';

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
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-white/80 hover:bg-stone-100 text-stone-800 transition font-medium focus:outline-none ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm shadow-sm'
        }`}
        title="Select Display Currency"
      >
        <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
          {activeCurrency.symbol || '₹'}
        </span>
        <span className="font-bold tracking-tight text-stone-900">{activeCurrency.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-premium border border-stone-200/90 py-2 z-50 animate-fade-in max-h-64 overflow-y-auto">
          <div className="px-3.5 py-1.5 border-b border-stone-100 mb-1 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
              Display Currency
            </span>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Base: INR (₹)
            </span>
          </div>

          {currencies.map((curr) => {
            const isSelected = curr.code === activeCurrency.code;
            return (
              <button
                key={curr.code}
                type="button"
                onClick={() => {
                  changeCurrency(curr.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition text-left ${
                  isSelected
                    ? 'bg-amber-50 text-amber-900 font-bold'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {curr.symbol}
                  </span>
                  <div className="truncate">
                    <span className="font-bold mr-1">{curr.code}</span>
                    <span className="text-stone-500 text-[11px] font-normal">{curr.name}</span>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;

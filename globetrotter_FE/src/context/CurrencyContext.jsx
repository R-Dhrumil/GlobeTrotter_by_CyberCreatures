import React, { createContext, useContext, useState, useEffect } from 'react';
import { catalogAPI } from '../api/client';

const DEFAULT_CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', ratePerInr: 1.0, isBase: true, enabled: true },
  { code: 'USD', name: 'US Dollar', symbol: '$', ratePerInr: 0.012, isBase: false, enabled: true },
  { code: 'EUR', name: 'Euro', symbol: '€', ratePerInr: 0.011, isBase: false, enabled: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', ratePerInr: 0.0095, isBase: false, enabled: true },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', ratePerInr: 0.044, isBase: false, enabled: true },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', ratePerInr: 1.82, isBase: false, enabled: true },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', ratePerInr: 0.018, isBase: false, enabled: true },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', ratePerInr: 0.016, isBase: false, enabled: true },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', ratePerInr: 0.016, isBase: false, enabled: true },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', ratePerInr: 0.42, isBase: false, enabled: true },
];

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES);
  const [baseCurrencyCode, setBaseCurrencyCode] = useState('INR');
  const [activeCurrencyCode, setActiveCurrencyCode] = useState(() => {
    return localStorage.getItem('globetrotter_currency') || 'INR';
  });

  const fetchCurrencies = async () => {
    try {
      const res = await catalogAPI.getCurrencies();
      if (res.data?.currencies) {
        const list = res.data.currencies.filter((c) => c.enabled !== false);
        setCurrencies(list);
      }
      if (res.data?.baseCurrency) {
        setBaseCurrencyCode(res.data.baseCurrency);
      }
    } catch (err) {
      console.warn('Failed to load currency settings, using defaults:', err.message);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  // Find active currency object, default to INR if not found
  const activeCurrency = currencies.find((c) => c.code === activeCurrencyCode) ||
    currencies.find((c) => c.code === 'INR') ||
    DEFAULT_CURRENCIES[0];

  const changeCurrency = (code) => {
    const found = currencies.find((c) => c.code === code);
    if (found) {
      setActiveCurrencyCode(found.code);
      localStorage.setItem('globetrotter_currency', found.code);
    }
  };

  /**
   * Convert price from INR to selected currency
   */
  const convertPrice = (amountInInr) => {
    if (amountInInr === undefined || amountInInr === null || isNaN(amountInInr)) return 0;
    const num = Number(amountInInr);
    const rate = activeCurrency.ratePerInr || 1.0;
    return num * rate;
  };

  /**
   * Format price with currency symbol and appropriate decimal precision
   */
  const formatPrice = (amountInInr, options = {}) => {
    if (amountInInr === 0 && options.showFree !== false) {
      return 'Free';
    }
    const val = convertPrice(amountInInr);
    const symbol = activeCurrency.symbol || '₹';

    // Decide decimal precision
    let formattedVal;
    if (activeCurrency.code === 'JPY') {
      formattedVal = Math.round(val).toLocaleString();
    } else if (val % 1 === 0 || val >= 100) {
      formattedVal = Math.round(val).toLocaleString();
    } else {
      formattedVal = val.toFixed(2);
    }

    return `${symbol}${formattedVal}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencies,
        activeCurrency,
        baseCurrencyCode,
        changeCurrency,
        formatPrice,
        convertPrice,
        refreshCurrencies: fetchCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return ctx;
};

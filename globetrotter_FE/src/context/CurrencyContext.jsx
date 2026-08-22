import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
      const rawList = res.data?.currencies || res.currencies;
      if (Array.isArray(rawList) && rawList.length > 0) {
        const list = rawList.filter((c) => c.enabled !== false);
        setCurrencies(list);
      }
      if (res.data?.baseCurrency || res.baseCurrency) {
        setBaseCurrencyCode(res.data?.baseCurrency || res.baseCurrency);
      }
    } catch (err) {
      console.warn('Failed to load currency settings, using defaults:', err.message);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  // Find active currency object, default to INR if not found
  const activeCurrency = useMemo(() => {
    return (
      currencies.find((c) => c.code === activeCurrencyCode) ||
      DEFAULT_CURRENCIES.find((c) => c.code === activeCurrencyCode) ||
      currencies.find((c) => c.code === 'INR') ||
      DEFAULT_CURRENCIES[0]
    );
  }, [currencies, activeCurrencyCode]);

  const changeCurrency = (code) => {
    const found =
      currencies.find((c) => c.code === code) ||
      DEFAULT_CURRENCIES.find((c) => c.code === code);
    if (found) {
      setActiveCurrencyCode(found.code);
      localStorage.setItem('globetrotter_currency', found.code);
    }
  };

  /**
   * Helper to robustly derive exchange rate for a currency relative to base INR
   */
  const getExchangeRate = useCallback((curr) => {
    if (!curr) return 1.0;
    if (curr.code === 'INR' || curr.isBase) return 1.0;

    // 1. Check explicit ratePerInr property
    if (typeof curr.ratePerInr === 'number' && curr.ratePerInr > 0) {
      return curr.ratePerInr;
    }
    if (typeof curr.ratePerInr === 'string' && parseFloat(curr.ratePerInr) > 0) {
      return parseFloat(curr.ratePerInr);
    }

    // 2. Check inrEquivalent property (1 FX = X INR => ratePerInr = 1 / X)
    if (typeof curr.inrEquivalent === 'number' && curr.inrEquivalent > 0) {
      return 1 / curr.inrEquivalent;
    }
    if (typeof curr.inrEquivalent === 'string' && parseFloat(curr.inrEquivalent) > 0) {
      return 1 / parseFloat(curr.inrEquivalent);
    }

    // 3. Check rate or exchangeRate property
    const altRate = parseFloat(curr.rate || curr.exchangeRate);
    if (!isNaN(altRate) && altRate > 0) {
      return altRate > 1 ? 1 / altRate : altRate;
    }

    // 4. Fallback lookup in DEFAULT_CURRENCIES preset
    const preset = DEFAULT_CURRENCIES.find((c) => c.code === curr.code);
    if (preset && preset.ratePerInr > 0) {
      return preset.ratePerInr;
    }

    return 1.0;
  }, []);

  /**
   * Convert price from base currency (INR) to selected active currency
   */
  const convertPrice = useCallback(
    (amountInInr) => {
      if (amountInInr === undefined || amountInInr === null || isNaN(amountInInr)) return 0;
      const num = Number(amountInInr);
      const rate = getExchangeRate(activeCurrency);
      return num * rate;
    },
    [activeCurrency, getExchangeRate]
  );

  /**
   * Convert price from active currency to base currency (INR)
   */
  const convertFromActiveToBase = useCallback(
    (amountInActiveCurrency) => {
      if (
        amountInActiveCurrency === undefined ||
        amountInActiveCurrency === null ||
        isNaN(amountInActiveCurrency)
      )
        return 0;
      const num = Number(amountInActiveCurrency);
      const rate = getExchangeRate(activeCurrency);
      return rate > 0 ? num / rate : num;
    },
    [activeCurrency, getExchangeRate]
  );

  /**
   * Format price with currency symbol and decimal formatting
   */
  const formatPrice = useCallback(
    (amountInInr, options = {}) => {
      if (amountInInr === 0 && options.showFree !== false) {
        return 'Free';
      }
      const val = convertPrice(amountInInr);
      const symbol = activeCurrency.symbol || '₹';

      let formattedVal;
      if (activeCurrency.code === 'JPY') {
        formattedVal = Math.round(val).toLocaleString();
      } else if (val % 1 === 0) {
        formattedVal = Math.round(val).toLocaleString();
      } else {
        formattedVal = val.toLocaleString(undefined, {
          minimumFractionDigits: options.decimals ?? (val < 100 && val % 1 !== 0 ? 2 : 0),
          maximumFractionDigits: 2,
        });
      }

      return `${symbol}${formattedVal}`;
    },
    [activeCurrency, convertPrice]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currencies,
        activeCurrency,
        baseCurrencyCode,
        changeCurrency,
        formatPrice,
        convertPrice,
        convertFromActiveToBase,
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


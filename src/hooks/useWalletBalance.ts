import { useState, useEffect, useCallback } from 'react';
import { Currency } from '../types';

export interface WalletBalanceData {
  balanceUSD: number;
  balanceUGX: number;
  balanceKES: number;
  balanceTZS: number;
  totalRevenueUSD: number;
  creatorEarningsUSD: number;
  platformFeesUSD: number;
  totalSubscribers: number;
  totalTipsCount: number;
  completedOrdersCount: number;
  currencyRates?: Record<string, number>;
}

export function useWalletBalance(userId: string = 'me') {
  const [data, setData] = useState<WalletBalanceData>({
    balanceUSD: 0,
    balanceUGX: 0,
    balanceKES: 0,
    balanceTZS: 0,
    totalRevenueUSD: 0,
    creatorEarningsUSD: 0,
    platformFeesUSD: 0,
    totalSubscribers: 0,
    totalTipsCount: 0,
    completedOrdersCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/wallet/balance?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error(`Failed to fetch wallet balance (${res.status})`);
      const json = await res.json();
      if (json.success) {
        setData({
          balanceUSD: json.balanceUSD || 0,
          balanceUGX: json.balanceUGX || 0,
          balanceKES: json.balanceKES || 0,
          balanceTZS: json.balanceTZS || 0,
          totalRevenueUSD: json.totalRevenueUSD || 0,
          creatorEarningsUSD: json.creatorEarningsUSD || 0,
          platformFeesUSD: json.platformFeesUSD || 0,
          totalSubscribers: json.totalSubscribers || 0,
          totalTipsCount: json.totalTipsCount || 0,
          completedOrdersCount: json.completedOrdersCount || 0,
          currencyRates: json.currencyRates,
        });
      }
    } catch (err: any) {
      console.warn('Wallet balance fetch error:', err);
      setError(err.message || 'Error fetching balance');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBalance();
    // Poll balance periodically (every 20s)
    const interval = setInterval(fetchBalance, 20000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  const getBalanceInCurrency = (curr: Currency): number => {
    switch (curr) {
      case 'UGX':
        return data.balanceUGX;
      case 'KES':
        return data.balanceKES;
      case 'TZS':
        return data.balanceTZS;
      case 'USD':
      default:
        return data.balanceUSD;
    }
  };

  return {
    ...data,
    loading,
    error,
    refreshBalance: fetchBalance,
    getBalanceInCurrency,
  };
}

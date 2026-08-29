import useSWR from 'swr';
import { Currency } from '../types';
import { authedGetFetcher } from '../lib/apiClient';

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

export interface UseWalletBalanceOptions {
  userId?: string;
  /** When false, SWR does not fetch or poll. Defaults to true if a userId is set. */
  enabled?: boolean;
  pollIntervalMs?: number;
  currentCurrency?: Currency;
}

const EMPTY_BALANCE: WalletBalanceData = {
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
};

/**
 * Wallet balance, backed by SWR instead of a hand-rolled setInterval poll.
 * This gets us three things the old implementation didn't have for free:
 *
 * 1. Request de-duplication + a shared cache: the backend always resolves
 *    the balance from the authenticated caller's own uid, never from a
 *    userId in the request, so every caller of this hook is really asking
 *    for the same resource. Multiple components mounting this hook at once
 *    (e.g. Navbar + Settings, previously polling independently every 15-20s
 *    each) now share one cached result and one in-flight request.
 * 2. Pause polling when the tab is hidden (SWR's `refreshWhenHidden`
 *    defaults to false), instead of continuing to poll a backgrounded tab
 *    forever.
 * 3. Revalidate on window focus, so switching back to the tab gets a fresh
 *    balance immediately rather than waiting for the next poll tick.
 */
export function useWalletBalance(optionsOrUserId?: string | UseWalletBalanceOptions) {
  const opts = typeof optionsOrUserId === 'object' ? optionsOrUserId : { userId: optionsOrUserId };
  const pollInterval = opts.pollIntervalMs ?? 20000;
  const activeCurrency = opts.currentCurrency;
  const enabled = opts.enabled === true || (opts.enabled !== false && Boolean(opts.userId));

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean } & WalletBalanceData>(
    enabled ? '/api/wallet/balance' : null,
    authedGetFetcher,
    {
      refreshInterval: pollInterval,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const balance: WalletBalanceData = data
    ? {
        balanceUSD: data.balanceUSD || 0,
        balanceUGX: data.balanceUGX || 0,
        balanceKES: data.balanceKES || 0,
        balanceTZS: data.balanceTZS || 0,
        totalRevenueUSD: data.totalRevenueUSD || 0,
        creatorEarningsUSD: data.creatorEarningsUSD || 0,
        platformFeesUSD: data.platformFeesUSD || 0,
        totalSubscribers: data.totalSubscribers || 0,
        totalTipsCount: data.totalTipsCount || 0,
        completedOrdersCount: data.completedOrdersCount || 0,
        currencyRates: data.currencyRates,
      }
    : EMPTY_BALANCE;

  const getBalanceInCurrency = (curr: Currency): number => {
    switch (curr) {
      case 'UGX':
        return balance.balanceUGX;
      case 'KES':
        return balance.balanceKES;
      case 'TZS':
        return balance.balanceTZS;
      case 'USD':
      default:
        return balance.balanceUSD;
    }
  };

  const formattedBalance = activeCurrency ? getBalanceInCurrency(activeCurrency).toLocaleString() : undefined;

  return {
    ...balance,
    loading: isLoading,
    error: error?.message || null,
    formattedBalance,
    refreshBalance: () => mutate(),
    getBalanceInCurrency,
  };
}

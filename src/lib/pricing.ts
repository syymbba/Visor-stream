/**
 * Single source of truth for currency conversion and subscription pricing.
 *
 * Previously these tables were copy-pasted across server.ts, api/wallet/balance.ts,
 * api/payments/checkout.ts and src/app/api/payments/checkout/route.ts, which made it
 * easy for the numbers to drift between endpoints. Everything money-related should
 * import from this module instead of hardcoding rates locally.
 */

export type SupportedCurrency = 'UGX' | 'KES' | 'TZS' | 'USD';

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['UGX', 'KES', 'TZS', 'USD'];

/** Units of local currency per 1 USD. */
export const CURRENCY_RATES_PER_USD: Record<SupportedCurrency, number> = {
  UGX: 3750,
  KES: 130,
  TZS: 2600,
  USD: 1,
};

export const PLAN_PRICES_USD: Record<string, number> = {
  fan: 2,
  pro: 5,
  legend: 10,
};

export const PLATFORM_FEE_RATE = 0.3;
export const CREATOR_SHARE_RATE = 1 - PLATFORM_FEE_RATE;

export function isSupportedCurrency(value: unknown): value is SupportedCurrency {
  return typeof value === 'string' && SUPPORTED_CURRENCIES.includes(value.toUpperCase() as SupportedCurrency);
}

export function toUSD(amount: number, currency: string): number {
  const rate = CURRENCY_RATES_PER_USD[(currency || 'UGX').toUpperCase() as SupportedCurrency] || CURRENCY_RATES_PER_USD.UGX;
  return amount / rate;
}

export function fromUSD(amountUSD: number, currency: string): number {
  const rate = CURRENCY_RATES_PER_USD[(currency || 'UGX').toUpperCase() as SupportedCurrency] || CURRENCY_RATES_PER_USD.UGX;
  return amountUSD * rate;
}

/**
 * Returns the expected charge amount (in `currency`) for a subscription plan,
 * or undefined if the plan/currency combination is not recognized.
 */
export function getExpectedSubscriptionAmount(planId: string | undefined, currency: string): number | undefined {
  const priceUSD = planId ? PLAN_PRICES_USD[planId] : undefined;
  if (priceUSD === undefined || !isSupportedCurrency(currency)) return undefined;
  return Math.round(priceUSD * CURRENCY_RATES_PER_USD[currency.toUpperCase() as SupportedCurrency]);
}

/** Convert a USD amount into integer cents for storage in ledger columns. */
export function usdToCents(amountUSD: number): number {
  return Math.round(amountUSD * 100);
}

export function centsToUsd(cents: number): number {
  return Math.round(cents) / 100;
}

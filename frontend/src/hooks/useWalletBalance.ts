/**
 * useWalletBalance - TanStack Query hook for the WalletCard widget.
 *
 * Fetches KSM and DUSD balances directly from the Kreivo chain node
 * via HTTP JSON-RPC (state_getStorage), then optionally fetches
 * the KSM/USD price from CoinCarp for USD conversion.
 *
 * No backend proxy needed — all queries go directly to the chain.
 *
 * Returned shape (WalletData):
 *   totalUsd  - formatted total USD string (e.g. "$12.34")
 *   ksm       - AssetBalance for KSM
 *   dusd      - AssetBalance for DUSD
 *   address   - the address that was queried
 */

import { useQuery } from '@tanstack/react-query';
import { getBalances, getKsmPriceUsd } from '@/api/kreivo';
import type { WalletData, AssetBalance } from '@/types/dao';

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const walletKeys = {
  all: ['dao', 'wallet'] as const,
  balance: (address: string) => [...walletKeys.all, 'balance', address] as const,
};

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

async function fetchWalletBalance(address: string): Promise<WalletData> {
  // Fetch balances and price in parallel
  const [balances, ksmPrice] = await Promise.all([
    getBalances(address),
    getKsmPriceUsd(),
  ]);

  const ksmAmount = balances.ksmFree;
  const dusdAmount = balances.dusdFree;
  const ksmUnitPrice = ksmPrice ?? '';

  // Calculate USD values
  let ksmUsdValue = '';
  let totalUsdNum = 0;

  if (ksmPrice) {
    const ksmNum = parseFloat(ksmAmount);
    const priceNum = parseFloat(ksmPrice);
    if (!isNaN(ksmNum) && !isNaN(priceNum)) {
      const usd = ksmNum * priceNum;
      ksmUsdValue = usd.toFixed(2);
      totalUsdNum += usd;
    }
  }

  // DUSD is a stablecoin pegged to $1
  const dusdNum = parseFloat(dusdAmount);
  const dusdUsdValue = !isNaN(dusdNum) ? dusdNum.toFixed(2) : '';
  if (!isNaN(dusdNum)) {
    totalUsdNum += dusdNum;
  }

  const ksm: AssetBalance = {
    symbol: 'KSM',
    amount: ksmAmount,
    usdValue: ksmUsdValue,
    unitPrice: ksmUnitPrice,
  };

  const dusd: AssetBalance = {
    symbol: 'DUSD',
    amount: dusdAmount,
    usdValue: dusdUsdValue,
    unitPrice: '1.00',
  };

  return {
    totalUsd: `$${totalUsdNum.toFixed(2)}`,
    ksm,
    dusd,
    address,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseWalletBalanceResult {
  data: WalletData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Fetches KSM + DUSD balances for `address` directly from the Kreivo chain.
 * The hook is disabled (no request sent) when `address` is falsy.
 *
 * @param address - Blockchain address (ss58 format).
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useWalletBalance(developer.workerAddress);
 * ```
 */
export function useWalletBalance(address: string | undefined | null): UseWalletBalanceResult {
  const enabled = Boolean(address && address.trim().length > 0);

  const query = useQuery<WalletData, Error>({
    queryKey: walletKeys.balance(address ?? ''),
    queryFn: () => {
      if (!address) throw new Error('Address is required');
      return fetchWalletBalance(address);
    },
    enabled,
    staleTime: 30_000,       // balance data reasonable for 30 s
    refetchInterval: 60_000, // passive background refresh every minute
    retry: 2,
    retryDelay: 2_000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading && enabled,
    isError: query.isError,
    error: query.error,
  };
}

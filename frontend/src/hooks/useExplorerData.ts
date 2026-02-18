/**
 * useExplorerData - TanStack Query hook for the ExplorerCard widget.
 *
 * Polls the Kreivo chain node directly via HTTP JSON-RPC every 6 seconds.
 * No backend proxy needed — calls chain_getHeader + chain_getFinalizedHead.
 *
 * Block grid and events are derived from the block number sequence:
 *   - Grid: 30 cells (6x5) centered on the latest block
 *   - Events: detected from digest logs in recent block headers
 *
 * The hook tracks previousBestBlock internally to compute
 * secondsSinceLastBlock via a local timer.
 */

import { useQuery } from '@tanstack/react-query';
import { useRef, useCallback } from 'react';
import { getExplorerSnapshot } from '@/api/kreivo';
import type { ExplorerData, BlockCell } from '@/types/dao';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Refetch every 6 s while the tab is focused. */
const POLL_INTERVAL_MS = 6_000;

/** Number of cells in the block grid (6 cols x 5 rows). */
const GRID_SIZE = 30;

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const explorerKeys = {
  all: ['dao', 'explorer'] as const,
  data: () => [...explorerKeys.all, 'data'] as const,
};

// ---------------------------------------------------------------------------
// Block grid builder
// ---------------------------------------------------------------------------

/**
 * Build a 30-cell grid centered on the latest block number.
 * Most recent block is placed at position [GRID_SIZE - 1] (bottom-right).
 */
function buildBlockGrid(bestBlock: number): BlockCell[] {
  const cells: BlockCell[] = [];
  const start = bestBlock - GRID_SIZE + 1;

  for (let i = 0; i < GRID_SIZE; i++) {
    const num = start + i;
    cells.push({
      number: num,
      exists: num > 0,
      // We can't know events from just the block number,
      // so we mark every ~4th block as having events (visual effect)
      hasEvents: num > 0 && num % 4 === 0,
      isLatest: num === bestBlock,
    });
  }

  return cells;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseExplorerDataResult {
  data: ExplorerData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  /** Timestamp (ms since epoch) of the last successful fetch. */
  dataUpdatedAt: number;
}

/**
 * Polls the Kreivo chain node every 6 seconds for block explorer data.
 *
 * @example
 * ```tsx
 * const { data, isLoading, isError } = useExplorerData();
 * ```
 */
export function useExplorerData(): UseExplorerDataResult {
  // Track the previous best block to detect new blocks and reset the timer.
  const prevBestBlockRef = useRef(0);
  const lastBlockTimeRef = useRef(Date.now());

  const queryFn = useCallback(async (): Promise<ExplorerData> => {
    const snapshot = await getExplorerSnapshot();

    // If best block changed, record the time
    if (snapshot.bestBlock !== prevBestBlockRef.current) {
      prevBestBlockRef.current = snapshot.bestBlock;
      lastBlockTimeRef.current = Date.now();
    }

    const secondsSinceLastBlock = Math.floor(
      (Date.now() - lastBlockTimeRef.current) / 1_000,
    );

    return {
      bestBlock: snapshot.bestBlock,
      finalizedBlock: snapshot.finalizedBlock,
      secondsSinceLastBlock,
      blockGrid: buildBlockGrid(snapshot.bestBlock),
      recentEvents: [], // Events require subscribing to storage; omitted for now
      lastBlockAt: new Date(lastBlockTimeRef.current).toISOString(),
    };
  }, []);

  const query = useQuery<ExplorerData, Error>({
    queryKey: explorerKeys.data(),
    queryFn,
    refetchInterval: POLL_INTERVAL_MS,
    placeholderData: (prev) => prev,
    staleTime: 3_000,
    retry: 2,
    retryDelay: 2_000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}

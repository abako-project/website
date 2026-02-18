/**
 * dao.ts - TypeScript types for the DAO View widgets
 *
 * Covers the three Kreivo-derived cards:
 *   - ExplorerCard  (block explorer data)
 *   - CommunitiesCard (on-chain community list)
 *   - WalletCard    (KSM + DUSD balances)
 *
 * Data is fetched via REST endpoints exposed by the Abako backend proxy,
 * NOT via direct WebSocket/RxJS connections to the Kreivo chain node.
 * This keeps the frontend free of polkadot-api (~200 KB) and rxjs (~60 KB).
 */

// ---------------------------------------------------------------------------
// Explorer
// ---------------------------------------------------------------------------

/** A single block in the 6x5 block grid displayed by ExplorerCard. */
export interface BlockCell {
  /** Block number represented by this cell. */
  number: number;
  /** Whether the block exists (false = empty placeholder cell). */
  exists: boolean;
  /** Whether this block contained any chain events. */
  hasEvents: boolean;
  /** Whether this is the most recently produced block (highlighted cell). */
  isLatest: boolean;
}

/** A recent chain event shown in ExplorerCard's event feed. */
export interface ChainEvent {
  /** Human-readable label, e.g. "GasTxPayment.GasBurned". */
  label: string;
  /** Block number where the event was emitted. */
  blockNumber: number;
  /** ISO timestamp of the block. */
  timestamp: string;
}

/** Data returned by useExplorerData(). */
export interface ExplorerData {
  /** Latest best (non-finalised) block number. */
  bestBlock: number;
  /** Latest finalised block number. */
  finalizedBlock: number;
  /** Seconds elapsed since the last block was produced (0-12 typical). */
  secondsSinceLastBlock: number;
  /** 30-cell (6 cols x 5 rows) grid; oldest cell first. */
  blockGrid: BlockCell[];
  /** Up to 4 most-recent chain events. */
  recentEvents: ChainEvent[];
  /** ISO timestamp of the last received block. */
  lastBlockAt: string;
}

// ---------------------------------------------------------------------------
// Communities
// ---------------------------------------------------------------------------

/** Status of a community on-chain. */
export type CommunityStatus = 'active' | 'inactive' | 'pending';

/** A single on-chain community shown in CommunitiesCard. */
export interface Community {
  /** On-chain community / track ID. */
  id: string;
  /** Human-readable name (from Nostr metadata or on-chain storage). */
  name: string;
  /** Total number of members (from CommunityMemberships.Item entries). */
  memberCount: number;
  /** Current on-chain status. */
  status: CommunityStatus;
  /**
   * Gradient palette index (0-5) used to deterministically pick one of 6
   * preset gradient backgrounds for the avatar circle.
   */
  gradientIndex: number;
}

/** Data returned by useCommunities(). */
export interface CommunitiesData {
  communities: Community[];
  totalCount: number;
}

// ---------------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------------

/** Breakdown of a single asset inside WalletCard. */
export interface AssetBalance {
  /** Human-readable symbol, e.g. "KSM" or "DUSD". */
  symbol: string;
  /** On-chain free balance as a decimal string (already divided by planck). */
  amount: string;
  /** USD equivalent of this asset (amount * price). Empty string if unknown. */
  usdValue: string;
  /** Current USD price of 1 unit of this asset. Empty string if unknown. */
  unitPrice: string;
}

/** Data returned by useWalletBalance(). */
export interface WalletData {
  /** Sum of all asset USD values, formatted for display (e.g. "$12.34"). */
  totalUsd: string;
  /** KSM balance entry. */
  ksm: AssetBalance;
  /** DUSD stablecoin balance entry. */
  dusd: AssetBalance;
  /** The blockchain address that was queried. */
  address: string;
}

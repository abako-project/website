/**
 * Kreivo chain API — barrel export.
 *
 * Direct HTTP JSON-RPC client for the Kreivo chain node.
 * Zero heavy dependencies (no polkadot-api, no RxJS).
 */

// Client
export { rpcCall, rpcBatch } from './client';

// RPC methods
export {
  getBestHeader,
  getFinalizedHash,
  getHeaderByHash,
  parseBlockNumber,
  getExplorerSnapshot,
  getBalances,
  getKsmPriceUsd,
  ASSET_IDS,
  DECIMALS,
} from './rpc';
export type { ExplorerSnapshot, BalanceResult } from './rpc';

// Codec utilities
export {
  hexToBytes,
  bytesToHex,
  ss58ToAccountId,
  blake2_128Concat,
  formatBalance,
  decodeSystemAccount,
  decodeAssetsAccount,
  systemAccountKey,
  assetsAccountKey,
} from './codec';

// Types
export type { JsonRpcRequest, JsonRpcResponse, SubstrateHeader, StorageHex } from './types';

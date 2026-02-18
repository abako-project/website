/**
 * Kreivo chain JSON-RPC response types.
 *
 * These map to the raw JSON objects returned by the Kreivo node
 * at https://kreivo.io/ via HTTP POST JSON-RPC.
 */

// ---------------------------------------------------------------------------
// JSON-RPC envelope
// ---------------------------------------------------------------------------

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: unknown[];
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: { code: number; message: string; data?: unknown };
}

// ---------------------------------------------------------------------------
// Substrate header (from chain_getHeader)
// ---------------------------------------------------------------------------

export interface SubstrateHeader {
  parentHash: string;
  number: string;        // hex-encoded block number, e.g. "0x12abc"
  stateRoot: string;
  extrinsicsRoot: string;
  digest: {
    logs: string[];
  };
}

// ---------------------------------------------------------------------------
// Storage (from state_getStorage / state_getKeys)
// ---------------------------------------------------------------------------

/** Raw hex string returned by state_getStorage, or null if key doesn't exist. */
export type StorageHex = string | null;

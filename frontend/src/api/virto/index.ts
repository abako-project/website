/**
 * Virto API Client
 *
 * Barrel export for all Virto API modules (WebAuthn, Payments, Memberships).
 * This is the main entry point for Virto API functionality.
 *
 * Usage:
 * ```typescript
 * import { virtoAuth, virtoPayments, virtoMemberships } from '@/api/virto';
 *
 * // Or import individual functions:
 * import { checkUserRegistered, createPayment } from '@/api/virto';
 * ```
 */

// Re-export client and error handler (advanced use cases)
export { virtoClient, VirtoApiError, handleVirtoError } from './client';

// Re-export all types
export type * from './types';

// Re-export all auth functions
export {
  healthCheck,
  checkUserRegistered,
  getAttestationOptions,
  customRegister,
  getAssertionOptions,
  customConnect,
  getUserAddress,
  addMember,
  isMember,
  fund,
} from './auth';

// Re-export all payment functions
export {
  createPayment,
  releasePayment,
  acceptAndPay,
  getPayment,
  paymentsHealthCheck,
} from './payments';

// Re-export all membership functions
export {
  getCommunityAddress,
  getMembers,
  getMember,
  checkMembership,
  addCommunityMember,
  removeMember,
  membershipsHealthCheck,
} from './memberships';

// Namespace exports for organized imports
import * as virtoAuth from './auth';
import * as virtoPayments from './payments';
import * as virtoMemberships from './memberships';

export { virtoAuth, virtoPayments, virtoMemberships };

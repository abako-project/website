# Virto API Exports Index

Complete list of all exports from `@/api/virto`.

## Usage

```typescript
import {
  // Authentication Functions
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

  // Payment Functions
  createPayment,
  releasePayment,
  acceptAndPay,
  getPayment,
  paymentsHealthCheck,

  // Membership Functions
  getCommunityAddress,
  getMembers,
  getMember,
  checkMembership,
  addCommunityMember,
  removeMember,
  membershipsHealthCheck,

  // Error Handling
  VirtoApiError,
  handleVirtoError,

  // Client (Advanced)
  virtoClient,
} from '@/api/virto';
```

## Namespace Imports

```typescript
import { virtoAuth, virtoPayments, virtoMemberships } from '@/api/virto';

// Use like:
await virtoAuth.checkUserRegistered('user@example.com');
await virtoPayments.createPayment({ amount: '100', recipientAddress: '...' });
await virtoMemberships.getMembers('community-id');
```

## Type Exports

```typescript
import type {
  // Auth Types
  HealthCheckResponse,
  CheckUserRegisteredResponse,
  AttestationOptionsResponse,
  CustomRegisterResponse,
  AssertionOptionsResponse,
  CustomConnectResponse,
  GetUserAddressResponse,
  AddMemberResponse,
  IsMemberResponse,
  FundResponse,

  // Payment Types
  CreatePaymentData,
  CreatePaymentResponse,
  ReleasePaymentData,
  ReleasePaymentResponse,
  AcceptAndPayData,
  AcceptAndPayResponse,
  GetPaymentResponse,

  // Membership Types
  GetCommunityAddressResponse,
  GetMembersResponse,
  GetMemberResponse,
  CheckMembershipResponse,
  AddCommunityMemberResponse,
  RemoveMemberResponse,
} from '@/api/virto';
```

## Function Count

- **Authentication**: 10 functions
- **Payments**: 5 functions
- **Memberships**: 7 functions
- **Total**: 22 functions (17 core + 3 health checks + 2 utilities)

## Quick Reference

### Authentication (10 functions)

| Function | Purpose | Returns |
|----------|---------|---------|
| `healthCheck()` | Check API health | `HealthCheckResponse` |
| `checkUserRegistered(userId)` | Check if user exists | `CheckUserRegisteredResponse` |
| `getAttestationOptions(userId, name?, challenge?)` | Get WebAuthn registration options | `AttestationOptionsResponse` |
| `customRegister(preparedData)` | Complete registration | `CustomRegisterResponse` |
| `getAssertionOptions(userId, challenge?)` | Get WebAuthn login options | `AssertionOptionsResponse` |
| `customConnect(preparedData)` | Complete login | `CustomConnectResponse` |
| `getUserAddress(userId)` | Get blockchain address | `GetUserAddressResponse` |
| `addMember(userId)` | Add member (legacy) | `AddMemberResponse` |
| `isMember(address)` | Check membership (legacy) | `IsMemberResponse` |
| `fund(address)` | Fund with test tokens | `FundResponse` |

### Payments (5 functions)

| Function | Purpose | Returns |
|----------|---------|---------|
| `createPayment(paymentData)` | Create new payment | `CreatePaymentResponse` |
| `releasePayment(paymentData)` | Release payment | `ReleasePaymentResponse` |
| `acceptAndPay(paymentData)` | Accept and pay | `AcceptAndPayResponse` |
| `getPayment(paymentId)` | Get payment details | `GetPaymentResponse` |
| `paymentsHealthCheck()` | Check payments API | `HealthCheckResponse` |

### Memberships (7 functions)

| Function | Purpose | Returns |
|----------|---------|---------|
| `getCommunityAddress(communityId)` | Get community address | `GetCommunityAddressResponse` |
| `getMembers(communityId, page?, limit?)` | List members | `GetMembersResponse` |
| `getMember(communityId, membershipId)` | Get member details | `GetMemberResponse` |
| `checkMembership(communityId, address)` | Check if member | `CheckMembershipResponse` |
| `addCommunityMember(communityId, memberAddress)` | Add member | `AddCommunityMemberResponse` |
| `removeMember(communityId, address)` | Remove member | `RemoveMemberResponse` |
| `membershipsHealthCheck()` | Check memberships API | `HealthCheckResponse` |

## Import Paths

All imports use the barrel export from `index.ts`:

```typescript
// ✓ CORRECT - Use barrel export
import { checkUserRegistered } from '@/api/virto';

// ✗ AVOID - Direct file imports (unless needed for tree-shaking)
import { checkUserRegistered } from '@/api/virto/auth';
```

## Testing Imports

```typescript
// Verify all exports are available
import * as virtoApi from '@/api/virto';

console.log(Object.keys(virtoApi));
// Output: [
//   'virtoClient', 'VirtoApiError', 'handleVirtoError',
//   'healthCheck', 'checkUserRegistered', 'getAttestationOptions',
//   'customRegister', 'getAssertionOptions', 'customConnect',
//   'getUserAddress', 'addMember', 'isMember', 'fund',
//   'createPayment', 'releasePayment', 'acceptAndPay',
//   'getPayment', 'paymentsHealthCheck',
//   'getCommunityAddress', 'getMembers', 'getMember',
//   'checkMembership', 'addCommunityMember', 'removeMember',
//   'membershipsHealthCheck',
//   'virtoAuth', 'virtoPayments', 'virtoMemberships'
// ]
```

## File Sizes

| File | Lines | Purpose |
|------|-------|---------|
| `client.ts` | 67 | HTTP client + error handling |
| `types.ts` | 174 | Type definitions |
| `auth.ts` | 256 | Authentication functions |
| `payments.ts` | 122 | Payment functions |
| `memberships.ts` | 182 | Membership functions |
| `index.ts` | 55 | Barrel exports |

**Total Implementation**: 856 lines of TypeScript

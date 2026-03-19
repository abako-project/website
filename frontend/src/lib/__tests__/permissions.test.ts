import { describe, it, expect } from 'vitest';
import {
  isClient,
  isDeveloper,
  isClientSelf,
  isDeveloperSelf,
  isProjectClient,
  isProjectConsultant,
  isMilestoneDeveloper,
  checkPermission
} from '../permissions';
import type { User } from '@/types/index';

const clientUser: User = { clientId: 'client-1', name: 'Ana' } as User;
const devUser: User = { developerId: 'dev-1', name: 'Carlos' } as User;
const mixedUser: User = { clientId: 'client-special', developerId: 'dev-special', name: 'Both' } as User;
const nullUser: User | null = null;

describe('isClient', () => {
  it('returns true for a user with clientId', () => {
    expect(isClient(clientUser)).toBe(true);
  });
  it('returns false for a user without clientId (e.g. standard developer)', () => {
    expect(isClient(devUser)).toBe(false);
  });
  it('returns false for null user', () => {
    expect(isClient(nullUser)).toBe(false);
  });
});

describe('isDeveloper', () => {
  it('returns true for a user with developerId', () => {
    expect(isDeveloper(devUser)).toBe(true);
  });
  it('returns false for a user without developerId (e.g. standard client)', () => {
    expect(isDeveloper(clientUser)).toBe(false);
  });
  it('returns false for null user', () => {
    expect(isDeveloper(nullUser)).toBe(false);
  });
});

describe('isClientSelf', () => {
  it('returns true when user clientId matches the provided clientId', () => {
    expect(isClientSelf(clientUser, 'client-1')).toBe(true);
  });
  it('returns false when user clientId does not match', () => {
    expect(isClientSelf(clientUser, 'client-2')).toBe(false);
  });
  it('returns false when user is not a client', () => {
    expect(isClientSelf(devUser, 'client-1')).toBe(false);
  });
  it('returns false for null user', () => {
    expect(isClientSelf(nullUser, 'client-1')).toBe(false);
  });
});

describe('isDeveloperSelf', () => {
  it('returns true when user developerId matches the provided developerId', () => {
    expect(isDeveloperSelf(devUser, 'dev-1')).toBe(true);
  });
  it('returns false when user developerId does not match', () => {
    expect(isDeveloperSelf(devUser, 'dev-2')).toBe(false);
  });
  it('returns false when user is not a developer', () => {
    expect(isDeveloperSelf(clientUser, 'dev-1')).toBe(false);
  });
  it('returns false for null user', () => {
    expect(isDeveloperSelf(nullUser, 'dev-1')).toBe(false);
  });
});

describe('isProjectClient', () => {
  it('returns true when user is client and matches project client id', () => {
    expect(isProjectClient(clientUser, 'client-1')).toBe(true);
  });
  it('returns false when user clientId does not match', () => {
    expect(isProjectClient(clientUser, 'client-2')).toBe(false);
  });
  it('returns false for null user', () => {
    expect(isProjectClient(nullUser, 'client-1')).toBe(false);
  });
});

describe('isProjectConsultant', () => {
  it('returns true when user is developer and matches consultant id', () => {
    expect(isProjectConsultant(devUser, 'dev-1')).toBe(true);
  });
  it('returns false when user developerId does not match consultant id', () => {
    expect(isProjectConsultant(devUser, 'dev-2')).toBe(false);
  });
  it('returns false when projectConsultantId is undefined', () => {
    expect(isProjectConsultant(devUser, undefined)).toBe(false);
  });
  it('returns false for null user', () => {
    expect(isProjectConsultant(nullUser, 'dev-1')).toBe(false);
  });
});

describe('isMilestoneDeveloper', () => {
  it('returns true when user is developer and matches milestone developer id', () => {
    expect(isMilestoneDeveloper(devUser, 'dev-1')).toBe(true);
  });
  it('returns false when user developerId does not match milestone developer id', () => {
    expect(isMilestoneDeveloper(devUser, 'dev-2')).toBe(false);
  });
  it('returns false when milestoneDeveloperId is undefined', () => {
    expect(isMilestoneDeveloper(devUser, undefined)).toBe(false);
  });
  it('returns false for null user', () => {
    expect(isMilestoneDeveloper(nullUser, 'dev-1')).toBe(false);
  });
});

describe('checkPermission', () => {
  it('returns false when user is null', () => {
    expect(checkPermission(nullUser, { client: true })).toBe(false);
  });

  it('evaluates { client: true } correctly', () => {
    expect(checkPermission(clientUser, { client: true })).toBe(true);
    expect(checkPermission(devUser, { client: true })).toBe(false);
  });

  it('evaluates { developer: true } correctly', () => {
    expect(checkPermission(devUser, { developer: true })).toBe(true);
    expect(checkPermission(clientUser, { developer: true })).toBe(false);
  });

  it('evaluates { projectClient: <id> } correctly', () => {
    expect(checkPermission(clientUser, { projectClient: 'client-1' })).toBe(true);
    // Even if they are client, if the ID doesn't match it should be false
    expect(checkPermission(clientUser, { projectClient: 'client-2' })).toBe(false);
  });

  it('evaluates { projectConsultant: <id> } correctly', () => {
    expect(checkPermission(devUser, { projectConsultant: 'dev-1' })).toBe(true);
    expect(checkPermission(devUser, { projectConsultant: 'dev-other' })).toBe(false);
  });

  it('evaluates { milestoneDeveloper: <id> } correctly', () => {
    expect(checkPermission(devUser, { milestoneDeveloper: 'dev-1' })).toBe(true);
    expect(checkPermission(devUser, { milestoneDeveloper: 'dev-other' })).toBe(false);
  });

  it('returns true if AT LEAST ONE permission is satisfied (OR logic)', () => {
    // clientUser is the projectClient but NOT the projectConsultant
    expect(checkPermission(clientUser, {
      projectClient: 'client-1',
      projectConsultant: 'dev-xyz'
    })).toBe(true);

    // devUser is the projectConsultant but NOT the projectClient
    expect(checkPermission(devUser, {
      projectClient: 'client-xyz',
      projectConsultant: 'dev-1'
    })).toBe(true);
  });

  it('returns false if NO permissions are satisfied', () => {
    expect(checkPermission(clientUser, {
      projectClient: 'client-other',
      projectConsultant: 'dev-any'
    })).toBe(false);
  });

  it('handles user with both roles properly if it ever occurs', () => {
    expect(checkPermission(mixedUser, { client: true })).toBe(true);
    expect(checkPermission(mixedUser, { developer: true })).toBe(true);
  });
});

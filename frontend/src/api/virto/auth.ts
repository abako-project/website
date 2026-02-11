/**
 * Virto API - WebAuthn / Authentication
 *
 * Functions for WebAuthn authentication and user management.
 * Ported from backend/models/adapter.js (virtoAPI object, lines 868-981).
 */

import { virtoConfig } from '../config';
import { virtoClient, handleVirtoError } from './client';
import type {
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
} from './types';

/**
 * Health check for the Virto WebAuthn API.
 *
 * @returns Health status object
 * @throws {VirtoApiError} If the request fails
 */
export async function healthCheck(): Promise<HealthCheckResponse> {
  try {
    const response = await virtoClient.get<HealthCheckResponse>('/api/health');
    return response.data;
  } catch (error) {
    handleVirtoError(error, 'virtoAPI.healthCheck');
  }
}

/**
 * Check if a user is registered in the WebAuthn system.
 *
 * @param userId - User identifier (typically email)
 * @returns Registration status object
 * @throws {VirtoApiError} If the request fails
 */
export async function checkUserRegistered(userId: string): Promise<CheckUserRegisteredResponse> {
  try {
    const response = await virtoClient.get<CheckUserRegisteredResponse>(
      virtoConfig.endpoints.checkUserRegistered,
      {
        params: { userId },
      }
    );
    return response.data;
  } catch (error) {
    handleVirtoError(error, `checkUserRegistered(${userId})`);
  }
}

/**
 * Get attestation options for WebAuthn registration.
 *
 * Generates a challenge and returns the attestation options needed for
 * the WebAuthn credential creation ceremony.
 *
 * @param userId - User identifier (typically email)
 * @param name - Optional display name (defaults to userId)
 * @param challenge - Optional challenge (auto-generated if not provided)
 * @returns Attestation options object
 * @throws {VirtoApiError} If the request fails
 */
export async function getAttestationOptions(
  userId: string,
  name?: string,
  challenge?: string
): Promise<AttestationOptionsResponse> {
  try {
    // Generate random challenge if not provided (matching backend logic)
    const finalChallenge =
      challenge ||
      '0x' +
        Array.from({ length: 32 }, () =>
          Math.floor(Math.random() * 256)
            .toString(16)
            .padStart(2, '0')
        ).join('');

    const response = await virtoClient.get<AttestationOptionsResponse>(
      virtoConfig.endpoints.attestation,
      {
        params: {
          id: userId,
          name: name || userId,
          challenge: finalChallenge,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleVirtoError(error, `getAttestationOptions(${userId})`);
  }
}

/**
 * Complete WebAuthn registration.
 *
 * Sends the prepared WebAuthn credential data to the server to complete
 * the registration process.
 *
 * @param preparedData - WebAuthn credential data prepared by the SDK
 * @returns Registration result
 * @throws {VirtoApiError} If the request fails
 */
export async function customRegister(preparedData: unknown): Promise<CustomRegisterResponse> {
  try {
    const response = await virtoClient.post<CustomRegisterResponse>(
      virtoConfig.endpoints.register,
      preparedData
    );
    return response.data;
  } catch (error) {
    handleVirtoError(error, 'virtoAPI.customRegister');
  }
}

/**
 * Get assertion options for WebAuthn authentication.
 *
 * Generates a challenge and returns the assertion options needed for
 * the WebAuthn credential assertion ceremony.
 *
 * @param userId - User identifier (typically email)
 * @param challenge - Optional challenge
 * @returns Assertion options object
 * @throws {VirtoApiError} If the request fails
 */
export async function getAssertionOptions(
  userId: string,
  challenge?: string
): Promise<AssertionOptionsResponse> {
  try {
    const params: Record<string, string> = { userId };
    if (challenge) {
      params.challenge = challenge;
    }

    const response = await virtoClient.get<AssertionOptionsResponse>(
      virtoConfig.endpoints.assertion,
      { params }
    );
    return response.data;
  } catch (error) {
    handleVirtoError(error, `getAssertionOptions(${userId})`);
  }
}

/**
 * Complete WebAuthn authentication.
 *
 * Sends the prepared WebAuthn assertion data to the server to complete
 * the authentication process.
 *
 * @param preparedData - WebAuthn assertion data prepared by the SDK
 * @returns Authentication result with token and extrinsic
 * @throws {VirtoApiError} If the request fails
 */
export async function customConnect(preparedData: unknown): Promise<CustomConnectResponse> {
  try {
    const response = await virtoClient.post<CustomConnectResponse>(
      virtoConfig.endpoints.assertion,
      preparedData
    );
    return response.data;
  } catch (error) {
    handleVirtoError(error, 'virtoAPI.customConnect');
  }
}

/**
 * Get the blockchain address for a user.
 *
 * @param userId - User identifier (typically email)
 * @returns User address object
 * @throws {VirtoApiError} If the request fails
 */
export async function getUserAddress(userId: string): Promise<GetUserAddressResponse> {
  try {
    const response = await virtoClient.get<GetUserAddressResponse>(
      virtoConfig.endpoints.getUserAddress,
      {
        params: { userId },
      }
    );
    return response.data;
  } catch (error) {
    handleVirtoError(error, `getUserAddress(${userId})`);
  }
}

/**
 * Add a member to the community (legacy endpoint).
 *
 * @param userId - User identifier to add as member
 * @returns Add member result
 * @throws {VirtoApiError} If the request fails
 */
export async function addMember(userId: string): Promise<AddMemberResponse> {
  try {
    const response = await virtoClient.post<AddMemberResponse>(
      virtoConfig.endpoints.addMember,
      { userId }
    );
    return response.data;
  } catch (error) {
    handleVirtoError(error, `addMember(${userId})`);
  }
}

/**
 * Check if an address is a member (legacy endpoint).
 *
 * @param address - Blockchain address to check
 * @returns Membership status
 * @throws {VirtoApiError} If the request fails
 */
export async function isMember(address: string): Promise<IsMemberResponse> {
  try {
    const response = await virtoClient.get<IsMemberResponse>(virtoConfig.endpoints.isMember, {
      params: { address },
    });
    return response.data;
  } catch (error) {
    handleVirtoError(error, `isMember(${address})`);
  }
}

/**
 * Fund an address with test tokens.
 *
 * Used in development/testing to provide test tokens to user addresses.
 *
 * @param address - Blockchain address to fund
 * @returns Funding result with transaction details
 * @throws {VirtoApiError} If the request fails
 */
export async function fund(address: string): Promise<FundResponse> {
  try {
    const response = await virtoClient.post<FundResponse>(virtoConfig.endpoints.fund, {
      address,
    });
    return response.data;
  } catch (error) {
    handleVirtoError(error, `fund(${address})`);
  }
}

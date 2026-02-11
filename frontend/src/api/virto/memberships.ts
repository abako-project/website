/**
 * Virto API - Memberships
 *
 * Functions for managing community memberships on the blockchain.
 * Ported from backend/models/adapter.js (virtoAPI object, lines 1030-1098).
 */

import { virtoConfig } from '../config';
import { virtoClient, handleVirtoError } from './client';
import type {
  GetCommunityAddressResponse,
  GetMembersResponse,
  GetMemberResponse,
  CheckMembershipResponse,
  AddCommunityMemberResponse,
  RemoveMemberResponse,
  HealthCheckResponse,
} from './types';

/**
 * Get the blockchain address for a community.
 *
 * @param communityId - Unique community identifier
 * @returns Community address object
 * @throws {VirtoApiError} If the request fails
 */
export async function getCommunityAddress(
  communityId: string
): Promise<GetCommunityAddressResponse> {
  try {
    const endpoint =
      typeof virtoConfig.endpoints.memberships.address === 'function'
        ? virtoConfig.endpoints.memberships.address(communityId)
        : `/api/memberships/${communityId}/address`;

    const response = await virtoClient.get<GetCommunityAddressResponse>(endpoint);
    return response.data;
  } catch (error) {
    handleVirtoError(error, `getCommunityAddress(${communityId})`);
  }
}

/**
 * Get members of a community with pagination.
 *
 * @param communityId - Unique community identifier
 * @param page - Optional page number (1-based)
 * @param limit - Optional results per page
 * @returns List of community members with pagination info
 * @throws {VirtoApiError} If the request fails
 */
export async function getMembers(
  communityId: string,
  page?: number,
  limit?: number
): Promise<GetMembersResponse> {
  try {
    const params: Record<string, number> = {};
    if (page !== undefined) {
      params.page = page;
    }
    if (limit !== undefined) {
      params.limit = limit;
    }

    const endpoint =
      typeof virtoConfig.endpoints.memberships.members === 'function'
        ? virtoConfig.endpoints.memberships.members(communityId)
        : `/api/memberships/${communityId}/members`;

    const response = await virtoClient.get<GetMembersResponse>(endpoint, { params });
    return response.data;
  } catch (error) {
    handleVirtoError(error, `getMembers(${communityId})`);
  }
}

/**
 * Get details of a specific community member.
 *
 * @param communityId - Unique community identifier
 * @param membershipId - Unique member identifier
 * @returns Member details object
 * @throws {VirtoApiError} If the request fails
 */
export async function getMember(
  communityId: string,
  membershipId: string
): Promise<GetMemberResponse> {
  try {
    const endpoint =
      typeof virtoConfig.endpoints.memberships.member === 'function'
        ? virtoConfig.endpoints.memberships.member(communityId, membershipId)
        : `/api/memberships/${communityId}/members/${membershipId}`;

    const response = await virtoClient.get<GetMemberResponse>(endpoint);
    return response.data;
  } catch (error) {
    handleVirtoError(error, `getMember(${communityId}, ${membershipId})`);
  }
}

/**
 * Check if an address is a member of a community.
 *
 * @param communityId - Unique community identifier
 * @param address - Blockchain address to check
 * @returns Membership status object
 * @throws {VirtoApiError} If the request fails
 */
export async function checkMembership(
  communityId: string,
  address: string
): Promise<CheckMembershipResponse> {
  try {
    const endpoint =
      typeof virtoConfig.endpoints.memberships.check === 'function'
        ? virtoConfig.endpoints.memberships.check(communityId, address)
        : `/api/memberships/${communityId}/members/${address}/check`;

    const response = await virtoClient.get<CheckMembershipResponse>(endpoint);
    return response.data;
  } catch (error) {
    handleVirtoError(error, `checkMembership(${communityId}, ${address})`);
  }
}

/**
 * Add a new member to a community.
 *
 * @param communityId - Unique community identifier
 * @param memberAddress - Blockchain address of the new member
 * @returns Add member result
 * @throws {VirtoApiError} If the request fails
 */
export async function addCommunityMember(
  communityId: string,
  memberAddress: string
): Promise<AddCommunityMemberResponse> {
  try {
    const endpoint =
      typeof virtoConfig.endpoints.memberships.members === 'function'
        ? virtoConfig.endpoints.memberships.members(communityId)
        : `/api/memberships/${communityId}/members`;

    const response = await virtoClient.post<AddCommunityMemberResponse>(endpoint, {
      memberAddress,
    });
    return response.data;
  } catch (error) {
    handleVirtoError(error, `addCommunityMember(${communityId})`);
  }
}

/**
 * Remove a member from a community.
 *
 * @param communityId - Unique community identifier
 * @param address - Blockchain address of the member to remove
 * @returns Remove member result
 * @throws {VirtoApiError} If the request fails
 */
export async function removeMember(
  communityId: string,
  address: string
): Promise<RemoveMemberResponse> {
  try {
    const endpoint =
      typeof virtoConfig.endpoints.memberships.remove === 'function'
        ? virtoConfig.endpoints.memberships.remove(communityId, address)
        : `/api/memberships/${communityId}/members/${address}`;

    const response = await virtoClient.delete<RemoveMemberResponse>(endpoint);
    return response.data;
  } catch (error) {
    handleVirtoError(error, `removeMember(${communityId}, ${address})`);
  }
}

/**
 * Health check for the Memberships API.
 *
 * @returns Health status object
 * @throws {VirtoApiError} If the request fails
 */
export async function membershipsHealthCheck(): Promise<HealthCheckResponse> {
  try {
    const response = await virtoClient.get<HealthCheckResponse>(
      virtoConfig.endpoints.memberships.health
    );
    return response.data;
  } catch (error) {
    handleVirtoError(error, 'membershipsHealthCheck');
  }
}

/**
 * Milestones Adapter API
 *
 * Handles milestone CRUD operations with the adapter API.
 * Ported from backend/models/adapter.js (getMilestones, createMilestone, updateMilestone, deleteMilestone)
 */

import { adapterClient, handleApiError } from './client';
import { adapterConfig } from '../config';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

interface MilestoneData {
  title: string;
  description: string;
  budget?: string | number;
  deliveryTime?: string;
  deliveryDate?: string | number;
  [key: string]: unknown;
}

interface GetMilestonesResponse {
  milestones: unknown[];
  [key: string]: unknown;
}

interface CreateMilestoneResponse {
  milestone: unknown;
  [key: string]: unknown;
}

interface UpdateMilestoneResponse {
  milestone: unknown;
  [key: string]: unknown;
}

interface DeleteMilestoneResponse {
  success: boolean;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Milestone API methods
// ---------------------------------------------------------------------------

/**
 * Get all milestones for a project.
 */
export async function getMilestones(
  contractAddress: string,
  token: string
): Promise<GetMilestonesResponse> {
  try {
    const response = await adapterClient.get<GetMilestonesResponse>(
      adapterConfig.endpoints.projects.milestones.list(contractAddress),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `getMilestones(${contractAddress})`);
  }
}

/**
 * Create a new milestone for a project.
 */
export async function createMilestone(
  contractAddress: string,
  milestoneData: MilestoneData,
  token: string
): Promise<CreateMilestoneResponse> {
  try {
    const response = await adapterClient.post<CreateMilestoneResponse>(
      adapterConfig.endpoints.projects.milestones.create(contractAddress),
      milestoneData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `createMilestone(${contractAddress})`);
  }
}

/**
 * Update an existing milestone.
 */
export async function updateMilestone(
  contractAddress: string,
  milestoneId: string,
  data: Partial<MilestoneData>,
  token: string
): Promise<UpdateMilestoneResponse> {
  try {
    const response = await adapterClient.put<UpdateMilestoneResponse>(
      adapterConfig.endpoints.projects.milestones.update(contractAddress, milestoneId),
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `updateMilestone(${contractAddress}, ${milestoneId})`);
  }
}

/**
 * Delete a milestone.
 */
export async function deleteMilestone(
  contractAddress: string,
  milestoneId: string,
  token: string
): Promise<DeleteMilestoneResponse> {
  try {
    const response = await adapterClient.delete<DeleteMilestoneResponse>(
      adapterConfig.endpoints.projects.milestones.remove(contractAddress, milestoneId),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `deleteMilestone(${contractAddress}, ${milestoneId})`);
  }
}

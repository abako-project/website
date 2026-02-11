/**
 * Milestones Adapter API
 *
 * Handles milestone CRUD operations with the adapter API.
 * Ported from backend/models/adapter.js (getMilestones, createMilestone, updateMilestone, deleteMilestone)
 */

import axios from 'axios';
import { adapterConfig, API_TIMEOUT } from '../config';
import { useAuthStore } from '@stores/authStore';

// Create dedicated axios instance for adapter API
const adapterClient = axios.create({
  baseURL: adapterConfig.baseURL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
});

// Add auth interceptor
adapterClient.interceptors.request.use((config) => {
  const { token, user } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (user?.email) {
    config.headers['x-user-email'] = user.email;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Error handling helper
// ---------------------------------------------------------------------------

function handleApiError(error: unknown, context: string): never {
  if (axios.isAxiosError(error)) {
    console.error(`[Adapter API Error] ${context}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Unknown API error';

    const enhancedError = new Error(errorMessage) as Error & {
      statusCode?: number;
      context: string;
    };
    enhancedError.statusCode = error.response?.status || 500;
    enhancedError.context = context;

    throw enhancedError;
  }

  throw error;
}

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

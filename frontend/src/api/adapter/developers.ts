/**
 * Developers Adapter API
 *
 * Handles developer CRUD operations with the adapter API.
 * Ported from backend/models/adapter.js (getDevelopers, getDeveloper, createDeveloper, updateDeveloper, etc.)
 */

import axios from 'axios';
import { adapterClient, handleApiError } from './client';
import { adapterConfig } from '../config';
import type { Developer } from '@/types/developer';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

interface GetDevelopersResponse {
  developers: Developer[];
}

interface GetDeveloperResponse {
  developer: Developer;
}

interface CreateDeveloperResponse {
  developer: Developer;
}

interface UpdateDeveloperResponse {
  developer: Developer;
}

interface DeveloperAttachment {
  mime: string;
  image: Blob;
}

interface GetDeveloperProjectsResponse {
  projects: unknown[];
}

interface GetDeveloperMilestonesResponse {
  milestones: unknown[];
}

// ---------------------------------------------------------------------------
// Developer API methods
// ---------------------------------------------------------------------------

/**
 * Get all developers from the adapter API.
 */
export async function getDevelopers(): Promise<GetDevelopersResponse> {
  try {
    const response = await adapterClient.get<GetDevelopersResponse>(
      adapterConfig.endpoints.developers.list
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'getDevelopers');
  }
}

/**
 * Get a single developer by ID.
 */
export async function getDeveloper(developerId: string): Promise<GetDeveloperResponse> {
  try {
    const response = await adapterClient.get<GetDeveloperResponse>(
      adapterConfig.endpoints.developers.get(developerId)
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `getDeveloper(${developerId})`);
  }
}

/**
 * Create a new developer.
 * Uses browser-native FormData for multipart/form-data uploads.
 */
export async function createDeveloper(
  email: string,
  name: string,
  githubUsername?: string,
  portfolioUrl?: string,
  image?: File
): Promise<CreateDeveloperResponse> {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('name', name);
    formData.append('githubUsername', githubUsername || 'githubUsername');
    formData.append('portfolioUrl', portfolioUrl || 'portfolioUrl');
    if (image) formData.append('image', image);

    const response = await adapterClient.post<CreateDeveloperResponse>(
      adapterConfig.endpoints.developers.create,
      formData,
      {
        headers: {
          Accept: 'application/json',
          // Don't set Content-Type - let axios set it automatically with boundary
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'createDeveloper');
  }
}

/**
 * Update an existing developer.
 * Uses browser-native FormData for multipart/form-data uploads.
 */
export async function updateDeveloper(
  developerId: string,
  data: Record<string, unknown>,
  image?: File
): Promise<UpdateDeveloperResponse> {
  try {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        if (Array.isArray(data[key])) {
          (data[key] as unknown[]).forEach((item) => formData.append(key, String(item)));
        } else {
          formData.append(key, String(data[key]));
        }
      }
    });

    if (image) {
      formData.append('image', image);
    }

    const response = await adapterClient.put<UpdateDeveloperResponse>(
      adapterConfig.endpoints.developers.update(developerId),
      formData,
      {
        headers: {
          Accept: 'application/json',
          // Don't set Content-Type - let axios set it automatically with boundary
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `updateDeveloper(${developerId})`);
  }
}

/**
 * Get developer attachment (image).
 * Returns null if the developer has no image (404 response).
 */
export async function getDeveloperAttachment(developerId: string): Promise<DeveloperAttachment | null> {
  try {
    const response = await adapterClient.get<Blob>(
      adapterConfig.endpoints.developers.attachment(developerId),
      {
        responseType: 'blob', // browser-native blob instead of arraybuffer
        headers: {
          Accept: '*/*', // accept any image type
        },
      }
    );

    return {
      mime: response.headers['content-type'] || 'image/jpeg',
      image: response.data,
    };
  } catch (error) {
    // 404 means no image exists - this is not an error
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    handleApiError(error, `getDeveloperAttachment(${developerId})`);
  }
}

/**
 * Get all projects for a specific developer.
 */
export async function getDeveloperProjects(developerId: string): Promise<unknown[]> {
  try {
    const response = await adapterClient.get<GetDeveloperProjectsResponse>(
      adapterConfig.endpoints.developers.projects(developerId)
    );
    return response.data.projects;
  } catch (error) {
    handleApiError(error, `getDeveloperProjects(${developerId})`);
  }
}

/**
 * Get all milestones for a specific developer.
 */
export async function getDeveloperMilestones(developerId: string): Promise<GetDeveloperMilestonesResponse> {
  try {
    const response = await adapterClient.get<GetDeveloperMilestonesResponse>(
      adapterConfig.endpoints.developers.milestones(developerId)
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `getDeveloperMilestones(${developerId})`);
  }
}

/**
 * Find a developer by email address.
 * Returns undefined if no developer is found with that email.
 */
export async function findDeveloperByEmail(email: string): Promise<Developer | undefined> {
  try {
    const response = await adapterClient.get<GetDevelopersResponse>(
      adapterConfig.endpoints.developers.list
    );
    return response.data.developers.find((d) => d.email === email);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return undefined;
    }
    handleApiError(error, `findDeveloperByEmail(${email})`);
  }
}

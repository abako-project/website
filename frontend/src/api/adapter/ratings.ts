/**
 * Ratings Adapter API
 *
 * Handles rating queries from the adapter API.
 * Backend endpoints: GET /v1/ratings/client/:id, /developer/:id, /project/:id
 */

import { adapterClient, handleApiError } from './client';
import { adapterConfig } from '../config';
import type {
  RatingResponse,
  DeveloperRatingsResponse,
  ClientRatingsResponse,
} from '@/types/rating';

// ---------------------------------------------------------------------------
// Ratings API methods
// ---------------------------------------------------------------------------

/**
 * Get all ratings given by a specific client.
 */
export async function getRatingsByClient(clientId: string): Promise<ClientRatingsResponse> {
  try {
    const response = await adapterClient.get<ClientRatingsResponse>(
      adapterConfig.endpoints.ratings.byClient(clientId)
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `getRatingsByClient(${clientId})`);
  }
}

/**
 * Get all ratings received by a specific developer, including average rating.
 */
export async function getRatingsByDeveloper(developerId: string): Promise<DeveloperRatingsResponse> {
  try {
    const response = await adapterClient.get<DeveloperRatingsResponse>(
      adapterConfig.endpoints.ratings.byDeveloper(developerId)
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `getRatingsByDeveloper(${developerId})`);
  }
}

/**
 * Get all ratings for a specific project.
 */
export async function getRatingsByProject(projectId: string): Promise<{ ratings: RatingResponse[] }> {
  try {
    const response = await adapterClient.get<{ ratings: RatingResponse[] }>(
      adapterConfig.endpoints.ratings.byProject(projectId)
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `getRatingsByProject(${projectId})`);
  }
}

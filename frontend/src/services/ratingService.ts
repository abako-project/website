/**
 * Rating Service
 *
 * Thin wrappers around the ratings adapter API.
 * Backend endpoints: GET /v1/ratings/client/:id, /developer/:id, /project/:id
 */

import {
  getRatingsByClient as apiGetRatingsByClient,
  getRatingsByDeveloper as apiGetRatingsByDeveloper,
  getRatingsByProject as apiGetRatingsByProject,
} from '@/api/adapter';
import type {
  DeveloperRatingsResponse,
  ClientRatingsResponse,
  RatingResponse,
} from '@/types';

export const getDeveloperRatings = async (
  developerId: string
): Promise<DeveloperRatingsResponse> => {
  return apiGetRatingsByDeveloper(developerId);
};

export const getClientRatings = async (
  clientId: string
): Promise<ClientRatingsResponse> => {
  return apiGetRatingsByClient(clientId);
};

export const getProjectRatings = async (
  projectId: string
): Promise<RatingResponse[]> => {
  const { ratings } = await apiGetRatingsByProject(projectId);
  return ratings;
};

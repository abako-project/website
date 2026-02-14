/**
 * Rating Hooks
 *
 * React Query hooks for fetching ratings:
 *   - useDeveloperRatings(developerId) -> developer's ratings + average
 *   - useClientRatings(clientId)       -> client's given ratings
 *   - useProjectRatings(projectId)     -> project's ratings
 */

import { useQuery } from '@tanstack/react-query';
import {
  getDeveloperRatings,
  getClientRatings,
  getProjectRatings,
} from '@/services';
import type {
  DeveloperRatingsResponse,
  ClientRatingsResponse,
  RatingResponse,
} from '@/types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const ratingKeys = {
  all: ['ratings'] as const,
  developer: (id: string) => [...ratingKeys.all, 'developer', id] as const,
  client: (id: string) => [...ratingKeys.all, 'client', id] as const,
  project: (id: string) => [...ratingKeys.all, 'project', id] as const,
};

// ---------------------------------------------------------------------------
// useDeveloperRatings
// ---------------------------------------------------------------------------

/**
 * Fetches all ratings received by a developer, including average rating.
 *
 * @param developerId - The developer ID. When undefined, the query is disabled.
 */
export function useDeveloperRatings(developerId: string | undefined) {
  return useQuery<DeveloperRatingsResponse>({
    queryKey: ratingKeys.developer(developerId ?? ''),
    queryFn: () => getDeveloperRatings(developerId!),
    enabled: !!developerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ---------------------------------------------------------------------------
// useClientRatings
// ---------------------------------------------------------------------------

/**
 * Fetches all ratings given by a client.
 *
 * @param clientId - The client ID. When undefined, the query is disabled.
 */
export function useClientRatings(clientId: string | undefined) {
  return useQuery<ClientRatingsResponse>({
    queryKey: ratingKeys.client(clientId ?? ''),
    queryFn: () => getClientRatings(clientId!),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ---------------------------------------------------------------------------
// useProjectRatings
// ---------------------------------------------------------------------------

/**
 * Fetches all ratings for a specific project.
 *
 * @param projectId - The project ID. When undefined, the query is disabled.
 */
export function useProjectRatings(projectId: string | undefined) {
  return useQuery<RatingResponse[]>({
    queryKey: ratingKeys.project(projectId ?? ''),
    queryFn: () => getProjectRatings(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

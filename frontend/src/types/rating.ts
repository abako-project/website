/**
 * Rating Types
 *
 * Types for the ratings module, aligned with the backend NestJS adapter-api
 * ratings controller (GET /v1/ratings/client/:id, /developer/:id, /project/:id).
 */

export interface RatingResponse {
  id: string;
  projectId: string;
  clientId: string;
  developerId: string;
  rating: number;
  contractAddress?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DeveloperRatingsResponse {
  developerId: string;
  averageRating: number;
  totalRatings: number;
  ratings: RatingResponse[];
}

export interface ClientRatingsResponse {
  clientId: string;
  totalRatings: number;
  ratings: RatingResponse[];
}

/**
 * Profile Data Hooks
 *
 * React Query hooks wrapping the client and developer profile API endpoints:
 *   - GET  /api/clients/:id            -> useClientProfile(id)
 *   - PUT  /api/clients/:id            -> useUpdateClientProfile()
 *   - GET  /api/developers/:id         -> useDeveloperProfile(id)
 *   - PUT  /api/developers/:id         -> useUpdateDeveloperProfile()
 *   - POST /api/clients/:id/attachment -> useUploadProfileImage()
 *   - POST /api/developers/:id/attachment -> useUploadProfileImage()
 *
 * These hooks follow the same patterns established by useProjects.ts
 * and useAuth.ts for consistency.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@api/client';
import apiClient from '@api/client';
import type {
  Client,
  ClientUpdateData,
  Developer,
  DeveloperUpdateData,
} from '@/types/index';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const profileKeys = {
  all: ['profiles'] as const,
  clients: () => [...profileKeys.all, 'client'] as const,
  client: (id: string) => [...profileKeys.clients(), id] as const,
  developers: () => [...profileKeys.all, 'developer'] as const,
  developer: (id: string) => [...profileKeys.developers(), id] as const,
};

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

/** Shape returned by GET /api/clients/:id. */
interface ClientProfileResponse {
  client: Client;
  avatarUrl: string;
  languageNames: string[];
}

/** Shape returned by GET /api/developers/:id. */
interface DeveloperProfileResponse {
  developer: Developer;
  avatarUrl: string;
  languageNames: string[];
}

/** Shape returned by PUT /api/clients/:id. */
interface UpdateClientResponse {
  client: Client;
  languageNames: string[];
}

/** Shape returned by PUT /api/developers/:id. */
interface UpdateDeveloperResponse {
  developer: Developer;
  languageNames: string[];
}

/** Shape returned by POST /api/:type/:id/attachment. */
interface UploadImageResponse {
  message: string;
}

// ---------------------------------------------------------------------------
// useClientProfile
// ---------------------------------------------------------------------------

/**
 * Fetches a client profile from GET /api/clients/:id.
 *
 * Returns the client data, avatar URL, and resolved language names.
 *
 * @param id - The client ID to fetch. When undefined, the query is disabled.
 */
export function useClientProfile(id: string | undefined) {
  return useQuery<ClientProfileResponse>({
    queryKey: profileKeys.client(id ?? ''),
    queryFn: async () => {
      return api.get<ClientProfileResponse>(`/api/clients/${id}`);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ---------------------------------------------------------------------------
// useUpdateClientProfile
// ---------------------------------------------------------------------------

/** Input for the client update mutation: client ID + update data. */
interface UpdateClientInput {
  id: string;
  data: ClientUpdateData;
}

/**
 * Mutation for PUT /api/clients/:id.
 *
 * Updates a client profile. On success, invalidates the client profile
 * query so it refetches with the updated data.
 */
export function useUpdateClientProfile() {
  const queryClient = useQueryClient();

  return useMutation<UpdateClientResponse, Error, UpdateClientInput>({
    mutationFn: async ({ id, data }: UpdateClientInput) => {
      return api.put<UpdateClientResponse>(`/api/clients/${id}`, data);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: profileKeys.client(variables.id),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// useDeveloperProfile
// ---------------------------------------------------------------------------

/**
 * Fetches a developer profile from GET /api/developers/:id.
 *
 * Returns the developer data, avatar URL, and resolved language names.
 *
 * @param id - The developer ID to fetch. When undefined, the query is disabled.
 */
export function useDeveloperProfile(id: string | undefined) {
  return useQuery<DeveloperProfileResponse>({
    queryKey: profileKeys.developer(id ?? ''),
    queryFn: async () => {
      return api.get<DeveloperProfileResponse>(`/api/developers/${id}`);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ---------------------------------------------------------------------------
// useUpdateDeveloperProfile
// ---------------------------------------------------------------------------

/** Input for the developer update mutation: developer ID + update data. */
interface UpdateDeveloperInput {
  id: string;
  data: DeveloperUpdateData;
}

/**
 * Mutation for PUT /api/developers/:id.
 *
 * Updates a developer profile. On success, invalidates the developer
 * profile query so it refetches with the updated data.
 */
export function useUpdateDeveloperProfile() {
  const queryClient = useQueryClient();

  return useMutation<UpdateDeveloperResponse, Error, UpdateDeveloperInput>({
    mutationFn: async ({ id, data }: UpdateDeveloperInput) => {
      return api.put<UpdateDeveloperResponse>(`/api/developers/${id}`, data);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: profileKeys.developer(variables.id),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// useUploadProfileImage
// ---------------------------------------------------------------------------

/** Input for the image upload mutation. */
interface UploadImageInput {
  /** 'client' or 'developer' */
  profileType: 'client' | 'developer';
  /** The profile ID */
  id: string;
  /** The image file to upload */
  file: File;
}

/**
 * Mutation for POST /api/clients/:id/attachment or POST /api/developers/:id/attachment.
 *
 * Uploads a profile image using multipart/form-data.
 * On success, invalidates the relevant profile query.
 */
export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation<UploadImageResponse, Error, UploadImageInput>({
    mutationFn: async ({ profileType, id, file }: UploadImageInput) => {
      const formData = new FormData();
      formData.append('image', file);

      const endpoint = profileType === 'client'
        ? `/api/clients/${id}/attachment`
        : `/api/developers/${id}/attachment`;

      // Use the raw apiClient (axios) for FormData uploads
      // so we can set the correct Content-Type header
      const response = await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // The response interceptor already unwraps response.data
      return response as unknown as UploadImageResponse;
    },
    onSuccess: (_data, variables) => {
      if (variables.profileType === 'client') {
        void queryClient.invalidateQueries({
          queryKey: profileKeys.client(variables.id),
        });
      } else {
        void queryClient.invalidateQueries({
          queryKey: profileKeys.developer(variables.id),
        });
      }
    },
  });
}

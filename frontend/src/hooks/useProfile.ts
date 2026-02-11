/**
 * Profile Data Hooks
 *
 * React Query hooks for client and developer profiles:
 *   - useClientProfile(id)           -> Fetches client profile
 *   - useUpdateClientProfile()       -> Updates client profile
 *   - useDeveloperProfile(id)        -> Fetches developer profile
 *   - useUpdateDeveloperProfile()    -> Updates developer profile
 *   - useUploadProfileImage()        -> Uploads profile image
 *
 * All hooks use direct service calls (no Express backend).
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getClientById,
  updateClient,
  getDeveloperById,
  updateDeveloper,
} from '@/services';
import { adapterConfig } from '@/api/config';
import { LANGUAGES } from '@/constants/languages';
import type {
  Client,
  ClientUpdateData,
  Developer,
  DeveloperUpdateData,
} from '@/types';

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

/** Client profile response shape. */
interface ClientProfileResponse {
  client: Client;
  avatarUrl: string;
  languageNames: string[];
}

/** Developer profile response shape. */
interface DeveloperProfileResponse {
  developer: Developer;
  avatarUrl: string;
  languageNames: string[];
}

/** Client update response shape. */
interface UpdateClientResponse {
  client: Client;
  languageNames: string[];
}

/** Developer update response shape. */
interface UpdateDeveloperResponse {
  developer: Developer;
  languageNames: string[];
}

/** Image upload response shape. */
interface UploadImageResponse {
  message: string;
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Resolves an array of language codes to their human-readable names.
 * @param languageCodes - Array of ISO 639-3 language codes
 * @returns Array of language names
 */
function resolveLanguageNames(languageCodes: string[] | undefined): string[] {
  if (!languageCodes || languageCodes.length === 0) {
    return [];
  }
  return languageCodes
    .map((code) => LANGUAGES[code] || code)
    .filter(Boolean);
}

/**
 * Builds the avatar URL for a client.
 * @param clientId - The client ID
 * @returns The full URL to the client's avatar
 */
function buildClientAvatarUrl(clientId: string): string {
  return `${adapterConfig.baseURL}${adapterConfig.endpoints.clients.attachment(clientId)}`;
}

/**
 * Builds the avatar URL for a developer.
 * @param developerId - The developer ID
 * @returns The full URL to the developer's avatar
 */
function buildDeveloperAvatarUrl(developerId: string): string {
  return `${adapterConfig.baseURL}${adapterConfig.endpoints.developers.attachment(developerId)}`;
}

// ---------------------------------------------------------------------------
// useClientProfile
// ---------------------------------------------------------------------------

/**
 * Fetches a client profile from the adapter service.
 *
 * Returns the client data, avatar URL, and resolved language names.
 *
 * @param id - The client ID to fetch. When undefined, the query is disabled.
 */
export function useClientProfile(id: string | undefined) {
  return useQuery<ClientProfileResponse>({
    queryKey: profileKeys.client(id ?? ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Client ID is required');
      }
      const client = await getClientById(id);
      const avatarUrl = buildClientAvatarUrl(id);
      const languageNames = resolveLanguageNames(client.languages);

      return {
        client,
        avatarUrl,
        languageNames,
      };
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
 * Mutation for updating a client profile.
 *
 * Updates a client profile via the adapter service. On success, invalidates
 * the client profile query so it refetches with the updated data.
 */
export function useUpdateClientProfile() {
  const queryClient = useQueryClient();

  return useMutation<UpdateClientResponse, Error, UpdateClientInput>({
    mutationFn: async ({ id, data }: UpdateClientInput) => {
      await updateClient(id, data as unknown as Record<string, unknown>);

      // Fetch the updated client to return consistent response shape
      const client = await getClientById(id);
      const languageNames = resolveLanguageNames(client.languages);

      return {
        client,
        languageNames,
      };
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
 * Fetches a developer profile from the adapter service.
 *
 * Returns the developer data, avatar URL, and resolved language names.
 *
 * @param id - The developer ID to fetch. When undefined, the query is disabled.
 */
export function useDeveloperProfile(id: string | undefined) {
  return useQuery<DeveloperProfileResponse>({
    queryKey: profileKeys.developer(id ?? ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Developer ID is required');
      }
      const developer = await getDeveloperById(id);
      const avatarUrl = buildDeveloperAvatarUrl(id);
      const languageNames = resolveLanguageNames(developer.languages);

      return {
        developer,
        avatarUrl,
        languageNames,
      };
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
 * Mutation for updating a developer profile.
 *
 * Updates a developer profile via the adapter service. On success, invalidates
 * the developer profile query so it refetches with the updated data.
 */
export function useUpdateDeveloperProfile() {
  const queryClient = useQueryClient();

  return useMutation<UpdateDeveloperResponse, Error, UpdateDeveloperInput>({
    mutationFn: async ({ id, data }: UpdateDeveloperInput) => {
      await updateDeveloper(id, data as unknown as Record<string, unknown>);

      // Fetch the updated developer to return consistent response shape
      const developer = await getDeveloperById(id);
      const languageNames = resolveLanguageNames(developer.languages);

      return {
        developer,
        languageNames,
      };
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
 * Mutation for uploading a profile image.
 *
 * Uploads a profile image using the update service with multipart/form-data.
 * On success, invalidates the relevant profile query.
 */
export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation<UploadImageResponse, Error, UploadImageInput>({
    mutationFn: async ({ profileType, id, file }: UploadImageInput) => {
      if (profileType === 'client') {
        // Fetch current client data to merge with image upload
        const client = await getClientById(id);
        await updateClient(id, client as unknown as Record<string, unknown>, file);
      } else {
        // Fetch current developer data to merge with image upload
        const developer = await getDeveloperById(id);
        await updateDeveloper(id, developer as unknown as Record<string, unknown>, file);
      }

      return {
        message: 'Profile image uploaded successfully',
      };
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

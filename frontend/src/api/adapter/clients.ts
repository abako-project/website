/**
 * Clients Adapter API
 *
 * Handles client CRUD operations with the adapter API.
 * Ported from backend/models/adapter.js (getClients, getClient, createClient, updateClient, etc.)
 */

import axios from 'axios';
import { adapterConfig, API_TIMEOUT } from '../config';
import { useAuthStore } from '@stores/authStore';
import type { Client } from '@/types/client';

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

interface GetClientsResponse {
  clients: Client[];
}

interface GetClientResponse {
  client: Client;
}

interface CreateClientResponse {
  client: Client;
}

interface UpdateClientResponse {
  client: Client;
}

interface ClientAttachment {
  mime: string;
  image: Blob;
}

interface GetClientProjectsResponse {
  projects: unknown[];
}

// ---------------------------------------------------------------------------
// Client API methods
// ---------------------------------------------------------------------------

/**
 * Get all clients from the adapter API.
 */
export async function getClients(): Promise<GetClientsResponse> {
  try {
    const response = await adapterClient.get<GetClientsResponse>(
      adapterConfig.endpoints.clients.list
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'getClients');
  }
}

/**
 * Get a single client by ID.
 */
export async function getClient(clientId: string): Promise<GetClientResponse> {
  try {
    const response = await adapterClient.get<GetClientResponse>(
      adapterConfig.endpoints.clients.get(clientId)
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `getClient(${clientId})`);
  }
}

/**
 * Create a new client.
 * Uses browser-native FormData for multipart/form-data uploads.
 */
export async function createClient(
  email: string,
  name: string,
  company?: string,
  department?: string,
  website?: string,
  description?: string,
  location?: string,
  languages?: string,
  image?: File
): Promise<CreateClientResponse> {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('name', name);
    formData.append('company', company || 'company');
    formData.append('department', department || 'department');
    formData.append('website', website || 'website');
    formData.append('description', description || 'description');
    formData.append('location', location || 'location');
    if (languages) formData.append('languages', languages);
    if (image) formData.append('image', image);

    const response = await adapterClient.post<CreateClientResponse>(
      adapterConfig.endpoints.clients.create,
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
    handleApiError(error, 'createClient');
  }
}

/**
 * Update an existing client.
 * Uses browser-native FormData for multipart/form-data uploads.
 */
export async function updateClient(
  clientId: string,
  data: Record<string, unknown>,
  image?: File
): Promise<UpdateClientResponse> {
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

    const response = await adapterClient.put<UpdateClientResponse>(
      adapterConfig.endpoints.clients.update(clientId),
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
    handleApiError(error, `updateClient(${clientId})`);
  }
}

/**
 * Get client attachment (image).
 * Returns null if the client has no image (404 response).
 */
export async function getClientAttachment(clientId: string): Promise<ClientAttachment | null> {
  try {
    const response = await adapterClient.get<Blob>(
      adapterConfig.endpoints.clients.attachment(clientId),
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
    handleApiError(error, `getClientAttachment(${clientId})`);
  }
}

/**
 * Get all projects for a specific client.
 */
export async function getClientProjects(clientId: string): Promise<unknown[]> {
  try {
    const response = await adapterClient.get<GetClientProjectsResponse>(
      adapterConfig.endpoints.clients.projects(clientId)
    );
    return response.data.projects;
  } catch (error) {
    handleApiError(error, `getClientProjects(${clientId})`);
  }
}

/**
 * Find a client by email address.
 * Returns undefined if no client is found with that email.
 */
export async function findClientByEmail(email: string): Promise<Client | undefined> {
  try {
    const response = await adapterClient.get<GetClientsResponse>(
      adapterConfig.endpoints.clients.list
    );
    return response.data.clients.find((c) => c.email === email);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return undefined;
    }
    handleApiError(error, `findClientByEmail(${email})`);
  }
}

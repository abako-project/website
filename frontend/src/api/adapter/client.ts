/**
 * Shared Adapter API Client
 *
 * Single axios instance for all adapter API modules.
 * Includes auth interceptor (Bearer token + x-user-email) and error handling.
 *
 * Usage in adapter modules:
 *   import { adapterClient, handleApiError } from './client';
 */

import axios from 'axios';
import { adapterConfig, API_TIMEOUT } from '../config';
import { useAuthStore } from '@stores/authStore';

// Shared axios instance for all adapter API modules
export const adapterClient = axios.create({
  baseURL: adapterConfig.baseURL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Auth interceptor: injects Bearer token and x-user-email
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

/**
 * Standardized error handler for adapter API calls.
 * Enhances axios errors with statusCode and context, then re-throws.
 */
export function handleApiError(error: unknown, context: string): never {
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

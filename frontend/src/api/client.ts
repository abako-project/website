import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@stores/authStore';
import type { ApiError, ApiErrorResponse } from '@/types/index';
import { isApiError } from '@/types/index';

/**
 * API Client Configuration
 *
 * This axios instance is configured to:
 * 1. Use the API base URL from environment variables
 * 2. Automatically add Bearer token to all requests
 * 3. Handle 401 responses by clearing auth state
 * 4. Unwrap the standard API response format { success: true, data: ... }
 */

let isRedirectingToLogin = false;

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Request Interceptor
 * Adds Authorization header with Bearer token from auth store
 * and the x-user-email header for API authentication.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token, user } = useAuthStore.getState();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (user?.email) {
      config.headers['x-user-email'] = user.email;
    }

    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Unwraps standard API response format and handles errors.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap { success: true, data: ... } format if present
    const data = response.data as Record<string, unknown>;
    if (data && typeof data === 'object' && 'success' in data && data.data !== undefined) {
      return data.data;
    }
    return response.data;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - clear auth state and redirect to login (once)
    if (error.response?.status === 401 && !isRedirectingToLogin) {
      isRedirectingToLogin = true;
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    // Try to extract the standard API error format
    const responseData = error.response?.data;

    // Check for direct ApiError format: { error: true, message, code }
    if (isApiError(responseData)) {
      const apiError = responseData;
      const err = new Error(apiError.message) as Error & { code: string };
      err.code = apiError.code;
      return Promise.reject(err);
    }

    // Check for wrapped format: { success: false, error: { code, message } }
    const wrappedError = responseData as ApiErrorResponse | undefined;
    if (wrappedError?.error && typeof wrappedError.error === 'object') {
      const err = new Error(wrappedError.error.message) as Error & { code: string };
      err.code = wrappedError.error.code;
      return Promise.reject(err);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// ---------------------------------------------------------------------------
// Typed API helper
// ---------------------------------------------------------------------------

/**
 * Type-safe wrapper for making API calls.
 *
 * The response interceptor already unwraps the data, so this helper
 * simply provides TypeScript generics for the return type.
 *
 * @example
 *   const user = await api.get<User>('/api/auth/me');
 *   const enums = await api.get<EnumsResponse>('/api/enums');
 */
export const api = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return apiClient.get(url, { params }) as Promise<T>;
  },

  async post<T>(url: string, data?: unknown): Promise<T> {
    return apiClient.post(url, data) as Promise<T>;
  },

  async put<T>(url: string, data?: unknown): Promise<T> {
    return apiClient.put(url, data) as Promise<T>;
  },

  async delete<T>(url: string): Promise<T> {
    return apiClient.delete(url) as Promise<T>;
  },
};

// ---------------------------------------------------------------------------
// Re-export response types for convenience
// ---------------------------------------------------------------------------

export type { ApiError, ApiErrorResponse };

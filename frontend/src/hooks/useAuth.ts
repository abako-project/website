/**
 * Authentication Hooks
 *
 * React Query hooks wrapping the auth API endpoints:
 *   - GET  /api/auth/me     -> useCurrentUser()
 *   - POST /api/auth/login  -> useLogin()
 *   - DELETE /api/auth/logout -> useLogout()
 *
 * These hooks work alongside the Zustand authStore:
 *   - useLogin() updates the authStore on success
 *   - useLogout() clears the authStore on success
 *   - useCurrentUser() can be used to rehydrate auth state from the session
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@api/client';
import { useAuthStore } from '@stores/authStore';
import type {
  LoginCredentials,
  LoginResponse,
  MeResponse,
  LogoutResponse,
  RegisterCredentials,
  RegisterResponse,
  User,
} from '@/types/index';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// ---------------------------------------------------------------------------
// useCurrentUser
// ---------------------------------------------------------------------------

/**
 * Fetches the currently authenticated user from GET /api/auth/me.
 *
 * This query is disabled when no session exists (i.e., when the user
 * is not authenticated in the Zustand store). It can also be used on
 * app startup to check if an existing session cookie is still valid.
 *
 * @param options.enabled - Override the automatic enable/disable behavior.
 */
export function useCurrentUser(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<User>({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await api.get<MeResponse>('/api/auth/me');
      return response.user;
    },
    // Only fetch if the user appears to be authenticated
    // (has a token in Zustand), unless explicitly overridden
    enabled: options?.enabled ?? isAuthenticated,
    // User data should stay fresh while the tab is active
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 401
  });
}

// ---------------------------------------------------------------------------
// useLogin
// ---------------------------------------------------------------------------

/**
 * Mutation for POST /api/auth/login.
 *
 * On success, updates the Zustand auth store with the user and token,
 * and invalidates the current user query so it refetches.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      return api.post<LoginResponse>('/api/auth/login', credentials);
    },
    onSuccess: (data) => {
      // Update Zustand store
      login(data.user, data.token);

      // Invalidate the "me" query so it picks up the new session
      void queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

// ---------------------------------------------------------------------------
// useRegister
// ---------------------------------------------------------------------------

/**
 * Mutation for POST /api/auth/register.
 *
 * Sends the WebAuthn preparedData along with email, name, and role
 * to the backend, which creates the account via SEDA.
 */
export function useRegister() {
  return useMutation<RegisterResponse, Error, RegisterCredentials>({
    mutationFn: async (credentials: RegisterCredentials) => {
      return api.post<RegisterResponse>('/api/auth/register', credentials);
    },
  });
}

// ---------------------------------------------------------------------------
// useLogout
// ---------------------------------------------------------------------------

/**
 * Mutation for DELETE /api/auth/logout.
 *
 * On success, clears the Zustand auth store and resets all React Query caches
 * (since the user context has changed).
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation<LogoutResponse, Error, void>({
    mutationFn: async () => {
      return api.delete<LogoutResponse>('/api/auth/logout');
    },
    onSuccess: () => {
      // Clear Zustand store
      logout();

      // Reset all queries (user-specific data is no longer valid)
      void queryClient.resetQueries();
    },
  });
}

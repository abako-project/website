/**
 * Authentication Hooks
 *
 * React Query hooks for authentication operations.
 * All hooks use direct service calls (no Express backend).
 *
 * Flow:
 *   - Login: clientConnect/developerConnect → Zustand store
 *   - Register: createClient/createDeveloper → Zustand store
 *   - Logout: Clear Zustand store (no server call)
 *   - CurrentUser: Validate persisted user via findByEmail
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@stores/authStore';
import {
  clientConnect,
  developerConnect,
  createClient,
  createDeveloper,
  findClientByEmail,
  findDeveloperByEmail,
} from '@/services';
import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
  User,
  UserRole,
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
 * Validates the persisted user by checking they still exist in the API.
 *
 * Since auth state is persisted in localStorage via Zustand, we don't
 * need a server session. This hook optionally validates the user
 * still exists by querying findClientByEmail / findDeveloperByEmail.
 */
export function useCurrentUser(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  return useQuery<User>({
    queryKey: authKeys.me(),
    queryFn: async () => {
      if (!user?.email) throw new Error('No user in store');

      // Validate user still exists in the external API
      if (user.clientId) {
        const client = await findClientByEmail(user.email);
        if (!client) throw new Error('Client not found');
        return { email: user.email, name: client.name, clientId: client.id };
      }

      if (user.developerId) {
        const developer = await findDeveloperByEmail(user.email);
        if (!developer) throw new Error('Developer not found');
        return { email: user.email, name: developer.name, developerId: developer.id };
      }

      throw new Error('User has no role');
    },
    enabled: options?.enabled ?? isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// ---------------------------------------------------------------------------
// useLogin
// ---------------------------------------------------------------------------

/**
 * Login mutation that calls SEDA services directly.
 *
 * Calls clientConnect or developerConnect depending on the role,
 * then updates the Zustand auth store with user and token.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const { email, role } = credentials;

      if (role === 'client') {
        const result = await clientConnect(email);
        const user: User = {
          email,
          name: result.name ?? email,
          clientId: result.clientId,
        };
        return { user, token: result.token };
      }

      // role === 'developer'
      const result = await developerConnect(email);
      const user: User = {
        email,
        name: result.name ?? email,
        developerId: result.developerId,
      };
      return { user, token: result.token };
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      void queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

// ---------------------------------------------------------------------------
// useRegister
// ---------------------------------------------------------------------------

/**
 * Registration mutation that calls SEDA services directly.
 *
 * Creates a new client or developer account via the adapter API.
 */
export function useRegister() {
  return useMutation<RegisterResponse, Error, RegisterCredentials>({
    mutationFn: async (credentials: RegisterCredentials) => {
      const { email, name, role, preparedData } = credentials;

      if (role === 'client') {
        await createClient(email, name, preparedData);
      } else {
        await createDeveloper(email, name, preparedData);
      }

      return { success: true as const, message: 'Registration successful' };
    },
  });
}

// ---------------------------------------------------------------------------
// useLogout
// ---------------------------------------------------------------------------

/**
 * Logout mutation that clears the Zustand store.
 *
 * No server call needed since auth is fully client-side
 * (token from Virto WebAuthn, persisted in localStorage).
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      // No server call needed - just clear local state
    },
    onSuccess: () => {
      logout();
      void queryClient.resetQueries();
    },
  });
}

// ---------------------------------------------------------------------------
// Helper: get user role from User object
// ---------------------------------------------------------------------------

export function getUserRole(user: User | null): UserRole | null {
  if (!user) return null;
  if (user.clientId) return 'client';
  if (user.developerId) return 'developer';
  return null;
}

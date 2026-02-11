import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/index';

/**
 * Authentication Store
 *
 * Manages user authentication state using Zustand with localStorage persistence.
 * The token comes from the Virto WebAuthn flow (customConnect/customRegister).
 *
 * Uses the shared User type from @types/user.ts for consistency
 * across the auth hooks, API client, and UI components.
 */

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User | null) => {
        set({ user });
      },
    }),
    {
      name: 'abako-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

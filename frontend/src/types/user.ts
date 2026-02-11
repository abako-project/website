/**
 * User and Authentication Types
 *
 * Derived from:
 *   - backend/controllers/auth/client.js (loginCreate sets req.session.loginUser)
 *   - backend/controllers/auth/developer.js (loginCreate sets req.session.loginUser)
 *   - backend/routes/api/auth.js (POST /api/auth/login, GET /api/auth/me)
 *   - backend/stores/authStore.ts (existing Zustand skeleton)
 */

/** The role a user logs in as. */
export type UserRole = 'client' | 'developer';

/**
 * Authenticated user profile.
 *
 * Exactly one of `clientId` or `developerId` will be defined,
 * depending on the role the user logged in as.
 * Matches the shape returned by GET /api/auth/me.
 */
export interface User {
  email: string;
  name: string;
  clientId?: string;
  developerId?: string;
}

/**
 * Credentials sent to POST /api/auth/login.
 *
 * The `token` is obtained from the Virto WebAuthn flow
 * (customConnect / customRegister) on the client side.
 */
export interface LoginCredentials {
  email: string;
  token: string;
  role: UserRole;
}

/**
 * Successful response from POST /api/auth/login.
 */
export interface LoginResponse {
  user: User;
  token: string;
}

/**
 * Response from GET /api/auth/me when authenticated.
 */
export interface MeResponse {
  user: User;
}

/**
 * Response from DELETE /api/auth/logout.
 */
export interface LogoutResponse {
  success: true;
}

/**
 * Credentials sent to POST /api/auth/register.
 *
 * The `preparedData` is obtained from the Virto SDK
 * `sdk.auth.prepareRegistration()` on the client side.
 */
export interface RegisterCredentials {
  email: string;
  name: string;
  role: UserRole;
  preparedData: unknown;
}

/**
 * Successful response from POST /api/auth/register.
 */
export interface RegisterResponse {
  success: true;
  message: string;
}

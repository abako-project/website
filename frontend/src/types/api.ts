/**
 * API Response and Error Types
 *
 * Derived from:
 *   - backend/routes/api/auth.js (error response shapes)
 *   - backend/middleware/apiResponse.js (res.success / res.error helpers)
 *   - backend/models/adapter.js (handleError)
 *
 * The backend API has two response patterns:
 *   1. Success: the raw data as JSON (auth endpoints) or { success: true, data: T }
 *   2. Error: { error: true, message: string, code: string }
 */

/**
 * Standard API error shape returned by backend /api endpoints.
 *
 * All error responses include `error: true`, a human-readable `message`,
 * and a machine-readable `code` for programmatic handling.
 */
export interface ApiError {
  error: true;
  message: string;
  code: string;
  details?: Record<string, string>;
  stack?: string;
}

/**
 * Standard success wrapper used by the apiResponse middleware.
 * Some endpoints (like auth) return data directly without this wrapper.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Standard error wrapper used by the apiResponse middleware.
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

/**
 * Known API error codes from the backend.
 */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTH_REQUIRED'
  | 'AUTH_FAILED'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'
  | 'FORBIDDEN';

/**
 * Type guard to check if a value is an ApiError.
 */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    (value as ApiError).error === true &&
    'message' in value &&
    'code' in value
  );
}

/**
 * Enum Data Hooks
 *
 * React Query hooks wrapping the enums API endpoints:
 *   - GET /api/enums           -> useEnums()
 *   - GET /api/enums/budgets   -> useBudgets()
 *   - GET /api/enums/skills    -> useSkills()
 *   - etc.
 *
 * Enum data is static reference data that rarely changes, so we use
 * a long staleTime (30 minutes) and gcTime (1 hour).
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@api/client';
import type { EnumsResponse, LanguagesMap } from '@/types/index';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const enumKeys = {
  all: ['enums'] as const,
  aggregate: () => [...enumKeys.all, 'aggregate'] as const,
  languages: () => [...enumKeys.all, 'languages'] as const,
};

/** Common query options for enum data (rarely changes). */
const ENUM_QUERY_OPTIONS = {
  staleTime: 30 * 60 * 1000,  // 30 minutes
  gcTime: 60 * 60 * 1000,     // 1 hour
  refetchOnWindowFocus: false,
  retry: 2,
} as const;

// ---------------------------------------------------------------------------
// useEnums (aggregate)
// ---------------------------------------------------------------------------

/**
 * Fetches all enum data in a single request from GET /api/enums.
 *
 * This is the preferred hook when you need multiple enum types
 * at once (e.g., in a form with budgets, delivery times, and project types).
 */
export function useEnums() {
  return useQuery<EnumsResponse>({
    queryKey: enumKeys.aggregate(),
    queryFn: () => api.get<EnumsResponse>('/api/enums'),
    ...ENUM_QUERY_OPTIONS,
  });
}

// ---------------------------------------------------------------------------
// Individual enum hooks
// ---------------------------------------------------------------------------

/**
 * Fetches the languages map from GET /api/enums/languages.
 * Returns an object mapping ISO codes to language names.
 */
export function useLanguages() {
  return useQuery<LanguagesMap>({
    queryKey: enumKeys.languages(),
    queryFn: () => api.get<LanguagesMap>('/api/enums/languages'),
    ...ENUM_QUERY_OPTIONS,
  });
}

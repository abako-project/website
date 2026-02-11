/**
 * Enum Data Hooks
 *
 * React Query hooks for enum/reference data:
 *   - useEnums()     -> Returns all enum data
 *   - useLanguages() -> Returns languages map
 *
 * All enum data is static and loaded from frontend constants,
 * no backend API calls are needed.
 */

import { useQuery } from '@tanstack/react-query';
import {
  BUDGETS,
  DELIVERY_TIMES,
  PROJECT_TYPES,
  SKILLS,
  ROLES,
  AVAILABILITY_OPTIONS,
  PROFICIENCY_LEVELS,
} from '@/types';
import { LANGUAGES } from '@/constants/languages';
import type { EnumsResponse, LanguagesMap } from '@/types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const enumKeys = {
  all: ['enums'] as const,
  aggregate: () => [...enumKeys.all, 'aggregate'] as const,
  languages: () => [...enumKeys.all, 'languages'] as const,
};

/** Common query options for enum data (static, never changes). */
const ENUM_QUERY_OPTIONS = {
  staleTime: Infinity,  // Static data never goes stale
  gcTime: Infinity,     // Never garbage collect
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  retry: false, // No need to retry static data
} as const;

// ---------------------------------------------------------------------------
// useEnums (aggregate)
// ---------------------------------------------------------------------------

/**
 * Returns all enum data in a single response.
 *
 * This is the preferred hook when you need multiple enum types
 * at once (e.g., in a form with budgets, delivery times, and project types).
 *
 * All data is static and loaded from frontend constants - no API calls.
 */
export function useEnums() {
  return useQuery<EnumsResponse>({
    queryKey: enumKeys.aggregate(),
    queryFn: () =>
      Promise.resolve({
        budgets: BUDGETS,
        deliveryTimes: DELIVERY_TIMES,
        projectTypes: PROJECT_TYPES,
        skills: SKILLS,
        roles: ROLES,
        availability: AVAILABILITY_OPTIONS,
        languages: LANGUAGES,
        proficiency: PROFICIENCY_LEVELS,
      } as EnumsResponse),
    ...ENUM_QUERY_OPTIONS,
  });
}

// ---------------------------------------------------------------------------
// Individual enum hooks
// ---------------------------------------------------------------------------

/**
 * Returns the languages map.
 *
 * Returns an object mapping ISO 639-3 codes to language names.
 * Data is static and loaded from frontend constants - no API calls.
 */
export function useLanguages() {
  return useQuery<LanguagesMap>({
    queryKey: enumKeys.languages(),
    queryFn: () => Promise.resolve(LANGUAGES),
    ...ENUM_QUERY_OPTIONS,
  });
}

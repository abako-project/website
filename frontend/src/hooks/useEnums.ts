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
  budgets: () => [...enumKeys.all, 'budgets'] as const,
  deliveryTimes: () => [...enumKeys.all, 'delivery-times'] as const,
  projectTypes: () => [...enumKeys.all, 'project-types'] as const,
  skills: () => [...enumKeys.all, 'skills'] as const,
  roles: () => [...enumKeys.all, 'roles'] as const,
  availability: () => [...enumKeys.all, 'availability'] as const,
  languages: () => [...enumKeys.all, 'languages'] as const,
  proficiency: () => [...enumKeys.all, 'proficiency'] as const,
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
 * Fetches budget options from GET /api/enums/budgets.
 * Returns an array of budget label strings.
 */
export function useBudgets() {
  return useQuery<readonly string[]>({
    queryKey: enumKeys.budgets(),
    queryFn: () => api.get<readonly string[]>('/api/enums/budgets'),
    ...ENUM_QUERY_OPTIONS,
  });
}

/**
 * Fetches delivery time options from GET /api/enums/delivery-times.
 * Returns an array of delivery time label strings.
 */
export function useDeliveryTimes() {
  return useQuery<readonly string[]>({
    queryKey: enumKeys.deliveryTimes(),
    queryFn: () => api.get<readonly string[]>('/api/enums/delivery-times'),
    ...ENUM_QUERY_OPTIONS,
  });
}

/**
 * Fetches project type options from GET /api/enums/project-types.
 * Returns an array of project type label strings.
 */
export function useProjectTypes() {
  return useQuery<readonly string[]>({
    queryKey: enumKeys.projectTypes(),
    queryFn: () => api.get<readonly string[]>('/api/enums/project-types'),
    ...ENUM_QUERY_OPTIONS,
  });
}

/**
 * Fetches skill options from GET /api/enums/skills.
 * Returns an array of skill name strings.
 */
export function useSkills() {
  return useQuery<readonly string[]>({
    queryKey: enumKeys.skills(),
    queryFn: () => api.get<readonly string[]>('/api/enums/skills'),
    ...ENUM_QUERY_OPTIONS,
  });
}

/**
 * Fetches role options from GET /api/enums/roles.
 * Returns an array of role label strings.
 */
export function useRoles() {
  return useQuery<readonly string[]>({
    queryKey: enumKeys.roles(),
    queryFn: () => api.get<readonly string[]>('/api/enums/roles'),
    ...ENUM_QUERY_OPTIONS,
  });
}

/**
 * Fetches availability options from GET /api/enums/availability.
 * Returns an array of availability type strings.
 */
export function useAvailability() {
  return useQuery<readonly string[]>({
    queryKey: enumKeys.availability(),
    queryFn: () => api.get<readonly string[]>('/api/enums/availability'),
    ...ENUM_QUERY_OPTIONS,
  });
}

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

/**
 * Fetches proficiency options from GET /api/enums/proficiency.
 * Returns an array of proficiency level strings.
 */
export function useProficiency() {
  return useQuery<readonly string[]>({
    queryKey: enumKeys.proficiency(),
    queryFn: () => api.get<readonly string[]>('/api/enums/proficiency'),
    ...ENUM_QUERY_OPTIONS,
  });
}

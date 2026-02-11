/**
 * Payment Data Hooks
 *
 * React Query hooks wrapping the payment API endpoints:
 *   - GET  /api/payments            -> usePayments()
 *   - GET  /api/payments/:projectId -> usePayment(projectId)
 *   - POST /api/payments/:projectId/release -> useReleasePayment()
 *
 * These hooks use the typed api helper from @api/client and return
 * strongly typed data matching the Payment types.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@api/client';
import { projectKeys } from '@hooks/useProjects';
import type {
  PaymentsResponse,
  PaymentDetailResponse,
  ReleasePaymentResponse,
} from '@/types/index';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (projectId: string) =>
    [...paymentKeys.details(), projectId] as const,
};

// ---------------------------------------------------------------------------
// usePayments
// ---------------------------------------------------------------------------

/**
 * Fetches all payment data for the authenticated user from GET /api/payments.
 *
 * Returns projects (with milestones) plus the advance payment percentage.
 * The frontend computes payment summaries from this data, mirroring the
 * EJS template logic in views/payments/__paymentGridProject.ejs.
 */
export function usePayments() {
  return useQuery<PaymentsResponse>({
    queryKey: paymentKeys.lists(),
    queryFn: async () => {
      return api.get<PaymentsResponse>('/api/payments');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ---------------------------------------------------------------------------
// usePayment
// ---------------------------------------------------------------------------

/**
 * Fetches payment details for a specific project from
 * GET /api/payments/:projectId.
 *
 * @param projectId - The project ID to fetch payment info for.
 *   When undefined, the query is disabled.
 */
export function usePayment(projectId: string | undefined) {
  return useQuery<PaymentDetailResponse>({
    queryKey: paymentKeys.detail(projectId ?? ''),
    queryFn: async () => {
      return api.get<PaymentDetailResponse>(`/api/payments/${projectId}`);
    },
    enabled: !!projectId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// ---------------------------------------------------------------------------
// useReleasePayment
// ---------------------------------------------------------------------------

/** Input for the release payment mutation. */
export interface ReleasePaymentInput {
  projectId: string;
  rating?: Array<[string, number]>;
}

/**
 * Mutation for POST /api/payments/:projectId/release.
 *
 * Marks the project as completed with ratings and releases payment.
 * This is the final step after all milestones are completed and rated.
 *
 * On success, invalidates the payment list, project detail, and dashboard queries.
 */
export function useReleasePayment() {
  const queryClient = useQueryClient();

  return useMutation<ReleasePaymentResponse, Error, ReleasePaymentInput>({
    mutationFn: async ({ projectId, rating }: ReleasePaymentInput) => {
      return api.post<ReleasePaymentResponse>(
        `/api/payments/${projectId}/release`,
        { rating }
      );
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.detail(variables.projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
      });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: projectKeys.dashboard() });
    },
  });
}

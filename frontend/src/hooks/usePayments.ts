/**
 * Payment Data Hooks
 *
 * React Query hooks for payment data.
 * All hooks use direct service calls (no Express backend).
 *
 * These hooks use the typed service functions and return
 * strongly typed data matching the Payment types.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { projectKeys } from '@hooks/useProjects';
import type {
  PaymentsResponse,
  PaymentDetailResponse,
  ReleasePaymentResponse,
} from '@/types/index';
import { DELIVERY_TIMES } from '@/types';
import { getProjectsIndex, getProject, projectCompleted } from '@/services';
import { useAuthStore } from '@/stores/authStore';

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
 * Fetches all payment data for the authenticated user.
 *
 * Returns projects (with milestones) plus the advance payment percentage.
 * The frontend computes payment summaries from this data, mirroring the
 * EJS template logic in views/payments/__paymentGridProject.ejs.
 */
export function usePayments() {
  return useQuery<PaymentsResponse>({
    queryKey: paymentKeys.lists(),
    queryFn: async () => {
      const user = useAuthStore.getState().user;
      const projects = await getProjectsIndex(user?.clientId, user?.developerId);

      // Reverse order to match original behavior
      projects.reverse();

      // Build delivery times array
      const allDeliveryTimes = DELIVERY_TIMES.map((d, i) => ({
        id: i,
        description: d,
      }));

      return {
        projects,
        advancePaymentPercentage: 25,
        allDeliveryTimes,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ---------------------------------------------------------------------------
// usePayment
// ---------------------------------------------------------------------------

/**
 * Fetches payment details for a specific project.
 *
 * @param projectId - The project ID to fetch payment info for.
 *   When undefined, the query is disabled.
 */
export function usePayment(projectId: string | undefined) {
  return useQuery<PaymentDetailResponse>({
    queryKey: paymentKeys.detail(projectId ?? ''),
    queryFn: async () => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const project = await getProject(projectId);

      // Build delivery times array
      const allDeliveryTimes = DELIVERY_TIMES.map((d, i) => ({
        id: i,
        description: d,
      }));

      return {
        project,
        advancePaymentPercentage: 25,
        allDeliveryTimes,
      };
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
 * Mutation for releasing payment.
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
      const token = useAuthStore.getState().token || '';
      await projectCompleted(projectId, rating, token);
      return {
        projectId,
        message: 'Payment released successfully',
      };
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

/**
 * useEscrow - React Query mutation hook for creating escrow payments
 *
 * Wraps the Virto API createPayment call and automatically invalidates
 * the relevant payment and project query caches on success.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPayment } from '@/api/virto/payments';
import { projectKeys } from '@hooks/useProjects';
import { paymentKeys } from '@hooks/usePayments';
import type { CreatePaymentData } from '@/api/virto/types';
import type { CreatePaymentResponse } from '@/api/virto/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreateEscrowInput {
  projectId: string;
  amount: number;
  recipientAddress: string;
  milestoneId?: string;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Mutation hook for creating a new escrow payment.
 *
 * On success, invalidates:
 *   - paymentKeys.lists() — so the payments list refetches
 *   - paymentKeys.detail(projectId) — so the payment detail refetches
 *   - projectKeys.detail(projectId) — so the project detail refetches
 *
 * @example
 * ```tsx
 * const { mutate: createEscrow, isPending } = useCreateEscrow();
 *
 * createEscrow({
 *   projectId: '123',
 *   amount: 500,
 *   recipientAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
 * });
 * ```
 */
export function useCreateEscrow() {
  const queryClient = useQueryClient();

  return useMutation<CreatePaymentResponse, Error, CreateEscrowInput>({
    mutationFn: async (input: CreateEscrowInput): Promise<CreatePaymentResponse> => {
      const paymentData: CreatePaymentData = {
        amount: input.amount,
        recipientAddress: input.recipientAddress,
        projectId: input.projectId,
        milestoneId: input.milestoneId,
      };
      return createPayment(paymentData);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.detail(variables.projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
      });
    },
  });
}

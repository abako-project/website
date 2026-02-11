/**
 * Votes Data Hooks
 *
 * React Query hooks wrapping the votes API endpoints:
 *   - GET  /api/votes/:projectId  -> useVoteMembers(projectId)
 *   - POST /api/votes/:projectId  -> useSubmitVotes()
 *
 * These hooks manage the voting/rating flow where consultants
 * rate developer performance at the end of a project.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@api/client';
import { projectKeys } from '@hooks/useProjects';
import { paymentKeys } from '@hooks/usePayments';
import type {
  VotesResponse,
  VoteEntry,
  SubmitVotesResponse,
} from '@/types/index';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const voteKeys = {
  all: ['votes'] as const,
  members: (projectId: string) => [...voteKeys.all, 'members', projectId] as const,
};

// ---------------------------------------------------------------------------
// useVoteMembers
// ---------------------------------------------------------------------------

/**
 * Fetches the team members available for rating from GET /api/votes/:projectId.
 *
 * @param projectId - The project ID. When undefined, the query is disabled.
 */
export function useVoteMembers(projectId: string | undefined) {
  return useQuery<VotesResponse>({
    queryKey: voteKeys.members(projectId ?? ''),
    queryFn: async () => {
      return api.get<VotesResponse>(`/api/votes/${projectId}`);
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ---------------------------------------------------------------------------
// useSubmitVotes
// ---------------------------------------------------------------------------

/** Input for the submit votes mutation. */
export interface SubmitVotesInput {
  projectId: string;
  votes: VoteEntry[];
}

/**
 * Mutation for POST /api/votes/:projectId.
 *
 * Submits developer ratings and marks the project as completed.
 * On success, invalidates relevant queries.
 */
export function useSubmitVotes() {
  const queryClient = useQueryClient();

  return useMutation<SubmitVotesResponse, Error, SubmitVotesInput>({
    mutationFn: async ({ projectId, votes }: SubmitVotesInput) => {
      return api.post<SubmitVotesResponse>(
        `/api/votes/${projectId}`,
        { votes }
      );
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: voteKeys.members(variables.projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
      });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: projectKeys.dashboard() });
      void queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}

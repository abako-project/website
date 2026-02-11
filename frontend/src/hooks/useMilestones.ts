/**
 * Milestone Workflow Hooks
 *
 * React Query mutation hooks for milestone lifecycle operations:
 *   - POST /api/milestones/:projectId/:milestoneId/submit  -> useSubmitMilestone()
 *   - POST /api/milestones/:projectId/:milestoneId/accept  -> useAcceptMilestone()
 *   - POST /api/milestones/:projectId/:milestoneId/reject  -> useRejectMilestone()
 *
 * These hooks invalidate the project detail and dashboard queries
 * on success so the UI stays in sync after workflow transitions.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@api/client';
import { projectKeys } from '@hooks/useProjects';

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

interface MilestoneActionResponse {
  projectId: string;
  milestoneId: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const milestoneKeys = {
  all: ['milestones'] as const,
  detail: (projectId: string, milestoneId: string) =>
    [...milestoneKeys.all, projectId, milestoneId] as const,
};

// ---------------------------------------------------------------------------
// useSubmitMilestone
// ---------------------------------------------------------------------------

/** Input for the submit milestone mutation. */
export interface SubmitMilestoneInput {
  projectId: string;
  milestoneId: string;
}

/**
 * Mutation for POST /api/milestones/:projectId/:milestoneId/submit.
 *
 * Used by consultants/developers to submit a milestone for client review.
 * Transitions the milestone from MilestoneInProgress to WaitingClientAcceptSubmission.
 *
 * On success, invalidates the project detail and dashboard queries.
 */
export function useSubmitMilestone() {
  const queryClient = useQueryClient();

  return useMutation<MilestoneActionResponse, Error, SubmitMilestoneInput>({
    mutationFn: async ({ projectId, milestoneId }: SubmitMilestoneInput) => {
      return api.post<MilestoneActionResponse>(
        `/api/milestones/${projectId}/${milestoneId}/submit`
      );
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
      });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: projectKeys.dashboard() });
    },
  });
}

// ---------------------------------------------------------------------------
// useAcceptMilestone
// ---------------------------------------------------------------------------

/** Input for the accept milestone mutation. */
export interface AcceptMilestoneInput {
  projectId: string;
  milestoneId: string;
  comment?: string;
}

/**
 * Mutation for POST /api/milestones/:projectId/:milestoneId/accept.
 *
 * Used by clients to accept delivered milestone work.
 * Transitions the milestone from WaitingClientAcceptSubmission to MilestoneCompleted.
 *
 * On success, invalidates the project detail, list, and dashboard queries.
 */
export function useAcceptMilestone() {
  const queryClient = useQueryClient();

  return useMutation<MilestoneActionResponse, Error, AcceptMilestoneInput>({
    mutationFn: async ({
      projectId,
      milestoneId,
      comment,
    }: AcceptMilestoneInput) => {
      return api.post<MilestoneActionResponse>(
        `/api/milestones/${projectId}/${milestoneId}/accept`,
        { comment }
      );
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
      });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: projectKeys.dashboard() });
    },
  });
}

// ---------------------------------------------------------------------------
// useRejectMilestone
// ---------------------------------------------------------------------------

/** Input for the reject milestone mutation. */
export interface RejectMilestoneInput {
  projectId: string;
  milestoneId: string;
  comment?: string;
}

/**
 * Mutation for POST /api/milestones/:projectId/:milestoneId/reject.
 *
 * Used by clients to reject delivered milestone work.
 * Transitions the milestone from WaitingClientAcceptSubmission
 * to SubmissionRejectedByClient.
 *
 * On success, invalidates the project detail, list, and dashboard queries.
 */
export function useRejectMilestone() {
  const queryClient = useQueryClient();

  return useMutation<MilestoneActionResponse, Error, RejectMilestoneInput>({
    mutationFn: async ({
      projectId,
      milestoneId,
      comment,
    }: RejectMilestoneInput) => {
      return api.post<MilestoneActionResponse>(
        `/api/milestones/${projectId}/${milestoneId}/reject`,
        { comment }
      );
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
      });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: projectKeys.dashboard() });
    },
  });
}

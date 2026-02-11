/**
 * Scope and Proposal Action Hooks
 *
 * React Query mutation hooks for project lifecycle actions:
 *   - POST /api/projects/:id/scope         -> useSubmitScope()
 *   - POST /api/projects/:id/scope/accept  -> useAcceptScope()
 *   - POST /api/projects/:id/scope/reject  -> useRejectScope()
 *
 * Proposal-level approve/reject mutations live in useProjects.ts
 * (useApproveProposal, useRejectProposal) and are re-exported here
 * for convenience.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@api/client';
import { projectKeys } from '@hooks/useProjects';
import type { Milestone } from '@/types/index';

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

interface ScopeActionResponse {
  projectId: string;
  message: string;
}

// ---------------------------------------------------------------------------
// useSubmitScope
// ---------------------------------------------------------------------------

/** Input for the submit scope mutation. */
export interface SubmitScopeInput {
  projectId: string;
  milestones: Milestone[];
  consultantComment?: string;
}

/**
 * Mutation for POST /api/projects/:id/scope.
 *
 * Used by consultants to submit the scope (milestones) for client validation.
 * The milestones are sent directly in the request body rather than being
 * stored in the session, which is the React SPA approach.
 *
 * On success, invalidates the project detail and list queries.
 */
export function useSubmitScope() {
  const queryClient = useQueryClient();

  return useMutation<ScopeActionResponse, Error, SubmitScopeInput>({
    mutationFn: async ({
      projectId,
      milestones,
      consultantComment,
    }: SubmitScopeInput) => {
      return api.post<ScopeActionResponse>(
        `/api/projects/${projectId}/scope`,
        { milestones, consultantComment }
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
// useAcceptScope
// ---------------------------------------------------------------------------

/** Input for the accept scope mutation. */
export interface AcceptScopeInput {
  projectId: string;
  clientResponse?: string;
}

/**
 * Mutation for POST /api/projects/:id/scope/accept.
 *
 * Used by clients to accept the proposed scope. The backend will fetch
 * the milestone IDs internally.
 *
 * On success, invalidates the project detail and list queries.
 */
export function useAcceptScope() {
  const queryClient = useQueryClient();

  return useMutation<ScopeActionResponse, Error, AcceptScopeInput>({
    mutationFn: async ({
      projectId,
      clientResponse,
    }: AcceptScopeInput) => {
      return api.post<ScopeActionResponse>(
        `/api/projects/${projectId}/scope/accept`,
        { clientResponse }
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
// useRejectScope
// ---------------------------------------------------------------------------

/** Input for the reject scope mutation. */
export interface RejectScopeInput {
  projectId: string;
  clientResponse?: string;
}

/**
 * Mutation for POST /api/projects/:id/scope/reject.
 *
 * Used by clients to reject the proposed scope. The project will move
 * back to ScopingInProgress state so the consultant can revise.
 *
 * On success, invalidates the project detail and list queries.
 */
export function useRejectScope() {
  const queryClient = useQueryClient();

  return useMutation<ScopeActionResponse, Error, RejectScopeInput>({
    mutationFn: async ({
      projectId,
      clientResponse,
    }: RejectScopeInput) => {
      return api.post<ScopeActionResponse>(
        `/api/projects/${projectId}/scope/reject`,
        { clientResponse }
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

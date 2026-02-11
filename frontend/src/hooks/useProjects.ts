/**
 * Project Data Hooks
 *
 * React Query hooks wrapping the project API endpoints:
 *   - GET    /api/projects          -> useProjects()
 *   - GET    /api/dashboard         -> useDashboard()
 *   - GET    /api/projects/:id      -> useProject(id)
 *   - POST   /api/projects          -> useCreateProject()
 *   - PUT    /api/projects/:id      -> useUpdateProject()
 *   - POST   /api/projects/:id/approve -> useApproveProposal()
 *   - POST   /api/projects/:id/reject  -> useRejectProposal()
 *
 * These hooks use the typed api helper from @api/client and return
 * strongly typed data matching the Project and User types.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@api/client';
import type {
  Project,
  User,
  ProposalCreateData,
  ProposalUpdateData,
} from '@/types/index';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  dashboard: () => ['dashboard'] as const,
};

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

/** Shape returned by GET /api/projects (after unwrapping { success, data }). */
interface ProjectsResponse {
  projects: Project[];
}

/** Shape returned by GET /api/dashboard (after unwrapping { success, data }). */
export interface DashboardResponse {
  user: User;
  projects: Project[];
  projectsByState: Record<string, Project[]>;
}

/** Shape returned by GET /api/projects/:id (after unwrapping). */
export interface ProjectDetailResponse {
  project: Project;
  allBudgets: Array<{ id: number; description: string }>;
  allDeliveryTimes: Array<{ id: number; description: string }>;
  allProjectTypes: Array<{ id: number; description: string }>;
}

/** Shape returned by POST /api/projects (after unwrapping). */
interface CreateProjectResponse {
  projectId: string;
}

/** Shape returned by PUT /api/projects/:id (after unwrapping). */
interface UpdateProjectResponse {
  projectId: string;
}

/** Shape returned by POST /api/projects/:id/approve (after unwrapping). */
interface ApproveProposalResponse {
  projectId: string;
  message: string;
}

/** Shape returned by POST /api/projects/:id/reject (after unwrapping). */
interface RejectProposalResponse {
  projectId: string;
  message: string;
}

// ---------------------------------------------------------------------------
// useProjects
// ---------------------------------------------------------------------------

/**
 * Fetches all projects for the authenticated user from GET /api/projects.
 *
 * Projects are returned in reverse chronological order (newest first),
 * matching the behavior of the EJS dashboard.
 */
export function useProjects() {
  return useQuery<Project[]>({
    queryKey: projectKeys.lists(),
    queryFn: async () => {
      const response = await api.get<ProjectsResponse>('/api/projects');
      return response.projects;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ---------------------------------------------------------------------------
// useDashboard
// ---------------------------------------------------------------------------

/**
 * Fetches dashboard data from GET /api/dashboard.
 *
 * Returns the authenticated user info, all their projects, and projects
 * grouped by state for display in the dashboard overview.
 */
export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: projectKeys.dashboard(),
    queryFn: async () => {
      return api.get<DashboardResponse>('/api/dashboard');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ---------------------------------------------------------------------------
// useProject
// ---------------------------------------------------------------------------

/**
 * Fetches a single project with full details from GET /api/projects/:id.
 *
 * The response includes the project with milestones, client, consultant,
 * and the enum reference data (budgets, delivery times, project types).
 *
 * @param id - The project ID to fetch. When undefined, the query is disabled.
 */
export function useProject(id: string | undefined) {
  return useQuery<ProjectDetailResponse>({
    queryKey: projectKeys.detail(id ?? ''),
    queryFn: async () => {
      return api.get<ProjectDetailResponse>(`/api/projects/${id}`);
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

// ---------------------------------------------------------------------------
// useCreateProject
// ---------------------------------------------------------------------------

/**
 * Mutation for POST /api/projects.
 *
 * Creates a new project proposal. Only clients can create proposals.
 * On success, invalidates the projects list and dashboard queries
 * so they refetch with the new project included.
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation<CreateProjectResponse, Error, ProposalCreateData>({
    mutationFn: async (data: ProposalCreateData) => {
      return api.post<CreateProjectResponse>('/api/projects', data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: projectKeys.dashboard() });
    },
  });
}

// ---------------------------------------------------------------------------
// useUpdateProject
// ---------------------------------------------------------------------------

/** Input for the update mutation: project ID + partial proposal data. */
interface UpdateProjectInput {
  id: string;
  data: ProposalUpdateData;
}

/**
 * Mutation for PUT /api/projects/:id.
 *
 * Updates an existing project proposal. On success, invalidates the
 * project detail, projects list, and dashboard queries.
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation<UpdateProjectResponse, Error, UpdateProjectInput>({
    mutationFn: async ({ id, data }: UpdateProjectInput) => {
      return api.put<UpdateProjectResponse>(`/api/projects/${id}`, data);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.id),
      });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: projectKeys.dashboard() });
    },
  });
}

// ---------------------------------------------------------------------------
// useApproveProposal
// ---------------------------------------------------------------------------

/**
 * Mutation for POST /api/projects/:id/approve.
 *
 * Used by consultants to approve a client's project proposal.
 * On success, invalidates the relevant queries.
 */
export function useApproveProposal() {
  const queryClient = useQueryClient();

  return useMutation<ApproveProposalResponse, Error, string>({
    mutationFn: async (projectId: string) => {
      return api.post<ApproveProposalResponse>(
        `/api/projects/${projectId}/approve`
      );
    },
    onSuccess: (_data, projectId) => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: projectKeys.dashboard() });
    },
  });
}

// ---------------------------------------------------------------------------
// useRejectProposal
// ---------------------------------------------------------------------------

/** Input for the reject mutation: project ID + optional rejection reason. */
interface RejectProposalInput {
  projectId: string;
  proposalRejectionReason?: string;
}

/**
 * Mutation for POST /api/projects/:id/reject.
 *
 * Used by consultants to reject a client's project proposal.
 * On success, invalidates the relevant queries.
 */
export function useRejectProposal() {
  const queryClient = useQueryClient();

  return useMutation<RejectProposalResponse, Error, RejectProposalInput>({
    mutationFn: async ({ projectId, proposalRejectionReason }: RejectProposalInput) => {
      return api.post<RejectProposalResponse>(
        `/api/projects/${projectId}/reject`,
        { proposalRejectionReason }
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

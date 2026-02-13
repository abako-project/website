/**
 * DashboardPage - Main dashboard view
 *
 * Displays the authenticated user's projects grouped by their flow state.
 * The layout adapts based on the user's role (client vs developer):
 *   - Clients see a "New Project" button and client-centric state labels.
 *   - Developers see tabs for Projects/Milestones (future) and developer-centric labels.
 *
 * Data is fetched via the useDashboard() hook which calls GET /api/dashboard.
 * Project flow states are computed using flowProjectState() from lib/flowStates.ts.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { useDashboard } from '@hooks/useProjects';
import { flowProjectState, ProjectState } from '@lib/flowStates';
import type { Project } from '@/types/index';
import type { ProjectStateValue } from '@lib/flowStates';
import { Spinner } from '@components/ui/Spinner';
import { Button } from '@components/ui/Button';
import { Card, CardContent } from '@components/ui/Card';
import { EmptyState } from '@components/shared/EmptyState';
import { ProjectStateBadge } from '@components/shared/ProjectStateBadge';

// ---------------------------------------------------------------------------
// State group ordering and metadata
// ---------------------------------------------------------------------------

/**
 * Defines the display order for state groups on the dashboard.
 * Active/urgent states come first, completed/error states come last.
 */
const STATE_GROUP_ORDER: ProjectStateValue[] = [
  ProjectState.WaitingForProposalApproval,
  ProjectState.ScopeValidationNeeded,
  ProjectState.ProjectInProgress,
  ProjectState.ScopingInProgress,
  ProjectState.WaitingForTeamAssigment,
  ProjectState.ProposalPending,
  ProjectState.ScopeRejected,
  ProjectState.ProposalRejected,
  ProjectState.PaymentReleased,
  ProjectState.Completed,
  ProjectState.CreationError,
  ProjectState.Invalid,
];

/** Human-readable titles for each state group section. */
const STATE_GROUP_TITLES: Record<ProjectStateValue, string> = {
  [ProjectState.CreationError]: 'Creation Errors',
  [ProjectState.ProposalPending]: 'Proposals Pending Review',
  [ProjectState.WaitingForProposalApproval]: 'Awaiting Proposal Approval',
  [ProjectState.ProposalRejected]: 'Rejected Proposals',
  [ProjectState.ScopingInProgress]: 'Scoping In Progress',
  [ProjectState.ScopeValidationNeeded]: 'Scope Validation Needed',
  [ProjectState.ScopeRejected]: 'Scope Rejected',
  [ProjectState.WaitingForTeamAssigment]: 'Awaiting Team Assignment',
  [ProjectState.ProjectInProgress]: 'Projects In Progress',
  [ProjectState.PaymentReleased]: 'Payment Released',
  [ProjectState.Completed]: 'Completed Projects',
  [ProjectState.Invalid]: 'Other',
};

/** Icons for each state group section (Remixicon classes). */
const STATE_GROUP_ICONS: Record<ProjectStateValue, string> = {
  [ProjectState.CreationError]: 'ri-error-warning-line',
  [ProjectState.ProposalPending]: 'ri-time-line',
  [ProjectState.WaitingForProposalApproval]: 'ri-file-search-line',
  [ProjectState.ProposalRejected]: 'ri-close-circle-line',
  [ProjectState.ScopingInProgress]: 'ri-draft-line',
  [ProjectState.ScopeValidationNeeded]: 'ri-checkbox-circle-line',
  [ProjectState.ScopeRejected]: 'ri-close-circle-line',
  [ProjectState.WaitingForTeamAssigment]: 'ri-team-line',
  [ProjectState.ProjectInProgress]: 'ri-rocket-line',
  [ProjectState.PaymentReleased]: 'ri-money-dollar-circle-line',
  [ProjectState.Completed]: 'ri-check-double-line',
  [ProjectState.Invalid]: 'ri-question-line',
};

// ---------------------------------------------------------------------------
// Dashboard Page Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isClient = !!user?.clientId;

  const { data, isLoading, isError, error } = useDashboard();

  // Group projects by their computed flow state (client-side computation
  // gives us accurate grouping using flowProjectState).
  const groupedProjects = useMemo(() => {
    if (!data?.projects) return new Map<ProjectStateValue, Project[]>();

    const groups = new Map<ProjectStateValue, Project[]>();

    for (const project of data.projects) {
      const state = flowProjectState(project);
      const existing = groups.get(state);
      if (existing) {
        existing.push(project);
      } else {
        groups.set(state, [project]);
      }
    }

    return groups;
  }, [data?.projects]);

  // Ordered list of state groups that have projects.
  const orderedGroups = useMemo(() => {
    return STATE_GROUP_ORDER.filter((state) => groupedProjects.has(state));
  }, [groupedProjects]);

  // Total project count for the header.
  const totalProjects = data?.projects.length ?? 0;

  // ------- Loading state -------
  if (isLoading) {
    return (
      <div className="px-8 lg:px-[var(--spacing-22,112px)] py-10">
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // ------- Error state -------
  if (isError) {
    return (
      <div className="px-8 lg:px-[var(--spacing-22,112px)] py-10">
        <div className="mb-8">
          <h1 className="text-[30px] font-bold leading-[42px] text-[var(--text-dark-primary,#f5f5f5)] mb-2">Dashboard</h1>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/15 flex items-center justify-center">
              <i className="ri-error-warning-line text-2xl text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-dark-primary,#f5f5f5)] mb-2">
              Failed to load dashboard
            </h2>
            <p className="text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] mb-4">
              {error?.message || 'An unexpected error occurred.'}
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ------- Empty state -------
  if (totalProjects === 0) {
    return (
      <div className="px-8 lg:px-[var(--spacing-22,112px)] py-10">
        <DashboardHeader
          isClient={isClient}
          totalProjects={0}
          onNewProject={() => navigate('/projects/new')}
        />
        <EmptyState
          icon="ri-folder-line"
          title="No projects yet"
          description={
            isClient
              ? 'Create your first project proposal to get started with Work3Spaces.'
              : 'You have not been assigned to any projects yet. Projects will appear here once you are assigned as a consultant or developer.'
          }
          action={
            isClient
              ? {
                  label: 'New Project',
                  onClick: () => navigate('/projects/new'),
                }
              : undefined
          }
        />
      </div>
    );
  }

  // ------- Main dashboard -------
  return (
    <div className="px-8 lg:px-[var(--spacing-22,112px)] py-10">
      <DashboardHeader
        isClient={isClient}
        totalProjects={totalProjects}
        onNewProject={() => navigate('/projects/new')}
      />

      <div className="space-y-8">
        {orderedGroups.map((state) => {
          const projects = groupedProjects.get(state);
          if (!projects || projects.length === 0) return null;

          return (
            <StateGroupSection
              key={state}
              state={state}
              projects={projects}
              onProjectClick={(id) => navigate(`/projects/${id}`)}
              isClient={isClient}
            />
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard Header
// ---------------------------------------------------------------------------

interface DashboardHeaderProps {
  isClient: boolean;
  totalProjects: number;
  onNewProject: () => void;
}

function DashboardHeader({
  isClient,
  totalProjects,
  onNewProject,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-[30px] font-bold leading-[42px] text-[var(--text-dark-primary,#f5f5f5)] mb-1">Dashboard</h1>
        <p className="text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">
          {totalProjects === 0
            ? 'Your project overview'
            : `${totalProjects} project${totalProjects === 1 ? '' : 's'} total`}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {isClient && (
          <Button onClick={onNewProject}>
            <i className="ri-add-line mr-2" />
            New Project
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// State Group Section
// ---------------------------------------------------------------------------

interface StateGroupSectionProps {
  state: ProjectStateValue;
  projects: Project[];
  onProjectClick: (id: string) => void;
  isClient: boolean;
}

function StateGroupSection({
  state,
  projects,
  onProjectClick,
  isClient,
}: StateGroupSectionProps) {
  const title = STATE_GROUP_TITLES[state];
  const icon = STATE_GROUP_ICONS[state];

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <i className={`${icon} text-lg text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]`} />
        <h2 className="text-lg font-semibold text-[var(--text-dark-primary,#f5f5f5)]">{title}</h2>
        <span className="ml-1 text-sm text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">
          ({projects.length})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => onProjectClick(project.id)}
            isClient={isClient}
          />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Project Card
// ---------------------------------------------------------------------------

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  isClient: boolean;
}

function ProjectCard({ project, onClick, isClient }: ProjectCardProps) {
  // Resolve display names for client and consultant/developer.
  const clientName = project.client?.name ?? 'No client';
  const consultantName = project.consultant?.name ?? 'Unassigned';

  // Resolve budget and delivery time display values.
  // These may be stored as numeric indices or as descriptive strings.
  const budgetDisplay =
    typeof project.budget === 'number'
      ? `Budget tier ${project.budget}`
      : project.budget ?? '--';

  const deliveryTimeDisplay =
    typeof project.deliveryTime === 'number'
      ? `Delivery tier ${project.deliveryTime}`
      : project.deliveryTime ?? '--';

  return (
    <Card
      className="cursor-pointer hover:border-[var(--state-brand-active,#36d399)]/40 transition-colors group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        {/* Title and badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-[var(--text-dark-primary,#f5f5f5)] leading-snug line-clamp-2 group-hover:text-[var(--state-brand-active,#36d399)] transition-colors">
            {project.title}
          </h3>
          <ProjectStateBadge project={project} className="shrink-0" />
        </div>

        {/* Users */}
        <div className="flex items-center gap-4 mb-4 text-sm text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">
          {isClient ? (
            <div className="flex items-center gap-1.5">
              <i className="ri-user-star-line text-base" />
              <span className="truncate max-w-[140px]">{consultantName}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <i className="ri-user-line text-base" />
              <span className="truncate max-w-[140px]">{clientName}</span>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">
          <div className="flex items-center gap-1.5">
            <i className="ri-money-dollar-circle-line text-base" />
            <span className="truncate">{budgetDisplay}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <i className="ri-time-line text-base" />
            <span className="truncate">{deliveryTimeDisplay}</span>
          </div>
        </div>

        {/* Milestones count */}
        {project.milestones.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[var(--base-border,#3d3d3d)] flex items-center gap-1.5 text-sm text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">
            <i className="ri-list-check-2 text-base" />
            <span>
              {project.milestones.length} milestone
              {project.milestones.length === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

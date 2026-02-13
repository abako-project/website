/**
 * ProjectsPage - Projects list view
 *
 * Displays all projects for the authenticated user in a CardWidget grid layout
 * matching the Figma design (117:9363).
 *
 * Features:
 *   - Filter by project state
 *   - CardWidget grid view with badges + progress
 *   - "New Project" button (visible to clients only)
 *   - Click a card to navigate to /projects/:id
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { useProjects } from '@hooks/useProjects';
import { flowProjectState, ProjectState } from '@lib/flowStates';
import type { Project } from '@/types/index';
import type { ProjectStateValue } from '@lib/flowStates';
import { Spinner } from '@components/ui/Spinner';
import { Button } from '@components/ui/Button';
import { Card, CardContent } from '@components/ui/Card';
import { EmptyState } from '@components/shared/EmptyState';
import { ProjectStateBadge } from '@components/shared/ProjectStateBadge';

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

interface FilterOption {
  value: 'all' | ProjectStateValue;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All States' },
  { value: ProjectState.ProposalPending, label: 'Proposal Pending' },
  { value: ProjectState.WaitingForProposalApproval, label: 'Awaiting Approval' },
  { value: ProjectState.ScopingInProgress, label: 'Scoping' },
  { value: ProjectState.ScopeValidationNeeded, label: 'Scope Validation' },
  { value: ProjectState.ProjectInProgress, label: 'In Progress' },
  { value: ProjectState.WaitingForTeamAssigment, label: 'Awaiting Team' },
  { value: ProjectState.Completed, label: 'Completed' },
  { value: ProjectState.ProposalRejected, label: 'Rejected' },
  { value: ProjectState.PaymentReleased, label: 'Payment Released' },
];

// ---------------------------------------------------------------------------
// Projects Page Component
// ---------------------------------------------------------------------------

export default function ProjectsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isClient = !!user?.clientId;

  const { data: projects, isLoading, isError, error } = useProjects();

  // Filter state
  const [stateFilter, setStateFilter] = useState<'all' | ProjectStateValue>('all');

  // Compute flow state for each project and filter
  const processedProjects = useMemo(() => {
    if (!projects) return [];

    // Annotate projects with their computed flow state
    const annotated = projects.map((project) => ({
      project,
      flowState: flowProjectState(project),
    }));

    // Apply state filter
    const filtered =
      stateFilter === 'all'
        ? annotated
        : annotated.filter((item) => item.flowState === stateFilter);

    return filtered;
  }, [projects, stateFilter]);

  // ------- Loading state -------
  if (isLoading) {
    return (
      <div className="px-8 lg:px-[var(--spacing-22,112px)] py-10">
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">Loading projects...</p>
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
          <h1 className="text-3xl font-bold text-[var(--text-dark-primary,#f5f5f5)] mb-2">Projects</h1>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/15 flex items-center justify-center">
              <i className="ri-error-warning-line text-2xl text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-dark-primary,#f5f5f5)] mb-2">
              Failed to load projects
            </h2>
            <p className="text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] mb-4">
              {error?.message || 'An unexpected error occurred.'}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ------- Empty state (no projects at all) -------
  if (!projects || projects.length === 0) {
    return (
      <div className="px-8 lg:px-[var(--spacing-22,112px)] py-10">
        <PageHeader
          isClient={isClient}
          onNewProject={() => navigate('/projects/new')}
        />
        <EmptyState
          icon="ri-folder-line"
          title="No projects yet"
          description={
            isClient
              ? 'Create your first project proposal to get started.'
              : 'Projects will appear here once you are assigned as a consultant or developer.'
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

  // ------- Main projects list -------
  return (
    <div className="min-h-screen bg-[var(--base-surface-1,#141414)]">
      {/* Header section */}
      <div className="bg-[var(--base-surface-2,#231f1f)] border-b border-[var(--base-border,#3d3d3d)] px-8 lg:px-[var(--spacing-22,112px)] pt-[var(--spacing-12,32px)] pb-[var(--spacing-8,16px)]">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          {/* Left column: Title + subtitle + learn more link */}
          <div className="flex-1">
            <h1 className="text-[30px] font-bold leading-[42px] text-[var(--text-dark-primary,#f5f5f5)] mb-1" style={{ fontFamily: 'Inter' }}>
              Projects
            </h1>
            <p className="text-base text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] mb-2" style={{ fontFamily: 'Inter' }}>
              Find out the progress your projects, documents, milestones and the latest activities.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-base font-semibold text-[var(--state-brand-active,#36d399)] hover:underline"
              style={{ fontFamily: 'Inter' }}
            >
              Learn more about projects
              <i className="ri-arrow-right-s-line" />
            </a>
          </div>

          {/* Right: New Project button */}
          {isClient && (
            <button
              onClick={() => navigate('/projects/new')}
              className="flex items-center justify-center gap-2 h-11 px-6 bg-[var(--state-brand-active,#36d399)] rounded-[var(--radi-6,12px)] border border-[var(--colors-alpha-dark-200,rgba(255,255,255,0.12))] hover:shadow-lg transition-shadow"
            >
              <i className="ri-add-line text-lg text-[var(--text-light-primary,#141414)]" />
              <span className="text-lg font-semibold text-[var(--text-light-primary,#141414)]" style={{ fontFamily: 'Inter' }}>
                New Project
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="px-8 lg:px-[var(--spacing-22,112px)] py-10">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="state-filter" className="text-sm text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">
              Filter by state:
            </label>
            <select
              id="state-filter"
              value={stateFilter}
              onChange={(e) =>
                setStateFilter(e.target.value as 'all' | ProjectStateValue)
              }
              className="h-9 rounded-md border border-[var(--base-border,#3d3d3d)] bg-[var(--base-surface-2,#231f1f)] px-3 text-sm text-[var(--text-dark-primary,#f5f5f5)] focus:outline-none focus:ring-2 focus:ring-[var(--state-brand-active,#36d399)]"
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <span className="text-sm text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] ml-auto">
            {processedProjects.length} of {projects.length} project
            {projects.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Empty filtered results */}
        {processedProjects.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">
              No projects match the selected filter.
            </p>
            <Button
              variant="ghost"
              className="mt-3"
              onClick={() => setStateFilter('all')}
            >
              Clear Filter
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {processedProjects.map(({ project }) => (
              <ProjectCardWidget
                key={project.id}
                project={project}
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Header (for empty state only)
// ---------------------------------------------------------------------------

interface PageHeaderProps {
  isClient: boolean;
  onNewProject: () => void;
}

function PageHeader({ isClient, onNewProject }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-dark-primary,#f5f5f5)] mb-1">Projects</h1>
        <p className="text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">Browse and manage your projects</p>
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
// Project Card Widget (Figma CardWidget pattern)
// ---------------------------------------------------------------------------

interface ProjectCardWidgetProps {
  project: Project;
  onClick: () => void;
}

function ProjectCardWidget({ project, onClick }: ProjectCardWidgetProps) {
  // Calculate progress percentage (mock data for now)
  const progress = calculateProjectProgress(project);
  const pendingTasksCount = calculatePendingTasks(project);

  return (
    <div
      className="bg-[var(--base-surface-2,#231f1f)] border border-[var(--base-border,#3d3d3d)] rounded-[var(--radi-6,12px)] p-[var(--spacing-10,24px)] cursor-pointer hover:border-[var(--state-brand-active,#36d399)]/40 transition-colors shadow-[0.5px_0.5px_3px_rgba(255,255,255,0.08)]"
      onClick={onClick}
    >
      {/* Top row: badges */}
      <div className="flex items-center justify-between mb-4">
        {/* Left badge: pending tasks (success style) */}
        {pendingTasksCount > 0 && (
          <span className="inline-flex items-center px-3 py-1 bg-[var(--state-success-active,#85efac)] text-[var(--text-light-primary,#141414)] text-base font-semibold rounded-[var(--radi-6,12px)]" style={{ fontFamily: 'Inter' }}>
            {pendingTasksCount} Pending Task{pendingTasksCount !== 1 ? 's' : ''}
          </span>
        )}

        {/* Right badge: state */}
        <div className="ml-auto">
          <ProjectStateBadge project={project} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-semibold leading-[38px] text-[var(--text-dark-primary,#f5f5f5)] mb-4 line-clamp-2" style={{ fontFamily: 'Inter' }}>
        {project.title}
      </h3>

      {/* Progress segmented bar */}
      <ProgressSegmented percentage={progress} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress Segmented Component
// ---------------------------------------------------------------------------

interface ProgressSegmentedProps {
  percentage: number;
}

function ProgressSegmented({ percentage }: ProgressSegmentedProps) {
  const segments = 10;
  const filledSegments = Math.round((percentage / 100) * segments);

  return (
    <div className="space-y-2">
      <div className="flex gap-[var(--spacing-5,8px)]">
        {Array.from({ length: segments }).map((_, index) => (
          <div
            key={index}
            className={`h-3 flex-1 rounded-[var(--radi-2,4px)] ${
              index < filledSegments
                ? 'bg-[var(--state-brand-active,#36d399)]'
                : 'bg-[var(--base-fill-2,#3d3d3d)]'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-end">
        <span className="text-base font-medium text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]" style={{ fontFamily: 'Inter' }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Calculate project progress percentage based on milestones.
 * Returns a value between 0 and 100.
 */
function calculateProjectProgress(project: Project): number {
  if (!project.milestones || project.milestones.length === 0) {
    return 0;
  }

  const completedMilestones = project.milestones.filter(
    (m) => m.state === 'completed' || m.state === 'paid'
  ).length;

  return Math.round((completedMilestones / project.milestones.length) * 100);
}

/**
 * Calculate the number of pending tasks/milestones.
 */
function calculatePendingTasks(project: Project): number {
  if (!project.milestones || project.milestones.length === 0) {
    return 0;
  }

  return project.milestones.filter(
    (m) => m.state === 'task_in_progress' || m.state === 'in_review'
  ).length;
}

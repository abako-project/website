/**
 * ProjectsPage - Projects list view
 *
 * Displays all projects for the authenticated user in a responsive layout:
 *   - Desktop: table view with sortable columns
 *   - Mobile: card grid view
 *
 * Features:
 *   - Filter by project state
 *   - Sort by title or state
 *   - "New Project" button (visible to clients only)
 *   - Click a row/card to navigate to /projects/:id
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
// Sort options
// ---------------------------------------------------------------------------

type SortField = 'title' | 'state';
type SortDirection = 'asc' | 'desc';

// ---------------------------------------------------------------------------
// Projects Page Component
// ---------------------------------------------------------------------------

export default function ProjectsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isClient = !!user?.clientId;

  const { data: projects, isLoading, isError, error } = useProjects();

  // Filter and sort state
  const [stateFilter, setStateFilter] = useState<'all' | ProjectStateValue>('all');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Compute flow state for each project and filter/sort
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

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = a.project.title.localeCompare(b.project.title);
      } else if (sortField === 'state') {
        comparison = a.flowState.localeCompare(b.flowState);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [projects, stateFilter, sortField, sortDirection]);

  // Toggle sort direction when clicking the same column header
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort indicator icon
  const sortIcon = (field: SortField) => {
    if (sortField !== field) return 'ri-arrow-up-down-line';
    return sortDirection === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line';
  };

  // ------- Loading state -------
  if (isLoading) {
    return (
      <div className="px-8 lg:px-14 py-10">
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  // ------- Error state -------
  if (isError) {
    return (
      <div className="px-8 lg:px-14 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/15 flex items-center justify-center">
              <i className="ri-error-warning-line text-2xl text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Failed to load projects
            </h2>
            <p className="text-muted-foreground mb-4">
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
      <div className="px-8 lg:px-14 py-10">
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
    <div className="px-8 lg:px-14 py-10">
      <PageHeader
        isClient={isClient}
        onNewProject={() => navigate('/projects/new')}
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="state-filter" className="text-sm text-muted-foreground">
            Filter by state:
          </label>
          <select
            id="state-filter"
            value={stateFilter}
            onChange={(e) =>
              setStateFilter(e.target.value as 'all' | ProjectStateValue)
            }
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <span className="text-sm text-muted-foreground ml-auto">
          {processedProjects.length} of {projects.length} project
          {projects.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Empty filtered results */}
      {processedProjects.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
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
        <>
          {/* Desktop table view */}
          <div className="hidden lg:block">
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="text-left px-4 py-3">
                      <button
                        type="button"
                        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => handleSort('title')}
                      >
                        Title
                        <i className={`${sortIcon('title')} text-xs`} />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3">
                      <button
                        type="button"
                        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => handleSort('state')}
                      >
                        State
                        <i className={`${sortIcon('state')} text-xs`} />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      {isClient ? 'Consultant' : 'Client'}
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Budget
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Delivery Time
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {processedProjects.map(({ project }) => (
                    <ProjectTableRow
                      key={project.id}
                      project={project}
                      isClient={isClient}
                      onClick={() => navigate(`/projects/${project.id}`)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card view */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {processedProjects.map(({ project }) => (
              <ProjectCardMobile
                key={project.id}
                project={project}
                isClient={isClient}
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Header
// ---------------------------------------------------------------------------

interface PageHeaderProps {
  isClient: boolean;
  onNewProject: () => void;
}

function PageHeader({ isClient, onNewProject }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Projects</h1>
        <p className="text-muted-foreground">Browse and manage your projects</p>
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
// Project Table Row (Desktop)
// ---------------------------------------------------------------------------

interface ProjectTableRowProps {
  project: Project;
  isClient: boolean;
  onClick: () => void;
}

function ProjectTableRow({ project, isClient, onClick }: ProjectTableRowProps) {
  const personName = isClient
    ? project.consultant?.name ?? 'Unassigned'
    : project.client?.name ?? 'No client';

  const budgetDisplay =
    typeof project.budget === 'number'
      ? `Budget tier ${project.budget}`
      : project.budget ?? '--';

  const deliveryTimeDisplay =
    typeof project.deliveryTime === 'number'
      ? `Delivery tier ${project.deliveryTime}`
      : project.deliveryTime ?? '--';

  return (
    <tr
      className="border-b border-border last:border-b-0 hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-4 py-3">
        <span className="text-sm font-medium text-foreground line-clamp-1">
          {project.title}
        </span>
      </td>
      <td className="px-4 py-3">
        <ProjectStateBadge project={project} />
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">{personName}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">{budgetDisplay}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">
          {deliveryTimeDisplay}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View
          <i className="ri-arrow-right-s-line ml-1" />
        </Button>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Project Card (Mobile)
// ---------------------------------------------------------------------------

interface ProjectCardMobileProps {
  project: Project;
  isClient: boolean;
  onClick: () => void;
}

function ProjectCardMobile({ project, isClient, onClick }: ProjectCardMobileProps) {
  const personName = isClient
    ? project.consultant?.name ?? 'Unassigned'
    : project.client?.name ?? 'No client';

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
      className="cursor-pointer hover:border-primary/40 transition-colors group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        {/* Title and badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <ProjectStateBadge project={project} className="shrink-0" />
        </div>

        {/* Person */}
        <div className="flex items-center gap-1.5 mb-3 text-sm text-muted-foreground">
          <i className={isClient ? 'ri-user-star-line' : 'ri-user-line'} />
          <span className="truncate">{personName}</span>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <i className="ri-money-dollar-circle-line" />
            <span>{budgetDisplay}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <i className="ri-time-line" />
            <span>{deliveryTimeDisplay}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ProjectDetailPage - Single project detail view
 *
 * Displays the complete project information including:
 * - Project header with title, summary, state badge
 * - Client and consultant info
 * - Project scope: description, delivery time, budget, project type
 * - Milestones list with individual states
 * - Action panel based on project state and user role
 * - Scope builder for consultants when in scoping state
 *
 * Mirrors the EJS views:
 * - projects/showProjectInformation.ejs
 * - projects/headers/_project.ejs
 * - proposals/info/_bodyProposals.ejs
 * - milestones/info/_showMilestones.ejs
 * - projects/actions/body/_all.ejs
 */

import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '@hooks/useProjects';
import { useAuthStore } from '@stores/authStore';
import { flowProjectState, ProjectState } from '@lib/flowStates';
import { Spinner } from '@components/ui';
import { ProjectStateBadge } from '@components/shared/ProjectStateBadge';
import { ProjectActions } from '@components/features/projects/ProjectActions';
import { ScopeBuilder } from '@components/features/projects/ScopeBuilder';
import { MilestoneList } from '@components/features/milestones/MilestoneList';
import type { Project } from '@/types/index';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error, refetch } = useProject(id);

  const [showScopeBuilder, setShowScopeBuilder] = useState(false);

  const handleScopeBuilderShow = useCallback(() => {
    setShowScopeBuilder(true);
  }, []);

  const handleScopeSubmitted = useCallback(() => {
    setShowScopeBuilder(false);
    void refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-[#9B9B9B]">Loading project...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="px-8 lg:px-14 py-10">
        <div className="max-w-2xl mx-auto p-8 rounded-xl bg-[#231F1F] border border-red-500/30 text-center">
          <i className="ri-error-warning-line text-4xl text-red-400 mb-3 block" />
          <h2 className="text-xl font-bold text-[#F5F5F5] mb-2">
            Failed to load project
          </h2>
          <p className="text-[#9B9B9B] mb-4">
            {error?.message ?? 'Project not found or you do not have access.'}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => void refetch()}
              className="px-4 py-2 rounded-lg bg-[#36D399] text-[#141414] font-medium hover:shadow-lg transition-shadow"
            >
              Retry
            </button>
            <Link
              to="/projects"
              className="px-4 py-2 rounded-lg border border-[#3D3D3D] text-[#9B9B9B] hover:border-[#555] transition-colors"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { project, allBudgets, allDeliveryTimes, allProjectTypes } = data;
  const projectState = flowProjectState(project);

  // Determine if the scope builder should be accessible
  const isConsultant =
    !!user?.developerId && user.developerId === project.consultantId;
  const canShowScopeBuilder =
    isConsultant &&
    (projectState === ProjectState.ScopingInProgress ||
      projectState === ProjectState.ScopeRejected);

  return (
    <div className="px-8 lg:px-14 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-[#9B9B9B]">
        <Link to="/projects" className="hover:text-[#F5F5F5] transition-colors">
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#F5F5F5]">{project.title}</span>
      </nav>

      {/* Project Header */}
      <ProjectHeader
        project={project}
        allBudgets={allBudgets}
        allDeliveryTimes={allDeliveryTimes}
        allProjectTypes={allProjectTypes}
      />

      {/* Main content grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Project info + Milestones */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Scope / Description */}
          <ProjectScopeInfo
            project={project}
            allBudgets={allBudgets}
            allDeliveryTimes={allDeliveryTimes}
            allProjectTypes={allProjectTypes}
          />

          {/* Scope Builder (shown inline when active) */}
          {canShowScopeBuilder && showScopeBuilder && (
            <ScopeBuilder
              projectId={project.id}
              existingMilestones={
                project.milestones.length > 0
                  ? project.milestones
                  : undefined
              }
              onSubmitted={handleScopeSubmitted}
              onCancel={() => setShowScopeBuilder(false)}
            />
          )}

          {/* Milestones */}
          {project.milestones.length > 0 && (
            <MilestoneList
              milestones={project.milestones}
              allDeliveryTimes={allDeliveryTimes}
            />
          )}
        </div>

        {/* Right column: Actions */}
        <div className="space-y-6">
          {user && (
            <ProjectActions
              project={project}
              user={user}
              onShowScopeBuilder={
                canShowScopeBuilder ? handleScopeBuilderShow : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * ProjectHeader - Title, summary, client info, state badge.
 * Mirrors projects/headers/_project.ejs.
 */
function ProjectHeader({
  project,
  allBudgets: _allBudgets,
  allDeliveryTimes: _allDeliveryTimes,
  allProjectTypes: _allProjectTypes,
}: {
  project: Project;
  allBudgets: Array<{ id: number; description: string }>;
  allDeliveryTimes: Array<{ id: number; description: string }>;
  allProjectTypes: Array<{ id: number; description: string }>;
}) {
  return (
    <div className="rounded-xl border border-[#3D3D3D] bg-[#231F1F] p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Left: Title + summary */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-2xl font-bold text-[#F5F5F5]">
              {project.title}
            </h1>
            <ProjectStateBadge project={project} />
          </div>
          {project.summary && (
            <p className="text-sm text-[#9B9B9B] max-w-2xl">
              {project.summary}
            </p>
          )}
        </div>

        {/* Right: Client info */}
        {project.client && (
          <div className="flex items-center gap-3 shrink-0">
            <img
              className="h-10 w-10 rounded-full object-cover border border-[#3D3D3D]"
              src={`/clients/${project.clientId}/attachment`}
              alt={project.client.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/none.png';
              }}
            />
            <div>
              <p className="text-sm font-medium text-[#F5F5F5]">
                {project.client.name}
              </p>
              {project.client.website && (
                <p className="text-xs text-[#9B9B9B] flex items-center gap-1">
                  <i className="ri-global-fill" />
                  {project.client.website}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Consultant info (if assigned) */}
      {project.consultant && (
        <div className="mt-4 pt-4 border-t border-[#3D3D3D] flex items-center gap-3">
          <img
            className="h-8 w-8 rounded-full object-cover border border-[#3D3D3D]"
            src={`/developers/${project.consultantId}/attachment`}
            alt={project.consultant.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/none.png';
            }}
          />
          <div>
            <p className="text-xs text-[#9B9B9B]">Project Consultant</p>
            <p className="text-sm font-medium text-[#F5F5F5]">
              {project.consultant.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ProjectScopeInfo - Project description, delivery time, budget, project type.
 * Mirrors proposals/info/_bodyProposals.ejs.
 */
function ProjectScopeInfo({
  project,
  allBudgets,
  allDeliveryTimes,
  allProjectTypes,
}: {
  project: Project;
  allBudgets: Array<{ id: number; description: string }>;
  allDeliveryTimes: Array<{ id: number; description: string }>;
  allProjectTypes: Array<{ id: number; description: string }>;
}) {
  // Resolve enum values to descriptions
  const budgetLabel = resolveEnumLabel(project.budget, allBudgets);
  const deliveryTimeLabel = resolveEnumLabel(
    project.deliveryTime,
    allDeliveryTimes
  );
  const projectTypeLabel = resolveEnumLabel(
    project.projectType,
    allProjectTypes
  );

  return (
    <div className="rounded-xl border border-[#3D3D3D] bg-[#231F1F] p-6">
      <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">
        Project Scope
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Delivery Time */}
        <div>
          <h6 className="text-xs font-medium text-[#9B9B9B] uppercase tracking-wider mb-1">
            Delivery Time
          </h6>
          <p className="text-sm text-[#F5F5F5]">
            {deliveryTimeLabel}
          </p>
          {project.deliveryTime !== undefined &&
            String(project.deliveryTime) === '3' &&
            project.deliveryDate && (
              <p className="text-xs text-[#9B9B9B] mt-0.5">
                ({new Date(project.deliveryDate).toLocaleDateString()})
              </p>
            )}
        </div>

        {/* Budget */}
        <div>
          <h6 className="text-xs font-medium text-[#9B9B9B] uppercase tracking-wider mb-1">
            Total Available Budget
          </h6>
          <p className="text-sm text-[#F5F5F5]">{budgetLabel}</p>
        </div>

        {/* Project Type */}
        <div>
          <h6 className="text-xs font-medium text-[#9B9B9B] uppercase tracking-wider mb-1">
            Project Type
          </h6>
          <p className="text-sm text-[#F5F5F5]">{projectTypeLabel}</p>
        </div>

        {/* URL */}
        {project.url && (
          <div>
            <h6 className="text-xs font-medium text-[#9B9B9B] uppercase tracking-wider mb-1">
              Project URL
            </h6>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#36D399] hover:underline break-all"
            >
              {project.url}
            </a>
          </div>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <div>
          <h6 className="text-xs font-medium text-[#9B9B9B] uppercase tracking-wider mb-1">
            Project Description
          </h6>
          <p className="text-sm text-[#C0C0C0] leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </div>
      )}

      {/* Objectives */}
      {project.objectives.length > 0 && (
        <div className="mt-6">
          <h6 className="text-xs font-medium text-[#9B9B9B] uppercase tracking-wider mb-2">
            Key Objectives
          </h6>
          <ul className="list-disc list-inside space-y-1 text-sm text-[#C0C0C0]">
            {project.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Constraints */}
      {project.constraints.length > 0 && (
        <div className="mt-6">
          <h6 className="text-xs font-medium text-[#9B9B9B] uppercase tracking-wider mb-2">
            Constraints
          </h6>
          <ul className="list-disc list-inside space-y-1 text-sm text-[#C0C0C0]">
            {project.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolves an enum index/value to its description string.
 * Handles both numeric index and string value lookups.
 */
function resolveEnumLabel(
  value: string | number | undefined,
  enumList: Array<{ id?: number; description: string }>
): string {
  if (value === undefined || value === null) return 'Pending';

  // If it's a number, look it up by array index
  if (typeof value === 'number') {
    return enumList[value]?.description ?? 'Pending';
  }

  // If it's a string that parses as a number, try index lookup
  const numValue = Number(value);
  if (!isNaN(numValue)) {
    return enumList[numValue]?.description ?? value;
  }

  // Otherwise return the raw string value
  return value;
}

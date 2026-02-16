/**
 * MilestoneList - Renders a list of MilestoneCard components
 *
 * Displays all milestones for a project with their individual states.
 * Shows an EmptyState component when the list is empty.
 *
 * Mirrors the EJS partial milestones/info/_showMilestones.ejs.
 */

import { MilestoneCard } from '@components/features/milestones/MilestoneCard';
import { MilestoneActions } from '@components/features/milestones/MilestoneActions';
import { EmptyState } from '@components/shared/EmptyState';
import type { Milestone, User } from '@/types/index';

interface MilestoneListProps {
  milestones: Milestone[];
  allDeliveryTimes?: Array<{ id?: number; description: string }>;
  /** Project ID for milestone actions. */
  projectId?: string;
  /** Authenticated user for milestone actions. */
  user?: User;
  /** Whether the user is the client for this project. */
  isClient?: boolean;
  /** Whether the user is the consultant for this project. */
  isConsultant?: boolean;
  className?: string;
}

export function MilestoneList({
  milestones,
  allDeliveryTimes,
  projectId,
  user,
  isClient = false,
  isConsultant = false,
  className,
}: MilestoneListProps) {
  if (milestones.length === 0) {
    return (
      <EmptyState
        icon="ri-task-line"
        title="No milestones yet"
        description="Milestones will appear here once the project scope has been defined."
      />
    );
  }

  const showActions = !!projectId && !!user;

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">
        Milestones
      </h3>
      <div className="space-y-3">
        {milestones.map((milestone, index) => (
          <div key={milestone.id ?? `draft-${index}`}>
            <MilestoneCard
              milestone={milestone}
              index={index}
              allDeliveryTimes={allDeliveryTimes}
            />
            {showActions && (
              <MilestoneActions
                milestone={milestone}
                projectId={projectId}
                user={user}
                isClient={isClient}
                isConsultant={isConsultant}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

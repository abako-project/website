/**
 * MilestoneList - Renders a list of MilestoneCard components
 *
 * Displays all milestones for a project with their individual states.
 * Shows an EmptyState component when the list is empty.
 *
 * Mirrors the EJS partial milestones/info/_showMilestones.ejs.
 */

import { MilestoneCard } from '@components/features/milestones/MilestoneCard';
import { EmptyState } from '@components/shared/EmptyState';
import type { Milestone } from '@/types/index';

interface MilestoneListProps {
  milestones: Milestone[];
  allDeliveryTimes?: Array<{ id?: number; description: string }>;
  className?: string;
}

export function MilestoneList({
  milestones,
  allDeliveryTimes,
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

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">
        Milestones
      </h3>
      <div className="space-y-3">
        {milestones.map((milestone, index) => (
          <MilestoneCard
            key={milestone.id ?? `draft-${index}`}
            milestone={milestone}
            index={index}
            allDeliveryTimes={allDeliveryTimes}
          />
        ))}
      </div>
    </div>
  );
}

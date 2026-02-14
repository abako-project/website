/**
 * ReviewsList - Panel showing all reviews for a profile
 *
 * Matches Figma node 1350:15761:
 *   - Header: "Reviews" (20px semibold) + count (16px medium secondary), justify-between
 *   - Gap header→cards: 12px (gap-3)
 *   - Cards gap: 24px (gap-6)
 *
 * Used in both DeveloperProfilePage and ClientProfilePage.
 */

import { cn } from '@lib/cn';
import { ReviewCard } from './ReviewCard';
import { Spinner } from '@components/ui/Spinner';
import type { RatingResponse } from '@/types';

export interface ReviewsListProps {
  ratings: RatingResponse[];
  totalCount: number;
  isLoading?: boolean;
  resolveReviewerName?: (rating: RatingResponse) => string;
  resolveReviewerRole?: (rating: RatingResponse) => string | undefined;
  resolveReviewerAvatar?: (rating: RatingResponse) => string | undefined;
  className?: string;
}

export function ReviewsList({
  ratings,
  totalCount,
  isLoading = false,
  resolveReviewerName,
  resolveReviewerRole,
  resolveReviewerAvatar,
  className,
}: ReviewsListProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xl font-semibold leading-8 text-[var(--text-dark-primary,#f5f5f5)]">
          Reviews
        </span>
        <span className="text-base font-medium leading-6 text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">
          {totalCount}
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && ratings.length === 0 && (
        <div className="rounded-xl border border-[var(--base-border,#3d3d3d)] bg-[var(--base-surface-2,#231f1f)] p-6 text-center">
          <p className="text-sm text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">
            No reviews yet
          </p>
        </div>
      )}

      {/* Review cards */}
      {!isLoading && ratings.length > 0 && (
        <div className="flex flex-col gap-6">
          {ratings.map((rating) => (
            <ReviewCard
              key={rating.id}
              reviewerName={resolveReviewerName?.(rating) ?? 'Anonymous'}
              reviewerRole={resolveReviewerRole?.(rating)}
              reviewerAvatarUrl={resolveReviewerAvatar?.(rating)}
              rating={rating.rating}
            />
          ))}
        </div>
      )}
    </div>
  );
}

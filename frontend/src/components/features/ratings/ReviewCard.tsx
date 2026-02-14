/**
 * ReviewCard - Displays a single review/rating entry
 *
 * Matches Figma node 1350:15766:
 *   - Dark surface card: surface-2 bg, border, rounded-xl, shadow
 *   - Padding: px-32 py-16 (px-8 py-4)
 *   - Row 1: AvatarLabel (flex-1) + StarRating (shrink-0), gap-32
 *   - Row 2: Review text (16px medium, primary color)
 *   - Sections gap: 16px (gap-4)
 */

import { cn } from '@lib/cn';
import { AvatarLabel } from '@components/ui/AvatarLabel';
import { StarRating } from './StarRating';

export interface ReviewCardProps {
  reviewerName: string;
  reviewerRole?: string;
  reviewerAvatarUrl?: string;
  rating: number;
  reviewText?: string;
  className?: string;
}

export function ReviewCard({
  reviewerName,
  reviewerRole,
  reviewerAvatarUrl,
  rating,
  reviewText,
  className,
}: ReviewCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--base-border,#3d3d3d)] bg-[var(--base-surface-2,#231f1f)]',
        'shadow-[0.5px_0.5px_3px_0px_rgba(255,255,255,0.08)]',
        'px-8 py-4 flex flex-col gap-4',
        className
      )}
    >
      {/* Header: Avatar + Rating */}
      <div className="flex items-center gap-8">
        <AvatarLabel
          name={reviewerName}
          subtitle={reviewerRole}
          src={reviewerAvatarUrl}
          size="md"
          className="flex-1 min-w-0"
        />
        <StarRating rating={rating} size="xs" className="shrink-0" />
      </div>

      {/* Review text */}
      {reviewText && (
        <p className="text-base font-medium leading-6 text-[var(--text-dark-primary,#f5f5f5)]">
          {reviewText}
        </p>
      )}
    </div>
  );
}

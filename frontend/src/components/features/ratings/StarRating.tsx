/**
 * StarRating - Displays a numeric rating with star icons
 *
 * Matches the Figma Rating component (node 111:4919):
 *   - XS: 14px semibold value + 20px stars, gap-8px
 *   - Medium: 18px semibold value + 28px stars, gap-10px
 *   - Value color: text-dark-secondary
 *   - Filled stars: state-brand-active (#36d399)
 *   - Empty stars: text-dark-tertiary
 */

import { cn } from '@lib/cn';

export interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'xs' | 'md';
  showValue?: boolean;
  className?: string;
}

function StarIcon({ filled, size }: { filled: boolean; size: 'xs' | 'md' }) {
  const sizeClass = size === 'xs' ? 'w-5 h-5' : 'w-7 h-7';

  return (
    <svg
      className={cn(
        sizeClass,
        filled
          ? 'text-[var(--state-brand-active,#36d399)]'
          : 'text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]'
      )}
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 1.333l1.885 4.347 4.782.427-3.614 3.08 1.117 4.646L8 11.347l-4.17 2.486 1.117-4.646-3.614-3.08 4.782-.427L8 1.333z" />
    </svg>
  );
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  showValue = true,
  className,
}: StarRatingProps) {
  const roundedRating = Math.round(rating);

  return (
    <div
      className={cn(
        'flex items-center',
        size === 'xs' ? 'gap-2' : 'gap-[10px]',
        className
      )}
      role="img"
      aria-label={`Rating: ${rating.toFixed(1)} out of ${maxStars} stars`}
    >
      {showValue && (
        <span
          className={cn(
            'font-semibold text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]',
            size === 'xs' ? 'text-sm leading-[22px]' : 'text-lg leading-[28px]'
          )}
        >
          {rating.toFixed(1)}
        </span>
      )}
      <div className="flex items-center">
        {Array.from({ length: maxStars }, (_, i) => (
          <StarIcon key={i} filled={i < roundedRating} size={size} />
        ))}
      </div>
    </div>
  );
}

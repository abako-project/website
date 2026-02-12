import * as React from 'react';
import { cn } from '@lib/cn';

export interface ProgressSegmentedProps {
  value: number;
  showLabel?: boolean;
  className?: string;
}

const ProgressSegmented: React.FC<ProgressSegmentedProps> = ({ value, showLabel = true, className }) => {
  const segments = 10;
  const filledSegments = Math.round((value / 100) * segments);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex h-3 gap-2">
        {Array.from({ length: segments }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'flex-1 rounded-[var(--radi-2,4px)]',
              index < filledSegments
                ? 'bg-[var(--state-brand-active,#36d399)]'
                : 'bg-[var(--base-fill-2,#3d3d3d)]'
            )}
          />
        ))}
      </div>
      {showLabel && (
        <div className="mt-2 font-inter text-base font-medium leading-6 text-[var(--text-dark-primary,#f5f5f5)]">
          {value.toString().padStart(2, '0')}%
        </div>
      )}
    </div>
  );
};

ProgressSegmented.displayName = 'ProgressSegmented';

export { ProgressSegmented };

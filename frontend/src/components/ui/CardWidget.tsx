import * as React from 'react';
import { cn } from '@lib/cn';
import { Badge } from './Badge';
import { ProgressSegmented } from './ProgressSegmented';

export interface CardWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  badges?: { label: string; variant: 'success' | 'neutral' }[];
  progress?: number;
}

const CardWidget = React.forwardRef<HTMLDivElement, CardWidgetProps>(
  ({ className, title, badges, progress, onClick, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'rounded-[var(--radi-6,12px)] border border-[var(--base-border,#3d3d3d)] bg-[var(--base-surface-2,#231f1f)] p-6 shadow-[0.5px_0.5px_3px_rgba(255,255,255,0.08)]',
          onClick && 'cursor-pointer transition-all hover:border-[var(--state-brand-active,#36d399)]',
          className
        )}
        {...props}
      >
        {badges && badges.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <Badge key={index} variant={badge.variant}>
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
        <h3 className="font-inter text-2xl font-semibold leading-[38px] text-[var(--text-dark-primary,#f5f5f5)]">
          {title}
        </h3>
        {children}
        {progress !== undefined && (
          <div className="mt-4">
            <ProgressSegmented value={progress} />
          </div>
        )}
      </div>
    );
  }
);

CardWidget.displayName = 'CardWidget';

export { CardWidget };

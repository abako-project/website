import * as React from 'react';
import { cn } from '@lib/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'neutral';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'neutral', children, ...props }, ref) => {
    const variants = {
      success:
        'bg-[var(--state-success-active,#85efac)] text-[var(--text-light-primary,#141414)] border border-[var(--colors-alpha-dark-200,rgba(255,255,255,0.12))]',
      neutral:
        'bg-[var(--base-surface-2,#231f1f)] border border-[var(--base-border,#3d3d3d)] text-[var(--text-dark-primary,#f5f5f5)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex h-7 items-center justify-center rounded-[var(--radi-6,12px)] px-3 font-inter text-base font-semibold leading-6',
          'shadow-[0.5px_0.5px_3px_rgba(255,255,255,0.08)]',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };

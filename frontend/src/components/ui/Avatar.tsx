import * as React from 'react';
import { cn } from '@lib/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  showOnline?: boolean;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = 'Avatar', size = 'md', showOnline = false, ...props }, ref) => {
    const sizes = {
      sm: 'h-6 w-6',
      md: 'h-8 w-8',
      lg: 'h-10 w-10',
    };

    const onlineSizes = {
      sm: 'h-2 w-2 border',
      md: 'h-2.5 w-2.5 border',
      lg: 'h-2.5 w-2.5 border-2',
    };

    return (
      <div ref={ref} className={cn('relative inline-block', className)} {...props}>
        <div
          className={cn(
            'overflow-hidden rounded-full border border-[var(--base-border,#3d3d3d)]',
            sizes[size]
          )}
        >
          {src ? (
            <img src={src} alt={alt} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--base-fill-1,#333)] text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3/5 w-3/5"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
        </div>
        {showOnline && (
          <div
            className={cn(
              'absolute bottom-0 right-0 rounded-full bg-[var(--state-brand-active,#36d399)] border-[var(--base-surface-1,#141414)]',
              onlineSizes[size]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };

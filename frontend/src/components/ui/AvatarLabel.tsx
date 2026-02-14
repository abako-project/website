import * as React from 'react';
import { cn } from '@lib/cn';
import { Avatar, AvatarProps } from './Avatar';

export interface AvatarLabelProps extends Omit<AvatarProps, 'size'> {
  name: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarLabel = React.forwardRef<HTMLDivElement, AvatarLabelProps>(
  ({ className, name, subtitle, size = 'md', ...avatarProps }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-center gap-3', className)}>
        <Avatar size={size} {...avatarProps} />
        <div className="flex flex-col gap-0.5">
          <span className="font-inter text-sm font-medium leading-[22px] text-[var(--text-dark-primary,#f5f5f5)]">
            {name}
          </span>
          {subtitle && (
            <span className="font-inter text-sm font-normal leading-[22px] text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }
);

AvatarLabel.displayName = 'AvatarLabel';

export { AvatarLabel };

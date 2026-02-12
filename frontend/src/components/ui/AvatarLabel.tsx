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
      <div ref={ref} className={cn('flex items-center gap-2', className)}>
        <Avatar size={size} {...avatarProps} />
        <div className="flex flex-col">
          <span className="font-inter text-sm font-medium leading-[22px] text-[var(--text-dark-primary,#f5f5f5)]">
            {name}
          </span>
          {subtitle && (
            <span className="font-inter text-xs font-normal leading-[18px] text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">
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

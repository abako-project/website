import * as React from 'react';
import { cn } from '@lib/cn';
import { Avatar } from './Avatar';

export interface FeedItemProps extends React.HTMLAttributes<HTMLDivElement> {
  avatarSrc?: string;
  actorName: string;
  action: string;
  timestamp: string;
}

const FeedItem = React.forwardRef<HTMLDivElement, FeedItemProps>(
  ({ className, avatarSrc, actorName, action, timestamp, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex gap-3', className)} {...props}>
        <Avatar src={avatarSrc} size="sm" />
        <div className="flex flex-col">
          <p className="font-inter text-sm font-normal leading-[22px] text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">
            <span className="font-bold text-[var(--text-dark-primary,#f5f5f5)]">{actorName}</span> {action}
          </p>
          <span className="font-inter text-xs font-normal leading-[18px] text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]">
            {timestamp}
          </span>
        </div>
      </div>
    );
  }
);

FeedItem.displayName = 'FeedItem';

export { FeedItem };

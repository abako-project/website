/**
 * LiveIndicator
 *
 * Pulsing dot + label indicating real-time blockchain connection status.
 * Respects prefers-reduced-motion — animation is suppressed via the global
 * index.css rule so no extra handling is needed here.
 *
 * States:
 *   connected    -> green dot + "Live"
 *   syncing      -> amber dot + "Syncing..."
 *   disconnected -> red dot + "Disconnected"
 */

import { cn } from '@lib/cn';

export type LiveStatus = 'connected' | 'syncing' | 'disconnected';

export interface LiveIndicatorProps {
  status: LiveStatus;
  lastSyncedSeconds?: number;
  className?: string;
}

const STATUS_CONFIG: Record<
  LiveStatus,
  { dotColor: string; label: string; textColor: string }
> = {
  connected: {
    dotColor: 'bg-[#36D399]',
    label: 'Live',
    textColor: 'text-[#36D399]',
  },
  syncing: {
    dotColor: 'bg-[#F59E0B]',
    label: 'Syncing...',
    textColor: 'text-[#F59E0B]',
  },
  disconnected: {
    dotColor: 'bg-[#FA4D4D]',
    label: 'Disconnected',
    textColor: 'text-[#FA4D4D]',
  },
};

export function LiveIndicator({ status, lastSyncedSeconds, className }: LiveIndicatorProps) {
  const config = STATUS_CONFIG[status];

  const syncedLabel =
    lastSyncedSeconds !== undefined
      ? lastSyncedSeconds < 5
        ? 'Just now'
        : `${lastSyncedSeconds}s ago`
      : null;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {syncedLabel && (
        <span className="text-xs text-[rgba(255,255,255,0.36)]">
          Last synced: {syncedLabel}
        </span>
      )}
      <div className="flex items-center gap-1.5">
        {/* Pulsing dot -- animation auto-disabled by global prefers-reduced-motion rule */}
        <span
          className="relative flex h-2 w-2 items-center justify-center"
          aria-hidden="true"
        >
          {status === 'connected' && (
            <span
              className={cn(
                'absolute inline-flex h-full w-full animate-ping rounded-full opacity-60',
                config.dotColor,
              )}
            />
          )}
          <span
            className={cn('relative inline-flex h-2 w-2 rounded-full', config.dotColor)}
          />
        </span>
        <span className={cn('text-xs font-medium', config.textColor)}>
          {config.label}
        </span>
      </div>
      {/* Screen reader announcement for status changes */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {status === 'connected'
          ? 'Connected to blockchain'
          : status === 'syncing'
          ? 'Syncing with blockchain'
          : 'Disconnected from blockchain'}
      </span>
    </div>
  );
}

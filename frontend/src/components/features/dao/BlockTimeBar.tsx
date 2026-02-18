/**
 * BlockTimeBar
 *
 * Linear progress bar showing time elapsed since the last block was produced,
 * relative to the target block time. Replaces Kreivo's hexagonal timer with
 * a component that better fits Abako's design language.
 *
 * Color states:
 *   0–80% of target    → #36D399  (brand green, normal)
 *   80–100% of target  → #F59E0B  (amber, approaching)
 *   > 100% of target   → #FA4D4D  (red, overdue)
 *
 * Accessibility:
 *   - role="progressbar" with aria-valuenow / aria-valuemax
 *   - aria-label with human-readable description
 */

import { cn } from '@lib/cn';

export interface BlockTimeBarProps {
  /** Seconds elapsed since last block */
  elapsedSeconds: number;
  /** Target block time in seconds (e.g. 12 for Kusama) */
  targetSeconds?: number;
  className?: string;
}

function getBarColor(ratio: number): string {
  if (ratio > 1) return 'bg-[#FA4D4D]';
  if (ratio > 0.8) return 'bg-[#F59E0B]';
  return 'bg-[#36D399]';
}

function formatSeconds(s: number): string {
  return `${s.toFixed(1)}s`;
}

export function BlockTimeBar({
  elapsedSeconds,
  targetSeconds = 12,
  className,
}: BlockTimeBarProps) {
  const ratio = Math.min(elapsedSeconds / targetSeconds, 1.15); // cap visual at 115%
  const percentage = Math.round(ratio * 100);
  const barColor = getBarColor(elapsedSeconds / targetSeconds);

  return (
    <div className={cn('space-y-1.5', className)}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[rgba(255,255,255,0.36)]">Block time</span>
        <span
          className="tabular-nums text-xs text-[rgba(255,255,255,0.36)]"
          aria-hidden="true"
        >
          {formatSeconds(elapsedSeconds)} / {targetSeconds}s
        </span>
      </div>

      {/* Track */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#2A2A2A]">
        <div
          role="progressbar"
          aria-valuenow={Math.round(elapsedSeconds)}
          aria-valuemin={0}
          aria-valuemax={targetSeconds}
          aria-label={`Block time: ${formatSeconds(elapsedSeconds)} of ${targetSeconds} second target`}
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-linear',
            barColor,
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

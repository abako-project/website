/**
 * ExplorerCard - Kreivo chain explorer widget for the DAO View page.
 *
 * Displays:
 *   - Best block number with "#N" label
 *   - Hexagonal timer showing seconds elapsed since last block
 *   - Finalised block number
 *   - 6x5 grid of block cells (filled / has-events / latest / empty)
 *   - Up to 4 recent chain events
 *
 * Uses useExplorerData() which polls /api/dao/explorer every 6 s.
 * The timer hex updates every second via a local interval that counts up
 * from the `secondsSinceLastBlock` baseline received from the server.
 *
 * Design mapping (Kreivo -> Abako):
 *   .dashboard-box          -> Card (bg-card border-border rounded-lg)
 *   #12211e background      -> bg-card  (#231F1F)
 *   #ded0f1 text            -> text-foreground (#F5F5F5)
 *   #36d399 accent          -> text-primary / bg-primary
 *   .block-square filled    -> bg-[var(--state-brand-active)] opacity
 *   .block-square latest    -> ring-2 ring-primary
 *   .block-square events    -> bg-primary/60
 */

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Spinner } from '@components/ui/Spinner';
import { useExplorerData } from '@hooks/useExplorerData';
import type { BlockCell, ChainEvent } from '@/types/dao';

// ---------------------------------------------------------------------------
// Sub-component: HexTimer
// ---------------------------------------------------------------------------

/**
 * Hexagonal SVG timer that shows seconds elapsed since the last block.
 * Counts up locally from the server-provided `initialSeconds` baseline,
 * resetting when `resetKey` changes (i.e. a new block arrived).
 */
function HexTimer({ initialSeconds, resetKey }: { initialSeconds: number; resetKey: number }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset counter when a new block arrives (resetKey changes)
  useEffect(() => {
    setSeconds(initialSeconds);
  }, [resetKey, initialSeconds]);

  // Count up every second
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Clamp display at 99 s to avoid layout overflow
  const display = Math.min(seconds, 99);

  return (
    <div className="relative flex items-center justify-center w-14 h-14 flex-shrink-0" aria-label={`${display} seconds since last block`}>
      {/* Hexagon SVG border */}
      <svg
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
      >
        <polygon
          points="28,2 52,15 52,41 28,54 4,41 4,15"
          stroke="var(--state-brand-active, #36d399)"
          strokeWidth="1.5"
          fill="rgba(54,211,153,0.08)"
        />
      </svg>

      {/* Timer value */}
      <div className="relative flex flex-col items-center leading-none">
        <span
          className="font-semibold text-[var(--state-brand-active,#36d399)]"
          style={{ fontSize: '18px', lineHeight: '1' }}
        >
          {display}
        </span>
        <span
          className="text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]"
          style={{ fontSize: '9px', lineHeight: '1', marginTop: '2px', letterSpacing: '0.04em' }}
        >
          SEC
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: BlockGrid
// ---------------------------------------------------------------------------

/**
 * 6-column x 5-row grid of block cells.
 * Colour coding:
 *   - Empty placeholder: bg-[var(--base-fill-1)] / opacity-30
 *   - Exists, no events: bg-[var(--state-brand-active)] / opacity-40
 *   - Has events: bg-[var(--state-brand-active)] / opacity-75
 *   - Latest block: additionally ringed with ring-primary
 */
function BlockGrid({ cells }: { cells: BlockCell[] }) {
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}
      role="grid"
      aria-label="Recent blocks grid"
    >
      {cells.map((cell) => {
        let cellClass: string;

        if (!cell.exists) {
          cellClass = 'bg-[var(--base-fill-1,#333)] opacity-30';
        } else if (cell.hasEvents) {
          cellClass = 'bg-[var(--state-brand-active,#36d399)] opacity-75';
        } else {
          cellClass = 'bg-[var(--state-brand-active,#36d399)] opacity-40';
        }

        return (
          <div
            key={cell.number}
            role="gridcell"
            title={cell.exists ? `Block #${cell.number}${cell.hasEvents ? ' (has events)' : ''}` : 'Empty'}
            className={[
              'h-4 rounded-sm transition-opacity',
              cellClass,
              cell.isLatest ? 'ring-2 ring-[var(--state-brand-active,#36d399)] ring-offset-1 ring-offset-[var(--base-surface-2,#231f1f)] opacity-100' : '',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: EventFeed
// ---------------------------------------------------------------------------

function EventFeed({ events }: { events: ChainEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-xs text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))] py-1">
        No recent events
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {events.map((ev, idx) => (
        <li
          key={`${ev.blockNumber}-${idx}`}
          className="flex items-center justify-between gap-2"
        >
          <span
            className="text-xs font-mono text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] truncate"
            title={ev.label}
          >
            {ev.label}
          </span>
          <span className="text-xs text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))] whitespace-nowrap flex-shrink-0">
            #{ev.blockNumber}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface ExplorerCardProps {
  className?: string;
}

/**
 * Renders the chain explorer widget for the DAO View page.
 *
 * @example
 * ```tsx
 * <ExplorerCard />
 * ```
 */
export function ExplorerCard({ className = '' }: ExplorerCardProps) {
  const { data, isLoading, isError } = useExplorerData();

  // resetKey increments each time the best block changes, causing HexTimer
  // to reset its local interval counter to the server-provided baseline.
  const resetKey = data?.bestBlock ?? 0;

  // --------------- Loading state ---------------
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Chain Explorer</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="md" />
            <p className="text-sm text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]">
              Connecting to chain…
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --------------- Error state ---------------
  if (isError || !data) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Chain Explorer</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
            <i className="ri-signal-wifi-error-line text-xl text-red-400" />
          </div>
          <p className="text-sm text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] mb-1">
            Explorer unavailable
          </p>
          <p className="text-xs text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]">
            Could not reach the chain node.
          </p>
        </CardContent>
      </Card>
    );
  }

  // --------------- Data state ---------------
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Chain Explorer</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Row 1: Best block + timer */}
        <div className="flex items-center gap-4">
          <HexTimer initialSeconds={data.secondsSinceLastBlock} resetKey={resetKey} />

          <div className="flex flex-col gap-0.5">
            {/* Best block */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))] text-xs font-medium leading-none">
                #
              </span>
              <span className="text-2xl font-bold leading-none text-[var(--text-dark-primary,#f5f5f5)]">
                {data.bestBlock.toLocaleString()}
              </span>
            </div>

            {/* Finalised block */}
            <p className="text-xs text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]">
              Finalized:{' '}
              <span className="text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] font-medium">
                # {data.finalizedBlock.toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--base-border,#3d3d3d)]" />

        {/* Row 2: 6x5 block grid */}
        <BlockGrid cells={data.blockGrid} />

        {/* Divider */}
        <div className="border-t border-[var(--base-border,#3d3d3d)]" />

        {/* Row 3: Recent events */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]">
            Recent Events
          </p>
          <EventFeed events={data.recentEvents} />
        </div>
      </CardContent>
    </Card>
  );
}

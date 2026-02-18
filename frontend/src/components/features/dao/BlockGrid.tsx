/**
 * BlockGrid
 *
 * 8-column × 6-row rectangular grid displaying the last 48 blockchain blocks.
 * Each cell is color-coded by block state:
 *
 *   empty/past    → #2A2A2A  (old blocks, no notable events)
 *   has-events    → #1A3D2E  (block contains chain events)
 *   finalized     → #059467  (block has been finalized)
 *   current       → #36D399  (most recent block, pulsing)
 *   error         → rgba(250,77,77,0.3)  (block with error events)
 *
 * The grid is purely presentational — all data is passed in via props.
 * The most recent block is always the last cell (bottom-right).
 *
 * Accessibility:
 *   - Wrapper: role="img" with descriptive aria-label
 *   - Individual cells: aria-hidden (decorative visualization)
 */

import { cn } from '@lib/cn';

export type BlockState = 'empty' | 'has-events' | 'finalized' | 'current' | 'error';

export interface BlockData {
  number: number;
  state: BlockState;
}

export interface BlockGridProps {
  blocks: BlockData[];
  currentBlock: number;
  finalizedBlock: number;
  className?: string;
}

const BLOCK_STATE_CLASSES: Record<BlockState, string> = {
  empty: 'bg-[#2A2A2A]',
  'has-events': 'bg-[#1A3D2E]',
  finalized: 'bg-[#059467]',
  current: 'bg-[#36D399] animate-pulse',
  error: 'bg-[rgba(250,77,77,0.3)]',
};

const BLOCK_STATE_TOOLTIP: Record<BlockState, string> = {
  empty: 'Empty block',
  'has-events': 'Block with events',
  finalized: 'Finalized block',
  current: 'Current block',
  error: 'Block with errors',
};

/** Pad or trim the blocks array to exactly 48 entries. */
function normalizeBlocks(blocks: BlockData[]): BlockData[] {
  const TOTAL = 48;
  if (blocks.length >= TOTAL) return blocks.slice(-TOTAL);
  // Pad with empty blocks at the front
  const padding: BlockData[] = Array.from({ length: TOTAL - blocks.length }, () => ({
    number: 0,
    state: 'empty' as BlockState,
  }));
  return [...padding, ...blocks];
}

export function BlockGrid({ blocks, currentBlock, finalizedBlock, className }: BlockGridProps) {
  const normalized = normalizeBlocks(blocks);

  const hasEventsCount = blocks.filter((b) => b.state === 'has-events').length;

  return (
    <div
      role="img"
      aria-label={`Block grid showing last 48 blocks. Current block: #${currentBlock.toLocaleString()}. Finalized block: #${finalizedBlock.toLocaleString()}. ${hasEventsCount} blocks with events.`}
      className={cn('select-none', className)}
    >
      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <LegendItem color="bg-[#36D399]" label="Current" />
        <LegendItem color="bg-[#059467]" label="Finalized" />
        <LegendItem color="bg-[#1A3D2E]" label="Has events" />
        <LegendItem color="bg-[#2A2A2A]" label="Empty" />
      </div>

      {/* Grid: 8 columns */}
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}
        aria-hidden="true"
      >
        {normalized.map((block, index) => (
          <div
            key={index}
            className={cn(
              'h-4 w-full rounded-[3px] transition-colors duration-500',
              BLOCK_STATE_CLASSES[block.state],
            )}
            title={
              block.number > 0
                ? `#${block.number.toLocaleString()} — ${BLOCK_STATE_TOOLTIP[block.state]}`
                : 'Empty'
            }
          />
        ))}
      </div>

      {/* Screen-reader-only summary */}
      <span className="sr-only">
        Block visualization: {hasEventsCount} of 48 displayed blocks have chain events.
        Current block #{currentBlock.toLocaleString()} is finalized up to #{finalizedBlock.toLocaleString()}.
      </span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('h-2.5 w-2.5 rounded-[2px]', color)} aria-hidden="true" />
      <span className="text-xs text-[rgba(255,255,255,0.36)]">{label}</span>
    </div>
  );
}

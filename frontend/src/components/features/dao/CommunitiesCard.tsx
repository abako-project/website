/**
 * CommunitiesCard - On-chain community list widget for the DAO View page.
 *
 * Displays up to 3 communities, each with:
 *   - Gradient circle avatar (one of 6 deterministic presets)
 *   - Community name
 *   - Member count ("N members")
 *   - Status indicator dot (green = active, blue = pending, grey = inactive)
 *
 * When more than 3 communities exist, shows a "+ N more" label at the bottom.
 *
 * Design mapping (Kreivo -> Abako):
 *   .community-avatar gradients -> 6 CSS linear-gradient presets
 *   status dot green            -> bg-[var(--state-brand-active,#36d399)]
 *   status dot blue             -> bg-blue-400
 *   status dot yellow/grey      -> bg-[var(--muted-foreground,#9B9B9B)]
 *   .dashboard-box              -> Card with CardHeader / CardContent
 *   member count text           -> text-[var(--text-dark-tertiary)]
 */

import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { Spinner } from '@components/ui/Spinner';
import { useDaoCommunities } from '@hooks/useDaoCommunities';
import type { Community, CommunityStatus } from '@/types/dao';

// ---------------------------------------------------------------------------
// Gradient presets (mirrors Kreivo dashboard's 6 avatar gradients)
// ---------------------------------------------------------------------------

const AVATAR_GRADIENTS: string[] = [
  'linear-gradient(135deg, #059467 0%, #36d399 100%)',         // green (brand)
  'linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)',         // blue
  'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',         // purple
  'linear-gradient(135deg, #b45309 0%, #fbbf24 100%)',         // amber
  'linear-gradient(135deg, #be123c 0%, #fb7185 100%)',         // rose
  'linear-gradient(135deg, #0f766e 0%, #2dd4bf 100%)',         // teal
];

function getGradient(index: number): string {
  return AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length] ?? AVATAR_GRADIENTS[0]!;
}

// ---------------------------------------------------------------------------
// Sub-component: StatusDot
// ---------------------------------------------------------------------------

function StatusDot({ status }: { status: CommunityStatus }) {
  const colorClass =
    status === 'active'
      ? 'bg-[var(--state-brand-active,#36d399)]'
      : status === 'pending'
        ? 'bg-blue-400'
        : 'bg-[var(--muted-foreground,#9B9B9B)]';

  const label =
    status === 'active' ? 'Active' : status === 'pending' ? 'Pending' : 'Inactive';

  return (
    <span
      className={`w-2 h-2 rounded-full flex-shrink-0 ${colorClass}`}
      title={label}
      aria-label={label}
    />
  );
}

// ---------------------------------------------------------------------------
// Sub-component: CommunityRow
// ---------------------------------------------------------------------------

function CommunityRow({ community }: { community: Community }) {
  const gradient = getGradient(community.gradientIndex);

  return (
    <li className="flex items-center gap-3">
      {/* Gradient circle avatar */}
      <div
        aria-hidden="true"
        className="w-9 h-9 rounded-full flex-shrink-0"
        style={{ background: gradient }}
      />

      {/* Name + member count */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-sm font-semibold leading-[22px] text-[var(--text-dark-primary,#f5f5f5)] truncate">
          {community.name}
        </span>
        <span className="text-xs text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]">
          {community.memberCount === 1
            ? '1 member'
            : `${community.memberCount} members`}
        </span>
      </div>

      {/* Status indicator */}
      <StatusDot status={community.status} />
    </li>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface CommunitiesCardProps {
  /** Maximum number of communities to display (default 3). */
  limit?: number;
  className?: string;
}

/**
 * Renders the communities list widget for the DAO View page.
 *
 * @example
 * ```tsx
 * <CommunitiesCard limit={3} />
 * ```
 */
export function CommunitiesCard({ limit = 3, className = '' }: CommunitiesCardProps) {
  const { data, isLoading, isError } = useDaoCommunities(limit);

  // --------------- Loading state ---------------
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Communities</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="md" />
            <p className="text-sm text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]">
              Loading communities…
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
          <CardTitle className="text-base font-semibold">Communities</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
            <i className="ri-group-line text-xl text-red-400" />
          </div>
          <p className="text-sm text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] mb-1">
            Could not load communities
          </p>
          <p className="text-xs text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]">
            Check your connection and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  // --------------- Empty state ---------------
  if (data.communities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Communities</CardTitle>
            <Badge variant="neutral">0</Badge>
          </div>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[var(--base-fill-1,#333)] flex items-center justify-center">
            <i className="ri-community-line text-xl text-[var(--muted-foreground,#9B9B9B)]" />
          </div>
          <p className="text-sm text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]">
            No communities found
          </p>
        </CardContent>
      </Card>
    );
  }

  // --------------- Data state ---------------
  const overflowCount = data.totalCount - data.communities.length;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Communities</CardTitle>
          <Badge variant="neutral">{data.totalCount}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-4" aria-label="Community list">
          {data.communities.map((community) => (
            <CommunityRow key={community.id} community={community} />
          ))}
        </ul>

        {overflowCount > 0 && (
          <p className="text-xs text-center text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]">
            + {overflowCount} more {overflowCount === 1 ? 'community' : 'communities'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

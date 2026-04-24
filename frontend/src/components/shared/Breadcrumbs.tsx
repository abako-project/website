import { Link } from 'react-router-dom';
import { cn } from '@lib/cn';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('mb-6 flex flex-wrap items-center gap-1.5 text-sm text-[rgba(255,255,255,0.6)]', className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="transition-colors hover:text-[#f5f5f5]"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast && 'text-[#f5f5f5]')}>
                {item.label}
              </span>
            )}

            {!isLast && <span aria-hidden="true">/</span>}
          </div>
        );
      })}
    </nav>
  );
}

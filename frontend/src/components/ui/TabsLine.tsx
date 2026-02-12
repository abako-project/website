import * as React from 'react';
import { cn } from '@lib/cn';

export interface Tab {
  id: string;
  label: string;
}

export interface TabsLineProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

const TabsLine: React.FC<TabsLineProps> = ({ tabs, activeTab, onTabChange, className }) => {
  return (
    <div className={cn('flex gap-0 border-b border-[var(--base-border,#3d3d3d)]', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'cursor-pointer px-4 py-3 font-inter text-base font-medium leading-6 transition-colors',
              isActive
                ? 'border-b-2 border-[var(--state-brand-active,#36d399)] text-[var(--state-brand-active,#36d399)]'
                : 'text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] hover:text-[var(--text-dark-primary,#f5f5f5)]'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

TabsLine.displayName = 'TabsLine';

export { TabsLine };

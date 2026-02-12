import * as React from 'react';
import { cn } from '@lib/cn';

export interface ComboboxProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'placeholder'> {
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Combobox = React.forwardRef<HTMLSelectElement, ComboboxProps>(
  ({ className, label, options, id, placeholder, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-2 block font-inter text-base font-medium leading-6 text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'h-11 w-full appearance-none rounded-[var(--radi-6,12px)] border border-[var(--base-border,#3d3d3d)] bg-[var(--base-surface-1,#141414)] px-4 font-inter text-base font-medium leading-6 text-[var(--text-dark-primary,#f5f5f5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-brand-active,#36d399)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--base-surface-1,#141414)] disabled:cursor-not-allowed disabled:opacity-50',
              '[&>option:not(:checked)]:text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" className="text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))]">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
);

Combobox.displayName = 'Combobox';

export { Combobox };

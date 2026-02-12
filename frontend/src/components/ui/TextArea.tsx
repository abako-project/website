import * as React from 'react';
import { cn } from '@lib/cn';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  caption?: string;
  error?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, caption, error, id, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block font-inter text-base font-normal leading-6 text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'w-full rounded-[var(--radi-6,12px)] border border-[var(--base-border,#3d3d3d)] bg-[var(--base-surface-1,#141414)] px-4 py-2.5 pr-3 pl-4 font-inter text-base font-medium leading-6 text-[var(--text-dark-primary,#f5f5f5)] placeholder:text-[var(--text-dark-tertiary,rgba(255,255,255,0.36))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-brand-active,#36d399)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--base-surface-1,#141414)] disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : caption ? `${textareaId}-caption` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="mt-1 font-inter text-sm font-medium leading-[22px] text-destructive"
          >
            {error}
          </p>
        )}
        {caption && !error && (
          <p
            id={`${textareaId}-caption`}
            className="mt-1 font-inter text-sm font-medium leading-[22px] text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]"
          >
            {caption}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export { TextArea };

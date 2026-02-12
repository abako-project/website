import * as React from 'react';
import { cn } from '@lib/cn';

export interface StepperNumericProps {
  steps: { label: string }[];
  currentStep: number;
  className?: string;
}

const StepperNumeric: React.FC<StepperNumericProps> = ({ steps, currentStep, className }) => {
  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isPending = stepNumber > currentStep;

        return (
          <React.Fragment key={index}>
            <div className="relative flex items-center">
              <span className="absolute right-14 font-inter text-base font-medium leading-6 text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">
                {step.label}
              </span>
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-[var(--radi-6,12px)] font-inter text-base font-bold leading-6',
                  isCompleted && 'bg-[var(--state-brand-active,#36d399)] text-white',
                  isActive &&
                    'border-4 border-[var(--state-brand-selected,#059467)] bg-[var(--state-brand-active,#36d399)] text-white',
                  isPending &&
                    'bg-[var(--base-fill-1,#333)] text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]'
                )}
              >
                {stepNumber}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-8 w-1 rounded-full',
                  stepNumber < currentStep
                    ? 'bg-[var(--state-brand-active,#36d399)]'
                    : 'bg-[var(--base-fill-2,#3d3d3d)]'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

StepperNumeric.displayName = 'StepperNumeric';

export { StepperNumeric };

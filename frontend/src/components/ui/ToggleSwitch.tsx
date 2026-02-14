/**
 * ToggleSwitch - Toggle matching Figma ToggleKnob component
 *
 * Matches Figma node 1086:14736:
 *   - On: green (brand-active), knob right
 *   - Off: gray (#747474), border, knob left
 *   - Knob: surface-1 bg, rounded-md, subtle shadow
 *
 * When `onChange` is provided the toggle is interactive (rendered as a button).
 * Otherwise it is display-only (aria-hidden div).
 */

import { cn } from '@lib/cn';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function ToggleSwitch({ checked, onChange, disabled, className }: ToggleSwitchProps) {
  const inner = (
    <>
      <div className="h-[15px] w-[18px] rounded-md bg-[var(--base-surface-1,#141414)] shadow-[0.5px_0.5px_3px_0px_rgba(255,255,255,0.08)]" />
    </>
  );

  const track = cn(
    'flex w-10 rounded-lg p-0.5 transition-colors',
    checked
      ? 'justify-end bg-[var(--state-brand-active,#36d399)]'
      : 'justify-start border border-[var(--base-border,#3d3d3d)] bg-[#747474]',
    disabled && 'opacity-50 cursor-not-allowed',
    className,
  );

  if (onChange) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={track}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={track} aria-hidden="true">
      {inner}
    </div>
  );
}

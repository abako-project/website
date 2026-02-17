/**
 * AvailabilityPopover - Quick availability toggle popover
 *
 * Floating panel that appears near the sidebar to let developers
 * quickly change their availability without navigating to Profile.
 *
 * Uses the same useUpdateDeveloperProfile() hook as the Profile page.
 *
 * Figma node: 1086:13481 ("Availability for Hire")
 * Specs:
 *   - Width: 516px, positioned absolute near sidebar bottom
 *   - Border: 1px var(--base-border), rounded-16px
 *   - Shadow: elevation/lg
 *   - Header: dark surface-2 bg with master toggle
 *   - Body: Full Time / Part Time / Hours per Week toggles
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@stores/authStore';
import { useDeveloperProfile, useUpdateDeveloperProfile } from '@hooks/useProfile';
import { ToggleSwitch } from '@components/ui/ToggleSwitch';
import type { Availability } from '@/types/enums';

interface AvailabilityPopoverProps {
  open: boolean;
  onClose: () => void;
}

export function AvailabilityPopover({ open, onClose }: AvailabilityPopoverProps) {
  const user = useAuthStore((state) => state.user);
  const developerId = user?.developerId;

  const { data } = useDeveloperProfile(developerId);
  const updateMutation = useUpdateDeveloperProfile();

  const panelRef = useRef<HTMLDivElement>(null);

  const dev = data?.developer;
  const currentAvailability = (dev?.availability || 'NotAvailable') as Availability;
  const isAvailable = currentAvailability !== 'NotAvailable';

  // Local state for hours input
  const [hoursInput, setHoursInput] = useState<string>(
    String(dev?.availableHoursPerWeek || 20)
  );

  // Sync hours input when developer data changes
  useEffect(() => {
    if (dev?.availableHoursPerWeek) {
      setHoursInput(String(dev.availableHoursPerWeek));
    }
  }, [dev?.availableHoursPerWeek]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid closing immediately from the trigger click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, onClose]);

  const triggerUpdate = useCallback(
    (availability: Availability, hours?: number) => {
      if (!dev || !developerId) return;
      updateMutation.mutate({
        id: developerId,
        data: {
          name: dev.name,
          bio: dev.bio,
          background: dev.background,
          role: dev.role,
          proficiency: dev.proficiency,
          githubUsername: dev.githubUsername,
          portfolioUrl: dev.portfolioUrl,
          location: dev.location,
          skills: dev.skills,
          languages: dev.languages,
          availability,
          availableHoursPerWeek: availability === 'WeeklyHours' ? (hours ?? (parseInt(hoursInput) || 0)) : 0,
          isAvailableForHire: availability !== 'NotAvailable',
        },
      });
    },
    [dev, developerId, updateMutation, hoursInput]
  );

  const handleMasterToggle = useCallback(
    (checked: boolean) => {
      triggerUpdate(checked ? 'FullTime' : 'NotAvailable');
    },
    [triggerUpdate]
  );

  const handleOptionToggle = useCallback(
    (option: 'FullTime' | 'PartTime' | 'WeeklyHours') => {
      // If already selected, deselect is not allowed (must have one active)
      // If selecting a new option, switch to it
      if (currentAvailability === option) return;
      triggerUpdate(option, option === 'WeeklyHours' ? (parseInt(hoursInput) || 20) : undefined);
    },
    [currentAvailability, triggerUpdate, hoursInput]
  );

  const handleHoursBlur = useCallback(() => {
    if (currentAvailability !== 'WeeklyHours') return;
    const hours = parseInt(hoursInput) || 0;
    if (hours !== dev?.availableHoursPerWeek) {
      triggerUpdate('WeeklyHours', hours);
    }
  }, [currentAvailability, hoursInput, dev?.availableHoursPerWeek, triggerUpdate]);

  const handleHoursKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleHoursBlur();
    },
    [handleHoursBlur]
  );

  if (!open || !developerId) return null;

  return (
    <div
      ref={panelRef}
      className="absolute bottom-4 left-full ml-2 w-[516px] z-50 bg-[var(--base-surface-1,#141414)] border border-[var(--base-border,#3d3d3d)] rounded-[var(--radi-7,16px)] shadow-[0px_1.5px_0px_0.5px_rgba(255,255,255,0.08),0px_8px_16px_-8px_rgba(255,255,255,0.08)] overflow-hidden"
      role="dialog"
      aria-label="Availability for Hire"
    >
      {/* Header */}
      <div className="bg-[var(--base-surface-2,#231f1f)] border-b border-[var(--base-border,#3d3d3d)] p-6">
        <div className="flex items-center gap-3">
          <ToggleSwitch
            checked={isAvailable}
            onChange={handleMasterToggle}
            disabled={updateMutation.isPending}
          />
          <span className="text-xl font-semibold text-[var(--text-dark-primary,#f5f5f5)] leading-[32px]">
            Availability for Hire
          </span>
        </div>
      </div>

      {/* Options */}
      <div className="px-6 py-4 flex flex-col gap-4">
        {/* Full Time */}
        <div className="flex items-center gap-4">
          <ToggleSwitch
            checked={isAvailable && currentAvailability === 'FullTime'}
            onChange={() => handleOptionToggle('FullTime')}
            disabled={!isAvailable || updateMutation.isPending}
          />
          <span className="text-base font-medium text-[var(--text-dark-primary,#f5f5f5)] leading-[24px]">
            Full Time
          </span>
        </div>

        {/* Part Time */}
        <div className="flex items-center gap-4">
          <ToggleSwitch
            checked={isAvailable && currentAvailability === 'PartTime'}
            onChange={() => handleOptionToggle('PartTime')}
            disabled={!isAvailable || updateMutation.isPending}
          />
          <span className="text-base font-medium text-[var(--text-dark-primary,#f5f5f5)] leading-[24px]">
            Part Time
          </span>
        </div>

        {/* Hours per Week */}
        <div className="flex items-center gap-4">
          <ToggleSwitch
            checked={isAvailable && currentAvailability === 'WeeklyHours'}
            onChange={() => handleOptionToggle('WeeklyHours')}
            disabled={!isAvailable || updateMutation.isPending}
          />
          <span className="flex-1 text-base font-medium text-[var(--text-dark-primary,#f5f5f5)] leading-[24px]">
            Hours per Week
          </span>
          {/* Input with trailing label */}
          <div className="flex items-stretch w-[240px] rounded-[var(--radi-6,12px)] border border-[var(--base-border,#3d3d3d)] overflow-hidden">
            <input
              type="number"
              min="1"
              max="168"
              value={hoursInput}
              onChange={(e) => setHoursInput(e.target.value)}
              onBlur={handleHoursBlur}
              onKeyDown={handleHoursKeyDown}
              disabled={!isAvailable || currentAvailability !== 'WeeklyHours' || updateMutation.isPending}
              className="flex-1 bg-[var(--base-surface-1,#141414)] px-3 py-2 text-sm font-medium text-[var(--text-dark-primary,#f5f5f5)] leading-[22px] outline-none disabled:opacity-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Hours per week"
            />
            <div className="bg-[var(--base-fill-1,#333)] px-3 flex items-center">
              <span className="text-sm font-medium text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] leading-[22px] whitespace-nowrap">
                Hours/Week
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Saving indicator */}
      {updateMutation.isPending && (
        <div className="px-6 pb-4">
          <p className="text-xs text-[var(--state-brand-active,#36d399)]">Saving...</p>
        </div>
      )}
    </div>
  );
}

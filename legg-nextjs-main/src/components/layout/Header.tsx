'use client';

import { clsx } from 'clsx';
import { Button } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useJobStore } from '@/stores/jobStore';
import { useMemo } from 'react';
import { generateDays, addDays } from '@/lib/utils/dates';
import { computeSchedule } from '@/lib/utils/scheduling';

interface HeaderProps {
  startMonday: Date;
  onPrevWeek: () => void;
  onThisWeek: () => void;
  onNextWeek: () => void;
}

export function Header({
  startMonday,
  onPrevWeek,
  onThisWeek,
  onNextWeek,
}: HeaderProps) {
  const { activeView, setActiveView, isFullScreen, toggleFullScreen, openSettings } = useUIStore();
  const settings = useSettingsStore();
  const jobs = useJobStore((state) => state.jobs);

  // Calculate current week stats
  const weekStats = useMemo(() => {
    const days = generateDays(startMonday, settings.includeSaturday);

    // Filter to current week only (Mon-Fri/Sat of the anchor week)
    const weekStart = startMonday;
    const weekEnd = addDays(startMonday, 6);
    const thisWeekDays = days.filter(
      (d) => d.date >= weekStart && d.date <= weekEnd
    );

    const params = {
      monThuCapacity: settings.monThuCapacity,
      friUnlockedCapacity: settings.friUnlockedCapacity,
      friLockedCapacity: settings.friLockedCapacity,
      includeSaturday: settings.includeSaturday,
      saturdayCapacity: settings.saturdayCapacity,
      cutMonThuCapacity: settings.cutMonThuCapacity,
      cutFriCapacity: settings.cutFriCapacity,
      dayCapacityOverrides: settings.dayCapacityOverrides,
      fridayLocks: settings.fridayLocks,
    };

    const schedule = computeSchedule(jobs, thisWeekDays, params, activeView);

    // Calculate week capacity
    const weekCapacity = thisWeekDays.reduce((total, day) => {
      if (activeView === 'cut') {
        if (day.isFriday) return total + settings.cutFriCapacity;
        if (day.isSaturday) return total;
        return total + settings.cutMonThuCapacity;
      }

      const override = settings.dayCapacityOverrides[day.id];
      if (override !== undefined) return total + override;

      if (day.isFriday) {
        const isLocked = settings.fridayLocks[day.id] ?? true;
        return total + (isLocked ? settings.friLockedCapacity : settings.friUnlockedCapacity);
      }
      if (day.isSaturday) return total + settings.saturdayCapacity;
      return total + settings.monThuCapacity;
    }, 0);

    return {
      scheduled: schedule.totalHours,
      capacity: weekCapacity,
    };
  }, [jobs, startMonday, settings, activeView]);

  return (
    <header className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-4 flex-shrink-0">
      {/* Left: Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-text whitespace-nowrap">
          LEGG Production Schedule - Live 
        </h1>

        {/* Week Stats */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>
            {weekStats.scheduled.toFixed(1)}h / {weekStats.capacity}h
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* View Toggle */}
        <div className="flex rounded-pill border border-border overflow-hidden">
          <ViewButton
            active={activeView === 'fab'}
            onClick={() => setActiveView('fab')}
          >
            Fab
          </ViewButton>
          <ViewButton
            active={activeView === 'cut'}
            onClick={() => setActiveView('cut')}
          >
            Cut & prep
          </ViewButton>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onPrevWeek}>
            ← Prev
          </Button>
          <Button variant="ghost" size="sm" onClick={onThisWeek}>
            This week
          </Button>
          <Button variant="ghost" size="sm" onClick={onNextWeek}>
            Next →
          </Button>
        </div>

        {/* Fullscreen Toggle */}
        <Button variant="ghost" size="sm" onClick={toggleFullScreen}>
          {isFullScreen ? '⊟' : '⊞'}
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="sm" onClick={openSettings}>
          ⚙
        </Button>
      </div>
    </header>
  );
}

interface ViewButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ViewButton({ active, onClick, children }: ViewButtonProps) {
  return (
    <button
      className={clsx(
        'px-3 py-1.5 text-xs cursor-pointer transition-colors',
        active
          ? 'bg-accent text-bg font-semibold'
          : 'bg-transparent text-text hover:text-accent'
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

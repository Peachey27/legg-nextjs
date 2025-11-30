'use client';

import { useMemo } from 'react';
import { useJobStore } from '@/stores/jobStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import { computeSchedule, getBacklogJobs } from '@/lib/utils/scheduling';
import { generateDays } from '@/lib/utils/dates';
import type { Day } from '@/types';

export function useSchedule(startMonday: Date) {
  const jobs = useJobStore((state) => state.jobs);
  const activeView = useUIStore((state) => state.activeView);
  const {
    monThuCapacity,
    friUnlockedCapacity,
    friLockedCapacity,
    includeSaturday,
    saturdayCapacity,
    cutMonThuCapacity,
    cutFriCapacity,
    dayCapacityOverrides,
    fridayLocks,
  } = useSettingsStore();

  const days = useMemo(() => {
    return generateDays(startMonday, includeSaturday);
  }, [startMonday, includeSaturday]);

  const params = useMemo(
    () => ({
      monThuCapacity,
      friUnlockedCapacity,
      friLockedCapacity,
      includeSaturday,
      saturdayCapacity,
      cutMonThuCapacity,
      cutFriCapacity,
      dayCapacityOverrides,
      fridayLocks,
    }),
    [
      monThuCapacity,
      friUnlockedCapacity,
      friLockedCapacity,
      includeSaturday,
      saturdayCapacity,
      cutMonThuCapacity,
      cutFriCapacity,
      dayCapacityOverrides,
      fridayLocks,
    ]
  );

  const schedule = useMemo(() => {
    return computeSchedule(jobs, days, params, activeView);
  }, [jobs, days, params, activeView]);

  const backlogJobs = useMemo(() => {
    return getBacklogJobs(jobs, activeView);
  }, [jobs, activeView]);

  return {
    days,
    schedule,
    backlogJobs,
    params,
  };
}

export function useDays(startMonday: Date): Day[] {
  const includeSaturday = useSettingsStore((state) => state.includeSaturday);

  return useMemo(() => {
    return generateDays(startMonday, includeSaturday);
  }, [startMonday, includeSaturday]);
}

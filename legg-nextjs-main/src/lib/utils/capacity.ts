import type { Day, ViewMode, AppSettings } from '@/types';

interface CapacityParams extends AppSettings {
  dayCapacityOverrides: Record<string, number>;
  fridayLocks: Record<string, boolean>;
}

export function isFridayLocked(
  day: Day,
  fridayLocks: Record<string, boolean>
): boolean {
  if (!day.isFriday) return false;
  const val = fridayLocks[day.id];
  return val === undefined ? true : val; // default is locked
}

export function getDayCapacity(
  day: Day,
  params: CapacityParams,
  view: ViewMode = 'fab'
): number {
  const {
    monThuCapacity,
    friUnlockedCapacity,
    friLockedCapacity,
    saturdayCapacity,
    cutMonThuCapacity,
    cutFriCapacity,
    dayCapacityOverrides,
    fridayLocks,
  } = params;

  // Apply explicit override for any view
  const override = dayCapacityOverrides[day.id];
  if (override !== undefined) return override;

  if (view === 'cut') {
    if (day.isFriday) return cutFriCapacity;
    if (day.isSaturday) return 0;
    return cutMonThuCapacity;
  }

  // Fab view
  if (day.isFriday) {
    return isFridayLocked(day, fridayLocks)
      ? friLockedCapacity
      : friUnlockedCapacity;
  }

  if (day.isSaturday) {
    return saturdayCapacity;
  }

  return monThuCapacity;
}

export function getWeekCapacity(
  days: Day[],
  params: CapacityParams,
  view: ViewMode = 'fab'
): number {
  return days.reduce((total, day) => {
    return total + getDayCapacity(day, params, view);
  }, 0);
}

export function getDayUsedHours(
  dayId: string,
  scheduleByDay: Record<string, { jobId: string; hours: number }[]>
): number {
  const segments = scheduleByDay[dayId] || [];
  return segments.reduce((sum, seg) => sum + seg.hours, 0);
}

export function getDayFreeHours(
  day: Day,
  scheduleByDay: Record<string, { jobId: string; hours: number }[]>,
  params: CapacityParams,
  view: ViewMode = 'fab'
): number {
  const capacity = getDayCapacity(day, params, view);
  const used = getDayUsedHours(day.id, scheduleByDay);
  return Math.max(capacity - used, 0);
}

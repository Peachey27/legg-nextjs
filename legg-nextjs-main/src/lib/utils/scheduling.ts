import type { Job, ViewMode, Day, ScheduleByDay, AppSettings } from '@/types';
import { getDayCapacity, isFridayLocked } from './capacity';

interface ScheduleParams extends AppSettings {
  dayCapacityOverrides: Record<string, number>;
  fridayLocks: Record<string, boolean>;
}

export function getViewFields(job: Job, view: ViewMode) {
  if (view === 'cut') {
    const extra = job.extraCutHours ?? 0;
    return {
      hours: (job.cutHours ?? 0) + extra,
      startDayId: job.cutStartDayId ?? null,
      order: job.cutOrder ?? job.order,
    };
  }
  const extra = job.extraHours ?? 0;
  return {
    hours: job.totalHours + extra,
    startDayId: job.startDayId,
    order: job.order,
  };
}

export function setViewFields(
  job: Job,
  view: ViewMode,
  updates: Partial<{ startDayId: string | null; order: number }>
): Job {
  if (view === 'cut') {
    return {
      ...job,
      cutStartDayId: updates.startDayId !== undefined ? updates.startDayId : job.cutStartDayId,
      cutOrder: updates.order !== undefined ? updates.order : (job.cutOrder ?? job.order),
    };
  }
  return {
    ...job,
    startDayId: updates.startDayId !== undefined ? updates.startDayId : job.startDayId,
    order: updates.order !== undefined ? updates.order : job.order,
  };
}

export function normaliseOrdersForView(jobsArr: Job[], view: ViewMode): Job[] {
  const sorted = [...jobsArr].sort((a, b) => {
    const aOrder = getViewFields(a, view).order;
    const bOrder = getViewFields(b, view).order;
    return aOrder - bOrder;
  });
  return sorted.map((j, idx) => setViewFields(j, view, { order: idx + 1 }));
}

export function normaliseAllOrders(jobsArr: Job[]): Job[] {
  return normaliseOrdersForView(normaliseOrdersForView(jobsArr, 'fab'), 'cut');
}

export function getBacklogJobs(jobs: Job[], view: ViewMode): Job[] {
  // Backlog is per-view: only show jobs that are unscheduled in the active view.
  const backlog = jobs.filter((j) => {
    const viewFields = getViewFields(j, view);
    return viewFields.startDayId === null && viewFields.hours > 0;
  });

  // Sort by order within the current view (stable with updatedAt as secondary).
  return backlog.sort((a, b) => {
    const aView = getViewFields(a, view);
    const bView = getViewFields(b, view);
    if (aView.order !== bView.order) return aView.order - bView.order;
    const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bUpdated - aUpdated;
  });
}

export function computeSchedule(
  jobs: Job[],
  days: Day[],
  params: ScheduleParams,
  view: ViewMode
): { scheduleByDay: ScheduleByDay; totalHours: number } {
  const scheduleByDay: ScheduleByDay = {};

  // Initialize empty arrays for each day
  days.forEach((d) => {
    scheduleByDay[d.id] = [];
  });

  // Get scheduled jobs sorted by start day and order
  const scheduledJobs = [...jobs]
    .filter((j) => {
      const viewData = getViewFields(j, view);
      return viewData.startDayId !== null && viewData.hours > 0;
    })
    .sort((a, b) => {
      const aView = getViewFields(a, view);
      const bView = getViewFields(b, view);
      if (aView.startDayId !== bView.startDayId) {
        return aView.startDayId! < bView.startDayId! ? -1 : 1;
      }
      return aView.order - bView.order;
    });

  // Allocate hours across days
  for (const job of scheduledJobs) {
    const viewData = getViewFields(job, view);
    const startDayId = viewData.startDayId!;
    let startIndex = days.findIndex((d) => d.id === startDayId);

    // If job starts before visible window, start from first visible day after start date
    if (startIndex === -1) {
      const startDate = new Date(startDayId);
      startIndex = days.findIndex((d) => d.date >= startDate);
      if (startIndex === -1) continue; // Job ends before visible window
    }

    let remaining = viewData.hours;

    for (let di = startIndex; di < days.length && remaining > 0; di++) {
      const day = days[di];

      // Respect screens-only Fridays (only in fab view)
      if (
        view === 'fab' &&
        isFridayLocked(day, params.fridayLocks) &&
        job.type !== 'screens' &&
        day.isFriday
      ) {
        continue;
      }

      const capacity = getDayCapacity(day, params, view);
      const used = scheduleByDay[day.id].reduce((sum, seg) => sum + seg.hours, 0);
      const free = Math.max(capacity - used, 0);

      if (free <= 0) continue;

      const alloc = Math.min(free, remaining);
      scheduleByDay[day.id].push({
        jobId: job.id,
        hours: alloc,
      });
      remaining -= alloc;
    }
  }

  // Calculate total scheduled hours
  const totalHours = Object.values(scheduleByDay)
    .flat()
    .reduce((sum, seg) => sum + seg.hours, 0);

  return { scheduleByDay, totalHours };
}

export function getJobsOnDay(
  dayId: string,
  scheduleByDay: ScheduleByDay,
  jobs: Job[]
): { job: Job; hours: number }[] {
  const segments = scheduleByDay[dayId] || [];
  return segments
    .map((seg) => {
      const job = jobs.find((j) => j.id === seg.jobId);
      return job ? { job, hours: seg.hours } : null;
    })
    .filter((item): item is { job: Job; hours: number } => item !== null);
}

export function formatJobTitle(title: string): string {
  // Format Mc-style names (e.g., "mccourt" -> "McCOURT")
  return title.replace(/^mc/i, 'Mc').toUpperCase();
}

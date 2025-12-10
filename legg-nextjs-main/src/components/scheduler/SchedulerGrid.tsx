'use client';

import { clsx } from 'clsx';
import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { DayColumn } from './DayColumn';
import { startOfToday, getPreviousFriday, toISODateString, startOfThisWeekMonday } from '@/lib/utils/dates';
import { useJobStore } from '@/stores/jobStore';
import { useUIStore } from '@/stores/uiStore';
import type { Day, ScheduleByDay, AppSettings, ViewMode, Job } from '@/types';

type CapacityParams = AppSettings & {
  dayCapacityOverrides: Record<string, Partial<Record<ViewMode, number>>>;
  fridayLocks: Record<string, boolean>;
};

interface SchedulerGridProps {
  days: Day[];
  scheduleByDay: ScheduleByDay;
  isFullScreen?: boolean;
  startMonday: Date;
  params: CapacityParams;
}

export function SchedulerGrid({ days, scheduleByDay, isFullScreen, startMonday, params }: SchedulerGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const jobs = useJobStore((state) => state.jobs);
  const activeView = useUIStore((state) => state.activeView);
  const [showFinder, setShowFinder] = useState(false);
  const [query, setQuery] = useState('');
  const handleAutoScrollDragOver = useCallback((e: React.DragEvent) => {
    const container = scrollRef.current;
    if (!container) return;

    e.preventDefault();

    const bounds = container.getBoundingClientRect();
    const x = e.clientX;
    const threshold = 60; // px from edge to start auto-scrolling
    const speed = 20; // px per event

    if (x - bounds.left < threshold) {
      container.scrollLeft -= speed;
    } else if (bounds.right - x < threshold) {
      container.scrollLeft += speed;
    }
  }, []);

  // Compute per-segment extra fractions so only the tail (extra hours) is striped.
  const extraFractionsByDay = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    const remaining: Record<string, { base: number; extra: number }> = {};

    jobs.forEach((j) => {
      const base = activeView === 'cut' ? j.cutHours : j.totalHours;
      const extra = activeView === 'cut' ? j.extraCutHours ?? 0 : j.extraHours ?? 0;
      remaining[j.id] = { base: base ?? 0, extra: extra ?? 0 };
    });

    days.forEach((day) => {
      const segs = scheduleByDay[day.id] || [];
      segs.forEach((seg) => {
        const rem = remaining[seg.jobId];
        if (!rem) return;
        const baseUse = Math.min(rem.base, seg.hours);
        const extraInSeg = Math.max(0, seg.hours - baseUse);
        rem.base = Math.max(0, rem.base - baseUse);
        rem.extra = Math.max(0, rem.extra - extraInSeg);
        const fraction = seg.hours > 0 ? extraInSeg / seg.hours : 0;
        if (!map[day.id]) map[day.id] = {};
        map[day.id][seg.jobId] = fraction;
      });
    });

    return map;
  }, [activeView, days, jobs, scheduleByDay]);

  const dayLabelMap = useMemo(() => {
    const m: Record<string, string> = {};
    days.forEach((d) => {
      m[d.id] = d.label;
    });
    return m;
  }, [days]);

  const scheduledByJob = useMemo(() => {
    const lookup: Record<
      string,
      { job: Job; dayId: string; dayLabel: string; hours: number }
    > = {};

    days.forEach((day) => {
      const segments = scheduleByDay[day.id] || [];
      segments.forEach((seg) => {
        if (lookup[seg.jobId]) return;
        const job = jobs.find((j) => j.id === seg.jobId);
        if (!job) return;
        lookup[seg.jobId] = {
          job,
          dayId: day.id,
          dayLabel: dayLabelMap[day.id],
          hours: seg.hours,
        };
      });
    });

    return lookup;
  }, [days, scheduleByDay, jobs, dayLabelMap]);

  const finderResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return Object.values(scheduledByJob).filter(({ job }) => {
      const title = job.title?.toLowerCase() || '';
      const vq = job.vquote?.toLowerCase() || '';
      return title.includes(term) || vq.includes(term);
    });
  }, [query, scheduledByJob]);

  const today = startOfToday();
  const todayId = toISODateString(today);
  const prevFridayId = toISODateString(getPreviousFriday(today));
  const anchorId = toISODateString(startMonday);
  const currentWeekMondayId = toISODateString(startOfThisWeekMonday());

  // Auto-scroll to previous Friday or today on mount
  useEffect(() => {
    if (!scrollRef.current || days.length === 0) return;

    const idxAnchor = days.findIndex((d) => d.id === anchorId);
    const idxPrevFriday = days.findIndex((d) => d.id === prevFridayId);
    const idxToday = days.findIndex((d) => d.id === todayId);
    const isCurrentWeek = anchorId === currentWeekMondayId;

    let targetIdx = 0;

    if (isCurrentWeek && idxToday !== -1) {
      // Column 1 = previous workday, Column 2 = today
      let idxPrevWorkday = 0;
      for (let i = idxToday - 1; i >= 0; i--) {
        if (days[i]) {
          idxPrevWorkday = i;
          break;
        }
      }
      targetIdx = idxPrevWorkday;
    } else if (idxAnchor !== -1) {
      targetIdx = idxAnchor;
    } else if (isFullScreen && idxToday !== -1) {
      targetIdx = Math.max(0, idxToday - 1);
    } else if (idxPrevFriday !== -1) {
      targetIdx = idxPrevFriday;
    } else if (idxToday !== -1) {
      targetIdx = Math.max(0, idxToday - 1);
    }

    const targetDayId = days[targetIdx]?.id;
    if (!targetDayId) return;

    const targetEl = scrollRef.current.querySelector(
      `[data-day-id="${targetDayId}"]`
    ) as HTMLElement | null;

    if (targetEl) {
      const offset = targetEl.offsetLeft;
      scrollRef.current.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }, [days, prevFridayId, todayId, isFullScreen, anchorId, currentWeekMondayId]);

  return (
    <div
      ref={scrollRef}
      className={clsx(
        'flex-1 overflow-x-auto overflow-y-hidden',
        'mobile-landscape-zoom',
        'sm:px-2 px-1 sm:py-3 py-2',
        'max-sm:scale-[0.9] max-sm:origin-top-left',
        'scrollbar-custom'
      )}
      onDragOver={handleAutoScrollDragOver}
    >
      {/* Mobile floating finder */}
      <div className="sm:hidden fixed right-3 top-20 z-30 w-[42%] max-w-xs">
        {!showFinder ? (
          <button
            className="w-full rounded-full bg-accent text-bg px-3 py-2 text-xs font-semibold shadow-lg"
            onClick={() => setShowFinder(true)}
          >
            Find Job / VQ
          </button>
        ) : (
          <div className="bg-bg-softer/95 border border-white/10 rounded-xl p-3 space-y-2 shadow-xl">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-border bg-bg px-2 py-1 text-xs text-text focus:outline-none focus:border-accent"
                placeholder="Search title or VQuote"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <button
                className="rounded-lg bg-accent/80 text-bg px-2 py-1 text-[11px] font-semibold"
                onClick={() => {
                  setShowFinder(false);
                  setQuery('');
                }}
              >
                Close
              </button>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1">
              {query.trim().length === 0 && (
                <div className="text-[11px] text-text-muted">Type to find a job...</div>
              )}
              {query.trim().length > 0 && finderResults.length === 0 && (
                <div className="text-[11px] text-text-muted">No matches in the active view.</div>
              )}
              {finderResults.map((entry) => (
                <div
                  key={entry.job.id}
                  className="rounded-lg border border-white/10 bg-bg px-2 py-1 text-[11px] text-text"
                  style={{ borderLeft: `6px solid ${entry.job.color}` }}
                >
                  <div className="font-semibold">{entry.job.title.toUpperCase()}</div>
                  <div className="text-text-muted">VQ {entry.job.vquote}</div>
                  <div className="text-accent">{entry.dayLabel}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex h-full">
        {days.map((day) => (
          <DayColumn
            key={day.id}
            day={day}
            segments={scheduleByDay[day.id] || []}
            isFullScreen={isFullScreen}
            extraFractions={extraFractionsByDay[day.id]}
            params={params}
          />
        ))}
      </div>
    </div>
  );
}

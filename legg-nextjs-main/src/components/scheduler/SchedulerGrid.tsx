'use client';

import { clsx } from 'clsx';
import { useRef, useEffect, useCallback, useMemo } from 'react';
import { DayColumn } from './DayColumn';
import { startOfToday, getPreviousFriday, toISODateString } from '@/lib/utils/dates';
import { useJobStore } from '@/stores/jobStore';
import { useUIStore } from '@/stores/uiStore';
import type { Day, ScheduleByDay } from '@/types';

interface SchedulerGridProps {
  days: Day[];
  scheduleByDay: ScheduleByDay;
  isFullScreen?: boolean;
}

export function SchedulerGrid({ days, scheduleByDay, isFullScreen }: SchedulerGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const jobs = useJobStore((state) => state.jobs);
  const activeView = useUIStore((state) => state.activeView);
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

  // Auto-scroll to previous Friday or today on mount
  useEffect(() => {
    if (!scrollRef.current || days.length === 0) return;

    const today = startOfToday();
    const prevFriday = getPreviousFriday(today);

    const prevFridayId = toISODateString(prevFriday);
    const todayId = toISODateString(today);

    const idxPrevFriday = days.findIndex((d) => d.id === prevFridayId);
    const idxToday = days.findIndex((d) => d.id === todayId);

    const targetIdx =
      idxPrevFriday !== -1
        ? idxPrevFriday
        : idxToday !== -1
        ? Math.max(0, idxToday - 1)
        : 0;

    const targetDayId = days[targetIdx]?.id;
    if (!targetDayId) return;

    const targetEl = scrollRef.current.querySelector(
      `[data-day-id="${targetDayId}"]`
    ) as HTMLElement | null;

    if (targetEl) {
      const offset = targetEl.offsetLeft;
      scrollRef.current.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }, [days]);

  return (
    <div
      ref={scrollRef}
      className={clsx(
        'flex-1 overflow-x-auto overflow-y-hidden',
        'px-2 py-3',
        'scrollbar-custom'
      )}
      onDragOver={handleAutoScrollDragOver}
    >
      <div className="flex h-full">
        {days.map((day) => (
          <DayColumn
            key={day.id}
            day={day}
            segments={scheduleByDay[day.id] || []}
            isFullScreen={isFullScreen}
            extraFractions={extraFractionsByDay[day.id]}
          />
        ))}
      </div>
    </div>
  );
}

'use client';

import { clsx } from 'clsx';
import { useRef, useEffect, useCallback } from 'react';
import { DayColumn } from './DayColumn';
import { startOfToday, getPreviousFriday, toISODateString } from '@/lib/utils/dates';
import type { Day, ScheduleByDay } from '@/types';

interface SchedulerGridProps {
  days: Day[];
  scheduleByDay: ScheduleByDay;
  isFullScreen?: boolean;
}

export function SchedulerGrid({ days, scheduleByDay, isFullScreen }: SchedulerGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
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
          />
        ))}
      </div>
    </div>
  );
}

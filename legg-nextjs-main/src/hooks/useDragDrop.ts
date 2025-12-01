'use client';

import { useCallback } from 'react';
import { useJobStore } from '@/stores/jobStore';
import { useUIStore } from '@/stores/uiStore';
import { getViewFields, normaliseAllOrders } from '@/lib/utils/scheduling';
import type { Job, ViewMode } from '@/types';

export function useDragDrop() {
  const jobs = useJobStore((state) => state.jobs);
  const setJobs = useJobStore((state) => state.setJobs);
  const activeView = useUIStore((state) => state.activeView);

  const handleDragStart = useCallback(
    (e: React.DragEvent, jobId: string) => {
      e.dataTransfer.setData('jobId', jobId);
      e.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  const handleDropToBacklog = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const jobId = e.dataTransfer.getData('jobId');
      if (!jobId) return;

      // Update local state - move job to backlog in BOTH views
      const updatedJobs = jobs.map((j) => {
        if (j.id !== jobId) return j;
        return {
          ...j,
          startDayId: null,
          cutStartDayId: null,
        };
      });

      // Normalize orders for both views and update
      const normalized = normaliseAllOrders(updatedJobs);
      setJobs(normalized);

      // Persist to API
      persistJobsToApi(normalized);
    },
    [jobs, setJobs, activeView]
  );

  const handleDropToDay = useCallback(
    (
      e: React.DragEvent,
      dayId: string,
      jobIdsOnDay: string[],
      dropY: number,
      containerHeight: number
    ) => {
      e.preventDefault();
      const jobId = e.dataTransfer.getData('jobId');
      if (!jobId) return;

      const job = jobs.find((j) => j.id === jobId);
      if (!job) return;

      // IMPORTANT: Filter out the dragged job FIRST before calculating insert index
      const idsOnDay = jobIdsOnDay.filter((id) => id !== jobId);

      // Calculate insert position based on drop Y position
      const slotCount = idsOnDay.length + 1;
      const fraction = Math.max(0, Math.min(1, dropY / containerHeight));
      const insertIndex = Math.min(idsOnDay.length, Math.floor(fraction * slotCount));

      // Set the dragged job's startDayId to the target day
      let updatedJobs = jobs.map((j) => {
        if (j.id !== jobId) return j;
        if (activeView === 'fab') {
          return { ...j, startDayId: dayId };
        } else {
          return { ...j, cutStartDayId: dayId };
        }
      });

      // Get other jobs (excluding dragged job) that have hours on this day, sorted by order
      const jobsOnDay = jobs
        .filter((j) => j.id !== jobId && idsOnDay.includes(j.id))
        .sort((a, b) => {
          const aOrder = getViewFields(a, activeView).order;
          const bOrder = getViewFields(b, activeView).order;
          return aOrder - bOrder;
        });

      // Calculate new order using fractional positioning (matching original logic)
      let newOrder: number;

      if (jobsOnDay.length === 0) {
        // No other jobs on day - use max order + 1
        const maxOrder = jobs
          .filter((j) => j.id !== jobId)
          .reduce((m, j) => Math.max(m, getViewFields(j, activeView).order), 0);
        newOrder = maxOrder + 1;
      } else if (insertIndex <= 0) {
        // Insert at beginning - use first job's order - 0.5
        newOrder = getViewFields(jobsOnDay[0], activeView).order - 0.5;
      } else if (insertIndex >= jobsOnDay.length) {
        // Insert at end - use last job's order + 0.5
        newOrder = getViewFields(jobsOnDay[jobsOnDay.length - 1], activeView).order + 0.5;
      } else {
        // Insert in middle - use midpoint between adjacent jobs
        const beforeOrder = getViewFields(jobsOnDay[insertIndex - 1], activeView).order;
        const afterOrder = getViewFields(jobsOnDay[insertIndex], activeView).order;
        newOrder = (beforeOrder + afterOrder) / 2;
      }

      // Update the dragged job with new order
      updatedJobs = updatedJobs.map((j) => {
        if (j.id !== jobId) return j;
        if (activeView === 'fab') {
          return { ...j, order: newOrder };
        } else {
          return { ...j, cutOrder: newOrder };
        }
      });

      // Normalize all orders (renumber 1, 2, 3, ...)
      const normalized = normaliseOrdersForView(updatedJobs, activeView);
      setJobs(normalized);

      // Persist to API
      persistJobsToApi(normalized);
    },
    [jobs, setJobs, activeView]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  return {
    handleDragStart,
    handleDropToBacklog,
    handleDropToDay,
    handleDragOver,
  };
}

// Helper: normalize orders for a view (renumber sequentially)
function normaliseOrdersForView(jobsArr: Job[], view: ViewMode): Job[] {
  const sorted = [...jobsArr].sort((a, b) => {
    const aOrder = getViewFields(a, view).order;
    const bOrder = getViewFields(b, view).order;
    return aOrder - bOrder;
  });

  return sorted.map((j, idx) => {
    if (view === 'fab') {
      return { ...j, order: idx + 1 };
    } else {
      return { ...j, cutOrder: idx + 1 };
    }
  });
}

// Helper: persist jobs to API (fire-and-forget)
async function persistJobsToApi(jobs: Job[]) {
  try {
    await fetch('/api/jobs/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobs: jobs.map((j) => ({
          id: j.id,
          order: j.order,
          cutOrder: j.cutOrder,
          startDayId: j.startDayId,
          cutStartDayId: j.cutStartDayId,
        }))
      }),
    });
  } catch (error) {
    console.error('Failed to persist jobs:', error);
  }
}

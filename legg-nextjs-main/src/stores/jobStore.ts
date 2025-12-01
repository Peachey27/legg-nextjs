'use client';

import { create } from 'zustand';
import type { Job, ViewMode } from '@/types';

interface JobStore {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setJobs: (jobs: Job[]) => void;
  fetchJobs: () => Promise<void>;
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Job | null>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  reorderJobs: (view: ViewMode, orders: { id: string; order: number; dayId: string | null }[]) => Promise<void>;

  // Local state updates
  updateJobLocal: (id: string, updates: Partial<Job>) => void;
  moveToBacklog: (id: string, view: ViewMode) => void;
}

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],
  isLoading: false,
  error: null,

  setJobs: (jobs) => set({ jobs }),

  fetchJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const jobs = await response.json();
      set({ jobs, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addJob: async (jobData) => {
    try {
      // Clamp orders to integers before sending to the API (DB uses integer columns)
      const payload = {
        ...jobData,
        order: Math.floor(Number(jobData.order) || 0),
        cutOrder: Math.floor(Number(jobData.cutOrder) || 0),
        extraHours: jobData.extraHours ?? 0,
        extraCutHours: jobData.extraCutHours ?? 0,
      };

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create job');
      const newJob = await response.json();

      // Ensure fields are explicitly set for backlog logic and sorting
      const hydratedJob = {
        ...newJob,
        startDayId: newJob.startDayId ?? null,
        cutStartDayId: newJob.cutStartDayId ?? null,
        updatedAt: newJob.updatedAt ?? new Date().toISOString(),
        createdAt: newJob.createdAt ?? new Date().toISOString(),
        extraHours: newJob.extraHours ?? 0,
        extraCutHours: newJob.extraCutHours ?? 0,
      };

      set((state) => ({ jobs: [...state.jobs, hydratedJob] }));
      return hydratedJob;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  updateJob: async (id, updates) => {
    // Optimistic update
    const previousJobs = get().jobs;
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
    }));

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update job');
    } catch (error) {
      // Revert on error
      set({ jobs: previousJobs, error: (error as Error).message });
    }
  },

  deleteJob: async (id) => {
    const previousJobs = get().jobs;
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
    }));

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete job');
    } catch (error) {
      set({ jobs: previousJobs, error: (error as Error).message });
    }
  },

  reorderJobs: async (view, orders) => {
    // Optimistic update
    const previousJobs = get().jobs;
    set((state) => ({
      jobs: state.jobs.map((job) => {
        const orderUpdate = orders.find((o) => o.id === job.id);
        if (!orderUpdate) return job;
        if (view === 'fab') {
          return { ...job, order: orderUpdate.order, startDayId: orderUpdate.dayId };
        } else {
          return { ...job, cutOrder: orderUpdate.order, cutStartDayId: orderUpdate.dayId };
        }
      }),
    }));

    try {
      const response = await fetch('/api/jobs/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ view, orders }),
      });
      if (!response.ok) throw new Error('Failed to reorder jobs');
    } catch (error) {
      set({ jobs: previousJobs, error: (error as Error).message });
    }
  },

  updateJobLocal: (id, updates) => {
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
    }));
  },

  moveToBacklog: (id, view) => {
    set((state) => ({
      jobs: state.jobs.map((j) => {
        if (j.id !== id) return j;
        if (view === 'fab') {
          return { ...j, startDayId: null, order: 0 };
        } else {
          return { ...j, cutStartDayId: null, cutOrder: 0 };
        }
      }),
    }));
  },
}));

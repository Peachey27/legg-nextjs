'use client';

import { create } from 'zustand';
import type { ViewMode, Day } from '@/types';

interface UIStore {
  activeView: ViewMode;
  isFullScreen: boolean;
  editingJobId: string | null;
  settingsOpen: boolean;
  capEditDay: Day | null;
  gapAlertDayId: string | null;
  dismissedGapDayId: string | null;
  copiedJobTemplate: {
    title: string;
    vquote: string;
    totalHours: number;
    cutHours: number;
    type: 'windows' | 'screens';
    color: string;
    note: string;
  } | null;

  // Actions
  setActiveView: (view: ViewMode) => void;
  toggleFullScreen: () => void;
  setFullScreen: (value: boolean) => void;
  openEditJob: (id: string) => void;
  closeEditJob: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openCapEdit: (day: Day) => void;
  closeCapEdit: () => void;
  setGapAlert: (dayId: string | null) => void;
  dismissGap: (dayId: string) => void;
  setCopiedJob: (template: UIStore['copiedJobTemplate']) => void;
  clearCopiedJob: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeView: 'fab',
  isFullScreen: false,
  editingJobId: null,
  settingsOpen: false,
  capEditDay: null,
  gapAlertDayId: null,
  dismissedGapDayId: null,
  copiedJobTemplate: null,

  setActiveView: (view) => set({ activeView: view }),

  toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),

  setFullScreen: (value) => set({ isFullScreen: value }),

  openEditJob: (id) => set({ editingJobId: id }),

  closeEditJob: () => set({ editingJobId: null }),

  openSettings: () => set({ settingsOpen: true }),

  closeSettings: () => set({ settingsOpen: false }),

  openCapEdit: (day) => set({ capEditDay: day }),

  closeCapEdit: () => set({ capEditDay: null }),

  setGapAlert: (dayId) => set({ gapAlertDayId: dayId }),

  dismissGap: (dayId) => set({ dismissedGapDayId: dayId, gapAlertDayId: null }),

  setCopiedJob: (template) => set({ copiedJobTemplate: template }),

  clearCopiedJob: () => set({ copiedJobTemplate: null }),
}));

'use client';

import { create } from 'zustand';
import { DEFAULT_SETTINGS, type AppSettings } from '@/types';

interface SettingsStore extends AppSettings {
  dayCapacityOverrides: Record<string, number>;
  fridayLocks: Record<string, boolean>;
  dayNotes: Record<string, string>;
  isLoading: boolean;

  // Actions
  fetchSettings: () => Promise<void>;
  fetchDaySettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  setDayCapacityOverride: (dayId: string, capacity: number | undefined) => void;
  toggleFridayLock: (dayId: string) => void;
  setDayNote: (dayId: string, note: string) => void;
  saveDaySettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  dayCapacityOverrides: {},
  fridayLocks: {},
  dayNotes: {},
  isLoading: false,

  fetchSettings: async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) return;
      const settings = await response.json();
      set(settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  },

  fetchDaySettings: async () => {
    try {
      const response = await fetch('/api/day-settings');
      if (!response.ok) return;
      const allSettings = await response.json();

      const dayCapacityOverrides: Record<string, number> = {};
      const fridayLocks: Record<string, boolean> = {};
      const dayNotes: Record<string, string> = {};

      for (const ds of allSettings) {
        const dayKey =
          typeof ds.dayId === 'string'
            ? ds.dayId.slice(0, 10)
            : new Date(ds.dayId).toISOString().slice(0, 10);

        if (ds.capacityOverride !== null) {
          dayCapacityOverrides[dayKey] = ds.capacityOverride;
        }
        if (ds.isFridayLocked !== null) {
          fridayLocks[dayKey] = ds.isFridayLocked;
        }
        if (ds.dayNote) {
          dayNotes[dayKey] = ds.dayNote;
        }
      }

      set({ dayCapacityOverrides, fridayLocks, dayNotes });
    } catch (error) {
      console.error('Failed to fetch day settings:', error);
    }
  },

  updateSettings: async (updates) => {
    const previousState = get();
    set(updates);

    try {
      const currentSettings: AppSettings = {
        monThuCapacity: get().monThuCapacity,
        friUnlockedCapacity: get().friUnlockedCapacity,
        friLockedCapacity: get().friLockedCapacity,
        includeSaturday: get().includeSaturday,
        saturdayCapacity: get().saturdayCapacity,
        cutMonThuCapacity: get().cutMonThuCapacity,
        cutFriCapacity: get().cutFriCapacity,
      };

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSettings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
    } catch (error) {
      // Revert on error
      set(previousState);
      console.error('Failed to save settings:', error);
    }
  },

  setDayCapacityOverride: (dayId, capacity) => {
    set((state) => {
      const newOverrides = { ...state.dayCapacityOverrides };
      if (capacity === undefined) {
        delete newOverrides[dayId];
      } else {
        newOverrides[dayId] = capacity;
      }
      return { dayCapacityOverrides: newOverrides };
    });
  },

  toggleFridayLock: (dayId) => {
    set((state) => {
      const currentLock = state.fridayLocks[dayId] ?? true; // Default is locked
      return {
        fridayLocks: {
          ...state.fridayLocks,
          [dayId]: !currentLock,
        },
      };
    });
  },

  setDayNote: (dayId, note) => {
    set((state) => ({
      dayNotes: {
        ...state.dayNotes,
        [dayId]: note,
      },
    }));
  },

  saveDaySettings: async () => {
    const { dayCapacityOverrides, fridayLocks, dayNotes } = get();

    const allDayIds = new Set([
      ...Object.keys(dayCapacityOverrides),
      ...Object.keys(fridayLocks),
      ...Object.keys(dayNotes),
    ]);

    const settings = Array.from(allDayIds).map((dayId) => ({
      dayId,
      capacityOverride: dayCapacityOverrides[dayId] ?? null,
      isFridayLocked: fridayLocks[dayId] ?? null,
      dayNote: dayNotes[dayId] ?? '',
    }));

    try {
      const response = await fetch('/api/day-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to save day settings');
    } catch (error) {
      console.error('Failed to save day settings:', error);
    }
  },
}));

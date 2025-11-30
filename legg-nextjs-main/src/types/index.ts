export type JobType = 'windows' | 'screens';

export interface Job {
  id: string;
  title: string;
  vquote: string;
  totalHours: number;
  cutHours: number;
  type: JobType;
  color: string;
  note: string;
  startDayId: string | null;
  order: number;
  cutStartDayId: string | null;
  cutOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Day {
  id: string;
  date: Date;
  label: string;
  isFriday: boolean;
  isSaturday: boolean;
}

export interface DaySettings {
  dayId: string;
  capacityOverride: number | null;
  isFridayLocked: boolean | null;
  dayNote: string;
}

export interface AppSettings {
  monThuCapacity: number;
  friUnlockedCapacity: number;
  friLockedCapacity: number;
  includeSaturday: boolean;
  saturdayCapacity: number;
  cutMonThuCapacity: number;
  cutFriCapacity: number;
}

export type ViewMode = 'fab' | 'cut';

export interface JobSegment {
  jobId: string;
  hours: number;
}

export interface ScheduleByDay {
  [dayId: string]: JobSegment[];
}

export const JOB_COLORS = [
  '#ff6fae', // pink
  '#2b9df4', // blue
  '#95e062', // lime
  '#ffd166', // yellow
  '#ff3b6b', // coral
  '#a78bfa', // violet
  '#4fd1c5', // teal
  '#ff922b', // orange
  '#2ec27e', // green
] as const;

export const DEFAULT_SETTINGS: AppSettings = {
  monThuCapacity: 13,
  friUnlockedCapacity: 13,
  friLockedCapacity: 4,
  includeSaturday: false,
  saturdayCapacity: 8,
  cutMonThuCapacity: 10,
  cutFriCapacity: 0,
};

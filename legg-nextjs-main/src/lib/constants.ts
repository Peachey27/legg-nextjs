export const DEFAULT_CAPACITY = {
  monThu: 13,
  friUnlocked: 13,
  friLocked: 4,
  saturday: 8,
  cutMonThu: 10,
  cutFri: 0,
};

export const WEEKS_AHEAD = 12;
export const WEEKS_BACK = 2;

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

export const DEFAULT_JOB_COLOR = JOB_COLORS[0];

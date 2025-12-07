export const DEFAULT_CAPACITY = {
  monThu: 13,
  friUnlocked: 13,
  friLocked: 4,
  saturday: 8,
  cutMonThu: 10,
  cutFri: 0,
};

export const WEEKS_AHEAD = 12;
// Show 4 weeks of history instead of 2
export const WEEKS_BACK = 4;

export const JOB_COLORS = [
  '#ff6fae', // pink
  '#2b9df4', // blue
  '#95e062', // lime
  '#ffd166', // yellow
  '#ff1744', // bright red
  '#a78bfa', // violet
  '#4fd1c5', // teal
  '#ff922b', // orange
  '#2ec27e', // green
  '#000000', // black (striped option)
] as const;

export const DEFAULT_JOB_COLOR = JOB_COLORS[0];

import { pgTable, uuid, varchar, decimal, text, date, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  vquote: varchar('vquote', { length: 50 }).notNull().default(''),
  totalHours: decimal('total_hours', { precision: 10, scale: 2 }).notNull().default('0'),
  extraHours: decimal('extra_hours', { precision: 10, scale: 2 }).notNull().default('0'),
  cutHours: decimal('cut_hours', { precision: 10, scale: 2 }).notNull().default('0'),
  extraCutHours: decimal('extra_cut_hours', { precision: 10, scale: 2 }).notNull().default('0'),
  type: varchar('type', { length: 20 }).notNull().default('windows'),
  color: varchar('color', { length: 20 }).notNull().default('#ff6fae'),
  note: text('note').default(''),
  startDayId: date('start_day_id'),
  order: integer('sort_order').notNull().default(0),
  cutStartDayId: date('cut_start_day_id'),
  cutOrder: integer('cut_sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const daySettings = pgTable('day_settings', {
  dayId: date('day_id').primaryKey(),
  capacityOverride: integer('capacity_override'),
  isFridayLocked: boolean('is_friday_locked'),
  dayNote: text('day_note').default(''),
});

export const appSettings = pgTable('app_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type JobRow = typeof jobs.$inferSelect;
export type NewJobRow = typeof jobs.$inferInsert;
export type DaySettingsRow = typeof daySettings.$inferSelect;
export type NewDaySettingsRow = typeof daySettings.$inferInsert;
export type AppSettingsRow = typeof appSettings.$inferSelect;

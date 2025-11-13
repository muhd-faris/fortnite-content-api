import { relations } from 'drizzle-orm';
import { pgTable, pgEnum, varchar, integer, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

export const TournamentRegionEnum = pgEnum('tournament_region_enum', [
  'asia',
  'br',
  'eu',
  'me',
  'oce',
  'nae',
  'naw',
  'nac',
  'onsite',
]);

export const SeasonHistoryTable = pgTable('season_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  chapter: integer('chapter').notNull(),
  season_code: integer('season_code').notNull(),
  season_in_chapter: integer('season_in_chapter').notNull(),
  display_name: varchar('display_name', { length: 100 }).notNull(),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export const FortniteCrewTable = pgTable('fortnite_crew', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Typically were only interested with month and year only but for sorting purpose all are default to 1st of the month
  crew_date: timestamp('crew_date').notNull(),
  color_1: varchar('color_1').notNull(),
  color_2: varchar('color_2').notNull(),
  color_3: varchar('color_3').notNull(),
  image_with_bg: varchar('image_with_bg').notNull(),
  rewards_id: varchar('rewards_id').array().notNull().default([]),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export const FortniteTournamentTable = pgTable('fortnite_tournaments', {
  id: uuid('id').primaryKey().defaultRandom(),
  event_id: varchar('event_id', { length: 255 }).notNull(),
  start_time: timestamp('start_time').notNull(),
  end_time: timestamp('end_time').notNull(),
  region: TournamentRegionEnum('region').notNull(),
  platforms: varchar('platforms', { length: 255 }).array().default([]).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export const FortniteTournamentSessionTable = pgTable('fortnite_tournament_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  window_id: varchar('window_id', { length: 255 }).notNull(),
  countdown_starts_at: timestamp('countdown_starts_at').notNull(),
  start_time: timestamp('start_time').notNull(),
  end_time: timestamp('end_time').notNull(),
  scoring_id: uuid('scoring_id')
    .notNull()
    .references(() => FortniteTournamentScoringTable.id, {
      onDelete: 'set default',
    }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export const FortniteTournamentScoringTable = pgTable('fortnite_tournament_scorings', {
  id: uuid('id').primaryKey().defaultRandom(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export const FortniteTournamentPayoutTable = pgTable('fortnite_tournament_payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

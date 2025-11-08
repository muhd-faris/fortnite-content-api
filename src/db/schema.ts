import { relations } from 'drizzle-orm';
import {
    pgTable,
    pgEnum,
    varchar,
    integer,
    boolean,
    timestamp,
    uuid
} from 'drizzle-orm/pg-core';

export const SeasonHistoryTable = pgTable('season_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    chapter: integer('chapter').notNull(),
    season_code: integer('season_code').notNull(),
    season_in_chapter: integer('season_in_chapter').notNull(),
    display_name: varchar('display_name', { length: 100 }).notNull(),
    start_date: timestamp('start_date').notNull(),
    end_date: timestamp('end_date').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').notNull().$onUpdate(() => new Date())
});

export const FortniteCrewTable = pgTable('fortnite_crew', {
    id: uuid('id').primaryKey().defaultRandom(),
    // Typically were only interested with month and year only but for sorting purpose all are default to 1st of the month
    crew_date: timestamp('crew_date').notNull(),
    color_1: varchar('color_1').notNull(),
    color_2: varchar('color_2').notNull(),
    color_3: varchar('color_3').notNull(),
    image_with_bg: varchar('image_with_bg').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').notNull().$onUpdate(() => new Date())
});

export const FortniteCosmeticSeries = pgTable('fortnite_cosmetic_series', {
    id: uuid('id').primaryKey().defaultRandom(),
    display_name: varchar('display_name').notNull(),
    image: varchar('image').notNull(),
    internal_name: varchar('internal_name').notNull(),
    colors: varchar('colors').array().default([]).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').notNull().$onUpdate(() => new Date())
});
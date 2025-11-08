import { SeasonHistoryTable } from '../db/schema';

export type TOmitedSeasonHistory = Omit<typeof SeasonHistoryTable.$inferSelect, 'created_at' | 'updated_at' | 'id'>;
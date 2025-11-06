import z from 'zod';

export const SeasonHistoryValidationSchema = z.object({
    chapter: z.number(),
    season: z.number(),
    season_in_chapter: z.number(),
    start_date: z.date(),
    end_date: z.date()
});
import z from 'zod';

export const SeasonHistoryValidationSchema = z.object({
    chapter: z.number(),
    season_code: z.number(),
    season_in_chapter: z.number(),
    display_name: z.string(),
    start_date: z.date(),
    end_date: z.date()
});
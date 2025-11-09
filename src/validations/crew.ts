import z from 'zod';

export const CrewValidationSchema = z.object({
    crew_date: z.date(),
    color_1: z.string(),
    color_2: z.string(),
    color_3: z.string(),
    image_with_bg: z.url(),
    rewards_id: z.string().array()
});
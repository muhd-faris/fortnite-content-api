import z from 'zod';

export const SearchCosmeticValidationSchema = z.object({
    name: z.string({ error: 'Name is required to search' }).min(3, { error: 'Minimum 3 characters is needed.' }).trim().toLowerCase(),
    // TODO: Use Enum
    experience: z.enum([
        'battle_royale',
        'rocket_racing',
        'festival'
    ], { error: '' }),
    // TODO: Use Enum
    cosmetic_type: z.string({ error: 'Name is required to search' }).min(3, { error: 'Minimum 3 characters is needed.' }).trim()
});
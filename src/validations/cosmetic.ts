import z from 'zod';

const ExperienceValidation = z.enum([
    'battle_royale',
    'rocket_racing',
    'festival'
], { error: '' });

export const SearchCosmeticValidationSchema = z.object({
    name: z.string({ error: 'Name is required to search' }).min(3, { error: 'Minimum 3 characters is needed.' }).trim().toLowerCase(),
    // TODO: Use Enum
    experience: ExperienceValidation,
    // TODO: Use Enum
    cosmetic_type: z.string({ error: 'Name is required to search' }).min(3, { error: 'Minimum 3 characters is needed.' }).trim()
});

export const ExperienceValidationSchema = z.object({
    experience: ExperienceValidation
});
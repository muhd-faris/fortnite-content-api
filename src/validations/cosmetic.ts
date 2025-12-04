import z from 'zod';

import { SupportedBrItemSeriesVal, SupportedItemTypesVal } from '../constants';

const ExperienceValidation = z.enum(['battle_royale', 'rocket_racing', 'festival'], {
  error: 'Experience supported in FNTrack is only battle_royale, rocket_racing and festival.',
});

export const SearchCosmeticValidationSchema = z.object({
  name: z
    .string({ error: 'Name is required to search' })
    .min(3, { error: 'Minimum 3 characters is needed.' })
    .trim()
    .toLowerCase(),
  experience: ExperienceValidation,
  item_type: z.enum([...SupportedItemTypesVal], {
    error: `Cosmetic types supported are ${SupportedItemTypesVal.join(', ')}`,
  }),
  item_series: z.string(),
});

export const ExperienceValidationSchema = z.object({
  experience: ExperienceValidation,
});

export const SeriesValidationSchema = z.object({
  series: z.enum(SupportedBrItemSeriesVal, {
    error: `Opps it seems that this series does not exists in FNTrack. It could be because its new and and not synced yet. Please contact me through feedback to assists on this issue. Thank you.`,
  }),
});

export const BrCosmeticIdsValidationSchema = z.object({
  cosmetic_ids: z.string().toLowerCase().array(),
});

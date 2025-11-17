import z from 'zod';

import { SupportedRegionVal } from '../constants';

export const TournamentValidationSchema = z.object({
  region: z
    .enum(SupportedRegionVal, {
      error: `Supported regions are ${SupportedRegionVal.join(', ')}`,
    })
    .transform((val) => val.toLowerCase()),
  override_database: z.boolean().default(false),
});

// TODO: Add Validation
export const TournamentSessionValidationSchema = z.object({
  event_id: z.string(),
  window_id: z.string(),
});

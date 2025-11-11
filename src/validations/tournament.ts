import z from 'zod';

import { SupportedRegionVal } from '../constants';

export const TournamentValidationSchema = z.object({
    region: z.enum(SupportedRegionVal, {
        error: `Supported regions are ${SupportedRegionVal.join(', ')}`
    })
});
import { Hono } from 'hono';

import {
    getAllFortniteCrewV1,
    getCurrentSeasonsV1
} from '../controllers/game';
import { asyncHandler } from '../helpers';

const app = new Hono();
const v1BaseName = '/v1/game';

app.get(`${v1BaseName}/current-seasons`, asyncHandler(getCurrentSeasonsV1));
app.get(`${v1BaseName}/crew`, asyncHandler(getAllFortniteCrewV1));

export default app;
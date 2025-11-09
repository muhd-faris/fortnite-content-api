import { Hono } from 'hono';

import {
    getCurrentSeasonsV1
} from '../controllers/game';
import { asyncHandler } from '../helpers';

const app = new Hono();
const v1BaseName = '/v1/game';

app.get(`${v1BaseName}/current-seasons`, asyncHandler(getCurrentSeasonsV1));

export default app;
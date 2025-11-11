import { Hono } from 'hono';

import { syncTournamentToDatabaseV1 } from '../controllers/tournament';
import { asyncHandler } from '../helpers';

const app = new Hono();
const v1BaseName = '/v1/tournaments';

app.post(`${v1BaseName}/sync`, asyncHandler(syncTournamentToDatabaseV1));

export default app;
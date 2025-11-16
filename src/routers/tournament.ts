import { Hono } from 'hono';

import { getTournamentsV1, syncTournamentToDatabaseV1 } from '../controllers/tournament';
import { asyncHandler } from '../helpers';

const app = new Hono();
const v1BaseName = '/v1/tournaments';

app.get(v1BaseName, asyncHandler(getTournamentsV1));
app.post(`${v1BaseName}/sync`, asyncHandler(syncTournamentToDatabaseV1));

export default app;

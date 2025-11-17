import { Hono } from 'hono';

import {
  getLiveTournamentsV1,
  getTournamentDetailsV1,
  getTournamentsV1,
  syncTournamentToDatabaseV1,
} from '../controllers/tournament';
import { asyncHandler } from '../helpers';

const app = new Hono();
const v1BaseName = '/v1/tournaments';

app.get(v1BaseName, asyncHandler(getTournamentsV1));
app.get(`${v1BaseName}/live`, asyncHandler(getLiveTournamentsV1));
app.post(`${v1BaseName}/sync`, asyncHandler(syncTournamentToDatabaseV1));
app.get(`${v1BaseName}/:eventId`, asyncHandler(getTournamentDetailsV1));

export default app;

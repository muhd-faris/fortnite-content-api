import { Hono } from 'hono';

import {
  summariseCosmeticDetailsV1,
  summariseShopDetailsV1,
  summariseTournamentDetailsV1,
} from '../controllers/summarise.controller';
import { asyncHandler } from '../helpers';

const app = new Hono();
const v1BaseName = '/v1/summarise';

app.post(`${v1BaseName}/shop-details`, asyncHandler(summariseShopDetailsV1));
app.post(`${v1BaseName}/tournament-details`, asyncHandler(summariseTournamentDetailsV1));
app.post(`${v1BaseName}/cosmetic-details`, asyncHandler(summariseCosmeticDetailsV1));

export default app;

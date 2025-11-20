import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { TCFContext, TDefaultContext } from './types';
import CosmeticRoutes from './routers/cosmetic';
import SeasonHistoryRoutes from './routers/season-history';
import GameRoutes from './routers/game';
import CrewRoutes from './routers/crew';
import TournamentRoutes from './routers/tournament';
import ShopRoutes from './routers/shop.route';

const app = new Hono<TDefaultContext>();

app.use(
  cors({
    origin: [
      'capacitor://localhost', // iOS
      'https://localhost', // Android
      'http://localhost:8100', // TODO: Remove before Prod
      'https://5r77chnx-8080.asse.devtunnels.ms',
      'fntrack://',
    ],
    allowHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'FNTrack-Installed-Version',
    ],
    allowMethods: ['GET', 'OPTIONS', 'PATCH', 'POST', 'DELETE'],
  })
);

app.get('/', (c: TCFContext) => {
  const message: string =
    'Welcome to the FNTrack Fortnite Content API. This API is exclusively designed for use within FNTrack services. Attempting to access the API from outside of FNTrack services will result in the capture of your IP address and device details to me. Thank you for your understanding';

  return c.json({ message }, 200);
});

app.route('/', CosmeticRoutes);
app.route('/', SeasonHistoryRoutes);
app.route('/', GameRoutes);
app.route('/', CrewRoutes);
app.route('/', TournamentRoutes);
app.route('/', ShopRoutes);

export default app;

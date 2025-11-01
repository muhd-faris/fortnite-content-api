import { Hono } from 'hono';
import { cors } from 'hono/cors';

import CosmeticRoutes from './routers/cosmetic';

import { TDefaultContext } from './types';

const app = new Hono<TDefaultContext>();

app.use(cors({
  origin: [
    'capacitor://localhost', // iOS
    'https://localhost', // Android
    'http://localhost:8100', // TODO: Remove before Prod
    'https://5r77chnx-8080.asse.devtunnels.ms',
    'fntrack://'
  ],
  allowHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'FNTrack-Installed-Version'],
  allowMethods: ['GET', 'OPTIONS', 'PATCH', 'POST', 'DELETE']
}));

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

app.route('/', CosmeticRoutes);

export default app

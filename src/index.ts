import { Hono } from 'hono';

import CosmeticRoutes from './routers/cosmetic'; 

import { TDefaultContext } from './types';

const app = new Hono<TDefaultContext>();

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

app.route('/', CosmeticRoutes);

export default app

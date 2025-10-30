import { Hono } from 'hono';

import { searchCosmeticsV1 } from '../controllers/cosmetics';
import { asyncHandler } from '../helpers';

const app = new Hono();
const v1BaseName = '/v1/cosmetics';

app.post(`${v1BaseName}/search`, asyncHandler(searchCosmeticsV1));

export default app;
import { Hono } from 'hono';

import { getShopBestSellerV1, getTodayShopV1 } from '../controllers/shop.controller';
import { asyncHandler } from '../helpers';

const app = new Hono();
const v1BaseName = '/v1/shop';

app.get(v1BaseName, asyncHandler(getTodayShopV1));
app.get(`${v1BaseName}/best-seller`, asyncHandler(getShopBestSellerV1));

export default app;

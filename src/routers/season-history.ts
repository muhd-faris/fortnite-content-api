import { Hono } from 'hono';

import {
    createSeasonHistoryV1,
    getAllSeasonHistoryV1
} from '../controllers/season-history';
import { asyncHandler } from '../helpers';

const app = new Hono();
const v1BaseName = '/v1/season-history';

app.post(v1BaseName, asyncHandler(createSeasonHistoryV1));
app.get(v1BaseName, asyncHandler(getAllSeasonHistoryV1));

export default app;
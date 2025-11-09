import { Hono } from 'hono';

import {
    createCrewV1,
    getAllRecentCrewV1,
    getCurrentActiveCrewV1
} from '../controllers/crew';
import { asyncHandler } from '../helpers';

const app = new Hono();
const v1BaseName = '/v1/crew';

app.post(v1BaseName, asyncHandler(createCrewV1));
app.get(v1BaseName, asyncHandler(getAllRecentCrewV1));
app.get(`${v1BaseName}/current`, asyncHandler(getCurrentActiveCrewV1));

export default app;
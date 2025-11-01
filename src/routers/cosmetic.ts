import { Hono } from 'hono';

import {
    getCosmeticFiltersV1,
    getRecentlyAddedCosmeticsV1,
    searchCosmeticsV1,
    syncCosmeticSeriesToDbV1,
    syncCosmeticTypesV1
} from '../controllers/cosmetics';
import { asyncHandler } from '../helpers';

const app = new Hono();
const v1BaseName = '/v1/cosmetics';

app.get(`${v1BaseName}/filter-config`, asyncHandler(getCosmeticFiltersV1));
app.post(`${v1BaseName}/search`, asyncHandler(searchCosmeticsV1));
app.post(`${v1BaseName}/recent-items`, asyncHandler(getRecentlyAddedCosmeticsV1));
app.get(`${v1BaseName}/sync-series`, asyncHandler(syncCosmeticSeriesToDbV1));
app.get(`${v1BaseName}/sync-br-types`, asyncHandler(syncCosmeticTypesV1));
app.get(`${v1BaseName}/sync-festival-types`, asyncHandler(syncCosmeticTypesV1));

export default app;
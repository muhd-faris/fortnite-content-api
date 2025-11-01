import { Hono } from 'hono';

import {
    getCosmeticFiltersV1,
    getFestivalListingV1,
    getRecentlyAddedCosmeticsV1,
    getRocketRacingListingV1,
    searchBrCosmeticsV1
} from '../controllers/cosmetics';
import { asyncHandler } from '../helpers';

const app = new Hono();
const v1BaseName = '/v1/cosmetics';

app.get(`${v1BaseName}/filter-config`, asyncHandler(getCosmeticFiltersV1));
app.post(`${v1BaseName}/search-br`, asyncHandler(searchBrCosmeticsV1));
app.post(`${v1BaseName}/rocket-racing`, asyncHandler(getRocketRacingListingV1));
app.post(`${v1BaseName}/festival`, asyncHandler(getFestivalListingV1));
app.post(`${v1BaseName}/recent-items`, asyncHandler(getRecentlyAddedCosmeticsV1));

export default app;
import { Hono } from 'hono';

import {
  getBrCosmeticByIdsV1,
  getCosmeticDetailsV1,
  getCosmeticFiltersV1,
  getCosmeticsBySeriesV1,
  getFestivalListingV1,
  getRecentlyAddedCosmeticsV1,
  getRocketRacingListingV1,
  searchBrCosmeticsByTypeV1,
  searchBrCosmeticsV1,
} from '../controllers/cosmetics';
import { asyncHandler } from '../helpers';

const app = new Hono();
const v1BaseName = '/v1/cosmetics';

app.get(`${v1BaseName}/filter-config`, asyncHandler(getCosmeticFiltersV1));
app.get(`${v1BaseName}/:id`, asyncHandler(getCosmeticDetailsV1));
app.post(`${v1BaseName}/search-br`, asyncHandler(searchBrCosmeticsV1));
app.post(`${v1BaseName}/search-br-series`, asyncHandler(getCosmeticsBySeriesV1));
app.post(`${v1BaseName}/rocket-racing`, asyncHandler(getRocketRacingListingV1));
app.post(`${v1BaseName}/festival`, asyncHandler(getFestivalListingV1));
app.post(`${v1BaseName}/recent-items`, asyncHandler(getRecentlyAddedCosmeticsV1));
app.post(`${v1BaseName}/search-cosmetic-by-ids`, asyncHandler(getBrCosmeticByIdsV1));
app.post(`${v1BaseName}/search-cosmetic-by-type`, asyncHandler(searchBrCosmeticsByTypeV1));

export default app;

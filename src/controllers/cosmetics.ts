import { FortniteComBaseUrl } from '../constants';
import { CustomException } from '../helpers';
import { IRootCosmeticListing } from '../interfaces';
import { TCFContext } from '../types';
import { SearchCosmeticValidationSchema } from '../validations';

export const getCosmeticFiltersV1 = (c: TCFContext) => { };

export const searchCosmeticsV1 = async (c: TCFContext) => {
    const lang = c.req.query('lang') || 'en';
    const body = SearchCosmeticValidationSchema.parse(await c.req.json());

    const params = new URLSearchParams();
    params.append('name', body.name);
    params.append('type', body.cosmetic_type);
    params.append('matchMethod', 'contains');
    params.append('responseFlags', '7');

    const fetchedCosmeticListing = await fetch(`${FortniteComBaseUrl}/v2/cosmetics/br/search/all?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const cosmeticListingJson = await fetchedCosmeticListing.json() as IRootCosmeticListing;

    if (cosmeticListingJson.status !== 200) {
        throw new CustomException(
            'Error occured from the server. Sorry about that please try again shortly.',
            500
        );
    };

    const data = cosmeticListingJson.data.map(d => ({
        id: d.id,
        name: d.name,
        item_type: d.type.displayValue,
        card_bg_color: 'linear-gradient(rgb(153, 0, 49), rgb(92, 0, 32), rgb(5, 38, 35))',
        overlay_bg_color: 'linear-gradient(0deg, rgb(51, 0, 22) 0%, rgba(0, 0, 0, 0) 100%)',
        // TODO: Add Fallback icon
        transparent_image: d.images.icon || ''
    }));

    return c.json(data);
};

export const getRecentlyAddedCosmeticsV1 = async (c: TCFContext) => { };

export const getCosmeticDetailsV1 = async (c: TCFContext) => { };
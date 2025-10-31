import { FortniteComBaseUrl } from '../constants';
import { CustomException } from '../helpers';
import {
    IRootCarCosmeticListing,
    IRootCosmeticListing,
    IRootInstrumentListing,
    IRootRecentCosmetic,
    IRootTrackListing
} from '../interfaces';
import { TCFContext } from '../types';
import { SearchCosmeticValidationSchema } from '../validations';

export const getCosmeticFiltersV1 = (c: TCFContext) => { };

export const searchCosmeticsV1 = async (c: TCFContext) => {
    // TODO: Implement Language
    const lang = c.req.query('lang') || 'en';
    const body = SearchCosmeticValidationSchema.parse(await c.req.json());

    if (body.experience === 'rocket_racing') {
        const fetchedCosmeticListing = await fetch(`${FortniteComBaseUrl}/v2/cosmetics/cars`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const cosmeticListingJson = await fetchedCosmeticListing.json() as IRootCarCosmeticListing;

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
            transparent_image: d.images?.large || ''
        }));

        return c.json(data);
    };

    if (body.experience === 'festival') {
        const fetchedTrackListing = await fetch(`${FortniteComBaseUrl}/v2/cosmetics/tracks`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const trackListingJson = await fetchedTrackListing.json() as IRootTrackListing;

        const trackData = trackListingJson.data.map(d => ({
            id: d.id,
            name: d.title,
            item_type: d.artist,
            card_bg_color: 'linear-gradient(rgb(153, 0, 49), rgb(92, 0, 32), rgb(5, 38, 35))',
            overlay_bg_color: 'linear-gradient(0deg, rgb(51, 0, 22) 0%, rgba(0, 0, 0, 0) 100%)',
            // TODO: Add Fallback icon
            transparent_image: d.albumArt
        }));

        const fetchedInstrumentListing = await fetch(`${FortniteComBaseUrl}/v2/cosmetics/instruments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const instrumentListingJson = await fetchedInstrumentListing.json() as IRootInstrumentListing;

        if (trackListingJson.status !== 200 || instrumentListingJson.status !== 200) {
            throw new CustomException(
                'Error occured from the server. Sorry about that please try again shortly.',
                500
            );
        };

        const instrumentData = instrumentListingJson.data.map(d => ({
            id: d.id,
            name: d.name,
            item_type: d.type.displayValue,
            card_bg_color: 'linear-gradient(rgb(153, 0, 49), rgb(92, 0, 32), rgb(5, 38, 35))',
            overlay_bg_color: 'linear-gradient(0deg, rgb(51, 0, 22) 0%, rgba(0, 0, 0, 0) 100%)',
            transparent_image: d.images.large
        }));

        const data = instrumentData.concat(trackData);

        return c.json(data);
    };

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

export const getRecentlyAddedCosmeticsV1 = async (c: TCFContext) => {
    // TODO: Implement Language
    const lang = c.req.query('lang') || 'en';
    const { experience } = await c.req.json();

    const fetchedCosmeticListing = await fetch(`${FortniteComBaseUrl}/v2/cosmetics/new`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const cosmeticListingJson = await fetchedCosmeticListing.json() as IRootRecentCosmetic;

    if (cosmeticListingJson.status !== 200) {
        throw new CustomException(
            'Error occured from the server. Sorry about that please try again shortly.',
            500
        );
    };

    if (experience === 'battle_royale') {
        const data = cosmeticListingJson.data.items.br.map(d => ({
            id: d.id,
            name: d.name,
            item_type: d.type.displayValue,
            card_bg_color: 'linear-gradient(rgb(153, 0, 49), rgb(92, 0, 32), rgb(5, 38, 35))',
            overlay_bg_color: 'linear-gradient(0deg, rgb(51, 0, 22) 0%, rgba(0, 0, 0, 0) 100%)',
            // TODO: Add Fallback icon
            transparent_image: d.images?.icon || ''
        }));

        return c.json(data);
    };

    if (experience === 'rocket_racing') {
        const data = cosmeticListingJson.data.items.cars.map(d => ({
            id: d.id,
            name: d.name,
            item_type: d.type.displayValue,
            card_bg_color: 'linear-gradient(rgb(153, 0, 49), rgb(92, 0, 32), rgb(5, 38, 35))',
            overlay_bg_color: 'linear-gradient(0deg, rgb(51, 0, 22) 0%, rgba(0, 0, 0, 0) 100%)',
            transparent_image: d.images.large
        }));

        return c.json(data);
    };

    const trackData = cosmeticListingJson.data.items.tracks.map(d => ({
        id: d.id,
        name: d.title,
        item_type: d.artist,
        card_bg_color: 'linear-gradient(rgb(153, 0, 49), rgb(92, 0, 32), rgb(5, 38, 35))',
        overlay_bg_color: 'linear-gradient(0deg, rgb(51, 0, 22) 0%, rgba(0, 0, 0, 0) 100%)',
        transparent_image: d.albumArt
    }));
    const instrumentData = cosmeticListingJson.data.items.instruments.map(d => ({
        id: d.id,
        name: d.name,
        item_type: d.type.displayValue,
        card_bg_color: 'linear-gradient(rgb(153, 0, 49), rgb(92, 0, 32), rgb(5, 38, 35))',
        overlay_bg_color: 'linear-gradient(0deg, rgb(51, 0, 22) 0%, rgba(0, 0, 0, 0) 100%)',
        transparent_image: d.images.large
    }));
    const data = instrumentData.concat(trackData);

    return c.json(data);
};

export const getCosmeticDetailsV1 = async (c: TCFContext) => { };
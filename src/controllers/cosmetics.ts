import brSeriesData from '../data/cosmetic_br_series.json';
import brCosmeticTypesData from '../data/cosmetic_br_types.json';
import festivalCosmeticTypesData from '../data/cosmetic_festival_types.json';

import {
    FortniteComBaseUrl,
    UnsupportedBrTypes
} from '../constants';
import { CustomException } from '../helpers';
import {
    IFECosmeticListing,
    IRootCarCosmeticListing,
    IRootCosmeticListing,
    IRootInstrumentListing,
    IRootRecentCosmetic,
    IRootTrackListing
} from '../interfaces';
import { TCFContext } from '../types';
import {
    ExperienceValidationSchema,
    SearchCosmeticValidationSchema
} from '../validations';

export const getCosmeticFiltersV1 = async (c: TCFContext) => {
    const brCosmeticTypes = brCosmeticTypesData
        .map(c => ({ group: 'battle_royale', value: c.value, display_name: c.display_name }));
    const festivalCosmeticTypes = festivalCosmeticTypesData
        .map(c => ({ group: 'festival', value: c.value, display_name: c.display_name }));

    const filters = {
        general: ['upcoming', 'reactive'],
        experience: [
            {
                value: 'battle_royale',
                name: 'Battle Royale'
            },
            {
                value: 'rocket_racing',
                name: 'Rocket Racing'
            },
            {
                value: 'festival',
                name: 'Fortnite Festival'
            }
        ],
        cosmetic_types: [
            {
                group: 'all',
                value: 'all',
                display_name: 'All'
            },
            ...brCosmeticTypes,
            ...festivalCosmeticTypes,
            {
                group: 'festival',
                value: 'jam_track',
                display_name: 'Jam Tracks'
            }
        ],
        series: [
            {
                backend_value: 'all',
                display_name: 'All'
            },
            ...brSeriesData
        ]
    };

    return c.json(filters);
};

export const searchBrCosmeticsV1 = async (c: TCFContext) => {
    const lang = c.req.query('lang') || 'en';
    const body = SearchCosmeticValidationSchema.parse(await c.req.json());

    const params = new URLSearchParams();
    params.append('language', lang);
    params.append('name', body.name);
    params.append('matchMethod', 'contains');
    params.append('responseFlags', '7');

    if (body.item_type !== 'all') {
        params.append('type', body.item_type);
    };

    if (body.item_series !== 'all') {
        params.append('backendSeries', body.item_series);
    };

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
    const lang = c.req.query('lang') || 'en';
    const { experience } = ExperienceValidationSchema.parse(await c.req.json());

    const fetchedCosmeticListing = await fetch(`${FortniteComBaseUrl}/v2/cosmetics/new?language=${lang}`, {
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
        const filteredBrData = cosmeticListingJson.data.items.br
            .filter(c => !UnsupportedBrTypes.includes(c.type.backendValue))
            // Filter out test names
            .filter(c => !['null', 'test', 'undefined'].includes(c.name));
        const data: IFECosmeticListing[] = filteredBrData.map(d => ({
            id: d.id,
            name: d.name,
            item_type: {
                id: d.type.value,
                name: d.type.displayValue
            },
            card_bg_color: 'linear-gradient(rgb(153, 0, 49), rgb(92, 0, 32), rgb(5, 38, 35))',
            overlay_bg_color: 'linear-gradient(0deg, rgb(51, 0, 22) 0%, rgba(0, 0, 0, 0) 100%)',
            // TODO: Add Fallback icon
            transparent_image: d.images?.icon || ''
        }));

        return c.json(data);
    };

    if (experience === 'rocket_racing') {
        const data: IFECosmeticListing[] = cosmeticListingJson.data.items.cars.map(d => ({
            id: d.id,
            name: d.name,
            item_type: {
                id: d.type.value,
                name: d.type.displayValue
            },
            card_bg_color: 'linear-gradient(rgb(153, 0, 49), rgb(92, 0, 32), rgb(5, 38, 35))',
            overlay_bg_color: 'linear-gradient(0deg, rgb(51, 0, 22) 0%, rgba(0, 0, 0, 0) 100%)',
            transparent_image: d.images.large
        }));

        return c.json(data);
    };

    const trackData: IFECosmeticListing[] = cosmeticListingJson.data.items.tracks.map(d => ({
        id: d.id,
        name: d.title,
        item_type: {
            id: '',
            name: d.artist
        },
        card_bg_color: 'linear-gradient(rgb(153, 0, 49), rgb(92, 0, 32), rgb(5, 38, 35))',
        overlay_bg_color: 'linear-gradient(0deg, rgb(51, 0, 22) 0%, rgba(0, 0, 0, 0) 100%)',
        transparent_image: d.albumArt
    }));
    const instrumentData: IFECosmeticListing[] = cosmeticListingJson.data.items.instruments.map(d => ({
        id: d.id,
        name: d.name,
        item_type: {
            id: d.type.value,
            name: d.type.displayValue
        },
        card_bg_color: 'linear-gradient(rgb(153, 0, 49), rgb(92, 0, 32), rgb(5, 38, 35))',
        overlay_bg_color: 'linear-gradient(0deg, rgb(51, 0, 22) 0%, rgba(0, 0, 0, 0) 100%)',
        transparent_image: d.images.large
    }));
    const data = instrumentData.concat(trackData);

    return c.json(data);
};

export const getRocketRacingListingV1 = async (c: TCFContext) => {
    const lang = c.req.query('lang') || 'en';

    const fetchedCosmeticListing = await fetch(`${FortniteComBaseUrl}/v2/cosmetics/cars?language=${lang}`, {
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

export const getFestivalListingV1 = async (c: TCFContext) => {
    const lang = c.req.query('lang') || 'en';

    const fetchedTrackListing = await fetch(`${FortniteComBaseUrl}/v2/cosmetics/tracks?language=${lang}`, {
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
        transparent_image: d.albumArt
    }));

    const fetchedInstrumentListing = await fetch(`${FortniteComBaseUrl}/v2/cosmetics/instruments?language=${lang}`, {
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

export const getCosmeticDetailsV1 = async (c: TCFContext) => { };
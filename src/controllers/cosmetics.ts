import brSeriesData from '../data/cosmetic_br_series.json';
import brCosmeticTypesData from '../data/cosmetic_br_types.json';
import festivalCosmeticTypesData from '../data/cosmetic_festival_types.json';

import { FortniteComBaseUrl } from '../constants';
import {
    CustomException,
    formatBrListingResponse,
    hasValueInTag
} from '../helpers';
import {
    IBRImages,
    IBRStyleFE,
    IFECosmeticListing,
    IRootCarCosmeticListing,
    IRootCosmeticListing,
    IRootInstrumentListing,
    IRootRecentCosmetic,
    IRootTrackListing,
    IVariant
} from '../interfaces';
import {
    TCFContext,
    TRootCosmeticDetails
} from '../types';
import {
    ExperienceValidationSchema,
    SearchCosmeticValidationSchema,
    SeriesValidationSchema
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

    if (body.item_type !== 'all') {
        params.append('type', body.item_type);
    };

    if (body.item_series !== 'all') {
        params.append('backendSeries', body.item_series);
    };

    const url: string = `${FortniteComBaseUrl}/v2/cosmetics/br/search/all?${params.toString()}`;
    const fetchedCosmeticListing = await fetch(url, {
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

    const data = formatBrListingResponse(cosmeticListingJson.data);

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
        const data = formatBrListingResponse(cosmeticListingJson.data.items.br);

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

export const getCosmeticDetailsV1 = async (c: TCFContext) => {
    const id = c.req.param('id')?.toLowerCase();
    const lang = c.req.query('lang') || 'en';

    const params = new URLSearchParams();
    params.append('language', lang);
    params.append('responseFlags', '7');

    const url: string = `${FortniteComBaseUrl}/v2/cosmetics/br/${id}?${params.toString()}`;
    const fetchedCosmeticDetails = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const cosmeticDetailsJson = await fetchedCosmeticDetails.json() as TRootCosmeticDetails;

    if (cosmeticDetailsJson.status === 404) {
        throw new CustomException(
            'The id you are looking for does not exists. Please ensure you are searching for the correct ID.',
            404
        );
    };

    const data = cosmeticDetailsJson.data;
    const freeBattlePass = hasValueInTag(data.gameplayTags ?? [], 'battlepass.free');
    const paidBattlePass = hasValueInTag(data.gameplayTags ?? [], 'battlepass.paid');
    const shopHistory = data.shopHistory?.sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) ?? [];
    const response = {
        id: data.id.toLowerCase(),
        name: data.name.toUpperCase(),
        description: data.description,
        main_image: data.images.smallIcon,
        item_type: {
            id: data.type.value,
            name: data.type.displayValue
        },
        reactive: hasValueInTag(data.gameplayTags ?? [], 'reactive'),
        built_in_emote: data.builtInEmoteIds ? true : false,
        battle_pass: freeBattlePass ? 'Free' : paidBattlePass ? 'Paid' : null,
        series: data.series ? {
            id: data.series.backendValue,
            name: data.series.value
        } : null,
        set: data.set ? {
            id: data.set.backendValue,
            name: data.set.value
        } : null,
        season_introduced: data.introduction?.text ?? null,
        added_at: data.added,
        shop_history: shopHistory,
        styles: generateItemStyles(data.images, data.variants || [])
    };

    return c.json(response);
};

export const getCosmeticsBySeriesV1 = async (c: TCFContext) => {
    const lang = c.req.query('lang') || 'en';
    const { series } = SeriesValidationSchema.parse(await c.req.json());

    const params = new URLSearchParams();
    params.append('language', lang);
    params.append('backendSeries', series);

    const url: string = `${FortniteComBaseUrl}/v2/cosmetics/br/search/all?${params.toString()}`;
    const fetchedCosmeticListing = await fetch(url, {
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

    const data = formatBrListingResponse(cosmeticListingJson.data);

    return c.json(data);
};

function generateItemStyles(images: IBRImages, variants: IVariant[]): IBRStyleFE[] {
    const styles: IBRStyleFE[] = [];

    if (images.lego) {
        styles.push({ image: images.lego.large, mode: 'Fortnite LEGO' });
    };

    if (images.bean) {
        styles.push({ image: images.bean.large, mode: 'Fall Guys' });
    };

    variants.forEach(v => {
        v.options.forEach(opt => {
            styles.push({ image: opt.image, mode: 'Battle Royale' });
        });
    });

    return styles;
};
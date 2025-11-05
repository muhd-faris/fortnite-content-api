import { SupportedBrItemTypesVal } from '../constants';
import {
    ICosmeticListingData,
    IFECosmeticListing
} from '../interfaces';

export const hasValueInTag = (tags: string[], query: string): boolean => {
    const q = query.toLowerCase();

    return tags.some(t => t.toLowerCase().includes(q));
};

export const formatBrListingResponse = (data: ICosmeticListingData[]): IFECosmeticListing[] => {
    return data
        // Filter by Enabled Types only
        .filter(d => SupportedBrItemTypesVal.includes(d.type.value))
        .map(d => ({
            id: d.id,
            name: d.name,
            item_type: {
                id: d.type.value,
                name: d.type.displayValue
            },
            // TODO: Determine proper color
            card_bg_color: 'linear-gradient(rgb(153, 0, 49), rgb(92, 0, 32), rgb(5, 38, 35))',
            overlay_bg_color: 'linear-gradient(0deg, rgb(51, 0, 22) 0%, rgba(0, 0, 0, 0) 100%)',
            transparent_image: d.images?.featured ?? d.images?.icon ?? d.images.smallIcon
        }));
};
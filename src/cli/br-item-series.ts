import fs from 'fs';

import { FortniteComBaseUrl } from '../constants';
import {
    CustomException,
    titleCasePreserveAcronyms
} from '../helpers';
import { IRootCosmeticListing } from '../interfaces';

export const syncBrCosmeticSeries = async () => {
    console.log('Starting to sync battle royale cosmetic types.');

    console.log('Calling API...');

    const fetchedCosmeticListing = await fetch(`${FortniteComBaseUrl}/v2/cosmetics/br`, {
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

    console.log('API call success. Mapping the data...');

    const rawCosmeticSeries = cosmeticListingJson.data
        .map(d => d.series)
        .filter(d => d !== undefined)
        .map(t => ({
            backend_value: t.backendValue,
            display_name: titleCasePreserveAcronyms(t.value)
        }));
    const uniqueCosmeticSeries = Array.from(
        new Map(rawCosmeticSeries.map((item) => [item.backend_value, item])).values()
    ).sort((a, b) => a.display_name.localeCompare(b.display_name));

    const jsonString = JSON.stringify(uniqueCosmeticSeries, null, 2);

    const filePath = './src/data/cosmetic_br_series.json';

    console.log('Saving files to the data folder....');

    fs.writeFileSync(filePath, jsonString);

    console.log(`Successfully saved ${uniqueCosmeticSeries.length} battle royale cosmetic series.`);

    process.exit(1);
};
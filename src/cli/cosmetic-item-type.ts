import fs from 'fs';

import { FortniteComBaseUrl, UnsupportedBrTypes } from '../constants';
import { CustomException } from '../helpers';
import { IRootCosmeticListing, IRootInstrumentListing } from '../interfaces';

export const syncBrCosmeticTypes = async () => {
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

    const rawCosmeticType = cosmeticListingJson.data
        .map(d => d.type)
        .filter(d => d !== undefined)
        .map(t => ({ backend_value: t.backendValue, display_name: t.displayValue, value: t.value }))
        .filter(t => !UnsupportedBrTypes.includes(t.backend_value));
    const uniqueCosmeticTypes = Array.from(
        new Map(rawCosmeticType.map((item) => [item.backend_value, item])).values()
    ).sort((a, b) => a.display_name.localeCompare(b.display_name));

    const jsonString = JSON.stringify(uniqueCosmeticTypes, null, 2);

    const filePath = './src/data/cosmetic_br_types.json';

    console.log('Saving files to the data folder....');

    fs.writeFileSync(filePath, jsonString);

    console.log(`Successfully saved ${uniqueCosmeticTypes.length} battle royale cosmetic types.`);

    process.exit(1);
};

export const syncFestivalCosmeticTypes = async () => {
    console.log('Starting to sync festival cosmetic types.');

    console.log('Calling API...');

    const fetchedInstrumentListing = await fetch(`${FortniteComBaseUrl}/v2/cosmetics/instruments`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const instrumentListingJson = await fetchedInstrumentListing.json() as IRootInstrumentListing;

    if (instrumentListingJson.status !== 200) {
        throw new CustomException(
            'Error occured from the server. Sorry about that please try again shortly.',
            500
        );
    };

    console.log('API call success. Mapping the data...');

    const rawCosmeticType = instrumentListingJson.data
        .map(d => d.type)
        .filter(d => d !== undefined)
        .map(t => ({ backend_value: t.backendValue, display_name: t.displayValue, value: t.value }))
    const uniqueCosmeticTypes = Array.from(
        new Map(rawCosmeticType.map((item) => [item.backend_value, item])).values()
    ).sort((a, b) => a.display_name.localeCompare(b.display_name));

    const jsonString = JSON.stringify(uniqueCosmeticTypes, null, 2);

    const filePath = './src/data/cosmetic_festival_types.json';

    console.log('Saving files to the data folder....');

    fs.writeFileSync(filePath, jsonString);

    console.log(`Successfully saved ${uniqueCosmeticTypes.length} festival cosmetic types.`);

    process.exit(1);
};
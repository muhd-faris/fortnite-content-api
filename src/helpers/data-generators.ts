import fs from 'fs';

import { FortniteComBaseUrl } from '../constants';
import { IRootCosmeticListing, IRootInstrumentListing } from '../interfaces';
import { CustomException } from './app-error';

const syncBrCosmeticTypes = async () => {
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

    const excludedTypes: string[] = [
        'BannerToken',
        'AthenaEmoji',
        'AthenaLoadingScreen',
        'AthenaPetCarrier',
        'AthenaPet',
        'AthenaSpray',
        'AthenaToy'
    ];

    const rawCosmeticType = cosmeticListingJson.data
        .map(d => d.type)
        .filter(d => d !== undefined)
        .map(t => ({ backend_value: t.backendValue, display_name: t.displayValue, value: t.value }))
        .filter(t => !excludedTypes.includes(t.backend_value));
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

const syncFestivalCosmeticTypes = async () => {
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

const syncBrCosmeticSeries = async () => {
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
        .map(t => ({ backend_value: t.backendValue, display_name: titleCasePreserveAcronyms(t.value) }));
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

function titleCasePreserveAcronyms(s: string): string {
  return s
    .split(/\s+/)
    .map((word) => {
      // If word is all letters and all uppercase and short (<=3),
      // treat it as an acronym and preserve uppercase.
      if (/^[A-Z]{2,3}$/.test(word)) return word;
      // Otherwise title-case: first char uppercase, rest lowercase
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};
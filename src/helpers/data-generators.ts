import fs from 'fs';
import { FortniteComBaseUrl } from '../constants';
import { ICosmeticListingData } from '../interfaces';
import { CustomException } from './app-error';

const syncFestivalCosmeticTypes = async () => {
    const fetchedCosmeticListing = await fetch(`${FortniteComBaseUrl}/v2/cosmetics/br`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const cosmeticListingJson = await fetchedCosmeticListing.json() as { status: number; data: ICosmeticListingData[] };

    if (cosmeticListingJson.status !== 200) {
        throw new CustomException(
            'Error occured from the server. Sorry about that please try again shortly.',
            500
        );
    };

    const rawSeriesData = cosmeticListingJson.data.map(d => d.type).filter(d => d !== undefined);
    const uniqueSeries = Array.from(
        new Map(rawSeriesData.map((item) => [item.backendValue, item])).values()
    );

    const jsonString = JSON.stringify(uniqueSeries, null, 2);
    const filePath = './src/data/cosmetic_festival_types.json';
    console.log('Test1')
    fs.writeFileSync(filePath, jsonString)
    console.log('Success')
    process.exit(1);
};

syncFestivalCosmeticTypes();
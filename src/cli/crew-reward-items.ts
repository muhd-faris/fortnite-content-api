import 'dotenv/config';
import fs from 'fs';

import { FortniteComBaseUrl } from '../constants';
import { getDrizzle } from '../lib';
import { IRootCosmeticListing } from '../interfaces';
import { formatBrListingResponse } from '../helpers';

export const syncCrewRewardItems = async () => {
    const db = getDrizzle();
    const recentCrewInDb = await db.query.FortniteCrewTable.findMany({
        columns: {
            rewards_id: true
        }
    });

    const rewardIds = recentCrewInDb.flatMap(crew => crew.rewards_id);

    if (rewardIds.length < 1) {
        console.log('No IDS to process...');
        process.exit(1);
    };

    const uniqueIds = [...new Set(rewardIds)];

    const params = new URLSearchParams();

    uniqueIds.forEach(id => params.append('id', id));

    const url: string = `${FortniteComBaseUrl}/v2/cosmetics/br/search/ids?${params.toString()}`;
    const fetchedCosmeticListing = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const cosmeticListingJson = await fetchedCosmeticListing.json() as IRootCosmeticListing;

    const data = formatBrListingResponse(cosmeticListingJson.data);
    const formattedData = data.map(d => {
        d.id = d.id.toLowerCase();

        return d;
    })

    const jsonString = JSON.stringify(formattedData, null, 2);

    const filePath = './src/data/crew_rewards_cosmetic.json';

    console.log('Saving files to the data folder....');

    fs.writeFileSync(filePath, jsonString);

    console.log(`Successfully saved ${data.length} battle royale cosmetic for Fortnite Crew.`);

    process.exit(1);
};
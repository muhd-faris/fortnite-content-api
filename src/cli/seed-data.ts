import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import fs from 'fs';

import * as schema from '../db/schema';

import brSeasonHistory from '../data/seed/season-history.json';
import { SeasonHistoryTable } from '../db/schema';

const db = drizzle(process.env.DATABASE_STAGING_URL as string, { schema });

export const seedSeasonHistoryData = async () => {
    await db.delete(SeasonHistoryTable).returning({ id: SeasonHistoryTable.id });

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const startYear = currentYear - 3;
    const startDateLimit = new Date(startYear, 0, 1);

    const history = brSeasonHistory.seasons.reverse();
    const mappedHistoryData = history
        .filter(s => s.endDate !== null).map(s => ({
            chapter: s.chapter,
            season_code: s.season,
            season_in_chapter: s.seasonInChapter,
            display_name: s.displayName,
            start_date: new Date(s.startDate.replace(' ', 'T')),
            end_date: new Date(s.endDate.replace(' ', 'T'))
        }));
    const recentSeasons = mappedHistoryData
        .filter(s => {
            const seasonStartDate = new Date(s.start_date);

            return seasonStartDate >= startDateLimit;
        });

    const data = await db.insert(SeasonHistoryTable).values([
        ...recentSeasons
    ]).returning({ season_code: SeasonHistoryTable.season_code });
    const savedData = data.map(d => d.season_code);

    console.log(`Successfully seeded ${data.length} season history to database`);

    const archivedHistory = mappedHistoryData.filter(h => !savedData.includes(h.season_code));

    const jsonString = JSON.stringify(archivedHistory, null, 2);

    const filePath = './src/data/archived_season_history.json';

    console.log('Saving files to the data folder....');

    fs.writeFileSync(filePath, jsonString);

    console.log(`Successfully saved ${archivedHistory.length} season history to JSON.`);

    process.exit(1);
};

seedSeasonHistoryData();
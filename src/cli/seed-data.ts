import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import fs from 'fs';

import * as schema from '../db/schema';

import brSeasonHistory from '../data/seed/season-history.json';
import fortniteCrewHistory from '../data/seed/fortnite-crew.json';
import { FortniteCrewTable, SeasonHistoryTable } from '../db/schema';
import { getEGAccountAccessToken } from '../helpers';

const db = drizzle(process.env.DATABASE_STAGING_URL as string, { schema });

const seedSeasonHistoryData = async () => {
  await db.delete(SeasonHistoryTable).returning({ id: SeasonHistoryTable.id });

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const startYear = currentYear - 3;
  const startDateLimit = new Date(startYear, 0, 1);

  const history = brSeasonHistory.seasons.reverse();
  const mappedHistoryData = history
    .filter((s) => s.endDate !== null)
    .map((s) => ({
      chapter: s.chapter,
      season_code: s.season,
      season_in_chapter: s.seasonInChapter,
      display_name: s.displayName,
      start_date: new Date(s.startDate.replace(' ', 'T')),
      end_date: new Date(s.endDate.replace(' ', 'T')),
    }));
  const recentSeasons = mappedHistoryData.filter((s) => {
    const seasonStartDate = new Date(s.start_date);

    return seasonStartDate >= startDateLimit;
  });

  const data = await db
    .insert(SeasonHistoryTable)
    .values([...recentSeasons])
    .returning({ season_code: SeasonHistoryTable.season_code });
  const savedData = data.map((d) => d.season_code);

  console.log(`Successfully seeded ${data.length} season history to database`);

  const archivedHistory = mappedHistoryData.filter((h) => !savedData.includes(h.season_code));

  const jsonString = JSON.stringify(archivedHistory, null, 2);

  const filePath = './src/data/archived_season_history.json';

  console.log('Saving files to the data folder....');

  fs.writeFileSync(filePath, jsonString);

  console.log(`Successfully saved ${archivedHistory.length} season history to JSON.`);

  process.exit(1);
};

const seedFortniteCrewData = async () => {
  await db.delete(FortniteCrewTable).returning({ id: FortniteCrewTable.id });

  const crewData = fortniteCrewHistory.history;
  const formattedCrew = crewData.map((d) => {
    const rewardsIds = d.rewards.map((r) => r.item.id.toLowerCase());

    return {
      crew_date: new Date(d.date),
      color_1: d.colors.A,
      color_2: d.colors.B,
      color_3: d.colors.C,
      image_with_bg: d.images.itemShopTile,
      rewards_id: rewardsIds,
    };
  });

  const data = await db
    .insert(FortniteCrewTable)
    .values([...formattedCrew])
    .returning({ id: FortniteCrewTable.id });

  console.log(`Successfully seeded ${data.length} fortnite crew to database`);
};

const getEpicAccessToken = async () => {
  const { access_token } = await getEGAccountAccessToken();

  console.log({ access_token });
  process.exit(1);
};

getEpicAccessToken();

import { SeasonHistoryTable } from '../db/schema';
import { getDrizzle } from '../lib';
import { TCFContext } from '../types';
import { SeasonHistoryValidationSchema } from '../validations';

export const createSeasonHistoryV1 = async (c: TCFContext) => {
    const body = SeasonHistoryValidationSchema.parse(await c.req.json());
    const db = getDrizzle();

    const [createdHistory] = await db.insert(SeasonHistoryTable).values({
        ...body
    }).returning({
        chapter: SeasonHistoryTable.chapter,
        season_in_chapter: SeasonHistoryTable.season_in_chapter
    });

    const seasonText = `Chapter ${createdHistory.chapter}, Season ${createdHistory.season_in_chapter}`

    return c.json({ message: `Successfully added ${seasonText} to Season History.` });
};

export const getAllSeasonHistoryV1 = async (c: TCFContext) => { };

export const syncRecentSeasonHistoryV1 = async (c: TCFContext) => { };
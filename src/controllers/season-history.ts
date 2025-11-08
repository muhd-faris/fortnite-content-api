import { differenceInDays, isPast } from 'date-fns';

import { SeasonHistoryTable } from '../db/schema';
import { getDrizzle } from '../lib';
import { TCFContext, TOmitedSeasonHistory } from '../types';
import { SeasonHistoryValidationSchema } from '../validations';
import { ISeasonListFE, ISeasonByChapterFE } from '../interfaces';

import archivedHistoryData from '../data/archived_season_history.json';

export const createSeasonHistoryV1 = async (c: TCFContext) => {
    const body = SeasonHistoryValidationSchema.parse(await c.req.json());
    const db = getDrizzle();

    const [createdHistory] = await db.insert(SeasonHistoryTable).values({
        ...body,
    }).returning({
        chapter: SeasonHistoryTable.chapter,
        season_in_chapter: SeasonHistoryTable.season_in_chapter
    });

    const seasonText = `Chapter ${createdHistory.chapter}, Season ${createdHistory.season_in_chapter}`

    return c.json({ message: `Successfully added ${seasonText} to Season History.` });
};

export const getAllSeasonHistoryV1 = async (c: TCFContext) => {
    const db = getDrizzle();
    const historyInDb = await db.query.SeasonHistoryTable.findMany({
        columns: {
            id: false,
            created_at: false,
            updated_at: false
        }
    });

    const archivedHistory: TOmitedSeasonHistory = archivedHistoryData as unknown as TOmitedSeasonHistory;
    const mergedHistory = historyInDb
        .concat(archivedHistory)
        .sort((a, b) => b.season_code - a.season_code)
        .map(h => ({
            ...h,
            season_duration: `${differenceInDays(h.end_date, h.start_date)} days`,
            season_completed: h.end_date ? isPast(h.end_date) : false
        }));

    

    const seasonByChapter = mergedHistory.reduce((prev: { [chapter: number]: ISeasonListFE[] }, current: ISeasonListFE) => {
        const chapter = +current.chapter;

        if (!prev[chapter]) {
            prev[chapter] = [current];
        } else {
            prev[chapter].push(current);
        }
        return prev;
    }, {});

    const data: ISeasonByChapterFE[] = Object.keys(seasonByChapter)
        .map(chapter => +chapter)
        .map(chapter => ({ chapter, history: seasonByChapter[chapter] }))
        // Sort to recent chapter first
        .sort((a, b) => b.chapter - a.chapter);

    return c.json(data);
};

export const syncRecentSeasonHistoryV1 = async (c: TCFContext) => { };
import { FortniteCrewTable } from '../db/schema';
import { getDrizzle } from '../lib';
import { TCFContext } from '../types';
import { CrewValidationSchema } from '../validations';

export const createCrewV1 = async (c: TCFContext) => {
    const body = CrewValidationSchema.parse(await c.req.json());

    const db = getDrizzle();
    await db.insert(FortniteCrewTable).values({
        ...body,
    }).returning({ id: FortniteCrewTable.id });

    const message: string = 'Successfully added new Fortnite Crew to database.';

    return c.json({ message });
};

export const updateCrewDetailsV1 = async (c: TCFContext) => { };

export const deleteCrewById = async (c: TCFContext) => { };
import {
    startOfYear,
    subYears,
    format,
    isThisMonth,
    startOfMonth,
    endOfMonth
} from 'date-fns';
import { desc } from 'drizzle-orm';

import { FortniteCrewTable } from '../db/schema';
import { IFECosmeticListing, IRootCosmeticListing } from '../interfaces';
import { getDrizzle } from '../lib';
import { TCFContext } from '../types';
import { CrewValidationSchema } from '../validations';

import crewRewardsData from '../data/crew_rewards_cosmetic.json';
import { FortniteComBaseUrl } from '../constants';
import { formatBrListingResponse } from '../helpers';

export const createCrewV1 = async (c: TCFContext) => {
    const body = CrewValidationSchema.parse(await c.req.json());

    const db = getDrizzle();
    await db.insert(FortniteCrewTable).values({
        ...body,
    }).returning({ id: FortniteCrewTable.id });

    const message: string = 'Successfully added new Fortnite Crew to database.';

    return c.json({ message });
};

export const getAllRecentCrewV1 = async (c: TCFContext) => {
    const db = getDrizzle();

    const cosmeticsDetails: { [id: string]: IFECosmeticListing } = crewRewardsData.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});
    const startDate = startOfYear(subYears(new Date(), 2));
    const endDate = new Date();
    const recentCrewInDb = await db.query.FortniteCrewTable.findMany({
        columns: {
            id: false,
            created_at: false,
            updated_at: false
        },
        where: ({ crew_date }, { between }) => between(
            crew_date,
            startDate,
            endDate
        ),
        orderBy: [desc(FortniteCrewTable.crew_date)],
    });

    const recentCrewData = recentCrewInDb.map(r => {
        const rewards = r.rewards_id.map(id => cosmeticsDetails[id] || null).filter(c => c !== null);
        const outfitName = rewards.find(r => r.item_type.id.toLowerCase() === 'outfit')?.name.toUpperCase() || '';
        const name = `${outfitName} CREW PACK`.toUpperCase();
        const month = format(new Date(r.crew_date), 'MMMM y');

        return {
            name,
            month,
            background_color: `linear-gradient(#${r.color_1}, #${r.color_2}, #${r.color_2})`,
            background_image: r.image_with_bg,
            current_pack: isThisMonth(r.crew_date),
            rewards
        };
    });

    const crewByYear = recentCrewData.reduce((prev: { [year: number]: any[]; }, current: any) => {
        const splittedYear = current.month.split(' ');
        const year = +splittedYear[splittedYear.length - 1];

        if (!prev[year]) {
            prev[year] = [current];
        } else {
            prev[year].push(current);
        }
        return prev;
    }, {});
    const crewResponse = Object.keys(crewByYear).map(year => ({ year: +year, crew_data: crewByYear[+year] }))
        .sort((a, b) => b.year - a.year);

    return c.json(crewResponse);
};

export const getCurrentActiveCrewV1 = async (c: TCFContext) => {
    const db = getDrizzle();
    const currentCrew = await db.query.FortniteCrewTable.findFirst({
        columns: {
            rewards_id: true
        },
        where: ({ crew_date }, { between }) => between(
            crew_date,
            startOfMonth(new Date()),
            endOfMonth(new Date())
        )
    });

    // TODO: Add interface type
    let response: { available: boolean, crew_rewards: IFECosmeticListing[]; } = {
        available: currentCrew !== undefined && currentCrew.rewards_id.length > 0,
        crew_rewards: []
    };

    if (currentCrew !== undefined && currentCrew.rewards_id.length > 0) {
        // Just to make sure theres no duplicate ids
        const rewardIds: string[] = [...new Set(currentCrew.rewards_id)];
        // Params for API
        const params = new URLSearchParams();

        rewardIds.forEach(id => params.append('id', id));

        console.log(params);

        const url: string = `${FortniteComBaseUrl}/v2/cosmetics/br/search/ids?${params.toString()}`;
        const fetchedCosmeticListing = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const cosmeticListingJson = await fetchedCosmeticListing.json() as IRootCosmeticListing;
        console.log(cosmeticListingJson)
        const data = formatBrListingResponse(cosmeticListingJson.data);
    
        response.crew_rewards = data;
    };

    return c.json(response);
};

export const updateCrewDetailsByIdV1 = async (c: TCFContext) => { };

export const deleteCrewByIdV1 = async (c: TCFContext) => { };
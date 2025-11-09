import {
    format,
    isThisMonth,
    startOfYear,
    subYears
} from 'date-fns';
import { desc } from 'drizzle-orm';

import {
    IFECosmeticListing,
    IRootSeasonPasses
} from '../interfaces';
import { getDrizzle } from '../lib';
import { TCFContext } from '../types';
import { FortniteCrewTable } from '../db/schema';

import crewRewardsData from '../data/crew_rewards_cosmetic.json';

export const getCurrentSeasonsV1 = async (c: TCFContext) => {
    const lang = c.req.query('lang') || 'en';

    const params = new URLSearchParams();
    params.append('lang', lang);

    const url: string = `https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game/seasonpasses?${params.toString()}`;
    const seasonPassesResponse = await fetch(url, {
        method: 'GET',
        headers: {
            "Content-Type": 'application/json'
        }
    });

    const {
        figmentpassdata,
        musicpassdata,
        legopassdata,
        battlepassdata
    } = await seasonPassesResponse.json() as IRootSeasonPasses;

    const activeSeasonsArr = [
        {
            id: 'battle_royale',
            mode_name: 'Battle Royale',
            name: 'Latest Battle Royale',
            end_date: battlepassdata.seasonEndDateTime,
            season_completed_percentage: seasonPercentage(battlepassdata._activeDate, battlepassdata.seasonEndDateTime),
            season_completed_progress: seasonPercentage(battlepassdata._activeDate, battlepassdata.seasonEndDateTime) / 100
        },
        {
            id: 'fortnite_og',
            mode_name: 'Fortnite OG',
            name: 'Fortnite OG',
            end_date: figmentpassdata.seasonEndDateTime,
            season_completed_percentage: seasonPercentage(figmentpassdata._activeDate, figmentpassdata.seasonEndDateTime),
            season_completed_progress: seasonPercentage(figmentpassdata._activeDate, figmentpassdata.seasonEndDateTime) / 100
        },
        {
            id: 'fortnite_festival',
            mode_name: 'Music',
            name: 'Fortnite Festival',
            end_date: musicpassdata.seasonEndDateTime,
            season_completed_percentage: seasonPercentage(musicpassdata._activeDate, musicpassdata.seasonEndDateTime),
            season_completed_progress: seasonPercentage(musicpassdata._activeDate, musicpassdata.seasonEndDateTime) / 100
        },
        {
            id: 'lego',
            mode_name: 'Lego',
            name: 'Fortnite LEGO',
            end_date: legopassdata.seasonEndDateTime,
            season_completed_percentage: seasonPercentage(legopassdata._activeDate, legopassdata.seasonEndDateTime),
            season_completed_progress: seasonPercentage(legopassdata._activeDate, legopassdata.seasonEndDateTime) / 100
        }
    ];
    const activeSeasonOpts = activeSeasonsArr.map(s => ({ name: s.mode_name, value: s.id }));

    const data = {
        selection_opts: activeSeasonOpts,
        active_seasons: activeSeasonsArr
    };

    return c.json(data);
};

export const getAllFortniteCrewV1 = async (c: TCFContext) => {
    const db = getDrizzle();

    const cosmeticsDetails: { [id: string]: IFECosmeticListing } = crewRewardsData.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});
    const startDate = startOfYear(subYears(new Date(), 3));
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
    const yearOpts = crewResponse.map(r => r.year);

    const response = {
        year_options: yearOpts,
        crew_by_year: crewResponse
    };

    return c.json(response);
};

function seasonPercentage(startDate: string, endDate: string) {
    const startDateObj = new Date(startDate).getTime();
    const endDateObj = new Date(endDate).getTime();
    const todayDate = new Date().getTime();

    const total = endDateObj - startDateObj;
    const current = todayDate - startDateObj;

    return Math.round((current / total) * 100);
};
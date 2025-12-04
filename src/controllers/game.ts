import { IRootSeasonPasses } from '../interfaces';
import { TCFContext } from '../types';

export const getCurrentSeasonsV1 = async (c: TCFContext) => {
  const lang = c.req.query('lang') || 'en';

  const params = new URLSearchParams();
  params.append('lang', lang);

  const url: string = `https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game/seasonpasses?${params.toString()}`;
  const seasonPassesResponse = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const { figmentpassdata, musicpassdata, legopassdata, battlepassdata } =
    (await seasonPassesResponse.json()) as IRootSeasonPasses;

  const activeSeasonsArr = [
    {
      id: 'battle_royale',
      mode_name: 'Battle Royale',
      name: 'Chapter 7, Season 1',
      end_date: battlepassdata.seasonEndDateTime,
      season_completed_percentage: seasonPercentage(
        battlepassdata._activeDate,
        battlepassdata.seasonEndDateTime
      ),
      season_completed_progress:
        seasonPercentage(battlepassdata._activeDate, battlepassdata.seasonEndDateTime) / 100,
    },
    {
      id: 'fortnite_og',
      mode_name: 'Fortnite OG',
      name: 'Fortnite OG',
      end_date: figmentpassdata.seasonEndDateTime,
      season_completed_percentage: seasonPercentage(
        figmentpassdata._activeDate,
        figmentpassdata.seasonEndDateTime
      ),
      season_completed_progress:
        seasonPercentage(figmentpassdata._activeDate, figmentpassdata.seasonEndDateTime) / 100,
    },
    {
      id: 'fortnite_festival',
      mode_name: 'Music',
      name: 'Fortnite Festival',
      end_date: musicpassdata.seasonEndDateTime,
      season_completed_percentage: seasonPercentage(
        musicpassdata._activeDate,
        musicpassdata.seasonEndDateTime
      ),
      season_completed_progress:
        seasonPercentage(musicpassdata._activeDate, musicpassdata.seasonEndDateTime) / 100,
    },
    {
      id: 'lego',
      mode_name: 'Lego',
      name: 'Fortnite LEGO',
      end_date: legopassdata.seasonEndDateTime,
      season_completed_percentage: seasonPercentage(
        legopassdata._activeDate,
        legopassdata.seasonEndDateTime
      ),
      season_completed_progress:
        seasonPercentage(legopassdata._activeDate, legopassdata.seasonEndDateTime) / 100,
    },
  ];
  const activeSeasonOpts = activeSeasonsArr.map((s) => ({ name: s.mode_name, value: s.id }));

  const data = {
    selection_opts: activeSeasonOpts,
    active_seasons: activeSeasonsArr,
  };

  return c.json(data);
};

function seasonPercentage(startDate: string, endDate: string) {
  const startDateObj = new Date(startDate).getTime();
  const endDateObj = new Date(endDate).getTime();
  const todayDate = new Date().getTime();

  const total = endDateObj - startDateObj;
  const current = todayDate - startDateObj;

  return Math.round((current / total) * 100);
}

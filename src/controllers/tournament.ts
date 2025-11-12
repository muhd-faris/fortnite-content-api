import { getDrizzle } from '../lib';
import { TCFContext } from '../types';

import rawTournament from '../data/seed/tournaments-past.json';
import {
  IEGAccessToken,
  IEGError,
  IRootEpicGamesTournament,
  IRootLeaderboardDefs,
  ITournamentPlatform,
} from '../interfaces';
import { CustomException } from '../helpers';
import { TournamentValidationSchema } from '../validations';

export const getTournamentsV1 = (c: TCFContext) => {};

export const getTournamentDetailsV1 = (c: TCFContext) => {};

export const getTournamentWindowDetailsV1 = (c: TCFContext) => {};

export const syncTournamentToDatabaseV1 = async (c: TCFContext) => {
  /**
   * Syncing can be used automatically or manually triggered in Admin
   *
   * Step 1 - Get Server Region
   * Step 2 - Get Access Token from Epic Games API
   * Step 3 - Call Epic Games Tournaments API
   * Step 4 - Parsed to match Database Schema
   * Step 5 - Remove all Tournaments from the region in Database
   * Step 6 - Add new Tournaments to region Database
   */
  const { region } = TournamentValidationSchema.parse(await c.req.json());

  const { access_token } = await getEpicGamesAccessToken();

  const params = new URLSearchParams();
  params.append('region', region.toUpperCase());
  params.append('showPastEvents', 'true');

  const gameId: string = 'Fortnite';
  const accountId: string = process.env.EPIC_GAMES_ACCOUNT_ID!;
  const url: string = `https://events-public-service-live.ol.epicgames.com/api/v1/events/${gameId}/data/${accountId}?${params.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const jsonResponse = (await response.json()) as IRootEpicGamesTournament;

  const {
    events = [],
    leaderboardDefs = [],
    scoringRuleSets = {},
    payoutTables = {},
  } = jsonResponse;

  if (events.length === 0) {
    throw new CustomException('No tournaments available to parse. Please try again later.', 400);
  }

  // Create a fast lookup map for leaderboard definitions
  const leaderboardDefsMap = new Map<string, IRootLeaderboardDefs>(
    leaderboardDefs.map((def) => [def.leaderboardDefId, def])
  );

  // TODO: Define interface
  const formattedEvents: any[] = [];

  for (const ev of events) {
    const displayId = ev.displayDataId;

    // TODO: Add name, description and image
    const formattedPlatforms: ITournamentPlatform[] = formatTournamentPlatform(ev.platforms);
    const eventResponse: any = {
      event_id: ev.eventId,
      start_time: ev.beginTime,
      end_time: ev.endTime,
      region,
      platforms: formattedPlatforms,
      session_windows: [],
    };

    for (const window of ev.eventWindows) {
      let windowResponse: any = {
        window_id: window.eventWindowId,
        countdown_starts_at: window.countdownBeginTime,
        start_time: window.beginTime,
        end_time: window.endTime,
        // TODO: Format to FNTrack desired data
        scoring: [],
        // TODO: Format to FNTrack desired data
        payout: [],
      };

      // TODO: Break this into seperate function because either way it wont be undefined
      // Find the main leaderboard
      let scoreLocation = window.scoreLocations.find((sl) => sl.isMainWindowLeaderboard);
      // If no main leaderboard then assign any available leaderboard
      if (!scoreLocation && window.scoreLocations.length > 0) {
        scoreLocation = window.scoreLocations[0];
      }

      if (scoreLocation) {
        const leaderboardDef = leaderboardDefsMap.get(scoreLocation.leaderboardDefId);

        if (leaderboardDef) {
          const scoringId = leaderboardDef.scoringRuleSetId;

          if (scoringId) {
            windowResponse.scoring = scoringRuleSets[scoringId] ?? [];
          }

          const payoutIdFormat = leaderboardDef.payoutsConfig?.payoutTableIdFormat;

          if (payoutIdFormat) {
            const resolvedPayoutId = payoutIdFormat
              .replace('${eventId}', ev.eventId ?? '')
              .replace('${windowId}', window.eventWindowId ?? '');

            windowResponse.payout = payoutTables[resolvedPayoutId] ?? null;
          }
        }
      }
      eventResponse.session_windows.push(windowResponse);
    }
    formattedEvents.push(eventResponse);
  }

  return c.json(formattedEvents);
};

function formatTournamentPlatform(platforms: string[]): ITournamentPlatform[] {
  const plt: ITournamentPlatform[] = [];

  for (const p of platforms) {
    if (p.toLowerCase().includes('xbox')) {
      plt.push({ display_name: 'Xbox', value: 'xbox' });
    }

    if (p.toLowerCase().includes('switch')) {
      plt.push({ display_name: 'Nintendo Switch', value: 'switch' });
    }

    if (p.toLowerCase().includes('windows')) {
      plt.push({ display_name: 'PC', value: 'pc' });
    }

    if (
      p.toLowerCase().includes('mobile') ||
      p.toLowerCase().includes('android') ||
      p.toLowerCase().includes('ios')
    ) {
      plt.push({ display_name: 'Mobile', value: 'mobile' });
    }

    if (p.toLowerCase().startsWith('ps')) {
      plt.push({ display_name: 'Playstation', value: 'playstation' });
    }
  }

  const uniquePlatformsJSON = new Set(plt.map((p) => JSON.stringify(p)));

  return Array.from(uniquePlatformsJSON).map((s) => JSON.parse(s));
}

function getClientDetails(client: 'fortnite_pc_game' | 'fortnite_android_game') {
  let cliendId: string = '';
  let clientSecret: string = '';

  switch (client) {
    case 'fortnite_android_game':
      cliendId = '3f69e56c7649492c8cc29f1af08a8a12';
      clientSecret = 'b51ee9cb12234f50a69efa67ef53812e';

      break;

    case 'fortnite_pc_game':
      cliendId = 'ec684b8c687f479fadea3cb2ad83f5c6';
      clientSecret = 'e1f31c211f28413186262d37a13fc84d';

      break;
    default:
      throw new CustomException('Unsupported Client Name provided. Please try again later.', 400);
  }

  return { client_id: cliendId, client_secret: clientSecret };
}

async function getEpicGamesAccessToken() {
  const clientDetails = getClientDetails('fortnite_android_game');
  const authHeader = Buffer.from(
    `${clientDetails.client_id}:${clientDetails.client_secret}`,
    'utf8'
  ).toString('base64');

  const body = new URLSearchParams({
    grant_type: 'device_auth',
    account_id: process.env.EPIC_GAMES_ACCOUNT_ID!,
    device_id: process.env.EPIC_GAMES_DEVICE_ID!,
    secret: process.env.EPIC_GAMES_DEVICE_ID_SECRET!,
  });

  const response = await fetch(
    'https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    }
  );

  if (response.ok) {
    const successData = (await response.json()) as IEGAccessToken;

    return successData;
  } else {
    const errorData = (await response.json()) as IEGError;

    throw errorData;
  }
}

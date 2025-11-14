import { getDrizzle } from '../lib';
import { TCFContext, TTournamentExtraDetails } from '../types';

import {
  IEGAccessToken,
  IEGError,
  IParsedTournamentPayoutResponse,
  IParsedTournamentScoringResponse,
  IRootEpicGamesTournament,
  IRootLeaderboardDefs,
  IRootPayoutTable,
  IRootScoringRuleSet,
  ITournamentDisplayInfo,
  ITournamentPlatform,
} from '../interfaces';
import { CustomException } from '../helpers';
import { TournamentValidationSchema } from '../validations';
import { EGTournamentInfoEndpoint, EGTournamentListingEndpoint } from '../constants';

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
  const tournamentListingUrl: string = `${EGTournamentListingEndpoint}/${gameId}/data/${accountId}?${params.toString()}`;
  const response = await fetch(tournamentListingUrl, {
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

  const tournamentInfoResponse = await fetch(EGTournamentInfoEndpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const tournamentInfoJsonRes = (await tournamentInfoResponse.json()) as TTournamentExtraDetails;
  const tournamentDetails = extractTournamentDisplayInfo(tournamentInfoJsonRes);
  // Create a fast lookup map for leaderboard definitions
  const leaderboardDefsMap = new Map<string, IRootLeaderboardDefs>(
    leaderboardDefs.map((def) => [def.leaderboardDefId, def])
  );

  // TODO: Define interface
  const formattedEvents: any[] = [];

  for (const ev of events) {
    const details = searchTournamentByDisplayId(tournamentDetails, ev.displayDataId);

    const formattedPlatforms: ITournamentPlatform[] = formatTournamentPlatform(ev.platforms);
    const eventResponse: any = {
      event_id: ev.eventId,
      ...details,
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
        scoring_id: null,
        scoring: [],
        payout_id: null,
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
            // TODO: Temporary Disable
            // windowResponse.scoring = formateScoringResponse(scoringRuleSets[scoringId] ?? []);
            windowResponse.scoring_id = scoringId;
          }

          const payoutIdFormat = leaderboardDef.payoutsConfig?.payoutTableIdFormat;

          if (payoutIdFormat) {
            const resolvedPayoutId = payoutIdFormat
              .replace('${eventId}', ev.eventId ?? '')
              .replace('${windowId}', window.eventWindowId ?? '');

            // TODO: Temporary Disable
            // windowResponse.payout = formatPayoutResponse(payoutTables[resolvedPayoutId] ?? []);
            windowResponse.payout_id = resolvedPayoutId;
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

  // console.log(authHeader);

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

function formateScoringResponse(data: IRootScoringRuleSet[]) {
  return data.map((sc) => {
    const typeKey: { [id: string]: string } = {
      ['PLACEMENT_STAT_INDEX']: 'Placements',
      ['TEAM_ELIMS_STAT_INDEX']: 'Eliminations',
    };
    const points = sc.rewardTiers.map((r) => ({ value: r.keyValue, points: r.pointsEarned }));

    return { type: typeKey[sc.trackedStat], rewards: points };
  });
}

function formatPayoutResponse(data: IRootPayoutTable[]) {
  const handleKey: Record<string, string> = {
    ['game']: 'cosmetics',
    ['floatingScore']: 'hype',
    ['token']: 'qualify',
    ['ecomm']: 'money',
    ['persistentScore']: 'point',
  };

  return data.flatMap((prize) =>
    prize.ranks.flatMap((rank) =>
      rank.payouts.map((payout) => {
        const normalizedRewardType = payout.rewardType.toLowerCase();

        const value =
          normalizedRewardType === 'game'
            ? (payout.value.split(':')[1] ?? payout.value)
            : payout.value;

        return {
          type: prize.scoringType,
          threshold: tournamentPrizeType(prize.scoringType, rank.threshold),
          quantity: payout.quantity,
          rewardType: handleKey[normalizedRewardType],
          value: value,
        };
      })
    )
  );
}

function tournamentPrizeType(type: string, threshold: number): string {
  type = type.toLowerCase();

  if (type === 'percentile') return `Top ${threshold * 100}%`;
  else if (type === 'value') return `Earned ${threshold} Points`;

  return `Top #${threshold}`;
}

export function extractTournamentDisplayInfo(
  details: TTournamentExtraDetails
): ITournamentDisplayInfo[] {
  const result: ITournamentDisplayInfo[] = [];

  Object.entries(details).forEach(([key, value]) => {
    // Skip known static keys
    if (
      [
        'conversion_config',
        'tournament_info',
        '_title',
        '_noIndex',
        '_activeDate',
        'lastModified',
        '_locale',
        '_templateName',
        '_suggestedPrefetch',
      ].includes(key)
    ) {
      return;
    }

    // Only process dynamic tournament entries
    if (value && typeof value === 'object' && 'tournament_info' in value) {
      const info = value.tournament_info;
      result.push({
        display_id: key,
        title_line_1: info.title_line_1,
        title_line_2: info.title_line_2,
        short_format_title: info.short_format_title,
        details_description: info.details_description,
        playlist_tile_image: info.playlist_tile_image,
      });
    }
  });

  return result;
}

function searchTournamentByDisplayId(
  data: ITournamentDisplayInfo[],
  displayId: string
): ITournamentDisplayInfo {
  const defaultResponse: ITournamentDisplayInfo = {
    display_id: displayId,
    title_line_1: null,
    title_line_2: null,
    short_format_title: null,
    details_description: null,
    playlist_tile_image: null,
  };

  return data.find((d) => d.display_id === displayId) || defaultResponse;
}

// TODO: Test this implementation
/** Parse the response coming from Epic Games to the format we want before storing in the database */
function parsePayoutResponse(
  data: Record<string, IRootPayoutTable[]>
): IParsedTournamentPayoutResponse[] {
  const result: IParsedTournamentPayoutResponse[] = [];

  for (const [id, scoringGroups] of Object.entries(data)) {
    for (const group of scoringGroups) {
      for (const rank of group.ranks) {
        for (const payout of rank.payouts) {
          result.push({
            epic_payout_id: id,
            scoring_type: group.scoringType,
            threshold: rank.threshold,
            reward_type: payout.rewardType,
            reward_mode: payout.rewardMode,
            value: payout.value,
            quantity: payout.quantity,
          });
        }
      }
    }
  }

  return result;
}

/** Parse the response coming from Epic Games to the format we want before storing in the database */
function parseScoringResponse(
  data: Record<string, IRootScoringRuleSet[]>
): IParsedTournamentScoringResponse[] {
  const result: IParsedTournamentScoringResponse[] = [];

  for (const [id, rules] of Object.entries(data)) {
    for (const rule of rules) {
      for (const tier of rule.rewardTiers) {
        result.push({
          epic_score_id: id,
          tracked_stat: rule.trackedStat,
          key_value: tier.keyValue,
          points_earned: tier.pointsEarned,
        });
      }
    }
  }

  return result;
}

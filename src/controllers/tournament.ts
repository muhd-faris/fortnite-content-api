import { getDrizzle } from '../lib';
import { TCFContext, TTournamentExtraDetails } from '../types';

import {
  IParsedTournamentPayoutData,
  IParsedTournamentPayoutResponse,
  IParsedTournamentScoringResponse,
  IParsedTournamentScoringRules,
  IRootEpicGamesTournament,
  IRootLeaderboardDefs,
  IRootPayoutTable,
  IRootScoringRuleSet,
  ITournamentDisplayInfo,
  ITournamentEvent,
  ITournamentEventSession,
  ITournamentPlatform,
} from '../interfaces';
import { CustomException, getEGAccountAccessToken } from '../helpers';
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

  const { access_token } = await getEGAccountAccessToken();

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

  const { events, leaderboardDefs, scoringRuleSets, payoutTables } = jsonResponse;

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

  const formattedEvents: ITournamentEvent[] = [];

  for (const ev of events) {
    const details = searchTournamentByDisplayId(tournamentDetails, ev.displayDataId);

    const formattedPlatforms: ITournamentPlatform[] = formatTournamentPlatform(ev.platforms);
    const eventResponse: ITournamentEvent = {
      event_id: ev.eventId,
      ...details,
      start_time: ev.beginTime,
      end_time: ev.endTime,
      region,
      platforms: formattedPlatforms,
      session_windows: [],
    };

    for (const window of ev.eventWindows) {
      let windowResponse: ITournamentEventSession = {
        window_id: window.eventWindowId,
        countdown_starts_at: window.countdownBeginTime,
        start_time: window.beginTime,
        end_time: window.endTime,
        scoring_id: null,
        scoring: [],
        payout_id: null,
        payout: [],
      };

      // Find the main leaderboard and if no main leaderboard then assign any available leaderboard
      const scoreLocation =
        window.scoreLocations.find((sl) => sl.isMainWindowLeaderboard) ?? window.scoreLocations[0];

      if (scoreLocation) {
        const leaderboardDef = leaderboardDefsMap.get(scoreLocation.leaderboardDefId);

        windowResponse.scoring_id = leaderboardDef?.scoringRuleSetId ?? null;

        const payoutIdFormat = leaderboardDef?.payoutsConfig?.payoutTableIdFormat ?? '';
        const resolvedPayoutId = payoutIdFormat
          .replace('${eventId}', ev.eventId ?? '')
          .replace('${windowId}', window.eventWindowId ?? '');

        windowResponse.payout_id = resolvedPayoutId;
      }
      eventResponse.session_windows.push(windowResponse);
    }

    formattedEvents.push(eventResponse);
  }

  const parsedPayout: IParsedTournamentPayoutResponse[] = parsePayoutResponse(payoutTables).map(
    (p) => ({
      ...p,
      region,
    })
  );

  const parsedScoring: IParsedTournamentScoringResponse[] = parseScoringResponse(
    scoringRuleSets
  ).map((s) => ({
    ...s,
    region,
  }));

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
): Omit<IParsedTournamentPayoutResponse, 'region'>[] {
  return Object.entries(data).map(([eventId, eventRules]) => {
    const flatPayouts: IParsedTournamentPayoutData[] = eventRules.flatMap((group) =>
      group.ranks.flatMap((rank) =>
        rank.payouts.map((payout) => ({
          scoring_type: group.scoringType,
          threshold: rank.threshold,
          reward_type: payout.rewardType,
          reward_mode: payout.rewardMode,
          value: payout.value,
          quantity: payout.quantity,
        }))
      )
    );

    return {
      epic_payout_id: eventId,
      payout_data: flatPayouts,
    };
  });
}

/** Parse the response coming from Epic Games to the format we want before storing in the database */
function parseScoringResponse(
  data: Record<string, IRootScoringRuleSet[]>
): Omit<IParsedTournamentScoringResponse, 'region'>[] {
  return Object.entries(data).map(([id, rulesArray]) => {
    const flatRules: IParsedTournamentScoringRules[] = rulesArray.flatMap((rule) =>
      rule.rewardTiers.map((tier) => ({
        tracked_stat: rule.trackedStat,
        key_value: tier.keyValue,
        points_earned: tier.pointsEarned,
      }))
    );

    return {
      epic_score_id: id,
      scoring_rules: flatRules,
    };
  });
}

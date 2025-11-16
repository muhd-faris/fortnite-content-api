import { getDrizzle } from '../lib';
import { TCFContext, TSupportedRegion, TTournamentExtraDetails } from '../types';
import {
  IRootEpicGamesTournament,
  ITournamentDisplayInfo,
  ITournamentEvent,
  ITournamentEventSession,
  ITournamentInfo,
  ITournamentSessionFE,
} from '../interfaces';
import { CustomException, getEGAccountAccessToken } from '../helpers';
import { TournamentValidationSchema } from '../validations';
import { EGTournamentInfoEndpoint, EGTournamentListingEndpoint } from '../constants';
import { FortniteTournamentSessionTable, FortniteTournamentTable } from '../db/schema';

export const getTournamentsV1 = async (c: TCFContext) => {
  const userRegion = c.req.query('region') || 'asia';

  const db = getDrizzle();
  const tournamentsInDb = await db.query.FortniteTournamentTable.findMany({
    where: ({ region }, { eq }) => eq(region, userRegion as TSupportedRegion),
    columns: {
      id: false,
      display_id: false,
      playlist_tile_image: false,
      details_description: false,
      region: false,
      created_at: false,
      updated_at: false,
    },
    with: {
      sessions: {
        columns: {
          id: false,
          event_id: false,
          countdown_starts_at: false,
          epic_score_id: false,
          epic_payout_id: false,
          created_at: false,
          updated_at: false,
        },
      },
    },
  });
  const tournaments = tournamentsInDb.map((t) => {
    const { sessions, ...excludeSession } = t;
    const formattedSessions: ITournamentSessionFE[] = sessions.map((s, index) => ({
      session_name: generateTournamentSessionName(s.window_id, index),
      ...s,
      status: getTournamentStatus(s.start_time, s.end_time),
    }));
    const nextSession = getNextSession(formattedSessions);

    return {
      ...excludeSession,
      sessions: formattedSessions,
      next_session: nextSession,
      current_status: nextSession !== null ? nextSession.status : 'ended',
    };
  });

  return c.json(tournaments);
};

export const getLiveTournamentsV1 = async (c: TCFContext) => {
  const userRegion = c.req.query('region') || 'asia';

  const db = getDrizzle();
  const tournamentsInDb = await db.query.FortniteTournamentSessionTable.findMany({
    where: ({ start_time, end_time }, { and, lte, gte }) =>
      and(lte(start_time, new Date()), gte(end_time, new Date())),
    columns: {
      window_id: true,
      start_time: true,
      end_time: true,
    },
    with: {
      tournament: {
        columns: {
          name: true,
          region: true,
          platforms: true,
        },
      },
    },
  });
  const tournaments = tournamentsInDb
    .filter((t) => t.tournament.region === userRegion)
    .map((t) => {
      const { tournament, ...excludeTournamentObj } = t;
      const { region, ...excludeRegion } = tournament;

      return {
        ...excludeTournamentObj,
        ...excludeRegion,
      };
    });

  return c.json(tournaments);
};

export const getTournamentDetailsV1 = async (c: TCFContext) => {
  const eventId = c.req.param('eventId') as string;

  const db = getDrizzle();
  const tournamentDetailsInDb = await db.query.FortniteTournamentTable.findFirst({
    where: ({ event_id }, { eq }) => eq(event_id, eventId),
    columns: {
      id: false,
      created_at: false,
      updated_at: false,
      region: false,
      event_id: false,
      display_id: false,
    },
    with: {
      sessions: {
        columns: {
          id: false,
          event_id: false,
          countdown_starts_at: false,
          created_at: false,
          updated_at: false,
        },
      },
    },
  });

  if (!tournamentDetailsInDb) {
    throw new CustomException('No tournaments matching with that ID', 404);
  }

  const formattedSessions: ITournamentSessionFE[] = tournamentDetailsInDb.sessions.map(
    (s, index) => ({
      session_name: generateTournamentSessionName(s.window_id, index),
      ...s,
      status: getTournamentStatus(s.start_time, s.end_time),
    })
  );
  const nextSession = getNextSession(formattedSessions);

  const { sessions, ...excludeSession } = tournamentDetailsInDb;
  const response = {
    ...excludeSession,
    sessions: formattedSessions,
    next_session: nextSession,
    current_status: nextSession !== null ? nextSession.status : 'ended',
  };

  return c.json(response);
};

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
  // TODO: Enable override_database in future
  const { region, override_database } = TournamentValidationSchema.parse(await c.req.json());

  const { access_token } = await getEGAccountAccessToken();

  const params = new URLSearchParams();
  params.append('region', region.toUpperCase());
  // Show only current season
  params.append('showPastEvents', 'false');

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

  const { events } = jsonResponse;
  // TODO: Enable in Future
  // const { events, leaderboardDefs, scoringRuleSets, payoutTables } = jsonResponse;

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
  const tournamentDetails = parseTournamentConfig(tournamentInfoJsonRes);
  // TODO: Enable in Future
  // Create a fast lookup map for leaderboard definitions
  // const leaderboardDefsMap = new Map<string, IRootLeaderboardDefs>(
  //   leaderboardDefs.map((def) => [def.leaderboardDefId, def])
  // );

  const formattedEvents: ITournamentEvent[] = [];
  const parsedTournamentSessions: ITournamentEventSession[] = [];

  for (const ev of events) {
    const details = searchTournamentByDisplayId(tournamentDetails, ev.displayDataId);

    const platforms = formatTournamentPlatform(ev.platforms);
    const eventResponse: ITournamentEvent = {
      event_id: ev.eventId,
      ...details,
      start_time: new Date(ev.beginTime),
      end_time: new Date(ev.endTime),
      region: region as TSupportedRegion,
      platforms,
    };

    for (const window of ev.eventWindows) {
      let windowResponse: ITournamentEventSession = {
        window_id: window.eventWindowId,
        event_id: eventResponse.event_id,
        countdown_starts_at: new Date(window.countdownBeginTime),
        start_time: new Date(window.beginTime),
        end_time: new Date(window.endTime),
        epic_score_id: null,
        epic_payout_id: null,
      };

      // TODO: Enable in Future
      // Find the main leaderboard and if no main leaderboard then assign any available leaderboard
      // const scoreLocation =
      //   window.scoreLocations.find((sl) => sl.isMainWindowLeaderboard) ?? window.scoreLocations[0];

      // if (scoreLocation) {
      //   const leaderboardDef = leaderboardDefsMap.get(scoreLocation.leaderboardDefId);

      //   windowResponse.epic_score_id = leaderboardDef?.scoringRuleSetId ?? null;

      //   let payoutIdFormat = leaderboardDef?.payoutsConfig?.payoutTableIdFormat ?? '';

      //   if (payoutIdFormat.includes('${')) {
      //     const resolvedPayoutId = payoutIdFormat
      //       .replace(/\$\{windowId\}/g, window.eventWindowId)
      //       .replace(/\$\{eventId\}/g, window.eventWindowId)
      //       .replace(/\$\{round\}/g, String(window.round));

      //     payoutIdFormat = resolvedPayoutId;
      //   }

      //   windowResponse.epic_payout_id = payoutIdFormat;
      // }

      parsedTournamentSessions.push(windowResponse);
    }

    formattedEvents.push(eventResponse);
  }

  // TODO: Enable in Future update
  // const parsedPayout: IParsedTournamentPayoutResponse[] = parsePayoutResponse(payoutTables).map(
  //   (p) => ({
  //     ...p,
  //     region: region as TSupportedRegion,
  //   })
  // );

  // TODO: Enable in Future update
  // const parsedScoring: IParsedTournamentScoringResponse[] = parseScoringResponse(
  //   scoringRuleSets
  // ).map((s) => ({
  //   ...s,
  //   region: region as TSupportedRegion,
  // }));

  const db = getDrizzle();
  await db.transaction(async (tx) => {
    const savedTournament = await tx
      .insert(FortniteTournamentTable)
      .values(formattedEvents)
      .returning({ id: FortniteTournamentTable.id });

    console.log(`Successfully sync ${savedTournament.length} tournament to database.`);

    // if (parsedPayout.length > 0) {
    //   const createdPayout = await db
    //     .insert(FortniteTournamentPayoutTable)
    //     .values(parsedPayout)
    //     .returning({ id: FortniteTournamentPayoutTable.id });

    //   console.log(`Successfully sync ${createdPayout.length} payout data to database.`);
    // }

    // if (parsedScoring.length > 0) {
    //   const scoringInDb = await db
    //     .insert(FortniteTournamentScoringTable)
    //     .values(parsedScoring)
    //     .returning({ id: FortniteTournamentScoringTable.id });

    //   console.log(`Successfully sync ${scoringInDb.length} scoring data to database.`);
    // }

    const savedTournamentSession = await tx
      .insert(FortniteTournamentSessionTable)
      .values(parsedTournamentSessions)
      .returning({ id: FortniteTournamentSessionTable.id });

    console.log(
      `Successfully sync ${savedTournamentSession.length} tournament sessions to database.`
    );

    return true;
  });

  const message: string = `Successfully sync all ${region} tournaments to database`;

  return c.json({ message });
};

function formatTournamentPlatform(platforms: string[]): string[] {
  const plt: string[] = [];

  for (const p of platforms) {
    if (p.toLowerCase().includes('xbox')) {
      plt.push('xbox');
    }

    if (p.toLowerCase().includes('switch')) {
      plt.push('switch');
    }

    if (p.toLowerCase().includes('windows')) {
      plt.push('pc');
    }

    if (
      p.toLowerCase().includes('mobile') ||
      p.toLowerCase().includes('android') ||
      p.toLowerCase().includes('ios')
    ) {
      plt.push('mobile');
    }

    if (p.toLowerCase().startsWith('ps')) {
      plt.push('playstation');
    }
  }

  const uniquePlatformsJSON = new Set(plt.map((p) => JSON.stringify(p)));

  return Array.from(uniquePlatformsJSON).map((s) => JSON.parse(s));
}

// TODO: Enable in Future
// function formateScoringResponse(data: IRootScoringRuleSet[]) {
//   return data.map((sc) => {
//     const typeKey: { [id: string]: string } = {
//       ['PLACEMENT_STAT_INDEX']: 'Placements',
//       ['TEAM_ELIMS_STAT_INDEX']: 'Eliminations',
//     };
//     const points = sc.rewardTiers.map((r) => ({ value: r.keyValue, points: r.pointsEarned }));

//     return { type: typeKey[sc.trackedStat], rewards: points };
//   });
// }

// TODO: Enable in Future
// function formatPayoutResponse(data: IRootPayoutTable[]) {
//   const handleKey: Record<string, string> = {
//     ['game']: 'cosmetics',
//     ['floatingScore']: 'hype',
//     ['token']: 'qualify',
//     ['ecomm']: 'money',
//     ['persistentScore']: 'point',
//   };

//   return data.flatMap((prize) =>
//     prize.ranks.flatMap((rank) =>
//       rank.payouts.map((payout) => {
//         const normalizedRewardType = payout.rewardType.toLowerCase();

//         const value =
//           normalizedRewardType === 'game'
//             ? (payout.value.split(':')[1] ?? payout.value)
//             : payout.value;

//         return {
//           type: prize.scoringType,
//           threshold: tournamentPrizeType(prize.scoringType, rank.threshold),
//           quantity: payout.quantity,
//           rewardType: handleKey[normalizedRewardType],
//           value: value,
//         };
//       })
//     )
//   );
// }

function tournamentPrizeType(type: string, threshold: number): string {
  type = type.toLowerCase();

  if (type === 'percentile') return `Top ${threshold * 100}%`;
  else if (type === 'value') return `Earned ${threshold} Points`;

  return `Top #${threshold}`;
}

// TODO: Enable in Future
/** Parse the response coming from Epic Games to the format we want before storing in the database */
// function parsePayoutResponse(
//   data: Record<string, IRootPayoutTable[]>
// ): Omit<IParsedTournamentPayoutResponse, 'region'>[] {
//   return Object.entries(data).map(([eventId, eventRules]) => {
//     const flatPayouts: IParsedTournamentPayoutData[] = eventRules.flatMap((group) =>
//       group.ranks.flatMap((rank) =>
//         rank.payouts.map((payout) => ({
//           scoring_type: group.scoringType,
//           threshold: rank.threshold,
//           reward_type: payout.rewardType,
//           reward_mode: payout.rewardMode,
//           value: payout.value,
//           quantity: payout.quantity,
//         }))
//       )
//     );

//     return {
//       epic_payout_id: eventId,
//       payout_data: flatPayouts,
//     };
//   });
// }

// TODO: Enable in Future
/** Parse the response coming from Epic Games to the format we want before storing in the database */
// function parseScoringResponse(
//   data: Record<string, IRootScoringRuleSet[]>
// ): Omit<IParsedTournamentScoringResponse, 'region'>[] {
//   return Object.entries(data).map(([id, rulesArray]) => {
//     const flatRules: IParsedTournamentScoringRules[] = rulesArray.flatMap((rule) =>
//       rule.rewardTiers.map((tier) => ({
//         tracked_stat: rule.trackedStat,
//         key_value: tier.keyValue,
//         points_earned: tier.pointsEarned,
//       }))
//     );

//     return {
//       epic_score_id: id,
//       scoring_rules: flatRules,
//     };
//   });
// }

function parseTournamentConfig(rawData: TTournamentExtraDetails) {
  const keysToIgnore: string[] = [
    'conversion_config',
    // This key exists at the root, distinct from the nested ones
    'tournament_info',
    '_title',
    '_noIndex',
    '_activeDate',
    'lastModified',
    '_locale',
    '_templateName',
    '_suggestedPrefetch',
  ];

  return Object.entries(rawData).reduce((acc: ITournamentDisplayInfo[], [key, value]) => {
    if (
      keysToIgnore.includes(key) ||
      typeof value !== 'object' ||
      value === null ||
      !('tournament_info' in value) ||
      typeof value.tournament_info !== 'object' ||
      value.tournament_info === null
    ) {
      return acc; // Skip this entry
    }

    // 2. MAP: At this point, we have a valid tournament entry.
    // We cast it to our partial type for safe access.
    const info = value.tournament_info as ITournamentInfo;

    const cleanTournament: ITournamentDisplayInfo = {
      display_id: info.tournament_display_id.toLowerCase(),
      name: generateTournamentName(info.title_line_1, info.title_line_2, info.short_format_title),
      details_description: info.details_description,
      playlist_tile_image: info.playlist_tile_image,
    };

    // Add the clean object to our accumulator array
    acc.push(cleanTournament);

    return acc;
  }, []);
}

function searchTournamentByDisplayId(
  data: ITournamentDisplayInfo[],
  displayId: string
): ITournamentDisplayInfo {
  displayId = displayId.toLowerCase();

  const defaultResponse: ITournamentDisplayInfo = {
    display_id: displayId,
    name: null,
    details_description: null,
    playlist_tile_image: null,
  };

  return data.find((d) => d.display_id.toLowerCase() === displayId) || defaultResponse;
}

function generateTournamentName(
  title_line_1: string | null,
  title_line_2: string | null,
  short_format_title: string | null
): string | null {
  // Priority 1: Use short_format_title if it has a value
  if (short_format_title) {
    return short_format_title;
  }

  // Priority 2: Combine title_line_1 and title_line_2
  if (title_line_1 && title_line_2) {
    return `${title_line_1} ${title_line_2}`; // Uses a template literal to add a space
  }

  // Priority 3: Use title_line_1 if it's the only one
  if (title_line_1) {
    return title_line_1;
  }

  // Priority 4: Use title_line_2 if it's the only one
  if (title_line_2) {
    return title_line_2;
  }

  // Fallback: If all are null/empty, return an empty string
  return null;
}

function generateTournamentSessionName(id: string, index: number): string {
  const match = id.match(/Event(\d+)Round(\d+)/i);

  if (match === null) {
    return `Session ${index + 1}`;
  }

  // Must have the front comma if not it will get from the ID
  const [, event, round] = match;

  return `Session ${event} Round ${round}`;
}

function getTournamentStatus(startTime: Date, endTime: Date) {
  const now = new Date();

  if (now < new Date(startTime)) return 'upcoming';

  if (now > new Date(endTime)) return 'ended';

  return 'live';
}

function getNextSession(sessions: ITournamentSessionFE[]): ITournamentSessionFE | null {
  const upcomingSessions = sessions.filter((s) => s.status !== 'ended');

  if (upcomingSessions.length === 0) return null;

  const sortedSessions = upcomingSessions.sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return sortedSessions[0];
}

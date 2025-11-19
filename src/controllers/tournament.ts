import { getDrizzle } from '../lib';
import { TCFContext, TSupportedRegion, TTournamentExtraDetails, TTournamentStatus } from '../types';
import {
  IRootAccountLookup,
  IRootEpicGamesTournament,
  IRootEpicGamesTournamentWindowDetails,
  ITournamentSessionFE,
} from '../interfaces';
import { chunkArray, CustomException, getEGAccountAccessToken } from '../helpers';
import { TournamentSessionValidationSchema, TournamentValidationSchema } from '../validations';
import {
  EGAccountIdLookupEndpoint,
  EGTournamentInfoEndpoint,
  EGTournamentListingEndpoint,
  EGTournamentWindowEndpoint,
} from '../constants';
import { FortniteTournamentSessionTable, FortniteTournamentTable } from '../db/schema';
import { tournamentEventParser, tournamentInfoParser } from '../parsers';

export const getTournamentsV1 = async (c: TCFContext) => {
  const userRegion = c.req.query('region') || 'asia';

  const db = getDrizzle();
  const tournamentsInDb = await db.query.FortniteTournamentTable.findMany({
    where: ({ region }, { eq }) => eq(region, userRegion as TSupportedRegion),
    columns: {
      event_id: true,
      name: true,
      start_time: true,
      end_time: true,
      platforms: true,
    },
    with: {
      sessions: {
        columns: {
          session_id: true,
          event_id: true,
          name: true,
          start_time: true,
          end_time: true,
        },
      },
    },
  });
  const tournaments = tournamentsInDb.map((t) => {
    const { sessions, ...excludeSession } = t;

    const sessionWithStatus = sessions.map((s) => ({
      ...s,
      status: getTournamentStatus(s.start_time, s.end_time),
    }));
    const nextSession = getNextSession(sessionWithStatus);

    return {
      ...excludeSession,
      sessions: sessionWithStatus,
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
      session_id: true,
      name: true,
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
          created_at: false,
          updated_at: false,
        },
      },
    },
  });

  if (!tournamentDetailsInDb) {
    throw new CustomException('No tournaments matching with that ID', 404);
  }

  const sessionWithStatus: ITournamentSessionFE[] = tournamentDetailsInDb.sessions.map((s) => ({
    ...s,
    status: getTournamentStatus(s.start_time, s.end_time),
  }));
  const nextSession = getNextSession(sessionWithStatus);

  const { sessions, ...excludeSession } = tournamentDetailsInDb;
  const response = {
    ...excludeSession,
    sessions: sessionWithStatus,
    next_session: nextSession,
    current_status: nextSession !== null ? nextSession.status : 'ended',
  };

  return c.json(response);
};

export const getTournamentWindowDetailsV1 = async (c: TCFContext) => {
  const body = TournamentSessionValidationSchema.parse(await c.req.json());

  const accountId = process.env.EPIC_GAMES_ACCOUNT_ID;
  const { access_token } = await getEGAccountAccessToken();

  const db = getDrizzle();
  const sessionInDb = await db.query.FortniteTournamentSessionTable.findFirst({
    where: ({ session_id }, { eq }) => eq(session_id, body.window_id),
    columns: {
      session_id: true,
      event_id: true,
      name: true,
      start_time: true,
      end_time: true,
    },
  });

  if (!sessionInDb) {
    throw new CustomException(
      'The session you are looking for does not exists. Please try again later.',
      404
    );
  }

  // TODO: Enforce interface type
  const sessionDetails: any = {
    ...sessionInDb,
    status: getTournamentStatus(sessionInDb.start_time, sessionInDb.end_time),
    leaderboard: [],
  };

  if (sessionDetails.status !== 'ended') {
    return c.json(sessionDetails);
  }

  const leaderboardParams = new URLSearchParams();
  const endpoint: string = `Fortnite/${body.event_id}/${body.window_id}/${accountId}?${leaderboardParams.toString()}`;
  const windowDetailUrl: string = `${EGTournamentWindowEndpoint}/${endpoint}`;
  const windowDetailsReponse = await fetch(windowDetailUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!windowDetailsReponse.ok) {
    throw new CustomException(
      'There was an error with the Tournament Window details. Please try again later.',
      500
    );
  }

  const windowDetailsJsonReponse =
    (await windowDetailsReponse.json()) as IRootEpicGamesTournamentWindowDetails;

  const accountIds = windowDetailsJsonReponse.entries.flatMap((e) => e.teamAccountIds);
  const foundAccountIds = await fetchAccountsInBatches(accountIds, access_token);
  const userIdNameMap: Record<string, string> = foundAccountIds.reduce(
    (acc, user) => {
      acc[user.id] = user.display_name;
      return acc;
    },
    {} as Record<string, string>
  );

  const leaderboard = windowDetailsJsonReponse.entries.map((e) => {
    const sessionHistory = e.sessionHistory.map((s) => ({
      placements: s.trackedStats.PLACEMENT_STAT_INDEX,
      eliminations: s.trackedStats.TEAM_ELIMS_STAT_INDEX,
    }));
    let totalPlacementPoints: number = 0;
    let totalEliminationPoints: number = 0;
    const pointKeys = Object.keys(e.pointBreakdown);

    for (const key of pointKeys) {
      if (key.startsWith('PLACEMENT_STAT')) {
        const pointsEarned = e.pointBreakdown[key as any].pointsEarned;

        totalPlacementPoints += pointsEarned;
      }

      if (key.startsWith('TEAM_ELIMS_STAT')) {
        const pointsEarned = e.pointBreakdown[key as any].pointsEarned;

        totalEliminationPoints += pointsEarned;
      }
    }

    const teamDetails = e.teamAccountIds.map((id) => ({ id, display_name: userIdNameMap[id] }));

    return {
      rank: e.rank,
      players: teamDetails,
      total_points_earned: e.pointsEarned,
      points_breakdown: {
        placements: totalPlacementPoints,
        eliminations: totalEliminationPoints,
      },
      session_history: sessionHistory,
    };
  });

  sessionDetails.leaderboard = leaderboard;

  return c.json(sessionDetails);
};

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
  const tournamentDetails = tournamentInfoParser(tournamentInfoJsonRes);
  const parsedTournamentEvents = await tournamentEventParser(
    events,
    tournamentDetails,
    region as TSupportedRegion
  );

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
      .values(parsedTournamentEvents.events)
      .returning({ id: FortniteTournamentTable.id });

    console.log(`Successfully sync ${savedTournament.length} tournament to database.`);

    const savedTournamentSession = await tx
      .insert(FortniteTournamentSessionTable)
      .values(parsedTournamentEvents.sessions)
      .returning({ id: FortniteTournamentSessionTable.id });

    console.log(
      `Successfully sync ${savedTournamentSession.length} tournament sessions to database.`
    );

    return true;
  });

  const message: string = `Successfully sync all ${region} tournaments to database`;

  return c.json({ message });
};

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

function getTournamentStatus(startTime: Date, endTime: Date): TTournamentStatus {
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

async function fetchAccountsInBatches(accountIds: string[], access_token: string) {
  const chunks = chunkArray(accountIds, 100);
  const allResults: { id: string; display_name: string }[] = [];

  for (const chunk of chunks) {
    const params = new URLSearchParams();
    chunk.forEach((id) => params.append('accountId', id));

    const url = `${EGAccountIdLookupEndpoint}?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const data = (await response.json()) as IRootAccountLookup[];
    const mappedData = data.map((d) => ({ id: d.id, display_name: d.displayName }));

    allResults.push(...mappedData);

    // optional delay to avoid rate limiting
    await new Promise((res) => setTimeout(res, 300));
  }

  console.log('Available: ', allResults.length);

  return allResults;
}

import { getDrizzle } from '../lib';
import { TCFContext } from '../types';

import rawTournament from '../data/seed/tournaments-past.json';
import { IRootEpicGamesTournament, IRootLeaderboardDefs } from '../interfaces';
import { CustomException } from '../helpers';

export const getTournamentsV1 = (c: TCFContext) => { };

export const getTournamentDetailsV1 = (c: TCFContext) => { };

export const getTournamentWindowDetailsV1 = (c: TCFContext) => { };

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

  // TODO: Enable this once validation from zod
  // const { region } = await c.req.json();

  const data = rawTournament as IRootEpicGamesTournament;

  const {
    events = [],
    leaderboardDefs = [],
    scoringRuleSets = {},
    payoutTables = {}
  } = data;

  if (events.length === 0) {
    throw new CustomException(
      'No tournaments available to parse. Please try again later.',
      400
    );
  };

  // Create a fast lookup map for leaderboard definitions
  const leaderboardDefsMap = new Map<string, IRootLeaderboardDefs>(
    leaderboardDefs.map(def => [def.leaderboardDefId, def])
  );

  // TODO: Define interface
  const formattedEvents: any[] = [];

  for (const ev of events) {
    const displayId = ev.displayDataId

    // TODO: Add name, description and image
    const formattedPlatforms: string[] = formatTournamentPlatform(ev.platforms);
    const eventResponse: any = {
      event_id: ev.eventId,
      start_time: ev.beginTime,
      end_time: ev.endTime,
      // TODO: Change this get from request body
      region: 'asia',
      platforms: formattedPlatforms,
      session_windows: []
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
        payout: []
      };

      // TODO: Break this into seperate function because either way it wont be undefined
      // Find the main leaderboard
      let scoreLocation = window.scoreLocations.find(sl => sl.isMainWindowLeaderboard);
      // If no main leaderboard then assign any available leaderboard
      if (!scoreLocation && window.scoreLocations.length > 0) {
        scoreLocation = window.scoreLocations[0];
      };

      if (scoreLocation) {
        const leaderboardDef = leaderboardDefsMap.get(scoreLocation.leaderboardDefId);

        if (leaderboardDef) {
          const scoringId = leaderboardDef.scoringRuleSetId;

          if (scoringId) {
            windowResponse.scoring = scoringRuleSets[scoringId] ?? [];
          };

          const payoutIdFormat = leaderboardDef.payoutsConfig?.payoutTableIdFormat;

          if (payoutIdFormat) {
            const resolvedPayoutId = payoutIdFormat
              .replace("${eventId}", ev.eventId ?? '')
              .replace("${windowId}", window.eventWindowId ?? '');

            windowResponse.payout = payoutTables[resolvedPayoutId] ?? null;
          };
        };
      };
      eventResponse.session_windows.push(windowResponse);
    };
    formattedEvents.push(eventResponse);
  };

  return c.json(formattedEvents);
};

function formatTournamentPlatform(platforms: string[]) {
  // TODO: Format Platforms
  return platforms;
};



// if (events.length === 0) {
//     console.error("Error: 'events' key is missing or empty in 'tournaments-past.json'.");
//     return [];
//   }

//   // Create a fast lookup map for leaderboard definitions
//   const leaderboardDefsMap = new Map<string, LeaderboardDef>(
//     leaderboardDefs.map(def => [def.leaderboardDefId, def])
//   );

//   const formattedEvents: EventOut[] = [];

//   for (const event of events) {
//     try {

//       // --- MERGE LOGIC ---
//       // Get the display ID from the event (e.g., "s38_blitzmobile")
//       // We assume this 'tournament_display_id' field exists on the event object.
//       const displayId = event.tournament_display_id;
//       // Look up the details from the map. Default to null if not found.
//       const details = displayId ? (detailsMap.get(displayId) ?? null) : null;
//       // -----------------

//       const newEvent: EventOut = {
//         eventId: event.eventId,
//         beginTime: event.beginTime,
//         endTime: event.endTime,
//         regions: event.regions ?? [],
//         platforms: event.platforms ?? [],
//         details: details, // Add the merged details here
//         eventWindows: []
//       };

//       for (const window of event.eventWindows ?? []) {
//         const newWindow: EventWindowOut = {
//           eventWindowId: window.eventWindowId,
//           countdownBeginTime: window.countdownBeginTime,
//           beginTime: window.beginTime,
//           endTime: window.endTime,
//           round: window.round,
//           scoring: null,
//           payout: null
//         };

//         // Find the main leaderboard
//         let scoreLocation = window.scoreLocations?.find(sl => sl.isMainWindowLeaderboard);
//         if (!scoreLocation && (window.scoreLocations?.length ?? 0) > 0) {
//           scoreLocation = window.scoreLocations![0];
//         }

//         if (scoreLocation) {
//           const leaderboardDef = leaderboardDefsMap.get(scoreLocation.leaderboardDefId);

//           if (leaderboardDef) {
//             // Get SCORING data
//             const scoringId = leaderboardDef.scoringRuleSetId;
//             if (scoringId) {
//               newWindow.scoring = scoringRuleSets[scoringId] ?? null;
//             }

//             // Get PAYOUT data
//             const payoutIdFormat = leaderboardDef.payoutsConfig?.payoutTableIdFormat;
//             if (payoutIdFormat) {
//               const resolvedPayoutId = payoutIdFormat
//                 .replace("${eventId}", event.eventId ?? '')
//                 .replace("${windowId}", window.eventWindowId ?? '');
//               newWindow.payout = payoutTables[resolvedPayoutId] ?? null;
//             }
//           }
//         }
//         newEvent.eventWindows.push(newWindow);
//       }
//       formattedEvents.push(newEvent);

//     } catch (e) {
//       const err = e as Error;
//       console.error(`Error processing event ${event.eventId}: ${err.message}`);
//     }

//     console.log(formattedEvents);
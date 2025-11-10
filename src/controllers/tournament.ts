import { getDrizzle } from '../lib';
import { TCFContext } from '../types';

import rawTournament from '../data/seed/tournaments-past.json';
import { IRootEpicGamesTournament } from '../interfaces';

export const getTournamentsV1 = (c: TCFContext) => { };

export const getTournamentDetailsV1 = (c: TCFContext) => { };

export const getTournamentWindowDetailsV1 = (c: TCFContext) => { };

export const syncTournamentToDatabaseV1 = async (c: TCFContext) => {
    const { region } = await c.req.json();

    const data = rawTournament as IRootEpicGamesTournament;

    const {
        events = [],
        leaderboardDefs = [],
        scoringRuleSets = {},
        payoutTables = {}
    } = data;

    if (events.length === 0) {
    console.error("Error: 'events' key is missing or empty in 'tournaments-past.json'.");
    return [];
  }

  // Create a fast lookup map for leaderboard definitions
  const leaderboardDefsMap = new Map<string, LeaderboardDef>(
    leaderboardDefs.map(def => [def.leaderboardDefId, def])
  );

  const formattedEvents: EventOut[] = [];
  
  for (const event of events) {
    try {
      
      // --- MERGE LOGIC ---
      // Get the display ID from the event (e.g., "s38_blitzmobile")
      // We assume this 'tournament_display_id' field exists on the event object.
      const displayId = event.tournament_display_id;
      // Look up the details from the map. Default to null if not found.
      const details = displayId ? (detailsMap.get(displayId) ?? null) : null;
      // -----------------

      const newEvent: EventOut = {
        eventId: event.eventId,
        beginTime: event.beginTime,
        endTime: event.endTime,
        regions: event.regions ?? [],
        platforms: event.platforms ?? [],
        details: details, // Add the merged details here
        eventWindows: []
      };

      for (const window of event.eventWindows ?? []) {
        const newWindow: EventWindowOut = {
          eventWindowId: window.eventWindowId,
          countdownBeginTime: window.countdownBeginTime,
          beginTime: window.beginTime,
          endTime: window.endTime,
          round: window.round,
          scoring: null,
          payout: null
        };

        // Find the main leaderboard
        let scoreLocation = window.scoreLocations?.find(sl => sl.isMainWindowLeaderboard);
        if (!scoreLocation && (window.scoreLocations?.length ?? 0) > 0) {
          scoreLocation = window.scoreLocations![0];
        }

        if (scoreLocation) {
          const leaderboardDef = leaderboardDefsMap.get(scoreLocation.leaderboardDefId);
          
          if (leaderboardDef) {
            // Get SCORING data
            const scoringId = leaderboardDef.scoringRuleSetId;
            if (scoringId) {
              newWindow.scoring = scoringRuleSets[scoringId] ?? null;
            }
            
            // Get PAYOUT data
            const payoutIdFormat = leaderboardDef.payoutsConfig?.payoutTableIdFormat;
            if (payoutIdFormat) {
              const resolvedPayoutId = payoutIdFormat
                .replace("${eventId}", event.eventId ?? '')
                .replace("${windowId}", window.eventWindowId ?? '');
              newWindow.payout = payoutTables[resolvedPayoutId] ?? null;
            }
          }
        }
        newEvent.eventWindows.push(newWindow);
      }
      formattedEvents.push(newEvent);

    } catch (e) {
      const err = e as Error;
      console.error(`Error processing event ${event.eventId}: ${err.message}`);
    }

    console.log(formattedEvents);
  }
};
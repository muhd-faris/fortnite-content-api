import { CustomException } from '../helpers';
import {
  IRootEvent,
  ITournamentDisplayInfo,
  ITournamentEvent,
  ITournamentEventSession,
  ITournamentInfo,
} from '../interfaces';
import { TSupportedRegion, TTournamentExtraDetails } from '../types';

export const tournamentEventParser = async (
  data: IRootEvent[],
  tournamentInfo: ITournamentDisplayInfo[],
  region: TSupportedRegion
) => {
  if (data.length < 1) throw new CustomException('No tournament events available to parse', 404);

  /** Assign to this variable after completing parsing */
  const tournamentEvents: ITournamentEvent[] = [];

  for (const event of data) {
    const details = searchTournamentByDisplayId(tournamentInfo, event.displayDataId);
    const platforms = formatTournamentPlatform(event.platforms);

    const eventResponse: ITournamentEvent = {
      event_id: event.eventId,
      ...details,
      minimum_account_level: event.metadata?.minimumAccountLevel ?? null,
      start_time: new Date(event.beginTime),
      end_time: new Date(event.endTime),
      region,
      platforms,
      sessions: [],
    };

    for (const window of event.eventWindows) {
      let windowResponse: ITournamentEventSession = {
        session_id: window.eventWindowId,
        event_id: eventResponse.event_id,
        name: '',
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

      eventResponse.sessions.push(windowResponse);
    }

    tournamentEvents.push(eventResponse);
  }

  const sortedTournaments = tournamentEvents.map((ev) => {
    const sessionIds = ev.sessions.map((s) => s.session_id);
    // Finalise tournament name
    ev.name = generateTournamentFinalName(ev.name, sessionIds);
    // Generate Session Name
    ev.sessions = ev.sessions
      .sort((a, b) => a.start_time.getTime() - b.end_time.getTime())
      .map((s, index) => ({
        ...s,
        name: generateSessionName(s.session_id, index).name,
      }));

    return ev;
  });

  const finalTournamentEventData = sortedTournaments.map((t) => {
    const { sessions, ...excludeSession } = t;

    return excludeSession;
  });
  const finalSessionData = sortedTournaments.flatMap((t) => t.sessions);

  return {
    events: finalTournamentEventData,
    sessions: finalSessionData,
  };
};

// Internal Functions
function parseTournamentConfig(data: TTournamentExtraDetails) {
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

  return Object.entries(data).reduce((acc: ITournamentDisplayInfo[], [key, value]) => {
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

/** Format Tournament Name first during parsing */
function generateTournamentName(
  titleLine1: string | null,
  titleLine2: string | null,
  shortFormatTitle: string | null
): string | null {
  if (shortFormatTitle) return shortFormatTitle;

  if (titleLine1 && titleLine2) return `${titleLine1} ${titleLine2}`;

  if (titleLine1) return titleLine1;

  if (titleLine2) return titleLine2;

  return null;
}

/** Finalise Tournament Name to include Group number if available */
function generateTournamentFinalName(name: string | null, sessionIds: string[]): string | null {
  if (name === null) return null;

  const ids = sessionIds
    .map((id) => {
      const regex = /Group(\d+)/i;
      const match = id.match(regex);

      if (match) return match[1];

      return null;
    })
    .filter((id) => id !== null);
  const group = ids.length > 0 ? `Group ${ids[0]}` : null;

  return `${name} ${group ?? ''}`.trim();
}

function generateSessionName(id: string, index: number): { name: string; group: string | null } {
  const regex = /Event(\d+)(Group(\d+))?Round(\d+)/i;

  const match = id.match(regex);

  let name: string;
  let groupString: string | null = null;

  if (!match) {
    // If the pattern doesn't match, use the fallback name
    name = `Session ${index + 1}`;
  } else {
    const sessionNumber = match[1];
    const groupDigits = match[3]; // undefined if no group exists
    const roundNumber = match[4];

    // Combine Session and Round into the Name
    name = `Session ${sessionNumber} Round ${roundNumber}`;

    // Conditionally format the Group string
    groupString = groupDigits ? `Group ${groupDigits}` : null;
  }

  return {
    name: name,
    group: groupString,
  };
}

function getGroupNumberForIds(windowIds: string[]): string | null {
  const ids = windowIds
    .map((id) => {
      const regex = /Group(\d+)/i;

      const match = id.match(regex);

      if (match) return match[1];
      return null;
    })
    .filter((id) => id !== null);

  return ids.length > 0 ? `Group ${ids[0]}` : null;
}

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

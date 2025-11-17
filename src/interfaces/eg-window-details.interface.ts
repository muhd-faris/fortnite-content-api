export interface IRootEpicGamesTournamentWindowDetails {
  gameId: string;
  eventId: string;
  eventWindowId: string;
  page: number;
  totalPages: number;
  updatedTime: string;
  entries: IEntry[];
  // TODO: Define interface type
  liveSessions: any;
}

interface IEntry {
  gameId: string;
  eventId: string;
  eventWindowId: string;
  teamAccountIds: string[];
  pointsEarned: number;
  score: number;
  rank: number;
  percentile: number;
  teamId: string;
  pointBreakdown: Record<string, IEntryPlacementBreakdown>;
  sessionHistory: ISessionHistory[];
  playerFlagTokens: Record<string, string>;
  unscoredSessions: string[];
}

interface IEntryPlacementBreakdown {
  timesAchieved: number;
  pointsEarned: number;
}

interface ISessionHistory {
  sessionId: string;
  endTime: Date;
  trackedStats: Record<string, number>;
}

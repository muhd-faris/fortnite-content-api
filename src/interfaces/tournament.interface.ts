import { TSupportedRegion, TTournamentStatus } from '../types';
import { ITournamentDisplayInfo } from './';

export interface ITournamentEvent extends ITournamentDisplayInfo {
  event_id: string;
  minimum_account_level: number | null;
  start_time: Date;
  end_time: Date;
  region: TSupportedRegion;
  platforms: string[];
  sessions: ITournamentEventSession[];
}

export interface ITournamentEventSession {
  session_id: string;
  event_id: string;
  name: string;
  start_time: Date;
  end_time: Date;
  epic_score_id: string | null;
  epic_payout_id: string | null;
}

export interface ITournamentSessionFE {
  session_id: string;
  name: string;
  status: TTournamentStatus;
  start_time: Date;
  end_time: Date;
}

export interface ISessionDetailsFE extends ITournamentSessionFE {
  leaderboard: ILeaderboardFE[];
}

export interface ILeaderboardFE {
  rank: number;
  players: ILeaderboardPlayerFE[];
  total_points_earned: number;
  points_breakdown: ILeaderboardPointBreakdown;
  game_history: ILeaderboardGameHistory[];
}

interface ILeaderboardPlayerFE {
  id: string;
  display_name: string;
}

interface ILeaderboardPointBreakdown {
  placements: number;
  eliminations: number;
}

interface ILeaderboardGameHistory {
  placements: number;
  eliminations: number;
}

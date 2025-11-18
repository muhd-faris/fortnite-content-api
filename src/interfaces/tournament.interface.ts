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
  status: TTournamentStatus;
  start_time: Date;
  end_time: Date;
  session_id: string;
  session_name: string;
}

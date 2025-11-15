import { TSupportedRegion } from '../types';
import { ITournamentDisplayInfo } from './';

export interface ITournamentEvent extends ITournamentDisplayInfo {
  event_id: string;
  start_time: Date;
  end_time: Date;
  region: TSupportedRegion;
  platforms: string[];
}

export interface ITournamentEventSession {
  window_id: string;
  event_id: string;
  countdown_starts_at: Date;
  start_time: Date;
  end_time: Date;
  epic_score_id: string | null;
  epic_payout_id: string | null;
}

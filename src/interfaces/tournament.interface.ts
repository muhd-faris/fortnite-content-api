import { ITournamentDisplayInfo } from './';
// TODO: Remove Interface
export interface ITournamentPlatform {
  display_name: string;
  value: string;
}

export interface ITournamentEvent extends ITournamentDisplayInfo {
  event_id: string;
  start_time: string;
  end_time: string;
  region: string;
  platforms: any[]; // TODO: Change to string[]
  session_windows: ITournamentEventSession[];
}

export interface ITournamentEventSession {
  window_id: string;
  countdown_starts_at: string;
  start_time: string;
  end_time: string;
  scoring_id: string | null;
  payout_id: string | null;
  // TODO: Remove legacy fields
  scoring: any[];
  payout: any[];
}

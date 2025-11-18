export interface IDBSessionDetails {
  id: string;
  window_id: string;
  event_id: string;
  countdown_starts_at: Date;
  start_time: Date;
  end_time: Date;
  epic_score_id: string | null;
  epic_payout_id: string | null;
  created_at: Date;
  updated_at: Date;
}

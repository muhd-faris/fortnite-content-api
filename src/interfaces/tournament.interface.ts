export interface ITournamentListingFE {
    event_id: string;
    start_time: string;
    end_time: string;
    region: string;
    platforms: ITournamentPlatform[];
    session_windows: ISessionWindow[];
}

export interface ITournamentPlatform {
    display_name: string;
    value: string;
}

interface ISessionWindow {
    window_id: string;
    countdown_starts_at: string;
    start_time: string;
    end_time: string;
    scoring: any[];
    payout: any[];
}
export interface ISeasonListFE {
    season_code: number;
    chapter: number;
    season_in_chapter: number;
    display_name: string;
    start_date: Date;
    end_date: Date;
    season_duration: string;
    season_completed: boolean;
};

export interface ISeasonByChapterFE {
    chapter: number;
    history: ISeasonListFE[];
};
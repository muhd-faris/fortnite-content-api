export interface IRootTrackListing {
    status: number;
    data: ITrackListingData[];
};

interface ITrackListingData {
    id: string;
    devName: string;
    title: string;
    artist: string;
    releaseYear: number;
    bpm: number;
    duration: number;
    difficulty: IDifficulty;
    albumArt: string;
    added: string;
    album?: string;
    genres?: string[];
};

interface IDifficulty {
    vocals: number;
    guitar: number;
    bass: number;
    plasticBass: number;
    drums: number;
    plasticDrums: number;
};
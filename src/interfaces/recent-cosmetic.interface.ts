import {
    IIntroduction,
    ISeries,
    ISet,
    IType,
    IVariant
} from './';

export interface IRootRecentCosmetic {
    status: number;
    data: IRecentCosmeticData;
};

interface IRecentCosmeticData {
    date: string;
    build: string;
    previousBuild: string;
    hashes: IHashes;
    lastAdditions: ILastAdditions;
    items: IItems;
};

interface IItems {
    br: IBattleRoyaleCosmetic[];
    tracks: ITrack[];
    instruments: IInstrument[];
    cars: ICar[];
    lego: ILegoItem[];
};

interface ILegoItem {
    id: string;
    cosmeticId: string;
    images: ILegoImage;
    added: string;
};

interface ICar {
    id: string;
    vehicleId: string;
    name: string;
    description: string;
    type: IType;
    rarity: IType;
    images: ILegoImage;
    added: string;
    series?: ISeries;
};

interface IInstrument {
    id: string;
    name: string;
    description: string;
    type: IType;
    rarity: IType;
    images: ILegoImage;
    added: string;
    series?: IInstrumentSeries;
};

interface IInstrumentSeries {
    value: string;
    image: string;
    colors: string[];
    backendValue: string;
};

interface ITrack {
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
};

interface IDifficulty {
    vocals: number;
    guitar: number;
    bass: number;
    plasticBass: number;
    drums: number;
    plasticDrums: number;
};

interface IBattleRoyaleCosmetic {
    id: string;
    name: string;
    description: string;
    type: IType;
    rarity: IType;
    set?: ISet;
    introduction?: IIntroduction;
    images: IImages;
    dynamicPakId?: string;
    added: string;
    variants?: IVariant[];
    series?: ISeries;
    showcaseVideo?: string;
    metaTags?: string[];
};

interface IImages {
    smallIcon: string;
    icon?: string;
    featured?: string;
    lego?: ILegoImage;
    other?: IOtherImage;
};

interface IOtherImage {
    background?: string;
    decal?: string;
};

interface ILegoImage {
    small: string;
    large: string;
};

interface ILastAdditions {
    all: string;
    br: string;
    tracks: string;
    instruments: string;
    cars: string;
    lego: string;
    legoKits: string;
    beans: string;
};

interface IHashes {
    all: string;
    br: string;
    tracks: string;
    instruments: string;
    cars: string;
    lego: string;
};
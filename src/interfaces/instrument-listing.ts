import { ISeries, IType } from './';

export interface IRootInstrumentListing {
    status: number;
    data: IInstrumentListingData[];
};

interface IInstrumentListingData {
    id: string;
    name: string;
    description: string;
    type: IType;
    rarity: IType;
    images: IImages;
    added: string;
    series?: ISeries;
};

interface IImages {
    small: string;
    large: string;
};
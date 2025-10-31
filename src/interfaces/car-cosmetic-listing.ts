import { ISeries, IType } from './';

export interface IRootCarCosmeticListing {
    status: number;
    data: ICarCosmeticListingData[];
};

interface ICarCosmeticListingData {
    id: string;
    vehicleId: string;
    name: string;
    description: string;
    type: IType;
    rarity: IType;
    images?: IImages;
    added: string;
    series?: ISeries;
};

interface IImages {
    small?: string;
    large?: string;
}
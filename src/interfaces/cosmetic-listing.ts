export interface IRootCosmeticListing {
    status: number;
    data: ICosmeticListingData[];
};

interface ICosmeticListingData {
    id: string;
    name: string;
    description: string;
    type: IType;
    rarity: IType;
    set?: ISet;
    images: IImages;
    added: string;
    introduction?: IIntroduction;
    variants?: IVariant[];
    series?: ISeries;
    showcaseVideo?: string;
    unlockRequirements?: string;
    metaTags?: string[];
    builtInEmoteIds?: string[];
};

export interface ISeries {
    value: string;
    colors: string[];
    backendValue: string;
    image?: string;
};

export interface IVariant {
    channel: string;
    type: string;
    options: IVariantOption[];
};

interface IVariantOption {
    tag: string;
    name: string;
    image: string;
    unlockRequirements?: string;
};

export interface IIntroduction {
    chapter: string;
    season: string;
    text: string;
    backendValue: number;
};

interface IImages {
    smallIcon: string;
    icon?: string;
    featured?: string;
    lego?: ILego;
    bean?: ILego;
    other?: IImagesOther;
};

interface IImagesOther {
    background?: string;
    coverart?: string;
    decal?: string;
};

interface ILego {
    small: string;
    large: string;
};

export interface ISet {
    value: string;
    text: string;
    backendValue: string;
};

export interface IType {
    value: string;
    displayValue: string;
    backendValue: string;
};
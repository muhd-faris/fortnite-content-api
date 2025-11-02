import {
    IBRImages,
    IIntroduction,
    ISeries,
    ISet,
    IType,
    IVariant
} from './';

interface IFECosmeticType {
    id: string;
    name: string;
};

export interface IFECosmeticListing {
    id: string;
    name: string;
    item_type: IFECosmeticType;
    card_bg_color: string;
    overlay_bg_color: string;
    transparent_image: string;
};

export interface ICosmeticDetailsData {
    id: string;
    name: string;
    description: string;
    type: IType;
    rarity: IType;
    images: IBRImages;
    gameplayTags?: string[];
    path: string;
    added: string;
    set?: ISet;
    series?: ISeries;
    introduction?: IIntroduction;
    metaTags?: string[];
    shopHistory?: string[];
    showcaseVideo?: string;
    variants?: IVariant[];
    itemPreviewHeroPath?: string;
    dynamicPakId?: string;
    customExclusiveCallout?: string;
    unlockRequirements?: string;
    displayAssetPath?: string;
    searchTags?: string[];
    builtInEmoteIds?: string[];
    definitionPath?: string;
};
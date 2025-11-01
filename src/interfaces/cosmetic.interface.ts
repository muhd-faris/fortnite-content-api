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
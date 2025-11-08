export interface IRootSeasonPasses {
    _title: string;
    _noIndex: boolean;
    _activeDate: string;
    lastModified: string;
    _locale: string;
    _templateName: string;
    battlepassdata: IPassData;
    figmentpassdata: IPassData;
    legopassdata: IPassData;
    musicpassdata: IPassData;
};

export interface IPassData {
    purchaseConfirmDescription: string;
    purchaseBackgroundURL: string;
    _title: string;
    landingPageDisclaimer: string;
    _noIndex: boolean;
    levelPurchaseDisclaimer: string;
    purchaseDescription: string;
    seasonEndDateTime: string;
    seasonEndDateText: string;
    purchaseConfirmBackgroundURL: string;
    purchaseDisclaimer: string;
    _activeDate: string;
};
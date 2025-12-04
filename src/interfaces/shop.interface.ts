export interface IRootBestSellerShop {
  bestsellers_list: IBestSellerData;
}

interface IBestSellerData {
  expiry_date: string;
  offer_list: string[];
}

// Item Shop Interface
export interface IRootShop {
  status: number;
  data: IShopData;
}

interface IShopData {
  hash: string;
  date: string;
  vbuckIcon: string;
  entries: IShopEntry[];
}

export interface IShopEntry {
  regularPrice: number;
  finalPrice: number;
  devName: string;
  offerId: string;
  inDate: string;
  outDate: string;
  offerTag?: IOfferTag;
  giftable: boolean;
  refundable: boolean;
  sortPriority: number;
  layoutId: string;
  layout: ILayout;
  tileSize: string;
  newDisplayAssetPath: string;
  tracks?: ITrack[];
  colors?: IColors;
  newDisplayAsset?: INewDisplayAsset;
  brItems?: IBRItem[];
  bundle?: IBundle;
  displayAssetPath?: string;
  cars?: ICar[];
  banner?: IBanner;
  instruments?: IInstrument[];
  tileBackgroundMaterial?: string;
}

interface IInstrument {
  id: string;
  name: string;
  description: string;
  type: IType;
  rarity: IType;
  images: ILego;
  added: string;
  series?: ISeries;
}

interface ISeries {
  value: string;
  colors: string[];
  backendValue: string;
  image?: string;
}

export interface IBanner {
  value: string;
  intensity: string;
  backendValue: string;
}

interface ICar {
  id: string;
  vehicleId: string;
  name: string;
  description: string;
  type: IType;
  rarity: IType;
  images: ILego;
  series?: ISeries;
  added: string;
}

interface IBundle {
  name: string;
  info: string;
  image: string;
}

interface IBRItem {
  id: string;
  name: string;
  description: string;
  type: IType;
  rarity: IType;
  introduction?: IIntroduction;
  images: IImages;
  showcaseVideo?: string;
  dynamicPakId?: string;
  added: string;
  set?: ISet;
  series?: ISeries;
  metaTags?: string[];
  variants?: IVariant[];
  searchTags?: string[];
  customExclusiveCallout?: string;
  builtInEmoteIds?: string[];
}

interface IVariant {
  channel: string;
  type: string;
  options: IOption[];
}

interface IOption {
  tag: string;
  name: string;
  image: string;
}

interface ISet {
  value: string;
  text: string;
  backendValue: string;
}

interface IImages {
  smallIcon: string;
  icon?: string;
  featured?: string;
  lego?: ILego;
  other?: IOther;
  bean?: ILego;
}

interface IOther {
  background?: string;
  decal?: string;
}

interface ILego {
  small: string;
  large: string;
}

interface IIntroduction {
  chapter: string;
  season: string;
  text: string;
  backendValue: number;
}

interface IType {
  value: string;
  displayValue: string;
  backendValue: string;
}

export interface INewDisplayAsset {
  id: string;
  cosmeticId?: string;
  materialInstances: any[];
  renderImages: IRenderImage[];
}

interface IRenderImage {
  productTag: string;
  fileName: string;
  image: string;
}

interface IColors {
  color1: string;
  color2?: string;
  color3: string;
  textBackgroundColor?: string;
}

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
  genres?: string[];
  album?: string;
}

interface IDifficulty {
  vocals: number;
  guitar: number;
  bass: number;
  plasticBass: number;
  drums: number;
  plasticDrums: number;
}

interface ILayout {
  id: string;
  name: string;
  index: number;
  rank: number;
  showIneligibleOffers: string;
  useWidePreview: boolean;
  displayType: string;
  category?: string;
  textureMetadata?: ITextureMetadatum[];
  stringMetadata?: ITextureMetadatum[];
  textMetadata?: ITextureMetadatum[];
}

interface ITextureMetadatum {
  key: string;
  value: string;
}

export interface IOfferTag {
  id: string;
  text: string;
}

// Shop Frontend Interface
export interface IGrantedFE {
  id: string;
  type: string;
  name: string;
  description: string | null;
  series: string | null;
  /** @deprecated - Fortnite no longer uses this */
  rarity: IRarityFE | null;
  image_without_bg: string | null;
  lego_image_without_bg: string | null;
  fallguys_image_without_bg: string | null;
}

interface IRarityFE {
  name: string;
  color: string;
}

export interface IShopImage {
  game_mode: string;
  image_without_bg: string;
}

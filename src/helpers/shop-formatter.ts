import { GetBrItemSeriesDetails, GetBrItemTypeDetails } from '../constants';
import {
  IBanner,
  IGrantedFE,
  INewDisplayAsset,
  IRootShop,
  IShopEntry,
  IOfferTag,
  IShopImage,
} from '../interfaces';
import { CustomException } from './app-error';
import { uniqueStringArray } from './utilities';

export const ItemShopFormatter = (data: IRootShop) => {
  if (data.status !== 200) {
    throw new CustomException('', 500);
  }

  return data.data.entries
    .map((s) => {
      const images = getShopCosmeticImages(s.newDisplayAsset);
      const price = {
        normal_price: s.regularPrice,
        final_price: s.finalPrice,
        item_on_offer: s.regularPrice !== s.finalPrice,
      };
      const section = {
        id: s.layout.id,
        name: s.layout.name,
      };
      const colorConfig = {
        card_bg_color: `linear-gradient(#${s.colors?.color1 || '81858d'}, #${s.colors?.color2 || '52555a'}, #052623)`,
        text_bg_color: `linear-gradient(0deg, #${s.colors?.textBackgroundColor || '000000'} 0%, rgba(0, 0, 0, 0) 100%)`,
      };
      const availability = {
        starts_from: s.inDate,
        ends_at: s.outDate,
      };
      const supportedModes = uniqueStringArray(images.map((img) => img.game_mode));

      const grantedItems: IGrantedFE[] = getShopGrantedItems(s);
      const foundItem = grantedItems[0];
      const mainImage =
        images?.[0]?.image_without_bg ?? grantedItems?.[0]?.image_without_bg ?? null;

      return {
        offer_id: s.offerId,
        main_image: mainImage,
        special_offer: itemShopOffer(s.banner),
        main_id: s.newDisplayAsset?.cosmeticId || s.newDisplayAsset?.id || null,
        name: s.bundle?.name.toUpperCase() || foundItem.name.toUpperCase(),
        description: foundItem.description,
        display_type: GetBrItemTypeDetails(foundItem.type)?.name || null,
        availability,
        color_config: colorConfig,
        images,
        price,
        series: GetBrItemSeriesDetails(foundItem.series ?? ''),
        section,
        supported_modes: supportedModes,
        granted: grantedItems,
      };
    })
    .filter((c) => c.display_type !== null);
};

const getShopCosmeticImages = (data: INewDisplayAsset | undefined): IShopImage[] => {
  if (data === undefined) return [];

  return data.renderImages
    .filter((da) => da.productTag)
    .map((da) => {
      const modeKey: { [mode: string]: string } = {
        ['br']: 'Battle Royale',
        ['juno']: 'Lego',
        ['delmar']: 'Rocket Racing',
        ['sparks']: 'Fortnite Festival',
      };
      const tag = da.productTag.toLowerCase().replace('product.', '');
      const mode = modeKey[tag];

      return {
        game_mode: mode,
        image_without_bg: da.image,
      };
    });
};

const getShopGrantedItems = (data: IShopEntry) => {
  const { tracks, brItems, cars, instruments } = data;
  const grantedItems: IGrantedFE[] = [];

  for (const track of tracks ?? []) {
    grantedItems.push({
      id: track.id,
      type: track.artist,
      name: track.title,
      description: null,
      series: null,
      rarity: null,
      image_without_bg: track.albumArt,
      lego_image_without_bg: null,
      fallguys_image_without_bg: null,
    });
  }

  for (const br of brItems ?? []) {
    grantedItems.push({
      id: br.id,
      type: br.type.displayValue,
      name: br.name,
      description: br.description,
      series: br.series?.value || null,
      rarity: {
        name: br.rarity.displayValue,
        color: '',
      },
      image_without_bg: br.images?.icon ?? null,
      lego_image_without_bg: br.images?.lego?.large ?? null,
      fallguys_image_without_bg: br.images?.bean?.large ?? null,
    });
  }

  for (const c of cars ?? []) {
    grantedItems.push({
      id: c.id,
      type: c.type.displayValue,
      name: c.name,
      description: c.description,
      series: c.series?.value || null,
      rarity: {
        name: c.rarity.displayValue,
        color: '',
      },
      image_without_bg: c.images?.large ?? null,
      lego_image_without_bg: null,
      fallguys_image_without_bg: null,
    });
  }

  for (const instrument of instruments ?? []) {
    grantedItems.push({
      id: instrument.id,
      type: instrument.type.displayValue,
      name: instrument.name,
      description: instrument.description,
      series: instrument.series?.value || null,
      rarity: {
        name: instrument.rarity.displayValue,
        color: '',
      },
      image_without_bg: instrument.images?.large ?? null,
      lego_image_without_bg: null,
      fallguys_image_without_bg: null,
    });
  }

  return grantedItems;
};

const itemShopOffer = (data?: IBanner, offerTag?: IOfferTag): string | null => {
  if (data === undefined || offerTag === undefined) return null;

  if (data.backendValue.toLowerCase().includes('new')) return 'new';
  if (data.backendValue.toLowerCase().includes('amountoff')) return 'discount';
  if (offerTag?.text.toLowerCase().includes('reactive')) return 'reactive';

  return null;
};

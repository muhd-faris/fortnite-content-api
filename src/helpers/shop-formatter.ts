import { IGrantedFE, IRootShop } from '../interfaces';
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

      const grantedItems: IGrantedFE[] = [];
      const foundItem = getShopGrantedItem(s);

      if (s.tracks) {
        for (const track of s.tracks) {
          grantedItems.push({
            id: track.id,
            type: track.artist,
            name: track.title,
            rarity: null,
            image_without_bg: track.albumArt,
            lego_image_without_bg: null,
            fallguys_image_without_bg: null,
          });
          break;
        }
      }

      if (s.brItems) {
        for (const br of s.brItems) {
          grantedItems.push({
            id: br.id,
            type: br.type.displayValue,
            name: br.name,
            rarity: {
              name: br.rarity.displayValue,
              color: '',
            },
            image_without_bg: br.images?.icon || null,
            lego_image_without_bg: br.images.lego?.large || null,
            fallguys_image_without_bg: br.images.bean?.large || null,
          });
          break;
        }
      }

      if (s.cars) {
        for (const c of s.cars) {
          grantedItems.push({
            id: c.id,
            type: c.type.displayValue,
            name: c.name,
            rarity: {
              name: c.rarity.displayValue,
              color: '',
            },
            image_without_bg: c.images?.large || null,
            lego_image_without_bg: null,
            fallguys_image_without_bg: null,
          });
          break;
        }
      }

      if (s.instruments) {
        for (const instrument of s.instruments) {
          grantedItems.push({
            id: instrument.id,
            type: instrument.type.displayValue,
            name: instrument.name,
            rarity: {
              name: instrument.rarity.displayValue,
              color: '',
            },
            image_without_bg: instrument.images?.large || null,
            lego_image_without_bg: null,
            fallguys_image_without_bg: null,
          });
          break;
        }
      }

      return {
        offer_id: s.offerId,
        main_image: images[0]?.image_without_bg || null,
        special_offer: itemShopOffer(s.banner),
        main_id: s.newDisplayAsset?.cosmeticId || s.newDisplayAsset?.id || null,
        name: s.bundle?.name.toUpperCase() || foundItem.name.toUpperCase(),
        description: foundItem.description,
        display_type: getCosmeticType(foundItem.type),
        availability,
        color_config: colorConfig,
        images,
        price,
        series: getSeriesDetails(foundItem.series ?? undefined),
        section,
        supported_modes: supportedModes,
        granted: grantedItems,
      };
    })
    .filter((c) => c.display_type !== 'Unknown Type');
};

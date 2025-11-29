import { EGShopBestSellerEndpoint, ItemShopEndpoint } from '../constants';
import { convertLocalToUtcTime, ItemShopFormatter } from '../helpers';
import { IRootBestSellerShop, IRootShop } from '../interfaces';
import { TCFContext } from '../types';

export const getTodayShopV1 = async (c: TCFContext) => {
  const shopResponse = await fetch(ItemShopEndpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const shopData = (await shopResponse.json()) as IRootShop;

  const shopDate: Date = convertLocalToUtcTime(new Date(shopData.data.date));
  const itemShopItems = ItemShopFormatter(shopData);
  const response = {
    shop_date: shopDate,
    items: itemShopItems,
  };

  return c.json(response);
};

export const getShopBestSellerV1 = async (c: TCFContext) => {
  const shopResponse = await fetch(ItemShopEndpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const shopData = (await shopResponse.json()) as IRootShop;

  const itemShopItems = ItemShopFormatter(shopData);

  const bestSellerResponse = await fetch(EGShopBestSellerEndpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const { bestsellers_list } = (await bestSellerResponse.json()) as IRootBestSellerShop;

  const bestSeller = itemShopItems.filter((item) =>
    bestsellers_list.offer_list.includes(item.offer_id)
  );

  return c.json(bestSeller);
};

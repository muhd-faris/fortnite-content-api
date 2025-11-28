import { EGShopBestSellerEndpoint } from '../constants';
import { IRootBestSellerShop } from '../interfaces';
import { TCFContext } from '../types';

export const getTodayShopV1 = async (c: TCFContext) => {
  return c.json({});
};

export const getShopBestSellerV1 = async (c: TCFContext) => {
  const bestSellerResponse = await fetch(EGShopBestSellerEndpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const { bestsellers_list } = (await bestSellerResponse.json()) as IRootBestSellerShop;

  return c.json({});
};

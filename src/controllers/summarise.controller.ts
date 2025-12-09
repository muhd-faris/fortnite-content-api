import { generateText } from 'ai';

import { getGeminiConfig } from '../lib';
import { TCFContext } from '../types';
import {
  ShopSummaryValidationSchema,
  TournamentDetailsSummaryValidationSchema,
} from '../validations';
import { ItemShopDetailsPrompt, TournamentDetailsPrompt } from '../constants';

export const summariseShopDetailsV1 = async (c: TCFContext) => {
  const body = ShopSummaryValidationSchema.parse(await c.req.json());
  const stringifyValue = JSON.stringify(replaceNulls(body));

  const google = getGeminiConfig().languageModel('gemini-2.5-flash');
  const { text } = await generateText({
    model: google,
    prompt: ItemShopDetailsPrompt(stringifyValue),
  });

  const response = {
    type: 'item_shop',
    value: text,
    stored_at: new Date(),
  };

  return c.json(response);
};

export const summariseTournamentDetailsV1 = async (c: TCFContext) => {
  const body = TournamentDetailsSummaryValidationSchema.parse(await c.req.json());
  const stringifyValue = JSON.stringify(body);

  const google = getGeminiConfig().languageModel('gemini-2.5-flash');
  const { text } = await generateText({
    model: google,
    prompt: TournamentDetailsPrompt(stringifyValue),
  });

  const response = {
    type: 'tournament_details',
    value: text,
    stored_at: new Date(),
  };

  return c.json(response);
};

export const summariseCosmeticDetailsV1 = (c: TCFContext) => {};

type ReplaceNullWith<T, R> = {
  [K in keyof T]: T[K] extends null ? R : T[K];
};
// TODO: Test Implementation
function replaceNulls<T extends object>(
  obj: T,
  replacement: string = 'Not Available'
): ReplaceNullWith<T, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === null ? replacement : v])
  ) as ReplaceNullWith<T, string>;
}

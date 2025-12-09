import { generateText } from 'ai';

import { getGeminiConfig } from '../lib';
import { TCFContext } from '../types';
import {
  CosmeticDetailSummaryValidationSchema,
  ShopDetailSummaryValidationSchema,
  TournamentDetailsSummaryValidationSchema,
} from '../validations';

export const summariseShopDetailsV1 = async (c: TCFContext) => {
  const body = ShopDetailSummaryValidationSchema.parse(await c.req.json());
  const stringifyValue = JSON.stringify(replaceNulls(body));

  const google = getGeminiConfig().languageModel('gemini-2.5-flash');
  const { text } = await generateText({
    model: google,
    system: `
      You are a strict data summarizer for a Fortnite application.
      Rules:
      1. Convert the provided JSON data into a single, continuous paragraph of plain text.
      2. Do NOT use Markdown, HTML, bullet points, or newlines.
      3. Do NOT add information not present in the data.
      4. Use a natural, engaging tone suitable for gamers.
    `,
    prompt: `Here is the data to summarize: ${stringifyValue}`,
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
  const stringifyValue = JSON.stringify(replaceNulls(body));

  const google = getGeminiConfig().languageModel('gemini-2.5-flash');
  const { text } = await generateText({
    model: google,
    system: `
      You are a strict data summarizer for a Fortnite application.
      Rules:
      1. Convert the provided JSON data into a single, continuous paragraph of plain text.
      2. Do NOT use Markdown, HTML, bullet points, or newlines.
      3. Do NOT add information not present in the data.
      4. Use a natural, engaging tone suitable for gamers.
    `,
    prompt: `Here is the data to summarize: ${stringifyValue}`,
  });

  const response = {
    type: 'tournament_details',
    value: text,
    stored_at: new Date(),
  };

  return c.json(response);
};

export const summariseCosmeticDetailsV1 = async (c: TCFContext) => {
  const body = CosmeticDetailSummaryValidationSchema.parse(await c.req.json());
  const stringifyValue = JSON.stringify(replaceNulls(body));

  const google = getGeminiConfig().languageModel('gemini-2.5-flash');
  const { text } = await generateText({
    model: google,
    system: `
      You are a strict data summarizer for a Fortnite game.
      Rules:
      1. Convert the provided JSON data into a single, continuous paragraph of plain text.
      2. Do NOT use Markdown, HTML, bullet points, or newlines.
      3. Do NOT add information not present in the data.
      4. Use a natural, engaging tone suitable for gamers.
    `,
    prompt: `Here is the data to summarize: ${stringifyValue}`,
  });

  const response = {
    type: 'cosmetic_details',
    value: text,
    stored_at: new Date(),
  };

  return c.json(response);
};

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
